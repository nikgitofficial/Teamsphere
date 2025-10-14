import React, { useRef, useEffect, useState } from "react";
import { Box, Typography, Container, Paper, Grid, Button } from "@mui/material";

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

const Guides = () => (
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
        Guides
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
            Step-by-step tutorials to help you master TeamSphere — from setting up teams to managing payroll and performance analytics.
          </Typography>
        </Paper>
      </Container>
    </FadeUpOnScroll>

    <FadeUpOnScroll delay={400}>
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: "Getting Started",
              desc: "Set up your workspace, invite team members, and learn the basics of TeamSphere.",
              btn: "View Guide",
            },
            {
              title: "Automation Setup",
              desc: "Create smart workflows to automate repetitive HR and payroll tasks.",
              btn: "Learn More",
            },
            {
              title: "Analytics Dashboard",
              desc: "Unlock insights with data-driven performance and engagement analytics.",
              btn: "Explore",
            },
          ].map((guide, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper
                sx={{
                  p: 4,
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 4,
                  textAlign: "center",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                  },
                }}
              >
                <Typography variant="h5" fontWeight={700} mb={2}>
                  {guide.title}
                </Typography>
                <Typography variant="body1" mb={3} sx={{ color: "rgba(255,255,255,0.85)" }}>
                  {guide.desc}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "#34d399",
                    color: "#34d399",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(52,211,153,0.1)",
                      borderColor: "#6ee7b7",
                    },
                  }}
                >
                  {guide.btn}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </FadeUpOnScroll>
  </Box>
);

export default Guides;
