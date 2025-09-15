import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  position: { type: String, required: true },
  pincode: { type: String, required: true, unique: true }, // unique for attendance
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to creator
});

export default mongoose.model("Employee", employeeSchema);
