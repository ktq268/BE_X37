import express from "express";
import { auth, requireRoles } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  orderCreateFromCartSchema,
  staffOrderListQuerySchema,
  staffOrderStatusUpdateSchema,
} from "../validators/schemas.js";
import {
  createOrderFromCart,
  listMyOrders,
  getOrderDetail,
  staffListOrders,
  staffGetOrderDetail,
  staffUpdateOrderStatus,
  createOrderFeedback,
} from "../controllers/orderController.js";

const router = express.Router();

router.post(
  "/from-cart",
  auth,
  validate(orderCreateFromCartSchema, "body"),
  createOrderFromCart
);
router.get("/mine", auth, listMyOrders);
router.get("/:id", auth, getOrderDetail);
router.post("/:id/feedback", auth, createOrderFeedback);

// Staff endpoints
router.get(
  "/",
  auth,
  requireRoles("staff", "admin"),
  // validate(staffOrderListQuerySchema, "query"),
  staffListOrders
);
router.get(
  "/:id/detail",
  auth,
  requireRoles("staff", "admin"),
  staffGetOrderDetail
);
router.put(
  "/:id/status",
  auth,
  requireRoles("staff", "admin"),
  // validate(staffOrderStatusUpdateSchema, "body"),
  staffUpdateOrderStatus
);

export default router;
