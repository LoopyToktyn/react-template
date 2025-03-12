// src/routes.tsx
import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "@pages/Login";
import NotFound from "@pages/NotFound";
import { useAuthContext } from "@context/AuthContext";
import ExampleMaterialThemedPage from "@pages/ExampleMaterialThemedPage";
import Dashboard from "@pages/ExampleMaterialThemedPage";

// const LazyLoadedPage = lazy(() => import("@pages/LazyLoadedPage"));

const RoutesComponent = () => {
  const { authEnabled, isAuthenticated, roles } = useAuthContext();

  // Helper to see if user has at least one required role
  const hasAnyRole = (requiredRoles: string[]) => {
    if (!roles || roles.length === 0) return false;
    return requiredRoles.some((r) => roles.includes(r));
  };

  const PrivateRoute = ({
    children,
    requiredRoles = [],
  }: {
    children: JSX.Element;
    requiredRoles?: string[];
  }) => {
    if (!authEnabled) {
      // If auth is disabled via .env, just render
      return children;
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/example" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/example"
          element={
            <PrivateRoute requiredRoles={["USER"]}>
              <ExampleMaterialThemedPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRoles={["USER"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Example lazy load:
        <Route
          path="/lazy"
          element={
            <PrivateRoute>
              <LazyLoadedPage />
            </PrivateRoute>
          }
        />*/}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
