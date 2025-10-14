import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";

// ✅ Reuse the same fade-up animation
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

const Terms = () => {
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
          Terms & Conditions
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
              Welcome to TeamSphere. By accessing or using our platform, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use our services.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              2. Use of Services
            </Typography>
            <Typography paragraph>
              You agree to use TeamSphere only for lawful purposes. You are responsible for all content, communications, and activities that occur under your account.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              3. Account Responsibilities
            </Typography>
            <Typography paragraph>
              You must provide accurate information during registration and maintain the confidentiality of your login credentials. You are responsible for any activities conducted under your account.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              4. Intellectual Property
            </Typography>
            <Typography paragraph>
              All content, branding, and materials available on TeamSphere are protected by copyright and trademark laws. You may not reproduce, distribute, or modify any content without written permission.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              5. Termination of Access
            </Typography>
            <Typography paragraph>
              We reserve the right to suspend or terminate your access at any time if you violate these terms or engage in conduct harmful to our platform or other users.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              6. Limitation of Liability
            </Typography>
            <Typography paragraph>
              TeamSphere and its affiliates are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              7. Changes to Terms
            </Typography>
            <Typography paragraph>
              We may update these Terms from time to time. Continued use of the platform after updates constitutes your acceptance of the revised Terms.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              8. Governing Law
            </Typography>
            <Typography paragraph>
              These Terms are governed by and construed in accordance with the laws of your jurisdiction, without regard to conflict of law principles.
            </Typography>

            <Typography variant="h6" gutterBottom fontWeight={700}>
              9. Contact Us
            </Typography>
            <Typography paragraph>
              If you have any questions or concerns about these Terms, contact us at{" "}
              <Box component="span" sx={{ color: "#f9a825", fontWeight: 600 }}>
                nickforjobacc@gmail.com
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

export default Terms;
