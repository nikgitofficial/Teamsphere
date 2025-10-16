import express from "express";
import { addSubscriber, getSubscribers } from "../controllers/subscriptionController.js";

const router = express.Router();

// Public subscribe endpoint
router.post("/", addSubscriber);

//  Admin fetch all subscribers
router.get("/", getSubscribers);

export default router;