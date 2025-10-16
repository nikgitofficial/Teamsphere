import { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  CircularProgress,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";

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

const Adminhome = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [employeesModalOpen, setEmployeesModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, empCountRes, empListRes] = await Promise.all([
          axios.get("/admin/users"),
          axios.get("/admin/employees/count"),
          axios.get("/admin/employees"),
        ]);

        setUsers(usersRes.data);
        setEmployeeCount(empCountRes.data.total);
        setEmployees(empListRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <FadeUpOnScroll>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 4, textAlign: "center" }}
        >
          👥 Admin Dashboard
        </Typography>
      </FadeUpOnScroll>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        <FadeUpOnScroll delay={100}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={6}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "linear-gradient(135deg, #4caf50, #81c784)",
                color: "#fff",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
              }}
              onClick={() => setUsersModalOpen(true)}
            >
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Total Users
              </Typography>
              <Typography variant="h4">{users.length}</Typography>
            </Paper>
          </Grid>
        </FadeUpOnScroll>

        <FadeUpOnScroll delay={200}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={6}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "linear-gradient(135deg, #ff9800, #ffb74d)",
                color: "#fff",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
              }}
              onClick={() => setEmployeesModalOpen(true)}
            >
              <BadgeIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Total Employees
              </Typography>
              <Typography variant="h4">{employeeCount}</Typography>
            </Paper>
          </Grid>
        </FadeUpOnScroll>
      </Grid>

      {/* Users Modal */}
      <Modal
  open={usersModalOpen}
  onClose={() => setUsersModalOpen(false)}
  aria-labelledby="all-users-modal"
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: "90%", sm: 700 },
      bgcolor: "background.paper",
      borderRadius: 3,
      boxShadow: 24,
      p: 4,
      maxHeight: "80vh",
      overflowY: "auto",
    }}
  >
    <Typography variant="h6" mb={2}>
      All Users
    </Typography>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Created At</TableCell> {/* New column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id} hover>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell> {/* Display date */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box mt={2} textAlign="right">
      <Button
        variant="contained"
        onClick={() => setUsersModalOpen(false)}
        sx={{
          background: "linear-gradient(90deg, #4caf50, #81c784)",
          "&:hover": {
            background: "linear-gradient(90deg, #43a047, #66bb6a)",
          },
        }}
      >
        Close
      </Button>
    </Box>
  </Box>
</Modal>
      
     {/* Employees Modal */}
<Modal
  open={employeesModalOpen}
  onClose={() => setEmployeesModalOpen(false)}
  aria-labelledby="all-employees-modal"
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: "90%", sm: 700 },
      bgcolor: "background.paper",
      borderRadius: 3,
      boxShadow: 24,
      p: 4,
      maxHeight: "80vh",
      overflowY: "auto",
    }}
  >
    <Typography variant="h6" mb={2}>
      All Employees
    </Typography>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Belongs To User</TableCell>
            <TableCell>Joined At</TableCell> {/* New column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={e._id} hover>
              <TableCell>{e.fullName}</TableCell>
              <TableCell>{e.email}</TableCell>
              <TableCell>{e.position}</TableCell>
              <TableCell>{e.user ? e.user.username : "N/A"}</TableCell>
              <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell> {/* Display date */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box mt={2} textAlign="right">
      <Button
        variant="contained"
        onClick={() => setEmployeesModalOpen(false)}
        sx={{
          background: "linear-gradient(90deg, #ff9800, #ffb74d)",
          "&:hover": {
            background: "linear-gradient(90deg, #fb8c00, #ffb347)",
          },
        }}
      >
        Close
      </Button>
    </Box>
  </Box>
</Modal>

      
    </Box>
  );
};

export default Adminhome;
