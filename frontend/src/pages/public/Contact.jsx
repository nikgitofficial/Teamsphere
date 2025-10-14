import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Link } from "@mui/material";

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

const Contact = () => (
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
        Contact Us
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
          <Typography paragraph>
            Have a question, need support, or want to connect with our team? We’re here to help.
          </Typography>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            📧 Email
          </Typography>
          <Link
            href="mailto:nickforjobacc@gmail.com"
            underline="hover"
            sx={{
              color: "#f9a825",
              fontWeight: 600,
              "&:hover": { color: "#ffca28" },
            }}
          >
            nickforjobacc@gmail.com
          </Link>

          <Typography variant="h6" fontWeight={700} gutterBottom mt={3}>
            📞 Phone
          </Typography>
          <Link
            href="tel:+639514190949"
            underline="hover"
            sx={{
              color: "#f9a825",
              fontWeight: 600,
              "&:hover": { color: "#ffca28" },
            }}
          >
            +63 951 419 0949
          </Link>

          <Typography variant="h6" fontWeight={700} gutterBottom mt={3}>
            🏢 Office Address
          </Typography>
          <Typography sx={{ color: "#f9a825", fontWeight: 600 }}>
            TeamSphere HQ<br />
            Brgy. Bato, Purok 11, Toril, Davao City
          </Typography>

          <Typography
            variant="body2"
            mt={4}
            sx={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}
          >
            Business Hours: Monday to Friday, 9:00 AM – 6:00 PM (PST)
          </Typography>
        </Paper>
      </Container>
    </FadeUpOnScroll>
  </Box>
);

export default Contact;
