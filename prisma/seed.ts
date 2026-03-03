import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // Create main user
  const mainUser = await prisma.user.create({
    data: {
      username: "creator",
      email: "creator@test.com",
      password: await bcrypt.hash("123456", 10),
    },
  });

  const users = [];

  // Create 10 dummy users
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@test.com`,
        password: await bcrypt.hash("123456", 10),
      },
    });

    users.push(user);

    // All users follow main user
    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: mainUser.id,
      },
    });
  }

  // Create 5 posts from main user
  const posts = [];
  for (let i = 1; i <= 5; i++) {
    const post = await prisma.post.create({
      data: {
        userId: mainUser.id,
        content: `Post number ${i}`,
      },
    });

    posts.push(post);
  }

  // Random likes
  for (const post of posts) {
    for (const user of users) {
      if (Math.random() > 0.5) {
        await prisma.like.create({
          data: {
            userId: user.id,
            postId: post.id,
          },
        });
      }
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
