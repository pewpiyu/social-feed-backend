import { prisma } from "../../libs/prisma";
import { redis } from "../../libs/redis";

export const likePost = async (userId: string, postId: string) => {
  const userLikeKey = `userLikes:${userId}`;

  // Check in Redis set first
  const alreadyLiked = await redis.sismember(userLikeKey, postId);

  if (alreadyLiked) {
    return { message: "Already liked" };
  }

  // Persist to DB
  await prisma.like.create({
    data: { userId, postId },
  });

  // Add to Redis set
  await redis.sadd(userLikeKey, postId);

  // Increment like counter
  await redis.incr(`likes:${postId}`);

  // Add to trending
  await redis.zincrby("trending", 1, postId);

  return { message: "Post liked" };
};
export const unlikePost = async (userId: string, postId: string) => {
  const userLikeKey = `userLikes:${userId}`;

  const alreadyLiked = await redis.sismember(userLikeKey, postId);

  if (!alreadyLiked) {
    return { message: "Not liked yet" };
  }

  await prisma.like.delete({
    where: {
      userId_postId: { userId, postId },
    },
  });

  await redis.srem(userLikeKey, postId);

  await redis.decr(`likes:${postId}`);

  await redis.zincrby("trending", -1, postId);

  return { message: "Post unliked" };
};

export const getLikeCount = async (postId: string) => {
  const key = `likes:${postId}`;

  const cached = await redis.get(key);

  if (cached) {
    return Number(cached);
  }

  // fallback to DB
  const count = await prisma.like.count({
    where: { postId },
  });

  await redis.set(key, count);

  return count;
};
