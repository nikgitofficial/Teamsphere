import express from "express";
import {
  generatePayroll,
  generatePayslip,
  updateTotalHours,
  getEmployeePayslip,
  generateEmployeePayslip,
} from "../controllers/payrollController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin routes (require token)
router.post("/generate", authenticate, generatePayroll);
router.post("/payslip", authenticate, generatePayslip);
router.patch("/update-hours/:payrollId", authenticate, updateTotalHours);

// ✅ Employee routes (self-service, no token required)
router.get("/me/:id", getEmployeePayslip);
router.post("/payslip/employee", generateEmployeePayslip);

export default router;
