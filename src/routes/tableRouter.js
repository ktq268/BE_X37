import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { tableCreateSchema, tableUpdateSchema, tableStatusUpdateSchema } from "../validators/schemas.js";
import {
  createTable,
  updateTable,
  deleteTable,
  listTablesWithStatus,
  updateTableStatus,
} from "../controllers/tableController.js";

const router = express.Router();

// Staff flow
router.post("/", auth, validate(tableCreateSchema, "body"), createTable);
router.put("/:id", auth, validate(tableUpdateSchema, "body"), updateTable);
router.delete("/:id", auth, deleteTable);

// Public/Staff: list tables with computed status
router.get("/", listTablesWithStatus);

// Staff: update table status
router.patch("/:id/status", auth, validate(tableStatusUpdateSchema, "body"), updateTableStatus);

export default router;
