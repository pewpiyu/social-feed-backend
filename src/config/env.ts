import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || "3000",
  db: process.env.DATABASE_URL!,
  jwt: process.env.JWT_SECRET!,
  redis: process.env.REDIS_URL || "redis://localhost:6379",
};
