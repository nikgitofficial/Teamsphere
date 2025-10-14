import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  CssBaseline,
  Link,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { Facebook, Twitter, LinkedIn, Instagram } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Logo from "../assets/logo.png";
import axios from "../api/axios";

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

const pulseOrange = keyframes`
  0% {
    box-shadow: 0 0 0px rgba(255, 140, 0, 0);
    border-color: rgba(255, 140, 0, 0);
  }
  50% {
    box-shadow: 0 0 25px rgba(255, 140, 0, 0.6);
    border-color: rgba(255, 140, 0.8);
  }
  100% {
    box-shadow: 0 0 0px rgba(255, 140, 0, 0);
    border-color: rgba(255, 140, 0, 0);
  }
`;
const Root = styled("div")({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: "#0f0f0f",
  color: "#fff",
  fontFamily: `"Poppins", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif`,
});

const Main = styled("main")(({ theme }) => ({
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(8),
}));

const FooterContainer = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  backgroundColor: "#0b1560",
  color: "#fff",
  padding: theme.spacing(8, 4),
  position: "relative",
  width: "100%",
  clipPath: "path('M 0 15% C 25% 0%, 75% 0%, 100% 15% L 100% 100%, 0% 100% Z')",
}));

const footerLinkStyles = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#fff",
  textDecoration: "none",
  display: "inline-block",
  transition: "color 0.3s ease",
  "&:hover": { color: "#f57c00", textDecoration: "none" },
};

export default function StickyFooter() {
  const appPages = ["Home", "Dashboard", "Login", "Register", "ForgotPassword", "Profile", "Settings"];
  const resourcesPages = ["Docs", "Guides", "FAQ", "Blog", "Analytics"];
  const companyPages = ["About", "Careers", "Community", "Contact"];
  const legalPages = ["Privacy", "Terms", "CookieSettings", "Security", "Sitemap", "Status"];

  const [ratingValue, setRatingValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  const handleRateUs = async () => {
    if (ratingValue === 0) {
      setModalMessage("Please select a rating first!");
      setModalOpen(true);
      return;
    }
    try {
      const res = await axios.post("/rate", { rating: ratingValue });
      setModalMessage(res.data.msg || "🎉 Thank you for your feedback! 🌟");
      setRatingValue(0);
    } catch (err) {
      console.error(err);
      setModalMessage(err.response?.data?.msg || "Failed to submit rating. Please try again.");
    } finally {
      setModalOpen(true);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) {
      setModalMessage("Please enter an email!");
      setModalOpen(true);
      return;
    }
    setSubLoading(true);
    try {
      const res = await axios.post("/subscription", { email: subscriberEmail });
      setModalMessage(res.data.msg || "Subscribed successfully!");
      setSubscriberEmail("");
    } catch (err) {
      console.error(err);
      setModalMessage(err.response?.data?.msg || "Subscription failed. Try again.");
    } finally {
      setSubLoading(false);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => setModalOpen(false);

  return (
    <Root>
      <CssBaseline />

      {/* ✅ Hero Section with FadeUpOnScroll */}
      <FadeUpOnScroll>
        <Container
  component={Main}
  maxWidth="lg"
  sx={{
    position: "relative",
    color: "#fff",
    backgroundColor: "#0f0f0f",
    borderRadius: 6,
    py: 12,
    px: { xs: 3, md: 8 },
    boxShadow: "0 0 40px rgba(0,0,0,0.6)",
    overflow: "hidden",
    textAlign: "center",
    border: "2px solid rgba(255,140,0,0.3)",
    animation: `${pulseOrange} 3s ease-in-out infinite`,
    "&:hover": {
      animation: "none",
      borderColor: "#ff8c00",
      boxShadow: "0 0 50px rgba(255,140,0,0.6)",
    },
  }}
>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              zIndex: 0,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.8rem", md: "3.8rem" },
                letterSpacing: "-0.03em",
                mb: 2,
              }}
            >
              TeamSphere
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.75)",
                mb: 3,
                fontWeight: 400,
              }}
            >
              Complete Employee Management System
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.65)",
                maxWidth: 600,
                mx: "auto",
                mb: 5,
                lineHeight: 1.8,
              }}
            >
              TeamSphere helps organizations manage employee attendance, leaves, overbreaks, and payroll with precision.
              Automate HR tasks, monitor performance, and keep everything organized — all in one place.
            </Typography>

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f57c00",
                color: "#fff",
                px: 4,
                py: 1.5,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#ffa726",
                  transform: "translateY(-2px)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              Schedule a Demo
            </Button>
          </Box>

          {/* Feature Cards */}
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 10, position: "relative", zIndex: 1 }}>
            {[
              {
                title: "Employee Records",
                text: "Maintain complete employee profiles — including details, roles, and performance records — in a secure and centralized database.",
                color: "#e53935",
              },
              {
                title: "Attendance & Leave",
                text: "Track daily attendance, absences, late arrivals, and overbreaks automatically with accurate time-based monitoring.",
                color: "#1e88e5",
              },
              {
                title: "Payroll Automation",
                text: "Generate accurate payrolls based on employee attendance and leave data — ensuring fair and transparent compensation.",
                color: "#fb8c00",
              },
            ].map((card, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Box
                  sx={{
                    p: 4,
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: 4,
                    textAlign: "left",
                    border: "1px solid rgba(255,255,255,0.1)",
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      border: `1px solid ${card.color}`,
                      boxShadow: `0 12px 32px ${card.color}40`,
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: card.color, fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    {card.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FadeUpOnScroll>

      {/* ✅ Footer with FadeUpOnScroll */}
      <FadeUpOnScroll delay={300}>
        <FooterContainer component="footer">
          <Grid container spacing={4} maxWidth="xl" mx="auto">
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Box component="img" src={Logo} alt="Logo" sx={{ height: 40, mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Helping businesses manage teams efficiently and intelligently.
                </Typography>
                <Box>
                  {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, idx) => (
                    <IconButton key={idx} sx={{ color: "#fff", "&:hover": { color: "#f57c00" } }}>
                      <Icon />
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>

            {[{ title: "App", links: appPages },
              { title: "Resources", links: resourcesPages },
              { title: "Company", links: companyPages },
              { title: "Legal", links: legalPages }].map((col, idx) => (
              <Grid key={idx} item xs={6} sm={3} lg={2}>
                <Typography variant="overline" sx={{ mb: 2 }}>
                  {col.title}
                </Typography>
                {col.links.map((page) => (
                  <Typography
                    key={page}
                    component="a"
                    href={`/${page}`}
                    sx={{ ...footerLinkStyles, mb: 1, display: "block" }}
                  >
                    {page}
                  </Typography>
                ))}
              </Grid>
            ))}

            {/* Newsletter */}
            <Grid item xs={12} sm={12} lg={4}>
              <Typography variant="overline">Subscribe to newsletter</Typography>
              <Box component="form" onSubmit={handleSubscribe} noValidate autoComplete="off">
                <TextField
                  fullWidth
                  type="email"
                  label="Enter your email"
                  variant="outlined"
                  size="small"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  sx={{
                    mb: 2,
                    input: { color: "#fff" },
                    label: { color: "#fff" },
                    "& .MuiOutlinedInput-root fieldset": { borderColor: "#fff" },
                    "&:hover fieldset": { borderColor: "#f57c00" },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "#f57c00",
                    "&:hover": { backgroundColor: "#ffa726" },
                  }}
                  disabled={subLoading}
                >
                  {subLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </Box>
            </Grid>

            {/* Rate Us */}
            <Grid item xs={12} sm={12} lg={4}>
              <Typography variant="overline">Rate Us</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Rating
  value={ratingValue}
  onChange={(e, newValue) => setRatingValue(newValue)}
  sx={{
    "& .MuiRating-iconEmpty": { color: "#fff" }, 
    "& .MuiRating-iconFilled": { color: "#FFB400" }, 
    "& .MuiRating-iconHover": { color: "#FFD700" }, 
  }}
/>

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleRateUs}
                  sx={{
                    ml: 1,
                    bgcolor: "#FF8C00",
                    "&:hover": { bgcolor: "#FFC107" },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: "grey.600" }} />
          <Typography variant="body2" textAlign="center">
            © {new Date().getFullYear()} All Rights Reserved by Niko MP
          </Typography>
        </FooterContainer>
      </FadeUpOnScroll>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Message</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              bgcolor: "#2e7d32",
              color: "#FFF",
              "&:hover": { bgcolor: "#1b4d21" },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}
