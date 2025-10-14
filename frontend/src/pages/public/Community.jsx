import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
} from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Fade-up animation on scroll
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

const Community = () => (
  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      background:
        "radial-gradient(circle at bottom left, #0f766e, #042f2e 85%)",
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
          background: "linear-gradient(90deg, #6ee7b7, #34d399, #10b981)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: { xs: "2.2rem", md: "3.5rem" },
        }}
      >
        Our Community
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="rgba(255,255,255,0.7)"
        mb={6}
        sx={{ maxWidth: 700 }}
      >
        Connect, collaborate, and grow with professionals shaping the future of
        teamwork worldwide.
      </Typography>
    </FadeUpOnScroll>

    {/* Features Section */}
    <FadeUpOnScroll delay={200}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent={"center"}>
          {[
            {
              icon: <ForumOutlinedIcon sx={{ fontSize: 48 }} />,
              title: "Collaborative Discussions",
              desc: "Join active conversations with peers, share insights, and learn from leaders in your field.",
            },
            {
              icon: <VolunteerActivismOutlinedIcon sx={{ fontSize: 48 }} />,
              title: "Community Projects",
              desc: "Contribute to open initiatives, mentorships, and volunteer programs that create real impact.",
            },
            {
              icon: <PublicOutlinedIcon sx={{ fontSize: 48 }} />,
              title: "Global Network",
              desc: "Connect with innovators and professionals across industries and continents.",
            },
          ].map((item, i) => (
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
                  <Box mb={2}>{item.icon}</Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={1}
                    sx={{ color: "#a7f3d0" }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </FadeUpOnScroll>

    {/* Testimonials Section */}
    <FadeUpOnScroll delay={400}>
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Box
          sx={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            backdropFilter: "blur(8px)",
            p: { xs: 4, md: 6 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            mb={3}
            sx={{ color: "#a7f3d0" }}
          >
            Voices from Our Community
          </Typography>
          <Typography
            variant="body1"
            color="rgba(255,255,255,0.8)"
            mb={4}
            sx={{ lineHeight: 1.8 }}
          >
            “Being part of TeamSphere’s community has opened doors to new
            collaborations, insights, and friendships across the globe.”
          </Typography>
<Avatar
  src="/testimonial.png"
  alt="Community Member"
  sx={{
    width: 72,
    height: 72,
    margin: "0 auto",
    mb: 1,
    border: "2px solid #34d399",
  }}
/>



          <Typography fontWeight={600}>Sarah Nguyen</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)">
            Product Designer, Singapore
          </Typography>
        </Box>
      </Container>
    </FadeUpOnScroll>

    {/* CTA Section */}
    <FadeUpOnScroll delay={600}>
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
          Join the TeamSphere Community
        </Typography>
        <Typography
          variant="body1"
          color="rgba(255,255,255,0.8)"
          mb={4}
          sx={{ lineHeight: 1.7 }}
        >
          Whether you’re a developer, designer, or team leader — your ideas
          matter. Engage, contribute, and grow with us.
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
          Join Now
        </Button>
      </Box>
    </FadeUpOnScroll>
  </Box>
);

export default Community;
