import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Box } from "@mui/material";
import { AuthContext } from "./context/AuthContext";
import Layout from "./layouts/Layout"; 
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import Dashboard from "./components/Dashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import Home from "./pages/userpage/Home";
import Attendance from "./pages/userpage/Attendance.jsx";
import AttendanceOverview from "./pages/userpage/AttendanceOverview.jsx";
import EmployeePage from "./pages/userpage/EmployeePage.jsx";
import ForgotPassword from "./pages/public/ForgotPassword.jsx"; 
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Profile from "./pages/userpage/Profile.jsx";
import Settings  from "./pages/userpage/Settings.jsx";
import PayrollOverview from "./pages/userpage/PayrollOverview";
import AttendanceRemarks from "./pages/userpage/AttendanceRemarks.jsx";

// Public pages
import About from "./pages/public/About.jsx";

// Employee pages
import Index from "./pages/employee/Index.jsx";
import EmployeeLogin from "./pages/employee/EmployeeLogin.jsx";
import EmployeeDataPage from "./pages/employee/EmployeeDataPage.jsx";
import EmployeeAttendancePage from "./pages/employee/EmployeeAttendancePage.jsx";
import EmployeePayslipPage from "./pages/employee/EmployeePayslipPage.jsx";

const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard/home" replace />;
  return children;
};

const EmployeeProtectedRoute = ({ children }) => {
  const employee = localStorage.getItem("employee");
  if (!employee) return <Navigate to="/employee-login" replace />;
  return children;
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <BrowserRouter>
          <Routes>
            {/* Default route — show About first */}
            <Route path="/" element={<Navigate to="/about" replace />} />

            {/* Public routes wrapped with Layout */}
            <Route 
              path="/login" 
              element={
                !user 
                  ? <Layout><Login /></Layout> 
                  : <Navigate to={user.role === "admin" ? "/admin" : "/dashboard/home"} />
              } 
            />
            <Route 
              path="/register" 
              element={
                !user 
                  ? <Layout><Register /></Layout> 
                  : <Navigate to={user.role === "admin" ? "/admin" : "/dashboard/home"} />
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                !user 
                  ? <Layout><ForgotPassword /></Layout> 
                  : <Navigate to={user.role === "admin" ? "/admin" : "/dashboard/home"} />
              } 
            />
            <Route path="/about" element={<Layout><About /></Layout>} />

            {/* Employee routes */}
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route 
              path="/employee-dashboard" 
              element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>}
            >
              <Route path="home" element={<Index />} />
              <Route path="employees" element={<EmployeeDataPage />} />
              <Route path="attendance" element={<EmployeeAttendancePage />} />
              <Route path="remarks" element={<AttendanceRemarks />} />
              <Route path="payroll" element={<EmployeePayslipPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* User protected routes */}
            <Route 
              element={<ProtectedRoute user={user}><Layout /></ProtectedRoute>}
            >
              <Route path="/dashboard" element={<Dashboard />}>
                <Route path="home" element={<Home />} />
                <Route path="employees" element={<EmployeePage />} />
                <Route path="attendance-remarks" element={<AttendanceRemarks />} />
                <Route path="attendance-overview" element={<AttendanceOverview />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="payroll" element={<PayrollOverview />} />
              </Route>

              <Route path="/attendance" element={<Attendance />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/about" replace />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </LocalizationProvider>
  );
};

export default App;
