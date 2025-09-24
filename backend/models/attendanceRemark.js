import mongoose from "mongoose";

const attendanceRemarkSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ["Absent", "Late", "Undertime", "Overbreak", "Other"],
    required: true,
  },
  reason: { type: String, required: true },
  remarks: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },

  // New file attachment
  file: {
    filename: String,
    url: String,
    originalname: String,
    mimetype: String,
    size: Number,
  },
});

export default mongoose.model("AttendanceRemark", attendanceRemarkSchema);
