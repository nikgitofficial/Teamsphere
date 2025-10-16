import React, { useState, useEffect } from "react";
import { IconButton, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const ScrollArrow = () => {
  const [direction, setDirection] = useState("down"); // up or down
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setDirection("up");
        setVisible(true);
      } else if (scrollTop < 100) {
        setDirection("down");
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (direction === "up") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 40,
        right: 40,
        zIndex: 999,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.7)",
        pointerEvents: visible ? "auto" : "none", // prevents clicking when hidden
      }}
    >
      <IconButton
        onClick={handleClick}
        sx={{
          bgcolor: "#FF8C00",
          color: "#fff",
          "&:hover": { bgcolor: "#FFA726", transform: "scale(1.1)" },
          boxShadow: 3,
          width: 56,
          height: 56,
          transition: "transform 0.2s ease",
        }}
      >
        {direction === "up" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
      </IconButton>
    </Box>
  );
};

export default ScrollArrow;
