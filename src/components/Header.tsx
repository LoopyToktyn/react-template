import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useColorMode } from "@context/ColorModeContext";
import Logo from "./Logo";

const NeonLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-1.5 -1.5 3 3"
    width="40"
    height="40"
  >
    <circle
      cx="0"
      cy="0"
      r="1.2"
      stroke="deepskyblue"
      strokeWidth="0.05"
      fill="none"
    />
    <path
      d="M 0.3,0.2 C 0.6,-0.3 -0.6,-0.3 -0.3,0.2"
      stroke="cyan"
      strokeWidth="0.05"
      fill="none"
    />
  </svg>
);

const Header: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Logo />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Cool App
        </Typography>

        {/* Dark mode toggle */}
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          onClick={toggleColorMode}
        >
          {mode === "dark" ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
