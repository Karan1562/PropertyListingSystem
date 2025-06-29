import mongoose, { Document, Schema } from "mongoose";

// Interface
export interface IProperty extends Document {
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: boolean;
  availableFrom: Date;
  listedBy: string;
  tags: string[];
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
  createdBy: mongoose.Types.ObjectId; // for tracking owner
}

// Schema
const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    areaSqFt: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    amenities: [{ type: String }],
    furnished: { type: Boolean, required: true },
    availableFrom: { type: Date, required: true },
    listedBy: { type: String, required: true },
    tags: [{ type: String }],
    colorTheme: { type: String },
    rating: { type: Number },
    isVerified: { type: Boolean, default: false },
    listingType: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model<IProperty>("Property", propertySchema);
export default Property;
