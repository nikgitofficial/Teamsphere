import { useState, useContext, useEffect } from "react";
import {
  Container, Box, TextField, Button, Typography,
  Paper, Divider, Alert, Snackbar, CircularProgress
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", form, { withCredentials: true });
      const { accessToken, refreshToken } = res.data;

      // Save tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Get user info
      const me = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      setUser(me.data);
      localStorage.setItem("user", JSON.stringify(me.data));

      setSnackbarOpen(true);

      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Login to continue
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ textDecoration: "none" }}>
            Register here
          </Link>
        </Typography>

      
        
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        message="Login successful!"
      />
    </Container>
  );
};

export default Login;
