// backend/src/config/prisma.ts
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// prevent hot re-instantiation in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const base = new PrismaClient({
    // log: ['query', 'error', 'warn'] // enable if needed
  });
  try {
    const useAccelerate =
      (process.env.DATABASE_URL || "").startsWith("prisma://") ||
      Boolean(process.env.PRISMA_ACCELERATE_URL);
    return useAccelerate ? (base.$extends(withAccelerate()) as any) : (base as any);
  } catch {
    return base as any;
  }
}

const prisma = (globalForPrisma.prisma as any) ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
