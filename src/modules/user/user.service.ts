import { prisma } from "../../libs/prisma";

export const followUser = async (followerId: string, followingId: string) => {
  return prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
  });
};
