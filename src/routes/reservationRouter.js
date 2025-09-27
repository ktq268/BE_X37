import express from "express";
import {
  createReservation,
  getReservations,
} from "../controllers/reservationController.js";
import { validateReservation } from "../middlewares/ReservationMiddleware.js";

const router = express.Router();

router.post("/", validateReservation, createReservation);
router.get("/", getReservations);

export default router;
