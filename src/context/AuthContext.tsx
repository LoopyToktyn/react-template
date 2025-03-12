// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useLoading } from "./LoadingContext";

interface AuthState {
  isAuthenticated: boolean;
  roles: string[];
  username?: string; // or any user info you want to store
}

interface AuthContextType extends AuthState {
  authEnabled: boolean; // from your .env setting
  toggleAuth: () => void; // toggles the feature, not the user’s session
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  roles: [],
  authEnabled: process.env.REACT_APP_ENABLE_AUTH !== "false",
  toggleAuth: () => {},
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authEnabled, setAuthEnabled] = useState(
    process.env.REACT_APP_ENABLE_AUTH !== "false"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string>();
  const { setGlobalLoading } = useLoading();

  // Toggle the “feature” of auth (not user’s status)
  const toggleAuth = () => {
    setAuthEnabled((prev) => !prev);
  };

  // Pretend login. This calls a fake endpoint, or you can adapt to real
  const login = async (user: string, pass: string) => {
    setGlobalLoading(true);
    try {
      // Fake call: e.g. POST /api/login
      // This should set a session cookie if success
      await new Promise((r) => setTimeout(r, 700)); // short delay for test
      // Here, you might do: const response = await axios.post("/api/login", { user, pass });

      // We store user info if success
      setIsAuthenticated(true);
      setUsername(user);

      // Then fetch roles
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    } finally {
      setGlobalLoading(false);
    }
  };

  // On real apps, you'd handle errors with try/catch, toast, etc.
  const fetchRoles = async (): Promise<string[]> => {
    // Simulate an API that returns user roles if the cookie is valid
    const response = await axios.get("/api/roles", { withCredentials: true });
    // e.g. response.data might be { roles: ["USER", "ADMIN"] }
    return response.data.roles;
  };

  const logout = () => {
    // e.g. call /api/logout to clear session cookies
    axios.post("/api/logout", {}, { withCredentials: true }).catch(() => {});
    setIsAuthenticated(false);
    setRoles([]);
    setUsername(undefined);
  };

  // On first load, check if cookie is valid by calling /getRoles
  useEffect(() => {
    const trySessionRecovery = async () => {
      setGlobalLoading(true);
      try {
        const userRoles = await fetchRoles();
        setRoles(userRoles);
        setIsAuthenticated(true);
      } catch (err) {
        // If it fails, user remains not authenticated
        setIsAuthenticated(false);
        setRoles([]);
      } finally {
        setGlobalLoading(false);
      }
    };

    if (authEnabled) {
      trySessionRecovery();
    }
  }, [authEnabled, setGlobalLoading]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    roles,
    username,
    authEnabled,
    toggleAuth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
