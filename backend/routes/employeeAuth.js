import express from "express";
import {
  employeeLogin,
  getEmployeeData,
} from "../controllers/employeeauthController.js";

const router = express.Router();

// Login
router.post("/login", employeeLogin);

// ✅ Fetch employee by ID
router.get("/me/:id", getEmployeeData);

export default router;
