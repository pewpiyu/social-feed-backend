import { FastifyInstance } from "fastify";
import { verifyToken } from "../../middlewares/auth.middleware";
import { createPost } from "./post.service";
import { feedQueue } from "../../queues/feed.queues";
import { likePost, unlikePost } from "./like.service";

export async function postRoutes(app: FastifyInstance) {
  app.post("/create", { preHandler: verifyToken }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { content } = request.body as any;

    const post = await createPost(userId, content);

    await feedQueue.add("fanout", {
      postId: post.id,
      userId,
    });

    return post;
  });
  app.post(
    "/like/:postId",
    { preHandler: verifyToken },
    async (request, reply) => {
      const userId = (request.user as any).id;
      const postId = (request.params as any).postId;

      return likePost(userId, postId);
    },
  );
  app.post(
    "/unlike/:postId",
    { preHandler: verifyToken },
    async (request, reply) => {
      const userId = (request.user as any).id;
      const postId = (request.params as any).postId;

      return unlikePost(userId, postId);
    },
  );
}
