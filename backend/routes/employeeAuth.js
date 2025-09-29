import express from "express";
import { body } from "express-validator";
import authenticateEmployee from "../middleware/authEmployee.js";
import { loginEmployee, getEmployeeData } from "../controllers/employeeauthController.js";

const router = express.Router();

// Login route with validation
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("pincode")
      .isLength({ min: 4, max: 10 })
      .withMessage("PIN must be between 4 and 10 characters"),
  ],
  loginEmployee
);

// Get logged-in employee data
router.get("/me", authenticateEmployee, getEmployeeData);

export default router;
