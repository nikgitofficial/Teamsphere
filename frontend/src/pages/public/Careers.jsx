import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import Groups2Icon from "@mui/icons-material/Groups2";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Reusable fade-up scroll animation
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

const Careers = () => (
  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      background:
        "radial-gradient(circle at top right, #0d9488, #042f2e 85%)",
      color: "#fff",
      py: { xs: 8, md: 12 },
      px: { xs: 3, md: 8 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {/* Header */}
    <FadeUpOnScroll>
      <Typography
        variant="h2"
        fontWeight={800}
        textAlign="center"
        mb={2}
        sx={{
          background: "linear-gradient(90deg, #5eead4, #34d399, #10b981)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: { xs: "2.2rem", md: "3.5rem" },
        }}
      >
        Careers at TeamSphere
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="rgba(255,255,255,0.7)"
        mb={6}
        sx={{ maxWidth: 700 }}
      >
        Build the future of collaboration with us — join a team where innovation,
        creativity, and growth thrive.
      </Typography>
    </FadeUpOnScroll>

    {/* Values / Perks Section */}
    <FadeUpOnScroll delay={200}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {[
            {
              icon: <WorkOutlineIcon sx={{ fontSize: 48 }} />,
              title: "Meaningful Work",
              desc: "Contribute to products that empower thousands of teams worldwide.",
            },
            {
              icon: <Groups2Icon sx={{ fontSize: 48 }} />,
              title: "Collaborative Culture",
              desc: "Work with talented peers who value transparency, inclusion, and impact.",
            },
            {
              icon: <RocketLaunchIcon sx={{ fontSize: 48 }} />,
              title: "Career Growth",
              desc: "Access mentorship, learning programs, and growth opportunities globally.",
            },
          ].map((perk, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  height: "100%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  color: "#fff",
                  p: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    background: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box mb={2}>{perk.icon}</Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={1}
                    sx={{ color: "#a7f3d0" }}
                  >
                    {perk.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {perk.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </FadeUpOnScroll>

    {/* CTA Section */}
    <FadeUpOnScroll delay={400}>
      <Box
        sx={{
          mt: 10,
          textAlign: "center",
          background: "rgba(255,255,255,0.08)",
          borderRadius: 4,
          backdropFilter: "blur(8px)",
          p: { xs: 4, md: 6 },
          maxWidth: 700,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          mb={2}
          sx={{ color: "#a7f3d0" }}
        >
          Ready to make an impact?
        </Typography>
        <Typography
          variant="body1"
          color="rgba(255,255,255,0.8)"
          mb={4}
          sx={{ lineHeight: 1.7 }}
        >
          We're hiring across product, engineering, design, and operations.
          Shape the future of teamwork with TeamSphere.
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            background:
              "linear-gradient(90deg, #34d399, #059669)",
            color: "#fff",
            fontWeight: 600,
            px: 4,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            "&:hover": {
              background:
                "linear-gradient(90deg, #6ee7b7, #10b981)",
            },
          }}
        >
          View Open Roles
        </Button>
      </Box>
    </FadeUpOnScroll>
  </Box>
);

export default Careers;
