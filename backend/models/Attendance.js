// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  checkIns: [{ type: Date }],
  breakOuts: [{ type: Date }],
  breakIns: [{ type: Date }],
  checkOuts: [{ type: Date }],
  status: { type: String, enum: ["present", "absent"], default: "present" },
});

export default mongoose.model("Attendance", attendanceSchema);
