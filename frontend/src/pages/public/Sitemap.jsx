import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const FadeUpOnScroll = ({ children, threshold = 0.2, delay = 0 }) => {
  const ref = useRef();
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setVisible(true), delay);
        observer.unobserve(ref.current);
      }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, delay]);
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {children}
    </div>
  );
};

const Sitemap = () => {
  const links = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Privacy Policy", to: "/privacy" },
    { name: "Terms & Conditions", to: "/terms" },
    { name: "Cookie Settings", to: "/cookiesettings" },
    { name: "Security", to: "/security" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #063d2d, #0b593f, #11784f)",
        color: "#fff",
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 8 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FadeUpOnScroll>
        <Typography variant="h3" fontWeight={800} textAlign="center" mb={4}>
          Sitemap
        </Typography>
      </FadeUpOnScroll>

      <FadeUpOnScroll delay={200}>
        <Container maxWidth="xs">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(6px)",
              borderRadius: 4,
            }}
          >
            <List component="nav">
              {links.map((link, index) => (
                <ListItem
                  key={index}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: "#fff",
                    textDecoration: "none",
                    "&:hover": { color: "#f9a825", pl: 1, transition: "0.3s" },
                  }}
                >
                  <ListItemText primary={link.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </FadeUpOnScroll>
    </Box>
  );
};

export default Sitemap;
