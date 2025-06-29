import express from "express";
import {
  recommendProperty,
  getReceivedRecommendations,
  unrecommendProperty,
  getSentRecommendations,
} from "../controllers/recommendationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Recommend a property to another user via email
router.post("/", protect, recommendProperty);

// View all recommendations received by logged-in user
router.get("/", protect, getReceivedRecommendations);
router.get("/sent", protect, getSentRecommendations);

// Unrecommend (remove) a property previously recommended
router.post("/:recommendationId", protect, unrecommendProperty);

export default router;
