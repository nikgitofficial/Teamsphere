import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

const FAQ = () => (
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
        Frequently Asked Questions
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
          <Typography mb={3}>
            Here you’ll find answers to the most common questions about TeamSphere — from account setup to HR automation.
          </Typography>

          <Accordion
            sx={{
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              borderRadius: "12px !important",
              mb: 2,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#6ee7b7" }} />}>
              <Typography fontWeight={600}>How do I create a TeamSphere account?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ color: "rgba(255,255,255,0.8)" }}>
              You can sign up directly from our website. Just click “Get Started,” enter your company details,
              and you’ll receive a confirmation email within minutes.
            </AccordionDetails>
          </Accordion>

          <Accordion
            sx={{
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              borderRadius: "12px !important",
              mb: 2,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#6ee7b7" }} />}>
              <Typography fontWeight={600}>Can I integrate TeamSphere with other tools?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ color: "rgba(255,255,255,0.8)" }}>
              Yes. TeamSphere supports integration with Slack, Google Workspace, Microsoft Teams,
              and many popular HR systems via our public API.
            </AccordionDetails>
          </Accordion>

          <Accordion
            sx={{
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              borderRadius: "12px !important",
              mb: 2,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#6ee7b7" }} />}>
              <Typography fontWeight={600}>Is my company’s data secure?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ color: "rgba(255,255,255,0.8)" }}>
              Absolutely. TeamSphere uses AES-256 encryption, role-based access controls,
              and complies with GDPR and ISO/IEC 27001 standards.
            </AccordionDetails>
          </Accordion>

          <Accordion
            sx={{
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              borderRadius: "12px !important",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#6ee7b7" }} />}>
              <Typography fontWeight={600}>How can I contact support?</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ color: "rgba(255,255,255,0.8)" }}>
              You can reach our support team anytime via email or through the in-app help center.
              Business clients also have access to a dedicated success manager.
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Container>
    </FadeUpOnScroll>
  </Box>
);

export default FAQ;
