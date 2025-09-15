import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Tooltip,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "../api/axios";

// ✅ Export imports
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: "" });
  const [form, setForm] = useState({ fullName: "", position: "" });
  const [editId, setEditId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get("/employees");
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/employees/${editId}`, form);
        setOpenSnackbar({ open: true, msg: "Employee updated!" });
      } else {
        const { data } = await axios.post("/employees", form);
        setOpenSnackbar({
          open: true,
          msg: `Employee added! Generated PIN: ${data.pincode}`,
        });
      }
      setForm({ fullName: "", position: "" });
      setEditId(null);
      setOpenDialog(false);
      fetchEmployees();
    } catch (err) {
      setOpenSnackbar({ open: true, msg: err.response?.data?.msg || "Error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await axios.delete(`/employees/${id}`);
      setOpenSnackbar({ open: true, msg: "Employee deleted!" });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (employee) => {
    setForm({ fullName: employee.fullName, position: employee.position });
    setEditId(employee._id);
    setOpenDialog(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.pincode.includes(search)
  );

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredEmployees.map((emp) => ({
        "Full Name": emp.fullName,
        Position: emp.position,
        PIN: emp.pincode,
        "Created Date": emp.createdAt
          ? new Date(emp.createdAt).toLocaleString()
          : "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees.xlsx");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee List", 14, 15);
    autoTable(doc, {
      head: [["Full Name", "Position", "PIN", "Created Date"]],
      body: filteredEmployees.map((emp) => [
        emp.fullName,
        emp.position,
        emp.pincode,
        emp.createdAt ? new Date(emp.createdAt).toLocaleString() : "-",
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("employees.pdf");
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={{ xs: 2, sm: 3 }}>
      <Typography variant={isSm ? "h5" : "h4"} mb={3} fontWeight="bold">
        Employee Management
      </Typography>

      {/* Search + Add + Export Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        width={{ xs: "100%", sm: "70%", md: "60%" }}
        alignItems="center"
      >
        <TextField
          label="Search by Name or PIN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: "300px" } }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ textTransform: "none", minWidth: 150 }}
        >
          Add Employee
        </Button>

        {/* Export Buttons */}
        <Button variant="contained" color="success" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="contained" color="error" onClick={exportToPDF}>
          Export PDF
        </Button>
      </Stack>

      {/* Loading / Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredEmployees.length === 0 ? (
        <Typography variant="body1" mt={2} color="textSecondary">
          No employees found.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, width: { xs: "100%", sm: "70%", md: "60%" } }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Full Name</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>PIN</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp._id} hover>
                  <TableCell>{emp.fullName}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.pincode}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(emp._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editId ? "Edit Employee" : "Add Employee"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              required
              fullWidth
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {editId ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={openSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar({ open: false, msg: "" })}
        message={openSnackbar.msg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default EmployeePage;
