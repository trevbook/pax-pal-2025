import { BrowserRouter, Routes, Route } from "react-router";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';

// Import styles of packages that you've installed.
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import '@mantine/notifications/styles.css';

// Import page components
import RootPage from "./pages/RootPage";
import GameDetailsPage from "./pages/GameDetailsPage";
import SearchPage from "./pages/SearchPage";
import InfoPage from "./pages/InfoPage";
import AllGamesPage from "./pages/AllGamesPage";
import MyGamesPage from "./pages/MyGamesPage";

function App() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <Notifications />
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/game_details" element={<GameDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/all-games" element={<AllGamesPage />} />
          <Route path="/my-games" element={<MyGamesPage />} />
        </Routes>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
