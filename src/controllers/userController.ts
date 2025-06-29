import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import redisClient from "../config/redis";
import jwt, { JwtPayload } from "jsonwebtoken";

// @desc Register new user
// @route POST /api/users/register

interface AuthRequest extends Request {
  user?: any;
}
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phoneNumber, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = new User({
      name,
      email,
      password, // ❌ Don't hash manually
      phoneNumber,
      role: role || "user",
    });

    await user.save();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    await redisClient.del("users:all"); // Invalidate cache

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};

// @desc Login user
// @route POST /api/users/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Not Matched");
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all users
// @route GET /api/users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cacheKey = "users:all";

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("✅ Redis: users cache hit");
      res.status(200).json(JSON.parse(cached));
      return;
    }

    const users = await User.find().select("-password -refreshToken");
    await redisClient.setEx(cacheKey, 60, JSON.stringify(users));

    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get user by ID
// @route GET /api/users/:id
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const cacheKey = `users:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("✅ Redis: user cache hit");
      res.status(200).json(JSON.parse(cached));
      return;
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const result: any = await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(user)
    );
    console.log(result);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update user
// @route PUT /api/users/:id
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    }).select("-password -refreshToken");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await redisClient.del("users:all");
    await redisClient.del(`users:${userId}`);

    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete user
// @route DELETE /api/users/:id
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await redisClient.del("users:all");
    await redisClient.del(`users:${userId}`);

    res.status(200).json({ message: "User deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const logoutUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user; // Already fetched in middleware

    if (!user) {
      res.status(404).json({ message: "User not found or already logged out" });
      return;
    }

    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({ message: "Successfully logged out" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token missing" });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({ message: "Invalid or expired refresh token" });
      return;
    }

    const newAccessToken = user.generateAccessToken();
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err: any) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// @desc Search users by attributes
// @route GET /api/users/search?name=John&email=john@example.com
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, role, phoneNumber } = req.query;

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive
    }

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    if (role) {
      filter.role = role;
    }

    if (phoneNumber) {
      filter.phoneNumber = phoneNumber;
    }

    const users = await User.find(filter).select("-password -refreshToken");

    res.status(200).json(users);
  } catch (err: any) {
    console.error("Error in searchUsers:", err.message);
    res.status(500).json({ message: err.message });
  }
};
