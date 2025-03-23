import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useColorMode } from "@context/ColorModeContext";
import Logo from "./Logo";

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
