'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Builder — Engine I (Organization Structure) · the Digital COO
// Replaces the flat Structure Center with the constitutional hospital tree
// (SimCity / Bloomberg style). Registry-driven: the "Add" palette renders only
// node types the Node Registry allows beneath the focused parent — inventing a
// new type (Stroke Center, AI Command Center) never requires touching this UI.
// Pure engine + repository; all writes are optimistic with rollback.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2, ChevronRight, ChevronDown, Plus, Search, Pencil, Trash2,
  X, Archive, RotateCcw, Loader2,
} from 'lucide-react';
import { StructureEngine } from '@/lib/amexan/structure/StructureEngine';
import { FirestoreStructureRepository } from '@/lib/amexan/structure/FirestoreStructureRepository';
import { childrenOf, getNodeType, typeLabel } from '@/lib/amexan/structure/nodeTypes';
import type { StructureNode } from '@/lib/amexan/structure/types';
import { C, Card, AddBtn } from '../ui';

const ROW = 34;

const STATUS_TONE: Record<string, string> = {
  active: C.green, planned: C.amber, idle: C.slate,
  inactive: C.muted, maintenance: C.amber, archived: C.muted,
};

const STATUS_OPTIONS = ['planned', 'active', 'inactive', 'maintenance', 'archived', 'closed'] as const;

export function HospitalBuilder({ orgId }: { orgId: string }) {
  const [nodes, setNodes] = useState<StructureNode[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const repoRef = useRef(new FirestoreStructureRepository(orgId));

  const load = useCallback(async () => {
    const data = await repoRef.current.loadAll();
    setNodes(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 2600);
  };

  const commit = useCallback(async (apply: (prev: StructureNode[]) => StructureNode[]) => {
    if (!nodes) return;
    const prev = nodes;
    const next = apply(prev);
    if (next === prev) { notify('Nothing changed', false); return; }
    setNodes(next);
    try {
      await repoRef.current.save(next);
    } catch (e: any) {
      setNodes(prev);
      notify(`Save failed — ${e?.message || 'unknown'}`, false);
    }
  }, [nodes, notify]);

  const selected = useMemo(
    () => (nodes && selectedId ? StructureEngine.findById(nodes, selectedId) : null),
    [nodes, selectedId]
  );

  // Search: auto-expand ancestors of matches so results are visible.
  const filteredRows = useMemo(() => {
    if (!nodes) return [];
    const q = query.trim().toLowerCase();
    const matchIds = new Set<string>();
    if (q) {
      nodes.forEach((n) => {
        if (
          n.name.toLowerCase().includes(q) ||
          n.code.toLowerCase().includes(q) ||
          typeLabel(n.type).toLowerCase().includes(q)
        ) {
          matchIds.add(n.id);
        }
      });
    }
    const eff = new Set(expanded);
    if (q) {
      matchIds.forEach((id) => {
        let cur = nodes.find((x) => x.id === id);
        let guard = 0;
        while (cur && cur.parentId && guard < 1000) {
          eff.add(cur.id);
          cur = nodes.find((x) => x.id === cur!.parentId);
          guard++;
        }
      });
    }
    const rows = StructureEngine.flattenVisible(nodes, eff);
    return q ? rows.filter((r) => matchIds.has(r.node.id)) : rows;
  }, [nodes, expanded, query]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const winStart = Math.max(0, Math.floor(scrollTop / ROW) - 25);
  const winEnd = winStart + 60;
  const visible = filteredRows.slice(winStart, winEnd);

  const dropNode = (targetId: string) => {
    if (!draggingId || !nodes || draggingId === targetId) return;
    try {
      commit((prev) => StructureEngine.move(prev, draggingId, targetId));
      notify('Moved');
    } catch (e: any) {
      notify(e?.message ?? 'Cannot move there', false);
    }
    setDraggingId(null);
    setOverId(null);
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 150px)', minHeight: 480 }}>
      {/* ── LEFT · tree ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: 12, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} color={C.sky} /> Hospital Structure
          </div>
          <span style={{ fontSize: 10, color: C.muted }}>{nodes?.length ?? 0} nodes</span>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <Search size={13} color={C.muted} style={{ position: 'absolute', left: 8, top: 9 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tree…"
              style={{ height: 30, width: 180, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 8px 0 28px', fontSize: 12, outline: 'none' }}
            />
          </div>
          {!nodes && <Loader2 size={16} className="spin" color={C.sky} />}
        </div>

        <div
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
          style={{ flex: 1, overflowY: 'auto', padding: '8px 6px', position: 'relative' }}
        >
          {nodes && filteredRows.length === 0 && (
            <div style={{ padding: 44, fontSize: 13, color: C.muted, textAlign: 'center' }}>
              No structure yet — create the hospital root below.
            </div>
          )}
          <div style={{ position: 'relative', height: Math.max(filteredRows.length * ROW, 1) }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
              {visible.map(({ node, depth }, i) => {
                const actualIndex = winStart + i;
                const typeDef = getNodeType(node.type);
                const hasChildren = (typeDef?.children?.length ?? 0) > 0 && node.status !== 'archived';
                const open = expanded.has(node.id);
                const isSelected = node.id === selectedId;
                return (
                  <div
                    key={node.id}
                    draggable
                    onDragStart={(e) => { setDraggingId(node.id); e.dataTransfer.setData('text/plain', node.id); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={(e) => { e.preventDefault(); if (node.id !== draggingId) setOverId(node.id); }}
                    onDragLeave={() => setOverId((o) => (o === node.id ? null : o))}
                    onDrop={(e) => { e.preventDefault(); dropNode(node.id); }}
                    onClick={() => setSelectedId(node.id)}
                    style={{
                      position: 'absolute', top: actualIndex * ROW, left: 0, right: 0, height: ROW - 2,
                      display: 'flex', alignItems: 'center', paddingLeft: 10 + depth * 18, paddingRight: 10,
                      cursor: 'pointer', background: isSelected ? `${C.skyLight}99` : overId === node.id ? '#eef6ff' : 'transparent',
                      borderRadius: 8, fontSize: 12, color: C.navy, gap: 6,
                      opacity: node.status === 'archived' ? 0.45 : 1,
                      outline: overId === node.id && draggingId ? `1.5px dashed ${C.sky}` : 'none',
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(node.id); }}
                      style={{ width: 16, height: 16, border: 'none', background: 'transparent', cursor: hasChildren ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.slate, padding: 0 }}
                    >
                      {hasChildren ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span style={{ width: 13 }} />}
                    </button>
                    <span style={{ fontSize: 15 }}>{typeDef?.icon ?? '📁'}</span>
                    <span style={{ fontWeight: node.status === 'active' ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{node.name}</span>
                    {node.capacity ? <span style={{ fontSize: 10, color: C.muted }}>{node.capacity} cap</span> : null}
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: 'monospace' }}>{node.code}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_TONE[node.status] ?? C.muted }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {nodes && nodes.length === 0 && (
          <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={() => commit((prev) => [StructureEngine.create(orgId, { type: 'organization', name: 'Hospital', parentId: null, status: 'active' }), ...prev])}
              style={{ width: '100%', padding: 10, borderRadius: 10, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Create Hospital
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT · inspector ───────────────────────────────────────── */}
      <div style={{ width: 360, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflowY: 'auto', padding: 16 }}>
        {!selected ? (
          <div style={{ fontSize: 13, color: C.muted, padding: '20px 0', textAlign: 'center' }}>
            <ListTreeIcon />
            <div style={{ marginTop: 10 }}>Select a node to inspect it.</div>
          </div>
        ) : (
          <Inspector
            key={selected.id}
            node={selected}
            nodes={nodes ?? []}
            orgId={orgId}
            onRename={(name) => commit((prev) => StructureEngine.rename(prev, selected.id, name))}
            onStatus={(s) => commit((prev) => StructureEngine.setStatus(prev, selected.id, s))}
            onCapacity={(cap) => commit((prev) => StructureEngine.setCapacity(prev, selected.id, cap))}
            onRemove={() => { commit((prev) => StructureEngine.remove(prev, selected.id)); setSelectedId(null); }}
            onAddChild={(childType, name) => commit((prev) => [...prev, StructureEngine.createNode(prev, orgId, selected.id, { type: childType, name })])}
            notify={notify}
          />
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: toast.ok ? C.green : C.red, color: '#fff', padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}>{toast.msg}</div>
      )}
    </div>
  );
}

function ListTreeIcon() {
  return <div style={{ fontSize: 28, opacity: 0.4 }}>🌳</div>;
}

// ── Node Inspector ────────────────────────────────────────────────────────────

function Inspector({
  node, nodes, orgId, onRename, onStatus, onCapacity, onRemove, onAddChild, notify,
}: {
  node: StructureNode;
  nodes: StructureNode[];
  orgId: string;
  onRename: (name: string) => void;
  onStatus: (s: StructureNode['status']) => void;
  onCapacity: (c: number) => void;
  onRemove: () => void;
  onAddChild: (type: string, name: string) => void;
  notify: (m: string, ok?: boolean) => void;
}) {
  const typeDef = getNodeType(node.type);
  const allowed = childrenOf(node.type);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(node.name);
  const [addType, setAddType] = useState(allowed[0] ?? '');
  const [addName, setAddName] = useState('');
  const childCount = nodes.filter((n) => n.parentId === node.id).length;
  const path = StructureEngine.path(nodes, node.id);

  const doAdd = () => {
    if (!addType || !addName.trim()) { notify('Pick a type and name', false); return; }
    try {
      onAddChild(addType, addName.trim());
      setAddName('');
      notify(`${typeLabel(addType)} added`);
    } catch (e: any) {
      notify(e?.message ?? 'Cannot add', false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ fontSize: 30 }}>{typeDef?.icon ?? '📁'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { onRename(nameDraft); setEditingName(false); } if (e.key === 'Escape') setEditingName(false); }}
                style={{ flex: 1, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 8px', fontSize: 13, outline: 'none' }}
              />
              <button onClick={() => { onRename(nameDraft); setEditingName(false); }} style={{ border: 'none', background: C.sky, color: '#fff', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' }}><Pencil size={13} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{node.name}</div>
              <button onClick={() => { setNameDraft(node.name); setEditingName(true); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.slate }}><Pencil size={12} /></button>
            </div>
          )}
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{typeLabel(node.type)} · {node.code}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${STATUS_TONE[node.status]}22`, color: STATUS_TONE[node.status] ?? C.slate, textTransform: 'capitalize' }}>
          {node.status}
        </span>
        <select value={node.status} onChange={(e) => onStatus(e.target.value as StructureNode['status'])} style={{ height: 26, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11, padding: '0 6px', outline: 'none' }}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <button onClick={() => { if (confirm(`Delete "${node.name}" and all its children?`)) onRemove(); }} style={{ border: 'none', background: `${C.red}12`, color: C.red, borderRadius: 8, width: 28, height: 28, cursor: 'pointer' }} title="Delete subtree"><Trash2 size={13} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Children">
          <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{childCount}</div>
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            value={node.capacity ?? ''}
            placeholder="—"
            onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v)) onCapacity(v); }}
            style={{ width: '100%', height: 30, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 8px', fontSize: 13, outline: 'none' }}
          />
        </Field>
      </div>

      <Field label="Location">
        <div style={{ fontSize: 12, color: C.slate, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {path.map((p, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ color: C.muted }}>/</span>}
              <span style={{ fontWeight: i === path.length - 1 ? 700 : 400 }}>{p}</span>
            </span>
          ))}
        </div>
      </Field>

      {allowed.length > 0 && (
        <Card title={`Add ${typeLabel(node.type)} child`} subtitle="Registry-driven — only constitutional types appear.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select value={addType} onChange={(e) => setAddType(e.target.value)} style={{ height: 32, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, padding: '0 8px', outline: 'none' }}>
              {allowed.map((t) => (
                <option key={t} value={t}>
                  {getNodeType(t)?.icon ?? ''} {typeLabel(t)}
                </option>
              ))}
            </select>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doAdd(); }}
              placeholder={`${typeLabel(addType || allowed[0] || 'child')} name…`}
              style={{ height: 32, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none' }}
            />
            <AddBtn label={`+ Add ${typeLabel(addType || allowed[0] || '')}`} onClick={doAdd} />
          </div>
        </Card>
      )}

      <Card title="Node identity" subtitle="Stable constitutional fields (future engines hook in here).">
        <KV k="id" v={node.id} />
        <KV k="organizationId" v={node.organizationId} />
        <KV k="created" v={new Date(node.createdAt).toLocaleString()} />
        <KV k="updated" v={new Date(node.updatedAt).toLocaleString()} />
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
      <span style={{ color: C.muted }}>{k}</span>
      <span style={{ color: C.navy, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
    </div>
  );
}
