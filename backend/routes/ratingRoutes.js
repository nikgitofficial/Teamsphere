import express from "express";
import { submitRating, getAverageRating ,getRatings} from "../controllers/ratingController.js";

const router = express.Router();

// POST /api/rate
router.post("/rate", submitRating);

// GET /api/rate
router.get("/rate", getAverageRating);

//  get all ratings
router.get("/ratings", getRatings);

export default router;