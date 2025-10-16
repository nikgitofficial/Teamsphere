import { useEffect, useState } from "react";
import employeeAxios from "../../api/employeeAxios";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Fade,
  IconButton,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import RefreshIcon from "@mui/icons-material/Refresh";

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await employeeAxios.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        background: "linear-gradient(to bottom right, #f7f8fa, #e9ecef)",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <CampaignIcon sx={{ fontSize: 36, color: "#ff9800" }} />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: "#333",
            textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          Company Announcements
        </Typography>
        
      </Box>

      {/* Loading Spinner */}
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
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  textAlign: "left",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#ff9800", mb: 0.5 }}
                >
                  {a.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Posted by <strong>{a.author?.username || "Admin"}</strong> •{" "}
                  {new Date(a.createdAt).toLocaleString()}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.6,
                    color: "#444",
                    whiteSpace: "pre-line",
                  }}
                >
                  {a.content}
                </Typography>
              </Paper>
            </Fade>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeAnnouncements;
