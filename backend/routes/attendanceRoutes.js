import express from "express";
import {
  checkIn,
  breakOut,
  breakIn,
  checkOut,
  getTodayAttendance,
  getAllTodayAttendances,
  getAllAttendances,
  getAttendancesByDateRange,
} from "../controllers/attendanceController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkin", authenticate, checkIn);
router.post("/breakout", authenticate, breakOut);
router.post("/breakin", authenticate, breakIn);
router.post("/checkout", authenticate, checkOut);

router.get("/today/all", authenticate, getAllTodayAttendances);
router.get("/all", authenticate, getAllAttendances);
router.get("/range", authenticate, getAttendancesByDateRange);
router.get("/:pincode", authenticate, getTodayAttendance);

export default router;
