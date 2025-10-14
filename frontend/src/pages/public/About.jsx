import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Chip,
} from "@mui/material";
import {
  Info,
  Assignment,
  AccessTime,
  MonetizationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// ✅ Fade-up scroll animation
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

const About = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(145deg, #063d2d, #0b593f, #11784f)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 8 },
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Hero Section */}
      <FadeUpOnScroll>
        <Stack spacing={2} alignItems="center" mb={8} maxWidth="800px">
          <Chip
            label="TeamSphere"
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontWeight: 600,
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              fontSize: { xs: "2.2rem", md: "3.2rem" },
              lineHeight: 1.3,
            }}
          >
            Manage employees, automate payroll,
            <br />
            and track attendance seamlessly
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.85)",
              maxWidth: "700px",
              mt: 1,
              fontWeight: 400,
              lineHeight: 1.7,
            }}
          >
            TeamSphere simplifies HR management with automation,
            analytics, and transparency — empowering your team to focus
            on growth, not admin work.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mt={4}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "#f9a825",
                color: "#000",
                fontWeight: 700,
                px: 4,
                py: 1.4,
                fontSize: "1.1rem",
                "&:hover": { bgcolor: "#ffb300" },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#fff",
                color: "#fff",
                px: 4,
                py: 1.4,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "#f9a825",
                  color: "#f9a825",
                },
              }}
            >
              Watch Demo
            </Button>
          </Stack>
        </Stack>
      </FadeUpOnScroll>

      {/* Features Section */}
      <FadeUpOnScroll delay={300}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          sx={{ width: "100%", maxWidth: "1200px" }}
        >
          {[
            {
              icon: <Assignment sx={{ fontSize: 60, color: "#f9a825" }} />,
              title: "Employee Records",
              desc: "Centralize employee data securely — track roles, departments, and performance with ease.",
            },
            {
              icon: <AccessTime sx={{ fontSize: 60, color: "#f9a825" }} />,
              title: "Attendance & Leave Tracking",
              desc: "Monitor attendance, overbreaks, and leaves automatically with real-time analytics.",
            },
            {
              icon: (
                <MonetizationOn sx={{ fontSize: 60, color: "#f9a825" }} />
              ),
              title: "Automated Payroll",
              desc: "Generate payroll instantly based on attendance and leave data with 100% accuracy.",
            },
          ].map((feature, i) => (
            <Paper
              key={i}
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                flex: 1,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-10px)",
                  background: "rgba(255,255,255,0.12)",
                },
              }}
            >
              {feature.icon}
              <Typography
                variant="h6"
                fontWeight={700}
                mt={2}
                mb={1}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, lineHeight: 1.6 }}
              >
                {feature.desc}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </FadeUpOnScroll>
    </Box>
  );
};

export default About;
