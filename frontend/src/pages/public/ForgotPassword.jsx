import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "../../api/axios";
import zxcvbn from "zxcvbn";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [countdown, setCountdown] = useState(0);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingResetPwd, setLoadingResetPwd] = useState(false);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const sendOTP = async () => {
    if (countdown > 0) return;
    setLoadingSendOtp(true);
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      setSnackbar({ open: true, message: res.data.message, severity: "success" });
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || "Failed to send OTP", severity: "error" });
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
      return;
    }
    setLoadingResetPwd(true);
    try {
      const res = await axios.post("/auth/reset-password", { email, otp, newPassword });
      setSnackbar({ open: true, message: res.data.message, severity: "success" });
      setStep(1);
      setEmail(""); setOtp(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to reset password";
      const isOtpError = message.toLowerCase().includes("otp");
      setSnackbar({ open: true, message: isOtpError ? "Invalid OTP. Please try again." : message, severity: "error" });
    } finally {
      setLoadingResetPwd(false);
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const strength = zxcvbn(newPassword);
  const strengthScore = strength.score * 25;
  const strengthLabel = ["Too Weak", "Weak", "Fair", "Good", "Strong"][strength.score];
  const isPasswordMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <Container maxWidth="sm">
      <Card elevation={3} sx={{ mt: 6, p: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>Forgot Password</Typography>

          {step === 1 && (
            <>
              <TextField label="Email Address" fullWidth type="email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
              <Button fullWidth variant="contained" onClick={sendOTP} disabled={!email || countdown > 0 || loadingSendOtp} startIcon={loadingSendOtp && <CircularProgress size={20} />}>
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Send OTP"}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <TextField label="OTP Code" fullWidth margin="normal" value={otp} onChange={e => setOtp(e.target.value)} />
              <TextField
                label="New Password"
                fullWidth margin="normal"
                type={showPassword ? "text" : "password"}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                }}
              />
              {newPassword && (
                <Box mb={1}>
                  <LinearProgress variant="determinate" value={strengthScore} sx={{ height: 8, borderRadius: 5 }} color={strength.score < 2 ? "error" : strength.score < 3 ? "warning" : "success"} />
                  <Typography variant="caption" color="text.secondary" mt={1}>Strength: {strengthLabel}</Typography>
                </Box>
              )}
              <TextField label="Confirm Password" fullWidth margin="normal" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              {!isPasswordMatch && confirmPassword && <Typography variant="caption" color="error">Passwords do not match</Typography>}

              <Box mt={2}>
                <Button variant="contained" fullWidth onClick={resetPassword} disabled={!otp || !newPassword || !confirmPassword || !isPasswordMatch || loadingResetPwd} startIcon={loadingResetPwd && <CircularProgress size={20} />}>
                  Reset Password
                </Button>
              </Box>
              <Button onClick={() => setStep(1)} sx={{ mt: 1 }}>Back</Button>
            </>
          )}

          <Button fullWidth variant="text" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/login")}>Back to Login</Button>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={handleSnackbarClose}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;