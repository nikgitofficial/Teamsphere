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
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../assets/logo.png"; // <-- add your logo here
import leftImage from "../../assets/login-bg1.jpg";    // <-- add your left side image here

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const path = user.role === "admin" ? "/admin" : "/dashboard/home";
      navigate(path);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", form, { withCredentials: true });
      const { accessToken, refreshToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const me = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      setUser(me.data);
      localStorage.setItem("user", JSON.stringify(me.data));

      setSnack({
        open: true,
        message: "✅ Login successful! Redirecting...",
        severity: "success",
      });

      const path = me.data.role === "admin" ? "/admin" : "/dashboard/home";
      setTimeout(() => navigate(path), 1200);
    } catch (err) {
      const msg = err.response?.data?.msg || "❌ Login failed. Please try again.";
      setError(msg);
      setSnack({ open: true, message: msg, severity: "error" });
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          minHeight: 500,
        }}
      >
        {/* Left side image */}
            <Box
  sx={{
    flex: 1,
    backgroundImage: `url(${leftImage})`, // now using your new image
    backgroundSize: "cover",
    backgroundPosition: "center",
    transform: "perspective(0px) rotateY(0deg)", // keeps the 3D tilt
  }}
/>


        {/* Right side login form */}
        <Box sx={{ flex: 1, p: 6, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Logo */}
          <Box display="flex" justifyContent="center" mb={3}>
            <img src={logo} alt="TeamSphere Logo" style={{ width: 120, height: "auto" }} />
          </Box>

          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Welcome Back 👋
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Sign in to continue
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
              autoComplete="email"
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              autoComplete="current-password"
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
              sx={{ mt: 3, py: 1.4, fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : "Login"}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: "none", color: "#1976d2" }}>
              Forgot your password?
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            <Link to="/" style={{ textDecoration: "none", color: "#1976d2" }}>
              Home
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Don’t have an account?{" "}
            <Link to="/register" style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500 }}>
              Register here
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Are you an employee?{" "}
            <Link to="/employee-login" style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500 }}>
              Employee Login
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
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
