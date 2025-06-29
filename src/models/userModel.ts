import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms"; // ✅ for expiresIn type

// 1. Enum for roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  AGENT = "agent",
  BROKER = "broker",
}

// 2. User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  refreshToken?: string;

  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// 3. User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

// 4. Pre-save hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 5. Compare password
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 6. Access Token
UserSchema.methods.generateAccessToken = function (): string {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error("Access token env variables not found");
  }

  const payload = {
    _id: this._id,
    name: this.name,
    email: this.email,
    phoneNumber: this.phoneNumber,
    role: this.role,
  };

  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as StringValue,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
};

// 7. Refresh Token
UserSchema.methods.generateRefreshToken = function (): string {
  if (!process.env.REFRESH_TOKEN_SECRET || !process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error("Refresh token env variables not found");
  }

  const payload = {
    _id: this._id,
  };

  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as StringValue,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
};

// 8. Export model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
