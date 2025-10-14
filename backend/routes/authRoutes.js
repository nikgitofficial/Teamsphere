  import express from "express";
  import {
    register,
    login,
    refresh,
    me,
    logout,
    updateUsername,
  } from "../controllers/authController.js";
  import  authenticate  from "../middleware/authMiddleware.js";
  import {sendOTP,verifyOTPAndResetPassword,} from "../controllers/forgotPasswordController.js";


  const router = express.Router();


  // ✅ Auth routes
  router.post("/register", register);
  router.post("/login", login);
  router.get("/refresh", refresh);
  router.get("/me", authenticate, me);
  router.post("/logout", logout);
  router.patch("/update-username", authenticate, updateUsername);

    // ✅ Password reset routes otp
  router.post("/forgot-password", sendOTP);
  router.post("/reset-password", verifyOTPAndResetPassword);


  export default router;