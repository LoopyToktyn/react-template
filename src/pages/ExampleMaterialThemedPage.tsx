import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Toolbar,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@api/axiosInstance";

// Function to fetch a random post (supports request cancellation)
const fetchRandomPost = async ({ signal }: { signal?: AbortSignal }) => {
  const randomId = Math.floor(Math.random() * 100) + 1;
  const { data } = await axiosInstance.get(
    `https://jsonplaceholder.typicode.com/possts/${randomId}`,
    { signal }
  );
  return data;
};

const ExampleMaterialThemedPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // React Query setup with the latest best practices
  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: ["randomPost"],
    queryFn: fetchRandomPost,
    enabled: false, // Manual fetching only
    refetchOnWindowFocus: false,
  });

  return (
    <Box className="fancy-page">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Fancy Material-UI Page
          </Typography>
          <Button color="inherit" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: theme.spacing(4) }}>
        <Paper elevation={3} sx={{ p: theme.spacing(3), mb: theme.spacing(4) }}>
          <Typography variant="h4" gutterBottom>
            Welcome to the Fancy Page!
          </Typography>
          <Typography variant="body1" gutterBottom>
            This page demonstrates how to integrate Material UI theming with
            global CSS styles.
          </Typography>
          <Typography variant="body1" gutterBottom>
            The current primary color is{" "}
            <strong style={{ color: theme.palette.primary.main }}>
              {theme.palette.primary.main}
            </strong>{" "}
            and the secondary color is{" "}
            <strong style={{ color: theme.palette.secondary.main }}>
              {theme.palette.secondary.main}
            </strong>
            .
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.secondary.main,
              color: "#fff",
              "&:hover": { backgroundColor: theme.palette.secondary.dark },
            }}
          >
            Get Started
          </Button>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: theme.spacing(3) }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: theme.palette.primary.main }}
              >
                Feature One (React Query Example)
              </Typography>
              <Typography variant="body2">
                Click the button below to load a random post from
                JSONPlaceholder using React Query.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: theme.spacing(2) }}
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Fetch Random Post"}
              </Button>

              {/* Display Loading State */}
              {isFetching && <CircularProgress sx={{ mt: 2 }} />}

              {/* Display Error Message */}
              {isError && (
                <Typography color="error" sx={{ mt: 2 }}>
                  Error:{" "}
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong"}
                </Typography>
              )}

              {/* Display Data */}
              {data && (
                <Paper
                  elevation={2}
                  sx={{ mt: theme.spacing(2), p: theme.spacing(2) }}
                >
                  <Typography variant="h6">{data.title}</Typography>
                  <Typography variant="body2">{data.body}</Typography>
                </Paper>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: theme.spacing(3) }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: theme.palette.secondary.main }}
              >
                Feature Two
              </Typography>
              <Typography variant="body2">
                Global styles help maintain consistency throughout the app by
                applying design patterns across components.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          py: theme.spacing(2),
          mt: theme.spacing(4),
          backgroundColor: theme.palette.grey[200],
          textAlign: "center",
        }}
      >
        <Typography variant="caption">
          © 2025 Fancy Material-UI Page. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default ExampleMaterialThemedPage;
