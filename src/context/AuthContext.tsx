// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockAuthService } from "@api/mock/mockAuthService";
import { authService as realAuthService } from "@api/authService";
import { useLoading } from "./LoadingContext";

const isMock = window._env_?.ENABLE_AUTH === "false";
const authService: AuthService = isMock ? mockAuthService : realAuthService;

interface AuthState {
  isAuthenticated: boolean;
  roles: string[];
  username?: string;
}

interface AuthContextType extends AuthState {
  authEnabled: boolean;
  toggleAuth: () => void;
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
  authEnabled: window._env_?.ENABLE_AUTH !== "false",
  toggleAuth: () => {},
  login: async () => {},
  logout: () => {},
  invalidateAuth: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authEnabled, setAuthEnabled] = useState(
    window._env_?.ENABLE_AUTH !== "false"
  );
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

  const toggleAuth = () => {
    setAuthEnabled((prev) => !prev);
  };

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

  // On mount (or when authEnabled becomes true) trigger a one-time refetch.
  useEffect(() => {
    if (authEnabled) {
      refetchRoles();
    }
  }, [authEnabled, refetchRoles]);

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
    authEnabled,
    toggleAuth,
    login,
    logout,
    invalidateAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
