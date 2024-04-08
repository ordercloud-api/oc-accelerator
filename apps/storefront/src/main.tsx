import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppProvider from "./AppProvider.tsx";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <AppProvider />
    </ChakraProvider>
  </React.StrictMode>
);
