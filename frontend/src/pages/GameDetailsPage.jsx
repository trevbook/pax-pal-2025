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
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchGameDetails } from "../api";
import GameActions from "../components/GameActions";
import {
  getFavoriteGameIds,
  getPlayedGameIds,
} from "../utils/localStorageUtils";

function GameDetailsPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setGame(null);
      setLoading(false);
      setError(null);
      return;
    }

    const loadGameData = async () => {
      setLoading(true);
      setError(null);
      setGame(null);
      try {
        const data = await fetchGameDetails(id);
        console.log("Game data:", data);
        setGame(data);
      } catch (err) {
        console.error("Failed to fetch game details:", err);
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [id]);

  return (
    <Container pb="xl">
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
          <Group wrap="nowrap" align="center" justify="space-between">
            <Stack gap={0} style={{ flexGrow: 1 }}>
              <Title order={1}>{game.name}</Title>
              {game.snappy_summary && (
                <Text size="md" c="dimmed" fs="italic" mt={4}>
                  {game.snappy_summary}
                </Text>
              )}
            </Stack>
            {game &&
              game.id &&
              (() => {
                const favoriteIds = getFavoriteGameIds();
                const playedIds = getPlayedGameIds();
                const isFavorited = favoriteIds.includes(game.id);
                const isPlayed = playedIds.includes(game.id);

                return (
                  <GameActions
                    game={game}
                    initialIsPlayed={isPlayed}
                    initialIsFavorited={isFavorited}
                  />
                );
              })()}
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
