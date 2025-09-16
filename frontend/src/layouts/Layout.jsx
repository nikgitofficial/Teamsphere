import React, { useContext } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar"; // ✅ import Navbar
import { AuthContext } from "../context/AuthContext";

const Layout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // ❌ Pages where footer should be hidden
  const hiddenFooterRoutes = [
    "/attendance",
    "/dashboard/home",
    "/dashboard/employees",
    "/dashboard/attendance-overview",
    "/dashboard",
    "/dashboard/settings",
   
  ];

  // ❌ Pages where navbar should be hidden
  const hiddenNavbarRoutes = [
    "/attendance",
    "/dashboard/home",
    "/dashboard/employees",
    "/dashboard/attendance-overview",
    "/dashboard",
    "/dashboard/settings",
    
    
  ];

  // Check if the current route is in the hidden lists
  const shouldHideFooter = hiddenFooterRoutes.includes(location.pathname);
  const shouldHideNavbar = hiddenNavbarRoutes.includes(location.pathname);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar (conditionally rendered) */}
      {!shouldHideNavbar && <Navbar />} {/* ✅ Navbar hidden on dashboard routes */}

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      {/* Footer (conditionally rendered) */}
      {!shouldHideFooter && <Footer />}
    </Box>
  );
};

export default Layout;