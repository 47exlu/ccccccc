import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import { ToastProvider } from './hooks/use-toast';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
