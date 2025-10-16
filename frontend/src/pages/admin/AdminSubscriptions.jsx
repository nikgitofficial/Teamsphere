// pages/AdminSubscriptions.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  TablePagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

const AdminSubscriptions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get("/subscription");
        setSubscriptions(res.data);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Failed to fetch subscriptions." });
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const handleAddSubscription = async () => {
    if (!newEmail) return;
    setAdding(true);
    try {
      const res = await axios.post("/subscription", { email: newEmail });
      setSubscriptions((prev) => [...prev, res.data]);
      setSnackbar({ open: true, message: "Subscription added!" });
      setNewEmail("");
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to add subscription." });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/subscription/${id}`);
      setSubscriptions((prev) => prev.filter((s) => s._id !== id));
      setSnackbar({ open: true, message: "Subscription deleted!" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete subscription." });
    }
  };

  const pieData = useMemo(() => {
    const domains = subscriptions.reduce((acc, sub) => {
      const domain = sub.email.split("@")[1] || "unknown";
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(domains).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const barData = useMemo(() => {
    const grouped = subscriptions.reduce((acc, sub) => {
      const date = new Date(sub.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }, [subscriptions]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4, px: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: "center" }}>
          Subscriptions & Analytics
        </Typography>

        {/* Analytics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscriptions by Domain
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscriptions Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Subscriptions Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ overflowX: "auto", p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Date Subscribed</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((sub) => (
                    <TableRow key={sub._id}>
                      <TableCell>{sub.email}</TableCell>
                      <TableCell>
                        {new Date(sub.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(sub._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={subscriptions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </Paper>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          onClose={() => setSnackbar({ open: false, message: "" })}
          message={snackbar.message}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
      </Box>
    </Box>
  );
};

export default AdminSubscriptions;