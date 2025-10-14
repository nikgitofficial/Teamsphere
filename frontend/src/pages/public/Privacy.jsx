import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";

// ✅ Reuse your fade-up animation
const FadeUpOnScroll = ({ children, threshold = 0.2, delay = 0 }) => {
  const ref = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(ref.current);
        }
      },
      { threshold }
    );
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

const Privacy = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
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
        <Typography
          variant="h3"
          fontWeight={800}
          textAlign="center"
          mb={4}
          sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
        >
          Privacy Policy
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
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={700}>
              1. Introduction
            </Typography>
            <Typography paragraph>
              TeamSphere values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our platform and related services.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              2. Information We Collect
            </Typography>
            <Typography paragraph>
              We may collect personal information such as your name, email, role, and company details when you register or use our services. We also collect usage data like login times, activity logs, and browser information for analytics and security purposes.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              3. How We Use Your Information
            </Typography>
            <Typography paragraph>
              Your data is used to provide and improve our services, automate HR processes, send relevant updates, and ensure security. We do not sell your information to third parties.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              4. Data Protection
            </Typography>
            <Typography paragraph>
              We implement strict measures, including encryption and secure authentication, to protect your information from unauthorized access, alteration, or destruction.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              5. Cookies and Tracking
            </Typography>
            <Typography paragraph>
              Our platform may use cookies to enhance user experience and collect analytics data. You can disable cookies in your browser settings, but some features may not function properly.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              6. Your Rights
            </Typography>
            <Typography paragraph>
              You have the right to access, correct, or delete your data. You can also request data export or opt out of certain communications by contacting our support team.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              7. Updates to This Policy
            </Typography>
            <Typography paragraph>
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated “Last Modified” date.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              8. Contact Us
            </Typography>
            <Typography paragraph>
              For any privacy-related questions or data requests, contact us at{" "}
              <Box component="span" sx={{ color: "#f9a825", fontWeight: 600 }}>
                nickforjobacc2gmail.com
              </Box>.
            </Typography>

            <Typography
              variant="body2"
              mt={4}
              sx={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}
            >
              Last updated: October 2025
            </Typography>
          </Paper>
        </Container>
      </FadeUpOnScroll>
    </Box>
  );
};

export default Privacy;
