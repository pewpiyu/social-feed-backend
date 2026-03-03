import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { env } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { verifyToken } from "./middlewares/auth.middleware";
import { rateLimiter } from "./middlewares/rateLimiter.middleware";
import { userRoutes } from "./modules/user/user.routes";
import { postRoutes } from "./modules/post/post.routes";
import { feedRoutes } from "./modules/feed/feed.routes";

const app = Fastify({ logger: true });

app.register(jwt, {
  secret: env.jwt,
});

app.register(authRoutes, { prefix: "/auth" });
app.register(userRoutes, { prefix: "/user" });
app.register(postRoutes, { prefix: "/post" });
app.register(feedRoutes, { prefix: "/feed" });

app.get("/health", async () => {
  return { status: "ok" };
});

app.get(
  "/protected",
  {
    preHandler: [verifyToken, rateLimiter(5, 60)],
  },
  async (request, reply) => {
    return { message: "You are authenticated" };
  },
);

// 👇 Must bind to 0.0.0.0 inside Docker, not just localhost
app.listen({ port: Number(env.port), host: "0.0.0.0" });
const start = async () => {
  try {
    await app.listen({ host: "0.0.0.0", port: Number(env.port) });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

process.on("SIGTERM", async () => {
  await app.close();
  process.exit(0);
});
