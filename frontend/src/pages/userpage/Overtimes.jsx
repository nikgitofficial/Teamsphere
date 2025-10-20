import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  TableContainer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "../../api/axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const UserOTDashboard = () => {
  const [ots, setOts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchPendingOTs = async () => {
    try {
      const res = await axios.get("/overtime/pending");
      setOts(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to fetch OT requests", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.put(`/overtime/${id}/status`, { status });
      setSnack({ open: true, message: `OT ${status}`, severity: "success" });
      fetchPendingOTs();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to update OT", severity: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔍 Filter logic
  useEffect(() => {
    let filteredData = ots;

    if (search.trim() !== "") {
      filteredData = filteredData.filter((ot) =>
        ot.employeeId?.fullName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterDept !== "All") {
      filteredData = filteredData.filter((ot) => ot.employeeId?.department === filterDept);
    }

    if (filterStatus !== "All") {
      filteredData = filteredData.filter((ot) => ot.status === filterStatus);
    }

    setFiltered(filteredData);
  }, [search, filterDept, filterStatus, ots]);

  useEffect(() => {
    fetchPendingOTs();
  }, []);

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((ot) => ({
        "Employee Name": ot.employeeId?.fullName || "N/A",
        Department: ot.employeeId?.department || "N/A",
        Date: new Date(ot.date).toLocaleDateString(),
        Hours: ot.hours,
        Reason: ot.reason,
        Status: ot.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Overtime");
    XLSX.writeFile(workbook, "overtime_requests.xlsx");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Overtime Requests", 14, 15);
    autoTable(doc, {
      head: [["Employee", "Department", "Date", "Hours", "Reason", "Status"]],
      body: filtered.map((ot) => [
        ot.employeeId?.fullName || "N/A",
        ot.employeeId?.department || "N/A",
        new Date(ot.date).toLocaleDateString(),
        ot.hours,
        ot.reason,
        ot.status,
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("overtime_requests.pdf");
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={{ xs: 2, sm: 3 }}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Pending Overtime Requests
      </Typography>

      {/* 🔍 Filters + Export */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        width={{ xs: "100%", sm: "90%", md: "70%" }}
        alignItems="center"
      >
        <TextField
          label="Search Employee"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 250 } }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Department</InputLabel>
          <Select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} label="Department">
            <MenuItem value="All">All</MenuItem>
            {[...new Set(ots.map((o) => o.employeeId?.department).filter(Boolean))].map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="success" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="contained" color="error" onClick={exportToPDF}>
          Export PDF
        </Button>
      </Stack>

      {/* 📋 Table */}
      {loading ? (
        <CircularProgress />
      ) : filtered.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No overtime requests found.
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ width: { xs: "100%", sm: "90%", md: "70%" }, borderRadius: 2, p: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Employee Name</TableCell>
                <TableCell align="center">Department</TableCell>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Hours</TableCell>
                <TableCell align="center">Reason</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((ot) => (
                <TableRow key={ot._id} hover>
                  <TableCell align="center">{ot.employeeId?.fullName || "N/A"}</TableCell>
                  <TableCell align="center">{ot.employeeId?.department || "N/A"}</TableCell>
                  <TableCell align="center">{new Date(ot.date).toLocaleDateString()}</TableCell>
                  <TableCell align="center">{ot.hours}</TableCell>
                  <TableCell align="center">{ot.reason}</TableCell>
                  <TableCell align="center">{ot.status}</TableCell>
                  <TableCell align="center">
                    {ot.status === "Pending" ? (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          disabled={updatingId === ot._id}
                          onClick={() => handleStatus(ot._id, "Approved")}
                        >
                          {updatingId === ot._id ? <CircularProgress size={18} /> : "Approve"}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={updatingId === ot._id}
                          onClick={() => handleStatus(ot._id, "Rejected")}
                        >
                          {updatingId === ot._id ? <CircularProgress size={18} /> : "Reject"}
                        </Button>
                      </Stack>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserOTDashboard;
