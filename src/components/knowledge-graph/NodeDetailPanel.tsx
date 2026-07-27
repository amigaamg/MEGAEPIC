'use client';
import { useMemo } from 'react';
import type { KnowledgeGraph, GraphNode, GraphRelationship } from '@/lib/knowledge/constitution';
import { NODE_TYPE_SCHEMAS, findRelationshipsFrom, findRelationshipsTo } from '@/lib/knowledge/constitution';

interface NodeDetailPanelProps {
  graph: KnowledgeGraph;
  nodeId: string;
  onClose: () => void;
  onSelectNode: (id: string) => void;
}

export function NodeDetailPanel({ graph, nodeId, onClose, onSelectNode }: NodeDetailPanelProps) {
  const node = graph.nodes.get(nodeId);
  const outgoing = useMemo(() => node ? findRelationshipsFrom(graph, nodeId) : [], [graph, nodeId]);
  const incoming = useMemo(() => node ? findRelationshipsTo(graph, nodeId) : [], [graph, nodeId]);

  if (!node) {
    return (
      <div className="card p-6 flex items-center justify-center h-48">
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Node not found</div>
      </div>
    );
  }

  const schema = NODE_TYPE_SCHEMAS[node.type];

  return (
    <div className="card flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      <div className="flex items-start justify-between gap-3 p-4 pb-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ background: schema?.color || 'var(--text-muted)' }} />
          <div className="min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{node.label}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {schema?.label || node.type} · {node.source}
              {node.version && ` · v${node.version}`}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="flex-shrink-0 text-xs px-2 py-1 rounded hover:bg-gray-100" style={{ color: 'var(--text-muted)' }}>
          ✕
        </button>
      </div>

      <div className="px-4">
        {node.description && (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{node.description}</p>
        )}
      </div>

      <div className="px-4 flex-1 overflow-y-auto">
        {Object.keys(node.properties).length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Properties</div>
            <div className="flex flex-col gap-1">
              {Object.entries(node.properties).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-xs py-0.5">
                  <span className="font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)', minWidth: 100 }}>{key}</span>
                  <span style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {Array.isArray(value) ? value.join(', ') : String(value ?? '—')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <RelationshipSection
          title="Outgoing Relationships"
          relationships={outgoing}
          graph={graph}
          onSelectNode={onSelectNode}
        />
        <RelationshipSection
          title="Incoming Relationships"
          relationships={incoming}
          graph={graph}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}

interface RelationshipSectionProps {
  title: string;
  relationships: GraphRelationship[];
  graph: KnowledgeGraph;
  onSelectNode: (id: string) => void;
}

function RelationshipSection({ title, relationships, graph, onSelectNode }: RelationshipSectionProps) {
  if (relationships.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {title} ({relationships.length})
      </div>
      <div className="flex flex-col gap-1">
        {relationships.map(rel => {
          const targetId = rel.sourceId === rel.targetId ? null : (title === 'Outgoing Relationships' ? rel.targetId : rel.sourceId);
          const targetNode = targetId ? graph.nodes.get(targetId) : null;
          return (
            <div key={rel.id} className="flex items-center gap-2 py-1 px-2 rounded" style={{ background: 'var(--surface-elevated)' }}>
              <div className="text-[10px] font-medium flex-shrink-0" style={{ color: 'var(--sky-600)' }}>
                {rel.type.replace(/_/g, ' ')}
              </div>
              <div className="flex-1" />
              {targetNode ? (
                <button
                  onClick={() => onSelectNode(targetId!)}
                  className="text-[10px] hover:underline truncate max-w-[200px]"
                  style={{ color: 'var(--primary)' }}
                >
                  {targetNode.label}
                </button>
              ) : (
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
