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
  Pagination,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const [pincode, setPincode] = useState(localStorage.getItem("pincode") || "");
  const [openPinModal, setOpenPinModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [clock, setClock] = useState(new Date());
  const [message, setMessage] = useState("");
  const [attendances, setAttendances] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const rowsPerPage = 20;

  const { user } = useContext(AuthContext);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Redirect unauthorized access
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // Lock page navigation until checkout
  useEffect(() => {
    const locked = localStorage.getItem("attendanceLocked");
    if (locked) {
      window.history.pushState(null, "", "/attendance");
      const handlePopState = () =>
        window.history.pushState(null, "", "/attendance");
      window.addEventListener("popstate", handlePopState);
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
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

  // Fetch all attendances
  const fetchAllAttendances = async () => {
    try {
      const res = await axios.get(`/attendance/all`, {
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
      const res = await axios.post(
        `/attendance/${action}`,
        { pincode },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        }
      );
      setMessage(res.data.msg);

      // Store / remove lock
      localStorage.setItem("pincode", pincode);
      if (action !== "checkout") localStorage.setItem("attendanceLocked", "true");
      else localStorage.removeItem("attendanceLocked");

      // Refresh attendance list
      fetchAllAttendances();

      // ✅ Clear pincode field after button click
      setPincode("");
      localStorage.removeItem("pincode");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error recording attendance");
    }
  };

  // 🔎 Filter attendances
  const filteredAttendances = attendances.filter((a) => {
    const name = a.employee?.fullName?.toLowerCase() || "";
    const pin = a.employee?.pincode?.toString() || "";
    return (
      name.includes(search.toLowerCase()) || pin.includes(search.trim())
    );
  });

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredAttendances.length / rowsPerPage);
  const paginatedAttendances = filteredAttendances.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      bgcolor={theme.palette.mode === "light" ? "#f9f9f9" : "background.default"}
      py={5}
      px={2}
    >
      {/* Clock Card */}
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mb: 4,
          width: "100%",
          maxWidth: 500,
          textAlign: "center",
          borderRadius: 3,
          background: theme.palette.mode === "light" ? "#fff" : "grey.900",
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {clock.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
        <Typography
          variant={isMobile ? "h4" : "h2"}
          fontWeight="bold"
          color="primary"
        >
          {clock.toLocaleTimeString()}
        </Typography>
      </Paper>

      {/* Pincode Input */}
      <TextField
        type="password"
        label="Enter Pincode"
        variant="outlined"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        sx={{ mb: 3, width: "100%", maxWidth: 400 }}
      />

      {/* Action Buttons */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        flexWrap="wrap"
        justifyContent="center"
        mb={3}
        sx={{ width: "100%", maxWidth: 600 }}
      >
        <Button
          fullWidth={isMobile}
          variant="contained"
          color="success"
          onClick={() => handleAction("checkin")}
        >
          Check In
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          color="warning"
          onClick={() => handleAction("breakout")}
        >
          Break Out
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          color="info"
          onClick={() => handleAction("breakin")}
        >
          Break In
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          color="error"
          onClick={() => handleAction("checkout")}
        >
          Check Out
        </Button>
      </Stack>

      {/* Message Alert */}
      {message && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            width: "100%",
            maxWidth: 600,
            borderRadius: 2,
          }}
        >
          {message}
        </Alert>
      )}

      {/* 🔎 Search */}
      <TextField
        label="Search by Name or PIN"
        variant="outlined"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 3, width: "100%", maxWidth: 500 }}
      />

      {/* Attendance Table */}
      {attendances.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 1000,
            borderRadius: 3,
            overflowX: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={2}
            py={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Attendance Records
            </Typography>
          </Box>
          <Divider />
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                {[
                  "Employee",
                  "Date",
                  "Check In(s)",
                  "Break Out(s)",
                  "Break In(s)",
                  "Check Out(s)",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ fontWeight: "bold", bgcolor: "grey.100" }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAttendances.map((a) => (
                <TableRow
                  key={a._id}
                  hover
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={a.employee?.profilePic || ""}
                        alt={a.employee?.fullName || "User"}
                        sx={{ width: 36, height: 36 }}
                      >
                        {a.employee?.fullName?.[0] || "?"}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="500">
                          {a.employee?.fullName}
                        </Typography>
                       <Typography variant="caption" color="text.secondary">
                          PIN: ••••{a.employee?.pincode?.slice(-2) || "--"}
                         </Typography>

                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {a.date
                      ? new Date(a.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {a.checkIns?.length
                      ? a.checkIns.map((t, idx) => (
                          <div key={idx}>
                            {new Date(t).toLocaleTimeString()}
                          </div>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {a.breakOuts?.length
                      ? a.breakOuts.map((t, idx) => (
                          <div key={idx}>
                            {new Date(t).toLocaleTimeString()}
                          </div>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {a.breakIns?.length
                      ? a.breakIns.map((t, idx) => (
                          <div key={idx}>
                            {new Date(t).toLocaleTimeString()}
                          </div>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {a.checkOuts?.length
                      ? a.checkOuts.map((t, idx) => (
                          <div key={idx}>
                            {new Date(t).toLocaleTimeString()}
                          </div>
                        ))
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
};

export default Attendance;
