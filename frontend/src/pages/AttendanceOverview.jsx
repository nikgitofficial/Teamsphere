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
} from "@mui/material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Assignment } from "@mui/icons-material";

const AttendanceOverview = () => {
  const { user } = useContext(AuthContext);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      setAttendances(data.attendances);
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

  // Only filter by search, backend handles date range
  const filteredAttendances = attendances.filter((a) => {
    return (
      a.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.employee.pincode.includes(search)
    );
  });

  // Function to calculate total hours in HH:MM:SS format
  const calculateTotalHours = (a) => {
    if (!a.checkIn || !a.checkOut) return "-";

    const checkIn = new Date(a.checkIn);
    const checkOut = new Date(a.checkOut);
    let totalMs = checkOut - checkIn;

    if (a.breakOut && a.breakIn) {
      const breakOut = new Date(a.breakOut);
      const breakIn = new Date(a.breakIn);
      totalMs -= breakIn - breakOut;
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredAttendances.map((a) => ({
        Date: a.date ? new Date(a.date).toLocaleDateString() : "-",
        "Full Name": a.employee.fullName,
        Position: a.employee.position,
        PIN: a.employee.pincode,
        "Check In": a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-",
        "Break Out": a.breakOut ? new Date(a.breakOut).toLocaleTimeString() : "-",
        "Break In": a.breakIn ? new Date(a.breakIn).toLocaleTimeString() : "-",
        "Check Out": a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-",
        "Total Hours": calculateTotalHours(a),
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
          "PIN",
          "Check In",
          "Break Out",
          "Break In",
          "Check Out",
          "Total Hours",
        ],
      ],
      body: filteredAttendances.map((a) => [
        a.date ? new Date(a.date).toLocaleDateString() : "-",
        a.employee.fullName,
        a.employee.position,
        a.employee.pincode,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-",
        a.breakOut ? new Date(a.breakOut).toLocaleTimeString() : "-",
        a.breakIn ? new Date(a.breakIn).toLocaleTimeString() : "-",
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-",
        calculateTotalHours(a),
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("attendances.pdf");
  };

  return (
    <Box
      p={{ xs: 2, sm: 4 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
    >
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
        <TableContainer component={Paper} sx={{ borderRadius: 2, maxWidth: 1000 }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
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
                  <b>PIN</b>
                </TableCell>
                <TableCell>
                  <b>Check In</b>
                </TableCell>
                <TableCell>
                  <b>Break Out</b>
                </TableCell>
                <TableCell>
                  <b>Break In</b>
                </TableCell>
                <TableCell>
                  <b>Check Out</b>
                </TableCell>
                <TableCell>
                  <b>Total Hours</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendances.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>{a.date ? new Date(a.date).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{a.employee.fullName}</TableCell>
                  <TableCell>{a.employee.position}</TableCell>
                  <TableCell>{a.employee.pincode}</TableCell>
                  <TableCell>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{a.breakOut ? new Date(a.breakOut).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{a.breakIn ? new Date(a.breakIn).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-"}</TableCell>
                  <TableCell>{calculateTotalHours(a)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AttendanceOverview;
