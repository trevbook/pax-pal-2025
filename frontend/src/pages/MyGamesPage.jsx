import React, { useState, useEffect } from "react";
import { Title, Button, Container, Text, SimpleGrid, Card, Image, Modal, Group, Anchor } from "@mantine/core";
import { useNavigate } from "react-router";
import { Link } from "react-router";

// Helper function to get games from localStorage
const getMyGames = () => {
  const games = localStorage.getItem("myGames");
  return games ? JSON.parse(games) : [];
};

// Helper function to remove a game from localStorage
const removeGameFromMyGames = (gameId) => {
  let games = getMyGames();
  games = games.filter(game => game.id !== gameId);
  localStorage.setItem("myGames", JSON.stringify(games));
  return games; // Return updated games list
};

function MyGamesPage() {
  const [myGames, setMyGames] = useState([]);
  const navigate = useNavigate();
  const [modalOpened, setModalOpened] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);

  useEffect(() => {
    setMyGames(getMyGames());
  }, []);

  const handleClearGames = () => {
    localStorage.removeItem("myGames");
    setMyGames([]); // Update state to reflect cleared games
  };

  const openConfirmationModal = (gameId) => {
    setGameToRemove(gameId);
    setModalOpened(true);
  };

  const confirmRemoveGame = () => {
    if (gameToRemove) {
      const updatedGames = removeGameFromMyGames(gameToRemove);
      setMyGames(updatedGames);
    }
    setModalOpened(false);
    setGameToRemove(null);
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
        <Text size="sm">Are you sure you want to remove this game from your list?</Text>
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
            <Card shadow="sm" padding="lg" radius="md" withBorder key={game.id}>
              <Text fw={700}>{game.name}</Text>
              {game.header_image_url && (
                <Image src={game.header_image_url} alt={game.name} height={100} fit="contain" my="sm" />
              )}
              <Button
                variant="outline"
                color="blue"
                size="xs"
                mt="md"
                onClick={() => navigate(`/game_details?id=${game.id}`)}
                fullWidth
                mb="xs"
              >
                View Details
              </Button>
              <Button
                variant="filled"
                color="red"
                size="xs"
                onClick={() => openConfirmationModal(game.id)}
                fullWidth
              >
                Remove from My Games
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
      {myGames.length > 0 && (
        <Button color="red" mt="xl" onClick={handleClearGames}>
          Clear All My Games
        </Button>
      )}
    </Container>
  );
}

export default MyGamesPage; 