import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CommentIcon from "@mui/icons-material/Comment";
import employeeAxios from "../../api/employeeAxios";

// Fade-up on scroll component
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

const Index = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const storedEmployee = JSON.parse(localStorage.getItem("employee"));
        if (!storedEmployee?._id) return;

        const res = await employeeAxios.get(
          `/employee-auth/me/${storedEmployee._id}`
        );
        setEmployee(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Welcome Header */}
      <FadeUpOnScroll>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 2, sm: 3 },
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Avatar
            src={employee?.profilePic || ""}
            alt={employee?.fullName}
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              fontSize: { xs: 28, sm: 36 },
            }}
          >
            {employee?.fullName?.[0]}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, fontSize: { xs: "1.3rem", md: "1.8rem" } }}
            >
              Welcome, {employee?.fullName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {employee?.position} — {employee?.department}
            </Typography>
            <Typography variant="body2" color="success.main">
              {employee?.workStatus}
            </Typography>
          </Box>
        </Paper>
      </FadeUpOnScroll>

      {/* Quick Stats Cards */}
      <Grid container spacing={3}>
        {[
          {
            title: "Payroll",
            icon: <MonetizationOnIcon sx={{ fontSize: 40, mb: 1 }} />,
            description: "View Payslips & Earnings",
            bg: "linear-gradient(135deg, #4caf50, #81c784)",
          },
          {
            title: "Attendance",
            icon: <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />,
            description: "Check your hours & records",
            bg: "linear-gradient(135deg, #2196f3, #64b5f6)",
          },
          {
            title: "Employees",
            icon: <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />,
            description: "View colleagues & departments",
            bg: "linear-gradient(135deg, #ff9800, #ffb74d)",
          },
          {
            title: "Remarks",
            icon: <CommentIcon sx={{ fontSize: 40, mb: 1 }} />,
            description: "View comments & announcements",
            bg: "linear-gradient(135deg, #e91e63, #f06292)",
          },
        ].map((card, index) => (
          <FadeUpOnScroll key={index} delay={index * 100}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={6}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: card.bg,
                  color: "#fff",
                  transition: "0.3s",
                  textAlign: "center",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                {card.icon}
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
                >
                  {card.title}
                </Typography>
                <Typography
                  sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                >
                  {card.description}
                </Typography>
              </Paper>
            </Grid>
          </FadeUpOnScroll>
        ))}
      </Grid>
    </Box>
  );
};

export default Index;
