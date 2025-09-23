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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axios from "../../api/axios";

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
    hireDate: "",
    age: "",
    gender: "", 
    status: "",
    workStatus: "Active",
    address: "",
    phone: "",
    email: "",
    department: "",
    salary: "",
    ratePerHour: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
    deductions: {
      absent: "",
      late: "",
      sss: "",
      tin: "",
      pagibig: "",
      philhealth: "",
      other: "",
      total: "",
    },
    emergencyContact: { name: "", relation: "", phone: "" },
    profilePic: "",
    shift: "", // ✅ shift
  });
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [viewEmployee, setViewEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    setFormLoading(true);

    try {
      let employeeData = { ...form };

        // auto-compute total
      const {
        absent,
        late,
        sss,
        tin,
        pagibig,
        philhealth,
        other,
      } = employeeData.deductions;

      employeeData.deductions.total =
        (Number(absent) || 0) +
        (Number(late) || 0) +
        (Number(sss) || 0) +
        (Number(tin) || 0) +
        (Number(pagibig) || 0) +
        (Number(philhealth) || 0) +
        (Number(other) || 0);

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
        hireDate: "",
        age: "",
        status: "",
        workStatus: "Active",
        address: "",
        phone: "",
        email: "",
        department: "",
        salary: "",
        ratePerHour: "",
        sss: "",
        tin: "",
        pagibig: "",
        philhealth: "",
        deductions: {
          absent: "",
          late: "",
          sss: "",
          tin: "",
          pagibig: "",
          philhealth: "",
          other: "",
          total: "",
        },
        emergencyContact: { name: "", relation: "", phone: "" },
        profilePic: "",
        shift: "",
      });
      setFile(null);
      setEditId(null);
      setOpenDialog(false);
      fetchEmployees();
    } catch (err) {
      setOpenSnackbar({ open: true, msg: err.response?.data?.msg || "Error" });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);

    try {
      await axios.delete(`/employees/${deleteId}`);
      setOpenSnackbar({ open: true, msg: "Employee deleted!" });
      fetchEmployees();
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error(err);
      setOpenSnackbar({
        open: true,
        msg: err.response?.data?.msg || "Error deleting employee",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (employee) => {
    setForm({
      fullName: employee.fullName || "",
      position: employee.position || "",
      birthdate: employee.birthdate
        ? employee.birthdate.substring(0, 10)
        : "",
      hireDate: employee.hireDate ? employee.hireDate.substring(0, 10) : "",
      age: employee.age || "",
      gender: employee.gender || "",
      status: employee.status || "",
      workStatus: employee.workStatus || "Active",
      address: employee.address || "",
      phone: employee.phone || "",
      email: employee.email || "",
      department: employee.department || "",
      salary: employee.salary || "",
      ratePerHour: employee.ratePerHour || "",
      sss: employee.sss || "",
      tin: employee.tin || "",
      pagibig: employee.pagibig || "",
      philhealth: employee.philhealth || "",
      deductions: employee.deductions || {
        absent: "",
        late: "",
        sss: "",
        tin: "",
        pagibig: "",
        philhealth: "",
        other: "",
        total: "",
      },
      emergencyContact: employee.emergencyContact || {
        name: "",
        relation: "",
        phone: "",
      },
      profilePic: employee.profilePic || "",
      shift: employee.shift || "",
    });
    setEditId(employee._id);
    setOpenDialog(true);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.pincode.includes(search)
  );

  // ✅ Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredEmployees.map((emp) => ({
        "Full Name": emp.fullName,
        Position: emp.position,
        Shift: emp.shift || "-",
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
      head: [["Full Name", "Position", "Shift", "PIN", "Created Date"]],
      body: filteredEmployees.map((emp) => [
        emp.fullName,
        emp.position,
        emp.shift || "-",
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
        <>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, width: { xs: "100%", sm: "70%", md: "60%" } }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Profile</strong></TableCell>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Position</strong></TableCell>
                  <TableCell><strong>Gender</strong></TableCell>
                  <TableCell><strong>Shift</strong></TableCell>
                  <TableCell><strong>Work Status</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>PIN</strong></TableCell>
                  
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentEmployees.map((emp) => (
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
                    <Tooltip title="View Employee Details" arrow>
  <TableCell
    sx={{ cursor: "pointer", color: "primary.main" }}
    onClick={() => setViewEmployee(emp)}
  >
    {emp.fullName}
  </TableCell>
</Tooltip>

                    <TableCell>{emp.position}</TableCell>
                    <TableCell>{emp.gender || "-"}</TableCell>
                          <TableCell>{emp.shift || "-"}</TableCell>
<TableCell>
  <Chip
    label={emp.workStatus || "N/A"}
    color={
      emp.workStatus === "Active"
        ? "success"
        : emp.workStatus === "On Leave"
        ? "warning"
        : emp.workStatus === "Terminated"
        ? "error"
        : "default"
    }
    size="small"
  />
</TableCell>
<TableCell>{emp.phone || "-"}</TableCell>
<TableCell>{emp.status || "-"}</TableCell>


                    <TableCell>{emp.pincode}</TableCell>
                    <TableCell align="center">
  <Tooltip title="Edit Employee" arrow>
    <IconButton color="primary" onClick={() => handleEdit(emp)}>
      <Edit />
    </IconButton>
  </Tooltip>

  <Tooltip title="Delete Employee" arrow>
    <IconButton
      color="error"
      onClick={() => {
        setDeleteId(emp._id);
        setOpenDeleteDialog(true);
      }}
    >
      <Delete />
    </IconButton>
  </Tooltip>
</TableCell>

                  </TableRow>
                ))}
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
                siblingCount={2}
                boundaryCount={1}
              />
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editId ? "Edit Employee" : "Add Employee"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
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
  <InputLabel>Gender</InputLabel>
  <Select
    value={form.gender}
    label="Gender"
    onChange={(e) => setForm({ ...form, gender: e.target.value })}
  >
    <MenuItem value="Male">Male</MenuItem>
    <MenuItem value="Female">Female</MenuItem>
    <MenuItem value="Other">Other</MenuItem>
  </Select>
</FormControl>
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
            <FormControl fullWidth>
  <InputLabel>Work Status</InputLabel>
  <Select
    value={form.workStatus}
    label="Work Status"
    onChange={(e) => setForm({ ...form, workStatus: e.target.value })}
  >
    <MenuItem value="Active">Active</MenuItem>
    <MenuItem value="Inactive">Inactive</MenuItem>
    <MenuItem value="On Leave">On Leave</MenuItem>
    <MenuItem value="Terminated">Terminated</MenuItem>
    <MenuItem value="Probationary">Probationary</MenuItem>
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
              label="Shift (e.g., 7am-4pm)"
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
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
              label="Rate Per Hour"
              type="number"
              value={form.ratePerHour}
              onChange={(e) => setForm({ ...form, ratePerHour: e.target.value })}
              fullWidth
            />
            <TextField
              label="SSS"
              type="number"
              value={form.sss}
              onChange={(e) => setForm({ ...form, sss: e.target.value })}
              fullWidth
            />
            <TextField
              label="TIN"
              type="number"
              value={form.tin}
              onChange={(e) => setForm({ ...form, tin: e.target.value })}
              fullWidth
            />
            <TextField
              label="Pagibig"
              type="number"
              value={form.pagibig}
              onChange={(e) => setForm({ ...form, pagibig: e.target.value })}
              fullWidth
            />
            <TextField
              label="Philhealth"
              type="number"
              value={form.philhealth}
              onChange={(e) => setForm({ ...form, philhealth: e.target.value })}
              fullWidth
            />
            <Typography variant="h6" sx={{ mt: 2 }}>Deductions</Typography>
            {["absent", "late", "sss", "tin", "pagibig", "philhealth", "other"].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                type="number"
                value={form.deductions[field]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deductions: { ...form.deductions, [field]: e.target.value },
                  })
                }
                fullWidth
              />
            ))}
            <TextField
              label="Total Deductions"
              type="number"
              value={form.deductions.total}
              InputProps={{ readOnly: true }}
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formLoading}
                startIcon={formLoading && <CircularProgress size={20} />}
              >
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
  PaperProps={{
    sx: {
      borderRadius: 3,
      p: 1,
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 600, fontSize: "1.3rem", textAlign: "center" }}>
    Employee Details
  </DialogTitle>

  <DialogContent dividers sx={{ px: 3, py: 2 }}>
  {viewEmployee && (
    <Box>
      {/* Profile Section */}
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Avatar
          src={viewEmployee.profilePic || "https://via.placeholder.com/80"}
          alt="profile"
          sx={{ width: 100, height: 100, mb: 1 }}
        />
        <Typography variant="h6" fontWeight={600}>
          {viewEmployee.fullName}
        </Typography>
        <Chip
          label={viewEmployee.workStatus || "N/A"}
          color={
            viewEmployee.workStatus === "Active"
              ? "success"
              : viewEmployee.workStatus === "On Leave"
              ? "warning"
              : viewEmployee.workStatus === "Terminated"
              ? "error"
              : "default"
          }
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Personal Information */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Personal Information
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Birthdate</Typography>
          <Typography fontWeight={500}>
            {viewEmployee.birthdate
              ? new Date(viewEmployee.birthdate).toLocaleDateString()
              : "-"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Age</Typography>
          <Typography fontWeight={500}>{viewEmployee.age || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Gender</Typography>
          <Typography fontWeight={500}>{viewEmployee.gender || "-"}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">Address</Typography>
          <Typography fontWeight={500}>{viewEmployee.address || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Phone</Typography>
          <Typography fontWeight={500}>{viewEmployee.phone || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Email</Typography>
          <Typography fontWeight={500}>{viewEmployee.email || "-"}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Work Information */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Work Information
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Hire Date</Typography>
          <Typography fontWeight={500}>
            {viewEmployee.hireDate
              ? new Date(viewEmployee.hireDate).toLocaleDateString()
              : "-"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Position</Typography>
          <Typography fontWeight={500}>{viewEmployee.position}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Shift</Typography>
          <Typography fontWeight={500}>{viewEmployee.shift || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Department</Typography>
          <Typography fontWeight={500}>{viewEmployee.department || "-"}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Government Numbers */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Government Numbers
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">SSS</Typography>
          <Typography fontWeight={500}>{viewEmployee.sss || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">TIN</Typography>
          <Typography fontWeight={500}>{viewEmployee.tin || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Pagibig</Typography>
          <Typography fontWeight={500}>{viewEmployee.pagibig || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">PhilHealth</Typography>
          <Typography fontWeight={500}>{viewEmployee.philhealth || "-"}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Compensation */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Compensation
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Salary</Typography>
          <Typography fontWeight={500}>{viewEmployee.salary || "-"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Rate Per Hour</Typography>
          <Typography fontWeight={500}>{viewEmployee.ratePerHour || "-"}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Deductions */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Deductions
      </Typography>
      {Object.entries(viewEmployee.deductions || {}).map(([key, val]) => (
        <Typography key={key} variant="body2">
          {key.charAt(0).toUpperCase() + key.slice(1)}: {val || 0}
        </Typography>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Emergency Contact */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Emergency Contact
      </Typography>
      <Typography>
        {viewEmployee.emergencyContact
          ? `${viewEmployee.emergencyContact.name} (${viewEmployee.emergencyContact.relation}) - ${viewEmployee.emergencyContact.phone}`
          : "-"}
      </Typography>
    </Box>
  )}
</DialogContent>


  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={() => setViewEmployee(null)}
      variant="contained"
      sx={{ borderRadius: 2 }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this employee? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleteLoading}
            startIcon={deleteLoading && <CircularProgress size={20} />}
          >
            Delete
          </Button>
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
