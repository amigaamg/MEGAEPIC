'use client';
import { useMemo, useState } from 'react';
import type { KnowledgeGraph, GraphNode, NodeType } from '@/lib/knowledge/constitution';
import { NODE_TYPE_SCHEMAS } from '@/lib/knowledge/constitution';

interface NodeBrowserProps {
  graph: KnowledgeGraph;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export function NodeBrowser({ graph, selectedNodeId, onSelectNode }: NodeBrowserProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<NodeType | 'all'>('all');

  const allNodes = useMemo(() => Array.from(graph.nodes.values()), [graph]);

  const nodeTypes = useMemo(() => {
    const types = new Set<NodeType>();
    for (const n of allNodes) types.add(n.type);
    return Array.from(types).sort();
  }, [allNodes]);

  const filtered = useMemo(() => {
    return allNodes.filter(n => {
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allNodes, typeFilter, search]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Search nodes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input w-auto"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as NodeType | 'all')}
        >
          <option value="all">All Types</option>
          {nodeTypes.map(t => {
            const schema = NODE_TYPE_SCHEMAS[t];
            return <option key={t} value={t}>{schema?.label || t}</option>;
          })}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        <div className="flex flex-col gap-1">
          {filtered.map(node => {
            const schema = NODE_TYPE_SCHEMAS[node.type];
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: isSelected ? 'var(--sky-50)' : 'transparent',
                  border: isSelected ? '1px solid var(--sky-200)' : '1px solid transparent',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: schema?.color || 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {node.label}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {schema?.label || node.type}
                    {node.tags.length > 0 && ` · ${node.tags.join(', ')}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No nodes match your search</div>
          </div>
        )}
      </div>

      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} of {allNodes.length} nodes
      </div>
    </div>
  );
}
