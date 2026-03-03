import { FastifyInstance } from "fastify";
import { followUser } from "./user.service";
import { verifyToken } from "../../middlewares/auth.middleware";

export async function userRoutes(app: FastifyInstance) {
  app.post(
    "/follow/:id",
    { preHandler: verifyToken },
    async (request, reply) => {
      const followerId = (request.user as any).id;
      const followingId = (request.params as any).id;

      const result = await followUser(followerId, followingId);

      return result;
    },
  );
}
