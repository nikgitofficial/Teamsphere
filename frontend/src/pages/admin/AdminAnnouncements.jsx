import { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Fade,
  Stack,
  Avatar,
  Modal,
  Snackbar,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";

const AdminAnnouncements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: "Failed to fetch announcements" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    try {
      setSubmitting(true);
      await axios.post("/announcements", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setForm({ title: "", content: "" });
      fetchAnnouncements();
      setSnackbar({ open: true, msg: "Announcement posted successfully!" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: "Failed to post announcement" });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      setDeleting(true);
      await axios.delete(`/announcements/${selectedAnnouncement._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setDeleteModalOpen(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
      setSnackbar({ open: true, msg: "Announcement deleted successfully!" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: "Failed to delete announcement" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 4, sm: 6 },
        background: "linear-gradient(to bottom right, #f7f8fa, #e9ecef)",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: { xs: 3, sm: 4, md: 6 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1, sm: 2 },
        }}
      >
        <CampaignIcon sx={{ fontSize: { xs: 30, sm: 36 }, color: "#ff9800" }} />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "#333",
            textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
          }}
        >
          📢 Admin Announcements
        </Typography>
      </Box>

      {/* Create Announcement Form */}
      <Fade in timeout={600}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 3, sm: 4, md: 6 },
            width: "100%",
            maxWidth: 600,
            textAlign: "center",
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h6" mb={2}>
            Create New Announcement
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              sx={{ mb: 2 }}
              size="small"
            />
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={submitting}
              sx={{
                background: "linear-gradient(90deg, #ff9800, #f57c00)",
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(90deg, #fb8c00, #ef6c00)",
                },
              }}
            >
              {submitting ? "Posting..." : "Post"}
            </Button>
          </form>
        </Paper>
      </Fade>

      {/* Announcements List */}
      {loading ? (
        <CircularProgress sx={{ mt: 10, color: "#ff9800" }} />
      ) : announcements.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 5, textAlign: "center" }}
        >
          No announcements available.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", maxWidth: 700 }}>
          {announcements.map((a, index) => (
            <Fade in key={a._id || index} timeout={500 + index * 100}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: 3,
                  borderRadius: 3,
                  textAlign: "left",
                  background: "linear-gradient(145deg, #ffffff, #f9fafb)",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Avatar
                    sx={{ bgcolor: "rgba(255,152,0,0.15)", width: 36, height: 36 }}
                  >
                    <CampaignIcon sx={{ color: "#ff9800" }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#ff9800",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    {a.title}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  by <strong>{a.author?.username || "User"}</strong> •{" "}
                  {new Date(a.createdAt).toLocaleString()}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.6,
                    color: "#444",
                    whiteSpace: "pre-line",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {a.content}
                </Typography>
                {user?.role === "admin" && (
                  <Button
                    onClick={() => confirmDelete(a)}
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Delete
                  </Button>
                )}
              </Paper>
            </Fade>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        aria-labelledby="delete-confirmation-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" mb={2}>
            Are you sure you want to delete?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={deleting}
              startIcon={deleting && <CircularProgress size={16} />}
            >
              {deleting ? "Deleting..." : "Confirm"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.msg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default AdminAnnouncements;
