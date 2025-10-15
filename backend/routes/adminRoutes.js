import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// GET all users (admin only)
router.get("/users", authenticate, requireAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Promote user to admin
router.patch("/promote/:id", authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await User.findByIdAndUpdate(id, { role: "admin" }, { new: true }).select("-password");
  res.json({ msg: "User promoted to admin", user: updated });
});

export default router;
