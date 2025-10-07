import express from "express";
import { createBooking } from "../controllers/bookingController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { bookingCreateSchema } from "../validators/schemas.js";

const router = express.Router();

// Customer flow
router.post("/", validate(bookingCreateSchema, "body"), createBooking);

export default router;
