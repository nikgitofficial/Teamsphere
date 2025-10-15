import React, { useContext } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar"; // ✅ import Navbar
import { AuthContext } from "../context/AuthContext";

const Layout = ({ children }) => { // accept children
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const hiddenFooterRoutes = [
    "/attendance",
    "/dashboard/home",
    "/dashboard/employees",
    "/dashboard/attendance-overview",
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/payroll",
    "/dashboard/attendance-remarks",
    "/login",
    "/forgot-password",
    "/admin",
  ];

  const hiddenNavbarRoutes = [
    "/attendance",
    "/dashboard/home",
    "/dashboard/employees",
    "/dashboard/attendance-overview",
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/payroll",
    "/dashboard/attendance-remarks",
    "/login",
    "/forgot-password",
    "/admin",
  ];

  const shouldHideFooter = hiddenFooterRoutes.includes(location.pathname);
  const shouldHideNavbar = hiddenNavbarRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!shouldHideNavbar && <Navbar />}
      <Box sx={{ flex: 1 }}>
        {children || <Outlet />} {/* render children if passed, else Outlet */}
      </Box>
      {!shouldHideFooter && <Footer />}
    </Box>
  );
};


export default Layout;