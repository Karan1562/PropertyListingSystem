import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/connectDb";
import userRoutes from "./routes/userRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import recommendRoutes from "./routes/recommendRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("API is working");
});

// If MongoDB is configured, connect first
connectDB();
app.use("/api/users", userRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recommend", recommendRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
