import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  menuPublicListQuerySchema,
  menuDetailParamSchema,
  menuCreateSchema,
  menuUpdateSchema,
  menuFullListQuerySchema,
} from "../validators/schemas.js";
import {
  listMenu,
  getMenuItem,
  listFullMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";

const router = express.Router();

// Public
router.get("/items", validate(menuPublicListQuerySchema, "query"), listMenu);
router.get("/items/:id", getMenuItem);
router.get("/full", validate(menuFullListQuerySchema, "query"), listFullMenu);

// Admin
router.post("/items", auth, validate(menuCreateSchema, "body"), createMenuItem);
router.put(
  "/items/:id",
  auth,
  validate(menuUpdateSchema, "body"),
  updateMenuItem
);
router.delete("/items/:id", auth, deleteMenuItem);

export default router;
