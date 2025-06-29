import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.REDIS_URL);
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis error", err));
redisClient.on("connect", () => console.log("Redis connected to Upstash"));

redisClient.connect();
(async () => {
  try {
    await redisClient.setEx("foo", 300, "bar"); // 5 minutes expiry
    const value = await redisClient.get("foo");
    console.log("📦 Test Redis key 'foo' =", value);
  } catch (err: any) {
    console.error("❌ Redis test failed:", err.message);
  }
})();

export default redisClient;
