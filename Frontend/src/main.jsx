import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Local Fonts (Specific weights only)
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/sora/400.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't spam the server on failure
      refetchOnWindowFocus: false, // Prevents refetching every time you switch tabs
    },
  },
});

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </HelmetProvider>,
);
