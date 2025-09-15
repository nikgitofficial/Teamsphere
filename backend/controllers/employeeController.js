import Employee from "../models/Employee.js";

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
    const { fullName, position } = req.body;

    const pincode = await generateUniquePincode();

    const employee = new Employee({
      fullName,
      position,
      pincode,
      user: req.user.id, // assign to authenticated user
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
    const { fullName, position } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { fullName, position },
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
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.json({ msg: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
