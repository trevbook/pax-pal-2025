import { AppShell, Burger, Group, Title } from '@mantine/core';
import React from 'react';

function AppHeader({ opened, toggle }) {
  return (
    <AppShell.Header bg="dark" c="white" h={60} p="md">
      <Group h="100%" align="center">
        {/* Burger antd toggle props will be passed from App.jsx */}
        <Burger opened={opened} onClick={toggle} color="white" aria-label="Toggle navigation" />
        <Title order={3} style={{ flexGrow: 1, textAlign: 'center' }}>
          PAX Pal 2025
        </Title>
        {/* Optional: Add an element to balance the burger for true centering if needed */}
        <div style={{ width: '30px' }} />
      </Group>
    </AppShell.Header>
  );
}

export default AppHeader; 