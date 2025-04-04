import React from "react";
import LoginPage from "@root/pages/LoginPage";
import NotFoundPage from "@root/pages/NotFoundPage";
import ExampleMaterialThemedPage from "@pages/ExampleMaterialThemedPage";
import ExampleFormPage from "@root/pages/ExampleFormPage";
import ExampleSearchPage from "@root/pages/ExampleSearchPage";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const routes: AppRoute[] = [
  {
    path: "/login",
    element: <LoginPage />,
    requireAuth: false,
  },
  {
    path: "/example",
    element: <ExampleMaterialThemedPage />,
    requireAuth: true,
  },
  {
    path: "/form",
    element: <ExampleFormPage />,
    requireAuth: true,
  },
  {
    path: "/search",
    element: <ExampleSearchPage />,
    requireAuth: true,
  },
  {
    // This is the fallback route for 404
    path: "*",
    element: <NotFoundPage />,
    requireAuth: false,
  },
];
