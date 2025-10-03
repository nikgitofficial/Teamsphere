import Employee from "../models/Employee.js";

// ✅ Employee login
export const employeeLogin = async (req, res) => {
  try {
    const { email, pincode } = req.body;
    const employee = await Employee.findOne({ email, pincode });
    if (!employee) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    res.json(employee); // returns employee object including _id
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
};

// ✅ Fetch employee data by ID
export const getEmployeeData = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("Fetch employee error:", err);
    res.status(500).json({ msg: "Server error fetching employee data" });
  }
};
