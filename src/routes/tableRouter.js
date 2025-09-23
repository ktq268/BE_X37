import express from "express";
import { checkAvailableTables } from "../controllers/table.Controller.js";

const router = express.Router();

router.post("/check", checkAvailableTables);

export default router;
