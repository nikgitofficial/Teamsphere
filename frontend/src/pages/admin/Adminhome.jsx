import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Adminhome = () => {
  const [users, setUsers] = useState([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/admin/users"); // Axios instance already adds token
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 401) {
          // Token expired or unauthorized
          logout();
          navigate("/login");
        }
      }
    };

    fetchUsers();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        mt: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" width="100%" maxWidth={600} mb={3}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Typography variant="subtitle1" mb={3}>
        Total Users: {users.length}
      </Typography>

      <Box width="100%" maxWidth={600}>
        <Typography variant="h6" mb={1}>
          Users
        </Typography>
        <List>
          {users.map((u) => (
            <ListItem key={u._id} divider>
              <ListItemText primary={u.username} secondary={`${u.email} | Role: ${u.role}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Adminhome;
