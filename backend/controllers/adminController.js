import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Rating from "../models/Rating.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 }); // newest first
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Promote user to admin
export const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(
      id,
      { role: "admin" },
      { new: true }
    ).select("-password");
    res.json({ msg: "User promoted to admin", user: updated });
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all ratings
export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete rating by ID
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    await Rating.findByIdAndDelete(id);
    res.json({ msg: "Rating deleted successfully" });
  } catch (err) {
    console.error("Error deleting rating:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get total employee count
export const getTotalEmployees = async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    res.json({ total: count });
  } catch (err) {
    console.error("Error fetching employee count:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("-__v")
      .populate("user", "username email role")
      .sort({ createdAt: -1 }); // newest first
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


