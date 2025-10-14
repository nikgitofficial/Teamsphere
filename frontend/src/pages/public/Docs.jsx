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
        transition: `opacity 0.8s ease-out, transform 0.8s ease-out`,
      }}
    >
      {children}
    </div>
  );
};

const Docs = () => (
  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      background: "radial-gradient(circle at top left, #0f766e, #042f2e 80%)",
      color: "#fff",
      py: { xs: 6, md: 10 },
      px: { xs: 3, md: 8 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <FadeUpOnScroll>
      <Typography
        variant="h3"
        fontWeight={800}
        textAlign="center"
        mb={4}
        sx={{
          fontSize: { xs: "2rem", md: "3rem" },
          background: "linear-gradient(90deg, #6ee7b7, #34d399, #10b981)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Documentation
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
            color: "#fff",
            lineHeight: 1.8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Typography paragraph>
            Explore technical documentation and developer resources for TeamSphere.
            Learn how to integrate APIs, configure your workspace, and automate workflows efficiently.
          </Typography>

          <Typography paragraph>
            Whether you're building custom integrations or scaling enterprise solutions,
            our documentation provides clear examples and best practices to guide you.
          </Typography>

          <Typography paragraph>
            Access SDKs, API references, and developer tutorials — everything you need
            to create powerful team experiences with TeamSphere.
          </Typography>
        </Paper>
      </Container>
    </FadeUpOnScroll>
  </Box>
);

export default Docs;
