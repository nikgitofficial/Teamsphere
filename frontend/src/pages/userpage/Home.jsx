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
  Tooltip,
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
  const [allEmployees, setAllEmployees] = useState([]);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [totalLeave, setTotalLeave] = useState(0);
  const [totalAttendanceToday, setTotalAttendanceToday] = useState(0);
  const [attendanceRemarks, setAttendanceRemarks] = useState([]);
  const [todayAttendanceList, setTodayAttendanceList] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogList, setDialogList] = useState([]);

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
        setRecentEmployees(res.data.slice(-5).reverse());
        setAllEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    const fetchAttendanceStats = async () => {
      try {
        const res = await axios.get("/attendance-remarks", { withCredentials: true });
        const remarks = res.data;
        setAttendanceRemarks(remarks);
        setTotalAbsent(remarks.filter((r) => r.type === "Absent").length);
        setTotalLeave(remarks.filter((r) => r.type === "OnLeave").length);
      } catch (err) {
        console.error("Error fetching attendance stats:", err);
      }
    };

    const fetchTodayAttendance = async () => {
      try {
        const res = await axios.get("/attendance/today/all", { withCredentials: true });
        let attendancesToday = res.data.attendances || res.data || [];
        const seen = new Set();
        attendancesToday = attendancesToday.filter((att) => {
          if (seen.has(att.employee._id)) return false;
          seen.add(att.employee._id);
          return true;
        });
        setTotalAttendanceToday(attendancesToday.length);
        setTodayAttendanceList(attendancesToday);
      } catch (err) {
        console.error("Error fetching today's attendance:", err);
      }
    };

    fetchEmployeeCount();
    fetchEmployees();
    fetchAttendanceStats();
    fetchTodayAttendance();
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
    } else if (type === "TodayAttendance") {
      filtered = todayAttendanceList;
      setDialogTitle("Present Today");
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
      bgColor: "linear-gradient(135deg, #42a5f5, #1e88e5)",
    },
    {
      title: "Departments",
      value: 8,
      icon: <ApartmentIcon sx={{ fontSize: 40, color: "white" }} />,
      bgColor: "linear-gradient(135deg, #66bb6a, #388e3c)",
    },
    {
      title: "Attendance Today",
      value: totalAttendanceToday,
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: "white" }} />,
      clickable: true,
      type: "TodayAttendance",
      bgColor: "linear-gradient(135deg, #ffa726, #f57c00)",
    },
    {
      title: "Pending Payroll",
      value: 5,
      icon: <PaymentIcon sx={{ fontSize: 40, color: "white" }} />,
      bgColor: "linear-gradient(135deg, #26c6da, #0097a7)",
    },
    {
      title: "Total Absent",
      value: totalAbsent,
      icon: <EventBusyIcon sx={{ fontSize: 40, color: "white" }} />,
      clickable: true,
      type: "Absent",
      bgColor: "linear-gradient(135deg, #ef5350, #c62828)",
    },
    {
      title: "Total Leave",
      value: totalLeave,
      icon: <BeachAccessIcon sx={{ fontSize: 40, color: "white" }} />,
      clickable: true,
      type: "OnLeave",
      bgColor: "linear-gradient(135deg, #ab47bc, #6a1b9a)",
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
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Welcome {user?.name || "User"} 👋
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpiCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              {card.clickable ? (
                <Tooltip title="View Table" arrow>
                  <Card
                    onClick={() => handleCardClick(card.type)}
                    sx={{
                      borderRadius: 4,
                      height: 150,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      cursor: "pointer",
                      boxShadow: 6,
                      transition: "all 0.3s ease",
                      background: card.bgColor,
                      "&:hover": {
                        transform: "translateY(-6px)",
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
                </Tooltip>
              ) : (
                <Card
                  sx={{
                    borderRadius: 4,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow: 6,
                    transition: "all 0.3s ease",
                    background: card.bgColor,
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
              )}
            </Grid>
          ))}
        </Grid>

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
                ? dialogList.map((emp) => {
                    // Map work status to color
                    let statusColor = "text.secondary";
                    switch (emp.workStatus) {
                      case "Active":
                        statusColor = "success.main";
                        break;
                      case "Inactive":
                        statusColor = "error.main";
                        break;
                      case "Probation":
                        statusColor = "warning.main";
                        break;
                      case "Suspended":
                        statusColor = "orange";
                        break;
                      default:
                        statusColor = "text.secondary";
                    }

                    return (
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
                              <Typography variant="body2" fontWeight="bold" color={statusColor}>
                                <b>Work Status:</b> {emp.workStatus || "Active"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Hired: {new Date(emp.createdAt).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })
                : dialogTitle === "Present Today"
                ? dialogList.map((att) => (
                    <ListItem key={att._id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={att.employee?.profilePic}>
                          {att.employee?.fullName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight="bold">{att.employee?.fullName}</Typography>}
                        secondary={
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={att.status === "Present" ? "success.main" : "error.main"}
                          >
                            <b>Status:</b> {att.status}
                          </Typography>
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
