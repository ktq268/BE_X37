import express from "express";
import {
  getRevenueReport,
  getTopMenuItems,
  getFeedbackReport,
} from "../controllers/reportController.js";
import { getDashboardMetrics } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/revenue", getRevenueReport);
reportRouter.get("/top-menu", getTopMenuItems);
reportRouter.get("/feedback", getFeedbackReport);
reportRouter.get("/metrics", getDashboardMetrics);

export default reportRouter;