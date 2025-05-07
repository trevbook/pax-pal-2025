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
      errorData.detail || `Error fetching game: ${response.status} ${response.statusText}`;
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