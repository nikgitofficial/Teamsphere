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

// 🔹 Helper: parse shift time
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

// 🔹 Auto-mark absents for missing days (handles overnight shifts)
const autoMarkAbsents = async (userId) => {
  const employees = await Employee.find({ user: userId });
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (const emp of employees) {
    const lastAttendance = await Attendance.findOne({ employee: emp._id }).sort({ date: -1 });
    let startDate = lastAttendance ? new Date(lastAttendance.date) : new Date(emp.createdAt);
    startDate.setHours(0, 0, 0, 0);

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      let attendance = await Attendance.findOne({
        employee: emp._id,
        date: { $gte: dayStart, $lte: dayEnd },
      });

      if (!attendance) {
        attendance = new Attendance({
          employee: emp._id,
          date: new Date(dayStart),
          status: "Absent",
        });
        await attendance.save();
      } else {
        if (!attendance.checkIns.length && emp.shift) {
          const shiftStart = parseShiftTime(emp.shift, new Date(dayStart));
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
  }
};

// 🔹 Helper: get active attendance considering overnight shift
const getActiveAttendance = async (employee) => {
  const now = new Date();
  const { start, end } = todayRange();

  // Check today
  let attendance = await Attendance.findOne({
    employee: employee._id,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  // If no check-ins today and employee has a shift, check yesterday for overnight
  if ((!attendance || !attendance.checkIns.length) && employee.shift) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const shiftStart = parseShiftTime(employee.shift, yesterday);
    if (shiftStart && now < new Date(shiftStart.getTime() + 16 * 60 * 60 * 1000)) {
      attendance = await Attendance.findOne({
        employee: employee._id,
        date: { $gte: yesterday, $lte: yesterdayEnd },
      }).sort({ date: -1 });
    }
  }

  return attendance;
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

    if (!attendance) {
      attendance = new Attendance({ employee: employee._id, date: new Date(), status: "Present" });
    }

    attendance.checkIns.push(new Date());
    attendance.status = "Present";
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

    const attendance = await getActiveAttendance(employee);
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

    const attendance = await getActiveAttendance(employee);
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

    const attendance = await getActiveAttendance(employee);
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

    let attendances = await Attendance.find({
      employee: { $in: employeeIds },
      date: { $gte: start, $lte: end },
    }).populate("employee", "fullName position pincode profilePic shift");

    // ✅ Deduplicate by employee ID
    const seen = new Set();
    attendances = attendances.filter((att) => {
      if (seen.has(att.employee._id.toString())) return false;
      seen.add(att.employee._id.toString());
      return true;
    });

    res.json({ msg: "✅ All attendances today", attendances });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ✅ Get all attendances (no date filter)
export const getAllAttendances = async (req, res) => {
  try {
    await autoMarkAbsents(req.user.id);

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

// ✅ Get employee attendance (self-service, no token required)
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ msg: "Employee ID, start date and end date are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendances = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    if (!attendances.length) {
      return res.status(404).json({ msg: "No attendance found for this period" });
    }

    res.json({ msg: "✅ Attendance fetched", attendances });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ msg: "Server error fetching attendance" });
  }
};


