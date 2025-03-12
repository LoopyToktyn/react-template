import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useColorMode } from "@context/ColorModeContext";

const Header: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: theme.palette.primary.main }}
    >
      <Toolbar>
        <Box
          component="img"
          src="/images/logo-placeholder.png"
          alt="Logo"
          sx={{
            height: 40,
            width: "auto",
            mr: 2,
          }}
        />
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
