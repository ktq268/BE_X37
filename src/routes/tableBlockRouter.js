import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { tableBlockCreateSchema } from "../validators/schemas.js";
import {
  createTableBlock,
  deleteTableBlock,
} from "../controllers/tableBlockController.js";

const router = express.Router();

// Staff flow
router.post(
  "/",
  auth,
  validate(tableBlockCreateSchema, "body"),
  createTableBlock
);
router.delete("/:id", auth, deleteTableBlock);

export default router;
