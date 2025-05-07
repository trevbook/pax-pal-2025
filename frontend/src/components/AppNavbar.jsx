import React from "react";
import { AppShell, NavLink } from "@mantine/core";
import { useNavigate } from "react-router"; // Changed from 'react-router-dom' to 'react-router'

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Search", path: "/search" },
  { label: "All Games", path: "/all-games" },
  { label: "My Games", path: "/my-games" },
  { label: "Info", path: "/info" },
];

function AppNavbar({ opened, toggle }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    if (opened) {
      // Close the navbar after navigation if it's open
      toggle();
    }
  };

  return (
    <AppShell.Navbar p="md">
      {navLinks.map((link) => (
        <NavLink
          key={link.label}
          label={link.label}
          onClick={() => handleNavigate(link.path)}
          styles={{
            label: {
              textAlign: "center",
              fontSize: "var(--mantine-font-size-lg)",
            },
          }}
        />
      ))}
    </AppShell.Navbar>
  );
}

export default AppNavbar;
