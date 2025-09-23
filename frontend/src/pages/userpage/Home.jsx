import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentEmployees, setRecentEmployees] = useState([]);

  // ✅ Fetch total employees
  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const res = await axios.get("/employees/count", {
          withCredentials: true,
        });
        setTotalEmployees(res.data.total);
      } catch (err) {
        console.error("Error fetching employee count:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentEmployees = async () => {
      try {
        const res = await axios.get("/employees", { withCredentials: true });
        setRecentEmployees(res.data.slice(-5).reverse()); // last 5 employees
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployeeCount();
    fetchRecentEmployees();
  }, []);

  const kpiCards = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      loading,
    },
    {
      title: "Departments",
      value: 8, // 🔹 Replace with backend call later
      icon: <ApartmentIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
    },
    {
      title: "Attendance Today",
      value: 42, // 🔹 Replace with backend call later
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: "warning.main" }} />,
    },
    {
      title: "Pending Payroll",
      value: 5, // 🔹 Replace with backend call later
      icon: <PaymentIcon sx={{ fontSize: 40, color: "success.main" }} />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1200px" }}>
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Welcome {user?.name || "User"} 👋
        </Typography>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpiCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 6,
                  textAlign: "center",
                  p: 2,
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-6px)" },
                }}
              >
                <CardContent>
                  {card.icon}
                  <Typography variant="h6" color="text.secondary" mt={1}>
                    {card.title}
                  </Typography>
                  {card.loading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="primary.main"
                      sx={{ mt: 1 }}
                    >
                      {card.value}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Employees */}
        <Card sx={{ borderRadius: 3, boxShadow: 6 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Hires
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentEmployees.length === 0 ? (
              <Typography color="text.secondary">
                No recent hires found.
              </Typography>
            ) : (
              <List>
                {recentEmployees.map((emp) => (
                  <ListItem key={emp._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={emp.profilePic}>
                        {emp.fullName?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={emp.fullName}
                      secondary={`${emp.position || "Employee"} • ${new Date(
                        emp.createdAt
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Home;
