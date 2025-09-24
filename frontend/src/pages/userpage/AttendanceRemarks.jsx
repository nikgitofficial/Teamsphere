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
} from "@mui/material";
import { Comment, Edit, Delete, AttachFile } from "@mui/icons-material";
import axios from "../../api/axios";

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
    reason: "",
    remarks: "",
    status: "Pending",
  });

  // File state
  const [file, setFile] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });

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

  return (
    <Box p={{ xs: 2, sm: 4 }} display="flex" flexDirection="column" alignItems="center">
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center" mb={3}>
        <Comment fontSize="large" sx={{ mr: 1 }} />
        <Typography variant={isSm ? "h5" : "h4"} fontWeight="bold">
          Attendance Remarks
        </Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Remark
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, maxWidth: 1000, width: "100%" }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
            <TableRow>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Employee</b></TableCell>
              <TableCell><b>Type</b></TableCell>
              <TableCell><b>Reason</b></TableCell>
              <TableCell><b>Remarks</b></TableCell>
              <TableCell><b>Attachment</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {remarks.length > 0 ? (
              remarks.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.employee?.fullName || "-"}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell>{r.remarks}</TableCell>
                  <TableCell>
                    {r.file?.url ? (
                      <Button
                        size="small"
                        startIcon={<AttachFile />}
                        onClick={() => window.open(r.file.url, "_blank")}
                      >
                        {r.file.originalname}
                      </Button>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={r.status === "Rejected" ? "error" : r.status === "Approved" ? "success.main" : "textSecondary"}
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
            {["Absent", "Late", "Undertime", "Overbreak", "Other"].map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
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
