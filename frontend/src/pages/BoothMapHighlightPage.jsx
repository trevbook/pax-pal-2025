import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Box, Title, Center, Loader, Paper, Text, Image, Button } from "@mantine/core";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";

function BoothMapHighlightPage() {
  const { boothId } = useParams();
  const [boothsData, setBoothsData] = useState(null);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
    loaded: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    fetch("/booths.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setBoothsData(data))
      .catch((err) => {
        console.error("Failed to load booths data:", err);
        setError(
          "Could not load booth information. Please try again later. 😕"
        );
      });
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleImageLoad = (event) => {
    setImageDimensions({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
      loaded: true,
    });
  };

  // Ensure boothId is treated as a string for lookup
  const currentBoothIdString = String(boothId);
  const boothCoords = boothsData && boothsData[currentBoothIdString];

  if (error) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text color="red" size="xl">
          {error}
        </Text>
      </Center>
    );
  }

  if (!boothsData && !error) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (boothsData && !boothCoords) {
    return (
      <Center style={{ height: "100vh" }}>
        <Text size="xl">
          Booth ID '{currentBoothIdString}' not found in map data. 🗺️❓
        </Text>
      </Center>
    );
  }

  return (
    <Paper
      shadow="md"
      p={{ base: 'sm', sm: 'lg' }}
      m={{ base: 'xs', sm: 'md' }}
      withBorder
    >
      <Title order={2} ta="center" mb="xl">
        Map: Booth {currentBoothIdString}
      </Title>
      <Center>
        <Box ref={mapContainerRef} style={{ position: "relative", width: "100%", backgroundColor: isFullscreen ? 'black' : 'transparent' }}>
          <Image
            src="/pax-map.jpg"
            alt={`PAX Map - Highlight for Booth ${currentBoothIdString}`}
            onLoad={handleImageLoad}
            style={{
              display: "block",
              maxWidth: "100%",
              opacity: imageDimensions.loaded ? 1 : 0.5,
            }}
          />
          {!imageDimensions.loaded && (
            <Center
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <Loader size="lg" />
            </Center>
          )}
          {imageDimensions.loaded && boothCoords && (
            <svg
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
              viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
            >
              <circle
                cx={(boothCoords[0] + boothCoords[2]) / 2}
                cy={(boothCoords[1] + boothCoords[3]) / 2}
                r={60}
                style={{
                  fill: "rgba(255, 255, 0, 0.5)",
                  stroke: "black",
                  strokeWidth: "2px",
                }}
                title={`Highlight for booth ${currentBoothIdString}`}
              />
              <circle
                cx={(boothCoords[0] + boothCoords[2]) / 2}
                cy={(boothCoords[1] + boothCoords[3]) / 2}
                r={5}
                style={{
                  fill: "red",
                }}
                title={`Center of booth ${currentBoothIdString}`}
              />
            </svg>
          )}
          {imageDimensions.loaded && (
            <Button
              onClick={toggleFullscreen}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10, // Ensure button is above the map image/svg
              }}
              variant="default"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <IconArrowsMinimize size={18} />
              ) : (
                <IconArrowsMaximize size={18} />
              )}
            </Button>
          )}
        </Box>
      </Center>
    </Paper>
  );
}

export default BoothMapHighlightPage;
