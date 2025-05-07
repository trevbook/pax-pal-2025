"""
Utility functions for performing search operations.
"""

import sqlite3
import json
from typing import List, Tuple, Dict, Optional

# Import the real embedding function from backend.utils.openai
from utils.openai import generate_embeddings_for_texts


def get_embedding_for_query(text: str) -> List[float]:
    """
    Generates an embedding for a given text query using the actual embedding model.

    Args:
        text: The input text query.

    Returns:
        A list of floats representing the embedding.
    """
    # Use the real embedding function for a single query
    # generate_embeddings_for_texts returns a np.ndarray, typically shape (1, embedding_dim) for a single text
    embedding_array = generate_embeddings_for_texts([text])

    # Check if the array is valid and contains data
    if embedding_array is None or embedding_array.shape[0] == 0:
        raise RuntimeError(
            "Failed to generate embedding for query: No embeddings returned."
        )

    # Extract the first (and only) embedding vector and convert it to a Python list of floats
    # embedding_array[0] gives the 1D array for the first text
    first_embedding_list: List[float] = embedding_array[0].tolist()

    # Optional: A more rigorous check that it's indeed a list of floats,
    # though .tolist() on a numeric numpy array should produce this.
    if not isinstance(first_embedding_list, list) or not all(
        isinstance(item, float) for item in first_embedding_list
    ):
        raise RuntimeError(
            "Failed to generate embedding for query: Embedding format is incorrect after conversion."
        )

    return first_embedding_list


def hybrid_search(
    db: sqlite3.Connection,
    query_text: str,
    semantic_weight: float = 0.7,
    limit: int = 5,
    k_semantic: int = 20,  # Number of results to fetch from semantic search
    k_fts: int = 20,  # Number of results to fetch from FTS
) -> List[str]:
    """
    Performs a hybrid search combining semantic and full-text search results.

    Args:
        db: SQLite database connection.
        query_text: The user's search query.
        semantic_weight: The weight for semantic search results (0.0 to 1.0).
                         Full-text search weight will be (1 - semantic_weight).
        limit: The final number of results to return.
        k_semantic: Number of candidates to retrieve from semantic search.
        k_fts: Number of candidates to retrieve from full-text search.

    Returns:
        A list of game IDs, ordered by relevance.
    """
    cursor = db.cursor()
    query_embedding = get_embedding_for_query(query_text)

    # For sqlite-vec, the MATCH operator expects a JSON string representation of the vector.
    # We will now also include k={k_semantic} in the match string.
    vector_as_json_string = json.dumps(query_embedding)
    match_query_argument = f"{vector_as_json_string} and k= {k_semantic} "

    # 1. Semantic Search (using sqlite-vec's vec0 MATCH operator, using raw bytes for embedding)
    import struct

    def serialize_f32(vector: List[float]) -> bytes:
        """Serializes a list of floats into a compact 'raw bytes' format for sqlite-vec."""
        return struct.pack(f"{len(vector)}f", *vector)

    semantic_results: Dict[str, float] = {}
    try:
        # Use parameterized query with raw bytes for the embedding vector
        semantic_query = f"""
            SELECT game_id, distance
            FROM game_embs
            WHERE vector MATCH ?
                AND k = ?
            ORDER BY distance
        """
        # Use the serialize_f32 function to convert the embedding to bytes
        cursor.execute(
            semantic_query,
            (serialize_f32(query_embedding), k_semantic),
        )
        raw_semantic_scores = {
            row["game_id"]: float(row["distance"]) for row in cursor.fetchall()
        }

        # Normalize: convert distance to similarity and scale to 0-1
        if raw_semantic_scores:
            min_dist = min(raw_semantic_scores.values())
            max_dist = max(raw_semantic_scores.values())
            if max_dist == min_dist:  # Avoid division by zero if all distances are same
                for game_id, dist in raw_semantic_scores.items():
                    semantic_results[game_id] = 0.5 if dist == min_dist else 0.0
            else:
                for game_id, dist in raw_semantic_scores.items():
                    # Normalize so higher score is better
                    semantic_results[game_id] = (max_dist - dist) / (max_dist - min_dist)

    except sqlite3.Error as e:
        print(f"Error during semantic search: {e}")

    # 2. Full-Text Search (FTS5)
    # FTS5 'rank' is a score where lower values are generally more relevant for SQLite's default ranking.
    # We need to convert it so higher is better for combining.
    fts_results: Dict[str, float] = {}
    try:
        # FTS5 returns 'rank' which are BM25 scores. Usually, higher is better.
        # However, if `ORDER BY rank` means lower is better (e.g. if it's a negative score or specific rank function)
        # The schema notebook `ORDER BY rank` when selecting from the fts table, typically this means lower is better.
        # Let's confirm: SQLite FTS5 default rank is higher is better. If user ordered by it, it means default.
        # If their FTS table stores "rank" explicitly and they order by it, need to know how it's calculated.
        # Given `SELECT id, rank FROM games_fts WHERE text MATCH :query ORDER BY rank`,
        # it's safer to assume 'rank' is something where lower is better.
        # If so, normalize (max_rank - rank) / (max_rank - min_rank).

        # The schema setup uses `CREATE VIRTUAL TABLE games_fts USING fts5(id UNINDEXED, text);`
        # And populates it. Then it queries `SELECT id, rank FROM games_fts WHERE text MATCH ? ORDER BY rank`.
        # The `rank` here is an implicit column from FTS5. Lower values of rank are better (more relevant).
        cursor.execute(
            """
            SELECT id, rank
            FROM games_fts
            WHERE text MATCH ? ORDER BY rank LIMIT ?;
            """,
            (query_text, k_fts),
        )
        raw_fts_scores = {row["id"]: float(row["rank"]) for row in cursor.fetchall()}

        if raw_fts_scores:
            min_rank = min(raw_fts_scores.values())
            max_rank = max(raw_fts_scores.values())
            if max_rank == min_rank:
                for game_id, rank_val in raw_fts_scores.items():
                    fts_results[game_id] = 0.5  # or 1.0
            else:
                for game_id, rank_val in raw_fts_scores.items():
                    # Normalize so higher score is better
                    fts_results[game_id] = (max_rank - rank_val) / (max_rank - min_rank)

    except sqlite3.Error as e:
        print(f"Error during FTS search: {e}")

    # 3. Combine and Rank
    combined_scores: Dict[str, float] = {}
    all_game_ids = set(semantic_results.keys()) | set(fts_results.keys())

    lexical_weight = 1.0 - semantic_weight

    for game_id in all_game_ids:
        s_score = semantic_results.get(game_id, 0.0)
        f_score = fts_results.get(game_id, 0.0)

        # If a game is only in one result set, we might want to penalize it slightly
        # or ensure the weights still make sense.
        # For now, a simple weighted sum.
        combined_scores[game_id] = (semantic_weight * s_score) + (
            lexical_weight * f_score
        )

    # Sort by combined score in descending order
    sorted_game_ids = sorted(
        combined_scores.keys(), key=lambda gid: combined_scores[gid], reverse=True
    )

    return sorted_game_ids[:limit]
