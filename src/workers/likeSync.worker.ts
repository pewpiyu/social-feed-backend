import { redis } from "../libs/redis";
import { prisma } from "../libs/prisma";

const syncLikes = async () => {
  const keys = await redis.keys("likes:*");

  for (const key of keys) {
    const postId = key.split(":")[1];
    const count = await redis.get(key);

    if (!count) continue;

    await prisma.post.update({
      where: { id: postId },
      data: {},
    });

    // Optional: store count in separate column if you add one
  }
};

// Run every 60 seconds
setInterval(syncLikes, 60000);
