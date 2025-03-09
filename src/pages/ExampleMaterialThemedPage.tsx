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
} from "@mui/material";

const ExampleMaterialThemedPage: React.FC = () => {
  const theme = useTheme();

  return (
    // The "fancy-page" class comes from our global CSS (see below)
    <Box className="fancy-page">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Fancy Material-UI Page
          </Typography>
          <Button color="inherit">Login</Button>
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
                Feature One
              </Typography>
              <Typography variant="body2">
                Explore the amazing features built with Material UI. Enjoy
                responsive design, theme customizations, and more.
              </Typography>
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
