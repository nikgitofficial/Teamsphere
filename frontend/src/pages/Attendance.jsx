import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack,
  Avatar,
} from "@mui/material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const [pincode, setPincode] = useState(localStorage.getItem("pincode") || "");
  const [clock, setClock] = useState(new Date());
  const [message, setMessage] = useState("");
  const [attendances, setAttendances] = useState([]);
  const { user } = useContext(AuthContext);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // Redirect unauthorized access
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // Lock page navigation until checkout
  useEffect(() => {
    const locked = localStorage.getItem("attendanceLocked");
    if (locked) {
      window.history.pushState(null, "", "/attendance");
      const handlePopState = () => window.history.pushState(null, "", "/attendance");
      window.addEventListener("popstate", handlePopState);
      const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, []);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendances
  const fetchAllAttendances = async () => {
    try {
      const res = await axios.get(`/attendance/today/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      setAttendances(res.data.attendances || []);
    } catch (err) {
      setMessage("Error fetching all attendances");
    }
  };

  useEffect(() => {
    fetchAllAttendances();
  }, [accessToken]);

  const handleAction = async (action) => {
    if (!pincode) return setMessage("Please enter your pincode first");
    try {
      const res = await axios.post(`/attendance/${action}`, { pincode }, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      setMessage(res.data.msg);
      localStorage.setItem("pincode", pincode);
      if (action !== "checkout") localStorage.setItem("attendanceLocked", "true");
      else localStorage.removeItem("attendanceLocked");
      fetchAllAttendances();
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error recording attendance");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" py={5} px={2}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, width: "100%", maxWidth: 400, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {clock.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </Typography>
        <Typography variant="h3" fontWeight="bold">{clock.toLocaleTimeString()}</Typography>
      </Paper>

      <TextField
        type="password"
        label="Enter Pincode"
        variant="outlined"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        sx={{ mb: 3, width: "100%", maxWidth: 300 }}
      />

      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" mb={3}>
        <Button variant="contained" color="success" onClick={() => handleAction("checkin")}>Check In</Button>
        <Button variant="contained" color="warning" onClick={() => handleAction("breakout")}>Break Out</Button>
        <Button variant="contained" color="info" onClick={() => handleAction("breakin")}>Break In</Button>
        <Button variant="contained" color="error" onClick={() => handleAction("checkout")}>Check Out</Button>
      </Stack>

      {message && <Alert severity="info" sx={{ mb: 3, width: "100%", maxWidth: 500 }}>{message}</Alert>}

      {attendances.length > 0 && (
        <TableContainer component={Paper} elevation={3} sx={{ width: "100%", maxWidth: 900 }}>
          <Typography variant="h6" sx={{ p: 2 }}>Today's Attendance</Typography>
          <Table>
            <TableHead>
              <TableRow>
                {["Employee", "Date", "Check In", "Break Out", "Break In", "Check Out"].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: "bold" }}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={a.employee?.profilePic || ""}
                        alt={a.employee?.fullName || "User"}
                        sx={{ width: 36, height: 36 }}
                      >
                        {a.employee?.fullName?.[0] || "?"}
                      </Avatar>
                      <Typography>{a.employee?.fullName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {a.date ? new Date(a.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-"}
                  </TableCell>
                  <TableCell>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{a.breakOut ? new Date(a.breakOut).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{a.breakIn ? new Date(a.breakIn).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Attendance;
