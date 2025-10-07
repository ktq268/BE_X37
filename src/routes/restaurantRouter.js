import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  restaurantCreateSchema,
  restaurantUpdateSchema,
} from "../validators/schemas.js";
import {
  listByRegion,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurantController.js";

const router = express.Router();

// Customer flow
router.get("/", listByRegion); // GET /restaurants?region=north

// Staff flow
router.post(
  "/",
  auth,
  validate(restaurantCreateSchema, "body"),
  createRestaurant
);
router.put(
  "/:id",
  auth,
  validate(restaurantUpdateSchema, "body"),
  updateRestaurant
);
router.delete("/:id", auth, deleteRestaurant);

export default router;
