import type { ChiefComplaintObject, ComplaintGraphNode, ComplaintRelationship } from './types';

export function buildComplaintGraph(complaints: ChiefComplaintObject[]): ComplaintGraphNode | null {
  if (complaints.length === 0) return null;

  const sorted = [...complaints].sort((a, b) => a.chronology - b.chronology);
  const primary = sorted.find(c => c.primary) || sorted[0];

  const root: ComplaintGraphNode = {
    complaint: primary,
    children: [],
    depth: 0,
  };

  const others = sorted.filter(c => c.id !== primary.id);
  const usedIds = new Set<string>([primary.id]);
  const queue: { node: ComplaintGraphNode; complaint: ChiefComplaintObject }[] = [{ node: root, complaint: primary }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const related = others.filter(c =>
      !usedIds.has(c.id) &&
      (c.relationship === 'Associated' || c.relationship === 'Progression' || c.relationship === 'Complication')
    );

    for (const rel of related) {
      if (!usedIds.has(rel.id)) {
        usedIds.add(rel.id);
        const childNode: ComplaintGraphNode = {
          complaint: rel,
          children: [],
          depth: current.node.depth + 1,
        };
        current.node.children.push(childNode);
        queue.push({ node: childNode, complaint: rel });
      }
    }

    const independent = others.filter(c =>
      !usedIds.has(c.id) &&
      (c.relationship === 'Independent' || c.relationship === 'Unknown')
    );

    for (const ind of independent) {
      if (!usedIds.has(ind.id)) {
        usedIds.add(ind.id);
        const childNode: ComplaintGraphNode = {
          complaint: ind,
          children: [],
          depth: current.node.depth + 1,
        };
        current.node.children.push(childNode);
        queue.push({ node: childNode, complaint: ind });
      }
    }
  }

  return root;
}

export function graphToText(node: ComplaintGraphNode, indent: string = ''): string {
  const rel = node.complaint.relationship === 'Unknown' ? '' : ` (${node.complaint.relationship})`;
  let text = `${indent}${node.complaint.name}${rel}\n`;

  for (const child of node.children) {
    text += graphToText(child, indent + '  ');
  }

  return text;
}
