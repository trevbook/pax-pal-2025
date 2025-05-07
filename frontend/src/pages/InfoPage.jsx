import React from "react";
import { Container, Title, Text } from "@mantine/core";

function InfoPage() {
  return (
    <Container mt="lg">
      <Title order={1} mb="md">
        About Pax Pal
      </Title>
      <Text size="md" lh="lg">
        Pax Pal is your ultimate companion for discovering new and exciting
        games. Our application leverages a powerful hybrid search system,
        combining traditional full-text search (BM25) with cutting-edge semantic
        vector search (ANN Cosine) to provide you with highly relevant game
        recommendations. Whether you're looking for a specific title or just
        browsing for something new to play, Pax Pal helps you navigate a
        comprehensive database of games, complete with metadata and media. The
        backend is powered by FastAPI and SQLite with vector capabilities, while
        the frontend is a responsive React application built with Vite and
        Mantine.
      </Text>
    </Container>
  );
}

export default InfoPage;
