import React from "react";
import LoginPage from "@root/pages/LoginPage";
import NotFoundPage from "@root/pages/NotFoundPage";
import ExampleMaterialThemedPage from "@pages/ExampleMaterialThemedPage";
import ExampleForm from "@pages/ExampleForm";
import { RouteObject } from "react-router-dom";

// Basic interface. Add fields as needed.
export interface AppRoute {
  path: string;
  element: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

// For simplicity, all routes use the same layout now.
// We'll handle the 404 in a special catch-all below.
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
    element: <ExampleForm />,
    requireAuth: true,
  },
  {
    // This is the fallback route for 404
    path: "*",
    element: <NotFoundPage />,
    requireAuth: false,
  },
];
