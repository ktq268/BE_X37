import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
   forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { auth } from "../middlewares/authMiddleware.js";

const authRouter = Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", auth, getCurrentUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;
