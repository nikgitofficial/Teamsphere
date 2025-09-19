import Payroll from "../models/Payroll.js"; 
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { calculateHours } from "../utils/calculateHours.js";

// Generate payroll for all employees (custom date range)
export const generatePayroll = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employees = await Employee.find({ user: req.user.id });
    const payrolls = [];

    for (const emp of employees) {
      const attendances = await Attendance.find({
        employee: emp._id,
        date: { $gte: start, $lte: end },
      });

      const totalHours = attendances.reduce((sum, a) => sum + calculateHours(a), 0);
      const totalDays = totalHours / 8; // ✅ Convert hours → days

      const ratePerHour = emp.ratePerHour || 0;
      const grossPay = totalHours * ratePerHour;
      const deductions = emp.deductions || 0;
      const netPay = grossPay - deductions;

      const payroll = await Payroll.findOneAndUpdate(
        { employee: emp._id, startDate: start, endDate: end },
        { totalHours, totalDays, ratePerHour, grossPay, deductions, netPay },
        { upsert: true, new: true }
      );

      payrolls.push(payroll);
    }

    const populatedPayrolls = await Payroll.find({ _id: { $in: payrolls.map(p => p._id) } })
      .populate("employee", "fullName");

    res.json({ msg: "✅ Payroll generated", payrolls: populatedPayrolls });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Generate payslip for a single employee
export const generatePayslip = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;

    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ msg: "Employee ID, start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employee = await Employee.findOne({ _id: employeeId, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    const attendances = await Attendance.find({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    const totalHours = attendances.reduce((sum, a) => sum + calculateHours(a), 0);
    const totalDays = totalHours / 8; // ✅ Convert hours → days

    const ratePerHour = employee.ratePerHour || 0;
    const grossPay = totalHours * ratePerHour;
    const deductions = employee.deductions || 0;
    const netPay = grossPay - deductions;

    const payroll = await Payroll.findOneAndUpdate(
      { employee: employee._id, startDate: start, endDate: end },
      { totalHours, totalDays, ratePerHour, grossPay, deductions, netPay },
      { upsert: true, new: true }
    ).populate("employee", "fullName position pincode");

    res.json({ msg: "✅ Payslip generated", payslip: payroll });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
