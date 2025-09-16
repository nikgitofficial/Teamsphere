import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Box } from "@mui/material";
import { AuthContext } from "./context/AuthContext";
import Layout from "./layouts/Layout"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import AttendanceOverview from "./pages/AttendanceOverview";
import EmployeePage from "./pages/EmployeePage";
import ForgotPassword from "./pages/ForgotPassword"; 
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Profile from "./pages/Profile.jsx";
import Settings  from "./pages/Settings.jsx";

// ProtectedRoute
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// AdminRoute
const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard/home" replace />;
  return children;
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === "admin" ? "/admin" : "/dashboard/home"} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === "admin" ? "/admin" : "/dashboard/home"} />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to={user.role === "admin" ? "/admin" : "/dashboard/home"} />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute user={user}><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/dashboard/home") : "/login"} />} />

              <Route path="/dashboard" element={<Dashboard />}>
                <Route path="home" element={<Home />} />
                <Route path="employees" element={<EmployeePage />} />
                <Route path="attendance-overview" element={<AttendanceOverview />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="/attendance" element={<Attendance />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={user ? "/dashboard/home" : "/login"} />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </LocalizationProvider>
  );
};

export default App;
