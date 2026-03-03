import { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../libs/redis";

export const rateLimiter = (limit: number, windowInSeconds: number) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;

    const key = `rate:${user.id}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowInSeconds);
    }

    if (current > limit) {
      return reply.status(429).send({ message: "Too many requests" });
    }
  };
};
