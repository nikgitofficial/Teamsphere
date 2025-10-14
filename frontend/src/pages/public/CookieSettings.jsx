import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Button, Switch, FormControlLabel } from "@mui/material";

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

const CookieSettings = () => {
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);
  const [marketing, setMarketing] = useState(false);

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
          Cookie Settings
        </Typography>
      </FadeUpOnScroll>

      <FadeUpOnScroll delay={200}>
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(6px)",
              borderRadius: 4,
            }}
          >
            <Typography paragraph>
              We use cookies to enhance your browsing experience. You can customize your preferences below.
            </Typography>

            <FormControlLabel
              control={<Switch checked={functional} onChange={() => setFunctional(!functional)} color="success" />}
              label="Functional Cookies"
            />
            <FormControlLabel
              control={<Switch checked={analytics} onChange={() => setAnalytics(!analytics)} color="success" />}
              label="Analytics Cookies"
            />
            <FormControlLabel
              control={<Switch checked={marketing} onChange={() => setMarketing(!marketing)} color="success" />}
              label="Marketing Cookies"
            />

            <Box mt={4} display="flex" gap={2} justifyContent="center">
              <Button variant="contained" sx={{ backgroundColor: "#11784f" }}>
                Save Preferences
              </Button>
              <Button variant="outlined" sx={{ color: "#fff", borderColor: "#fff" }}>
                Accept All
              </Button>
            </Box>
          </Paper>
        </Container>
      </FadeUpOnScroll>
    </Box>
  );
};

export default CookieSettings;
