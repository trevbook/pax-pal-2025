import React, { useState, useEffect } from "react";
import {
  Stack,
  ActionIcon,
  Checkbox,
  Tooltip,
  Modal,
  Button,
  Group,
  Text,
} from "@mantine/core";
import {
  IconHeartPlus,
  IconHeartFilled,
  IconDeviceGamepad,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  getFavoriteGames,
  addGameToFavorites,
  removeGameFromFavorites,
  getPlayedGamesStatus,
  updatePlayedGameStatus,
} from "../utils/localStorageUtils";

function GameActions({
  game,
  initialIsPlayed,
  initialIsFavorited,
  onGameRemoved,
  onGameUnfavorited,
  onGameUnplayed,
  onGamePlayed, // Add this prop for completeness, as used in MyGamesPage
  onGameFavorited, // New handler for when a game is favorited
}) {
  const [isPlayed, setIsPlayed] = useState(initialIsPlayed);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [removeFavoriteModalOpened, setRemoveFavoriteModalOpened] = useState(false);
  const [unplayConfirmModalOpened, setUnplayConfirmModalOpened] = useState(false);

  useEffect(() => {
    setIsPlayed(initialIsPlayed);
  }, [initialIsPlayed]);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  if (!game || !game.id) {
    return null;
  }

  // Prevent click events from bubbling up to parent elements (e.g., card navigation)
  const handleStackClick = (event) => {
    // event.stopPropagation();
  };

  const openUnplayConfirmModal = () => {
    setUnplayConfirmModalOpened(true);
  };

  const confirmUnplayGame = () => {
    updatePlayedGameStatus(game.id, false);
    setIsPlayed(false);
    setUnplayConfirmModalOpened(false);
    notifications.show({
      title: "Game Status Updated",
      message: `"${game.name}" marked as unplayed.`,
      color: "blue",
    });
    if (typeof onGameUnplayed === "function") {
      onGameUnplayed(game.id);
    }
  };

  const handleTogglePlayed = () => {
    if (isPlayed) {
      openUnplayConfirmModal();
    } else {
      updatePlayedGameStatus(game.id, true);
      setIsPlayed(true);
      notifications.show({
        title: "Game Status Updated",
        message: `"${game.name}" marked as played! ✅`,
        color: "green",
      });
      if (typeof onGamePlayed === "function") {
        onGamePlayed(game.id);
      }
    }
  };

  const handleAddFavorite = () => {
    addGameToFavorites(game);
    setIsFavorited(true);
    notifications.show({
      title: "Game Favorited",
      message: `${game.name} has been added to Favorites! ❤️`,
      color: "pink",
    });
    if (typeof onGameFavorited === "function") {
      onGameFavorited(game.id);
    }
  };

  const openRemoveFavoriteConfirmModal = () => {
    setRemoveFavoriteModalOpened(true);
  };

  const confirmRemoveFavorite = () => {
    removeGameFromFavorites(game.id);
    setIsFavorited(false);
    setRemoveFavoriteModalOpened(false);
    notifications.show({
      title: "Game Unfavorited",
      message: `${game.name} has been removed from Favorites. 👋`,
      color: "red",
    });
    if (typeof onGameUnfavorited === "function") {
      onGameUnfavorited(game.id);
    }
  };

  return (
    <>
      {/* Remove Favorite Modal */}
      <Modal
        opened={removeFavoriteModalOpened}
        onClose={() => setRemoveFavoriteModalOpened(false)}
        title="Confirm Unfavorite"
        centered
      >
        <Text size="sm">
          Are you sure you want to remove {game?.name || "this game"} from your
          Favorites?
        </Text>
        <Group mt="md">
          <Button variant="outline" onClick={() => setRemoveFavoriteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmRemoveFavorite}>
            Unfavorite Game
          </Button>
        </Group>
      </Modal>

      {/* Unplay Modal */}
      <Modal
        opened={unplayConfirmModalOpened}
        onClose={() => setUnplayConfirmModalOpened(false)}
        title="Confirm Mark as Unplayed"
        centered
      >
        <Text size="sm">
          Are you sure you want to mark {game?.name || "this game"} as unplayed?
        </Text>
        <Group mt="md">
          <Button variant="outline" onClick={() => setUnplayConfirmModalOpened(false)}>
            Cancel
          </Button>
          <Button color="blue" onClick={confirmUnplayGame}>
            Mark as Unplayed
          </Button>
        </Group>
      </Modal>

      <Stack gap="xs" align="center" onClickCapture={handleStackClick}>
        <Tooltip
          label={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
          withArrow
          position="top"
        >
          <ActionIcon
            onClick={isFavorited ? openRemoveFavoriteConfirmModal : handleAddFavorite}
            variant={isFavorited ? "filled" : "outline"}
            color={isFavorited ? "red" : "pink"}
            size="lg"
            aria-label={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorited ? (
              <IconHeartFilled size={20} />
            ) : (
              <IconHeartPlus size={20} />
            )}
          </ActionIcon>
        </Tooltip>

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
    </>
  );
}

export default GameActions;
