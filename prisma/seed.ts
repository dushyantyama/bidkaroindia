import { PrismaClient } from "@prisma/client";
import { DEFAULT_INCREMENT_CONFIG } from "../src/lib/currency";
import { CATEGORIES } from "../src/lib/categories";

const prisma = new PrismaClient();

async function main() {
  for (const category of CATEGORIES) {
    await prisma.leaderboard.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        minStartingBid: 1,
        incrementConfig: DEFAULT_INCREMENT_CONFIG,
      },
    });
  }

  // Grants admin access to the site owner's account on first Google sign-in.
  await prisma.user.upsert({
    where: { email: "yash.yamatech@gmail.com" },
    update: { isAdmin: true },
    create: {
      email: "yash.yamatech@gmail.com",
      username: "yash",
      isAdmin: true,
      isVerified: true,
    },
  });

  console.log(`Seed complete: ${CATEGORIES.length} leaderboards + admin user ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
