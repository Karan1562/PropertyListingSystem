import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  logoutUser,
  refreshAccessToken,
  searchUsers,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { isSelfOrAdmin } from "../middleware/roleMiddleware";

const router = express.Router();
router.post("/register", registerUser);

router.post("/login", loginUser);
router.get("/", protect, getAllUsers);
router.post("/logout", protect, logoutUser);
router.post("/refresh", refreshAccessToken);
router.get("/search", protect, searchUsers);

router.get("/:id", protect, getUserById);

router.put("/:id", protect, updateUser);

router.delete("/:id", protect, isSelfOrAdmin, deleteUser);

export default router;
