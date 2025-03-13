import React, { useState, useEffect, FormEvent } from "react";
import { useAuthContext } from "@context/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";

export const DEFAULT_LANDING_PAGE = "/example";

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    // User is already authenticated so redirect them to the default landing page
    return <Navigate to={DEFAULT_LANDING_PAGE} replace />;
  }

  // Load the remembered username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true); // Automatically check the box if we have a saved username
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      navigate(DEFAULT_LANDING_PAGE);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 400, width: "100%", p: 3 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Sign In
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember Me"
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
