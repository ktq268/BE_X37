import express from "express";
import { createBooking, listBookingsByTable, updateBookingStatus, getPendingBookings } from "../controllers/bookingController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { bookingCreateSchema, bookingStatusUpdateSchema } from "../validators/schemas.js";
import { auth } from "../middlewares/authMiddleware.js";
import { staffAuth } from "../middlewares/staffAuthMiddleware.js";

const router = express.Router();

// Customer flow
router.post("/", validate(bookingCreateSchema, "body"), createBooking);

// Orders per table
router.get("/table/:tableId", listBookingsByTable);

// Staff: get all pending bookings
router.get("/pending", staffAuth, getPendingBookings);

// Staff: update booking status
router.patch("/:id/status", auth, validate(bookingStatusUpdateSchema, "body"), updateBookingStatus);

export default router;
