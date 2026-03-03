import { prisma } from "../../libs/prisma";
import { redis } from "../../libs/redis";

export const getFeed = async (userId: string, cursor?: string, limit = 10) => {
  const cacheKey = `feed:${userId}`;

  // Only cache first page
  if (!cursor) {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Serving from cache");
      return JSON.parse(cached);
    }
  }

  const feed = await prisma.feed.findMany({
    where: {
      userId,
      createdAt: cursor ? { lt: new Date(cursor) } : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { post: true },
  });

  // Cache only first page
  if (!cursor) {
    await redis.set(cacheKey, JSON.stringify(feed), "EX", 60);
  }

  const enriched = await Promise.all(
    feed.map(async (item) => {
      const likeCount = await redis.get(`likes:${item.postId}`);
      return {
        ...item,
        likeCount: likeCount ? Number(likeCount) : 0,
      };
    }),
  );

  return enriched;
};
export const getTrendingPosts = async (limit = 10) => {
  const postIds = await redis.zrevrange("trending", 0, limit - 1);

  if (!postIds.length) return [];

  return prisma.post.findMany({
    where: { id: { in: postIds } },
  });
};
