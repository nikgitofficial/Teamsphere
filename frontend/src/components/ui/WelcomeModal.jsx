import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slide,
} from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const WelcomeModal = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 4,
          p: 3,
          background: "linear-gradient(135deg, #0b593f, #11784f)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: 700, fontSize: { xs: "1.5rem", md: "2rem" } }}>
        Welcome to TeamSphere!
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            textAlign: "center",
            fontSize: { xs: "1rem", md: "1.1rem" },
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Explore the platform to manage your employees, payroll, and attendance seamlessly.
        </Typography>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              bgcolor: "#f9a825",
              color: "#000",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 3,
              "&:hover": { bgcolor: "#ffb300" },
            }}
          >
            Get Started
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
