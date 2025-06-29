import mongoose, { Schema, Document } from "mongoose";

export interface IRecommendation extends Document {
  sender: mongoose.Types.ObjectId; // User who recommends
  receiver: mongoose.Types.ObjectId; // User who receives
  property: mongoose.Types.ObjectId; // Property being recommended
  createdAt?: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
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
  {
    timestamps: true,
  }
);

const Recommendation = mongoose.model<IRecommendation>(
  "Recommendation",
  recommendationSchema
);
export default Recommendation;
