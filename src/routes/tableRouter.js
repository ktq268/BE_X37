import express from "express";

import { checkAvailableTables } from "../controllers/tableController.js";

const tableRouter = express.Router();

tableRouter.post("/check", checkAvailableTables);

export default tableRouter;
