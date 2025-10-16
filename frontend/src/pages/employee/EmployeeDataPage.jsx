import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import employeeAxios from "../../api/employeeAxios";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import BadgeIcon from "@mui/icons-material/Badge";
import EmergencyIcon from "@mui/icons-material/ContactEmergency";

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

const EmployeeDataPage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const storedEmployee = JSON.parse(localStorage.getItem("employee"));
        if (!storedEmployee || !storedEmployee._id) {
          setError("No employee found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await employeeAxios.get(
          `/employee-auth/me/${storedEmployee._id}`
        );
        setEmployee(res.data);
      } catch (err) {
        console.error("Error fetching employee data:", err);
        setError("Error fetching employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  // Reusable modern card with icon and gradient
  const InfoCard = ({ title, children, icon, colorStart, colorEnd, delay }) => (
    <FadeUpOnScroll delay={delay}>
      <Paper
        elevation={6}
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: "background.paper",
          background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`,
          color: "#fff",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 6,
          },
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 50,
              height: 50,
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.5)" }} />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {children}
        </Box>
      </Paper>
    </FadeUpOnScroll>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
        <Skeleton
          variant="rectangular"
          height={180}
          sx={{ mb: 3, borderRadius: 4 }}
        />
        <Grid container spacing={3}>
          {Array.from(new Array(4)).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{ borderRadius: 4 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      {/* Profile Header */}
      <FadeUpOnScroll>
        <Paper
          elevation={6}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
          }}
        >
          <Avatar
            src={employee?.profilePic || ""}
            alt={employee?.fullName}
            sx={{ width: 100, height: 100, fontSize: 36 }}
          >
            {employee?.fullName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {employee?.fullName}
            </Typography>
            <Typography variant="body1">
              {employee?.position} — {employee?.department}
            </Typography>
            <Typography variant="body2" color="success.main">
              {employee?.workStatus}
            </Typography>
          </Box>
        </Paper>
      </FadeUpOnScroll>

      <Grid container spacing={3}>
        {/* Personal Info */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Personal Information"
            icon={<PersonIcon />}
            colorStart="#f2994a"
            colorEnd="#f2c94c"
            delay={100}
          >
            <Typography>Email: {employee?.email}</Typography>
            <Typography>Phone: {employee?.phone}</Typography>
            <Typography>Address: {employee?.address}</Typography>
            <Typography>
              Birthdate: {employee?.birthdate?.slice(0, 10) || "—"}
            </Typography>
            <Typography>Age: {employee?.age}</Typography>
            <Typography>Gender: {employee?.gender}</Typography>
            <Typography>Civil Status: {employee?.status}</Typography>
          </InfoCard>
        </Grid>

        {/* Work Info */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Work Information"
            icon={<WorkIcon />}
            colorStart="#56ab2f"
            colorEnd="#a8e063"
            delay={200}
          >
            <Typography>Employee ID: {employee?._id}</Typography>
            <Typography>Hire Date: {employee?.hireDate?.slice(0, 10)}</Typography>
            <Typography>Salary: {employee?.salary}</Typography>
            <Typography>Rate/Hour: {employee?.ratePerHour}</Typography>
            <Typography>Shift: {employee?.shift}</Typography>
            <Typography>
              Rest Days: {employee?.restDays?.join(", ") || "None"}
            </Typography>
          </InfoCard>
        </Grid>

        {/* Government IDs */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Government IDs"
            icon={<BadgeIcon />}
            colorStart="#36d1dc"
            colorEnd="#5b86e5"
            delay={300}
          >
            <Typography>SSS: {employee?.sss}</Typography>
            <Typography>TIN: {employee?.tin}</Typography>
            <Typography>Pag-IBIG: {employee?.pagibig}</Typography>
            <Typography>PhilHealth: {employee?.philhealth}</Typography>
          </InfoCard>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Emergency Contact"
            icon={<EmergencyIcon />}
            colorStart="#ff6a00"
            colorEnd="#ee0979"
            delay={400}
          >
            <Typography>
              {employee?.emergencyContact?.name} (
              {employee?.emergencyContact?.relation})
            </Typography>
            <Typography>{employee?.emergencyContact?.phone}</Typography>
          </InfoCard>
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDataPage;
