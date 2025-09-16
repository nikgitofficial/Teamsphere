import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import upload from '../middleware/cloudinaryPic.js';
import { uploadProfilePic } from '../controllers/profilePicController.js';

const router = express.Router();

router.post(
  '/upload-profile-pic',
  authenticate,
  upload.single('profilePic'),
  uploadProfilePic
);

export default router;