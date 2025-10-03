import React, { useRef, useState, useMemo, useEffect } from "react";
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
  InputAdornment,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
  Snackbar,
  CssBaseline,
  useTheme,
  useMediaQuery,
  TextField,
} from "@mui/material";
import {
  Home,
  Settings,
  Search,
  Logout,
  Brightness4,
  Brightness7,
  Menu,
  MonetizationOn,
  AccessTime,
  Comment,
  People,
} from "@mui/icons-material";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import employeeAxios from "../../api/employeeAxios";

const drawerWidth = 240;

const EmployeeDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          drawerText: {
            main: "#FF8C00",
          },
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

  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const storedEmployee = JSON.parse(localStorage.getItem("employee"));
        if (!storedEmployee?._id) return;

        const res = await employeeAxios.get(
          `/employee-auth/me/${storedEmployee._id}`
        );
        setEmployee(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEmployee();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");
    navigate("/employee-login");
  };

  const drawerLinks = [
    { label: "Home", icon: <Home />, path: "/employee-dashboard/home", color: "orange" },
    { label: "Employee Details", icon: <People />, path: "/employee-dashboard/employees", color: "#4caf50" },
    { label: "Attendance", icon: <AccessTime />, path: "/employee-dashboard/attendance", color: "#AFEEEE" },
    { label: "Remarks", icon: <Comment />, path: "/employee-dashboard/remarks", color: "#f4b400" },
    { label: "Payroll", icon: <MonetizationOn />, path: "/employee-dashboard/payroll", color: "#4caf50" },
    { label: "Settings", icon: <Settings />, path: "/employee-dashboard/settings", color: "white" },
  ];

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box>
        {/* Profile Section */}
        <Box sx={{ textAlign: "center", mb: 3, px: 2 }}>
          {!employee ? (
            <CircularProgress sx={{ color: "white", mt: 2 }} />
          ) : (
            <>
              <IconButton>
                <Avatar
                  src={employee?.profilePic || ""}
                  alt={employee?.fullName || "Employee"}
                  sx={{ width: 72, height: 72, mx: "auto" }}
                >
                  {employee?.fullName?.[0]}
                </Avatar>
              </IconButton>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mt: 1, color: "white" }}
              >
                {employee?.fullName || "Employee"}
              </Typography>
              <Typography variant="body2" sx={{ color: "white" }}>
                {employee?.email || "employee@email.com"}
              </Typography>
              <Typography variant="body2" sx={{ color: "white" }}>
                {employee?.position || "-"} — {employee?.department || "-"}
              </Typography>
            </>
          )}
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
                color: "white",
                "& .MuiInputBase-input::placeholder": {
                  color: "white",
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Navigation */}
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
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#B8860B",
                    color: item.color,
                    transform: "translateX(5px)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? item.color : "white" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: isActive ? item.color : "#fff",
                    fontWeight: isActive ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{
          borderRadius: 1.5,
          transition: "all 0.3s ease",
          "&:hover": { bgcolor: "rgba(255,0,0,0.1)", transform: "translateX(5px)" }
        }}>
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
      <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: "#000000",
            color: "white",
            borderBottom: "2px solid #FF8C00",
            borderRight: "2px solid #FF8C00",
            borderTopRightRadius: "5px",
            borderBottomRightRadius: "10px",
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
              Employee Dashboard
            </Typography>

            <IconButton color="inherit" onClick={() => setDarkMode((prev) => !prev)}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1, mt: 8 }}>
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                bgcolor: "#000000",
                color: "white",
                borderRight: "2px solid #FF8C00",
              },
            }}
          >
            {drawerContent}
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
        bgcolor: darkMode ? "#121212" : "#f5f5f5",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Niko MP. All rights reserved.
      </Typography>
    </Box>

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

export default EmployeeDashboard;
