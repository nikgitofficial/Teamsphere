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


  const router = express.Router();


  // ✅ Auth routes
  router.post("/register", register);
  router.post("/login", login);
  router.get("/refresh", refresh);
  router.get("/me", authenticate, me);
  router.post("/logout", logout);
  router.patch("/update-username", authenticate, updateUsername);


  export default router;