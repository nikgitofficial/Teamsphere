import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";
import CircularProgress from "@mui/material/CircularProgress";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);

  const simulateProgress = () => {
    let percent = 0;
    const interval = setInterval(() => {
      percent += 10;
      if (percent >= 90) clearInterval(interval);
      else setLoadingPercent(percent);
    }, 100);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const getMe = async () => {
    simulateProgress();

    try {
      const res = await axios.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setLoadingPercent(100);
    } catch (err) {
      console.error("Auth check failed:", err.message);

      // Attempt token refresh manually on failure
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshRes = await axios.get("/auth/refresh", {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          const newAccessToken = refreshRes.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          // Retry /me with new token
          const retryRes = await axios.get("/auth/me");
          setUser(retryRes.data);
          localStorage.setItem("user", JSON.stringify(retryRes.data));
        } catch {
          logout();
        }
      } else {
        logout();
      }
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    if (!user) {
      getMe();
    } else {
      setLoading(false);
    }
  }, []);

  // Call this to update user info and cache
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, logout }}>
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "sans-serif",
            backgroundColor: "#f5f5f5",
            position: "relative",
          }}
        >
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <CircularProgress size={100} thickness={5} />
            <img
              src="/favicon.ico"
              alt="Logo"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 50,
                height: 50,
                borderRadius: "50%",
              }}
            />
          </div>
          <p style={{ fontSize: 18, color: "#555" }}>
            Verifying... {loadingPercent}%
          </p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};