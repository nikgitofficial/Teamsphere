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
  IconButton,
  Tooltip,
  CircularProgress,
  Modal,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AnnouncementIcon from "@mui/icons-material/Campaign";

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
      console.error("Failed to fetch announcements:", err);
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
      console.error("Post failed:", err);
      setSnackbar({ open: true, msg: "Failed to post announcement" });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await axios.delete(`/announcements/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setAnnouncements((prev) => prev.filter((a) => a._id !== deleteId));
      setDeleteModalOpen(false);
      setDeleteId(null);
      setSnackbar({ open: true, msg: "Announcement deleted successfully!" });
    } catch (err) {
      console.error("Delete failed:", err);
      setSnackbar({ open: true, msg: "Failed to delete announcement" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafafa",
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" fontWeight={700} color="primary" textAlign="center" mb={3}>
        📢 Announcements
      </Typography>

      {(user?.role === "admin" || user?.role === "user") && (
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 5,
            width: "100%",
            maxWidth: 700,
            borderRadius: 4,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}>
            <AddCircleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Create New Announcement
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              sx={{ mb: 2 }}
              variant="outlined"
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              sx={{ mb: 2 }}
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={submitting}
              fullWidth
              sx={{
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {submitting ? "Posting..." : "Post Announcement"}
            </Button>
          </form>
        </Paper>
      )}

      {loading ? (
        <CircularProgress sx={{ mt: 6 }} />
      ) : announcements.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No announcements yet.
        </Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            maxWidth: 700,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {announcements.map((a) => (
            <Paper
              key={a._id}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                boxShadow: "0px 4px 15px rgba(0,0,0,0.05)",
                position: "relative",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AnnouncementIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {a.title}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                by {a.author?.username || "User"} • {new Date(a.createdAt).toLocaleString()}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body1" sx={{ color: "text.primary", whiteSpace: "pre-line" }}>
                {a.content}
              </Typography>

              {(user?.role === "admin" || a.author?._id === user?._id) && (
                <Tooltip title="Delete announcement">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => openDeleteModal(a._id)}
                    sx={{ position: "absolute", top: 10, right: 10 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            width: { xs: "80%", sm: 400 },
            textAlign: "center",
          }}
        >
          <Typography variant="h6" mb={3}>
            Are you sure you want to delete this announcement?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setDeleteModalOpen(false)}
              fullWidth
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              fullWidth
              disabled={deleting}
              startIcon={deleting && <CircularProgress size={20} color="inherit" />}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </Box>
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

export default Announcements;
