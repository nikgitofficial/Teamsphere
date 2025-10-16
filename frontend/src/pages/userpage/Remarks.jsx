import { useEffect, useState, useContext } from "react";
import { Box, Typography, List, ListItem, ListItemText, TextField, Button, CircularProgress } from "@mui/material";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const Remarks = () => {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRemark, setNewRemark] = useState({ title: "", comment: "" });
  const { logout, user } = useContext(AuthContext);

  // Only admins/managers can add remarks
  const canCreate = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        const res = await axios.get("/remarks");
        setRemarks(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchRemarks();
  }, [logout]);

  const handleInputChange = (e) => setNewRemark({ ...newRemark, [e.target.name]: e.target.value });

  const handleAddRemark = async () => {
    if (!newRemark.comment) return;
    try {
      const res = await axios.post("/remarks", newRemark);
      setRemarks([res.data, ...remarks]);
      setNewRemark({ title: "", comment: "" });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) logout();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" mb={2}>Remarks & Announcements</Typography>

      {canCreate && (
        <Box mb={3} display="flex" flexDirection="column" gap={2}>
          <TextField label="Title (optional)" name="title" value={newRemark.title} onChange={handleInputChange} />
          <TextField label="Comment" name="comment" multiline minRows={2} value={newRemark.comment} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={handleAddRemark}>Add Remark</Button>
        </Box>
      )}

      {remarks.length === 0 ? <Typography>No remarks yet.</Typography> : (
        <List>
          {remarks.map(r => (
            <ListItem key={r._id} divider>
              <ListItemText
                primary={r.title || r.comment}
                secondary={`Posted by: ${r.postedBy} | ${new Date(r.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Remarks;
