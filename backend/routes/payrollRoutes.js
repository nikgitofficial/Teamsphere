import express from "express";
import { generatePayroll,generatePayslip } from "../controllers/payrollController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authenticate, generatePayroll);
router.post("/payslip", authenticate, generatePayslip);

export default router;
