import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { MantineProvider, AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Notifications } from '@mantine/notifications';

// Import styles of packages that you've installed.
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import '@mantine/notifications/styles.css';

// Import custom components
import AppHeader from "./components/AppHeader";
import AppNavbar from "./components/AppNavbar";
import ScrollToTop from "./components/ScrollToTop";

// Import page components
import RootPage from "./pages/RootPage";
import GameDetailsPage from "./pages/GameDetailsPage";
import SearchPage from "./pages/SearchPage";
import InfoPage from "./pages/InfoPage";
import AllGamesPage from "./pages/AllGamesPage";
import MyGamesPage from "./pages/MyGamesPage";
import BoothMapHighlightPage from './pages/BoothMapHighlightPage';

function AppContent() {
  const [opened, { toggle }] = useDisclosure(false);
  const location = useLocation();
  const showHeader = location.pathname !== "/";

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: !opened } }}
      padding="md"
    >
      {showHeader && <AppHeader opened={opened} toggle={toggle} />}
      {showHeader && <AppNavbar opened={opened} toggle={toggle} />}
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<RootPage />} title="PAX Pal 2025 Home" />
          <Route path="/game_details" element={<GameDetailsPage />} title="Game Details" />
          <Route path="/search" element={<SearchPage />} title="Search Games" />
          <Route path="/info" element={<InfoPage />} title="About PAX Pal" />
          <Route path="/all-games" element={<AllGamesPage />} title="All Games" />
          <Route path="/my-games" element={<MyGamesPage />} title="My Games" />
          <Route path="/map/:boothId" element={<BoothMapHighlightPage />} title="Expo Hall Map" />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MantineProvider>
        <Notifications />
        <AppContent />
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
