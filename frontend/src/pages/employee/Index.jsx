import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Badge,
} from "@mui/material";
import Fade from "@mui/material/Fade";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CommentIcon from "@mui/icons-material/Comment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
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
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch employee info
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

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await employeeAxios.get("/announcements");
        const readIds =
          JSON.parse(localStorage.getItem("readAnnouncements")) || [];
        const unread = res.data.filter((a) => !readIds.includes(a._id));
        setAnnouncements(res.data);
        setUnreadCount(unread.length);

        // Auto open dialog if there are unread announcements
        if (unread.length > 0) setOpenDialog(true);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };
    fetchAnnouncements();
  }, []);

  const markAllAsRead = () => {
    const allIds = announcements.map((a) => a._id);
    localStorage.setItem("readAnnouncements", JSON.stringify(allIds));
    setUnreadCount(0);
    setOpenDialog(false);
  };

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
          <Box sx={{ flexGrow: 1 }}>
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

          {/* Announcement Bell */}
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon
              sx={{
                fontSize: 40,
                cursor: "pointer",
                "&:hover": { color: "#ffeb3b" },
              }}
              onClick={() => setOpenDialog(true)}
            />
          </Badge>
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
                <Typography sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                  {card.description}
                </Typography>
              </Paper>
            </Grid>
          </FadeUpOnScroll>
        ))}
      </Grid>

     {/* Announcement Dialog */}
<Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: 3,
      background: "linear-gradient(145deg, #ffffff, #f3f4f6)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      overflow: "hidden",
    },
  }}
>
  <DialogTitle
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontWeight: 700,
      fontSize: "1.25rem",
      color: "#333",
      background: "linear-gradient(to right, #ff9800, #ffc107)",
      color: "white",
      py: 2,
      px: 3,
    }}
  >
    📢 New Announcements
    <Badge
      badgeContent={unreadCount}
      color="error"
      sx={{
        "& .MuiBadge-badge": {
          right: -3,
          top: 8,
          border: "2px solid white",
          padding: "0 4px",
        },
      }}
    />
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
      background: "#fafafa",
      maxHeight: "70vh",
      overflowY: "auto",
      p: 3,
    }}
  >
    {announcements.length === 0 ? (
      <Typography
        textAlign="center"
        color="text.secondary"
        sx={{ mt: 5, fontStyle: "italic" }}
      >
        No announcements.
      </Typography>
    ) : (
      announcements.map((a, index) => (
        <Fade in key={a._id || index} timeout={500 + index * 100}>
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 3,
              background: "white",
              boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#ff9800",
                mb: 0.5,
                fontSize: "1.1rem",
              }}
            >
              {a.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Posted by <strong>{a.author?.username || "Admin"}</strong> •{" "}
              {new Date(a.createdAt).toLocaleString()}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.6,
                color: "#444",
                whiteSpace: "pre-line",
              }}
            >
              {a.content}
            </Typography>
          </Paper>
        </Fade>
      ))
    )}
  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: "space-between",
      px: 3,
      py: 2,
      background: "#f8f9fa",
    }}
  >
    <Button
      onClick={() => setOpenDialog(false)}
      variant="outlined"
      sx={{
        borderColor: "#ff9800",
        color: "#ff9800",
        "&:hover": {
          background: "#fff3e0",
          borderColor: "#fb8c00",
        },
      }}
    >
      Close
    </Button>
    <Button
      onClick={markAllAsRead}
      variant="contained"
      sx={{
        background: "linear-gradient(90deg, #ff9800, #f57c00)",
        fontWeight: 600,
        "&:hover": {
          background: "linear-gradient(90deg, #fb8c00, #ef6c00)",
        },
      }}
    >
      Mark All as Read
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default Index;
