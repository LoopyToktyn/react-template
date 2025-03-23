import React, { useState, useEffect, MouseEvent } from "react";
import {
  Box,
  Toolbar,
  Button,
  Paper,
  Menu as MuiMenu,
  MenuItem,
  ClickAwayListener,
  alpha,
  useTheme,
  PopoverOrigin,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@context/AuthContext";
import { ExpandMore } from "@mui/icons-material";
import { menuItems } from "@config/menuConfig";

// MENU TYPES
export interface MenuItemConfig {
  label: string;
  path?: string; // only for leaf items
  allowedRoles?: string[];
  subMenu?: MenuItemConfig[];
}

export interface NestedMenuItemProps {
  item: MenuItemConfig;
  roles: string[];
  level?: number;
  closeAllMenus: () => void;
  closeSignal: number;
}
// Define the nested menu structure
const NestedMenuItem: React.FC<NestedMenuItemProps> = ({
  item,
  roles,
  level = 0,
  closeAllMenus,
  closeSignal,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Close the submenu if a close signal is received
  useEffect(() => {
    setAnchorEl(null);
  }, [closeSignal]);

  // Check if the user is allowed to see the item
  const canSeeItem = (cfg: MenuItemConfig) => {
    if (!cfg.allowedRoles || cfg.allowedRoles.length === 0) return true;
    return roles.some((role) => cfg.allowedRoles?.includes(role));
  };

  if (!canSeeItem(item)) {
    return null;
  }

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    if (item.subMenu && item.subMenu.length > 0) {
      setAnchorEl(e.currentTarget);
    } else if (item.path) {
      // For leaf items, navigate then close all menus
      navigate(item.path);
      closeAllMenus();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Positioning: top-level items drop down; nested submenus open to the right.
  const menuAnchorOrigin: PopoverOrigin =
    level === 0
      ? { vertical: "bottom", horizontal: "left" }
      : { vertical: "top", horizontal: "right" };

  const menuTransformOrigin: PopoverOrigin = {
    vertical: "top",
    horizontal: "left",
  };

  // Consistent styling for menu items
  const menuItemStyle = {
    pr: item.subMenu ? 4 : 0,
    width: 200,
    whiteSpace: "normal",
    wordWrap: "break-word",
    border: "1px solid",
    borderColor: "divider",
    boxSizing: "border-box",
  };

  return (
    <>
      <MenuItem onClick={handleOpen} sx={menuItemStyle}>
        {item.label}
        {item.subMenu && item.subMenu.length > 0 && (
          <ExpandMore fontSize="small" sx={{ ml: "auto" }} />
        )}
      </MenuItem>

      {item.subMenu && (
        <MuiMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={menuAnchorOrigin}
          transformOrigin={menuTransformOrigin}
          disablePortal
          PaperProps={{
            sx: {
              width: 200,
              border: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {item.subMenu.map((child, idx) => (
            <NestedMenuItem
              key={idx}
              item={child}
              roles={roles}
              level={level + 1}
              closeAllMenus={closeAllMenus}
              closeSignal={closeSignal}
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
  const palePrimary = alpha(theme.palette.primary.main, 0.15);

  // A signal counter to tell all menu items to close.
  const [closeSignal, setCloseSignal] = useState(0);
  const closeAllMenus = () => setCloseSignal((prev) => prev + 1);

  const handleLogout = () => {
    logout();
    navigate("/login");
    closeAllMenus();
  };

  return (
    <ClickAwayListener onClickAway={closeAllMenus}>
      <Paper
        elevation={1}
        square
        sx={{
          backgroundColor: palePrimary,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left side: top-level menu items */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {menuItems.map((item, idx) => {
              if (!isAuthenticated) {
                return null;
              }
              return (
                <NestedMenuItem
                  key={idx}
                  item={item}
                  roles={roles}
                  closeAllMenus={closeAllMenus}
                  closeSignal={closeSignal}
                />
              );
            })}
          </Box>

          {/* Right side: Logout button */}
          {isAuthenticated && (
            <Button
              color="secondary"
              variant="contained"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </Paper>
    </ClickAwayListener>
  );
};

export default Menu;
