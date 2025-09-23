import Employee from "../models/Employee.js";
import { v2 as cloudinary } from "cloudinary";

// Generate unique PIN
const generateUniquePincode = async () => {
  let pin, exists = true;
  while (exists) {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Employee.findOne({ pincode: pin });
  }
  return pin;
};

// Create
export const createEmployee = async (req, res) => {
  try {
    const { deductions = {}, ...rest } = req.body;

    const total =
      (Number(deductions.absent) || 0) +
      (Number(deductions.late) || 0) +
      (Number(deductions.sss) || 0) +
      (Number(deductions.tin) || 0) +
      (Number(deductions.pagibig) || 0) +
      (Number(deductions.philhealth) || 0) +
      (Number(deductions.other) || 0);

    const employee = new Employee({
      ...rest,
      deductions: { ...deductions, total },
      pincode: await generateUniquePincode(),
      user: req.user.id,
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user.id });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update
export const updateEmployee = async (req, res) => {
  try {
    const { deductions = {}, ...rest } = req.body;

    const total =
      (Number(deductions.absent) || 0) +
      (Number(deductions.late) || 0) +
      (Number(deductions.sss) || 0) +
      (Number(deductions.tin) || 0) +
      (Number(deductions.pagibig) || 0) +
      (Number(deductions.philhealth) || 0) +
      (Number(deductions.other) || 0);

    const updateData = {
      ...rest,
      deductions: { ...deductions, total },
    };

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

// Delete
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

// Upload Pic
export const uploadEmployeePic = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

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

// Get total employee count
export const getEmployeeCount = async (req, res) => {
  try {
    const count = await Employee.countDocuments({ user: req.user.id });
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
