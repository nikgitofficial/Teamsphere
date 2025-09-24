import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  checkIns: [{ type: Date }],
  breakOuts: [{ type: Date }],
  breakIns: [{ type: Date }],
  checkOuts: [{ type: Date }],
  status: { type: String, enum: ["Present", "Absent"], default: "Absent" } 
});

export default mongoose.model("Attendance", attendanceSchema);
