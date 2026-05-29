let prisma: any = null;

export async function getPrisma(): Promise<any> {
  if (prisma) return prisma;
  try {
    if (process.env.DATABASE_URL) {
      const { PrismaClient } = await import('@prisma/client');
      prisma = new PrismaClient();
    }
  } catch {
    prisma = null;
  }
  return prisma;
}

export default null;
