import { Box, Typography, Container, Paper, Stack, Button } from "@mui/material";
import { Info, Assignment, CloudUpload, Security } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          background: "linear-gradient(135deg, #f5f7fa, #e6e9f0)",
        }}
      >
        {/* Title */}
        <Stack spacing={2} alignItems="center" mb={4}>
          <Info sx={{ fontSize: 50, color: "primary.main" }} />
          <Typography variant="h4" fontWeight="bold" color="primary">
            About Personal Record Keeper
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" maxWidth="600px">
            A modern and secure platform to manage your personal details, government IDs, 
            attendance, payroll, and file uploads – all in one place.
          </Typography>
        </Stack>

        {/* Features Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
          mb={4}
        >
          <Paper elevation={2} sx={{ p: 3, flex: 1, borderRadius: 2 }}>
            <Assignment color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" fontWeight="bold" mt={2}>
              Manage Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep track of your government IDs, personal details, and employee records in a 
              structured and secure system.
            </Typography>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, flex: 1, borderRadius: 2 }}>
            <CloudUpload color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" fontWeight="bold" mt={2}>
              Upload Files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Store important files safely in the cloud with search, preview, and easy download features.
            </Typography>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, flex: 1, borderRadius: 2 }}>
            <Security color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" fontWeight="bold" mt={2}>
              Secure & Private
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your data is encrypted and stored securely. Only you can access your personal information.
            </Typography>
          </Paper>
        </Stack>

        {/* Call to Action */}
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/login")}
          sx={{ borderRadius: 2 }}
        >
          Get Started
        </Button>
      </Paper>
    </Container>
  );
};

export default About;
