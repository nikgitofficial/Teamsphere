import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Adminhome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/admin/users"); // Axios instance adds token
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Unauthorized or forbidden
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
