import { useState, useContext, useEffect } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle state

  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // ✅ Redirect if already logged in
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

      // ✅ Save tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // ✅ Get user info
      const me = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      setUser(me.data);
      localStorage.setItem("user", JSON.stringify(me.data));

      // ✅ Show success snackbar
      setSnack({
        open: true,
        message: "✅ Login successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const msg = err.response?.data?.msg || "❌ Login failed. Try again.";
      setError(msg);

      // ✅ Show error snackbar
      setSnack({
        open: true,
        message: msg,
        severity: "error",
      });

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
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
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
            type={showPassword ? "text" : "password"} // ✅ Toggle type
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
          <Link to="/register" style={{ textDecoration: "none", color: "#1976d2" }}>
            Register here
          </Link>
        </Typography>
      </Paper>

      {/* ✅ Snackbar with severity (like Register page) */}
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

export default Login;
