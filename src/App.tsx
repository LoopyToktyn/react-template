// src/App.tsx
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RoutesComponent from "./routes";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import AppLayout from "@components/AppLayout";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppLayout>
        <RoutesComponent />
      </AppLayout>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;
