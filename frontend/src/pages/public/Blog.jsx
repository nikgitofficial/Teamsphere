import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";
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

const Blog = () => (
  <Box
    sx={{
      minHeight: "100vh",
      width: "100%",
      background:
        "radial-gradient(circle at top left, #065f46, #042f2e 85%)",
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
        Blog & Insights
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="rgba(255,255,255,0.7)"
        mb={6}
        sx={{ maxWidth: 700 }}
      >
        Expert commentary, product updates, and forward-thinking ideas to
        inspire your workplace strategy.
      </Typography>
    </FadeUpOnScroll>

    {/* Blog Grid */}
    <FadeUpOnScroll delay={200}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {[
            {
              img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
              title: "Building Culture That Scales",
              desc: "How to maintain company culture as your organization grows rapidly.",
            },
            {
              img: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
              title: "Data-Driven HR Decisions",
              desc: "Using analytics to shape smarter hiring and retention strategies.",
            },
            {
              img: "https://images.unsplash.com/photo-1522205408450-add114ad53fe",
              title: "The Future of Hybrid Work",
              desc: "Insights into collaboration tools and policies shaping modern teams.",
            },
          ].map((post, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  height: "100%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 4,
                  color: "#fff",
                  overflow: "hidden",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    background: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={post.img}
                  alt={post.title}
                  sx={{
                    objectFit: "cover",
                    filter: "brightness(0.85)",
                  }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={1.5}
                    sx={{ color: "#a7f3d0" }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.8)"
                    mb={2}
                  >
                    {post.desc}
                  </Typography>
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      color: "#34d399",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": { color: "#6ee7b7" },
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </FadeUpOnScroll>

    {/* Footer text */}
    <FadeUpOnScroll delay={400}>
      <Typography
        variant="body1"
        textAlign="center"
        mt={10}
        color="rgba(255,255,255,0.6)"
        sx={{ maxWidth: 600 }}
      >
        Stay informed, inspired, and ahead of industry shifts. New stories every
        week from our experts and partners.
      </Typography>
    </FadeUpOnScroll>
  </Box>
);

export default Blog;
