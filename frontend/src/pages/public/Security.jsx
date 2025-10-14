import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";

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

const Security = () => {
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
          Security
        </Typography>
      </FadeUpOnScroll>

      <FadeUpOnScroll delay={200}>
        <Container maxWidth="md">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 6 },
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(6px)",
              borderRadius: 4,
            }}
          >
            <Typography paragraph>
              At TeamSphere, we take security seriously. Our infrastructure uses advanced encryption, multi-factor authentication, and continuous monitoring to ensure your data remains safe.
            </Typography>
            <Typography paragraph>
              We follow industry-standard practices such as HTTPS, secure password hashing, and restricted data access. Regular audits and penetration tests help maintain compliance and data protection.
            </Typography>
            <Typography paragraph>
              If you suspect any security issues or vulnerabilities, contact us at{" "}
              <Box component="span" sx={{ color: "#f9a825", fontWeight: 600 }}>
                nickforjobacc@gmail.com
              </Box>.
            </Typography>
          </Paper>
        </Container>
      </FadeUpOnScroll>
    </Box>
  );
};

export default Security;
