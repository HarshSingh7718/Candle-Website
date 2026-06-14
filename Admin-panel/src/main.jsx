import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Local Fonts (Specific weights only)
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/noto-serif/400.css';
import '@fontsource/noto-serif/500.css';
import '@fontsource/noto-serif/600.css';
import '@fontsource/noto-serif/700.css';
import '@fontsource/noto-serif/400-italic.css';
import '@fontsource/noto-serif/500-italic.css';
import '@fontsource/noto-serif/600-italic.css';
import '@fontsource/noto-serif/700-italic.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);