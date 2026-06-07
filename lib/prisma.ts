let prisma: any = null;

export async function getPrisma(): Promise<any> {
  if (prisma) return prisma;
  if (!process.env.DATABASE_URL) return null;
  try {
    const modName = '@prisma/client';
    const { PrismaClient } = require(modName);
    prisma = new PrismaClient();
  } catch {
    prisma = null;
  }
  return prisma;
}

export default null;
