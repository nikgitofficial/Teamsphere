import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import InsightsIcon from "@mui/icons-material/Insights";
import TimelineIcon from "@mui/icons-material/Timeline";

// Reusable fade-up animation
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
        transition: `opacity 0.8s ease, transform 0.8s ease`,
      }}
    >
      {children}
    </div>
  );
};

const Analytics = () => (
  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      background:
        "radial-gradient(circle at 20% 20%, #0f766e, #042f2e 80%)",
      color: "#fff",
      py: { xs: 8, md: 12 },
      px: { xs: 3, md: 8 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {/* Title */}
    <FadeUpOnScroll>
      <Typography
        variant="h2"
        fontWeight={800}
        textAlign="center"
        mb={2}
        sx={{
          background: "linear-gradient(90deg, #a7f3d0, #6ee7b7, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: { xs: "2.2rem", md: "3.5rem" },
        }}
      >
        Analytics Dashboard
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="rgba(255,255,255,0.7)"
        mb={6}
        sx={{ maxWidth: 700 }}
      >
        Empower your organization with data-driven insights that help teams
        perform better and grow smarter.
      </Typography>
    </FadeUpOnScroll>

    {/* Info Section */}
    <FadeUpOnScroll delay={200}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              icon: <BarChartIcon sx={{ fontSize: 48 }} />,
              title: "Performance Metrics",
              text: "Track key productivity, efficiency, and engagement metrics in real time.",
            },
            {
              icon: <InsightsIcon sx={{ fontSize: 48 }} />,
              title: "Predictive Insights",
              text: "Use AI-driven analytics to forecast trends and identify improvement areas.",
            },
            {
              icon: <TimelineIcon sx={{ fontSize: 48 }} />,
              title: "Growth Tracking",
              text: "Visualize long-term organizational progress with sleek, interactive dashboards.",
            },
          ].map((card, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  height: "100%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  p: 2,
                  color: "#fff",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    background: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box mb={2}>{card.icon}</Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={1}
                    sx={{ color: "#a7f3d0" }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {card.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </FadeUpOnScroll>

    {/* Footer Text */}
    <FadeUpOnScroll delay={400}>
      <Divider
        sx={{
          width: "80%",
          mt: 10,
          mb: 4,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      />
      <Typography
        textAlign="center"
        color="rgba(255,255,255,0.6)"
        sx={{ maxWidth: 600 }}
      >
        Transform analytics into action — empower leadership with live data,
        and elevate team performance across your organization.
      </Typography>
    </FadeUpOnScroll>
  </Box>
);

export default Analytics;
