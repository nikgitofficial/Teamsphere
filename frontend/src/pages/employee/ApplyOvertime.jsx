import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";
import employeeAxios from "../../api/employeeAxios";

const ApplyOvertime = () => {
  const [form, setForm] = useState({ date: "", hours: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [overtimes, setOvertimes] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchOTs = async () => {
    try {
      const res = await employeeAxios.get("/overtime/my");
      setOvertimes(res.data);
    } catch (err) {
      console.error("Fetch OT error:", err);
    }
  };

  useEffect(() => {
    fetchOTs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeAxios.post("/overtime/apply", form);
      setSnack({ open: true, message: "Overtime request submitted!", severity: "success" });
      setForm({ date: "", hours: "", reason: "" });
      fetchOTs();
    } catch (err) {
      console.error("Apply OT error:", err.response?.data || err.message);
      setSnack({ open: true, message: "Failed to apply OT", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 700, width: "100%", boxShadow: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" align="center" gutterBottom sx={{ color: "primary.main" }}>
          Apply Overtime
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Date"
            type="date"
            name="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Hours"
            type="number"
            name="hours"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Reason"
            name="reason"
            multiline
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Submit"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 900, width: "100%", boxShadow: 2, borderRadius: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          My Overtime Requests
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Hours</TableCell>
              <TableCell align="center">Reason</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overtimes.map((ot) => (
              <TableRow key={ot._id}>
                <TableCell align="center">{new Date(ot.date).toLocaleDateString()}</TableCell>
                <TableCell align="center">{ot.hours}</TableCell>
                <TableCell align="center">{ot.reason}</TableCell>
                <TableCell align="center">{ot.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplyOvertime;
