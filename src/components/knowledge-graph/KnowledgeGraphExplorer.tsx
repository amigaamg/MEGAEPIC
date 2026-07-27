'use client';
import { useState, useMemo } from 'react';
import type { KnowledgeGraph } from '@/lib/knowledge/constitution';
import { computeGraphStats } from '@/lib/knowledge/importer';
import { GraphStatsCards } from './GraphStatsCards';
import { NodeBrowser } from './NodeBrowser';
import { NodeDetailPanel } from './NodeDetailPanel';
import { RulesViewer } from './RulesViewer';
import { EventViewer } from './EventViewer';
import { WorkflowViewer } from './WorkflowViewer';
import { FactStoreViewer } from './FactStoreViewer';
import { DocumentationViewer } from './DocumentationViewer';
import { EventEngine } from '@/lib/amexan/events/engine';
import { AtomicFactStore } from '@/lib/amexan/storage/engine';
import { connectEventStore } from '@/lib/amexan/storage/event-bridge';

interface KnowledgeGraphExplorerProps {
  graph: KnowledgeGraph;
}

type ExplorerTab = 'browse' | 'stats' | 'rules' | 'events' | 'workflow' | 'facts' | 'documents';

export function KnowledgeGraphExplorer({ graph }: KnowledgeGraphExplorerProps) {
  const [activeTab, setActiveTab] = useState<ExplorerTab>('browse');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const stats = useMemo(() => computeGraphStats(graph), [graph]);
  const eventEngine = useMemo(() => new EventEngine(), []);
  const factStore = useMemo(() => {
    const store = new AtomicFactStore();
    connectEventStore(eventEngine, store);
    return store;
  }, [eventEngine]);

  const tabs: { key: ExplorerTab; label: string; icon: string }[] = [
    { key: 'browse', label: 'Browse Nodes', icon: '🔍' },
    { key: 'stats', label: 'Graph Statistics', icon: '📊' },
    { key: 'rules', label: 'Rule Engine', icon: '⚖️' },
    { key: 'events', label: 'Events', icon: '📋' },
    { key: 'workflow', label: 'Workflow', icon: '🔄' },
    { key: 'facts', label: 'Fact Store', icon: '💾' },
    { key: 'documents', label: 'Documents', icon: '📄' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <GraphStatsCards stats={stats} />

      <div className="flex gap-1.5 border-b pb-2" style={{ borderColor: 'var(--surface-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{
              background: activeTab === tab.key ? 'var(--sky-50)' : 'transparent',
              color: activeTab === tab.key ? 'var(--sky-700)' : 'var(--text-secondary)',
              border: activeTab === tab.key ? '1px solid var(--sky-200)' : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'stats' && <GraphStatsCards stats={stats} />}

      {activeTab === 'rules' && <RulesViewer />}

      {activeTab === 'events' && <EventViewer engine={eventEngine} />}

      {activeTab === 'workflow' && <WorkflowViewer eventEngine={eventEngine} />}

      {activeTab === 'facts' && <FactStoreViewer store={factStore} eventEngine={eventEngine} />}

      {activeTab === 'documents' && <DocumentationViewer store={factStore} />}

      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <NodeBrowser
              graph={graph}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>
          <div className="lg:col-span-3">
            {selectedNodeId ? (
              <NodeDetailPanel
                graph={graph}
                nodeId={selectedNodeId}
                onClose={() => setSelectedNodeId(null)}
                onSelectNode={setSelectedNodeId}
              />
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center h-64 gap-2">
                <div className="text-2xl">🗂️</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Select a node to explore
                </div>
                <div className="text-xs text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
                  Choose a node from the browser on the left to view its properties,
                  relationships, and connections within the knowledge graph.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
