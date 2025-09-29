import express from "express";
import { generatePayroll, generatePayslip, updateTotalHours } from "../controllers/payrollController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authenticate, generatePayroll);
router.post("/payslip", authenticate, generatePayslip);
router.patch("/update-hours/:payrollId", authenticate, updateTotalHours);

export default router;
