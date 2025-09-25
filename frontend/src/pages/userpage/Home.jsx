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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import EventBusyIcon from "@mui/icons-material/EventBusy"; // Absent
import BeachAccessIcon from "@mui/icons-material/BeachAccess"; // Leave

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]); // ✅ new
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [totalLeave, setTotalLeave] = useState(0);
  const [attendanceRemarks, setAttendanceRemarks] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogList, setDialogList] = useState([]);

  // ✅ Fetch employees and remarks
  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const res = await axios.get("/employees/count", { withCredentials: true });
        setTotalEmployees(res.data.total);
      } catch (err) {
        console.error("Error fetching employee count:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/employees", { withCredentials: true });
        setRecentEmployees(res.data.slice(-5).reverse()); // last 5 employees
        setAllEmployees(res.data); // ✅ store all employees
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    const fetchAttendanceStats = async () => {
      try {
        const res = await axios.get("/attendance-remarks", { withCredentials: true });
        const remarks = res.data;

        setAttendanceRemarks(remarks);

        // Count total Absent and OnLeave
        const absentCount = remarks.filter((r) => r.type === "Absent").length;
        const leaveCount = remarks.filter((r) => r.type === "OnLeave").length;

        setTotalAbsent(absentCount);
        setTotalLeave(leaveCount);
      } catch (err) {
        console.error("Error fetching attendance stats:", err);
      }
    };

    fetchEmployeeCount();
    fetchEmployees();
    fetchAttendanceStats();
  }, []);

  const handleCardClick = (type) => {
    let filtered = [];
    if (type === "Absent") {
      filtered = attendanceRemarks.filter((r) => r.type === "Absent");
      setDialogTitle("Absent Employees");
    } else if (type === "OnLeave") {
      filtered = attendanceRemarks.filter((r) => r.type === "OnLeave");
      setDialogTitle("Employees on Leave");
    } else if (type === "AllEmployees") {
      filtered = allEmployees;
      setDialogTitle("All Employees");
    }

    setDialogList(filtered);
    setOpenDialog(true);
  };

 const kpiCards = [
  {
    title: "Total Employees",
    value: totalEmployees,
    icon: <PeopleIcon sx={{ fontSize: 40, color: "white" }} />,
    loading,
    clickable: true,
    type: "AllEmployees",
    bgColor: "linear-gradient(135deg, #42a5f5, #1e88e5)", // Blue
  },
  {
    title: "Departments",
    value: 8,
    icon: <ApartmentIcon sx={{ fontSize: 40, color: "white" }} />,
    bgColor: "linear-gradient(135deg, #66bb6a, #388e3c)", // Green
  },
  {
    title: "Attendance Today",
    value: 42,
    icon: <AccessTimeIcon sx={{ fontSize: 40, color: "white" }} />,
    bgColor: "linear-gradient(135deg, #ffa726, #f57c00)", // Orange
  },
  {
    title: "Pending Payroll",
    value: 5,
    icon: <PaymentIcon sx={{ fontSize: 40, color: "white" }} />,
    bgColor: "linear-gradient(135deg, #26c6da, #0097a7)", // Teal
  },
  {
    title: "Total Absent",
    value: totalAbsent,
    icon: <EventBusyIcon sx={{ fontSize: 40, color: "white" }} />,
    clickable: true,
    type: "Absent",
    bgColor: "linear-gradient(135deg, #ef5350, #c62828)", // Red
  },
  {
    title: "Total Leave",
    value: totalLeave,
    icon: <BeachAccessIcon sx={{ fontSize: 40, color: "white" }} />,
    clickable: true,
    type: "OnLeave",
    bgColor: "linear-gradient(135deg, #ab47bc, #6a1b9a)", // Purple
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
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Welcome {user?.name || "User"} 👋
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
  {kpiCards.map((card, index) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
      <Card
        onClick={() => card.clickable && handleCardClick(card.type)}
        sx={{
          borderRadius: 4,
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          cursor: card.clickable ? "pointer" : "default",
          boxShadow: 6,
          transition: "all 0.3s ease",
          background: card.bgColor, // ✅ custom bg per card
          "&:hover": {
            transform: card.clickable ? "translateY(-6px)" : "none",
            boxShadow: 10,
          },
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          {card.icon}
          <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
            {card.title}
          </Typography>
          {card.loading ? (
            <CircularProgress size={28} sx={{ mt: 1, color: "white" }} />
          ) : (
            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
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
              <Typography color="text.secondary">No recent hires found.</Typography>
            ) : (
              <List>
                {recentEmployees.map((emp) => (
                  <ListItem key={emp._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={emp.profilePic}>{emp.fullName?.charAt(0)}</Avatar>
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

      {/* Dialog for Absent / Leave / All Employees list */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogTitle}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {dialogList.length === 0 ? (
            <Typography color="text.secondary">No records found.</Typography>
          ) : (
            <List>
              {dialogTitle === "All Employees"
                ? dialogList.map((emp) => (
                    <ListItem key={emp._id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={emp.profilePic}>{emp.fullName?.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight="bold">{emp.fullName}</Typography>}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              <b>Department:</b> {emp.department || "-"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <b>Position:</b> {emp.position || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Hired: {new Date(emp.createdAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                : dialogList.map((item) => (
                    <ListItem key={item._id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={item.employee?.profilePic}>
                          {item.employee?.fullName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography fontWeight="bold">
                            {item.employee?.fullName || "Unknown"} ({item.type})
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              <b>Department:</b> {item.departments || "-"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <b>Reason:</b> {item.reason || "-"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <b>Remarks:</b> {item.remarks || "-"}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={
                                item.status === "Approved"
                                  ? "success.main"
                                  : item.status === "Rejected"
                                  ? "error.main"
                                  : "warning.main"
                              }
                            >
                              <b>Status:</b> {item.status}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home;
