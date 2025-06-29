// src/controllers/favoriteController.ts
import { Request, Response } from "express";
import Favorite from "../models/favoriteModel";
import Property from "../models/propertyModel";
import mongoose from "mongoose";

// Add to favorites
export const addFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const propertyId = req.params.propertyId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      res.status(400).json({ message: "Invalid property ID" });
      return;
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Check if already favorited
    const alreadyExists = await Favorite.findOne({
      user: userId,
      property: propertyId,
    });
    if (alreadyExists) {
      res.status(400).json({ message: "Already favorited" });
      return;
    }

    const favorite = await Favorite.create({
      user: userId,
      property: propertyId,
    });
    res.status(201).json(favorite);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's favorites
export const getUserFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const favorites = await Favorite.find({ user: userId }).populate(
      "property"
    );
    res.status(200).json(favorites);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from favorites
export const removeFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const propertyId = req.params.propertyId;

    const deleted = await Favorite.findOneAndDelete({
      user: userId,
      property: propertyId,
    });

    if (!deleted) {
      res.status(404).json({ message: "Favorite not found" });
      return;
    }

    res.status(200).json({ message: "Removed from favorites" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
