import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  IconButton,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const Settings = () => {
  const { user, setUser, accessToken } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  // ✅ Update username
  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      setSnackbar({
        open: true,
        message: "Username cannot be empty",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.patch(
        "/auth/update-username",
        { username },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setUser(res.data.user);
      setSnackbar({
        open: true,
        message: "Username updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update username",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setUploading(true);
      const res = await axios.post("/profile/upload-profile-pic", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
      setSnackbar({
        open: true,
        message: "Profile picture updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to upload profile picture",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>

        {/* Profile Picture Upload */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          mb={3}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={user?.profilePic || ""}
              alt={user?.username || "User"}
              sx={{ width: 80, height: 80 }}
            />
            {uploading && (
              <CircularProgress
                size={80}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  color: "primary.main",
                }}
              />
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            <PhotoCamera />
          </IconButton>
        </Box>

        {/* Username Update */}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateUsername}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update Username"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;