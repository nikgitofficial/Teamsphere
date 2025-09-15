import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  checkIn: { type: Date },
  breakOut: { type: Date },
  breakIn: { type: Date },
  checkOut: { type: Date },
});

export default mongoose.model("Attendance", attendanceSchema);
