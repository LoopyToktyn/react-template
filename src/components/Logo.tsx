import { Box } from "@mui/material";
import React from "react";
import logo from "@assets/images/logo.svg";

const Logo = (props: React.SVGProps<any>) => (
  <Box
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      height: 60,
      width: "auto",
      mr: 2,
    }}
  />
);

export default Logo;
