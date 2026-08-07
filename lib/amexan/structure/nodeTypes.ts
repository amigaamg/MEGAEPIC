// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitutional Node Registry — Engine I (Organization Structure)
// The registry is the SINGLE source of truth for every node type the hospital
// can contain. The engine and UI never hardcode a type: they query the registry.
//
// Adding a new type (e.g. "Stroke Center", "AI Command Center") is a one-line
// registration here — no engine, persistence, or UI changes required.
// ═══════════════════════════════════════════════════════════════════════════════

/** Every node type id the kernel understands today. Extensible at runtime via `registerNodeType`. */
export type NodeTypeId =
  | 'organization' | 'campus' | 'facility' | 'building' | 'floor'
  | 'department' | 'service' | 'unit' | 'ward' | 'room' | 'bed'
  | 'clinic' | 'theatre' | 'laboratory' | 'radiology' | 'pharmacy'
  | 'icu' | 'hdu' | 'nicu' | 'reception' | 'store' | 'parking'
  | 'emergency' | 'blood_bank' | 'mortuary' | 'cssd'
  | 'telemedicine_site' | 'outreach_center' | 'community_clinic'
  | 'vehicle';

export interface NodeTypeDefinition {
  /** Stable constitutional id — never changes, used in persisted docs. */
  id: NodeTypeId | string;
  /** Human label, e.g. "Department". */
  label: string;
  /** Plural label, e.g. "Departments". */
  plural: string;
  /** Emoji/icon token for tree + digital twin rendering. */
  icon: string;
  /** Accent color for the tree UI. */
  color: string;
  /** Which node types may be created beneath this type. */
  children: (NodeTypeId | string)[];
  /** Reverse nesting: which types may contain this type. Used so a newly
   *  registered type can declare where it lives without editing existing
   *  parents. `isAllowedChild(parent, child)` is true if the child is in
   *  parent.children OR parent is in this type's parentTypes. */
  parentTypes?: (NodeTypeId | string)[];
  /** Structural level: container types host children; leaf types terminate. */
  kind: 'container' | 'leaf' | 'any';
  /** Sensible default capacity when created (beds, rooms, seats…). */
  defaultCapacity?: number;
  /** Shortcode prefix used when generating the node `code`. */
  codePrefix: string;
  /** Optional capability required to manage nodes of this type (Book V). */
  manageCapability?: string;
  /** Human description shown in the builder add-palette. */
  description: string;
}

const NODE_TYPE_DEFS: NodeTypeDefinition[] = [
  { id: 'organization', label: 'Organization', plural: 'Organizations', icon: '🏥', color: '#0b2c4d', kind: 'container', children: ['campus', 'facility', 'building', 'department', 'vehicle'], codePrefix: 'ORG', description: 'The legal healthcare organization — root of the tree.' },
  { id: 'campus', label: 'Campus', plural: 'Campuses', icon: '📍', color: '#7c3aed', kind: 'container', children: ['facility', 'building'], codePrefix: 'CMP', description: 'A physical site belonging to the organization.' },
  { id: 'facility', label: 'Facility', plural: 'Facilities', icon: '🏨', color: '#0ea5e9', kind: 'container', children: ['building', 'department'], codePrefix: 'FAC', description: 'A hospital, clinic or satellite facility.' },
  { id: 'building', label: 'Building', plural: 'Buildings', icon: '🏢', color: '#0891b2', kind: 'container', children: ['floor', 'department'], codePrefix: 'BLD', description: 'A building within a facility or campus.' },
  { id: 'floor', label: 'Floor', plural: 'Floors', icon: '🏬', color: '#0d9488', kind: 'container', children: ['department', 'unit', 'ward', 'clinic', 'theatre', 'laboratory', 'radiology', 'pharmacy', 'icu', 'hdu', 'nicu', 'reception', 'store', 'emergency'], codePrefix: 'FLR', description: 'A floor level within a building.' },
  { id: 'department', label: 'Department', plural: 'Departments', icon: '🗂️', color: '#2563eb', kind: 'container', children: ['service', 'unit', 'ward', 'clinic', 'theatre', 'laboratory', 'radiology', 'pharmacy', 'icu', 'hdu', 'nicu', 'reception', 'store'], codePrefix: 'DEPT', description: 'A clinical or administrative department.' },
  { id: 'service', label: 'Service', plural: 'Services', icon: '🩺', color: '#4f46e5', kind: 'container', children: ['unit', 'ward'], codePrefix: 'SVC', description: 'A clinical service line.' },
  { id: 'unit', label: 'Unit', plural: 'Units', icon: '🧩', color: '#6d28d9', kind: 'container', children: ['ward', 'room'], codePrefix: 'UNIT', description: 'A sub-structure of a department or service.' },
  { id: 'ward', label: 'Ward', plural: 'Wards', icon: '🛏️', color: '#059669', kind: 'container', children: ['room', 'bed'], codePrefix: 'WARD', defaultCapacity: 24, description: 'A patient ward with beds.' },
  { id: 'room', label: 'Room', plural: 'Rooms', icon: '🚪', color: '#16a34a', kind: 'container', children: ['bed'], codePrefix: 'ROOM', defaultCapacity: 4, description: 'A physical room (consultation, treatment, side room).' },
  { id: 'bed', label: 'Bed', plural: 'Beds', icon: '🛌', color: '#10b981', kind: 'leaf', children: [], codePrefix: 'BED', defaultCapacity: 1, description: 'A single patient bed — first-class object.' },
  { id: 'clinic', label: 'Clinic', plural: 'Clinics', icon: '🩺', color: '#0ea5e9', kind: 'container', children: ['room'], codePrefix: 'CLIN', description: 'An outpatient clinic.' },
  { id: 'theatre', label: 'Theatre', plural: 'Theatres', icon: '🔬', color: '#ea580c', kind: 'container', children: ['room'], codePrefix: 'OT', description: 'An operating theatre.' },
  { id: 'laboratory', label: 'Laboratory', plural: 'Laboratories', icon: '🧪', color: '#9333ea', kind: 'container', children: ['room', 'unit'], codePrefix: 'LAB', description: 'A diagnostic laboratory.' },
  { id: 'radiology', label: 'Radiology', plural: 'Radiology Units', icon: '🩻', color: '#6366f1', kind: 'container', children: ['room', 'unit'], codePrefix: 'RAD', description: 'An imaging/radiology unit.' },
  { id: 'pharmacy', label: 'Pharmacy', plural: 'Pharmacies', icon: '💊', color: '#14b8a6', kind: 'container', children: ['room', 'store'], codePrefix: 'PHARM', description: 'A dispensing pharmacy.' },
  { id: 'icu', label: 'ICU', plural: 'ICUs', icon: '🫀', color: '#dc2626', kind: 'container', children: ['bed', 'room'], codePrefix: 'ICU', defaultCapacity: 12, description: 'Intensive care unit.' },
  { id: 'hdu', label: 'HDU', plural: 'HDUs', icon: '🛡️', color: '#f59e0b', kind: 'container', children: ['bed', 'room'], codePrefix: 'HDU', defaultCapacity: 12, description: 'High dependency unit.' },
  { id: 'nicu', label: 'NICU', plural: 'NICUs', icon: '👶', color: '#ec4899', kind: 'container', children: ['bed', 'room'], codePrefix: 'NICU', defaultCapacity: 8, description: 'Neonatal intensive care unit.' },
  { id: 'emergency', label: 'Emergency', plural: 'Emergency Units', icon: '🚑', color: '#ef4444', kind: 'container', children: ['room', 'bed', 'theatre'], codePrefix: 'ER', description: 'Emergency department.' },
  { id: 'reception', label: 'Reception', plural: 'Reception Areas', icon: '🧾', color: '#64748b', kind: 'container', children: ['room'], codePrefix: 'RECP', description: 'Front-of-house reception area.' },
  { id: 'store', label: 'Store', plural: 'Stores', icon: '📦', color: '#78716c', kind: 'container', children: ['room'], codePrefix: 'STORE', description: 'A supply/inventory store.' },
  { id: 'parking', label: 'Parking', plural: 'Parking Areas', icon: '🚗', color: '#57534e', kind: 'leaf', children: [], codePrefix: 'PARK', description: 'A parking area.' },
  { id: 'blood_bank', label: 'Blood Bank', plural: 'Blood Banks', icon: '🩸', color: '#be123c', kind: 'container', children: ['room', 'store'], codePrefix: 'BB', description: 'A blood bank and transfusion service.' },
  { id: 'mortuary', label: 'Mortuary', plural: 'Mortuaries', icon: '⚰️', color: '#44403c', kind: 'container', children: ['room'], codePrefix: 'MORT', description: 'A mortuary facility.' },
  { id: 'cssd', label: 'CSSD', plural: 'CSSD', icon: '🧼', color: '#38bdf8', kind: 'container', children: ['room'], codePrefix: 'CSSD', description: 'Central sterile services department.' },
  { id: 'telemedicine_site', label: 'Telemedicine Site', plural: 'Telemedicine Sites', icon: '📡', color: '#7c3aed', kind: 'container', children: ['room'], codePrefix: 'TEL', description: 'A remote telemedicine site.' },
  { id: 'outreach_center', label: 'Outreach Center', plural: 'Outreach Centers', icon: '🩺', color: '#0d9488', kind: 'container', children: ['clinic', 'room'], codePrefix: 'OUT', description: 'A community outreach center.' },
  { id: 'community_clinic', label: 'Community Clinic', plural: 'Community Clinics', icon: '🏘️', color: '#22c55e', kind: 'container', children: ['room'], codePrefix: 'CC', description: 'A community clinic.' },
  { id: 'vehicle', label: 'Vehicle', plural: 'Vehicles', icon: '🚑', color: '#f43f5e', kind: 'leaf', children: [], codePrefix: 'VEH', defaultCapacity: 1, description: 'A GPS-enabled hospital vehicle (ambulance, logistics, outreach).' },
];

const registry = new Map<string, NodeTypeDefinition>(NODE_TYPE_DEFS.map((d) => [d.id, d]));

/** Registers a new constitutional node type at runtime. */
export function registerNodeType(def: NodeTypeDefinition): void {
  registry.set(def.id, def);
}

export function getNodeType(id: string): NodeTypeDefinition | undefined {
  return registry.get(id);
}

export function getAllNodeTypes(): NodeTypeDefinition[] {
  return Array.from(registry.values());
}

/** Every type registered (ids) — the canonical list the builder palette uses. */
export const NODE_TYPE_IDS: string[] = Array.from(registry.keys());

export function childrenOf(typeId: string): string[] {
  return getNodeType(typeId)?.children ?? [];
}

export function isAllowedChild(parentType: string, childType: string): boolean {
  const parent = getNodeType(parentType);
  if (!parent) return false;
  if (parent.kind === 'leaf') return false;
  if (parent.children.includes(childType)) return true;
  const child = getNodeType(childType);
  return !!child?.parentTypes?.includes(parentType);
}

export function typeLabel(typeId: string): string {
  return getNodeType(typeId)?.label ?? typeId;
}
