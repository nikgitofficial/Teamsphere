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

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Payslip states
  const [payslip, setPayslip] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  const accessToken = localStorage.getItem("accessToken");

  const fetchPayrolls = async () => {
    if (!user) return;
    if (!startDate || !endDate) return alert("Please select start and end dates");
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
      alert("Error generating payrolls");
    } finally {
      setLoading(false);
    }
  };

// ✅ Format decimal hours → HH:mm:ss
const formatHours = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.floor((decimalHours - hours) * 60);
  const seconds = Math.round(((decimalHours - hours) * 60 - minutes) * 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};


  const filteredPayrolls = payrolls.filter((p) => {
    const nameMatch = p.employee.fullName.toLowerCase().includes(search.toLowerCase());
    const pinMatch = p.employee.pincode?.includes(search);
    return nameMatch || pinMatch;
  });

  // ✅ Pagination logic
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
      PIN: p.employee.pincode || "-",
      Period: `${startDate} to ${endDate}`,
      "Total Hours": formatHours(p.totalHours),
      "Total Days": p.totalDays?.toFixed(2) || "0.00",
      "Rate Per Hour": p.ratePerHour.toFixed(2),
      "Gross Pay": p.grossPay.toFixed(2),
      Deductions: p.deductions.toFixed(2),
      "Net Pay": p.netPay.toFixed(2),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

  // ✅ Custom filename with Payroll + Period
  XLSX.writeFile(workbook, `Payroll_${startDate}_to_${endDate}.xlsx`);
};


 const exportToPDF = () => {
  const doc = new jsPDF();

  // ✅ Add title and payroll period
  doc.setFontSize(16);
  doc.text("Payroll Records", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Period: ${startDate} to ${endDate}`, 105, 25, { align: "center" });

  autoTable(doc, {
    head: [["Employee", "PIN", "Period", "Total Hours", "Total Days", "Rate/Hour", "Gross Pay", "Deductions", "Net Pay"]],
    body: filteredPayrolls.map((p) => [
      p.employee.fullName,
      p.employee.pincode || "-",
      `${startDate} to ${endDate}`,
      formatHours(p.totalHours),
      p.totalDays?.toFixed(2) || "0.00",
      p.ratePerHour.toFixed(2),
      p.grossPay.toFixed(2),
      p.deductions.toFixed(2),
      p.netPay.toFixed(2),
    ]),
    startY: 35, // ✅ Table starts after header
    styles: { fontSize: 8 },
  });

  // ✅ Custom filename with Payroll + Period
  doc.save(`Payroll_${startDate}_to_${endDate}.pdf`);
};


  // ✅ View Payslip for single employee
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
      alert("Error fetching payslip");
    }
  };

  // ✅ Download single payslip
  const handleDownloadPayslip = () => {
    if (!payslip) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Employee Payslip", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Employee: ${payslip.employee.fullName}`, 20, 40);
    doc.text(`Position: ${payslip.employee.position || "-"}`, 20, 48);
    doc.text(`PIN: ${payslip.employee.pincode || "-"}`, 20, 56);
    doc.text(
      `Period: ${new Date(payslip.startDate).toLocaleDateString()} - ${new Date(
        payslip.endDate
      ).toLocaleDateString()}`,
      20,
      64
    );

    // ✅ FIXED: include Total Days
    doc.text(`Total Days: ${payslip.totalDays?.toFixed(2) || "0.00"}`, 20, 72);
    doc.text(`Total Hours: ${formatHours(payslip.totalHours)}`, 20, 80);
    doc.text(`Rate/Hour: ₱${payslip.ratePerHour.toFixed(2)}`, 20, 88);
    doc.text(`Gross Pay: ₱${payslip.grossPay.toFixed(2)}`, 20, 96);
    doc.text(`Deductions: ₱${payslip.deductions.toFixed(2)}`, 20, 104);
    doc.text(`Net Pay: ₱${payslip.netPay.toFixed(2)}`, 20, 112);

    doc.save(`${payslip.employee.fullName}_Payslip.pdf`);
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

      {/* Date Range + Search */}
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
                    "Total Days", // ✅ Added
                    "Rate/Hour",
                    "Gross Pay",
                    "Deductions",
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
                    <TableCell>{p.employee.pincode || "-"}</TableCell>
                    <TableCell>{`${startDate} to ${endDate}`}</TableCell>
                    <TableCell>{formatHours(p.totalHours)}</TableCell>
                    <TableCell>{p.totalDays?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>{p.ratePerHour.toFixed(2)}</TableCell>
                    <TableCell>{p.grossPay.toFixed(2)}</TableCell>
                    <TableCell>{p.deductions.toFixed(2)}</TableCell>
                    <TableCell>{p.netPay.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewPayslip(p.employee._id)}
                      >
                        View Payslip
                      </Button>
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
              />
            </Box>
          )}
        </>
      )}

      {/* Payslip Preview Modal */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payslip Preview</DialogTitle>
        <DialogContent dividers>
          {payslip ? (
            <Box>
              <Typography variant="subtitle1">
                <strong>Employee:</strong> {payslip.employee.fullName}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Position:</strong> {payslip.employee.position || "-"}
              </Typography>
              <Typography variant="subtitle1">
                <strong>PIN:</strong> {payslip.employee.pincode || "-"}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Period:</strong>{" "}
                {new Date(payslip.startDate).toLocaleDateString()} -{" "}
                {new Date(payslip.endDate).toLocaleDateString()}
              </Typography>
              <Box mt={2}>
                <Typography>
                  <strong>Total Days:</strong> {payslip.totalDays?.toFixed(2) || "0.00"}
                </Typography>
                <Typography>
                  <strong>Total Hours:</strong> {formatHours(payslip.totalHours)}
                </Typography>
                <Typography>
                  <strong>Rate/Hour:</strong> ₱{payslip.ratePerHour.toFixed(2)}
                </Typography>
                <Typography>
                  <strong>Gross Pay:</strong> ₱{payslip.grossPay.toFixed(2)}
                </Typography>
                <Typography>
                  <strong>Deductions:</strong> ₱{payslip.deductions.toFixed(2)}
                </Typography>
                <Typography>
                  <strong>Net Pay:</strong> ₱{payslip.netPay.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography>No payslip data</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="contained" onClick={handleDownloadPayslip}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollOverview;
