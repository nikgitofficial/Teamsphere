import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Pagination,
} from "@mui/material";
import { Comment, Edit, Delete, AttachFile } from "@mui/icons-material";
import axios from "../../api/axios";

// ✅ Export libraries
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AttendanceRemarks = () => {
  const [remarks, setRemarks] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Dialog states
  const [open, setOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Selected remark for edit/delete
  const [selected, setSelected] = useState(null);

  // Form state
  const [form, setForm] = useState({
    employee: "",
    type: "",
    departments:"",
    reason: "",
    remarks: "",
    status: "Pending",
  });

  // File state
  const [file, setFile] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch remarks
  const fetchRemarks = async () => {
    try {
      const res = await axios.get("/attendance-remarks");
      setRemarks(res.data);
    } catch (err) {
      console.error("Error fetching remarks:", err);
      setSnackbar({ open: true, msg: "Error fetching remarks" });
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setSnackbar({ open: true, msg: "Error fetching employees" });
    }
  };

  useEffect(() => {
    fetchRemarks();
    fetchEmployees();
  }, []);

  // Save or Update
  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("employee", form.employee);
      formData.append("type", form.type);
      formData.append("departments", form.departments);
      formData.append("reason", form.reason);
      formData.append("remarks", form.remarks);
      formData.append("status", form.status);
      if (file) formData.append("file", file);

      if (selected) {
        await axios.put(`/attendance-remarks/${selected._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, msg: "Remark updated successfully!" });
      } else {
        await axios.post("/attendance-remarks", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, msg: "Remark added successfully!" });
      }

      fetchRemarks();
      handleClose();
    } catch (err) {
      console.error("Error saving remark:", err);
      setSnackbar({ open: true, msg: "Error saving remark" });
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selected) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/attendance-remarks/${selected._id}`);
      fetchRemarks();
      setDeleteDialog(false);
      setSelected(null);
      setSnackbar({ open: true, msg: "Remark deleted successfully!" });
    } catch (err) {
      console.error("Error deleting remark:", err);
      setSnackbar({ open: true, msg: "Error deleting remark" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open dialog for Add/Edit
  const handleOpen = (remark = null) => {
    if (remark) {
      setSelected(remark);
      setForm({
        employee: remark.employee?._id || "",
        type: remark.type,
        departments: remark.departments,
        reason: remark.reason,
        remarks: remark.remarks,
        status: remark.status,
      });
      setFile(null); // reset file
    } else {
      setSelected(null);
      setForm({
        employee: "",
        type: "",
        departments:"",
        reason: "",
        remarks: "",
        status: "Pending",
      });
      setFile(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setFile(null);
  };

  // ✅ Filtered remarks for search
  const filteredRemarks = remarks.filter(
    (r) =>
      r.employee?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRemarks = filteredRemarks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRemarks.length / itemsPerPage);
  const handlePageChange = (event, value) => setCurrentPage(value);

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRemarks.map((r) => ({
        Date: new Date(r.date).toLocaleDateString(),
        Employee: r.employee?.fullName,
        Type: r.type,
        Departments: r.departments,
        Reason: r.reason,
        Remarks: r.remarks,
        Status: r.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AttendanceRemarks");
    XLSX.writeFile(workbook, "attendance_remarks.xlsx");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Remarks", 14, 15);
    autoTable(doc, {
      head: [["Date", "Employee", "Type","Department", "Reason", "Remarks", "Status"]],
      body: filteredRemarks.map((r) => [
        new Date(r.date).toLocaleDateString(),
        r.employee?.fullName || "-",
        r.type,
        r.departments,
        r.reason,
        r.remarks,
        r.status,
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("attendance_remarks.pdf");
  };

  return (
    <Box p={{ xs: 2, sm: 4 }} display="flex" flexDirection="column" alignItems="center">
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        mb={3}
      >
        <Comment fontSize="large" sx={{ mr: 1 }} />
        <Typography variant={isSm ? "h5" : "h4"} fontWeight="bold">
          Attendance Remarks
        </Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Remark
        </Button>
        <Button variant="contained" color="success" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="contained" color="error" onClick={exportToPDF}>
          Export PDF
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        label="Search by Employee, Type, Reason"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: { xs: "100%", sm: 400 } }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, maxWidth: 1100, width: "100%" }}>
        <Table>
          <TableHead
  sx={{
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]   // dark background for dark mode
        : theme.palette.grey[200],  // light background for light mode
    "& .MuiTableCell-root": {
      color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary,
      fontWeight: "bold"
    }
  }}
>
            <TableRow>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Employee</b></TableCell>
              <TableCell><b>Type</b></TableCell>
              <TableCell><b>Departments</b></TableCell>
              <TableCell><b>Reason</b></TableCell>
              <TableCell><b>Remarks</b></TableCell>
              <TableCell><b>Attachment</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRemarks.length > 0 ? (
              currentRemarks.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.employee?.fullName || "-"}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.departments}</TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell>{r.remarks}</TableCell>
                  <TableCell>
  {r.file?.url ? (
    <Tooltip title="View File">
      <Button
        size="small"
        startIcon={<AttachFile />}
        onClick={() => window.open(r.file.url, "_blank")}
      >
        {r.file.originalname}
      </Button>
    </Tooltip>
  ) : (
    "-"
  )}
</TableCell>

                  <TableCell>
                    <Typography
                      color={
                        r.status === "Rejected"
                          ? "error"
                          : r.status === "Approved"
                          ? "success.main"
                          : "textSecondary"
                      }
                      fontWeight="bold"
                    >
                      {r.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpen(r)} size="small">
                        <Edit fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => {
                          setSelected(r);
                          setDeleteDialog(true);
                        }}
                        size="small"
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">No remarks recorded yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box mt={2}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{selected ? "Edit Remark" : "Add Remark"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Employee"
            select
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
          >
            {employees.map((emp) => (
              <MenuItem key={emp._id} value={emp._id}>
                {emp.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Type"
            select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            
            {["Absent", "Late", "Undertime", "Overbreak", "Other","OnLeave"].map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
            <TextField
            fullWidth
            margin="normal"
            label="Departments"
            value={form.departments}
            onChange={(e) => setForm({ ...form, departments: e.target.value })}
          />
        
          <TextField
            fullWidth
            margin="normal"
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Status"
            select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {["Pending", "Approved", "Rejected"].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          {/* File Upload */}
          <TextField
            fullWidth
            margin="normal"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
          >
            {selected ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Remark</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this remark?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={18} color="inherit" />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.msg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default AttendanceRemarks;
