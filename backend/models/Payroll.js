import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalHours: { type: Number, default: 0 },
  totalDays: { type: Number, default: 0 },
  ratePerHour: { type: Number, default: 0 },
  grossPay: { type: Number, default: 0 },

  // ✅ Deductions breakdown
  deductions: {
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    sss: { type: Number, default: 0 },
    philhealth: { type: Number, default: 0 },
    pagibig: { type: Number, default: 0 },
    tin: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },

  netPay: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payroll", payrollSchema);
