import { FastifyInstance } from "fastify";
import { verifyToken } from "../../middlewares/auth.middleware";
import { getFeed, getTrendingPosts } from "./feed.service";

export async function feedRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: verifyToken }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { cursor } = request.query as any;

    const feed = await getFeed(userId, cursor);

    return feed;
  });
  app.get("/trending", async (request, reply) => {
    return getTrendingPosts();
  });
}
