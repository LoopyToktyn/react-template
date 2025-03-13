// theme.ts

import { createTheme as ogCreateTheme } from "@mui/material/styles";

const primaryColor = process.env.REACT_APP_PRIMARY_COLOR || "#1976d2"; // Core health blue
const secondaryColor = process.env.REACT_APP_SECONDARY_COLOR || "#ff6f61"; // Friendly coral

const FONT_FAMILY = "Inter, sans-serif";

const createTheme = (mode: "light" | "dark") =>
  ogCreateTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#1976d2" : "#90caf9", // Different primary for light/dark
        light: "#63a4ff",
        dark: "#004ba0",
      },
      secondary: {
        main: mode === "light" ? "#ff6f61" : "#ff8a80", // Adjusted for contrast
      },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary: mode === "light" ? "#212121" : "#ffffff",
        secondary: mode === "light" ? "#757575" : "#b0b0b0",
      },
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontFamily: FONT_FAMILY, fontWeight: 700 },
      h2: { fontFamily: FONT_FAMILY, fontWeight: 600 },
      h3: { fontFamily: FONT_FAMILY, fontWeight: 600 },
      h4: { fontFamily: FONT_FAMILY, fontWeight: 600 },
    },
  });

export default createTheme;
