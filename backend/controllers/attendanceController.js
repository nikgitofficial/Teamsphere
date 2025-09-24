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
      attendance = new Attendance({ employee: employee._id, date: new Date(), status: "Present" });
    }

    attendance.checkIns.push(new Date());
    attendance.status = "Present"; // update status
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
    attendance.status = "Present";
    await attendance.save();

    await sendResponse(res, "✅ Checked Out successfully", attendance._id);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 helper: parse shift time
const parseShiftTime = (shiftStr, baseDate) => {
  if (!shiftStr) return null;
  const [startStr] = shiftStr.split("-").map((s) => s.trim().toLowerCase());
  const match = startStr.match(/(\d+)(?::(\d+))?(am|pm)/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  let minute = parseInt(match[2] || "0", 10);
  const meridian = match[3].toLowerCase();

  if (meridian === "pm" && hour !== 12) hour += 12;
  if (meridian === "am" && hour === 12) hour = 0;

  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// 🔹 auto-mark absents
const autoMarkAbsents = async (userId) => {
  const { start, end } = todayRange();
  const employees = await Employee.find({ user: userId });

  for (const emp of employees) {
    let attendance = await Attendance.findOne({
      employee: emp._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      attendance = new Attendance({
        employee: emp._id,
        date: new Date(),
        status: "Absent",
      });
      await attendance.save();
    } else {
      if (!attendance.checkIns.length && emp.shift) {
        const shiftStart = parseShiftTime(emp.shift, new Date());
        if (shiftStart) {
          const cutoff = new Date(shiftStart.getTime() + 90 * 60000);
          if (new Date() > cutoff) {
            attendance.status = "Absent";
            await attendance.save();
          }
        }
      } else if (attendance.checkIns.length) {
        attendance.status = "Present";
        await attendance.save();
      }
    }
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

// ✅ Get all today's attendances (with auto absent update)
export const getAllTodayAttendances = async (req, res) => {
  try {
    await autoMarkAbsents(req.user.id);

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
      .sort({ date: -1 });

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
