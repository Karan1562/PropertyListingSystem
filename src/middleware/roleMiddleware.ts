import { Response, NextFunction } from "express";
import { UserRole } from "../models/userModel";
import { AuthRequest } from "./authMiddleware"; // Make sure this interface exists

// ✅ Only Admin
export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({ message: "Access denied: Admins only" });
    return;
  }
  return next();
};

// ✅ Only user themselves or Admin
export const isSelfOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.id;
  if (req.user?._id !== userId && req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({ message: "Access denied" });
    return;
  }
  return next();
};
