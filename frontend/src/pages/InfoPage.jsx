import React from "react";
import { Container, Title, Text } from "@mantine/core";

function InfoPage() {
  return (
    <Container mt="lg">
      <Title order={1} mb="md">
        About Pax Pal
      </Title>
      <Text size="md" lh="lg">
        I built PAX Pal 2025 to help PAX East attendees find cool games on the
        show floor!
        <br />
        The official{" "}
        <a
          href="https://east.paxsite.com/en-us/expo-hall/expo-hall-demos.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Expo Hall Demos page
        </a>{" "}
        is a great list of games, but it's a little hard to search properly{" "}
        <em>and</em> doesn't have a whole lot of information about each game.
      </Text>
    </Container>
  );
}

export default InfoPage;
