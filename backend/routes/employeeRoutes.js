import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD routes (all require authentication)
router.post("/", authenticate, createEmployee);
router.get("/", authenticate, getEmployees);
router.put("/:id", authenticate, updateEmployee);
router.delete("/:id", authenticate, deleteEmployee);

export default router;
