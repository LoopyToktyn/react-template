import { Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AppRoute, routes } from "@config/routeConfig";
import { useAuthContext } from "@context/AuthContext";

const RoutesComponent = () => {
  const { isAuthenticated, roles } = useAuthContext();

  const hasAnyRole = (requiredRoles: string[]) => {
    if (!roles || roles.length === 0) return false;
    return requiredRoles.some((role) => roles.includes(role));
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Redirect base path to default landing page */}
        <Route path="/" element={<Navigate to="/search" replace />} />

        {/* We can route config-based. For each route in the array: */}
        {routes.map(
          (
            { path, element, requireAuth, allowedRoles }: AppRoute,
            index: any
          ) => {
            return (
              <Route
                key={index}
                path={path}
                element={
                  <>
                    {/* If route requires auth, block if not authorized */}
                    {!requireAuth ? (
                      element
                    ) : !isAuthenticated ? (
                      <Navigate to="/login" replace />
                    ) : allowedRoles &&
                      allowedRoles.length > 0 &&
                      !hasAnyRole(allowedRoles) ? (
                      <Navigate to="/login" replace />
                    ) : (
                      element
                    )}
                  </>
                }
              />
            );
          }
        )}
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
