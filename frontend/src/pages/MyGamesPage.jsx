import React, { useState, useEffect, useCallback } from "react";
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
  Stack,
  Box,
} from "@mantine/core";
import { Carousel } from '@mantine/carousel';
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { notifications } from "@mantine/notifications";
import GameActions from "../components/GameActions";
import {
  getCombinedDisplayedGames,
  getFavoriteGameIds,
  getPlayedGameIds,
  clearAllGameData,
} from "../utils/localStorageUtils";
import { fetchTotalGamesCount, fetchRecommendations, fetchGamesByIds } from "../api";
import SearchResultCard from "../components/SearchResultCard";

function MyGamesPage() {
  useEffect(() => {
    document.title = "My Games - PAX Pal";
  }, []);

  const [displayedGames, setDisplayedGames] = useState([]);
  const navigate = useNavigate();
  const [clearAllModalOpened, setClearAllModalOpened] = useState(false);
  const [totalGamesInDb, setTotalGamesInDb] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [playedGamesCount, setPlayedGamesCount] = useState(0);
  const [allGamesFromStorage, setAllGamesFromStorage] = useState([]);
  const [favoriteGamesCount, setFavoriteGamesCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState(null); // 'favorites', 'played', or null

  // State for recommendations
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  const loadAndProcessGames = useCallback(() => {
    const allGames = getCombinedDisplayedGames();
    setAllGamesFromStorage(allGames);
    setPlayedGamesCount(getPlayedGameIds().length);
    setFavoriteGamesCount(getFavoriteGameIds().length);
    // Initial display will be set by the filter useEffect
  }, []);

  useEffect(() => {
    loadAndProcessGames();

    // Fetch total games count
    setIsLoadingStats(true);
    fetchTotalGamesCount()
      .then((count) => {
        setTotalGamesInDb(count);
      })
      .catch((error) => {
        console.error("Failed to fetch total games count:", error);
        notifications.show({
          title: "Error",
          message: "Could not load total game statistics.",
          color: "red",
        });
        setTotalGamesInDb(0); // Set to 0 or handle error display appropriately
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  }, [loadAndProcessGames]);

  // Effect to fetch recommendations when played/all games change
  useEffect(() => {
    const fetchAndSetRecommendations = async () => {
      const playedIds = getPlayedGameIds();
      const favoritedIds = getFavoriteGameIds();
      const allInteractedIds = Array.from(new Set([...playedIds, ...favoritedIds]));

      if (allInteractedIds.length === 0) {
        setRecommendedGames([]);
        return;
      }

      setIsLoadingRecommendations(true);
      setRecommendationsError(null);
      try {
        // Fetch recommended game IDs, telling the backend to exclude games from the input list (allInteractedIds)
        // This means if a game is in `allInteractedIds`, it won't be in the output `recommendedGameIds`.
        const recommendedGameIds = await fetchRecommendations(allInteractedIds, true, 10);
        console.log("Recommended Game IDs:", recommendedGameIds);
        
        if (recommendedGameIds && recommendedGameIds.length > 0) {
          // Filter out any IDs that are *already* in the user's broader collection (played or favorited)
          // This is a client-side double-check, as the backend should ideally handle `exclude_played_games` correctly.
          const uniqueNewRecommendedIds = recommendedGameIds.filter(id => !allInteractedIds.includes(id));
          
          if (uniqueNewRecommendedIds.length > 0) {
            const gamesData = await fetchGamesByIds(uniqueNewRecommendedIds);
            setRecommendedGames(gamesData.filter(game => game)); // Filter out any null/undefined games if API returns partial success
          } else {
            setRecommendedGames([]);
          }
        } else {
          setRecommendedGames([]);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRecommendationsError("Could not load recommendations. Please try again later.");
        setRecommendedGames([]);
      }
      setIsLoadingRecommendations(false);
    };

    fetchAndSetRecommendations();
  }, [allGamesFromStorage]); // Re-fetch when the base list of stored games changes

  useEffect(() => {
    if (!activeFilter) {
      setDisplayedGames(allGamesFromStorage);
    } else if (activeFilter === 'favorites') {
      const favoriteIds = getFavoriteGameIds();
      setDisplayedGames(allGamesFromStorage.filter(game => favoriteIds.includes(game.id)));
    } else if (activeFilter === 'played') {
      const playedIds = getPlayedGameIds();
      setDisplayedGames(allGamesFromStorage.filter(game => playedIds.includes(game.id)));
    }
  }, [allGamesFromStorage, activeFilter]);

  const handleClearGames = () => {
    setClearAllModalOpened(true);
  };

  const executeClearAllGames = () => {
    clearAllGameData();
    loadAndProcessGames(); // Reload and reprocess games
    notifications.show({
      title: "All Game Data Cleared",
      message: "All your favorited and played game data has been cleared. 🧹",
      color: "orange",
    });
    setClearAllModalOpened(false);
  };

  const handleGameInteractionUpdate = useCallback(() => {
    loadAndProcessGames(); // This will update counts and allGamesFromStorage, triggering the filter useEffect
  }, [loadAndProcessGames]);

  return (
    <Container>
      <Title order={2} mb="lg">
        My Games
      </Title>

      {/* Statistics Section */}
      <Box mb="lg" p="md" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
        <Title order={4} mb="xs">Game Stats</Title>
        {isLoadingStats ? (
          <Text>Loading stats...</Text>
        ) : totalGamesInDb !== null ? (
          <Text>
            Games Played: {playedGamesCount} / {totalGamesInDb}
            {totalGamesInDb > 0 &&
              ` (${Math.ceil((playedGamesCount / totalGamesInDb) * 100)}%)`
            }
          </Text>
        ) : (
          <Text>Could not load game statistics.</Text>
        )}
      </Box>

      {/* Filter Buttons Section */}
      {allGamesFromStorage.length > 0 && (
        <SimpleGrid cols={2} spacing="md" mt="md" mb="lg">
          <Button
            variant={activeFilter === 'favorites' ? 'filled' : 'outline'}
            onClick={() => setActiveFilter(activeFilter === 'favorites' ? null : 'favorites')}
            disabled={favoriteGamesCount === 0 && activeFilter !== 'favorites'}
            size="xs"
            h={30}
            px="xs"
            color={activeFilter === 'favorites' ? "red" : "pink"}
            style={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            Show Favorites ({favoriteGamesCount})
          </Button>
          <Button
            variant={activeFilter === 'played' ? 'filled' : 'outline'}
            onClick={() => setActiveFilter(activeFilter === 'played' ? null : 'played')}
            disabled={playedGamesCount === 0 && activeFilter !== 'played'}
            size="xs"
            h={30}
            px="xs"
            style={{ whiteSpace: 'normal', textAlign: 'center' }}
          >
            Show Played ({playedGamesCount})
          </Button>
        </SimpleGrid>
      )}

      <Modal
        opened={clearAllModalOpened}
        onClose={() => setClearAllModalOpened(false)}
        title="Confirm Clear All Game Data"
        centered
      >
        <Text size="sm">
          Are you sure you want to remove ALL your favorited and played game data?
          This action cannot be undone.
        </Text>
        <Group mt="md">
          <Button
            variant="outline"
            onClick={() => setClearAllModalOpened(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={executeClearAllGames}>
            Clear All Data
          </Button>
        </Group>
      </Modal>

      {displayedGames.length === 0 ? (
        <Text>
          You haven't favorited any games yet. Games you favorite will appear here, 
          and you can mark them as played or unplayed. Go find some by{" "}
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
          {displayedGames.map((game) => {
            const favoriteIds = getFavoriteGameIds();
            const playedIds = getPlayedGameIds();
            const initialIsFavorited = favoriteIds.includes(game.id);
            const initialIsPlayed = playedIds.includes(game.id);

            return (
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
                      initialIsPlayed={initialIsPlayed}
                      initialIsFavorited={initialIsFavorited}
                      onGameUnfavorited={handleGameInteractionUpdate}
                      onGamePlayed={handleGameInteractionUpdate}
                      onGameUnplayed={handleGameInteractionUpdate}
                      onGameFavorited={handleGameInteractionUpdate}
                    />
                  </div>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      {displayedGames.length > 0 && (
        <Button
          color="red"
          mt="xl"
          onClick={handleClearGames}
          fullWidth
        >
          Clear All My Games Data
        </Button>
      )}

      {/* Recommendations Section */}
      {allGamesFromStorage.length > 0 && recommendedGames.length > 0 && (
        <Box mt="xl" pt="xl" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Title order={3} mb="lg">
            Games You Might Like
          </Title>
          {isLoadingRecommendations && <Text>Loading recommendations...</Text>}
          {recommendationsError && <Text color="red">{recommendationsError}</Text>}
          {!isLoadingRecommendations && !recommendationsError && recommendedGames.length > 0 && (
            <Carousel
              slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
              slideGap={{ base: 0, sm: 'md' }}
              loop
              align="start"
              withIndicators
              slidesToScroll={1}
            >
              {recommendedGames.map((game) => (
                <Carousel.Slide key={`rec-${game.id}`}>
                  <Box p="xs">
                    <SearchResultCard game={game} />
                  </Box>
                </Carousel.Slide>
              ))}
            </Carousel>
          )}
          {!isLoadingRecommendations && !recommendationsError && recommendedGames.length === 0 && allInteractedIds.length > 0 && (
             <Text>No new recommendations based on your current games. Explore more!</Text>
          )}
        </Box>
      )}
    </Container>
  );
}

export default MyGamesPage;
