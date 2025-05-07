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
} from "@mantine/core";
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

function MyGamesPage() {
  const [displayedGames, setDisplayedGames] = useState([]);
  const navigate = useNavigate();
  const [clearAllModalOpened, setClearAllModalOpened] = useState(false);

  const loadDisplayedGames = useCallback(() => {
    const allGames = getCombinedDisplayedGames();
    setDisplayedGames(allGames);
  }, []);

  useEffect(() => {
    loadDisplayedGames();
  }, [loadDisplayedGames]);

  const handleClearGames = () => {
    setClearAllModalOpened(true);
  };

  const executeClearAllGames = () => {
    clearAllGameData();
    loadDisplayedGames();
    notifications.show({
      title: "All Game Data Cleared",
      message: "All your favorited and played game data has been cleared. 🧹",
      color: "orange",
    });
    setClearAllModalOpened(false);
  };

  const handleGameInteractionUpdate = useCallback(() => {
    loadDisplayedGames();
  }, [loadDisplayedGames]);

  return (
    <Container>
      <Title order={2} mb="lg">
        My Games
      </Title>

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
                      onGameUnplayed={handleGameInteractionUpdate}
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
    </Container>
  );
}

export default MyGamesPage;
