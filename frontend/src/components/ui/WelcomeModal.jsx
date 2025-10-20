import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const WelcomeModal = ({ open, handleClose }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Welcome!</DialogTitle>
      <DialogContent>
        <Typography>
          Welcome to TeamSphere! Explore the platform to manage your employees, payroll, and attendance seamlessly.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeModal;
