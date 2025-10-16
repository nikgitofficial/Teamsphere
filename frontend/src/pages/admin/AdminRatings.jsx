import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#FF9800", "#4CAF50", "#2196F3", "#E91E63", "#9C27B0"];

const AdminRatings = () => {
  const { logout } = useContext(AuthContext);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const currentDateTime = new Date().toLocaleString();

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/ratings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setRatings(res.data);
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`/admin/ratings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setRatings((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const chartData = useMemo(() => {
    const grouped = {};
    ratings.forEach((r) => {
      grouped[r.rating] = (grouped[r.rating] || 0) + 1;
    });
    return Object.entries(grouped).map(([rating, count]) => ({
      rating: `${rating} ⭐`,
      count,
    }));
  }, [ratings]);

  const trendData = useMemo(() => {
    const sorted = [...ratings].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return sorted.map((r, i) => ({
      index: i + 1,
      rating: r.rating,
    }));
  }, [ratings]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: { xs: 2, md: 4 },
        bgcolor: "background.default",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#ff9800", mb: 4 }}
      >
        📈 Ratings Analytics Dashboard
      </Typography>

      {ratings.length === 0 ? (
        <Typography color="text.secondary">No ratings submitted yet.</Typography>
      ) : (
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{
            maxWidth: "1200px",
            width: "100%",
          }}
        >
          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 350 }} elevation={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Rating Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentDateTime}
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff9800" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Line Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 350 }} elevation={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Rating Trend Over Time
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentDateTime}
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" tick={false} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#2196f3"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 350 }} elevation={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Rating Share
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentDateTime}
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="rating"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Ratings List */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }} elevation={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Recent Ratings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentDateTime}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  maxHeight: 280,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {ratings.slice(-10).reverse().map((r) => (
                  <Paper
                    key={r._id}
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: 2,
                    }}
                    elevation={2}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        ⭐ {r.rating} / 5
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(r.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={deletingId === r._id}
                      onClick={() => handleDelete(r._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminRatings;
