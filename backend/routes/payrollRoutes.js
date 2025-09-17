import express from "express";
import { generatePayroll } from "../controllers/payrollController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authenticate, generatePayroll);

export default router;
