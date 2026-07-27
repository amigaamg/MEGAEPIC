'use client';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { COUGH_KNOWLEDGE } from '@/lib/knowledge/cough-complete';
import { importYamlKnowledge } from '@/lib/knowledge/importer';
import { KnowledgeGraphExplorer } from '@/src/components/knowledge-graph/KnowledgeGraphExplorer';
import BreadcrumbNav from '@/src/components/shared/breadcrumb-nav';

export default function KnowledgeGraphPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;

  const graph = useMemo(() => importYamlKnowledge(COUGH_KNOWLEDGE), []);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <BreadcrumbNav items={[
        { label: 'Dashboard', href: `/clinical-workspace/${hospitalId}` },
        { label: 'Knowledge Graph' },
      ]} />

      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          Knowledge Graph
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {graph.name} · v{graph.version} · {graph.nodes.size} nodes, {graph.relationships.size} relationships
        </p>
      </div>

      <KnowledgeGraphExplorer graph={graph} />
    </div>
  );
}
