import express from "express";
import {
  createFeedback,
  getFeedbacks,
  updateFeedback,
  deleteFeedback,
  feedbackStats,
} from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", createFeedback);
feedbackRouter.get("/", getFeedbacks);
feedbackRouter.put("/:id", updateFeedback);
feedbackRouter.delete("/:id", deleteFeedback);
feedbackRouter.get("/stats/report", feedbackStats);

export default feedbackRouter;