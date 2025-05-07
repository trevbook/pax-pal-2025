import { BrowserRouter, Routes, Route } from "react-router";
// Import styles of packages that you've installed.
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";

import { MantineProvider } from "@mantine/core";

// Import page components
import RootPage from "./pages/RootPage";
import GameDetailsPage from "./pages/GameDetailsPage";
import SearchPage from "./pages/SearchPage";
import InfoPage from "./pages/InfoPage";

function App() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/game_details" element={<GameDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/info" element={<InfoPage />} />
        </Routes>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
