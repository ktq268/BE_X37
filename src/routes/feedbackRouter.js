import express from "express";
import {
  createFeedback,
  getFeedbacks,
  updateFeedback,
  deleteFeedback,
  feedbackStats,
} from "../controllers/feedbackController.js";
import { auth } from "../middlewares/authMiddleware.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", auth, createFeedback);
feedbackRouter.get("/", getFeedbacks);
feedbackRouter.put("/:id", updateFeedback);
feedbackRouter.delete("/:id", deleteFeedback);
feedbackRouter.get("/stats/report", feedbackStats);

export default feedbackRouter;