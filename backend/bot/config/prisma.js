// CommonJS wrapper for Prisma client (for bot tools)
const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      // log: ['error', 'warn']
    });
  }
  return prisma;
}

module.exports = { getPrisma };
