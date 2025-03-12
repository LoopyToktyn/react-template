// src/components/Header.tsx
import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Header: React.FC = () => {
  const theme = useTheme();

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
        <Typography variant="h6" component="div">
          My Cool App
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
