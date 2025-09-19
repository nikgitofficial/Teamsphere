import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  checkIns: [{ type: Date }],   // multiple check-ins
  breakOuts: [{ type: Date }],  // multiple break-outs
  breakIns: [{ type: Date }],   // multiple break-ins
  checkOuts: [{ type: Date }],  // multiple check-outs
});

export default mongoose.model("Attendance", attendanceSchema);
