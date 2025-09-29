import Employee from "../models/Employee.js";
import { validationResult } from "express-validator";

// Employee login
export const loginEmployee = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, pincode } = req.body;

    const employee = await Employee.findOne({ email, pincode });
    if (!employee) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    res.json({
      _id: employee._id,
      fullName: employee.fullName || "",
      email: employee.email || "",
      profilePic: employee.profilePic || "",
      workStatus: employee.workStatus || "Active",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
};

// Get logged-in employee data
export const getEmployeeData = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employeeId);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    res.json(employee);
  } catch (err) {
    console.error("Fetch employee error:", err);
    res.status(500).json({ msg: "Server error fetching employee data" });
  }
};
