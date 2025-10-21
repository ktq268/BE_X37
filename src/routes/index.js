import express from "express";
import authRouter from "./authRouter.js";
import restaurantRouter from "./restaurantRouter.js";
import tableRouter from "./tableRouter.js";
import bookingRouter from "./bookingRouter.js";
import tableBlockRouter from "./tableBlockRouter.js";
import availableRouter from "./availableRouter.js";
import menuRouter from "./menuRouter.js";
import uploadImage from "./uploadImageRouter.js";
import feedbackRouter from "./feedbackRouter.js";
import reportRouter from "./reportRouter.js";

const apiRouter = express.Router();

// API v1 routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/restaurants", restaurantRouter);
apiRouter.use("/tables", tableRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/table-blocks", tableBlockRouter);
apiRouter.use("/available-tables", availableRouter);
apiRouter.use("/menu", menuRouter);
apiRouter.use("/upload-image", uploadImage);
apiRouter.use("/feedback", feedbackRouter);
apiRouter.use("/reports", reportRouter);
export default apiRouter;
