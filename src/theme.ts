import { createTheme as ogCreateTheme } from "@mui/material/styles";

// Color constants
const PRIMARY_LIGHT = "#1976d2"; // Core health blue
const PRIMARY_DARK = "#90caf9";
const PRIMARY_LIGHT_VARIANT = "#63a4ff";
const PRIMARY_DARK_VARIANT = "#004ba0";

const SECONDARY_LIGHT = "#ff6f61"; // Friendly coral
const SECONDARY_DARK = "#ff8a80";

const BACKGROUND_LIGHT_DEFAULT = "#f5f5f5";
const BACKGROUND_DARK_DEFAULT = "#121212";
const BACKGROUND_LIGHT_PAPER = "#ffffff";
const BACKGROUND_DARK_PAPER = "#1e1e1e";

const TEXT_LIGHT_PRIMARY = "#212121";
const TEXT_DARK_PRIMARY = "#ffffff";
const TEXT_LIGHT_SECONDARY = "#757575";
const TEXT_DARK_SECONDARY = "#b0b0b0";

const FONT_FAMILY = "Inter, sans-serif";

// Theme creator
const createTheme = (mode: "light" | "dark") =>
  ogCreateTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? PRIMARY_LIGHT : PRIMARY_DARK,
        light: PRIMARY_LIGHT_VARIANT,
        dark: PRIMARY_DARK_VARIANT,
      },
      secondary: {
        main: mode === "light" ? SECONDARY_LIGHT : SECONDARY_DARK,
      },
      background: {
        default:
          mode === "light" ? BACKGROUND_LIGHT_DEFAULT : BACKGROUND_DARK_DEFAULT,
        paper:
          mode === "light" ? BACKGROUND_LIGHT_PAPER : BACKGROUND_DARK_PAPER,
      },
      text: {
        primary: mode === "light" ? TEXT_LIGHT_PRIMARY : TEXT_DARK_PRIMARY,
        secondary:
          mode === "light" ? TEXT_LIGHT_SECONDARY : TEXT_DARK_SECONDARY,
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
