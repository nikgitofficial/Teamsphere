import express from "express";
import authenticate from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";
import {
  getAllUsers,
  promoteUser,
  getAllRatings,
  deleteRating,
  getTotalEmployees,
  getAllEmployees,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authenticate, requireAdmin);

// User routes
router.get("/users", getAllUsers);
router.patch("/promote/:id", promoteUser);

// Rating routes
router.get("/ratings", getAllRatings);
router.delete("/ratings/:id", deleteRating);

// Employee count route
router.get("/employees/count", getTotalEmployees);


// Add after employee count route
router.get("/employees", getAllEmployees);

export default router;
