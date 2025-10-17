import express from "express";
import {
  applyOvertime,
  getMyOvertimes,
  getPendingOvertimes,
  updateOvertimeStatus,
} from "../controllers/overtimeController.js";
import authenticateEmployee from "../middleware/authEmployee.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee creates OT
router.post("/apply", authenticateEmployee, applyOvertime);


// Employee or user fetches their own OT
router.get("/my", authenticateEmployee, getMyOvertimes);

// User fetches pending OT requests submitted by employees
router.get("/pending", authenticate, getPendingOvertimes);

// Update OT status (approve/reject) by user/admin
router.put("/:id/status", authenticate, updateOvertimeStatus);

export default router;
