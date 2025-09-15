import { useState } from "react";
import { Container, Paper, Typography, TextField, Button } from "@mui/material";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset password for:", email);
    // Here you can call your backend API for password reset
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 10, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Reset Password
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
