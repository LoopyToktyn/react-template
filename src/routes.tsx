import React, { JSX, lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "@pages/Login";
import NotFound from "@pages/NotFound";
import { useAuth } from "@hooks/useAuth";
import Dashboard from "@pages/ExampleMaterialThemedPage";
import ExampleMaterialThemedPage from "@pages/ExampleMaterialThemedPage";

// Example lazy loading if we had more pages
// const LazyLoadedPage = lazy(() => import("@pages/LazyLoadedPage"));

export function isAuthenticated() {
  // Example logic for whether user is authenticated
  const token = localStorage.getItem("token");
  return token ? true : false;
}

// Example role-based check
export function hasRole(requiredRoles: string[]) {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  return requiredRoles.some((r) => roles.includes(r));
}

const RoutesComponent = () => {
  const { authEnabled } = useAuth();

  const PrivateRoute = ({
    children,
    requiredRoles,
  }: {
    children: JSX.Element;
    requiredRoles?: string[];
  }) => {
    if (!authEnabled) {
      // If auth is disabled in .env, just render
      return children;
    }

    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/example" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/example" element={<ExampleMaterialThemedPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRoles={["USER"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Example of lazy loaded page
        <Route
          path="/lazy"
          element={
            <PrivateRoute>
              <LazyLoadedPage />
            </PrivateRoute>
          }
        />
        */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
