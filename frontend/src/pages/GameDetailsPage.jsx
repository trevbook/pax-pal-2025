import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Carousel } from "@mantine/carousel";
import {
  Title,
  Text,
  Loader,
  Alert,
  Center,
  Container,
  Image,
  Group,
  Pill,
  Stack,
  Divider,
  List,
  Button,
  Modal,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchGameDetails } from "../api";
import GameActions from "../components/GameActions";

// Helper functions for localStorage (can be moved to a utils file later)
const getMyGames = () => {
  const games = localStorage.getItem("myGames");
  return games ? JSON.parse(games) : [];
};

const addGameToMyGames = (game) => {
  if (!game || !game.id) return; // Do nothing if game or game.id is undefined
  const games = getMyGames();
  if (!games.find((g) => g.id === game.id)) {
    games.push(game);
    localStorage.setItem("myGames", JSON.stringify(games));
  }
};

const removeGameFromMyGames = (gameId) => {
  if (!gameId) return; // Do nothing if gameId is undefined
  let games = getMyGames();
  games = games.filter((g) => g.id !== gameId);
  localStorage.setItem("myGames", JSON.stringify(games));
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

function GameDetailsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInMyGames, setIsInMyGames] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [playedGames, setPlayedGames] = useState({}); // New state for played games

  useEffect(() => {
    // Load played games status on component mount
    setPlayedGames(getPlayedGamesStatus());
  }, []);

  useEffect(() => {
    if (!id) {
      setGame(null);
      setLoading(false);
      setError(null);
      setIsInMyGames(false);
      // playedGames state is managed by its own useEffect and persists globally
      return;
    }

    const loadGameData = async () => {
      setLoading(true);
      setError(null);
      setGame(null);
      setIsInMyGames(false);
      setModalOpened(false);
      try {
        const data = await fetchGameDetails(id);
        console.log("Game data:", data);
        setGame(data);
        if (data && data.id) {
          const myGames = getMyGames();
          setIsInMyGames(!!myGames.find((g) => g.id === data.id));
          // playedGames is already loaded by the other useEffect
        }
      } catch (err) {
        console.error("Failed to fetch game details:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [id]);

  const handleToggleMyGames = () => {
    if (!game || !game.id) return;

    if (isInMyGames) {
      setModalOpened(true);
    } else {
      addGameToMyGames(game);
      setIsInMyGames(true);
      notifications.show({
        title: "Game Added",
        message: `${game.name} has been added to My Games! 🎉`,
        color: "green",
      });
    }
  };

  const confirmRemoveGame = () => {
    if (!game || !game.id) return;
    const gameName = game.name;
    removeGameFromMyGames(game.id);
    setIsInMyGames(false);
    setModalOpened(false);
    notifications.show({
      title: "Game Removed",
      message: `${gameName} has been removed from My Games. 👋`,
      color: "red",
    });
  };

  const handleTogglePlayedDetails = () => {
    if (!game || !game.id) return;

    const gameId = game.id;
    const gameName = game.name;
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
    <Container pb="xl">
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Confirm Removal"
        centered
      >
        <Text size="sm">
          Are you sure you want to remove {game?.name || "this game"} from your
          list?
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

      {loading && (
        <Center mt="xl">
          <Loader />
        </Center>
      )}
      {error && (
        <Alert color="red" mt="xl">
          {error}
        </Alert>
      )}
      {!loading && !error && game && (
        <>
          {game.header_image_url &&
            typeof game.header_image_url === "string" &&
            game.header_image_url.trim() !== "" && (
              <Center mb="md">
                <Image
                  src={game.header_image_url}
                  alt={game.name ? `${game.name} header` : "Game header"}
                  radius="lg"
                  h={200}
                  fit="contain"
                />
              </Center>
            )}
          <Group wrap="nowrap" align="center" gap="sm">
            <Group gap={0}>
              <Title order={1} style={{ flexGrow: 1 }}>
                {game.name}
              </Title>
              {game.snappy_summary && (
                <Text size="md" c="dimmed" fs="italic" mt={4}>
                  {game.snappy_summary}
                </Text>
              )}
            </Group>
            {game && game.id && (
              <GameActions
                game={game}
                initialIsPlayed={!!playedGames[game.id]}
                initialIsInMyGames={isInMyGames}
              />
            )}
          </Group>

          <Divider my="md" />

          <Stack gap="lg">
            {game.description &&
              typeof game.description === "string" &&
              game.description.trim() !== "" && (
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <Text fw={600} mb={2}>
                    Description
                  </Text>
                  <Text size="sm" style={{ whiteSpace: "pre-line" }}>
                    {game.description}
                  </Text>
                </Stack>
              )}

            {Array.isArray(game.media) && game.media.length > 0 && (
              <Stack gap={4} style={{ minWidth: 0 }}>
                <Text fw={600} mb={2}>
                  Media
                </Text>
                <Carousel
                  withIndicators
                  loop
                  align="start"
                  slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
                  slideGap={{ base: 0, sm: "md" }}
                  height={200}
                >
                  {game.media.map((mediaItem, index) => (
                    <Carousel.Slide key={mediaItem.url || index}>
                      {mediaItem.type === "image" && (
                        <Image
                          src={mediaItem.url}
                          alt={`Game media ${index + 1}`}
                          fit="contain"
                          h="100%"
                          loading="lazy"
                        />
                      )}
                      {mediaItem.type === "video" && (
                        <video
                          src={mediaItem.url}
                          controls
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Carousel.Slide>
                  ))}
                </Carousel>
              </Stack>
            )}

            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text fw={600} mb={2}>
                Genres
              </Text>
              <Group gap={6} wrap="wrap">
                {Array.isArray(game.genres_and_tags) &&
                game.genres_and_tags.length > 0 ? (
                  game.genres_and_tags.map((genre) => (
                    <Pill key={genre} size="sm" variant="light">
                      {genre}
                    </Pill>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    No information found
                  </Text>
                )}
              </Group>
            </Stack>

            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text fw={600} mb={2}>
                Platforms
              </Text>
              <Group gap={6} wrap="wrap">
                {Array.isArray(game.platforms) && game.platforms.length > 0 ? (
                  game.platforms.map((platform) => (
                    <Pill key={platform} size="sm" variant="light">
                      {platform}
                    </Pill>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    No information found
                  </Text>
                )}
              </Group>
            </Stack>

            {Array.isArray(game.links) && game.links.length > 0 && (
              <Stack gap={4} style={{ minWidth: 0 }}>
                <Text fw={600} mb={2}>
                  Links
                </Text>
                <List spacing="xs" size="sm" withPadding>
                  {game.links.map((link, idx) => (
                    <List.Item key={link.url || idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "underline",
                          color: "inherit",
                        }}
                      >
                        {link.title || link.url}
                      </a>
                    </List.Item>
                  ))}
                </List>
              </Stack>
            )}
          </Stack>
        </>
      )}
      {!loading && !error && !game && (
        <Center mt="xl">
          <Text>No game selected.</Text>
        </Center>
      )}
    </Container>
  );
}

export default GameDetailsPage;
