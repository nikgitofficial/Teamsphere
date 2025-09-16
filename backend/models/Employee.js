// models/Employee.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    position: { type: String, required: true },
    pincode: { type: String, required: true, unique: true }, // unique for attendance

    profilePic: { type: String },

    // ✅ New Fields
    birthdate: { type: Date },
    age: { type: Number },
    status: { type: String, enum: ["Single", "Married", "Widowed", "Separated", "Other"], default: "Single" },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    department: { type: String },
    hireDate: { type: Date, default: Date.now },
    salary: { type: Number },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to creator
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
