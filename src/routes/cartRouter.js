import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  cartAddItemSchema,
  cartUpdateItemSchema,
} from "../validators/schemas.js";
import {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", auth, getMyCart);
router.post("/items", auth, validate(cartAddItemSchema, "body"), addItemToCart);
router.put(
  "/items/:itemId",
  auth,
  validate(cartUpdateItemSchema, "body"),
  updateCartItem
);
router.delete("/items/:itemId", auth, removeCartItem);
router.delete("/clear", auth, clearCart);

export default router;
