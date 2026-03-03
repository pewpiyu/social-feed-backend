import { Queue } from "bullmq";
import { redis } from "../libs/redis";

export const feedQueue = new Queue("feedQueue", {
  connection: redis,
});
