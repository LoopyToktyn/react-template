import React, { useState, MouseEvent } from "react";
import {
  Box,
  Toolbar,
  Button,
  Paper,
  Menu as MuiMenu,
  MenuItem,
  alpha,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@context/AuthContext";
import { ExpandMore } from "@mui/icons-material";

// We can define a nested menu structure
interface MenuItemConfig {
  label: string;
  path?: string; // only for leaf items
  allowedRoles?: string[];
  subMenu?: MenuItemConfig[];
}

// Example: nested menu
const menuItems: MenuItemConfig[] = [
  {
    label: "Example",
    path: "/example",
    allowedRoles: [],
  },
  {
    label: "Reports",
    allowedRoles: [],
    subMenu: [
      {
        label: "Monthly",
        path: "/reports/monthly",
      },
      {
        label: "Yearly",
        path: "/reports/yearly",
      },
    ],
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["USER"],
  },
];

interface NestedMenuItemProps {
  item: MenuItemConfig;
  roles: string[];
  level?: number;
  closeMenu?: () => void;
}

const NestedMenuItem: React.FC<NestedMenuItemProps> = ({
  item,
  roles,
  level = 0,
  closeMenu,
}) => {
  const navigate = useNavigate();

  // If subMenu is present, handle open/close for the child menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const canSeeItem = (cfg: MenuItemConfig) => {
    if (!cfg.allowedRoles || cfg.allowedRoles.length === 0) return true;
    return roles.some((role) => cfg.allowedRoles?.includes(role));
  };

  if (!canSeeItem(item)) {
    return null;
  }

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    // Only open subMenu if present
    if (item.subMenu && item.subMenu.length > 0) {
      setAnchorEl(e.currentTarget);
    } else if (item.path) {
      // If leaf item, navigate immediately
      closeMenu?.();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MenuItem onClick={handleOpen} sx={{ pr: item.subMenu ? 4 : 2 }}>
        {item.label}
        {item.subMenu && item.subMenu.length > 0 && (
          <ExpandMore fontSize="small" sx={{ ml: "auto" }} />
        )}
      </MenuItem>

      {/* Child sub-menu */}
      {item.subMenu && (
        <MuiMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          {item.subMenu.map((child, idx) => (
            <NestedMenuItem
              key={idx}
              item={child}
              roles={roles}
              level={level + 1}
              closeMenu={closeMenu}
            />
          ))}
        </MuiMenu>
      )}
    </>
  );
};

const Menu: React.FC = () => {
  const { isAuthenticated, roles, logout } = useAuthContext();
  const navigate = useNavigate();
  const theme = useTheme();

  // We might put the entire top-level menu inside a single MUI "Menu"
  // or we can just show them as Buttons + subMenus.
  // Let's do a simpler approach: a row of top-level items that open subMenus.

  // Paler version of primary color:
  const palePrimary = alpha(theme.palette.primary.main, 0.15);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Paper
      elevation={1}
      square
      sx={{
        backgroundColor: palePrimary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side: top-level items, each of which might have a subMenu */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {menuItems.map((item, idx) => {
            if (!isAuthenticated) {
              // If not logged in, skip items that require roles
              // or show public items only. (This is optional logic)
              return null;
            }
            // We'll treat top-level items as nested items with closeMenu stub
            return <NestedMenuItem key={idx} item={item} roles={roles} />;
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
