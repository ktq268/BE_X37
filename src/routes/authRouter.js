import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import { auth } from "../middlewares/authMiddleware.js";

const authRouter = Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", auth, getCurrentUser);

export default authRouter;
