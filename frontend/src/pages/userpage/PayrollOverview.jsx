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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MonetizationOn } from "@mui/icons-material";

const PayrollOverview = () => {
  const { user } = useContext(AuthContext);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [newTotalHours, setNewTotalHours] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Payslip
  const [payslip, setPayslip] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const accessToken = localStorage.getItem("accessToken");

  const fetchPayrolls = async () => {
    if (!user) return;
    if (!startDate || !endDate)
      return setSnackbar({ open: true, message: "Please select start and end dates", severity: "warning" });
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/payroll/generate",
        { startDate, endDate },
        { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true }
      );
      setPayrolls(data.payrolls);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error generating payrolls", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const maskPIN = (pin) => {
    if (!pin) return "--";
    const lastTwo = pin.slice(-2);
    return `••••${lastTwo}`;
  };

  const formatHours = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);
    const seconds = Math.round(((decimalHours - hours) * 60 - minutes) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const filteredPayrolls = payrolls.filter((p) => {
    const nameMatch = p.employee.fullName.toLowerCase().includes(search.toLowerCase());
    const pinMatch = p.employee.pincode?.includes(search);
    return nameMatch || pinMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayrolls = filteredPayrolls.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPayrolls.map((p) => ({
        "Employee Name": p.employee.fullName,
        PIN: `••••${p.employee?.pincode?.slice(-2) || "--"}`,
        Period: `${startDate} to ${endDate}`,
        "Total Hours": formatHours(p.totalHours),
        "Total Days": p.totalDays?.toFixed(2) || "0.00",
        "Rate Per Hour": p.ratePerHour.toFixed(2),
        "Gross Pay": p.grossPay.toFixed(2),
        "Deductions (Total)": p.deductions.total?.toFixed(2) || "0.00",
        "Net Pay": p.netPay.toFixed(2),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
    XLSX.writeFile(workbook, `Payroll_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("My Company Inc.", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Payroll Records", 105, 23, { align: "center" });
    doc.text(`Period: ${startDate} to ${endDate}`, 105, 30, { align: "center" });

    autoTable(doc, {
      startY: 40,
      head: [["Employee", "PIN", "Period", "Total Hours", "Total Days", "Rate/Hour", "Gross Pay", "Deductions (Total)", "Net Pay"]],
      body: filteredPayrolls.map((p) => [
        p.employee.fullName,
        `••••${p.employee?.pincode?.slice(-2) || "--"}`,
        `${startDate} to ${endDate}`,
        formatHours(p.totalHours),
        p.totalDays?.toFixed(2) || "0.00",
        `₱${p.ratePerHour.toFixed(2)}`,
        `₱${p.grossPay.toFixed(2)}`,
        `₱${p.deductions.total?.toFixed(2) || "0.00"}`,
        `₱${p.netPay.toFixed(2)}`,
      ]),
      styles: { fontSize: 8 },
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: { 8: { fontStyle: "bold", textColor: [34, 153, 84] } },
    });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Downloaded on: ${new Date().toLocaleString()}`, 20, 290);

    doc.save(`Payroll_${startDate}_to_${endDate}.pdf`);
  };

  const handleViewPayslip = async (employeeId) => {
    try {
      const { data } = await axios.post(
        "/payroll/payslip",
        { employeeId, startDate, endDate },
        { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true }
      );
      setPayslip(data.payslip);
      setOpenPreview(true);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error fetching payslip", severity: "error" });
    }
  };

  const handleDownloadPayslip = () => {
    if (!payslip) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("NikTech Inc.", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Employee Payslip", 105, 25, { align: "center" });

    autoTable(doc, {
      startY: 35,
      styles: { fontSize: 10 },
      head: [["Employee", "Position", "PIN", "Period"]],
      body: [[
        payslip.employee.fullName,
        payslip.employee.position || "-",
        `••••${payslip.employee?.pincode?.slice(-2) || "--"}`,
        `${new Date(payslip.startDate).toLocaleDateString()} - ${new Date(payslip.endDate).toLocaleDateString()}`
      ]],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 10 },
      head: [["Total Days", "Total Hours", "Rate/Hour", "Gross Pay"]],
      body: [[
        payslip.totalDays?.toFixed(2) || "0.00",
        formatHours(payslip.totalHours),
        `₱${payslip.ratePerHour.toFixed(2)}`,
        `₱${p.grossPay.toFixed(2)}`
      ]],
      theme: "striped",
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    });

    const d = payslip.deductions || {};
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 10 },
      head: [["Deduction Type", "Amount"]],
      body: [
        ["Absent", `₱${d.absent?.toFixed(2) || "0.00"}`],
        ["Late", `₱${d.late?.toFixed(2) || "0.00"}`],
        ["SSS", `₱${d.sss?.toFixed(2) || "0.00"}`],
        ["PhilHealth", `₱${d.philhealth?.toFixed(2) || "0.00"}`],
        ["Pag-IBIG", `₱${d.pagibig?.toFixed(2) || "0.00"}`],
        ["TIN", `₱${d.tin?.toFixed(2) || "0.00"}`],
        ["Other", `₱${d.other?.toFixed(2) || "0.00"}`],
        [{ content: "TOTAL", styles: { fontStyle: "bold" } }, `₱${d.total?.toFixed(2) || "0.00"}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [231, 76, 60], textColor: 255 },
      columnStyles: { 1: { halign: "right" } },
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 153, 84);
    doc.text(
      `Net Pay: ₱${payslip.netPay.toFixed(2)}`,
      20,
      doc.lastAutoTable.finalY + 15
    );

    doc.setFontSize(9);
    doc.setTextColor(100);
    const downloadDate = new Date().toLocaleString();
    doc.text(`Downloaded on: ${downloadDate}`, 20, 290);
    doc.text("This payslip is confidential and intended for the employee only.", 20, 295);

    doc.save(`${payslip.employee.fullName}_Payslip.pdf`);
  };

  const handleEditHours = (payroll) => {
    setEditingPayroll(payroll);
    setNewTotalHours(payroll.totalHours);
    setOpenEdit(true);
  };

  const handleSaveHours = async () => {
    if (!editingPayroll) return;
    const payrollId = editingPayroll._id;

    if (isNaN(newTotalHours) || newTotalHours < 0) {
      return setSnackbar({ open: true, message: "Total hours must be a valid number", severity: "warning" });
    }

    try {
      const { data } = await axios.patch(
        `/payroll/update-hours/${payrollId}`,
        { totalHours: Number(parseFloat(newTotalHours).toFixed(2)) },
        { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true }
      );

      setPayrolls((prev) =>
        prev.map((p) => (p._id === payrollId ? { ...data.payroll, manualTotalHours: true } : p))
      );

      setSnackbar({ open: true, message: "Total hours updated successfully", severity: "success" });
      setOpenEdit(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error updating total hours", severity: "error" });
    }
  };

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center">
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <MonetizationOn fontSize="large" />
        <Typography variant="h4" fontWeight="bold">
          Payroll Overview
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" onClick={exportToExcel}>
            Export Excel
          </Button>
          <Button variant="contained" color="error" onClick={exportToPDF}>
            Export PDF
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
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
        <Button
          variant="contained"
          onClick={fetchPayrolls}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Generate
        </Button>
        <TextField
          label="Search by Name or PIN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : filteredPayrolls.length === 0 ? (
        <Typography>No payroll records found.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ maxWidth: 1000 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Employee",
                    "PIN",
                    "Period",
                    "Total Hours",
                    "Total Days",
                    "Rate/Hour",
                    "Gross Pay",
                    "Deductions (Total)",
                    "Net Pay",
                    "Action",
                  ].map((header) => (
                    <TableCell key={header} sx={{ fontWeight: "bold" }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPayrolls.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>{p.employee.fullName}</TableCell>
                    <TableCell>{maskPIN(p.employee.pincode)}</TableCell>
                    <TableCell>{`${startDate} to ${endDate}`}</TableCell>
                    <TableCell>
                      {formatHours(p.totalHours)}
                      {p.manualTotalHours && (
                        <Typography component="span" color="orange" sx={{ ml: 1 }}>
                          (Manual)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{p.totalDays?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{p.ratePerHour.toFixed(2)}</TableCell>
                    <TableCell>{p.grossPay.toFixed(2)}</TableCell>
                    <TableCell>{p.deductions.total?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{p.netPay.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewPayslip(p.employee._id)}
                        sx={{ mr: 1 }}
                      >
                        View Payslip
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => handleEditHours(p)}
                      >
                        Edit Hours
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
              />
            </Box>
          )}
        </>
      )}

      {/* Payslip Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem", color: "primary.main", borderBottom: "1px solid", borderColor: "divider" }}>
          Payslip Preview
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {payslip ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2} sx={{ bgcolor: "background.default", p: 2, borderRadius: 2 }}>
                <Typography variant="body1"><strong>Employee:</strong> {payslip.employee.fullName}</Typography>
                <Typography variant="body1"><strong>Position:</strong> {payslip.employee.position || "-"}</Typography>
                <Typography variant="body1" color="text.secondary"><strong>PIN:</strong> ••••{payslip.employee?.pincode?.slice(-2) || "--"}</Typography>
                <Typography variant="body1"><strong>Period:</strong> {new Date(payslip.startDate).toLocaleDateString()} - {new Date(payslip.endDate).toLocaleDateString()}</Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={1} sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                <Typography><strong>Total Days:</strong> {payslip.totalDays?.toFixed(2) || "0.00"}</Typography>
                <Typography>
                  <strong>Total Hours:</strong> {formatHours(payslip.totalHours)}
                  {payslip.manualTotalHours && (
                    <Typography component="span" color="orange" sx={{ ml: 1 }}>(Manual)</Typography>
                  )}
                </Typography>
                <Typography><strong>Rate/Hour:</strong> ₱{payslip.ratePerHour.toFixed(2)}</Typography>
                <Typography fontWeight={600} color="success.main"><strong>Gross Pay:</strong> ₱{payslip.grossPay.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2, border: "1px dashed", borderColor: "error.light" }}>
                <Typography fontWeight="bold" mb={1} color="error.main">Deductions:</Typography>
                <Typography>- Absent: ₱{payslip.deductions?.absent?.toFixed(2) || "0.00"}</Typography>
                <Typography>- Late: ₱{payslip.deductions?.late?.toFixed(2) || "0.00"}</Typography>
                <Typography>- SSS: ₱{payslip.deductions?.sss?.toFixed(2) || "0.00"}</Typography>
                <Typography>- PhilHealth: ₱{payslip.deductions?.philhealth?.toFixed(2) || "0.00"}</Typography>
                <Typography>- Pag-IBIG: ₱{payslip.deductions?.pagibig?.toFixed(2) || "0.00"}</Typography>
                <Typography>- TIN: ₱{payslip.deductions?.tin?.toFixed(2) || "0.00"}</Typography>
                <Typography>- Other: ₱{payslip.deductions?.other?.toFixed(2) || "0.00"}</Typography>
                <Typography fontWeight="bold" mt={1} color="error.dark">TOTAL: ₱{payslip.deductions?.total?.toFixed(2) || "0.00"}</Typography>
              </Box>

              <Box textAlign="center" sx={{ bgcolor: "success.light", color: "success.contrastText", p: 2, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold">Net Pay: ₱{payslip.netPay.toFixed(2)}</Typography>
              </Box>
            </Box>
          ) : (
            <Typography>No payslip data</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenPreview(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>Close</Button>
          <Button variant="contained" onClick={handleDownloadPayslip} sx={{ borderRadius: 2, px: 3, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" }}}>Download PDF</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Total Hours</DialogTitle>
        <DialogContent>
          <TextField
            label="Total Hours"
            type="number"
            fullWidth
            value={newTotalHours}
            onChange={(e) => setNewTotalHours(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveHours}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PayrollOverview;
