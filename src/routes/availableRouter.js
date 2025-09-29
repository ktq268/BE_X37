import express from "express";
import { getAvailableTables } from "../controllers/availabilityController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { availableQuerySchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/", validate(availableQuerySchema, "body"), getAvailableTables);

export default router;
