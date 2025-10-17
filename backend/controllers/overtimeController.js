import Overtime from "../models/Overtime.js";

// ✅ Apply for OT (employees only)
export const applyOvertime = async (req, res) => {
  try {
    const { date, hours, reason } = req.body;
    const employeeId = req.employeeId; // from authenticateEmployee

    if (!date || !hours || !reason)
      return res.status(400).json({ msg: "All fields required" });

    const ot = await Overtime.create({ employeeId, date, hours, reason });
    res.status(201).json(ot);
  } catch (err) {
    console.error("Apply OT error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};



// ✅ Get OT requests for logged-in employee or user
export const getMyOvertimes = async (req, res) => {
  try {
    // Support both employee login and normal user login
    const employeeId = req.employeeId || req.user?.id;
    if (!employeeId) return res.status(401).json({ msg: "Unauthorized" });

    const ots = await Overtime.find({ employeeId }).sort({ createdAt: -1 });
    res.json(ots);
  } catch (err) {
    console.error("Fetch OT error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get pending OT requests (for users to approve/reject)
export const getPendingOvertimes = async (req, res) => {
  try {
    // Fetch all OT requests NOT created by this user
    const ots = await Overtime.find({ employeeId: { $ne: req.user.id } }).sort({ createdAt: -1 });
    res.json(ots);
  } catch (err) {
    console.error("Fetch pending OT error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Update OT status (approve/reject) by user or admin
export const updateOvertimeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ msg: "Invalid status" });

    const ot = await Overtime.findById(id);
    if (!ot) return res.status(404).json({ msg: "Overtime not found" });

    // Prevent employee from approving/rejecting their own OT
    if (ot.employeeId.toString() === req.user.id) {
      return res.status(403).json({ msg: "Cannot approve/reject your own OT" });
    }

    ot.status = status;
    await ot.save();

    res.json(ot);
  } catch (err) {
    console.error("Update OT status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

