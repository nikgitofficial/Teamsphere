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
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
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
  const [form, setForm] = useState({
    fullName: "",
    position: "",
    birthdate: "",
    hireDate :"",
    age: "",
    status: "",
    address: "",
    phone: "",
    email: "",
    department: "",
    salary: "",
    emergencyContact: { name: "", relation: "", phone: "" },
    profilePic: "",
  });
  const [file, setFile] = useState(null); // 👈 added for file upload
  const [editId, setEditId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [viewEmployee, setViewEmployee] = useState(null); // 👈 for View Details dialog

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
      let employeeData = { ...form };

      if (editId) {
        await axios.put(`/employees/${editId}`, employeeData);

        if (file) {
          const formData = new FormData();
          formData.append("profilePic", file);
          await axios.post(`/employees/${editId}/upload-pic`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        setOpenSnackbar({ open: true, msg: "Employee updated!" });
      } else {
        const { data } = await axios.post("/employees", employeeData);

        if (file) {
          const formData = new FormData();
          formData.append("profilePic", file);
          await axios.post(`/employees/${data._id}/upload-pic`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        setOpenSnackbar({
          open: true,
          msg: `Employee added! Generated PIN: ${data.pincode}`,
        });
      }

      setForm({
        fullName: "",
        position: "",
        birthdate: "",
        hireDate:"",
        age: "",
        status: "",
        address: "",
        phone: "",
        email: "",
        department: "",
        salary: "",
        emergencyContact: { name: "", relation: "", phone: "" },
        profilePic: "",
      });
      setFile(null);
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

  // Edit handler
  const handleEdit = (employee) => {
    setForm({
      fullName: employee.fullName || "",
      position: employee.position || "",
      birthdate: employee.birthdate ? employee.birthdate.substring(0, 10) : "",
      hireDate: employee.hireDate ? employee.hireDate.substring(0, 10) : "",
      age: employee.age || "",
      status: employee.status || "",
      address: employee.address || "",
      phone: employee.phone || "",
      email: employee.email || "",
      department: employee.department || "",
      salary: employee.salary || "",
      emergencyContact: employee.emergencyContact || {
        name: "",
        relation: "",
        phone: "",
      },
      profilePic: employee.profilePic || "",
    });
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={{ xs: 2, sm: 3 }}
    >
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
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            width: { xs: "100%", sm: "70%", md: "60%" },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Profile</strong></TableCell>
                <TableCell><strong>Full Name</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>PIN</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp._id} hover>
                  <TableCell>
                    <img
                      src={emp.profilePic || "https://via.placeholder.com/40"}
                      alt="profile"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{ cursor: "pointer", color: "primary.main" }}
                    onClick={() => setViewEmployee(emp)}
                  >
                    {emp.fullName}
                  </TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.phone || "-"}</TableCell>
                  <TableCell>{emp.status || "-"}</TableCell>
                  <TableCell>{emp.pincode}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(emp._id)}
                    >
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
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editId ? "Edit Employee" : "Add Employee"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            {/* Profile Picture Upload */}
            <Button variant="contained" component="label">
              {file ? "Change Profile Picture" : "Upload Profile Picture"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>
            {(file || form.profilePic) && (
              <Box mt={2} textAlign="center">
                <img
                  src={file ? URL.createObjectURL(file) : form.profilePic}
                  alt="preview"
                  style={{ width: 100, height: 100, borderRadius: "50%" }}
                />
              </Box>
            )}

            {/* Other fields */}
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
            <TextField
              label="Birthdate"
              type="date"
              value={form.birthdate}
              onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
              <TextField
              label="Hire Date"
              type="date"
              value={form.hireDate}
              onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
                <MenuItem value="Separated">Separated</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              fullWidth
            />
            <TextField
              label="Salary"
              type="number"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              fullWidth
            />
            <TextField
              label="Emergency Contact Name"
              value={form.emergencyContact?.name || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyContact: {
                    ...form.emergencyContact,
                    name: e.target.value,
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Emergency Contact Relation"
              value={form.emergencyContact?.relation || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyContact: {
                    ...form.emergencyContact,
                    relation: e.target.value,
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Emergency Contact Phone"
              value={form.emergencyContact?.phone || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyContact: {
                    ...form.emergencyContact,
                    phone: e.target.value,
                  },
                })
              }
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

      {/* View Details Dialog */}
      <Dialog
        open={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent dividers>
          {viewEmployee && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="center" mb={2}>
                <img
                  src={viewEmployee.profilePic || "https://via.placeholder.com/80"}
                  alt="profile"
                  style={{ width: 80, height: 80, borderRadius: "50%" }}
                />
              </Box>
              <Typography><strong>Name:</strong> {viewEmployee.fullName}</Typography>
              <Typography>
  <strong>Hire Date:</strong>{" "}
  {viewEmployee.hireDate
    ? new Date(viewEmployee.hireDate).toLocaleDateString()
    : "-"}
</Typography>
              <Typography><strong>Position:</strong> {viewEmployee.position}</Typography>
              <Typography>
                <strong>Birthdate:</strong>{" "}
                {viewEmployee.birthdate
                  ? new Date(viewEmployee.birthdate).toLocaleDateString()
                  : "-"}
              </Typography>
              <Typography><strong>Age:</strong> {viewEmployee.age || "-"}</Typography>
              <Typography><strong>Status:</strong> {viewEmployee.status || "-"}</Typography>
              <Typography><strong>Address:</strong> {viewEmployee.address || "-"}</Typography>
              <Typography><strong>Phone:</strong> {viewEmployee.phone || "-"}</Typography>
              <Typography><strong>Email:</strong> {viewEmployee.email || "-"}</Typography>
              <Typography><strong>Department:</strong> {viewEmployee.department || "-"}</Typography>
              <Typography><strong>Salary:</strong> {viewEmployee.salary || "-"}</Typography>
              <Typography>
                <strong>Emergency Contact:</strong>{" "}
                {viewEmployee.emergencyContact
                  ? `${viewEmployee.emergencyContact.name} (${viewEmployee.emergencyContact.relation}) - ${viewEmployee.emergencyContact.phone}`
                  : "-"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewEmployee(null)}>Close</Button>
        </DialogActions>
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
