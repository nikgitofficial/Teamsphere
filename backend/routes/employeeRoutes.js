import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  uploadEmployeePic,
  getEmployeeCount,
} from "../controllers/employeeController.js";
import authenticate from "../middleware/authMiddleware.js";
import upload from "../middleware/cloudinaryEmployeePic.js";

const router = express.Router();

// CRUD routes (all require authentication)
router.post("/", authenticate, createEmployee);
router.get("/", authenticate, getEmployees);
router.put("/:id", authenticate, updateEmployee);
router.delete("/:id", authenticate, deleteEmployee);

// ✅ Upload employee profile picture
router.post(
  "/:id/upload-pic",
  authenticate,
  upload.single("profilePic"),
  uploadEmployeePic
);

//home dashboard count employee
router.get("/count", authenticate, getEmployeeCount);

export default router;
