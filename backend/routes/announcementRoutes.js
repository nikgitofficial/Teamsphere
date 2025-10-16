import express from "express";
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "../controllers/announcementController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.post("/", authenticate, createAnnouncement);
router.delete("/:id", authenticate, deleteAnnouncement);

export default router;
