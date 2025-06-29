// src/models/favoriteModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can favorite a property only once
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
export default Favorite;
