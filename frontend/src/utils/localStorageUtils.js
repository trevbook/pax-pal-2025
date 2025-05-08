// frontend/src/utils/localStorageUtils.js
import { fetchGameDetails } from "../api";

// --- Helper functions to manage the main game data store ---
const getLocalGames = () => {
  const games = localStorage.getItem("localGames");
  const parsedGames = games ? JSON.parse(games) : {};
  return parsedGames; // Stores game objects keyed by ID
};

const saveLocalGames = (games) => {
  localStorage.setItem("localGames", JSON.stringify(games));
};

// --- Helper functions for Favorite Game IDs ---
export const getFavoriteGameIds = () => {
  const ids = localStorage.getItem("favoriteGameIds");
  const parsedIds = ids ? JSON.parse(ids) : [];
  return parsedIds; // Stores an array of game IDs
};

const saveFavoriteGameIds = (ids) => {
  localStorage.setItem("favoriteGameIds", JSON.stringify(ids));
};

// --- Helper functions for Played Game IDs ---
export const getPlayedGameIds = () => {
  const ids = localStorage.getItem("playedGameIds");
  const parsedIds = ids ? JSON.parse(ids) : [];
  return parsedIds; // Stores an array of game IDs
};

const savePlayedGameIds = (ids) => {
  localStorage.setItem("playedGameIds", JSON.stringify(ids));
};

// --- Public API for Game Interactions ---

// Get all games that are either favorited or played
export const getCombinedDisplayedGames = () => {
  const localGames = getLocalGames();
  const favoriteIds = getFavoriteGameIds();
  const playedIds = getPlayedGameIds();

  const allRelevantIds = new Set([...favoriteIds, ...playedIds]);

  const result = Array.from(allRelevantIds)
    .map((id) => localGames[id])
    .filter((game) => game); // Filter out any undefined if IDs somehow mismatch
  return result;
};

// Get only favorited games (still useful for contexts where only favorites are needed)
export const getFavoriteGames = () => {
  const localGames = getLocalGames();
  const favoriteIds = getFavoriteGameIds();
  const result = favoriteIds.map((id) => localGames[id]).filter((game) => game);
  return result;
};

// Add a game to favorites
export const addGameToFavorites = (game) => {
  if (!game || !game.id) {
    return;
  }

  const localGames = getLocalGames();
  let favoriteIds = getFavoriteGameIds();

  if (!localGames[game.id]) {
    localGames[game.id] = game;
    saveLocalGames(localGames);
  }

  if (!favoriteIds.includes(game.id)) {
    favoriteIds.push(game.id);
    saveFavoriteGameIds(favoriteIds);
  }
};

// Remove a game from favorites
export const removeGameFromFavorites = (gameId) => {
  if (!gameId) {
    return;
  }

  let localGames = getLocalGames();
  let favoriteIds = getFavoriteGameIds();
  const playedIds = getPlayedGameIds();

  const initialFavoriteIdsLength = favoriteIds.length;
  favoriteIds = favoriteIds.filter((id) => id !== gameId);
  if (favoriteIds.length !== initialFavoriteIdsLength) {
    saveFavoriteGameIds(favoriteIds);
  }

  // If the game is no longer favorited AND no longer played, remove from localGames
  if (!favoriteIds.includes(gameId) && !playedIds.includes(gameId)) {
    if (localGames[gameId]) {
      delete localGames[gameId];
      saveLocalGames(localGames);
    }
  }
  // No explicit return needed, or return updated favoriteIds if useful elsewhere
};

// Get played games status (returns an object like { gameId: true })
// This can still be useful for quick checks, alongside getPlayedGameIds
export const getPlayedGamesStatus = () => {
  const playedIds = getPlayedGameIds();
  const status = {};
  playedIds.forEach((id) => {
    status[id] = true;
  });
  return status;
};

// Update played status for a game
// The 'game' object is crucial here if we're marking a game as played
// and it might not be in localGames yet (e.g., from a different page).
export const updatePlayedGameStatus = (gameId, isPlayed, game = null) => {
  if (!gameId) {
    return;
  }

  let localGames = getLocalGames();
  let playedIds = getPlayedGameIds();
  const favoriteIds = getFavoriteGameIds();

  if (isPlayed) {
    if (game && game.id === gameId && !localGames[gameId]) {
      localGames[gameId] = game; // Add to localGames if it's new
      saveLocalGames(localGames);
    } else if (!localGames[gameId]) {
      // If game not in localGames and no game object provided, fetch it from API
      try {
        fetchGameDetails(gameId)
          .then((gameData) => {
            // Once we have the game data, retry the operation with the game object
            updatePlayedGameStatus(gameId, isPlayed, gameData);
          })
          .catch((error) => {
            return;
          });
        return; // Return early as we'll retry after the async fetch
      } catch (error) {
        return;
      }
    }
    if (!playedIds.includes(gameId)) {
      playedIds.push(gameId);
      savePlayedGameIds(playedIds); // Save playedIds immediately after modification
    }
  } else {
    const initialPlayedIdsLength = playedIds.length;
    playedIds = playedIds.filter((id) => id !== gameId);
    if (playedIds.length !== initialPlayedIdsLength) {
      savePlayedGameIds(playedIds); // Save playedIds immediately after modification
    }
  }
  // savePlayedGameIds(playedIds); // This was potentially redundant or misplaced if already saved above.

  // If the game is no longer played AND no longer favorited, remove from localGames
  if (
    !isPlayed &&
    !favoriteIds.includes(gameId) &&
    !playedIds.includes(gameId)
  ) {
    if (localGames[gameId]) {
      delete localGames[gameId];
      saveLocalGames(localGames);
    }
  }
  // No explicit return needed, or return updated playedIds if useful elsewhere
};

// Clear all game data
export const clearAllGameData = () => {
  localStorage.removeItem("localGames");
  localStorage.removeItem("favoriteGameIds");
  localStorage.removeItem("playedGameIds");
};
