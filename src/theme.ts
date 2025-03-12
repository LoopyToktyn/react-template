// theme.ts

import { createTheme as ogCreateTheme } from "@mui/material/styles";

const primaryColor = process.env.REACT_APP_PRIMARY_COLOR || "#1976d2"; // Core health blue
const secondaryColor = process.env.REACT_APP_SECONDARY_COLOR || "#ff6f61"; // Friendly coral

const createTheme = (mode: any) =>
  ogCreateTheme({
    palette: {
      mode: mode,
      primary: {
        main: primaryColor,
        light: "#63a4ff", // Lightened blue
        dark: "#004ba0", // Deep blue for contrast
      },
      secondary: {
        main: secondaryColor,
        light: "#ffa07a", // Softer coral
        dark: "#c62828", // Deep contrast
      },
      background: {
        default: "#f5f5f5", // Soft off-white
        paper: "#ffffff", // White cards
      },
      text: {
        primary: "#212121", // Dark gray for readability
        secondary: "#757575", // Muted gray for secondary text
      },
      success: {
        main: "#4caf50", // Positive feedback
      },
      warning: {
        main: "#ff9800", // Warnings
      },
      error: {
        main: "#d32f2f", // Errors
      },
      info: {
        main: "#0288d1", // Additional emphasis
      },
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
    },
  });

export default createTheme;
