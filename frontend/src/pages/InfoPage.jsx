import React from "react";
import { Container, Title, Text, List, ThemeIcon } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";

function InfoPage() {
  return (
    <Container mt="lg">
      <Title order={1} mb="md">
        About PAX Pal
      </Title>
      <Text size="md">
        I built PAX Pal 2025 to help PAX East attendees find cool games on the
        show floor!
        <br />
        <br />
        The official{" "}
        <a
          href="https://east.paxsite.com/en-us/expo-hall/expo-hall-demos.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Expo Hall Demos page
        </a>{" "}
        is a great list of games, but it can be a bit hard to find games that
        are interesting to you. This app allows you to explore games through
        search, filtering, and "similar game" recommendations.
      </Text>

      <Text size="md" lh="lg" mt="md">
        Key features include:
      </Text>
      <List
        spacing="xs"
        size="sm"
        center
        mt="sm"
        icon={
          <ThemeIcon color="teal" size={24} radius="xl">
            <IconCircleCheck size={16} />
          </ThemeIcon>
        }
        style={{ lineHeight: 1.7 }} // Increase line height for all list items
      >
        <List.Item style={{ lineHeight: 1.7 }}>
          <b>Comprehensive Search:</b> Quickly find games by title, genre, or
          keywords.
        </List.Item>
        <List.Item style={{ lineHeight: 1.7 }}>
          <b>"More Like This":</b> Discover hidden gems with AI-powered similar
          game recommendations.
        </List.Item>
        <List.Item style={{ lineHeight: 1.7 }}>
          <b>Organized Information:</b> All the game details you need, in one
          place.
        </List.Item>
        <List.Item style={{ lineHeight: 1.7 }}>
          <b>Mobile-Friendly Design:</b> Easily browse and search on your phone
          while at PAX.
        </List.Item>
      </List>

      <Text size="md" mt="lg">
        The code for this app can be found{" "}
        <a
          href="https://github.com/trevbook/pax-pal-2025"
          target="_blank"
          rel="noopener noreferrer"
        >
          in this GitHub repo
        </a>
        .
      </Text>

      <Text size="md" mt="md">
        If you're interested in reaching out, feel free to email me at{" "}
        <a href="mailto:trevormhubbard@gmail.com">trevormhubbard@gmail.com</a>,
        or reach out on{" "}
        <a
          href="https://x.com/trevbook"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>{" "}
        or{" "}
        <a
          href="https://bsky.app/profile/trevbook.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
        >
          BlueSky
        </a>
        .
      </Text>
    </Container>
  );
}

export default InfoPage;
