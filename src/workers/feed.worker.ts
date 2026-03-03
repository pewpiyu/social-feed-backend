import { Worker } from "bullmq";
import { redis } from "../libs/redis";
import { fanoutPostToFollowers } from "../modules/post/post.service";

export const feedWorker = new Worker(
  "feedQueue",
  async (job) => {
    const { postId, userId } = job.data;

    await fanoutPostToFollowers(postId, userId);
  },
  { connection: redis },
);
