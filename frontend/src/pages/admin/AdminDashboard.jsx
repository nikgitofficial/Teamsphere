import React, { useState, useMemo, useEffect, useContext } from "react";
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
  Avatar,
  Divider,
  IconButton,
  CssBaseline,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Home,
  Logout,
  Search,
  Brightness4,
  Brightness7,
  Menu,
} from "@mui/icons-material";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthContext } from "../../context/AuthContext";

const drawerWidth = 240;

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? "dark" : "light", drawerText: { main: "#FF8C00" } },
      }),
    [darkMode]
  );

  const [admin, setAdmin] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("user"));
    if (storedAdmin) setAdmin(storedAdmin);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawerLinks = [
    { label: "Home", icon: <Home />, path: "/admin/home", color: "orange" },
    // add other links as needed
  ];

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ textAlign: "center", mb: 3, px: 2 }}>
        {!admin ? (
          <Typography sx={{ color: "white", mt: 2 }}>Loading...</Typography>
        ) : (
          <>
            <Avatar
              src={admin?.profilePic || ""}
              sx={{ width: 72, height: 72, mx: "auto" }}
            >
              {admin?.fullName?.[0]}
            </Avatar>
            <Typography sx={{ color: "white", mt: 1, fontWeight: "bold" }}>
              {admin?.fullName}
            </Typography>
            <Typography sx={{ color: "white", fontSize: "0.85rem" }}>
              {admin?.email}
            </Typography>
          </>
        )}
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
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
            sx: { color: "white", "& .MuiInputBase-input::placeholder": { color: "white" } },
          }}
        />
      </Box>
      <List>
        {drawerLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.label}
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                color: isActive ? item.color : "#fff",
                mb: 1,
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#B8860B", color: item.color },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? item.color : "white" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{ color: isActive ? item.color : "#fff", fontWeight: isActive ? "bold" : "normal" }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2, mt: "auto" }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout sx={{ color: "red" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: theme.palette.drawerText.main }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: "#000",
            borderBottom: "2px solid #FF8C00",
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <Menu />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Admin Dashboard</Typography>
            <IconButton color="inherit" onClick={() => setDarkMode((prev) => !prev)}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth, bgcolor: "#000", color: "white", borderRight: "2px solid #FF8C00" },
          }}
        >
          {drawerContent}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
