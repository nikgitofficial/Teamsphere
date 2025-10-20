import Overtime from "../models/Overtime.js";
import User from "../models/User.js"; // ✅ Added for populate use

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
    const employeeId = req.employeeId || req.user?.id;
    if (!employeeId) return res.status(401).json({ msg: "Unauthorized" });

    const ots = await Overtime.find({ employeeId })
      .populate("employeeId", "fullName department")
      .sort({ createdAt: -1 });

    // ✅ Integrate actionBy (username + role)
    const formatted = ots.map((ot) => ({
      ...ot.toObject(),
      actionBy: ot.actionBy
        ? {
            username: ot.actionBy.username || null,
            role: ot.actionBy.role || null,
          }
        : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch OT error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get pending OT requests (for users to approve/reject)
export const getPendingOvertimes = async (req, res) => {
  try {
    const ots = await Overtime.find({ employeeId: { $ne: req.user.id } })
      .populate("employeeId", "fullName department")
      .sort({ createdAt: -1 });

    // ✅ Same logic for actionBy
    const formatted = ots.map((ot) => ({
      ...ot.toObject(),
      actionBy: ot.actionBy
        ? {
            username: ot.actionBy.username || null,
            role: ot.actionBy.role || null,
          }
        : null,
    }));

    res.json(formatted);
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

    if (ot.employeeId.toString() === req.user.id) {
      return res.status(403).json({ msg: "Cannot approve/reject your own OT" });
    }

    ot.status = status;

    // ✅ Fetch user info (including profilePic)
    const user = await User.findById(req.user.id).select("username role profilePic");

    // ✅ Save full action info
    ot.actionBy = {
      userId: user._id,
      username: user.username,
      role: user.role,
      profilePic: user.profilePic,
    };

    ot.actionDate = new Date();

    await ot.save();

    res.json({
      ...ot.toObject(),
      actionBy: {
        username: user.username,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Update OT status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
