import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { useAuthContext } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const handleBack = () => {
    if (isAuthenticated) {
      navigate("/example");
    } else {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Oops! The page you’re looking for does not exist.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleBack}
        sx={{ mt: 2 }}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default NotFoundPage;
