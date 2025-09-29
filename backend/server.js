import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import profileRoutes from './routes/profileRoutes.js';
import payrollRoutes from "./routes/payrollRoutes.js";
import attendanceRemarkRoutes from "./routes/attendanceRemarkRoutes.js";

import employeeAuthRoutes from "./routes/employeeAuth.js";





dotenv.config();
const app = express();

// ✅ Environment variables
const PORT = process.env.PORT || 5000;

const CLIENT_URLS = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173", // local dev
  "frontend-app.vercel.app",
   "https://frontend-app.vercel.app", // deployed frontend
  
  
];

// ✅ CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CLIENT_URLS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
}));
// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/attendance-remarks", attendanceRemarkRoutes);
app.use("/api/employee-auth", employeeAuthRoutes);




// ✅ MongoDB + Server Start
mongoose.connect(process.env.MONGO_URI, {
  
}).then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});