import { FastifyReply, FastifyRequest } from "fastify";
import { registerUser, validateUser } from "./auth.service";

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  const { username, email, password } = (req.body as any) ?? {};

  if (!username || !email || !password)
    return reply
      .status(400)
      .send({ message: "username, email and password are required" });

  try {
    const user = await registerUser(username, email, password);
    reply.status(201).send(user);
  } catch (err: any) {
    reply.status(err.statusCode ?? 500).send({ message: err.message });
  }
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = (req.body as any) ?? {};

  if (!email || !password)
    return reply
      .status(400)
      .send({ message: "email and password are required" });

  const user = await validateUser(email, password);

  if (!user) return reply.status(401).send({ message: "Invalid credentials" });

  const token = req.server.jwt.sign({
    id: user.id,
    email: user.email,
  });

  reply.send({ token });
};
