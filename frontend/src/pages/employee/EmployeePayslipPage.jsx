import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Paper,
  TextField,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import employeeAxios from "../../api/employeeAxios";

const EmployeePayslipPage = () => {
  const theme = useTheme(); // Access current MUI theme (light/dark)
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPayslip = async () => {
    try {
      const storedEmployee = JSON.parse(localStorage.getItem("employee"));
      if (!storedEmployee?._id) {
        setError("No employee found. Please login again.");
        return;
      }
      if (!startDate || !endDate) {
        setError("Please select start and end dates.");
        return;
      }

      setLoading(true);
      const res = await employeeAxios.post(`/payroll/payslip/employee`, {
        employeeId: storedEmployee._id,
        startDate,
        endDate,
      });

      setPayslip(res.data.payslip);
    } catch (err) {
      console.error("Error fetching payslip:", err);
      const errorMsg = err.response?.data?.msg || "Failed to fetch payslip.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);
    const seconds = Math.round(((decimalHours - hours) * 60 - minutes) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const exportToExcel = () => {
    if (!payslip) return;
    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Employee Name": payslip.employee.fullName,
        Period: `${startDate} to ${endDate}`,
        "Total Days": payslip.totalDays?.toFixed(2) || "0.00",
        "Total Hours": formatHours(payslip.totalHours),
        "Rate/Hour": payslip.ratePerHour.toFixed(2),
        "Gross Pay": payslip.grossPay.toFixed(2),
        "Deductions (Total)": payslip.deductions?.total?.toFixed(2) || "0.00",
        "Net Pay": payslip.netPay.toFixed(2),
      },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payslip");
    XLSX.writeFile(workbook, `Payslip_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    if (!payslip) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("NikTech Inc.", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text("Employee Payslip", 105, 25, { align: "center" });
    doc.text(`Period: ${startDate} to ${endDate}`, 105, 32, { align: "center" });

    autoTable(doc, {
      startY: 40,
      head: [["Field", "Value"]],
      body: [
        ["Employee", payslip.employee.fullName],
        ["Position", payslip.employee.position || "-"],
        ["Period", `${startDate} to ${endDate}`],
      ],
      theme: "grid",
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Total Days", "Total Hours", "Rate/Hour", "Gross Pay"]],
      body: [
        [
          payslip.totalDays?.toFixed(2) || "0.00",
          formatHours(payslip.totalHours),
          `₱${payslip.ratePerHour.toFixed(2)}`,
          `₱${payslip.grossPay.toFixed(2)}`,
        ],
      ],
      theme: "striped",
    });

    const d = payslip.deductions || {};
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Deduction Type", "Amount"]],
      body: [
        ["Absent", `₱${d.absent?.toFixed(2) || "0.00"}`],
        ["Late", `₱${d.late?.toFixed(2) || "0.00"}`],
        ["SSS", `₱${d.sss?.toFixed(2) || "0.00"}`],
        ["PhilHealth", `₱${d.philhealth?.toFixed(2) || "0.00"}`],
        ["Pag-IBIG", `₱${d.pagibig?.toFixed(2) || "0.00"}`],
        ["TIN", `₱${d.tin?.toFixed(2) || "0.00"}`],
        ["Other", `₱${d.other?.toFixed(2) || "0.00"}`],
        ["TOTAL", `₱${d.total?.toFixed(2) || "0.00"}`],
      ],
      theme: "grid",
      columnStyles: { 1: { halign: "right" } },
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 153, 84);
    doc.text(`Net Pay: ₱${payslip.netPay.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 15);

    doc.save(`${payslip.employee.fullName}_Payslip.pdf`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Employee Payslip
      </Typography>

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
          onClick={fetchPayslip}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Generate
        </Button>
        <Button
          variant="outlined"
          onClick={exportToExcel}
          disabled={!payslip}
        >
          Export Excel
        </Button>
        <Button
          variant="outlined"
          onClick={exportToPDF}
          disabled={!payslip}
        >
          Export PDF
        </Button>
      </Stack>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
            mb: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {payslip ? (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {/* Employee Info */}
<Box
  display="grid"
  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
  gap={2}
  sx={{
    bgcolor: theme.palette.background.default,
    p: 2,
    borderRadius: 2,
    mb: 2,
  }}
>
  <Typography>
    <strong>Employee:</strong> {payslip.employee?.fullName}
  </Typography>
  <Typography>
    <strong>Position:</strong> {payslip.employee?.position || "-"}
  </Typography>
  <Typography>
    <strong>Department:</strong> {payslip.employee?.department || "-"}
  </Typography>
  <Typography color="text.secondary">
    <strong>Period:</strong>{" "}
    {new Date(payslip.startDate).toLocaleDateString()} -{" "}
    {new Date(payslip.endDate).toLocaleDateString()}
  </Typography>
</Box>

          

          {/* Earnings */}
          <Box
            display="flex"
            flexDirection="column"
            gap={1}
            sx={{
              bgcolor: theme.palette.mode === "light" ? "grey.50" : "grey.900",
              p: 2,
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography>
              <strong>Total Days:</strong> {payslip.totalDays || 0}
            </Typography>
            <Typography>
              <strong>Total Hours:</strong> {formatHours(payslip.totalHours)}
            </Typography>
            <Typography>
              <strong>Rate/Hour:</strong> ₱{payslip.ratePerHour.toFixed(2)}
            </Typography>
            <Typography fontWeight={600} color="success.main">
              <strong>Gross Pay:</strong> ₱{payslip.grossPay.toFixed(2)}
            </Typography>
          </Box>

          {/* Deductions */}
          <Box
            sx={{
              bgcolor: theme.palette.background.default,
              p: 2,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: theme.palette.error.light,
              mb: 2,
            }}
          >
            <Typography fontWeight="bold" mb={1} color="error.main">
              Deductions:
            </Typography>

            <Typography>- SSS: ₱{payslip.deductions?.sss?.toFixed(2) || "0.00"}</Typography>
            <Typography>- PhilHealth: ₱{payslip.deductions?.philhealth?.toFixed(2) || "0.00"}</Typography>
            <Typography>- Pag-IBIG: ₱{payslip.deductions?.pagibig?.toFixed(2) || "0.00"}</Typography>
            <Typography>- TIN: ₱{payslip.deductions?.tin?.toFixed(2) || "0.00"}</Typography>
            <Typography>- Other: ₱{payslip.deductions?.other?.toFixed(2) || "0.00"}</Typography>

            <Divider sx={{ my: 1 }} />
            <Typography fontWeight="bold" mt={1} color="error.dark">
              TOTAL: ₱{payslip.deductions?.total?.toFixed(2) || "0.00"}
            </Typography>
          </Box>

          {/* Net Pay */}
          <Box
            textAlign="center"
            sx={{
              bgcolor: theme.palette.success.light,
              color: theme.palette.success.contrastText,
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Net Pay: ₱{payslip.netPay.toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      ) : (
        !loading && <Typography color="text.secondary">No payslip available</Typography>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeePayslipPage;
