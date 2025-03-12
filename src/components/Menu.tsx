// src/components/Menu.tsx
import React from "react";
import { useAuthContext } from "@context/AuthContext";
import {
  Box,
  Button,
  Toolbar,
  Paper,
  Menu as MuiMenu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

interface MenuItemConfig {
  label: string;
  path?: string;
  allowedRoles?: string[];
  subMenu?: MenuItemConfig[];
}

const menuItems: MenuItemConfig[] = [
  {
    label: "Example",
    path: "/example",
    allowedRoles: ["USER", "ADMIN"], // if empty -> public
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["USER"], // only for 'USER' role
  },
  // more items here...
];

const Menu: React.FC = () => {
  const { isAuthenticated, roles, logout } = useAuthContext();
  const navigate = useNavigate();

  // Checking if user is allowed to see a menu item
  const canSee = (item: MenuItemConfig) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true; // no roles required
    }
    return roles.some((role: string) => item.allowedRoles?.includes(role));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Paper elevation={1} square>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side: top-level menu items */}
        <Box>
          {menuItems.map((item) => {
            if (!isAuthenticated || !canSee(item)) return null;
            return (
              <Button
                key={item.label}
                component={Link}
                to={item.path || "#"}
                sx={{ mr: 2 }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Right side: show Logout if authenticated */}
        {isAuthenticated && (
          <Button color="secondary" variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </Toolbar>
    </Paper>
  );
};

export default Menu;
