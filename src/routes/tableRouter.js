import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { tableCreateSchema, tableUpdateSchema } from "../validators/schemas.js";
import {
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";

const router = express.Router();

// Staff flow
router.post("/", auth, validate(tableCreateSchema, "body"), createTable);
router.put("/:id", auth, validate(tableUpdateSchema, "body"), updateTable);
router.delete("/:id", auth, deleteTable);

export default router;
