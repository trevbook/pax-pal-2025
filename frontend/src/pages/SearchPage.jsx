import React, { useState, useEffect } from "react";
import {
  Container,
  Textarea,
  Button,
  Stack,
  Text,
  Loader,
  Alert,
  Card,
  Image,
  Group,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { searchGames } from "../api"; // Assuming api.js is in the parent directory
import SearchResultCard from "../components/SearchResultCard";

function SearchPage() {
  useEffect(() => {
    document.title = "Search - PAX Pal";
  }, []);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault(); // Prevent default form submission or newline character
    }
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent newline in textarea
      handleSearch(event); // Pass the event object
    }
  };

  return (
    <Container>
      <Stack
        gap="md"
        style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
      >
        <Text size="xl" fw={700} ta="left">
          Search Games
        </Text>
        <form onSubmit={handleSearch} style={{ width: "100%" }}>
          <Stack gap="sm">
            <Textarea
              placeholder="Enter search term (e.g., 'space shooter', or 'cute frog')"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              size="md"
              disabled={loading}
              autosize
              minRows={1}
            />
            <Button
              type="submit"
              loading={loading}
              size="md"
              fullWidth
              color="dark"
            >
              Search
            </Button>
          </Stack>
        </form>

        {error && (
          <Alert color="red" mt="xl" title="Error" style={{ width: "100%" }}>
            {error}
          </Alert>
        )}

        {results && !loading && !error && (
          <Stack mt="xl" gap="md" style={{ width: "100%" }}>
            {results.map((game) => (
              <SearchResultCard key={game.id} game={game} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

export default SearchPage;
