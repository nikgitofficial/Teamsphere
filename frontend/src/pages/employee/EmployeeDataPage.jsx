import { Box, Button, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeDataPage = () => {
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("employee");
    setSnackbar({ open: true, msg: "Logged out successfully", severity: "success" });
    setTimeout(() => navigate("/employee-login"), 1000);
  };

  return (
    <Box p={3} maxWidth={600} mx="auto" display="flex" justifyContent="flex-end">
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Logout
      </Button>

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

export default EmployeeDataPage;
