import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Chip } from "@mui/material";

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

const Status = () => {
  const [status] = useState("All Systems Operational");

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
          System Status
        </Typography>
      </FadeUpOnScroll>

      <FadeUpOnScroll delay={200}>
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(6px)",
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" mb={2}>
              Current System Status
            </Typography>
            <Chip
              label={status}
              sx={{
                backgroundColor: "#2e7d32",
                color: "#fff",
                fontWeight: "bold",
                px: 2,
                py: 1,
              }}
            />
            <Typography variant="body2" mt={3} color="rgba(255,255,255,0.7)">
              Last checked: {new Date().toLocaleString()}
            </Typography>
          </Paper>
        </Container>
      </FadeUpOnScroll>
    </Box>
  );
};

export default Status;
