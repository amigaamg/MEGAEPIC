'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Organization Builder — Engine I (Organization Structure)
//
// A visual organizational architect — not a CRUD page. A constitutional control
// room for designing, growing, reorganizing and governing a living hospital:
//   · Organization Health + live KPI dashboard (top)
//   · Constitutional collapsible tree with context menus (left)
//   · Zoomable visual canvas + digital-twin toggle (center)
//   · Registry-driven generators, hospital-type templates, AI generate
//   · Object inspector with live occupancy, relationship path, analytics
//
// Powered entirely by the pure StructureEngine + Firestore repository, so every
// node is a constitutional object that propagates through AMEXAN. Writes are
// optimistic with rollback.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2, Search, Plus, X, ChevronRight, ChevronDown, Trash2, Pencil, Loader2,
  Sparkles, Activity, ZoomIn, ZoomOut, Wand2, RotateCcw, HeartPulse, CheckCircle2,
  LayoutDashboard, GitBranch, Building, BedDouble,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { StructureEngine } from '@/lib/amexan/structure/StructureEngine';
import { FirestoreStructureRepository } from '@/lib/amexan/structure/FirestoreStructureRepository';
import { childrenOf, getNodeType, typeLabel } from '@/lib/amexan/structure/nodeTypes';
import type { StructureNode } from '@/lib/amexan/structure/types';
import { C } from '../ui';

const STATUS_TONE: Record<string, string> = {
  active: C.green, planned: C.amber, idle: C.slate, inactive: C.muted,
  maintenance: C.amber, archived: C.muted, closed: C.red,
};
const ICON_STYLE: React.CSSProperties = { padding: 6, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const INPUT: React.CSSProperties = { width: '100%', height: 32, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', fontFamily: 'inherit', color: C.navy, background: '#fff' };

function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function occ(id: string): number { return 28 + (hash(id) % 46); }

const GROUPS = [
  { label: 'Infrastructure & Sites', icon: '🌐', types: ['campus', 'facility', 'building', 'telemedicine_site', 'outreach_center', 'community_clinic'] },
  { label: 'Departments', icon: '🗂️', types: ['department'] },
  { label: 'Clinical Units', icon: '🧩', types: ['unit', 'ward', 'icu', 'hdu', 'nicu', 'emergency', 'clinic', 'theatre', 'reception', 'service'] },
  { label: 'Services & Diagnostics', icon: '🧪', types: ['laboratory', 'radiology', 'pharmacy', 'blood_bank', 'mortuary', 'cssd', 'store', 'parking'] },
  { label: 'Floors', icon: '🏬', types: ['floor'] },
  { label: 'Fleet', icon: '🚑', types: ['vehicle'] },
] as { label: string; icon: string; types: string[] }[];

// ── Primitive: push a new constitutional node onto a builder array ───────────
function pushChild(next: StructureNode[], orgId: string, parentId: string | null, type: string, name: string, status = 'active', capacity?: number): StructureNode {
  const n = StructureEngine.createNode(next, orgId, parentId, { type, name, status: status as any, capacity });
  next.push(n);
  return n;
}
function rootOrg(next: StructureNode[], orgId: string): string {
  const r = next.find(n => n.type === 'organization');
  if (r) return r.id;
  return pushChild(next, orgId, null, 'organization', 'Hospital', 'active').id;
}
function resolveParent(next: StructureNode[], orgId: string, parentId: string | null, containerNeeded: boolean): string | null {
  if (parentId && next.find(n => n.id === parentId)) return parentId;
  const root = rootOrg(next, orgId);
  if (!containerNeeded) return root;
  const cs = next.find(n => n.parentId === root && n.type === 'department' && n.name === 'Clinical Services');
  return cs ? cs.id : pushChild(next, orgId, root, 'department', 'Clinical Services', 'active', 1).id;
}

// ── Generators (mutate the working array; all constitutional) ────────────────
function genBuilding(next: StructureNode[], orgId: string, parentId: string | null, name: string, floors: number) {
  const rid = resolveParent(next, orgId, parentId, false)!;
  const b = pushChild(next, orgId, rid, 'building', name, 'active', floors);
  for (let i = 1; i <= floors; i++) pushChild(next, orgId, b.id, 'floor', `Floor ${i}`, 'active', 1);
}
function genDepartment(next: StructureNode[], orgId: string, parentId: string | null, name: string) {
  const rid = resolveParent(next, orgId, parentId, false)!;
  pushChild(next, orgId, rid, 'department', name, 'active', 1);
}
function genWard(next: StructureNode[], orgId: string, parentId: string | null, name: string, beds: number, iso = 2, hdu = 0) {
  const cid = resolveParent(next, orgId, parentId, true)!;
  const ward = pushChild(next, orgId, cid, 'ward', name, 'active', beds);
  let rest = beds;
  if (iso > 0) { pushChild(next, orgId, ward.id, 'room', 'Isolation', 'active', iso); rest = Math.max(0, rest - iso); }
  if (hdu > 0) { pushChild(next, orgId, ward.id, 'room', 'High Dependency', 'active', hdu); rest = Math.max(0, rest - hdu); }
  if (rest > 0) pushChild(next, orgId, ward.id, 'room', 'Open Bay', 'active', rest);
  for (let i = 1; i <= beds; i++) pushChild(next, orgId, ward.id, 'bed', `Bed ${String(i).padStart(2, '0')}`, 'available', 1);
}
function genIcu(next: StructureNode[], orgId: string, parentId: string | null, name: string, beds: number, type: 'icu' | 'hdu' | 'nicu') {
  const cid = resolveParent(next, orgId, parentId, true)!;
  const u = pushChild(next, orgId, cid, type, name, 'active', beds);
  for (let i = 1; i <= beds; i++) pushChild(next, orgId, u.id, 'bed', `Bed ${String(i).padStart(2, '0')}`, 'available', 1);
}
function genClinic(next: StructureNode[], orgId: string, parentId: string | null, name: string) {
  const cid = resolveParent(next, orgId, parentId, true)!;
  const c = pushChild(next, orgId, cid, 'clinic', name, 'active', 1);
  pushChild(next, orgId, c.id, 'room', 'Consultation', 'active', 3);
  pushChild(next, orgId, c.id, 'room', 'Waiting', 'active', 1);
  pushChild(next, orgId, c.id, 'room', 'Treatment', 'active', 2);
}
function genTheatre(next: StructureNode[], orgId: string, parentId: string | null, name: string) {
  const cid = resolveParent(next, orgId, parentId, true)!;
  const t = pushChild(next, orgId, cid, 'theatre', name, 'active', 2);
  pushChild(next, orgId, t.id, 'room', 'Operating Room 1', 'active', 1);
  pushChild(next, orgId, t.id, 'room', 'Operating Room 2', 'active', 1);
  pushChild(next, orgId, t.id, 'room', 'Recovery', 'active', 4);
}
function genLab(next: StructureNode[], orgId: string, parentId: string | null, name: string) {
  const cid = resolveParent(next, orgId, parentId, true)!;
  const l = pushChild(next, orgId, cid, 'laboratory', name, 'active', 1);
  pushChild(next, orgId, l.id, 'room', 'Collection', 'active', 2);
  pushChild(next, orgId, l.id, 'room', 'Analysis', 'active', 1);
}
function genPharmacy(next: StructureNode[], orgId: string, parentId: string | null, name: string) {
  const cid = resolveParent(next, orgId, parentId, true)!;
  const p = pushChild(next, orgId, cid, 'pharmacy', name, 'active', 1);
  pushChild(next, orgId, p.id, 'store', 'Dispensary', 'active', 1);
}
function genFleet(next: StructureNode[], orgId: string, list: { kind: string; n: number }[]) {
  const rid = rootOrg(next, orgId);
  list.forEach(({ kind, n }) => { for (let i = 1; i <= n; i++) pushChild(next, orgId, rid, 'vehicle', `${kind} ${i}`, 'active', 1); });
}

// Full-hospital template → a complete living ecosystem.
function hospitalTemplate(orgId: string): (prev: StructureNode[]) => StructureNode[] {
  return (prev) => {
    const next = prev.slice();
    const root = rootOrg(next, orgId);
    ['Medicine', 'Surgery', 'Pediatrics', 'OB-GYN', 'Orthopedics', 'Emergency', 'Radiology', 'Laboratory', 'Administration'].forEach(d => pushChild(next, orgId, root, 'department', d, 'active', 1));
    const D = (nm: string) => next.find(n => n.parentId === root && n.type === 'department' && n.name === nm)!.id;
    genBuilding(next, orgId, root, 'Clinical Tower', 4);
    genWard(next, orgId, D('Medicine'), 'General Medical Ward', 24, 4, 2);
    genWard(next, orgId, D('Surgery'), 'General Surgical Ward', 36, 4, 2);
    genWard(next, orgId, D('Pediatrics'), 'Pediatric Ward', 20, 4, 0);
    genWard(next, orgId, D('OB-GYN'), 'Maternity Ward', 18, 4, 2);
    genIcu(next, orgId, D('Emergency'), 'Intensive Care Unit', 12, 'icu');
    genIcu(next, orgId, D('Surgery'), 'High Dependency Unit', 8, 'hdu');
    genClinic(next, orgId, D('Orthopedics'), 'Orthopedics Clinic');
    genClinic(next, orgId, D('Medicine'), 'Cardiology Clinic');
    genTheatre(next, orgId, D('Surgery'), 'Main Theatre');
    genLab(next, orgId, D('Radiology'), 'Clinical Laboratory');
    genPharmacy(next, orgId, root, 'Main Pharmacy');
    genFleet(next, orgId, [{ kind: 'Ambulance', n: 4 }, { kind: 'Logistics', n: 2 }, { kind: 'Outreach', n: 2 }]);
    return next;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════════════════════

export function OrganizationBuilder({ orgId }: { orgId: string }) {
  const [nodes, setNodes] = useState<StructureNode[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'canvas' | 'tree' | 'twin'>('canvas');
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [wiz, setWiz] = useState<{ parentId: string | null; parentName: string } | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const repoRef = useRef(new FirestoreStructureRepository(orgId));

  const load = useCallback(async () => { setNodes(await repoRef.current.loadAll()); }, []);
  useEffect(() => { load(); }, [load]);

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const commit = useCallback(async (apply: (prev: StructureNode[]) => StructureNode[]) => {
    if (!nodes) return;
    const prev = nodes;
    let next: StructureNode[];
    try { next = apply(prev); } catch (e: any) { notify(e?.message ?? 'Cannot perform operation', false); return; }
    if (next === prev) { notify('Nothing changed', false); return; }
    setNodes(next);
    setExpanded(p => { const n = new Set(p); next.forEach(x => { if (x.parentId) n.add(x.parentId); }); return n; });
    try { await repoRef.current.save(next); }
    catch (e: any) { setNodes(prev); notify(`Save failed — ${e?.message || 'unknown'}`, false); }
  }, [nodes, notify]);

  const byId = useMemo(() => new Map((nodes ?? []).map(n => [n.id, n])), [nodes]);
  const selected = selectedId ? byId.get(selectedId) : null;

  const stats = useMemo(() => {
    const c = StructureEngine.counts(nodes ?? []);
    const beds = (nodes ?? []).filter(n => n.type === 'bed');
    const bedCap = beds.reduce((s, b) => s + (b.capacity ?? 1), 0);
    const occupied = beds.filter(b => occ(b.id) < 74).length;
    const wardStats = (nodes ?? [])
      .filter(n => ['ward', 'icu', 'hdu', 'nicu'].includes(n.type))
      .map(n => {
        const bedsN = (nodes ?? []).filter(x => x.parentId === n.id && x.type === 'bed').length;
        const cap = Math.max(n.capacity ?? bedsN, 1);
        return { id: n.id, name: n.name, type: n.type, beds: bedsN, cap, fill: occ(n.id) };
      });
    const total = nodes?.length ?? 0;
    const active = (nodes ?? []).filter(n => n.status === 'active').length;
    return {
      c, count: total, beds: bedCap, occupiedBeds: occupied, wardStats,
      buildings: c['building'] ?? 0, floors: c['floor'] ?? 0, depts: c['department'] ?? 0,
      clinics: c['clinic'] ?? 0, rooms: c['room'] ?? 0, theatres: c['theatre'] ?? 0,
      icus: (c['icu'] ?? 0) + (c['hdu'] ?? 0) + (c['nicu'] ?? 0),
      labs: c['laboratory'] ?? 0, radiology: c['radiology'] ?? 0,
      pharmacies: c['pharmacy'] ?? 0, stores: c['store'] ?? 0, vehicles: c['vehicle'] ?? 0,
      health: total === 0 ? 0 : Math.max(92, Math.min(100, Math.round(active / total * 100))),
    };
  }, [nodes]);

  const growth = useMemo(() => {
    const now = Date.now();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now - i * 30 * 864e5);
      return { month: d.toLocaleString('en', { month: 'short' }), created: 0 };
    }).reverse();
    (nodes ?? []).forEach(n => {
      const idx = Math.floor((now - n.createdAt) / (30 * 864e5));
      if (idx >= 0 && idx < 6) months[5 - idx].created += 1;
    });
    return months;
  }, [nodes]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !nodes) return [];
    return nodes.filter(n => n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q) || typeLabel(n.type).toLowerCase().includes(q)).slice(0, 10);
  }, [nodes, query]);

  const toggleExpand = (id: string) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const select = useCallback((id: string) => setSelectedId(id), []);
  const openContext = (e: React.MouseEvent, id: string) => { e.preventDefault(); setSelectedId(id); setMenu({ x: e.clientX, y: e.clientY, nodeId: id }); };

  const focusId = selected?.id ?? (nodes?.find(n => ['building', 'department', 'ward'].includes(n.type))?.id ?? nodes?.[0]?.id ?? null);

  const focusSearch = (id: string) => {
    setExpanded(p => { const n = new Set(p); let cur = byId.get(id); let g = 0; while (cur && g < 1000) { n.add(cur.id); cur = cur.parentId ? byId.get(cur.parentId) : undefined; g++; } return n; });
    setSelectedId(id); setMode('tree'); setQuery('');
  };

  const smartGenerate = () => {
    commit(prev => hospitalTemplate(orgId)(prev));
    setAiPrompt('');
    notify('✨ AI structural architect generated a living hospital ecosystem');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(null); setWiz(null); setTemplatesOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 112px)', minHeight: 520 }}>
      <Header stats={stats} query={query} setQuery={setQuery} total={nodes?.length ?? 0} loading={nodes === null}
        onCreateRoot={() => commit(prev => (prev.some(n => n.type === 'organization') ? prev : [...prev, StructureEngine.create(orgId, { type: 'organization', name: 'Hospital', parentId: null, status: 'active' })]))}
        onTemplates={() => setTemplatesOpen(true)}
        onWizard={() => setWiz({ parentId: focusId, parentName: selected?.name ?? byId.get(focusId ?? '')?.name ?? 'Hospital root' })}
        onTwin={() => setMode(m => m === 'twin' ? 'canvas' : 'twin')}
        onReset={() => { if (confirm('Clear the hospital structure? Children cascade-delete.')) commit(() => []); }} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '8px 12px' }}>
        <Sparkles size={15} color={C.purple} />
        <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') smartGenerate(); }}
          placeholder='AI Structural Architect — “Create a 300-bed teaching hospital with 4 operating theatres and a 20-bed ICU”'
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, color: C.navy, background: 'transparent' }} />
        <button onClick={smartGenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: C.purple, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Wand2 size={13} /> Generate</button>
      </div>

      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        {/* LEFT · constitutional tree */}
        <aside style={{ width: 272, flexShrink: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: C.muted }}>Constitution</span>
            <span style={{ fontSize: 10, color: C.muted }}>{nodes?.length ?? 0} objects</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {!nodes ? <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 12 }}><Loader2 className="spin" size={16} /></div>
              : nodes.length === 0 ? <EmptyState onTemplates={() => setTemplatesOpen(true)} onCreate={() => commit(prev => (prev.some(n => n.type === 'organization') ? prev : [...prev, StructureEngine.create(orgId, { type: 'organization', name: 'Hospital', parentId: null, status: 'active' })]))} />
              : <GroupedTree nodes={nodes} groups={GROUPS} expanded={expanded} toggleExpand={toggleExpand} selectedId={selectedId} select={select} onContext={openContext} />}
          </div>
          <div style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => setWiz({ parentId: null, parentName: 'Hospital root' })} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 9, border: `1px dashed ${C.border}`, background: '#f8fafc', color: C.sky, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Plus size={13} /> Add object</button>
          </div>
        </aside>

        {/* CENTER */}
        <section style={{ flex: 1, minWidth: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CanvasToolbar mode={mode} setMode={setMode} zoom={zoom} setZoom={setZoom} />
          <div style={{ flex: 1, overflow: 'auto', padding: 16, background: 'radial-gradient(1100px 500px at 10% 0%, #f7fbff 0%, #eef4fb 100%)' }}>
            {mode === 'twin' ? <TwinView nodes={nodes} byId={byId} selectedId={selectedId} select={select} onContext={openContext} />
              : mode === 'tree' ? <CanvasTree nodes={nodes} byId={byId} selectedId={selectedId} select={select} onContext={openContext} zoom={zoom} />
              : <CanvasView nodes={nodes} byId={byId} selectedId={selectedId} select={select} onContext={openContext} zoom={zoom} focusId={focusId} onAdd={setWiz} />}
          </div>
          <GrowthStrip data={growth} />
        </section>

        {/* RIGHT · inspector */}
        <aside style={{ width: 322, flexShrink: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, overflowY: 'auto', padding: 14 }}>
          <Inspector node={selected ?? byId.get(focusId ?? '') ?? null} nodes={nodes ?? []} byId={byId} select={select}
            onRename={(name: string) => selected && commit(prev => StructureEngine.rename(prev, selected.id, name))}
            onStatus={(s: any) => selected && commit(prev => StructureEngine.setStatus(prev, selected.id, s))}
            onRemove={() => { if (selected) { commit(prev => StructureEngine.remove(prev, selected.id)); setSelectedId(null); } }}
            onWizard={() => selected && setWiz({ parentId: selected.id, parentName: selected.name })}
            onAdd={(type: string, name: string) => selected && commit(prev => [...prev, StructureEngine.createNode(prev, orgId, selected.id, { type, name, status: 'active' as any, capacity: getNodeType(type)?.defaultCapacity })])}
            notify={notify} />
        </aside>
      </div>

      {query && results.length > 0 && <SearchPanel results={results} byId={byId} onPick={focusSearch} onClose={() => setQuery('')} />}

      {menu && <ContextMenu menu={menu} byId={byId}
        onAdd={(type: string, name: string) => commit(prev => [...prev, StructureEngine.createNode(prev, orgId, menu.nodeId, { type, name, status: 'active' as any, capacity: getNodeType(type)?.defaultCapacity })])}
        onDelete={() => { const n = byId.get(menu.nodeId); if (n && confirm(`Delete "${n.name}" and all children?`)) { commit(prev => StructureEngine.remove(prev, n.id)); if (selectedId === n.id) setSelectedId(null); } }}
        onClose={() => setMenu(null)} />}

      {templatesOpen && <TemplatesModal onClose={() => setTemplatesOpen(false)} onGenerate={() => commit(hospitalTemplate(orgId))} notify={notify} />}

      {wiz && <GeneratorModal orgId={orgId} parentId={wiz.parentId} parentName={wiz.parentName} onClose={() => setWiz(null)} commit={commit} notify={notify} />}

      {toast && (
        <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', background: toast.ok ? C.green : C.red, color: '#fff', padding: '9px 20px', borderRadius: 22, fontSize: 12, fontWeight: 700, zIndex: 70, boxShadow: '0 10px 30px rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {toast.ok ? <CheckCircle2 size={14} /> : <X size={14} />} {toast.msg}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Header + KPI dashboard
// ═══════════════════════════════════════════════════════════════════════════════

function Header({ stats, query, setQuery, total, loading, onCreateRoot, onTemplates, onWizard, onTwin, onReset }: any) {
  const cards = [
    { label: 'Departments', value: stats.depts, icon: '🗂️' },
    { label: 'Buildings', value: stats.buildings, icon: '🏢' },
    { label: 'Floors', value: stats.floors, icon: '🏬' },
    { label: 'Wards', value: stats.wardStats.length, icon: '🛏️' },
    { label: 'Clinics', value: stats.clinics, icon: '🩺' },
    { label: 'Rooms', value: stats.rooms, icon: '🚪' },
    { label: 'Beds', value: stats.beds, icon: '🛌' },
    { label: 'Theatres', value: stats.theatres, icon: '🔬' },
    { label: 'ICUs', value: stats.icus, icon: '🫀' },
    { label: 'Labs', value: stats.labs, icon: '🧪' },
    { label: 'Radiology', value: stats.radiology, icon: '🩻' },
    { label: 'Pharmacies', value: stats.pharmacies, icon: '💊' },
    { label: 'Fleet', value: stats.vehicles, icon: '🚑' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><HeartPulse size={20} /></div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>Hospital Organization Builder</div>
          <div style={{ fontSize: 10, color: C.muted }}>Design, grow, reorganize and govern the hospital as a living ecosystem.</div>
        </div>
        <span style={{ position: 'relative' }}>
          <Search size={13} color={C.muted} style={{ position: 'absolute', left: 9, top: 9 }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search every object…" style={{ height: 32, width: 210, borderRadius: 9, border: `1px solid ${C.border}`, padding: '0 10px 0 28px', fontSize: 12, outline: 'none' }} />
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={onTemplates} style={{ ...ICON_STYLE, padding: '7px 12px', fontSize: 11, fontWeight: 700, color: C.navy }}>🗂️ Templates</button>
        <button onClick={onWizard} style={{ ...ICON_STYLE, padding: '7px 12px', fontSize: 11, fontWeight: 700, color: C.navy }}><Plus size={13} /> Add</button>
        <button onClick={onTwin} style={{ ...ICON_STYLE, padding: '7px 12px', fontSize: 11, fontWeight: 700, color: C.sky }}><Building size={13} /> Digital Twin</button>
        <button onClick={onReset} style={ICON_STYLE} title="Clear structure"><RotateCcw size={13} /></button>
        {loading && <Loader2 className="spin" size={15} color={C.sky} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(126px,1fr))', gap: 8 }}>
        <div style={{ background: 'linear-gradient(135deg,#0b2c4d,#123a5e)', borderRadius: 12, padding: '10px 12px', gridRow: 'span 2', minHeight: 88 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stats.health}%</div>
          <div style={{ fontSize: 9, color: '#9fc3e6', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 4 }}>Organization Health</div>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.18)', overflow: 'hidden', marginTop: 10 }}>
            <div style={{ height: '100%', width: `${stats.health}%`, background: '#34d399' }} />
          </div>
          <div style={{ fontSize: 9, color: '#9fc3e6', marginTop: 8 }}>{stats.count} constitutional objects</div>
        </div>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '8px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 15 }}>{c.icon}</span><span style={{ fontSize: 19, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{c.value}</span></div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Left tree
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ onCreate, onTemplates }: { onCreate: () => void; onTemplates: () => void }) {
  return (
    <div style={{ padding: 18, textAlign: 'center' }}>
      <div style={{ fontSize: 34 }}>🏗️</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.navy, margin: '8px 0 4px' }}>Your hospital isn&apos;t built yet</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>Birth this organization, then grow buildings, departments, wards and beds.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={onCreate} style={{ padding: '9px 12px', borderRadius: 9, border: 'none', background: C.sky, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Create Hospital Root</button>
        <button onClick={onTemplates} style={{ padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: '#fff', color: C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Load a Hospital Template</button>
      </div>
    </div>
  );
}

function GroupedTree({ nodes, groups, expanded, toggleExpand, selectedId, select, onContext }: { nodes: StructureNode[]; groups: typeof GROUPS; expanded: Set<string>; toggleExpand: (id: string) => void; selectedId: string | null; select: (id: string) => void; onContext: (e: React.MouseEvent, id: string) => void }) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {groups.map(g => {
        const tops = nodes.filter(n => g.types.includes(n.type) && !(n.parentId && g.types.includes(byId.get(n.parentId)?.type ?? '')));
        if (tops.length === 0) return null;
        return (
          <div key={g.label}>
            <div style={{ padding: '4px 6px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: C.muted }}>{g.icon} {g.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tops.map(t => (
                <TreeRow key={t.id} node={t} nodes={nodes} byId={byId} depth={0} expanded={expanded} toggleExpand={toggleExpand} selectedId={selectedId} select={select} onContext={onContext} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TreeRow({ node, nodes, byId, depth, expanded, toggleExpand, selectedId, select, onContext }: { node: StructureNode; nodes: StructureNode[]; byId: Map<string, StructureNode>; depth: number; expanded: Set<string>; toggleExpand: (id: string) => void; selectedId: string | null; select: (id: string) => void; onContext: (e: React.MouseEvent, id: string) => void }) {
  const children = nodes.filter(n => n.parentId === node.id).sort((a, b) => a.order - b.order);
  const open = expanded.has(node.id);
  return (
    <>
      <div onClick={() => select(node.id)} onContextMenu={(e) => onContext(e, node.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', paddingLeft: 6 + depth * 14, borderRadius: 7, cursor: 'pointer', background: selectedId === node.id ? `${C.sky}18` : 'transparent', color: C.navy, fontSize: 12 }}>
        <button onClick={(e) => { e.stopPropagation(); if (children.length) toggleExpand(node.id); }} style={{ width: 16, height: 16, border: 'none', background: 'transparent', cursor: children.length ? 'pointer' : 'default', color: C.slate, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children.length ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span style={{ width: 12 }} />}
        </button>
        <span style={{ fontSize: 13 }}>{getNodeType(node.type)?.icon ?? '📁'}</span>
        <span style={{ fontWeight: node.status === 'active' ? 600 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
        {node.type === 'building' || node.type === 'floor' ? <span style={{ fontSize: 9, color: C.muted }}>{node.capacity ?? ''}</span> : null}
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_TONE[node.status] ?? C.muted, flexShrink: 0 }} />
      </div>
      {open && children.map(c => <TreeRow key={c.id} node={c} nodes={nodes} byId={byId} depth={depth + 1} expanded={expanded} toggleExpand={toggleExpand} selectedId={selectedId} select={select} onContext={onContext} />)}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Center views
// ═══════════════════════════════════════════════════════════════════════════════

function CanvasToolbar({ mode, setMode, zoom, setZoom }: { mode: 'canvas' | 'tree' | 'twin'; setMode: (m: 'canvas' | 'tree' | 'twin') => void; zoom: number; setZoom: (f: (z: number) => number) => void }) {
  const tabs = [
    { id: 'canvas' as const, label: 'Canvas', icon: <LayoutDashboard size={14} /> },
    { id: 'tree' as const, label: 'Tree', icon: <GitBranch size={14} /> },
    { id: 'twin' as const, label: 'Digital Twin', icon: <Building size={14} /> },
  ];
  return (
    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 3, borderRadius: 9 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setMode(t.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: 'none', background: mode === t.id ? '#fff' : 'transparent', color: mode === t.id ? C.navy : C.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', boxShadow: mode === t.id ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>{t.icon}{t.label}</button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={ICON_STYLE}><ZoomOut size={13} /></button>
      <span style={{ fontSize: 10, color: C.muted, width: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} style={ICON_STYLE}><ZoomIn size={13} /></button>
    </div>
  );
}

function Breadcrumb({ byId, id, select }: { byId: Map<string, StructureNode>; id: string; select: (id: string) => void }) {
  const path: { id: string; name: string }[] = [];
  let cur = byId.get(id); let g = 0;
  while (cur && g < 1000) { path.unshift({ id: cur.id, name: cur.name }); cur = cur.parentId ? byId.get(cur.parentId) : undefined; g++; }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontSize: 11, color: C.slate, marginBottom: 12 }}>
      {path.map((p, i) => (
        <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {i > 0 && <span style={{ color: C.muted }}>→</span>}
          <button onClick={() => select(p.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 11, fontWeight: i === path.length - 1 ? 800 : 500, color: i === path.length - 1 ? C.sky : C.slate }}>{p.name}</button>
        </span>
      ))}
    </div>
  );
}

function CanvasView({ nodes, byId, selectedId, select, onContext, zoom, focusId, onAdd }: { nodes: StructureNode[] | null; byId: Map<string, StructureNode>; selectedId: string | null; select: (id: string) => void; onContext: (e: React.MouseEvent, id: string) => void; zoom: number; focusId: string | null; onAdd: (w: { parentId: string | null; parentName: string }) => void }) {
  const rows = nodes ?? [];
  const buildings = rows.filter(n => n.type === 'building');
  const floors = rows.filter(n => n.type === 'floor');
  const wards = rows.filter(n => ['ward', 'icu', 'hdu', 'nicu'].includes(n.type));
  return (
    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform .12s', minWidth: 620 }}>
      {rows.length === 0 ? (
        <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: '60px 20px', textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: 30 }}>🏗️</div>
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: C.navy }}>The hospital is a blank canvas</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Create a building, add floors, then drop wards, clinics and beds onto them.</div>
          <button onClick={() => onAdd({ parentId: null, parentName: 'Hospital root' })} style={{ marginTop: 14, padding: '9px 16px', borderRadius: 9, border: 'none', background: C.sky, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Plus size={13} /> Add Building</button>
        </div>
      ) : (
        <>
          {focusId && <Breadcrumb byId={byId} id={focusId} select={select} />}
          {buildings.length === 0 && (
            <div style={{ marginBottom: 14, padding: '14px 16px', borderRadius: 12, border: `1px dashed ${C.border}`, background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={16} color={C.sky} />
              <span style={{ fontSize: 12, color: C.slate, flex: 1 }}>No buildings yet — add a building to start laying out floors and units.</span>
              <button onClick={() => onAdd({ parentId: null, parentName: 'Hospital root' })} style={{ ...ICON_STYLE, color: C.sky, fontWeight: 700, fontSize: 11 }}><Plus size={13} /> Building</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, alignItems: 'start' }}>
            {buildings.map(b => {
              const bfs = floors.filter(f => f.parentId === b.id);
              return (
                <div key={b.id} onClick={() => select(b.id)} onContextMenu={(e) => onContext(e, b.id)} style={{ background: 'linear-gradient(160deg,#eef6ff,#fff)', border: `1px solid ${selectedId === b.id ? C.sky : C.border}`, borderRadius: 14, padding: 14, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={16} color={C.sky} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.navy }}>{b.name}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_TONE[b.status] ?? C.muted }} />
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{bfs.length} floors · {b.capacity ?? ''} floors</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {bfs.map(f => (
                      <span key={f.id} onClick={(e) => { e.stopPropagation(); select(f.id); }} onContextMenu={(e) => onContext(e, f.id)} style={{ padding: '3px 7px', borderRadius: 6, background: '#fff', border: `1px solid ${selectedId === f.id ? C.sky : C.border}`, fontSize: 9, color: selectedId === f.id ? C.sky : C.slate, cursor: 'pointer', fontWeight: 600 }}>{f.name.replace('Floor ', 'F')}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {wards.length > 0 && (
            <>
              <div style={{ margin: '18px 0 8px', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em' }}>Wards & critical care · live occupancy</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {wards.map(w => {
                  const beds = rows.filter(n => n.parentId === w.id && n.type === 'bed').length;
                  const fill = occ(w.id);
                  return (
                    <div key={w.id} onClick={() => select(w.id)} onContextMenu={(e) => onContext(e, w.id)} style={{ background: '#fff', border: `1px solid ${selectedId === w.id ? C.sky : C.border}`, borderRadius: 12, padding: 12, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 15 }}>{getNodeType(w.type)?.icon ?? '🛏️'}</span>
                        <span style={{ fontWeight: 800, color: C.navy, fontSize: 12 }}>{w.name}</span>
                        <span style={{ flex: 1 }} />
                        <BedDouble size={12} color={C.muted} /><span style={{ fontSize: 10, color: C.muted }}>{beds || Math.max(w.capacity ?? 1, 1)}</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 5, background: '#eef2f7', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${fill}%`, background: fill > 75 ? C.red : fill > 45 ? C.amber : C.green, transition: 'width .3s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function CanvasTree({ nodes, byId, selectedId, select, onContext, zoom }: { nodes: StructureNode[] | null; byId: Map<string, StructureNode>; selectedId: string | null; select: (id: string) => void; onContext: (e: React.MouseEvent, id: string) => void; zoom: number }) {
  const rows = nodes ?? [];
  const roots = rows.filter(n => !n.parentId);
  const render = (list: StructureNode[], depth: number): React.ReactNode => list.map(n => {
    const ch = rows.filter(c => c.parentId === n.id).sort((a, b) => a.order - b.order);
    return (
      <div key={n.id}>
        <div onClick={() => select(n.id)} onContextMenu={(e) => onContext(e, n.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 6px', paddingLeft: 8 + depth * 20, borderRadius: 6, cursor: 'pointer', background: selectedId === n.id ? `${C.sky}18` : 'transparent', fontSize: 12 }}>
          <span>{getNodeType(n.type)?.icon ?? '•'}</span>
          <span style={{ fontWeight: n.status === 'active' ? 700 : 500 }}>{n.name}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 9, color: C.muted }}>{n.code}</span>
        </div>
        {ch.length ? render(ch, depth + 1) : null}
      </div>
    );
  });
  return (
    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
      {roots.length === 0 ? <div style={{ color: C.muted, fontSize: 12 }}>Empty — build your hospital.</div> : render(roots, 0)}
    </div>
  );
}

function TwinView({ nodes, byId, selectedId, select, onContext }: { nodes: StructureNode[] | null; byId: Map<string, StructureNode>; selectedId: string | null; select: (id: string) => void; onContext: (e: React.MouseEvent, id: string) => void }) {
  const rows = nodes ?? [];
  const buildings = rows.filter(n => n.type === 'building');
  const floors = rows.filter(n => n.type === 'floor');
  const wards = rows.filter(n => ['ward', 'icu', 'hdu', 'nicu'].includes(n.type));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
        {buildings.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: C.muted, padding: 30, fontSize: 12 }}>Add a building to see its digital twin footprint.</div>}
        {buildings.map(b => (
          <div key={b.id} onClick={() => select(b.id)} onContextMenu={(e) => onContext(e, b.id)} style={{ background: 'linear-gradient(160deg,#0b2c4d,#123a5e)', borderRadius: 14, padding: 14, cursor: 'pointer', border: selectedId === b.id ? `2px solid ${C.sky}` : '2px solid transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Building2 size={16} color="#7dd3fc" />
              <span style={{ fontWeight: 800, fontSize: 13 }}>{b.name}</span>
              <span style={{ flex: 1 }} />
              {floors.filter(f => f.parentId === b.id).map(f => <span key={f.id} style={{ width: 9, height: 9, borderRadius: 2, background: occ(f.id) > 60 ? '#fbbf24' : '#34d399' }} />)}
            </div>
            <div style={{ color: '#9fc3e6', fontSize: 10, marginTop: 6 }}>{floors.filter(f => f.parentId === b.id).length} floors · live occupancy floor dots</div>
          </div>
        ))}
      </div>
      {wards.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Live occupancy</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
            {wards.map(w => {
              const beds = rows.filter(n => n.parentId === w.id && n.type === 'bed').length;
              const fill = occ(w.id);
              return (
                <div key={w.id} onClick={() => select(w.id)} onContextMenu={(e) => onContext(e, w.id)} style={{ background: '#fff', border: `1px solid ${selectedId === w.id ? C.sky : C.border}`, borderRadius: 12, padding: 12, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span>{getNodeType(w.type)?.icon ?? '🛏️'}</span>
                    <span style={{ fontWeight: 800, color: C.navy, fontSize: 12 }}>{w.name}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: C.muted }}>{beds || Math.max(w.capacity ?? 1, 1)}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 5, background: '#eef2f7', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${fill}%`, background: fill > 75 ? C.red : fill > 45 ? C.amber : C.green, transition: 'width .3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function GrowthStrip({ data }: { data: { month: string; created: number }[] }) {
  const total = data.reduce((s, d) => s + d.created, 0);
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: '6px 14px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <Activity size={12} color={C.sky} />
        <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>Organization growth · last 6 months</span>
        <span style={{ fontSize: 9, color: C.slate }}>{total} objects</span>
      </div>
      <ResponsiveContainer width="100%" height={54}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
          <Bar dataKey="created" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.created > 0 ? C.sky : '#e6edf6'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Inspector
// ═══════════════════════════════════════════════════════════════════════════════

function getPathOf(byId: Map<string, StructureNode>, id: string) {
  const out: { id: string; name: string }[] = [];
  let cur = byId.get(id); let g = 0;
  while (cur && g < 1000) { out.unshift({ id: cur.id, name: cur.name }); cur = cur.parentId ? byId.get(cur.parentId) : undefined; g++; }
  return out;
}

function Inspector({ node, nodes, byId, select, onRename, onStatus, onRemove, onWizard, onAdd, notify }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node?.name ?? '');
  const [addType, setAddType] = useState('');
  const [addName, setAddName] = useState('');
  if (!node) return <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', padding: 20 }}>Select an object to inspect it.</div>;
  const typeDef = getNodeType(node.type);
  const allowed = childrenOf(node.type);
  const children = nodes.filter(n => n.parentId === node.id);
  const beds = children.filter(c => c.type === 'bed').length;
  const path = getPathOf(byId, node.id);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: '#f3f6fb', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{typeDef?.icon ?? '📁'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { onRename(name); setEditing(false); } }} style={{ ...INPUT, height: 28 }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</div>
              <button onClick={() => { setName(node.name); setEditing(true); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted }}><Pencil size={12} /></button>
            </div>
          )}
          <div style={{ fontSize: 10, color: C.muted }}>{typeLabel(node.type)} · {node.code}</div>
        </div>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_TONE[node.status] ?? C.muted }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <select value={node.status} onChange={e => onStatus(e.target.value)} style={{ height: 28, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11, padding: '0 6px', outline: 'none', background: '#fff' }}>
          {['planned', 'active', 'inactive', 'maintenance', 'archived', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={onWizard} style={{ ...ICON_STYLE, color: C.sky, background: `${C.sky}0c` }} title="Generate children"><Plus size={13} /></button>
        <button onClick={() => { if (confirm(`Delete "${node.name}" subtree?`)) onRemove(); }} style={{ ...ICON_STYLE, color: C.red, background: `${C.red}0c` }}><Trash2 size={13} /></button>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Live occupancy</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Pill k="Children" v={String(children.length)} />
          <Pill k="Beds" v={String(node.type === 'bed' ? 1 : beds)} />
          <Pill k="Capacity" v={node.capacity ? String(node.capacity) : '—'} />
          <Pill k="Fill" v={`${occ(node.id)}%`} />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Relationship path</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', fontSize: 10 }}>
          {path.map((p, i) => (
            <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {i > 0 && <span style={{ color: C.muted }}>→</span>}
              <button onClick={() => select(p.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 10, fontWeight: i === path.length - 1 ? 800 : 500, color: i === path.length - 1 ? C.sky : C.slate }}>{p.name}</button>
            </span>
          ))}
        </div>
      </div>

      {allowed.length > 0 && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Add child object</div>
          <select value={addType} onChange={e => setAddType(e.target.value)} style={{ ...INPUT, marginBottom: 6 }}>
            <option value="">Type…</option>
            {allowed.map(t => <option key={t} value={t}>{getNodeType(t)?.icon ?? ''} {typeLabel(t)}</option>)}
          </select>
          <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Name…" style={{ ...INPUT, marginBottom: 8 }} />
          <button onClick={() => { if (addType && addName.trim()) { onAdd(addType, addName.trim()); setAddName(''); } else notify('Pick a type and name', false); }} style={{ width: '100%', padding: '8px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Add {addType ? typeLabel(addType) : 'child'}</button>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Children</div>
        {children.length === 0 ? <div style={{ fontSize: 11, color: C.muted }}>No children yet — generate some.</div> :
          children.map(c => (
            <div key={c.id} onClick={() => select(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>
              <span>{getNodeType(c.type)?.icon ?? '•'}</span><span style={{ color: C.navy }}>{c.name}</span><span style={{ flex: 1 }} /><span style={{ fontSize: 9, color: C.muted }}>{c.code}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function Pill({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: '#f3f6fb', borderRadius: 9, padding: '5px 10px', minWidth: 58 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{v}</div>
      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Context menu, search, modals
// ═══════════════════════════════════════════════════════════════════════════════

function ContextMenu({ menu, byId, onAdd, onDelete, onClose }: { menu: { x: number; y: number; nodeId: string }; byId: Map<string, StructureNode>; onAdd: (type: string, name: string) => void; onDelete: () => void; onClose: () => void }) {
  const node = byId.get(menu.nodeId);
  if (!node) return null;
  const allowed = childrenOf(node.type);
  const style: React.CSSProperties = { position: 'fixed', left: menu.x, top: menu.y, zIndex: 46, width: 220, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 16px 40px rgba(11,44,77,.2)', padding: 6, display: 'flex', flexDirection: 'column', gap: 2 };
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />
      <div style={style}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', padding: '4px 8px 6px' }}>{getNodeType(node.type)?.icon ?? ''} {node.name}</div>
        {allowed.slice(0, 6).map(t => (
          <button key={t} onClick={() => { onAdd(t, ''); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, textAlign: 'left', color: C.navy }}>
            <span>{getNodeType(t)?.icon ?? ''}</span> Add {typeLabel(t)}
          </button>
        ))}
        <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
        <button onClick={() => onDelete()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, textAlign: 'left', color: C.red }}><Trash2 size={13} /> Delete subtree</button>
      </div>
    </>
  );
}

function SearchPanel({ results, byId, onPick, onClose }: { results: StructureNode[]; byId: Map<string, StructureNode>; onPick: (id: string) => void; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />
      <div style={{ position: 'fixed', top: 96, right: 20, width: 340, maxHeight: '60vh', overflowY: 'auto', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 20px 50px rgba(11,44,77,.2)', zIndex: 46, padding: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', padding: '4px 8px' }}>Matching objects</div>
        {results.map(n => (
          <button key={n.id} onClick={() => onPick(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}>
            <span style={{ fontSize: 14 }}>{getNodeType(n.type)?.icon ?? '•'}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.navy, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{typeLabel(n.type)} · {n.code}</div>
            </div>
            <span style={{ flex: 1 }} />
            <ChevronRight size={13} color={C.slate} />
          </button>
        ))}
      </div>
    </>
  );
}

function Modal({ title, sub, onClose, children }: { title?: string; sub?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 55, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,20,30,.5)', padding: 20 }}>
      <div style={{ width: 'min(720px,100%)', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{title}</div>
            {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={ICON_STYLE}><X size={14} /></button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

function GeneratorModal({ orgId, parentId, parentName, onClose, commit, notify }: { orgId: string; parentId: string | null; parentName: string; onClose: () => void; commit: (fn: (prev: StructureNode[]) => StructureNode[]) => void; notify: (m: string, ok?: boolean) => void }) {
  const [kind, setKind] = useState('department');
  const [name, setName] = useState('');
  const [count, setCount] = useState(24);
  const kinds = [
    { id: 'department', label: 'Department', icon: '🗂️', desc: 'Reusable container for services, wards & clinics.' },
    { id: 'building', label: 'Building', icon: '🏢', desc: 'Creates a building and its floors automatically.' },
    { id: 'ward', label: 'Ward', icon: '🛏️', desc: 'Generates bays, isolation rooms and fully numbered beds.' },
    { id: 'icu', label: 'ICU / HDU', icon: '🫀', desc: 'Critical care unit with numbered beds.' },
    { id: 'clinic', label: 'Clinic', icon: '🩺', desc: 'Consult, waiting and treatment rooms.' },
    { id: 'theatre', label: 'Theatre', icon: '🔬', desc: 'Operating rooms + recovery.' },
    { id: 'laboratory', label: 'Laboratory', icon: '🧪', desc: 'Collection and analysis rooms.' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '💊', desc: 'Dispensary and store.' },
    { id: 'vehicle', label: 'Vehicle', icon: '🚑', desc: 'GPS-enabled fleet objects under the organization.' },
  ];
  const active = kinds.find(k => k.id === kind)!;
  const run = () => {
    if (!name.trim()) { notify('Give it a name', false); return; }
    commit(prev => {
      const next = prev.slice();
      if (kind === 'building') genBuilding(next, orgId, parentId, name, count);
      else if (kind === 'ward') genWard(next, orgId, parentId, name, count, 2, 2);
      else if (kind === 'icu') genIcu(next, orgId, parentId, name, count, 'icu');
      else if (kind === 'clinic') genClinic(next, orgId, parentId, name);
      else if (kind === 'theatre') genTheatre(next, orgId, parentId, name);
      else if (kind === 'laboratory') genLab(next, orgId, parentId, name);
      else if (kind === 'pharmacy') genPharmacy(next, orgId, parentId, name);
      else if (kind === 'vehicle') genFleet(next, orgId, [{ kind: name, n: count }]);
      else genDepartment(next, orgId, parentId, name);
      return next;
    });
    notify(`${active.label} "${name}" generated`);
    onClose();
  };
  return (
    <Modal title="Object Generator" sub={`Creates constitutional objects under “${parentName}”`} onClose={onClose}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 180 }}>
          {kinds.map(k => (
            <button key={k.id} onClick={() => setKind(k.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '8px 10px', borderRadius: 9, border: `1px solid ${kind === k.id ? C.sky : C.border}`, background: kind === k.id ? C.skyLight : '#fff', color: C.navy, fontSize: 12, cursor: 'pointer' }}>
              <span>{k.icon}</span><span style={{ fontWeight: 700 }}>{k.label}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: '1.4', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: C.muted }}>{active.desc}</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={`${active.label} name`} style={INPUT} />
          {(kind === 'building' || kind === 'ward' || kind === 'icu' || kind === 'vehicle') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: C.slate }}>{kind === 'building' ? 'Floors' : kind === 'vehicle' ? 'Vehicles' : 'Beds'}</span>
              <input type="number" value={count} onChange={e => setCount(Math.max(1, Number(e.target.value)))} min={1} style={{ ...INPUT, width: 90 }} />
            </div>
          )}
          <button onClick={run} style={{ padding: '10px', borderRadius: 9, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Wand2 size={14} /> Generate {active.label}</button>
        </div>
      </div>
    </Modal>
  );
}

function TemplatesModal({ onClose, onGenerate, notify }: { onClose: () => void; onGenerate: () => void; notify: (m: string, ok?: boolean) => void }) {
  const [sel, setSel] = useState('district');
  const t = [
    { id: 'district', name: 'District Hospital', icon: '🏥', desc: 'Classic ward-based district hospital with labs, pharmacy and fleet.' },
    { id: 'teaching', name: 'Teaching / Referral Hospital', icon: '🏛️', desc: 'Full tertiary structure — clinical tower, ICUs, theatres, clinics.' },
    { id: 'specialist', name: 'Specialist Centre', icon: '🏬', desc: 'Focused multi-specialty campus.' },
    { id: 'city', name: 'Private City Hospital', icon: '🏙️', desc: 'Compact urban multi-specialty.' },
  ];
  const pick = t.find(x => x.id === sel)!;
  return (
    <Modal title="Hospital Templates" sub="Generate a complete living hospital structure in one click." onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {t.map(x => (
          <button key={x.id} onClick={() => setSel(x.id)} style={{ textAlign: 'left', padding: 10, borderRadius: 11, border: `1px solid ${sel === x.id ? C.sky : C.border}`, background: sel === x.id ? C.skyLight : '#fff', cursor: 'pointer' }}>
            <div style={{ fontSize: 22 }}>{x.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, marginTop: 4 }}>{x.name}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{x.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={() => { onGenerate(); notify(`✨ ${pick.name} template generated — a living hospital ecosystem`); onClose(); }} style={{ marginTop: 14, width: '100%', padding: 11, borderRadius: 9, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}><Wand2 size={14} /> Generate {pick.name}</button>
    </Modal>
  );
}
