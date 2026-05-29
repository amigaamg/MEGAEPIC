let prisma: any = null;

try {
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
} catch {
  prisma = null;
}

export function getPrisma(): any {
  return prisma;
}

export default prisma;
