import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { env } from "./env";

function getDatabaseConnectionString() {
  const connectionUrl = new URL(env.DATABASE_URL);
  const sslMode = connectionUrl.searchParams.get("sslmode");

  if (!sslMode) {
    connectionUrl.searchParams.set("sslmode", "verify-full");
    return connectionUrl.toString();
  }

  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    connectionUrl.searchParams.set("sslmode", "verify-full");
  }

  return connectionUrl.toString();
}

const pool = new Pool({ connectionString: getDatabaseConnectionString() });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
