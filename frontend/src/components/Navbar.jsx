import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// ✅ Import local logo
import Logo from "../assets/logo.png"; // adjust path if Navbar.jsx is in another folder

const Navbar = () => {
  const appPages = ["WelcomePage", "Login"];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState(""); // ✅ track active link

  // ✅ Set activePage from current URL when component mounts
  useEffect(() => {
    const currentPath = window.location.pathname.replace("/", "");
    setActivePage(currentPath || "WelcomePage"); 
  }, []);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleLinkClick = (page) => {
    setActivePage(page);
  };

  return (
    <>
      {/* Sticky Navbar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#1e293b", // custom dark navy
          zIndex: (theme) => theme.zIndex.drawer + 1,
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box component="img" src={Logo} alt="Logo" sx={{ height: 40, mr: 2 }} />
           <Typography
  variant="h6"       
  component="a"     
  href="/"
  sx={{
    color: "#fff",       
    textDecoration: "none", 
    fontWeight: 600,    
    letterSpacing: 1,    
  }}
>
  Niko Nikonik
</Typography>
          </Box>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            {appPages.map((page) => (
             <Button
  key={page}
  color="inherit"
  href={page === "Login" ? "/login" : `/${page}`}
  target={page === "Login" ? "_blank" : "_self"} // open login in new tab
  rel={page === "Login" ? "noopener noreferrer" : undefined}
  onClick={() => handleLinkClick(page)}
  sx={{
    textTransform: "none",
    fontWeight: 500,
    color: "#fff",
    backgroundColor:
      activePage === page ? "#b58900" : "transparent",
    borderRadius: 1,
    "&:hover": {
      backgroundColor: "#b58900",
    },
  }}
>
  {page}
</Button>
            ))}
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add spacing so content isn't hidden behind fixed navbar */}
      <Toolbar />

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {appPages.map((page) => (
             <ListItemButton
  key={page}
  component="a"
  href={page === "Login" ? "/login" : `/${page}`}
  target={page === "Login" ? "_blank" : "_self"}
  rel={page === "Login" ? "noopener noreferrer" : undefined}
  onClick={() => handleLinkClick(page)}
  sx={{
    backgroundColor: activePage === page ? "#b58900" : "transparent",
    "&:hover": { backgroundColor: "#b58900" },
  }}
>
  <ListItemText primary={page} sx={{ color: "#fff", textAlign: "center" }} />
</ListItemButton>

            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;