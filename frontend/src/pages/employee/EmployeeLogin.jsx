import { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
  const [form, setForm] = useState({ email: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/employee-auth/login", form);

      // ✅ Save employee data in localStorage
      localStorage.setItem("employee", JSON.stringify(data));

      setSnackbar({ open: true, msg: "Login successful!", severity: "success" });

      navigate("/employee-data");
    } catch (err) {
      setSnackbar({
        open: true,
        msg: err.response?.data?.msg || "Login failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
      <Typography variant="h4" mb={3}>Employee Login</Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: 300 }}
      >
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="PIN"
          type="password"
          required
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeLogin;
