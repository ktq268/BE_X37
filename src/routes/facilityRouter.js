import { Router } from "express";
import {
  createFacility,
  getFacilitiesByRegion,
  getFacilityById,
  updateFacility,
  deleteFacility,
  searchFacilities,
} from "../controllers/facilityController.js";
import { auth } from "../middlewares/authMiddleware.js";

const facilityRouter = Router();

// Public routes
facilityRouter.get("/", getFacilitiesByRegion);
facilityRouter.get("/search", searchFacilities);
facilityRouter.get("/:id", getFacilityById);

// Protected routes (require authentication)
facilityRouter.post("/", auth, createFacility);
facilityRouter.put("/:id", auth, updateFacility);
facilityRouter.delete("/:id", auth, deleteFacility);

export default facilityRouter;
