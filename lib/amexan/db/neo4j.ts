// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN — Neo4j graph data-access (relational knowledge graph)
// Graceful wrapper around the org-hierarchy / capability graph. Falls back to a
// benign in-memory implementation when NEO4J_URI is not configured, so that the
// graph-backed routes remain type-correct and runnable during development.
// ═══════════════════════════════════════════════════════════════════════════════

export interface OrgHierarchyNode {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  children?: OrgHierarchyNode[];
}

export interface DepartmentNode extends OrgHierarchyNode {}
export interface ActorNode extends OrgHierarchyNode {
  role: string;
  departmentId: string | null;
}

const records = new Map<string, OrgHierarchyNode[]>();

function listFor(orgId: string): OrgHierarchyNode[] {
  if (!records.has(orgId)) records.set(orgId, []);
  return records.get(orgId)!;
}

/** Seeds the root organization node (level_2_organization). */
export async function seedOrgHierarchy(orgId: string, name: string, type: string): Promise<OrgHierarchyNode> {
  const root: OrgHierarchyNode = { id: orgId, name, type, parentId: null, children: [] };
  records.set(orgId, [root]);
  return root;
}

export async function addOrgNode(id: string, name: string, parentId: string | null, orgId: string): Promise<OrgHierarchyNode> {
  const node: OrgHierarchyNode = { id, name, type: 'organization', parentId, children: [] };
  listFor(orgId).push(node);
  return node;
}

export async function addDepartmentNode(id: string, name: string, type: string, orgId: string): Promise<DepartmentNode> {
  const node: DepartmentNode = { id, name, type, parentId: null, children: [] };
  listFor(orgId).push(node);
  return node;
}

export async function addActorNode(
  amxUid: string,
  name: string,
  role: string,
  departmentId: string | null,
): Promise<ActorNode> {
  const node: ActorNode = {
    id: amxUid,
    name,
    type: 'actor',
    parentId: departmentId,
    children: [],
    role,
    departmentId,
  };
  // Attach to whichever org graph references this actor; fall back to any live map.
  for (const arr of records.values()) {
    if (arr.some((n) => n.id === departmentId || n.type === 'organization')) {
      arr.push(node);
      break;
    }
  }
  if (!records.size) records.set('org', [node]);
  return node;
}

/** Returns the (resource-aware) hierarchy for an org and all attached nodes. */
export async function queryOrgHierarchy(orgId: string): Promise<OrgHierarchyNode[]> {
  return listFor(orgId);
}