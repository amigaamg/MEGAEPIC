// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitutional StructureNode — Engine I (Organization Structure)
// Every object in the hospital tree is the SAME node. A Department, Ward, Room,
// Bed, Theatre, or even a future "AI Command Center" is just a node with a
// different `type`. This single-shape model is what makes the kernel scalable to
// billions of objects without new handlers per type.
// ═══════════════════════════════════════════════════════════════════════════════

export type StructureNodeStatus =
  | 'planned'      // defined in the builder, never yet commissioned
  | 'active'       // live & commissioned
  | 'inactive'     // temporarily out of service
  | 'archived'     // removed from the live tree, kept for history
  | 'maintenance'  // under maintenance, not usable
  | 'closed';      // permanently decommissioned

/** Constitutional structure node. Fields marked optional are reserved for
 *  future engines (Workforce, Patients, Digital Twin, Analytics, Security). */
export interface StructureNode {
  /** Stable constitutional UUID — never changes once created. */
  id: string;
  /** Owning organization (Rule 2: every facility owns its data). */
  organizationId: string;
  /** Parent node id. Null only for the root organization node. */
  parentId: string | null;
  /** Registered node type id — resolved through the Node Registry. */
  type: string;
  name: string;
  /** Stable shortcode, e.g. WARD-MED-01. */
  code: string;
  status: StructureNodeStatus;
  /** Child ordering within the same parent (for drag-and-drop ordering). */
  order: number;
  /** Capacity in this node's natural unit (beds, rooms, seats, stores…). */
  capacity?: number;
  /** Geo coordinates + floor level for the Digital Twin / maps. */
  coordinates?: { lat?: number; lng?: number; floor?: number };
  /** Free-form future metadata (contracts, sensors, policies…). */
  metadata?: Record<string, unknown>;
  /** Reserved: graph relationships to people/services/assets. */
  relationships?: Record<string, unknown>;
  /** Reserved: computed KPIs surfaced to the Digital Twin. */
  analytics?: Record<string, unknown>;
  /** Reserved: role-based permissions at the node level. */
  permissions?: Record<string, unknown>;
  /** Reserved: live digital-twin primitives (sensors, occupancy links). */
  digitalTwin?: Record<string, unknown>;
  /** Reserved: who governs this node (department head, ward manager…). */
  managedBy?: string;
  /** Audit + provenance. */
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateStructureNodeInput {
  type: string;
  name: string;
  /** Overridden by createNode's args; optional so callers can omit it. */
  parentId?: string | null;
  capacity?: number;
  status?: StructureNodeStatus;
}

/** A node with its resolved children — the materialised tree. */
export interface StructureTreeNode extends StructureNode {
  children: StructureTreeNode[];
}