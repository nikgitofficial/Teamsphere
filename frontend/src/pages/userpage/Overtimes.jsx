import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  TableContainer, 
} from "@mui/material";
import axios from "../../api/axios";

const UserOTDashboard = () => {
  const [ots, setOts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPendingOTs = async () => {
    try {
      const res = await axios.get("/overtime/pending");
      setOts(res.data);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to fetch OT requests", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.put(`/overtime/${id}/status`, { status });
      setSnack({ open: true, message: `OT ${status}`, severity: "success" });
      fetchPendingOTs();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to update OT", severity: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchPendingOTs();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={{ xs: 2, sm: 3 }}
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Typography variant="h4" mb={3} fontWeight="bold">
        Pending Overtime Requests
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : ots.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No pending OT requests.
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ width: { xs: "100%", sm: "90%", md: "70%" }, borderRadius: 2, p: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Hours</TableCell>
                <TableCell align="center">Reason</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ots.map((ot) => (
                <TableRow key={ot._id} hover>
                  <TableCell align="center">{new Date(ot.date).toLocaleDateString()}</TableCell>
                  <TableCell align="center">{ot.hours}</TableCell>
                  <TableCell align="center">{ot.reason}</TableCell>
                  <TableCell align="center">{ot.status}</TableCell>
                  <TableCell align="center">
                    {ot.status === "Pending" ? (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          disabled={updatingId === ot._id}
                          onClick={() => handleStatus(ot._id, "Approved")}
                        >
                          {updatingId === ot._id ? <CircularProgress size={18} /> : "Approve"}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={updatingId === ot._id}
                          onClick={() => handleStatus(ot._id, "Rejected")}
                        >
                          {updatingId === ot._id ? <CircularProgress size={18} /> : "Reject"}
                        </Button>
                      </Stack>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserOTDashboard;
