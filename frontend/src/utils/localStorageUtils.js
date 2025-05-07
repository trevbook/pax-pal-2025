// frontend/src/utils/localStorageUtils.js
import { fetchGameDetails } from "../api";

// --- Helper functions to manage the main game data store ---
const getLocalGames = () => {
  console.log("[LS_TRACE] getLocalGames: Attempting to retrieve 'localGames'.");
  const games = localStorage.getItem("localGames");
  const parsedGames = games ? JSON.parse(games) : {};
  console.log(
    "[LS_TRACE] getLocalGames: Retrieved and parsed 'localGames'.",
    parsedGames
  );
  return parsedGames; // Stores game objects keyed by ID
};

const saveLocalGames = (games) => {
  console.log(
    "[LS_TRACE] saveLocalGames: Attempting to save 'localGames'.",
    games
  );
  localStorage.setItem("localGames", JSON.stringify(games));
  console.log("[LS_TRACE] saveLocalGames: Successfully saved 'localGames'.");
};

// --- Helper functions for Favorite Game IDs ---
export const getFavoriteGameIds = () => {
  console.log(
    "[LS_TRACE] getFavoriteGameIds: Attempting to retrieve 'favoriteGameIds'."
  );
  const ids = localStorage.getItem("favoriteGameIds");
  const parsedIds = ids ? JSON.parse(ids) : [];
  console.log(
    "[LS_TRACE] getFavoriteGameIds: Retrieved and parsed 'favoriteGameIds'.",
    parsedIds
  );
  return parsedIds; // Stores an array of game IDs
};

const saveFavoriteGameIds = (ids) => {
  console.log(
    "[LS_TRACE] saveFavoriteGameIds: Attempting to save 'favoriteGameIds'.",
    ids
  );
  localStorage.setItem("favoriteGameIds", JSON.stringify(ids));
  console.log(
    "[LS_TRACE] saveFavoriteGameIds: Successfully saved 'favoriteGameIds'."
  );
};

// --- Helper functions for Played Game IDs ---
export const getPlayedGameIds = () => {
  console.log(
    "[LS_TRACE] getPlayedGameIds: Attempting to retrieve 'playedGameIds'."
  );
  const ids = localStorage.getItem("playedGameIds");
  const parsedIds = ids ? JSON.parse(ids) : [];
  console.log(
    "[LS_TRACE] getPlayedGameIds: Retrieved and parsed 'playedGameIds'.",
    parsedIds
  );
  return parsedIds; // Stores an array of game IDs
};

const savePlayedGameIds = (ids) => {
  console.log(
    "[LS_TRACE] savePlayedGameIds: Attempting to save 'playedGameIds'.",
    ids
  );
  localStorage.setItem("playedGameIds", JSON.stringify(ids));
  console.log(
    "[LS_TRACE] savePlayedGameIds: Successfully saved 'playedGameIds'."
  );
};

// --- Public API for Game Interactions ---

// Get all games that are either favorited or played
export const getCombinedDisplayedGames = () => {
  console.log("[LS_TRACE] getCombinedDisplayedGames: Called.");
  const localGames = getLocalGames();
  const favoriteIds = getFavoriteGameIds();
  const playedIds = getPlayedGameIds();

  const allRelevantIds = new Set([...favoriteIds, ...playedIds]);
  console.log(
    "[LS_TRACE] getCombinedDisplayedGames: All relevant IDs.",
    Array.from(allRelevantIds)
  );

  const result = Array.from(allRelevantIds)
    .map((id) => localGames[id])
    .filter((game) => game); // Filter out any undefined if IDs somehow mismatch
  console.log("[LS_TRACE] getCombinedDisplayedGames: Resulting games.", result);
  return result;
};

// Get only favorited games (still useful for contexts where only favorites are needed)
export const getFavoriteGames = () => {
  console.log("[LS_TRACE] getFavoriteGames: Called.");
  const localGames = getLocalGames();
  const favoriteIds = getFavoriteGameIds();
  const result = favoriteIds.map((id) => localGames[id]).filter((game) => game);
  console.log("[LS_TRACE] getFavoriteGames: Resulting favorite games.", result);
  return result;
};

// Add a game to favorites
export const addGameToFavorites = (game) => {
  console.log("[LS_TRACE] addGameToFavorites: Called with game:", game);
  if (!game || !game.id) {
    console.warn(
      "[LS_TRACE] addGameToFavorites: Invalid game object or game ID. Aborting.",
      game
    );
    return;
  }

  console.log(
    "[LS_TRACE] addGameToFavorites: Current localStorage state before add:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );

  const localGames = getLocalGames();
  let favoriteIds = getFavoriteGameIds();

  if (!localGames[game.id]) {
    console.log(
      `[LS_TRACE] addGameToFavorites: Game ID ${game.id} not in localGames. Adding.`
    );
    localGames[game.id] = game;
    saveLocalGames(localGames);
  }

  if (!favoriteIds.includes(game.id)) {
    console.log(
      `[LS_TRACE] addGameToFavorites: Game ID ${game.id} not in favoriteIds. Adding.`
    );
    favoriteIds.push(game.id);
    saveFavoriteGameIds(favoriteIds);
  }
  console.log(
    "[LS_TRACE] addGameToFavorites: Finished. Current localStorage state after add:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );
};

// Remove a game from favorites
export const removeGameFromFavorites = (gameId) => {
  console.log(
    "[LS_TRACE] removeGameFromFavorites: Called with gameId:",
    gameId
  );
  if (!gameId) {
    console.warn(
      "[LS_TRACE] removeGameFromFavorites: Invalid gameId. Aborting.",
      gameId
    );
    return;
  }

  console.log(
    "[LS_TRACE] removeGameFromFavorites: Current localStorage state before remove:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );

  let localGames = getLocalGames();
  let favoriteIds = getFavoriteGameIds();
  const playedIds = getPlayedGameIds();

  const initialFavoriteIdsLength = favoriteIds.length;
  favoriteIds = favoriteIds.filter((id) => id !== gameId);
  if (favoriteIds.length !== initialFavoriteIdsLength) {
    console.log(
      `[LS_TRACE] removeGameFromFavorites: Game ID ${gameId} removed from favoriteIds.`
    );
    saveFavoriteGameIds(favoriteIds);
  }

  // If the game is no longer favorited AND no longer played, remove from localGames
  if (!favoriteIds.includes(gameId) && !playedIds.includes(gameId)) {
    if (localGames[gameId]) {
      console.log(
        `[LS_TRACE] removeGameFromFavorites: Game ID ${gameId} is not in updated favoriteIds and not in playedIds. Removing from localGames.`
      );
      delete localGames[gameId];
      saveLocalGames(localGames);
    }
  }
  console.log(
    "[LS_TRACE] removeGameFromFavorites: Finished. Current localStorage state after remove:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );
  // No explicit return needed, or return updated favoriteIds if useful elsewhere
};

// Get played games status (returns an object like { gameId: true })
// This can still be useful for quick checks, alongside getPlayedGameIds
export const getPlayedGamesStatus = () => {
  console.log("[LS_TRACE] getPlayedGamesStatus: Called.");
  const playedIds = getPlayedGameIds();
  const status = {};
  playedIds.forEach((id) => {
    status[id] = true;
  });
  console.log(
    "[LS_TRACE] getPlayedGamesStatus: Resulting status object.",
    status
  );
  return status;
};

// Update played status for a game
// The 'game' object is crucial here if we're marking a game as played
// and it might not be in localGames yet (e.g., from a different page).
export const updatePlayedGameStatus = (gameId, isPlayed, game = null) => {
  console.log(
    `[LS_TRACE] updatePlayedGameStatus: Called with gameId: ${gameId}, isPlayed: ${isPlayed}, game:`,
    game
  );
  if (!gameId) {
    console.warn(
      "[LS_TRACE] updatePlayedGameStatus: Invalid gameId. Aborting.",
      gameId
    );
    return;
  }

  console.log(
    "[LS_TRACE] updatePlayedGameStatus: Current localStorage state before update:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );

  let localGames = getLocalGames();
  let playedIds = getPlayedGameIds();
  const favoriteIds = getFavoriteGameIds();

  if (isPlayed) {
    if (game && game.id === gameId && !localGames[gameId]) {
      console.log(
        `[LS_TRACE] updatePlayedGameStatus: Game ID ${gameId} not in localGames (and game object provided). Adding to localGames.`
      );
      localGames[gameId] = game; // Add to localGames if it's new
      saveLocalGames(localGames);
    } else if (!localGames[gameId]) {
      // If game not in localGames and no game object provided, fetch it from API
      console.log(
        `[LS_TRACE] updatePlayedGameStatus: Game ID ${gameId} not in localGames. Fetching from API.`
      );
      try {
        // Import would normally go at the top, but we're working within a selection

        fetchGameDetails(gameId)
          .then((gameData) => {
            // Once we have the game data, retry the operation with the game object
            updatePlayedGameStatus(gameId, isPlayed, gameData);
          })
          .catch((error) => {
            console.error(
              `[LS_TRACE] updatePlayedGameStatus: Failed to fetch game ${gameId} from API:`,
              error
            );
            return;
          });
        return; // Return early as we'll retry after the async fetch
      } catch (error) {
        console.error(
          `[LS_TRACE] updatePlayedGameStatus: Error fetching game ${gameId}:`,
          error
        );
        return;
      }
    }
    if (!playedIds.includes(gameId)) {
      console.log(
        `[LS_TRACE] updatePlayedGameStatus: Game ID ${gameId} not in playedIds. Adding.`
      );
      playedIds.push(gameId);
      savePlayedGameIds(playedIds); // Save playedIds immediately after modification
    }
  } else {
    const initialPlayedIdsLength = playedIds.length;
    playedIds = playedIds.filter((id) => id !== gameId);
    if (playedIds.length !== initialPlayedIdsLength) {
      console.log(
        `[LS_TRACE] updatePlayedGameStatus: Game ID ${gameId} removed from playedIds.`
      );
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
      console.log(
        `[LS_TRACE] updatePlayedGameStatus: Game ID ${gameId} is not in favoriteIds and no longer in playedIds. Removing from localGames.`
      );
      delete localGames[gameId];
      saveLocalGames(localGames);
    }
  }
  console.log(
    "[LS_TRACE] updatePlayedGameStatus: Finished. Current localStorage state after update:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );
  // No explicit return needed, or return updated playedIds if useful elsewhere
};

// Clear all game data
export const clearAllGameData = () => {
  console.log("[LS_TRACE] clearAllGameData: Called.");
  console.log(
    "[LS_TRACE] clearAllGameData: Current localStorage state before clear:",
    {
      localGames: JSON.parse(localStorage.getItem("localGames") || "{}"),
      favoriteGameIds: JSON.parse(
        localStorage.getItem("favoriteGameIds") || "[]"
      ),
      playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"),
    }
  );
  localStorage.removeItem("localGames");
  localStorage.removeItem("favoriteGameIds");
  localStorage.removeItem("playedGameIds");
  console.log(
    "[LS_TRACE] clearAllGameData: Finished. localStorage should now be empty for these keys."
  );
  console.log("[LS_TRACE] clearAllGameData: Verifying after clear:", {
    localGames: JSON.parse(localStorage.getItem("localGames") || "{}"), // Should be {}
    favoriteGameIds: JSON.parse(
      localStorage.getItem("favoriteGameIds") || "[]"
    ), // Should be []
    playedGameIds: JSON.parse(localStorage.getItem("playedGameIds") || "[]"), // Should be []
  });
};
