import express from "express";
import Remark from "../models/Remark.js";
import authenticate from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET all remarks (all authenticated users)
router.get("/", authenticate, async (req, res) => {
  const remarks = await Remark.find().sort({ createdAt: -1 });
  res.json(remarks);
});

// POST new remark (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  const { title, comment } = req.body;
  if (!comment) return res.status(400).json({ msg: "Comment is required" });

  const newRemark = new Remark({
    title,
    comment,
    postedBy: req.user.username
  });

  await newRemark.save();
  res.status(201).json(newRemark);
});

export default router;
