import { Box } from "@mui/material";
import React from "react";

const Logo = (props: React.SVGProps<any>) => (
  <Box
    // component={Logo}
    component="img"
    src="/images/neon_loopy_toktyn2.svg"
    alt="Logo"
    sx={{
      height: 60,
      width: "auto",
      mr: 2,
    }}
  />
);

export default Logo;
