import React from "react";
import { Card, Text, SimpleGrid, Group, Title, Container } from "@mantine/core";
import { useNavigate } from "react-router";

const pageLinks = [
  {
    title: "Search",
    description: "Find your next favorite game.",
    path: "/search",
  },
  {
    title: "All Games",
    description: "Browse and filter the complete game list.",
    path: "/all-games",
  },
  {
    title: "My Games",
    description: "View and manage your saved games.",
    path: "/my-games",
  },
  {
    title: "Info",
    description: "Learn more about this application.",
    path: "/info",
  },
];

function RootPage() {
  const navigate = useNavigate();

  const filteredPageLinks = pageLinks.filter(link => link.title !== "Game Details");

  return (
    <>
      <Container p="lg" style={{ textAlign: 'center' }}>
        <Title order={1}>PAX Pal 2025</Title>
        <Text size="sm" c="dimmed" mt="xs">
          an app made by trevbook
        </Text>
      </Container>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" p="lg">
        {filteredPageLinks.map((link) => (
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            key={link.title}
            onClick={() => navigate(link.path)}
            style={{ cursor: "pointer" }}
          >
            <Group justify="space-between" mb="xs">
              <Text fw={700} size="lg">
                {link.title}
              </Text>
            </Group>

            <Text size="sm" c="dimmed">
              {link.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}

export default RootPage;
