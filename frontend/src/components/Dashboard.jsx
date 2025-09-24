// frontend/src/pages/Dashboard.jsx
import React, { useContext, useRef, useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
  Snackbar,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Home,
  VideoLibrary,
  PermMedia,
  Image,
  Settings,
  Search,
  Logout,
  Brightness4,
  Brightness7,
  Menu,
  Assignment,
  MonetizationOn,
  People,
  AccessTime,
  Comment,
} from "@mui/icons-material";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const drawerWidth = 240;

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, setUser } = useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const fileInputRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, profilePic: preview }));

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setLoading(true);
      const res = await axios.post("/profile/upload-profile-pic", formData);
      setUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
      setSnackbar({ open: true, message: "Profile picture updated!" });
    } catch (error) {
      console.error("Upload failed", error);
      setSnackbar({ open: true, message: "Upload failed!" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout request failed:", err.message);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box>
        {/* Profile Section */}
        <Box sx={{ textAlign: "center", mb: 3, px: 2 }}>
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <IconButton onClick={() => fileInputRef.current.click()}>
              <Avatar
                src={user?.profilePic || ""}
                alt="User"
                sx={{ width: 72, height: 72, mx: "auto" }}
              />
              {loading && (
                <CircularProgress
                  size={72}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "primary.main",
                  }}
                />
              )}
            </IconButton>
          </Box>
          <Typography
  variant="subtitle1"
  sx={{ fontWeight: "bold", mt: 1, color: "white" }}
>
  {user?.username || "User"}
</Typography>

<Typography
  variant="body2"
  sx={{ color: "white" }}
>
  {user?.email}
</Typography>

        </Box>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Search */}
       <Box sx={{ px: 2, mb: 2 }}>
  <TextField
    fullWidth
    placeholder="Search here"
    size="small"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ color: "white" }} />
        </InputAdornment>
      ),
      sx: {
        color: "white", // text color
        "& .MuiInputBase-input::placeholder": {
          color: "white", // placeholder color
          opacity: 1,
        },
      },
    }}
    variant="outlined" // optional, for visibility on dark background
  />
</Box>

        {/* Navigation */}
        <List
          sx={{
    "& .MuiListItemButton-root:hover": {
      bgcolor: "#FF8C00",
      color: "#FF8C00",
      "& .MuiListItemIcon-root": {
        color: "black",
      },
    },
  }}>
          <ListItemButton
            component={Link}
            to="/dashboard/home"
            selected={location.pathname === "/dashboard/home"}
          >
            <ListItemIcon>
              <Home sx={{ color: "orange" }} />
            </ListItemIcon>
            <ListItemText primary="Home" sx={{ color: "white" }} />
          </ListItemButton>

          <ListItemButton
  component={Link}
  to="/dashboard/employees"
  selected={location.pathname === "/dashboard/employees"}
>
  <ListItemIcon>
    <People sx={{ color: "green" }} />
  </ListItemIcon>
  <ListItemText primary="Employees" sx={{ color: "white" }} />
</ListItemButton>

<ListItemButton
  component={Link}
  to="/dashboard/attendance-remarks"
  selected={location.pathname === "/dashboard/attendance-remarks"}
>
  <ListItemIcon>
    <Comment sx={{ color: "#f4b400" }} /> {/* Yellow-gold for notes */}
  </ListItemIcon>
  <ListItemText 
    primary="Attendance Remarks" 
    sx={{ color: "white", fontWeight: "bold" }} 
  />
</ListItemButton>


          <ListItemButton
  component={Link}
  to="/dashboard/attendance-overview"
  selected={location.pathname === "/dashboard/attendance-overview"}
>
  <ListItemIcon>
    <AccessTime sx={{ color: "#AFEEEE" }} />
  </ListItemIcon>
  <ListItemText primary="Attendance Overview" sx={{ color: "white" }} />
</ListItemButton>

          <ListItemButton
            component="a"
            href="/attendance"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon>
              <PermMedia sx={{ color: "#4682B4" }} />
            </ListItemIcon>
            <ListItemText primary="Attendance" sx={{ color: "white" }} />
          </ListItemButton>

          <ListItemButton
  component={Link}
  to="/dashboard/payroll"
  selected={location.pathname === "/dashboard/payroll"}
>
  <ListItemIcon>
    <MonetizationOn sx={{ color: "#4caf50" }} /> {/* Green for money */}
  </ListItemIcon>
  <ListItemText primary="Payroll Overview" sx={{ color: "white" }} />
</ListItemButton>


            

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

          <ListItemButton
            component={Link}
            to="/dashboard/settings"
            selected={location.pathname === "/dashboard/settings"}
          >
            <ListItemIcon>
              <Settings sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Settings" sx={{ color: "white" }} />
          </ListItemButton>
        
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout sx={{ color: "red" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: "white" }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            boxShadow: 1,
            bgcolor: "#000080", // AppBar black
            color: "white",
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <Menu />
              </IconButton>
            )}
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>

            <IconButton
              color="inherit"
              onClick={() => setDarkMode((prev) => !prev)}
              sx={{ mr: 2 }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <Box sx={{ position: "relative" }}>
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <IconButton onClick={() => fileInputRef.current.click()}>
                <Avatar
                  src={user?.profilePic || ""}
                  alt="User"
                  sx={{ width: 36, height: 36 }}
                />
                {loading && (
                  <CircularProgress
                    size={36}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      color: "primary.main",
                    }}
                  />
                )}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1, mt: 8 }}>
          {/* Drawer */}
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                pt: 2,
                bgcolor: "#000080", // Drawer black
                color: "white",
              },
            }}
          >
            {drawerContent}
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              minHeight: "100vh",
            }}
          >
            <Outlet />
          </Box>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            textAlign: "center",
            py: 2,
            mt: "auto",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Niko MP. All rights reserved.
          </Typography>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          onClose={() => setSnackbar({ open: false, message: "" })}
          autoHideDuration={3000}
          message={snackbar.message}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
