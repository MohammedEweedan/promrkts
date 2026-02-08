// backend/src/config/prisma.ts
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// prevent hot re-instantiation in dev
const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClient;
  prismaHealth?: { isConnected: boolean; lastError: string | null; lastCheck: number };
};

// Health state for Prisma
const prismaHealth = globalForPrisma.prismaHealth ?? {
  isConnected: false,
  lastError: null as string | null,
  lastCheck: 0,
};
globalForPrisma.prismaHealth = prismaHealth;

function createClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  });

  // Add middleware for query timing and error tracking
  base.$use(async (params: any, next: (params: any) => Promise<any>) => {
    const start = Date.now();
    try {
      const result = await next(params);
      const duration = Date.now() - start;
      
      // Log slow queries (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow Prisma query: ${params.model}.${params.action} took ${duration}ms`);
      }
      
      prismaHealth.isConnected = true;
      prismaHealth.lastError = null;
      prismaHealth.lastCheck = Date.now();
      
      return result;
    } catch (error: any) {
      prismaHealth.isConnected = false;
      prismaHealth.lastError = error?.message || 'Unknown error';
      prismaHealth.lastCheck = Date.now();
      throw error;
    }
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

// Initial connection test
(async () => {
  try {
    await prisma.$connect();
    prismaHealth.isConnected = true;
    prismaHealth.lastCheck = Date.now();
    console.log('Prisma connected successfully');
  } catch (err: any) {
    prismaHealth.isConnected = false;
    prismaHealth.lastError = err?.message || 'Connection failed';
    prismaHealth.lastCheck = Date.now();
    console.error('Prisma connection error:', err);
  }
})();

// Periodic health check every 60 seconds
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    prismaHealth.isConnected = true;
    prismaHealth.lastError = null;
  } catch (err: any) {
    prismaHealth.isConnected = false;
    prismaHealth.lastError = err?.message || 'Health check failed';
    console.warn('Prisma health check failed:', err?.message);
    
    // Attempt reconnection
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      prismaHealth.isConnected = true;
      prismaHealth.lastError = null;
      console.log('Prisma reconnected successfully');
    } catch (reconnectErr: any) {
      console.error('Prisma reconnection failed:', reconnectErr?.message);
    }
  }
  prismaHealth.lastCheck = Date.now();
}, 60000);

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Export health check function
export const getPrismaHealth = () => ({ ...prismaHealth });

export default prisma;
