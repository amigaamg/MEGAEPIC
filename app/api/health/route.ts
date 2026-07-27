import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, unknown> = {
    status: 'checking',
    timestamp: new Date().toISOString(),
  };

  try {
    const { db, neo4j } = await import('@/lib/amexan/api');
    const [pgOk, neoOk] = await Promise.all([
      db.healthCheck().catch(() => false),
      neo4j.healthCheck().catch(() => false),
    ]);
    results.postgresql = pgOk ? 'connected' : 'disconnected';
    results.neo4j = neoOk ? 'connected' : 'disconnected';
    results.status = pgOk ? 'healthy' : 'degraded';

    if (pgOk) {
      const stats = await db.getDashboardStats().catch(() => null);
      if (stats) results.stats = stats;
    }
  } catch (e) {
    results.status = 'error';
    results.error = String(e);
  }

  return NextResponse.json(results);
}
