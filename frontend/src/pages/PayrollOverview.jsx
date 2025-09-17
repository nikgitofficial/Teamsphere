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
} from "@mui/material";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
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

  const formatHours = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
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
        "Rate Per Hour": p.ratePerHour.toFixed(2),
        "Gross Pay": p.grossPay.toFixed(2),
        Deductions: p.deductions.toFixed(2),
        "Net Pay": p.netPay.toFixed(2),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
    XLSX.writeFile(workbook, "payroll.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Records", 14, 15);
    autoTable(doc, {
      head: [["Employee", "PIN", "Period", "Total Hours", "Rate/Hour", "Gross Pay", "Deductions", "Net Pay"]],
      body: filteredPayrolls.map((p) => [
        p.employee.fullName,
        p.employee.pincode || "-",
        `${startDate} to ${endDate}`,
        formatHours(p.totalHours),
        p.ratePerHour.toFixed(2),
        p.grossPay.toFixed(2),
        p.deductions.toFixed(2),
        p.netPay.toFixed(2),
      ]),
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("payroll.pdf");
  };

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center">
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <MonetizationOn fontSize="large" />
        <Typography variant="h4" fontWeight="bold">
          Payroll Overview
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" onClick={exportToExcel}>Export Excel</Button>
          <Button variant="contained" color="error" onClick={exportToPDF}>Export PDF</Button>
        </Stack>
      </Stack>

      {/* Date Range + Search */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <TextField label="End Date" type="date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button
  variant="contained"
  onClick={fetchPayrolls}
  disabled={loading}
  startIcon={loading && <CircularProgress size={20} />}
>
  Generate
</Button>

        <TextField label="Search by Name or PIN" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
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
                  {["Employee", "PIN", "Period", "Total Hours", "Rate/Hour", "Gross Pay", "Deductions", "Net Pay"].map(header => (
                    <TableCell key={header} sx={{ fontWeight: "bold" }}>{header}</TableCell>
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
                    <TableCell>{p.ratePerHour.toFixed(2)}</TableCell>
                    <TableCell>{p.grossPay.toFixed(2)}</TableCell>
                    <TableCell>{p.deductions.toFixed(2)}</TableCell>
                    <TableCell>{p.netPay.toFixed(2)}</TableCell>
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
    </Box>
  );
};

export default PayrollOverview;
