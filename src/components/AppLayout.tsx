// src/components/AppLayout.tsx
import React from "react";
import { Box } from "@mui/material";
import Header from "@components/Header";
import Menu from "@components/Menu";
import Footer from "@components/Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // Make sure layout occupies full viewport height
        minHeight: "100vh",
      }}
    >
      {/* Header at the top */}
      <Header />

      {/* Menu (horizontal bar) below header */}
      <Menu />

      {/* Content area grows/shrinks so footer can stick to bottom if content is short */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Footer at the bottom */}
      <Footer />
    </Box>
  );
};

export default AppLayout;
