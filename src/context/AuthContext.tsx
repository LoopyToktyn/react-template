// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { services } from "@config/servicesConfig";
import { useLoading } from "./LoadingContext";

const authService: AuthService = services.auth;

interface AuthState {
  isAuthenticated: boolean;
  roles: string[];
  username?: string;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  invalidateAuth: () => void;
}

export interface AuthService {
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  fetchRoles(): Promise<string[]>;
}

const AUTH_STORAGE_KEY = "authState";

const getStoredAuth = (): AuthState => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : { isAuthenticated: false, roles: [] };
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  roles: [],
  login: async () => {},
  logout: () => {},
  invalidateAuth: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    getStoredAuth().isAuthenticated
  );
  const [roles, setRoles] = useState<string[]>(getStoredAuth().roles);
  const [username, setUsername] = useState<string | undefined>();
  const { setGlobalLoading } = useLoading();
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated, roles })
    );
  }, [isAuthenticated, roles]);

  const invalidateAuth = () => {
    setIsAuthenticated(false);
    setRoles([]);
    setUsername(undefined);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    queryClient.removeQueries({ queryKey: ["fetchRoles"] });
  };

  // Define a stable queryFn; note that we no longer auto-run it.
  const fetchRolesQuery = React.useCallback(async () => {
    setGlobalLoading(true);
    try {
      const userRoles = await authService.fetchRoles();
      setRoles(userRoles);
      setIsAuthenticated(true);
      return userRoles;
    } catch (err) {
      invalidateAuth();
      throw err;
    } finally {
      setGlobalLoading(false);
    }
  }, [setGlobalLoading, authService]); // ensure these dependencies are stable

  // Disable automatic fetching by setting enabled:false.
  const { refetch: refetchRoles } = useQuery({
    queryKey: ["fetchRoles"],
    queryFn: fetchRolesQuery,
    enabled: false, // manual control
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = async (user: string, pass: string) => {
    setGlobalLoading(true);
    try {
      await authService.login(user, pass);
      setUsername(user);
      await refetchRoles();
    } finally {
      setGlobalLoading(false);
    }
  };

  const logout = () => {
    authService.logout().finally(() => {
      invalidateAuth();
    });
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    roles,
    username,
    login,
    logout,
    invalidateAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
