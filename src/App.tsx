import { BrowserRouter, HashRouter } from "react-router";
import Router from "./Router";
import { NetworkModeProvider } from "./contexts/NetworkModeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider } from "./contexts/Web3Provider";

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === "true" ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <ThemeProvider>
      <NetworkModeProvider>
        <Web3Provider>
          <AppRouter>
            <Router />
          </AppRouter>
        </Web3Provider>
      </NetworkModeProvider>
    </ThemeProvider>
  );
}
