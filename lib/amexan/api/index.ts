export * as db from './db';
export * as neo4j from './neo4j';
export * as gateway from './gateway';

export async function healthCheckAll() {
  const [pg, neo4jStatus, gw] = await Promise.all([
    import('./db').then(m => m.healthCheck()).catch(() => false),
    import('./neo4j').then(m => m.healthCheck()).catch(() => false),
    import('./gateway').then(m => m.healthCheck()).catch(() => null),
  ]);
  return {
    postgresql: pg ? 'connected' : 'disconnected',
    neo4j: neo4jStatus ? 'connected' : 'disconnected',
    gateway: gw ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };
}
