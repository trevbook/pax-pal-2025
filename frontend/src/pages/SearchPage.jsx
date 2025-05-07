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
} from "@mantine/core";
import { searchGames } from "../api"; // Assuming api.js is in the parent directory

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
              <Text fw={500}>Search Results:</Text>
              <Code block style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(results, null, 2)}
              </Code>
            </Stack>
          )}
        </Stack>
      </Center>
    </Container>
  );
}

export default SearchPage; 