import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../../libs/prisma";

export const registerUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const hashed = await bcrypt.hash(password, 10);

  try {
    return await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const field = (err.meta?.target as string[])?.[0] ?? "field";
      throw {
        statusCode: 409,
        message: `A user with that ${field} already exists.`,
      };
    }
    throw err;
  }
};

export const validateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return user;
};
