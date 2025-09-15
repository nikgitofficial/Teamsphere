import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [passwordValid, setPasswordValid] = useState(false); // ✅ for live validation
  const [emailError, setEmailError] = useState(""); // ✅ new state for email error

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // ✅ Clear email error when user edits email
    if (name === "email") {
      setEmailError("");
    }

    // ✅ Live password validation
    if (name === "password") {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^]).{8,}$/;
      setPasswordValid(regex.test(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      setSnack({
        open: true,
        message:
          "❌ Password must be at least 8 characters, include letters, numbers, and special characters.",
        severity: "error",
      });
      return;
    }

    try {
      await axios.post("/auth/register", form);
      setSnack({
        open: true,
        message: "✅ Registration successful! Redirecting...",
        severity: "success",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response?.data?.msg === "Email already in use") {
        setEmailError("❌ Email already exists. Try another one."); // ✅ show below email
      } else {
        setSnack({
          open: true,
          message: "❌ Registration failed. Try again.",
          severity: "error",
        });
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
          Create an Account
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!emailError} // ✅ MUI TextField error
              helperText={emailError} // ✅ show error below field
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />
            {/* ✅ Live password validation feedback */}
            {form.password && (
              <Typography
                variant="caption"
                color={passwordValid ? "green" : "error"}
              >
                {passwordValid
                  ? "✅ Strong password"
                  : "❌ Password must be 8+ chars, include letters, numbers, and special characters."}
              </Typography>
            )}

            <Button type="submit" variant="contained" size="large" fullWidth>
              Register
            </Button>

            <Typography variant="body2" textAlign="center" mt={1}>
              Already have an account?{" "}
              <span
                style={{ color: "#1976d2", cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </Typography>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;