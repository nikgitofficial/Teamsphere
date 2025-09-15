import React, { useState } from "react";
import { Box, Grid, Typography, TextField, Button, IconButton, Divider, Container, Dialog, DialogTitle, DialogContent, DialogActions, Rating } from "@mui/material";
import { Facebook, Twitter, LinkedIn, Instagram } from "@mui/icons-material";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Logo from "../assets/logo.png";
import axios from "../api/axios";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

const Main = styled("main")(({ theme }) => ({
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(2),
}));

const FooterContainer = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  bgcolor: "red",
  color: "#fff",
  py: theme.spacing(6),
  px: theme.spacing(4),
}));

export default function StickyFooter() {
  const appPages = ["PublicHome", "Dashboard", "Login", "Register", "ForgotPassword", "Profile", "Settings"];
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

  // NEW: Handle subscription
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
      <Container component={Main} maxWidth="lg" sx={{ mt: 6 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Niko Nikonik
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.secondary' }}>
            Your Personal Media Hub
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Niko Nikonik is a secure platform for managing your media. Sign in to upload, organize, and share your videos, images, and other media effortlessly. Access your content anytime, anywhere, with a smooth and intuitive user experience.
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 4, bgcolor: '#f44336', color: '#fff', borderRadius: 3, textAlign: 'center', boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
              <Typography variant="h6" gutterBottom>Upload Media</Typography>
              <Typography variant="body2">Upload videos, images, and other media securely with just a few clicks.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 4, bgcolor: '#1976d2', color: '#fff', borderRadius: 3, textAlign: 'center', boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
              <Typography variant="h6" gutterBottom>Organize Content</Typography>
              <Typography variant="body2">Manage your files easily with folders, tags, and smart search functionality.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 4, bgcolor: '#ff9800', color: '#fff', borderRadius: 3, textAlign: 'center', boxShadow: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 } }}>
              <Typography variant="h6" gutterBottom>Share & Access</Typography>
              <Typography variant="body2">Share your media with friends or keep it private. Access from any device, anytime.</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <FooterContainer component="footer">
        <Grid container spacing={4} maxWidth="xl" mx="auto">
          {/* Logo & Description */}
          <Grid item xs={12} sm={6} lg={4}>
            <Box>
              <Box component="img" src={Logo} alt="Logo" sx={{ height: 40, mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 2, color: "#000" }}>Velit officia consequat duis enim velit mollit. Lorem ipsum dolor sit amet.</Typography>
              <Box>
                <IconButton aria-label="Facebook" sx={{ color: "#000", "&:hover": { color: "#3b82f6" } }}><Facebook /></IconButton>
                <IconButton aria-label="Twitter" sx={{ color: "#000", "&:hover": { color: "#3b82f6" } }}><Twitter /></IconButton>
                <IconButton aria-label="LinkedIn" sx={{ color: "#000", "&:hover": { color: "#3b82f6" } }}><LinkedIn /></IconButton>
                <IconButton aria-label="Instagram" sx={{ color: "#000", "&:hover": { color: "#3b82f6" } }}><Instagram /></IconButton>
              </Box>
            </Box>
          </Grid>

          {/* Links Columns */}
          {[{title:"App",links:appPages},{title:"Resources",links:resourcesPages},{title:"Company",links:companyPages},{title:"Legal",links:legalPages}].map((col,idx)=>(
            <Grid key={idx} item xs={6} sm={3} lg={2}>
              <Typography variant="overline" sx={{ mb: 2, color: "#000" }}>{col.title}</Typography>
              <Box>{col.links.map((page)=><Typography key={page} component="a" href={`/${page}`} sx={{ display: "block", color: "#000", textDecoration: "none", mb: 1, "&:hover": { color: "#b58900" } }}>{page}</Typography>)}</Box>
            </Grid>
          ))}

          {/* Newsletter */}
          <Grid item xs={12} sm={12} lg={4}>
            <Typography variant="overline" sx={{ mb: 2, color: "#000" }}>Subscribe to newsletter</Typography>
            <Box component="form" noValidate autoComplete="off" onSubmit={handleSubscribe}>
              <TextField
                fullWidth
                type="email"
                label="Enter your email"
                variant="outlined"
                size="small"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                sx={{ mb:2,input:{color:"#000"},label:{color:"#000"},"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#000"},"&:hover fieldset":{borderColor:"#b58900"},"&.Mui-focused fieldset":{borderColor:"#b58900"}}}}
              />
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ backgroundColor: "#b58900", "&:hover": { backgroundColor: "#946800" } }}
                disabled={subLoading}
              >
                {subLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </Box>
          </Grid>

          {/* Rate Us Section */}
          <Grid item xs={12} sm={12} lg={4}>
            <Typography variant="overline" sx={{ mb: 2, color: "#000" }}>Rate Us</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Rating
                name="rate-us"
                value={ratingValue}
                onChange={(event, newValue) => setRatingValue(newValue)}
                sx={{ color: "#FFD700" }}
              />
              <Button variant="contained" size="small" onClick={handleRateUs} sx={{ ml: 1, bgcolor: "#FFD700", color: "#000", "&:hover": { bgcolor: "#FFC107" } }}>Submit</Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "grey.600" }} />
        <Typography
          variant="body2"
          sx={{ color: "#000" }}
          textAlign="center"
        >
          © {new Date().getFullYear()} All Rights Reserved by Niko MP
        </Typography>
      </FooterContainer>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Message</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" sx={{ bgcolor: "#2e7d32", color: "#FFF", "&:hover": { bgcolor: "#1b4d21" } }}>OK</Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}