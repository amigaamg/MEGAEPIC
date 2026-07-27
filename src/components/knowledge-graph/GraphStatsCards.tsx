'use client';
import type { GraphStats } from '@/lib/knowledge/importer';
import { NODE_TYPE_SCHEMAS } from '@/lib/knowledge/constitution';

interface GraphStatsCardsProps {
  stats: GraphStats;
}

const NODE_TYPE_LABELS: Record<string, string> = {};
for (const [key, schema] of Object.entries(NODE_TYPE_SCHEMAS)) {
  NODE_TYPE_LABELS[key] = schema.label;
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

export function GraphStatsCards({ stats }: GraphStatsCardsProps) {
  const sortedTypes = Object.entries(stats.nodeTypeCounts)
    .sort(([, a], [, b]) => b - a);

  const sortedRels = Object.entries(stats.relationshipTypeCounts)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Nodes" value={stats.nodeCount} color="var(--primary)" />
        <StatCard label="Relationships" value={stats.relationshipCount} color="var(--green)" />
        <StatCard label="Node Types" value={Object.keys(stats.nodeTypeCounts).length} color="var(--purple)" />
        <StatCard label="Avg Connectivity" value={stats.averageConnectivity} color="var(--teal)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Nodes by Type
          </div>
          <div className="flex flex-col gap-1.5">
            {sortedTypes.map(([type, count]) => {
              const schema = NODE_TYPE_SCHEMAS[type as keyof typeof NODE_TYPE_SCHEMAS];
              return (
                <div key={type} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: schema?.color || 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{schema?.label || type}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Relationships by Type
          </div>
          <div className="flex flex-col gap-1.5">
            {sortedRels.slice(0, 20).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{type.replace(/_/g, ' ')}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
