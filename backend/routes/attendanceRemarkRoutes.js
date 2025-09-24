import express from "express";
import multer from "multer";
import {
  createRemark,
  getRemarks,
  getRemarksByEmployee,
  updateRemark,
  deleteRemark
} from "../controllers/attendanceRemarkController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // memory storage for Vercel Blob

router.post("/", authenticate, upload.single("file"), createRemark);
router.put("/:id", authenticate, upload.single("file"), updateRemark);

router.get("/", authenticate, getRemarks);
router.get("/employee/:employeeId", authenticate, getRemarksByEmployee);
router.delete("/:id", authenticate, deleteRemark);

export default router;
