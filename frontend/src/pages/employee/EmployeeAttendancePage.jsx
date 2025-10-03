import { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  TextField,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Pagination,
  useTheme,
} from "@mui/material";
import employeeAxios from "../../api/employeeAxios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EmployeeAttendancePage = () => {
  const theme = useTheme(); // Access current theme
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const fetchAttendance = async () => {
    try {
      const storedEmployee = JSON.parse(localStorage.getItem("employee"));
      if (!storedEmployee?._id) {
        setError("No employee found. Please login again.");
        return;
      }
      if (!startDate || !endDate) {
        setError("Please select start and end dates.");
        return;
      }

      setLoading(true);
      const res = await employeeAxios.post(`/attendance/employee`, {
        employeeId: storedEmployee._id,
        startDate,
        endDate,
      });

      setAttendances(res.data.attendances || []);
      setCurrentPage(1); // reset pagination
    } catch (err) {
      console.error("Error fetching attendance:", err);
      const errorMsg = err.response?.data?.msg || "Failed to fetch attendance.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderTimes = (times = [], lateFlags = [], overBreakFlags = []) =>
    times.length
      ? times.map((t, idx) => {
          let label = new Date(t).toLocaleTimeString();
          if (lateFlags[idx]) label += " (Late)";
          if (overBreakFlags[idx]) label += " (Over Break)";
          return (
            <Typography
              key={idx}
              sx={{
                fontSize: 14,
                color:
                  lateFlags[idx] || overBreakFlags[idx]
                    ? theme.palette.error.main
                    : "inherit",
                fontWeight: lateFlags[idx] || overBreakFlags[idx] ? 600 : 400,
              }}
            >
              {label}
            </Typography>
          );
        })
      : "-";

  const calculateTotalHours = (a) => {
    if (!a.checkIns?.length || !a.checkOuts?.length) return "0:00:00";
    let totalMs = 0;
    for (let i = 0; i < a.checkIns.length; i++) {
      const checkIn = new Date(a.checkIns[i]);
      const checkOut = a.checkOuts[i] ? new Date(a.checkOuts[i]) : null;
      if (!checkOut) continue;
      let sessionMs = checkOut - checkIn;

      if (a.breakOuts?.length && a.breakIns?.length) {
        for (let j = 0; j < a.breakOuts.length; j++) {
          const bOut = new Date(a.breakOuts[j]);
          const bIn = a.breakIns?.[j] ? new Date(a.breakIns[j]) : new Date();
          if (bOut >= checkIn && bIn <= checkOut) {
            sessionMs -= bIn - bOut;
          }
        }
      }
      totalMs += sessionMs;
    }
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const allowedBreakMs = 60 * 60 * 1000; // 1 hour
  const getBreakStatus = (attendance) => {
    return attendance.checkIns.map((ci, idx) => {
      const co = attendance.checkOuts?.[idx]
        ? new Date(attendance.checkOuts[idx])
        : new Date();
      let sessionBreakMs = 0;
      for (let j = 0; j < attendance.breakOuts?.length; j++) {
        const bOut = new Date(attendance.breakOuts[j]);
        const bIn = attendance.breakIns?.[j]
          ? new Date(attendance.breakIns[j])
          : new Date();
        if (bOut >= new Date(ci) && bIn <= co) {
          sessionBreakMs += bIn - bOut;
        }
      }
      return sessionBreakMs > allowedBreakMs;
    });
  };

  const isLate = (a, checkInTime) => {
    if (!checkInTime) return false;
    const shiftStr = a.employee?.shift || "9:00am-5:00pm";
    const [startStr] = shiftStr.split("-").map((s) => s.trim().toLowerCase());

    const match = startStr.match(/(\d+)(?::(\d+))?(am|pm)/i);
    if (!match) return false;

    let hour = parseInt(match[1], 10);
    let minute = parseInt(match[2] || "0", 10);
    const meridian = match[3].toLowerCase();
    if (meridian === "pm" && hour !== 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;

    const shiftStart = new Date(checkInTime);
    shiftStart.setHours(hour, minute, 0, 0);

    const checkIn = new Date(checkInTime);
    return checkIn > shiftStart;
  };

  const getStatusProps = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return { color: "success", icon: <CheckCircleIcon fontSize="small" /> };
      case "late":
        return { color: "warning", icon: <WarningAmberIcon fontSize="small" /> };
      case "absent":
        return { color: "error", icon: <ErrorIcon fontSize="small" /> };
      default:
        return { color: "default", icon: null };
    }
  };

  const handlePageChange = (event, value) => setCurrentPage(value);

  // Pagination slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAttendances = attendances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(attendances.length / itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      attendances.map((a) => ({
        Date: a.date ? new Date(a.date).toLocaleDateString() : "-",
        "Check In(s)":
          a.checkIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        "Break Out(s)":
          a.breakOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        "Break In(s)":
          a.breakIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        "Check Out(s)":
          a.checkOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        "Total Hours": calculateTotalHours(a),
        Status: a.status || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendances");
    XLSX.writeFile(workbook, "attendances.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Records", 14, 15);
    autoTable(doc, {
      head: [["Date","Check In(s)","Break Out(s)","Break In(s)","Check Out(s)","Total Hours","Status"]],
      body: attendances.map((a) => [
        a.date ? new Date(a.date).toLocaleDateString() : "-",
        a.checkIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        a.breakOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        a.breakIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        a.checkOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") || "-",
        calculateTotalHours(a),
        a.status || "-",
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("attendances.pdf");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 3, fontWeight: 700, color: "text.primary" }}
      >
        My Attendance
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={fetchAttendance}
          disabled={loading}
          sx={{ height: 56 }}
        >
          View
        </Button>
        <Button variant="outlined" color="success" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="outlined" color="error" onClick={exportToPDF}>
          Export PDF
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={50} />
        </Box>
      ) : attendances.length > 0 ? (
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Table>
              <TableHead
                sx={{
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[800]
                      : theme.palette.primary.light,
                  "& th": {
                    color: "white",
                    fontWeight: 700,
                    fontSize: 14,
                  },
                }}
              >
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check In(s)</TableCell>
                  <TableCell>Break Out(s)</TableCell>
                  <TableCell>Break In(s)</TableCell>
                  <TableCell>Check Out(s)</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentAttendances.map((a, i) => {
                  const breakStatus = getBreakStatus(a);
                  return (
                    <TableRow
                      key={i}
                      sx={{
                        "&:nth-of-type(even)": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[900]
                              : theme.palette.grey[100],
                        },
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[800]
                              : theme.palette.grey[200],
                        },
                      }}
                    >
                      <TableCell sx={{ color: "text.primary" }}>
                        {a.date ? new Date(a.date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {renderTimes(
                          a.checkIns,
                          a.checkIns.map((t) => isLate(a, t)),
                          []
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {renderTimes(a.breakOuts, [], breakStatus)}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {renderTimes(a.breakIns, [], breakStatus)}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {renderTimes(a.checkOuts)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                        {calculateTotalHours(a)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={a.status || "-"}
                          color={getStatusProps(a.status).color}
                          icon={getStatusProps(a.status).icon}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
        </>
      ) : (
        <Typography
          sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
        >
          No attendance records
        </Typography>
      )}

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

export default EmployeeAttendancePage;
