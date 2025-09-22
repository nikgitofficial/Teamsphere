import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";

// Helper: get today's start & end
const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Format response with employee populated
const sendResponse = async (res, msg, attendanceId) => {
  const populated = await Attendance.findById(attendanceId).populate(
    "employee",
    "fullName position pincode profilePic shift"
  );

  res.json({ msg, attendance: populated });
};

// ✅ Check In
export const checkIn = async (req, res) => {
  try {
    const { pincode } = req.body;
    const employee = await Employee.findOne({ pincode, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Invalid pincode" });

    const { start, end } = todayRange();
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    // ✅ If no record for today, create a new one
    if (!attendance) {
      attendance = new Attendance({ employee: employee._id, date: new Date() });
    }

    attendance.checkIns.push(new Date());
    await attendance.save();

    await sendResponse(res, "✅ Successfully Checked In", attendance._id);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Break Out
export const breakOut = async (req, res) => {
  try {
    const { pincode } = req.body;
    const employee = await Employee.findOne({ pincode, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Invalid pincode" });

    // Get latest attendance (not just today)
    const attendance = await Attendance.findOne({
      employee: employee._id,
    }).sort({ date: -1 });

    if (!attendance || !attendance.checkIns.length)
      return res.status(400).json({ msg: "You must check in first" });

    attendance.breakOuts.push(new Date());
    await attendance.save();

    await sendResponse(res, "✅ Break Out recorded", attendance._id);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Break In
export const breakIn = async (req, res) => {
  try {
    const { pincode } = req.body;
    const employee = await Employee.findOne({ pincode, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Invalid pincode" });

    // Get latest attendance (not just today)
    const attendance = await Attendance.findOne({
      employee: employee._id,
    }).sort({ date: -1 });

    if (!attendance || !attendance.breakOuts.length)
      return res.status(400).json({ msg: "You must break out first" });

    attendance.breakIns.push(new Date());
    await attendance.save();

    await sendResponse(res, "✅ Break In recorded", attendance._id);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Check Out
export const checkOut = async (req, res) => {
  try {
    const { pincode } = req.body;
    const employee = await Employee.findOne({ pincode, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Invalid pincode" });

    // Get latest attendance (not just today)
    const attendance = await Attendance.findOne({
      employee: employee._id,
    }).sort({ date: -1 });

    if (!attendance || !attendance.checkIns.length)
      return res.status(400).json({ msg: "You must check in first" });

    attendance.checkOuts.push(new Date());
    await attendance.save();

    await sendResponse(res, "✅ Checked Out successfully", attendance._id);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ✅ Get today's attendance by pincode
export const getTodayAttendance = async (req, res) => {
  try {
    const { pincode } = req.params;
    const employee = await Employee.findOne({ pincode, user: req.user.id });
    if (!employee) return res.status(404).json({ msg: "Invalid pincode" });

    const { start, end } = todayRange();
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    }).populate("employee", "fullName position pincode profilePic shift");

    if (!attendance)
      return res.json({ msg: "No attendance today", attendance: null });

    res.json({ msg: "✅ Attendance found", attendance });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get all today's attendances
export const getAllTodayAttendances = async (req, res) => {
  try {
    const { start, end } = todayRange();
    const userEmployees = await Employee.find({ user: req.user.id });
    const employeeIds = userEmployees.map((e) => e._id);

    const attendances = await Attendance.find({
      employee: { $in: employeeIds },
      date: { $gte: start, $lte: end },
    }).populate("employee", "fullName position pincode profilePic shift");

    res.json({ msg: "✅ All attendances today", attendances });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get all attendances for this user (no date filter)
export const getAllAttendances = async (req, res) => {
  try {
    const userEmployees = await Employee.find({ user: req.user.id });
    const employeeIds = userEmployees.map((e) => e._id);

    const attendances = await Attendance.find({
      employee: { $in: employeeIds },
    })
      .populate("employee", "fullName position pincode profilePic shift")
      .sort({ date: -1 }); // ✅ latest first

    res.json({ msg: "✅ All attendances retrieved", attendances });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ✅ Get attendances by date range
export const getAttendancesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end)
      return res.status(400).json({ msg: "Start and end dates are required" });

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const userEmployees = await Employee.find({ user: req.user.id });
    const employeeIds = userEmployees.map((e) => e._id);

    const attendances = await Attendance.find({
      employee: { $in: employeeIds },
      date: { $gte: startDate, $lte: endDate },
    }).populate("employee", "fullName position pincode profilePic shift");

    res.json({ msg: "✅ Attendances fetched", attendances });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
