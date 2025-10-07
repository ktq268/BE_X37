import express from "express";
import authRouter from "./authRouter.js";
import restaurantRouter from "./restaurantRouter.js";
import tableRouter from "./tableRouter.js";
import bookingRouter from "./bookingRouter.js";
import tableBlockRouter from "./tableBlockRouter.js";
import availableRouter from "./availableRouter.js";
import menuRouter from "./menuRouter.js";

const apiRouter = express.Router();

// API v1 routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/restaurants", restaurantRouter);
apiRouter.use("/tables", tableRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/table-blocks", tableBlockRouter);
apiRouter.use("/available-tables", availableRouter);
apiRouter.use("/menu", menuRouter);

export default apiRouter;
