import express from "express";
import authRouter from "./authRouter.js";
import tableRouter from "./tableRouter.js";
import reservationRouter from "./reservationRouter.js";
import facilityRouter from "./facilityRouter.js";

const apiRouter = express.Router();

// API v1 routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/tables", tableRouter);
apiRouter.use("/reservations", reservationRouter);
apiRouter.use("/facilities", facilityRouter);

export default apiRouter;
