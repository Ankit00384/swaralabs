import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    const voice = await prisma.voice.findFirst({
      where: {
        variant: "SYSTEM",
        r2ObjectKey: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        r2ObjectKey: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!voice?.r2ObjectKey) {
      throw new Error("No seeded SYSTEM voice with r2ObjectKey found");
    }

    console.log(`VOICE_NAME=${voice.name}`);
    console.log(`VOICE_ID=${voice.id}`);
    console.log(`VOICE_KEY=${voice.r2ObjectKey}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
