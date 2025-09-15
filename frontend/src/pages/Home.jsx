import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("accessToken");

    // Optional: call logout API if using cookies
    fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div>
      <h1>Home</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
