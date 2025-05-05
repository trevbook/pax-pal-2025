import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
// Import styles of packages that you've installed.
import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <MantineProvider>
        <>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.jsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Sup!
          </p>
        </>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;
