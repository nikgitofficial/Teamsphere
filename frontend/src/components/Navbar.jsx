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
import Logo from "../assets/logo.png";

const Navbar = () => {
  const appPages = ["WelcomePage", "Login"];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState("");

  // New state for scroll behavior
  const [showNavbar, setShowNavbar] = useState(true);
  let lastScrollY = 0;

  useEffect(() => {
    const currentPath = window.location.pathname.replace("/", "");
    setActivePage(currentPath || "WelcomePage");
  }, []);

  // Scroll effect to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDrawer = (open) => () => setDrawerOpen(open);
  const handleLinkClick = (page) => setActivePage(page);

  // Animated underline style
  const navButtonStyles = {
    textTransform: "none",
    fontFamily: `"Poppins", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif`,
    fontSize: "1.05rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "#0b1560",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "0%",
      height: "2px",
      bottom: 4,
      left: 0,
      bgcolor: "#b58900",
      transition: "width 0.3s ease",
    },
    "&:hover::after": {
      width: "100%",
    },
  };

  // Drawer text style (underline on hover)
  const drawerTextStyle = {
    fontFamily: `"Poppins", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif`,
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "#0b1560",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "0%",
      height: "2px",
      bottom: 2,
      left: 0,
      bgcolor: "#b58900",
      transition: "width 0.3s ease",
    },
    "&:hover::after": {
      width: "100%",
    },
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#FFFFFF",
          color: "#000",
          boxShadow: "0 6px 6px rgba(0,0,0,0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          px: { xs: 2, sm: 4, md: 6 },
          transition: "transform 0.3s ease-in-out",
          transform: showNavbar ? "translateY(0)" : "translateY(-110%)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box component="img" src={Logo} alt="Logo" sx={{ height: 40, mr: 2 }} />
            <Typography
  variant="h6"
  component="a"
  href="/"
  sx={{
    textDecoration: "none",
    fontWeight: 700,
    letterSpacing: 1,
    fontFamily: `"Poppins", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif"`,
    display: "inline-flex",
    alignItems: "center",
  }}
>
  <Box component="span" sx={{ color: "#007BFF" }}>Team</Box>
  <Box component="span" sx={{ color: "#FF8C00" }}>Sphere</Box>
</Typography>

          </Box>

          {/* Desktop Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            {appPages.map((page) => (
              <Button
                key={page}
                href={page === "Login" ? "/login" : `/${page}`}
                target={page === "Login" ? "_blank" : "_self"}
                rel={page === "Login" ? "noopener noreferrer" : undefined}
                onClick={() => handleLinkClick(page)}
                sx={{
                  ...navButtonStyles,
                  color: activePage === page ? "#b58900" : "#0b1560",
                  "&::after": {
                    ...navButtonStyles["&::after"],
                    bgcolor: activePage === page ? "#b58900" : "#b58900",
                    width: activePage === page ? "100%" : "0%",
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
                sx={{ backgroundColor: "transparent" }}
              >
                <ListItemText
                  primary={page}
                  primaryTypographyProps={{
                    sx: drawerTextStyle,
                    textAlign: "center",
                  }}
                />
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
