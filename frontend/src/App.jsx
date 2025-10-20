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
import Announcements from "./pages/userpage/Announcements";
import Overtimes from  "./pages/userpage/Overtimes.jsx";

//arrow scroll up or down 
import ScrollArrow from "./components/ui/ScrollArrow";

// Admin pages
import Adminhome from "./pages/admin/Adminhome.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.jsx";
import AdminRatings from "./pages/admin/AdminRatings.jsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.jsx";

// Public pages
import About from "./pages/public/About.jsx";
import Privacy from "./pages/public/Privacy.jsx";
import Terms from "./pages/public/Terms.jsx";
import CookieSettings from "./pages/public/CookieSettings";
import Security from "./pages/public/Security";
import Sitemap from "./pages/public/Sitemap";
import Status from "./pages/public/Status";
import Careers from "./pages/public/Careers.jsx";
import Community from "./pages/public/Community.jsx";
import Contact from "./pages/public/Contact.jsx";
import Docs from "./pages/public/Docs.jsx";
import Guides from "./pages/public/Guides.jsx";
import FAQ from "./pages/public/FAQ.jsx";
import Blog from "./pages/public/Blog.jsx";
import Analytics from "./pages/public/Analytics.jsx";

// Employee pages
import Index from "./pages/employee/Index.jsx";
import EmployeeAnnouncements from "./pages/employee/EmployeeAnnouncements.jsx";
import ApplyOvetime from  "./pages/employee/ApplyOvertime.jsx";
import EmployeeLogin from "./pages/employee/EmployeeLogin.jsx";
import EmployeeDataPage from "./pages/employee/EmployeeDataPage.jsx";
import EmployeeAttendancePage from "./pages/employee/EmployeeAttendancePage.jsx";
import EmployeePayslipPage from "./pages/employee/EmployeePayslipPage.jsx";

// ✅ Wrapper for public pages only
const PublicPage = ({ children }) => (
  <Layout>
    {children}
    <ScrollArrow />
  </Layout>
);

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

            {/* admin routes */}
            <Route path="/admin" element={<AdminRoute user={user}><AdminDashboard /></AdminRoute>}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<Adminhome />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="ratings" element={<AdminRatings />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
            </Route>

            {/* Default route — show About first */}
            <Route path="/" element={<Navigate to="/about" replace />} />

            {/* ✅ Public routes now wrapped with PublicPage so ScrollArrow only appears here */}
            <Route path="/privacy" element={<PublicPage><Privacy /></PublicPage>} />
            <Route path="/terms" element={<PublicPage><Terms /></PublicPage>} />
            <Route path="/cookiesettings" element={<PublicPage><CookieSettings /></PublicPage>} />
            <Route path="/security" element={<PublicPage><Security /></PublicPage>} />
            <Route path="/sitemap" element={<PublicPage><Sitemap /></PublicPage>} />
            <Route path="/status" element={<PublicPage><Status /></PublicPage>} />
            <Route path="/careers" element={<PublicPage><Careers /></PublicPage>} />
            <Route path="/community" element={<PublicPage><Community /></PublicPage>} />
            <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
            <Route path="/docs" element={<PublicPage><Docs /></PublicPage>} />
            <Route path="/guides" element={<PublicPage><Guides /></PublicPage>} />
            <Route path="/faq" element={<PublicPage><FAQ /></PublicPage>} />
            <Route path="/blog" element={<PublicPage><Blog /></PublicPage>} />
            <Route path="/analytics" element={<PublicPage><Analytics /></PublicPage>} />
            <Route path="/about" element={<PublicPage><About /></PublicPage>} />

            {/* Public routes (auth) */}
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

            {/* Employee routes */}
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route 
              path="/employee-dashboard" 
              element={<EmployeeProtectedRoute><EmployeeDashboard /></EmployeeProtectedRoute>}
            >
              <Route path="home" element={<Index />} />
              <Route path="announcements" element={<EmployeeAnnouncements />} />
              <Route path="overtime" element={<ApplyOvetime />} />
              <Route path="employees" element={<EmployeeDataPage />} />
              <Route path="attendance" element={<EmployeeAttendancePage />} />
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
                <Route path="overtimes" element={<Overtimes />} />
                <Route path="attendance-remarks" element={<AttendanceRemarks />} />
                <Route path="announcement" element={<Announcements />} />
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
