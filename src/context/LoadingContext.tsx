// src/context/LoadingContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

interface LoadingContextProps {
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

// Default values (not strictly necessary, but helps for intellisense)
const LoadingContext = createContext<LoadingContextProps>({
  isGlobalLoading: false,
  setGlobalLoading: () => {},
});

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const setGlobalLoading = (loading: boolean) => {
    setIsGlobalLoading(loading);
  };

  return (
    <LoadingContext.Provider value={{ isGlobalLoading, setGlobalLoading }}>
      {children}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 9999 }}
        open={isGlobalLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
