import { prisma } from "../../libs/prisma";
import { redis } from "../../libs/redis";

export const createPost = async (userId: string, content: string) => {
  const post = await prisma.post.create({
    data: {
      userId,
      content,
    },
  });

  return post;
};
export const fanoutPostToFollowers = async (postId: string, userId: string) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    select: { followerId: true },
  });

  const feedEntries = followers.map((f) => ({
    userId: f.followerId,
    postId,
  }));

  if (feedEntries.length > 0) {
    await prisma.feed.createMany({
      data: feedEntries,
      skipDuplicates: true,
    });
  }
  await Promise.all(followers.map((f) => redis.del(`feed:${f.followerId}`)));
};
