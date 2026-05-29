let prisma: any = null;

try {
  if (process.env.DATABASE_URL) {
    // Dynamic require using variable to avoid build-time resolution
    const modName = '@prisma/client';
    const { PrismaClient } = require(modName);
    prisma = new PrismaClient();
  }
} catch {
  prisma = null;
}

export function getPrisma(): any {
  return prisma;
}

export default prisma;
