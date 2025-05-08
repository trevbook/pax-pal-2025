const API_BASE_URL = "/api"; // In dev, Vite proxy handles this; in prod, it's same-origin

export async function fetchGameDetails(gameId) {
  if (!gameId) {
    throw new Error("Game ID is required");
  }

  const response = await fetch(`${API_BASE_URL}/games/${gameId}`);

  if (!response.ok) {
    // Handle different error statuses
    const errorData = await response.json().catch(() => ({})); // Try parsing error detail
    const errorMessage =
      errorData.detail ||
      `Error fetching game: ${response.status} ${response.statusText}`;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }

  return await response.json(); // Parse the JSON response body
}

// Add other API functions here as needed
export async function searchGames(query, semanticWeight, limit) {
  if (!query) {
    throw new Error("Search query is required");
  }

  const params = new URLSearchParams();
  params.append("q", query);
  if (semanticWeight !== undefined) {
    params.append("semantic_weight", semanticWeight);
  }
  if (limit !== undefined) {
    params.append("limit", limit);
  }

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      `Error searching games: ${response.status} ${response.statusText}`;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchAllGames() {
  const response = await fetch(`${API_BASE_URL}/games/all`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      `Error fetching all games: ${response.status} ${response.statusText}`;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchGamesByIds(ids) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    console.log(
      "fetchGamesByIds: No IDs provided or invalid format, returning empty array."
    );
    return []; // Return empty array if no IDs are provided
  }

  const response = await fetch(`${API_BASE_URL}/games/by-ids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: ids }), // Backend expects an object like { "ids": ["id1", "id2"] }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      `Error fetching games by IDs: ${response.status} ${response.statusText}`;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function fetchTotalGamesCount() {
  const response = await fetch(`${API_BASE_URL}/games/count`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      `Error fetching total games count: ${response.status} ${response.statusText}`;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.total_games; // Assuming the endpoint returns { "total_games": count }
}

export async function fetchRecommendations(
  baseGameIds,
  excludePlayedGames,
  limit
) {
  if (!baseGameIds || !Array.isArray(baseGameIds) || baseGameIds.length === 0) {
    console.log(
      "fetchRecommendations: No base game IDs provided, returning empty array."
    );
    return [];
  }

  // The backend expects a list of game IDs to base recommendations on.
  // And a separate query parameter for excluding specific game IDs (those already played).
  const params = new URLSearchParams();
  if (excludePlayedGames && excludePlayedGames.length > 0) {
    params.append("exclude_played_games", "true"); // The backend endpoint uses this query param name
  }

  // The list of baseGameIds for recommendations goes into the POST body.
  // The list of excludePlayedGameIds is implicitly handled by `exclude_played_games=true`
  // if the backend is set up to use the `played_games_payload` for exclusion when that flag is true.
  // Re-reading the backend: `exclude_played_games` is a boolean query param. The POST body `played_games_payload` is used as the base.
  // If `exclude_played_games` is true, the IDs from `played_games_payload` are also the ones excluded.
  // This means we should pass *all potentially relevant IDs* (e.g., favorited + played) as `baseGameIds`
  // and if `excludePlayedGames` (the boolean parameter to this JS function) is true,
  // the backend will filter out any of those `baseGameIds` that are also in the `played_games_payload` implicitly.

  // Let's adjust the API call to simplify based on the backend logic:
  // The backend `/api/recommendations/from-played` takes `played_games_payload` (which are the base IDs)
  // and an `exclude_played_games` (boolean) query param. If true, it excludes IDs from `played_games_payload` itself.

  // Add limit to params if provided
  if (limit !== undefined) {
    params.append("limit", limit.toString());
  }

  const response = await fetch(
    `${API_BASE_URL}/recommendations/from-played?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: baseGameIds }), // These are the games to base recommendations on
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      `Error fetching recommendations: ${response.status} ${response.statusText}`;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }

  // The backend returns a GameIdList: { ids: ["id1", "id2"] }
  const recommendedIdList = await response.json();
  // Apply limit on the client side as a safeguard, in case backend doesn't enforce it
  let ids = recommendedIdList.ids || [];
  if (limit !== undefined) {
    console.log(
      `Limiting recommendations to ${limit} items. Original count: ${ids.length}`
    );
    ids = ids.slice(0, limit);
  }
  return ids;
}
