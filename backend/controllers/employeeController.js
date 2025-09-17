import Employee from "../models/Employee.js";
import { v2 as cloudinary } from "cloudinary";

// Utility to generate unique 6-digit pincode
const generateUniquePincode = async () => {
  let pin;
  let exists = true;
  while (exists) {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Employee.findOne({ pincode: pin });
  }
  return pin;
};

// Create employee (linked to logged-in user)
export const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      position,
      birthdate,
      hireDate, // ✅ added
      age,
      status,
      address,
      phone,
      email,
      department,
      salary,
      ratePerHour,    
      deductions,
      emergencyContact,
    } = req.body;

    const pincode = await generateUniquePincode();

    const employee = new Employee({
      fullName,
      position,
      birthdate,
      hireDate, 
      age,
      status,
      address,
      phone,
      email,
      department,
      salary,
      ratePerHour,    
      deductions,    
      emergencyContact,
      pincode,
      user: req.user.id,
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get employees for current user only
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user.id });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update employee (only if belongs to user)
export const updateEmployee = async (req, res) => {
  try {
    const updateData = { ...req.body }; // includes hireDate now

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true }
    );

    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete employee (only if belongs to user)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.json({ msg: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Upload / Update employee profile picture
export const uploadEmployeePic = async (req, res) => {
  try {
    const employeeId = req.params.id;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const employee = await Employee.findOne({
      _id: employeeId,
      user: req.user.id,
    });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    // Delete old pic from Cloudinary if exists
    if (employee.profilePic) {
      const publicId = employee.profilePic.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    employee.profilePic = req.file.path;
    await employee.save();

    res.json({ msg: "Profile picture updated", employee });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
