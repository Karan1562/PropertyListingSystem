import { Request, Response } from "express";
import User from "../models/userModel";
import Property from "../models/propertyModel";
import Recommendation from "../models/recommendationModel";
import redisClient from "../config/redis";

interface AuthRequest extends Request {
  user?: any;
}

// @desc Recommend a property to another user by their email
export const recommendProperty = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sender = req.user;
    const { email, propertyId } = req.body;

    const receiver = await User.findOne({ email });
    if (!receiver) {
      res.status(404).json({ message: "Recipient user not found" });
      return;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Prevent recommending the same property to the same user multiple times
    const alreadyRecommended = await Recommendation.findOne({
      sender: sender._id,
      receiver: receiver._id,
      property: property._id,
    });

    if (alreadyRecommended) {
      res
        .status(400)
        .json({ message: "Property already recommended to this user" });
      return;
    }

    const newRecommendation = await Recommendation.create({
      sender: sender._id,
      receiver: receiver._id,
      property: property._id,
    });

    await redisClient.del(`recommendations:receiver:${receiver._id}`);

    res.status(201).json(newRecommendation);
  } catch (err: any) {
    console.error("Error in recommendProperty:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getSentRecommendations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const senderId = req.user._id;

    const recommendations = await Recommendation.find({ sender: senderId })
      .populate("receiver", "name email")
      .populate("property");

    res.status(200).json(recommendations);
  } catch (err: any) {
    console.error("Error in getSentRecommendations:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all recommendations received by the logged-in user (cached)
export const getReceivedRecommendations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user._id;
    const cacheKey = `recommendations:receiver:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("✅ Redis cache HIT: Recommendations");
      res.status(200).json(JSON.parse(cached)); // ✅ NO return here
      return;
    }

    const recommendations = await Recommendation.find({ receiver: userId })
      .populate("sender", "name email")
      .populate("property");

    await redisClient.setEx(cacheKey, 60, JSON.stringify(recommendations));
    console.log("⚡ Redis cache SET: Recommendations");

    res.status(200).json(recommendations);
  } catch (err: any) {
    console.error("Error in getReceivedRecommendations:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Unrecommend a property (delete recommendation by sender)
export const unrecommendProperty = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user._id;
    const { recommendationId } = req.params;
    console.log(recommendationId);

    const recommendation = await Recommendation.findById(recommendationId);

    if (!recommendation) {
      res.status(404).json({ message: "Recommendation not found" });
      return;
    }

    if (recommendation.sender.toString() !== senderId.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    await Recommendation.findByIdAndDelete(recommendationId);
    await redisClient.del(
      `recommendations:receiver:${recommendation.receiver}`
    );

    res.status(200).json({ message: "Recommendation removed" });
  } catch (err: any) {
    console.error("Error in unrecommendProperty:", err.message);
    res.status(500).json({ message: err.message });
  }
};
