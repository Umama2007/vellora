const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Find corrupted posts
  const corruptedPosts = await prisma.post.findMany({
    where: {
      published: false,
      publishedAt: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      published: true,
      publishedAt: true,
      author: {
        select: {
          username: true
        }
      }
    },
  });

  console.log(`Found ${corruptedPosts.length} corrupted posts to fix:`);
  console.log(JSON.stringify(corruptedPosts, null, 2));

  if (corruptedPosts.length > 0) {
    const result = await prisma.post.updateMany({
      where: {
        published: false,
        publishedAt: {
          not: null,
        },
      },
      data: {
        published: true,
      },
    });
    console.log(`Successfully fixed ${result.count} posts.`);
  } else {
    console.log("No posts needed fixing.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
