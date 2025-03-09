import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  authEnabled: boolean;
  toggleAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authEnabled: process.env.REACT_APP_ENABLE_AUTH !== "false", // Flip the logic
  toggleAuth: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authEnabled, setAuthEnabled] = useState(
    process.env.REACT_APP_ENABLE_AUTH !== "false" // Flip the logic
  );

  useEffect(() => {
    setAuthEnabled(process.env.REACT_APP_ENABLE_AUTH !== "false");
  }, []);

  const toggleAuth = () => {
    setAuthEnabled((prev) => !prev);
  };

  return (
    <AuthContext.Provider value={{ authEnabled, toggleAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
