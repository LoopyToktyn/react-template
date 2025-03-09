import { createTheme } from "@mui/material/styles";

const primaryColor = process.env.REACT_APP_PRIMARY_COLOR || "#1976d2";
const secondaryColor = process.env.REACT_APP_SECONDARY_COLOR || "#dc004e";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;
