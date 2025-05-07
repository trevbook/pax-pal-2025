import React, { useState, useEffect } from "react";
import {
  Title,
  Button,
  Container,
  Text,
  SimpleGrid,
  Card,
  Image,
  Modal,
  Group,
  Anchor,
  ActionIcon,
  Checkbox,
  Stack,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react"; // Assuming @tabler/icons-react is installed
import GameActions from "../components/GameActions"; // Import the new component

// Helper function to get games from localStorage
const getMyGames = () => {
  const games = localStorage.getItem("myGames");
  return games ? JSON.parse(games) : [];
};

// Helper function to remove a game from localStorage
const removeGameFromMyGames = (gameId) => {
  let games = getMyGames();
  games = games.filter((game) => game.id !== gameId);
  localStorage.setItem("myGames", JSON.stringify(games));
  return games; // Return updated games list
};

// Helper function to get played games status from localStorage
const getPlayedGamesStatus = () => {
  const statuses = localStorage.getItem("playedGames");
  return statuses ? JSON.parse(statuses) : {}; // e.g., { "gameId1": true }
};

// Helper function to update played status for a game in localStorage
const updatePlayedGameStatusInStorage = (gameId, isPlayed) => {
  const statuses = getPlayedGamesStatus();
  if (isPlayed) {
    statuses[gameId] = true;
  } else {
    delete statuses[gameId]; // Remove key if not played for cleaner storage
  }
  localStorage.setItem("playedGames", JSON.stringify(statuses));
  return statuses; // Return updated statuses map
};

function MyGamesPage() {
  const [myGames, setMyGames] = useState([]);
  const [playedGames, setPlayedGames] = useState({});
  const navigate = useNavigate();
  const [modalOpened, setModalOpened] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);

  useEffect(() => {
    setMyGames(getMyGames());
    setPlayedGames(getPlayedGamesStatus());
  }, []);

  const handleClearGames = () => {
    localStorage.removeItem("myGames");
    localStorage.removeItem("playedGames"); // Clear played games as well
    setMyGames([]);
    setPlayedGames({}); // Update state to reflect cleared games
    notifications.show({
      title: "Storage Cleared",
      message: "All your saved games and played statuses have been cleared.",
      color: "orange",
    });
  };

  const openConfirmationModal = (gameId) => {
    setGameToRemove(gameId);
    setModalOpened(true);
  };

  const confirmRemoveGame = () => {
    if (gameToRemove) {
      const updatedGames = removeGameFromMyGames(gameToRemove);
      setMyGames(updatedGames);
      // Also remove from played games if it exists there
      const currentPlayed = getPlayedGamesStatus();
      if (currentPlayed[gameToRemove]) {
        delete currentPlayed[gameToRemove];
        localStorage.setItem("playedGames", JSON.stringify(currentPlayed));
        setPlayedGames(currentPlayed);
      }
    }
    setModalOpened(false);
    setGameToRemove(null);
    notifications.show({
      title: "Game Removed",
      message: "The game has been removed from your list.",
      color: "red",
    });
  };

  const handleTogglePlayed = (gameId, gameName) => {
    const newIsPlayed = !playedGames[gameId];
    const updatedPlayedGamesMap = updatePlayedGameStatusInStorage(
      gameId,
      newIsPlayed
    );
    setPlayedGames(updatedPlayedGamesMap);

    if (newIsPlayed) {
      notifications.show({
        title: "Game Status Updated",
        message: `"${gameName}" marked as played! ✅`,
        color: "green",
      });
    } else {
      notifications.show({
        title: "Game Status Updated",
        message: `"${gameName}" removed from your played games.`,
        color: "blue",
      });
    }
  };

  return (
    <Container>
      <Title order={2} mb="lg">
        My Games
      </Title>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Confirm Removal"
        centered
      >
        <Text size="sm">
          Are you sure you want to remove this game from your list?
        </Text>
        <Group mt="md">
          <Button variant="outline" onClick={() => setModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmRemoveGame}>
            Remove Game
          </Button>
        </Group>
      </Modal>

      {myGames.length === 0 ? (
        <Text>
          You haven't added any games yet. Go find some by{" "}
          <Anchor component={Link} to="/search">
            searching
          </Anchor>{" "}
          or browsing{" "}
          <Anchor component={Link} to="/all-games">
            all the games
          </Anchor>
          !
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {myGames.map((game) => (
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              key={game.id}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                onClick={() => navigate(`/game_details?id=${game.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Card.Section>
                  <Image
                    src={game.header_image_url}
                    alt={game.name || "Game image"}
                    height={100}
                  />
                </Card.Section>
              </div>

              <Group
                mt="lg"
                align="flex-start"
                wrap="nowrap"
                style={{ flexGrow: 1 }}
              >
                <Stack
                  gap={2}
                  onClick={() => navigate(`/game_details?id=${game.id}`)}
                  style={{
                    cursor: "pointer",
                    flexGrow: 1,
                    minWidth: 0,
                    paddingTop: "1rem",
                  }}
                >
                  <Text fw={700} size="lg" lineClamp={2}>
                    {game.name}
                  </Text>
                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {game.snappy_summary ||
                      "No summary available for this game."}
                  </Text>
                </Stack>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    marginLeft: "var(--mantine-spacing-sm)",
                    flexShrink: 0,
                    paddingTop: "1rem",
                  }}
                >
                  <GameActions
                    game={game}
                    initialIsPlayed={!!playedGames[game.id]}
                    initialIsInMyGames={true}
                    onOpenRemoveModal={openConfirmationModal}
                    pageType="myGames"
                  />
                </div>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
      {myGames.length > 0 && (
        <Button color="red" mt="xl" onClick={handleClearGames} fullWidth>
          Clear All My Games
        </Button>
      )}
    </Container>
  );
}

export default MyGamesPage;
