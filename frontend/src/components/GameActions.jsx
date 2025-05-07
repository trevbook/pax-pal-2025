import React, { useState, useEffect } from "react";
import { Stack, ActionIcon, Checkbox, Tooltip } from "@mantine/core";
import {
  IconTrash,
  IconBookmarkPlus,
  IconBookmarkFilled,
  IconDeviceGamepad,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

// localStorage helper functions (ideally from a utils file)
const getMyGamesFromStorage = () => {
  const games = localStorage.getItem("myGames");
  return games ? JSON.parse(games) : [];
};

const addGameToMyGamesInStorage = (game) => {
  if (!game || !game.id) return;
  const games = getMyGamesFromStorage();
  if (!games.find((g) => g.id === game.id)) {
    games.push(game);
    localStorage.setItem("myGames", JSON.stringify(games));
  }
};

const removeGameFromMyGamesInStorage = (gameId) => {
  if (!gameId) return;
  let games = getMyGamesFromStorage();
  games = games.filter((g) => g.id !== gameId);
  localStorage.setItem("myGames", JSON.stringify(games));
};

const getPlayedGamesStatusFromStorage = () => {
  const statuses = localStorage.getItem("playedGames");
  return statuses ? JSON.parse(statuses) : {};
};

const updatePlayedGameStatusInStorage = (gameId, isPlayed) => {
  const statuses = getPlayedGamesStatusFromStorage();
  if (isPlayed) {
    statuses[gameId] = true;
  } else {
    delete statuses[gameId];
  }
  localStorage.setItem("playedGames", JSON.stringify(statuses));
  return statuses;
};
// End localStorage helper functions

function GameActions({
  game,
  initialIsPlayed,
  initialIsInMyGames,
  onOpenRemoveModal,
}) {
  const [isPlayed, setIsPlayed] = useState(initialIsPlayed);
  const [isInMyGames, setIsInMyGames] = useState(initialIsInMyGames);

  useEffect(() => {
    setIsPlayed(initialIsPlayed);
  }, [initialIsPlayed]);

  useEffect(() => {
    setIsInMyGames(initialIsInMyGames);
  }, [initialIsInMyGames]);

  if (!game || !game.id) {
    return null;
  }

  const handleStackClick = (event) => {
    // event.stopPropagation();
  };

  const handleTogglePlayed = () => {
    const newIsPlayed = !isPlayed;
    updatePlayedGameStatusInStorage(game.id, newIsPlayed);
    setIsPlayed(newIsPlayed);
    if (newIsPlayed) {
      notifications.show({
        title: "Game Status Updated",
        message: `"${game.name}" marked as played! ✅`,
        color: "green",
      });
    } else {
      notifications.show({
        title: "Game Status Updated",
        message: `"${game.name}" removed from your played games.`,
        color: "blue",
      });
    }
  };

  const handleToggleMyGames = () => {
    const newIsInMyGames = !isInMyGames;
    if (newIsInMyGames) {
      addGameToMyGamesInStorage(game);
      notifications.show({
        title: "Game Added",
        message: `${game.name} has been added to My Games! 🎉`,
        color: "green",
      });
    } else {
      removeGameFromMyGamesInStorage(game.id);
      notifications.show({
        title: "Game Removed",
        message: `${game.name} has been removed from My Games. 👋`,
        color: "red",
      });
    }
    setIsInMyGames(newIsInMyGames);
  };

  // Unified GameActions UI (no pageType distinction)
  return (
    <Stack gap="xs" align="center" onClickCapture={handleStackClick}>
      {/* My Games Add/Remove Button */}
      <Tooltip
        label={isInMyGames ? "Remove from My Games" : "Add to My Games"}
        withArrow
        position="top"
      >
        <ActionIcon
          onClick={
            isInMyGames && typeof onOpenRemoveModal === "function"
              ? () => onOpenRemoveModal(game.id)
              : handleToggleMyGames
          }
          variant={isInMyGames ? "filled" : "outline"}
          color={isInMyGames ? "red" : "blue"}
          size="lg"
        >
          {isInMyGames ? (
            <IconBookmarkFilled size={20} />
          ) : (
            <IconBookmarkPlus size={20} />
          )}
        </ActionIcon>
      </Tooltip>

      {/* Played/Unplayed Toggle Button */}
      <Tooltip
        label={isPlayed ? "Mark as Unplayed" : "Mark as Played"}
        withArrow
        position="top"
      >
        <ActionIcon
          onClick={handleTogglePlayed}
          variant={isPlayed ? "filled" : "outline"}
          color="blue"
          size="lg"
          aria-label={isPlayed ? "Mark as Unplayed" : "Mark as Played"}
        >
          <IconDeviceGamepad size={20} />
        </ActionIcon>
      </Tooltip>
    </Stack>
  );
}

export default GameActions;
