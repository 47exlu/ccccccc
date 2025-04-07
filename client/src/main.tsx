import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import { CustomToastProvider } from './hooks/use-toast';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CustomToastProvider>
      <App />
    </CustomToastProvider>
  </React.StrictMode>
);
