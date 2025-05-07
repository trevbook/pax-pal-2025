import React, { useState } from "react";
import {
  Container,
  TextInput,
  Button,
  Center,
  Stack,
  Text,
  Loader,
  Alert,
  Code,
  Card,
  Image,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { searchGames } from "../api"; // Assuming api.js is in the parent directory

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    event.preventDefault(); // Prevent default form submission
    if (!query.trim()) {
      setError("Please enter a search term.");
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      // Using default semantic_weight and limit for now
      const data = await searchGames(query);
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch search results:", err);
      setError(err.message || "An unknown error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <Center>
        <Stack align="center" gap="md" style={{ width: "100%", maxWidth: "600px" }}>
          <Text size="xl" fw={700}>
            Search Games
          </Text>
          <form onSubmit={handleSearch} style={{ width: "100%" }}>
            <Stack gap="sm">
              <TextInput
                placeholder="Enter search term (e.g., 'space shooter')"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                size="md"
                disabled={loading}
              />
              <Button type="submit" loading={loading} size="md" fullWidth>
                Search
              </Button>
            </Stack>
          </form>

          {loading && (
            <Center mt="xl">
              <Loader />
            </Center>
          )}

          {error && (
            <Alert color="red" mt="xl" title="Error">
              {error}
            </Alert>
          )}

          {results && !loading && !error && (
            <Stack mt="xl" gap="md" style={{ width: "100%" }}>
              <Text fw={500}>Search Results ({results.length}):</Text>
              {results.map((game) => (
                <Card
                  key={game.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  onClick={() => navigate(`/game_details?id=${game.id}`)}
                  style={{ cursor: "pointer", width: "100%" }}
                >
                  <Card.Section>
                    <Image
                      src={game.header_image_url}
                      height={180}
                      alt={game.name || "Game header image"}
                      loading="lazy"
                    />
                  </Card.Section>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={700} size="lg">{game.name}</Text>
                  </Group>

                  <Text size="sm" c="dimmed" italic>
                    {game.snappy_summary}
                  </Text>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Center>
    </Container>
  );
}

export default SearchPage; 