import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties,
} from "../controllers/propertyController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Create a new property (only for logged-in users)
router.post("/", protect, createProperty);

// Get all properties
router.get("/", getAllProperties);

// Search properties via query params
router.get("/search", searchProperties);

// Get single property by ID
router.get("/:id", getPropertyById);

// Update a property (only by owner)
router.put("/:id", protect, updateProperty);

// Delete a property (only by owner)
router.delete("/:id", protect, deleteProperty);

export default router;
