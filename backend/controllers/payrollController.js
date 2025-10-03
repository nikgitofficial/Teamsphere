import Payroll from "../models/Payroll.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import { calculateHours } from "../utils/calculateHours.js";

/**
 * ✅ Generate payroll for all employees (admin, with token)
 */
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
      // ✅ Attendance within range
      const attendances = await Attendance.find({
        employee: emp._id,
        date: { $gte: start, $lte: end },
      });

      let totalHours = attendances.reduce((sum, a) => sum + calculateHours(a), 0);

      // ✅ Check manual override
      let payroll = await Payroll.findOne({ employee: emp._id, startDate: start, endDate: end });
      if (payroll?.manualTotalHours != null) {
        totalHours = payroll.manualTotalHours;
      }

      // ✅ Calculations
      const totalDays = totalHours / 8;
      const ratePerHour = emp.ratePerHour || 0;
      const grossPay = totalHours * ratePerHour;

      const deductions = {
        absent: emp.deductions?.absent || 0,
        late: emp.deductions?.late || 0,
        sss: emp.deductions?.sss || 0,
        philhealth: emp.deductions?.philhealth || 0,
        pagibig: emp.deductions?.pagibig || 0,
        tin: emp.deductions?.tin || 0,
        other: emp.deductions?.other || 0,
      };
      deductions.total = Object.values(deductions).reduce((a, b) => a + b, 0);

      const netPay = grossPay - deductions.total;

      payroll = await Payroll.findOneAndUpdate(
        { employee: emp._id, startDate: start, endDate: end },
        { totalHours, totalDays, ratePerHour, grossPay, deductions, netPay },
        { upsert: true, new: true }
      );

      payrolls.push(payroll);
    }

    // ✅ Populate employee info
    const populatedPayrolls = await Payroll.find({
      _id: { $in: payrolls.map((p) => p._id) },
    }).populate("employee", "fullName position pincode department");

    res.json({ msg: "✅ Payroll generated", payrolls: populatedPayrolls });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * ✅ Generate payslip for a single employee (admin, with token)
 */
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

    let totalHours = attendances.reduce((sum, a) => sum + calculateHours(a), 0);

    let payroll = await Payroll.findOne({ employee: employee._id, startDate: start, endDate: end });
    if (payroll?.manualTotalHours != null) {
      totalHours = payroll.manualTotalHours;
    }

    const totalDays = totalHours / 8;
    const ratePerHour = employee.ratePerHour || 0;
    const grossPay = totalHours * ratePerHour;

    const deductions = {
      absent: employee.deductions?.absent || 0,
      late: employee.deductions?.late || 0,
      sss: employee.deductions?.sss || 0,
      philhealth: employee.deductions?.philhealth || 0,
      pagibig: employee.deductions?.pagibig || 0,
      tin: employee.deductions?.tin || 0,
      other: employee.deductions?.other || 0,
    };
    deductions.total = Object.values(deductions).reduce((a, b) => a + b, 0);

    const netPay = grossPay - deductions.total;

    payroll = await Payroll.findOneAndUpdate(
      { employee: employee._id, startDate: start, endDate: end },
      { totalHours, totalDays, ratePerHour, grossPay, deductions, netPay },
      { upsert: true, new: true }
    ).populate("employee", "fullName position pincode department");

    res.json({ msg: "✅ Payslip generated", payslip: payroll });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * ✅ Update total hours for a payroll (manual override)
 */
export const updateTotalHours = async (req, res) => {
  try {
    const { payrollId } = req.params;
    const { totalHours } = req.body;

    if (totalHours == null || isNaN(totalHours) || totalHours < 0) {
      return res.status(400).json({ msg: "Total hours must be valid" });
    }

    const payroll = await Payroll.findById(payrollId);
    if (!payroll) return res.status(404).json({ msg: "Payroll not found" });

    payroll.manualTotalHours = totalHours;
    payroll.totalHours = totalHours;
    payroll.totalDays = totalHours / 8;
    payroll.grossPay = totalHours * payroll.ratePerHour;
    payroll.netPay = payroll.grossPay - (payroll.deductions.total || 0);

    await payroll.save();

    const updatedPayroll = await Payroll.findById(payrollId).populate("employee", "fullName position pincode");
    res.json({ msg: "✅ Total hours updated", payroll: updatedPayroll });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * ✅ Get latest payslip for a single employee (by ID)
 */
export const getEmployeePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ employee: req.params.id }).populate("employee", "fullName position");
    if (!payroll) return res.status(404).json({ msg: "Payslip not found" });

    res.json(payroll);
  } catch (err) {
    console.error("Error fetching payslip:", err);
    res.status(500).json({ msg: "Server error fetching payslip" });
  }
};

/**
 * ✅ Generate payslip for employees (self-service, no token required)
 */
export const generateEmployeePayslip = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ msg: "Employee ID, start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    const attendances = await Attendance.find({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    let totalHours = attendances.reduce((sum, a) => sum + calculateHours(a), 0);

    let payroll = await Payroll.findOne({ employee: employee._id, startDate: start, endDate: end });
    if (payroll?.manualTotalHours != null) {
      totalHours = payroll.manualTotalHours;
    }

    const totalDays = totalHours / 8;
    const ratePerHour = employee.ratePerHour || 0;
    const grossPay = totalHours * ratePerHour;

    const deductions = {
      absent: employee.deductions?.absent || 0,
      late: employee.deductions?.late || 0,
      sss: employee.deductions?.sss || 0,
      philhealth: employee.deductions?.philhealth || 0,
      pagibig: employee.deductions?.pagibig || 0,
      tin: employee.deductions?.tin || 0,
      other: employee.deductions?.other || 0,
    };
    deductions.total = Object.values(deductions).reduce((a, b) => a + b, 0);

    const netPay = grossPay - deductions.total;

    payroll = await Payroll.findOneAndUpdate(
      { employee: employee._id, startDate: start, endDate: end },
      { totalHours, totalDays, ratePerHour, grossPay, deductions, netPay },
      { upsert: true, new: true }
    ).populate("employee", "fullName position pincode department");

    res.json({ msg: "✅ Payslip generated", payslip: payroll });
  } catch (err) {
    console.error("Error generating employee payslip:", err);
    res.status(500).json({ msg: "Server error generating payslip" });
  }
};
