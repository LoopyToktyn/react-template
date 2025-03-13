import React, {
  createContext,
  useMemo,
  useState,
  useContext,
  useEffect,
} from "react";
import { ThemeProvider, Theme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import createTheme from "@root/theme";

interface ColorModeContextType {
  mode: "light" | "dark";
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: "dark",
  toggleColorMode: () => {},
});

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getInitialMode = (): "light" | "dark" => {
    return (localStorage.getItem("color-mode") as "light" | "dark") || "dark";
  };

  const [mode, setMode] = useState<"light" | "dark">(getInitialMode);

  useEffect(() => {
    localStorage.setItem("color-mode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
    }),
    [mode]
  );

  // Build a new theme each time "mode" changes
  const theme: Theme = useMemo(() => {
    return createTheme(mode);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* Provides baseline styles like body margin reset */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
