// src/routes/favoriteRoutes.ts
import express from "express";
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from "../controllers/favoriteController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// @route POST /api/favorites/:propertyId
router.post("/:propertyId", protect, addFavorite);

// @route GET /api/favorites
router.get("/", protect, getUserFavorites);

// @route DELETE /api/favorites/:propertyId
router.delete("/:propertyId", protect, removeFavorite);

export default router;
