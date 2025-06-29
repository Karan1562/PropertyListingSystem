import { createClient } from "redis";

const redisClient = createClient(); // default: localhost:6379

redisClient.on("error", (err) => console.error("❌ Redis error", err));
redisClient.on("connect", () => console.log("✅ Redis connected"));

redisClient.connect();

export default redisClient;
