import React from "react";
import { Card, Image, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router";

function SearchResultCard({ game }) {
  const navigate = useNavigate();

  if (!game) {
    return null;
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={() => navigate(`/game_details?id=${game.id}`)}
      style={{ cursor: "pointer", width: "100%" }}
    >
      {game.header_image_url && (
        <Card.Section>
          <Image
            src={game.header_image_url}
            height={180}
            alt={game.name || "Game header image"}
            fallbackSrc="https://via.placeholder.com/300x180?text=No+Image"
            loading="lazy"
          />
        </Card.Section>
      )}
      <Group
        justify="space-between"
        mt={game.header_image_url ? "md" : "xs"}
        mb="xs"
      >
        <Text fw={700} size="lg" truncate="end">
          {game.name || "Unnamed Game"}
        </Text>
      </Group>
      {game.snappy_summary && (
        <Text size="sm" c="dimmed" lineClamp={3}>
          {game.snappy_summary}
        </Text>
      )}
    </Card>
  );
}

export default SearchResultCard;
