"""
Main FastAPI application entry point.

Defines API routes and application configuration.
"""

# =====
# SETUP
# =====
# General imports
import json
import sqlite3

# Third-party imports
from fastapi import FastAPI, Depends, HTTPException, status

# Local imports (relative)
from models import Game, MediaItem, Link
from db import get_db


# ===============
# FastAPI APP
# ===============
app = FastAPI(
    title="Pax Pal API",
    description="API for searching and retrieving game information.",
    version="0.1.0",
    # You can add more metadata here, like contact info or license
)


# ==========
# API ROUTES
# ==========


@app.get(
    "/",
    tags=["Root"],
    summary="API Root / Health Check",
    description="Basic API information and health check endpoint.",
)
def read_root():
    """Returns a simple welcome message for the API root."""
    return {"message": "Welcome to the Pax Pal API!"}


@app.get(
    "/api/games/{game_id}",
    response_model=Game,
    tags=["Games"],
    summary="Get details for a specific game",
    description="Retrieves all available details for a game specified by its unique ID.",
    responses={
        404: {"description": "Game not found"},
        500: {"description": "Internal server error processing game data"},
    },
)
def get_game_details(game_id: str, db: sqlite3.Connection = Depends(get_db)) -> Game:
    """
    Retrieves detailed information for a specific game using its ID.

    - **game_id**: The unique identifier (string) of the game to retrieve.
    - **db**: Database connection dependency injected by FastAPI.

    Raises HTTPException 404 if the game is not found, or 500 if there's an error
    processing the data retrieved from the database (e.g., JSON parsing error,
    Pydantic validation error).
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            """
            SELECT
                id, name, snappy_summary, description_texts, platforms,
                developer, exhibitor, booth_number, header_image_url, steam_link,
                genres_and_tags, media, released, release_time, links
            FROM games
            WHERE id = ?
            """,
            (game_id,),
        )
        row = cursor.fetchone()  # Fetchone returns a dict due to row_factory
    except sqlite3.Error as e:
        # Handle potential database errors during query execution
        print(f"Database query error for game {game_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error when retrieving game {game_id}.",
        )

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game with id '{game_id}' not found",
        )

    # Deserialize JSON fields and construct the Game object
    try:
        # Handle description_texts -> description mapping
        # Parse description_texts which contains objects with source and text fields
        description_texts_json = row.get("description_texts", "[]")
        description_texts = json.loads(description_texts_json or "[]")

        # Select description based on priority: ai_search_summary > pax_website > pax_app
        description = ""
        if isinstance(description_texts, list):
            # First try to find ai_search_summary
            for item in description_texts:
                if (
                    isinstance(item, dict)
                    and item.get("source") == "ai_search_summary"
                    and item.get("text")
                ):
                    description = item["text"]
                    break

            # If not found, try pax_website
            if not description:
                for item in description_texts:
                    if (
                        isinstance(item, dict)
                        and item.get("source") == "pax_website"
                        and item.get("text")
                    ):
                        description = item["text"]
                        break

            # If still not found, try pax_app
            if not description:
                for item in description_texts:
                    if (
                        isinstance(item, dict)
                        and item.get("source") == "pax_app"
                        and item.get("text")
                    ):
                        description = item["text"]
                        break
        else:
            # Fallback if not a list
            description = str(description_texts or "")

        # Helper to load JSON or return empty list/default
        def _load_json(field_name: str, default_value="[]") -> list:
            json_str = row.get(field_name, default_value)
            return json.loads(json_str or default_value)

        platforms = _load_json("platforms")
        genres_and_tags = _load_json("genres_and_tags")
        media_list = _load_json("media")
        links_list = _load_json("links")

        # Validate nested structures using Pydantic models
        media = [MediaItem(**item) for item in media_list]
        links = [Link(**item) for item in links_list]

        # Prepare data for the Game model
        game_data = {
            "id": row["id"],
            "name": row["name"],
            "snappy_summary": row.get("snappy_summary"),
            "description": description,  # Use the processed description
            "platforms": platforms if platforms else [],
            "developer": row.get("developer"),
            "exhibitor": row.get("exhibitor"),
            "booth_number": row.get("booth_number"),
            "header_image_url": row.get("header_image_url"),
            "steam_link": row.get("steam_link"),
            "genres_and_tags": genres_and_tags,
            "media": media,
            "released": bool(
                row.get("released", 0.0)
            ),  # Safely convert DB REAL/INT to bool
            "release_time": row.get("release_time"),
            "links": links,
        }

        # Validate the final structure with the Game model
        game_obj = Game(**game_data)
        return game_obj

    except json.JSONDecodeError as e:
        print(f"JSON decode error for game {game_id}: {e} - Data: {row}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing JSON data for game {game_id}.",
        )
    except Exception as e:  # Catch other errors like Pydantic validation
        print(
            f"Error processing or validating data for game {game_id}: {e} - Data: {row}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing data for game {game_id}.",
        )
