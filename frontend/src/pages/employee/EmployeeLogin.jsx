import { useState, useEffect } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import employeeAxios from "../../api/employeeAxios";

const EmployeeLogin = () => {
  const [form, setForm] = useState({ email: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showPincode, setShowPincode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmployee = localStorage.getItem("employee");
    if (storedEmployee) navigate("/employee-dashboard/home");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await employeeAxios.post("/employee-auth/login", form);
      localStorage.setItem("employee", JSON.stringify(res.data));

      setSnack({
        open: true,
        message: "✅ Login successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => navigate("/employee-dashboard/home"), 1500);
    } catch (err) {
      setSnack({
        open: true,
        message: "❌ Invalid credentials. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
          Employee Portal
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Login with your email and pincode
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleLogin} noValidate>
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
            name="pincode"
            label="Pincode"
            type={showPincode ? "text" : "password"}
            value={form.pincode}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPincode((prev) => !prev)}
                    edge="end"
                  >
                    {showPincode ? <VisibilityOff /> : <Visibility />}
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

        {/* Back to Main Login */}
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Back to{" "}
          <Link
            to="/login"
            style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500 }}
          >
            Main Login
          </Link>
        </Typography>
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

export default EmployeeLogin;
