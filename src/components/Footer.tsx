// src/components/Footer.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} My Cool App. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
