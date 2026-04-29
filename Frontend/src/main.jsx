import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "./context/StoreContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Don't spam the server on failure
      refetchOnWindowFocus: false, // Prevents refetching every time you switch tabs
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
        <StoreProvider>
            <App />
        </StoreProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
