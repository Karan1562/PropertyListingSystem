// src/controllers/propertyController.ts
import { Request, Response } from "express";
import Property from "../models/propertyModel";
import redisClient from "../config/redis";

// @desc Create property (by logged-in user)
export const createProperty = async (req: Request, res: Response) => {
  try {
    const newProperty = await Property.create({
      ...req.body,
      createdBy: (req as any).user._id,
    });

    await redisClient.del("properties:all");
    res.status(201).json(newProperty);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all properties (with Redis caching)
// @desc Get all properties (with Redis caching)
export const getAllProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cacheKey = "properties:all";
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("✅ Redis cache HIT");
      res.status(200).json(JSON.parse(cached));
      return;
    }

    console.log("❌ Redis cache MISS");

    const properties = await Property.find();
    const result: any = await redisClient.setEx(
      cacheKey,
      300,
      JSON.stringify(properties)
    );
    console.log("Redis SET result:", result);

    res.status(200).json(properties);
  } catch (err: any) {
    console.error("Redis read/write error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get property by ID
export const getPropertyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const cacheKey = `property:${id}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.status(200).json(JSON.parse(cached));
      return;
    }

    const property = await Property.findById(id);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const result: any = await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(property)
    );
    console.log(result);
    res.status(200).json(property);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update property (only by owner)
export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const userId = (req as any).user._id;

    if (property.createdBy.toString() !== userId.toString()) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    Object.assign(property, req.body);
    await property.save();

    await redisClient.del("properties:all");
    await redisClient.del(`property:${property._id}`);

    res.status(200).json(property);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const userId = (req as any).user._id;

    if (property.createdBy.toString() !== userId.toString()) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await Property.findByIdAndDelete(req.params.id);
    await redisClient.del("properties:all");
    await redisClient.del(`property:${property._id}`);

    res.status(200).json({ message: "Property deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Advanced search
export const searchProperties = async (req: Request, res: Response) => {
  try {
    const query = { ...req.query };

    const filter: Record<string, any> = {};

    if (query.city) filter.city = query.city;
    if (query.state) filter.state = query.state;
    if (query.type) filter.type = query.type;
    if (query.price) filter.price = { $lte: Number(query.price) };
    if (query.bedrooms) filter.bedrooms = Number(query.bedrooms);
    if (query.bathrooms) filter.bathrooms = Number(query.bathrooms);
    if (query.areaSqFt) filter.areaSqFt = { $gte: Number(query.areaSqFt) };
    if (query.furnished) filter.furnished = query.furnished === "true";
    if (query.isVerified) filter.isVerified = query.isVerified === "true";
    if (query.listingType) filter.listingType = query.listingType;

    const results = await Property.find(filter);
    res.status(200).json(results);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
