import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    position: { type: String, required: true },
    pincode: { type: String, required: true, unique: true },
    profilePic: { type: String },
    birthdate: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    status: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Separated", "Other"],
      default: "Single",
    },
    workStatus: {
  type: String,
  enum: ["Active", "Inactive", "On Leave", "Terminated", "Probationary"],
  default: "Active",
},
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    department: { type: String },
    hireDate: { type: Date, default: Date.now },
    salary: { type: Number },
    ratePerHour: { type: Number, default: 0 },
    sss: { type: String },
    tin: { type: String },
    pagibig: { type: String },
    philhealth: { type: String },

    // ✅ Updated Deductions object
    deductions: {
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
      sss: { type: Number, default: 0 },
      tin: { type: Number, default: 0 },
      pagibig: { type: Number, default: 0 },
      philhealth: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    shift: { type: String, default: "8am-5pm" },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
