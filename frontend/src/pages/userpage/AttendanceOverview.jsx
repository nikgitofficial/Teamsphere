import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Assignment } from "@mui/icons-material";

// 🟢 FullCalendar imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const AttendanceOverview = () => {
  const { user } = useContext(AuthContext);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Selected calendar date filter
  const [selectedDate, setSelectedDate] = useState(null);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchAttendances = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = "/attendance/all";
      if (startDate && endDate) {
        url = `/attendance/range?start=${startDate}&end=${endDate}`;
      }
      const { data } = await axios.get(url);
      setAttendances(data.attendances || data);
    } catch (err) {
      console.error(err);
      alert("Error fetching attendances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [user, startDate, endDate]);

  // ✅ Handle calendar date click
  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr).toDateString());
    setCurrentPage(1); // reset pagination
  };

  // Filter + sort
  const filteredAttendances = attendances
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((a) => {
      const matchSearch =
        a.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.employee.pincode.includes(search);

      const matchDate = selectedDate
        ? new Date(a.date).toDateString() === selectedDate
        : true;

      return matchSearch && matchDate;
    });

  // ✅ Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAttendances = filteredAttendances.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const calculateTotalHours = (a) => {
    if (!a.checkIns?.length || !a.checkOuts?.length) return "-";
    let totalMs = 0;
    for (let i = 0; i < a.checkIns.length; i++) {
      const checkIn = new Date(a.checkIns[i]);
      const checkOut = a.checkOuts[i] ? new Date(a.checkOuts[i]) : null;
      if (!checkOut) continue;
      let sessionMs = checkOut - checkIn;
      if (a.breakOuts?.length && a.breakIns?.length) {
        for (let j = 0; j < a.breakOuts.length; j++) {
          const bOut = new Date(a.breakOuts[j]);
          const bIn = a.breakIns[j] ? new Date(a.breakIns[j]) : new Date();
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
    if (!a.employee.shift || !checkInTime) return false;
    const [startStr] = a.employee.shift
      .split("-")
      .map((s) => s.trim().toLowerCase());
    const parseTime = (timeStr, baseDate) => {
      const match = timeStr.match(/(\d+)(?::(\d+))?(am|pm)/i);
      if (!match) return null;
      let hour = parseInt(match[1], 10);
      let minute = parseInt(match[2] || "0", 10);
      const meridian = match[3].toLowerCase();
      if (meridian === "pm" && hour !== 12) hour += 12;
      if (meridian === "am" && hour === 12) hour = 0;
      const d = new Date(baseDate);
      d.setHours(hour, minute, 0, 0);
      return d;
    };
    const checkInDate = new Date(checkInTime);
    let shiftStart = parseTime(startStr, checkInDate);
    if (shiftStart.getHours() < 5 && checkInDate.getHours() >= 20) {
      shiftStart.setDate(shiftStart.getDate() + 1);
    }
    return checkInDate > shiftStart;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredAttendances.map((a) => ({
        Date: a.date ? new Date(a.date).toLocaleDateString() : "-",
        "Full Name": a.employee.fullName,
        Position: a.employee.position,
        Shift: a.employee.shift || "-",
        PIN: a.employee.pincode,
        "Check In(s)":
          a.checkIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        "Break Out(s)":
          a.breakOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        "Break In(s)":
          a.breakIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        "Check Out(s)":
          a.checkOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
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
      head: [
        [
          "Date",
          "Full Name",
          "Position",
          "Shift",
          "PIN",
          "Check In(s)",
          "Break Out(s)",
          "Break In(s)",
          "Check Out(s)",
          "Total Hours",
          "Status",
        ],
      ],
      body: filteredAttendances.map((a) => [
        a.date ? new Date(a.date).toLocaleDateString() : "-",
        a.employee.fullName,
        a.employee.position,
        a.employee.shift || "-",
        a.employee.pincode,
        a.checkIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        a.breakOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        a.breakIns?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        a.checkOuts?.map((t) => new Date(t).toLocaleTimeString()).join(", ") ||
          "-",
        calculateTotalHours(a),
        a.status || "-",
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("attendances.pdf");
  };

  // ✅ Calendar events
  const calendarEvents = attendances.map((a) => ({
    title: `${a.employee.fullName} - ${a.status || "Present"}`,
    start: a.date,
    color:
      a.status === "Absent"
        ? "#e53935"
        : a.status === "OnLeave"
        ? "#1e88e5"
        : "#43a047",
  }));

  return (
    <Box
      p={{ xs: 2, sm: 4 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        mb={3}
      >
        <Assignment fontSize="large" sx={{ mr: 1 }} />
        <Typography variant={isSm ? "h5" : "h4"} fontWeight="bold">
          Attendance Overview
        </Typography>
        <Stack direction="row" spacing={2} mt={isSm ? 2 : 0}>
          <Button variant="contained" color="success" onClick={exportToExcel}>
            Export Excel
          </Button>
          <Button variant="contained" color="error" onClick={exportToPDF}>
            Export PDF
          </Button>
        </Stack>
      </Stack>

      {/* Calendar Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mb: 5,
          borderRadius: 3,
          boxShadow: 6,
          p: 2,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
          📅 Company Attendance Calendar
        </Typography>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={calendarEvents}
          height="auto"
          eventDisplay="block"
          selectable={true}
          editable={false}
          dayMaxEvents={3}
          dateClick={handleDateClick} // ✅ link calendar click
        />
        {selectedDate && (
          <Box textAlign="center" mt={2}>
            <Typography variant="body1" fontWeight="bold">
              Showing records for: {selectedDate}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => setSelectedDate(null)}
            >
              Clear Date Filter
            </Button>
          </Box>
        )}
      </Box>

      {/* Filters */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        mb={2}
        sx={{ maxWidth: 600, width: "100%" }}
      >
        <TextField
          label="Search by Name or PIN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredAttendances.length === 0 ? (
        <Typography mt={2} color="textSecondary">
          No attendance records found.
        </Typography>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, maxWidth: 1200 }}
          >
            <Table>
              <TableHead
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[900]
                      : theme.palette.grey[200],
                  "& .MuiTableCell-root": {
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.common.white
                        : theme.palette.text.primary,
                    fontWeight: "bold",
                    textAlign: "center",
                  },
                }}
              >
                <TableRow>
                  <TableCell>
                    <b>Date</b>
                  </TableCell>
                  <TableCell>
                    <b>Full Name</b>
                  </TableCell>
                  <TableCell>
                    <b>Position</b>
                  </TableCell>
                  <TableCell>
                    <b>Shift</b>
                  </TableCell>
                  <TableCell>
                    <b>PIN</b>
                  </TableCell>
                  <TableCell>
                    <b>Check In(s)</b>
                  </TableCell>
                  <TableCell>
                    <b>Break Out(s)</b>
                  </TableCell>
                  <TableCell>
                    <b>Break In(s)</b>
                  </TableCell>
                  <TableCell>
                    <b>Check Out(s)</b>
                  </TableCell>
                  <TableCell>
                    <b>Total Hours</b>
                  </TableCell>
                  <TableCell>
                    <b>Status</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentAttendances.map((a) => {
                  const breakStatus = getBreakStatus(a);
                  return (
                    <TableRow key={a._id} hover>
                      <TableCell>
                        {a.date ? new Date(a.date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{a.employee.fullName}</TableCell>
                      <TableCell>{a.employee.position}</TableCell>
                      <TableCell>{a.employee.shift || "-"}</TableCell>
                      <TableCell>{a.employee.pincode}</TableCell>
                      <TableCell>
                        {a.checkIns?.map((t, idx) => {
                          const late = isLate(a, t);
                          return (
                            <div
                              key={idx}
                              style={{
                                color: late ? "red" : "inherit",
                                fontWeight: late ? "bold" : "normal",
                              }}
                            >
                              {new Date(t).toLocaleTimeString()}
                              {late && " (Late)"}
                            </div>
                          );
                        }) || "-"}
                      </TableCell>
                      <TableCell>
                        {a.breakOuts?.map((t, idx) => (
                          <div
                            key={idx}
                            style={{
                              color: breakStatus[idx] ? "red" : "inherit",
                              fontWeight: breakStatus[idx] ? "bold" : "normal",
                            }}
                          >
                            {new Date(t).toLocaleTimeString()}
                            {breakStatus[idx] && " (Over Break)"}
                          </div>
                        )) || "-"}
                      </TableCell>
                      <TableCell>
                        {a.breakIns?.map((t, idx) => (
                          <div
                            key={idx}
                            style={{
                              color: breakStatus[idx] ? "red" : "inherit",
                              fontWeight: breakStatus[idx] ? "bold" : "normal",
                            }}
                          >
                            {new Date(t).toLocaleTimeString()}
                            {breakStatus[idx] && " (Over Break)"}
                          </div>
                        )) || "-"}
                      </TableCell>
                      <TableCell>
                        {a.checkOuts?.map((t, idx) => (
                          <div key={idx}>
                            {new Date(t).toLocaleTimeString()}
                          </div>
                        )) || "-"}
                      </TableCell>
                      <TableCell>{calculateTotalHours(a)}</TableCell>
                      <TableCell>
                        <Typography
                          color={
                            a.status === "Absent" ? "error" : "success.main"
                          }
                          fontWeight="bold"
                        >
                          {a.status || "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box mt={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                siblingCount={2}
                boundaryCount={1}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AttendanceOverview;
