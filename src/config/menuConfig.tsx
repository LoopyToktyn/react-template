import { MenuItemConfig } from "@root/types";

export const menuItems: MenuItemConfig[] = [
  {
    label: "Example",
    path: "/example",
    allowedRoles: [],
  },
  {
    label: "Form Example",
    path: "/form",
    allowedRoles: [],
  },
  {
    label: "Reports",
    allowedRoles: [],
    subMenu: [
      {
        label: "Monthly",
        path: "/reports/monthly",
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
