import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Title, Text, Loader, Alert } from "@mantine/core";
import { fetchGameDetails } from "../api";

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
    <>
      <Title order={1} mb="md">
        Game Details
      </Title>

      {!id && (
        <Text c="dimmed" fs="italic" size="lg">
          Please select a game or provide an ID in the URL (e.g.,
          ?id=game-slug).
        </Text>
      )}

      {loading && <Loader />}

      {error && (
        <Alert title="Error!" color="red">
          {error}
        </Alert>
      )}

      {game && (
        <div>
          <Title order={2}>{game.name}</Title>
          <Text c="dimmed" size="sm" mb="xs">
            ID: {game.id}
          </Text>
          {game.snappy_summary && (
            <Text fw={500} mb="sm">
              {game.snappy_summary}
            </Text>
          )}
          <Text mb="md">{game.description}</Text>
          <pre>{JSON.stringify(game, null, 2)}</pre>
        </div>
      )}
    </>
  );
}

export default GameDetailsPage;
