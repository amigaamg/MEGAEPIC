'use client';

import React, { useState, useMemo } from 'react';
import {
  collection, addDoc, serverTimestamp, doc, updateDoc, getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ALL_PATHWAYS, DEPARTMENTS, ALL_TOOLS,
  getPathwayById, fmtDate,
  type PathwayDef, type ToolDef, type DepartmentDef,
} from '@/components/doctor/panels/DepartmentDefinitions';

interface EnrolledPatient {
  id: string; patientId: string; patientName: string; pathwayId: string;
  currentMilestone: number; startDate: any; status: string;
  docketId?: string; docketName?: string;
  riskLevel?: string; age?: number; sex?: string;
}

interface Props {
  allPathways: PathwayDef[];
  enrolledPatients: EnrolledPatient[];
  doctorId: string;
  doctorName: string;
  onBack: () => void;
}

type ToolsView = 'browse' | 'assign' | 'demo';

export default function FullPageToolsWorkshop({
  allPathways, enrolledPatients, doctorId, doctorName, onBack,
}: Props) {
  const [viewMode, setViewMode] = useState<ToolsView>('browse');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toolSearch, setToolSearch] = useState('');

  // Assign flow
  const [selectedTool, setSelectedTool] = useState<ToolDef | null>(null);
  const [assignPatientSearch, setAssignPatientSearch] = useState('');
  const [assignPatient, setAssignPatient] = useState<string>('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Demo flow
  const [demoTool, setDemoTool] = useState<ToolDef | null>(null);

  // Collect all unique tools
  const allTools = useMemo(() => {
    const seen = new Set<string>();
    return allPathways.flatMap(p => p.tools.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    }));
  }, [allPathways]);

  const toolTypes = ['all', ...new Set(allTools.map(t => t.type))];

  const filteredTools = allTools.filter(t => {
    if (selectedDepartment !== 'all') {
      const deptPathways = allPathways.filter(p => p.departmentId === selectedDepartment);
      const hasPathway = deptPathways.some(p => p.tools.some(pt => pt.id === t.id));
      if (!hasPathway) return false;
    }
    if (selectedCategory !== 'all' && t.type !== selectedCategory) return false;
    if (toolSearch && !t.label.toLowerCase().includes(toolSearch.toLowerCase()) && !t.description?.toLowerCase().includes(toolSearch.toLowerCase())) return false;
    return true;
  });

  const departmentToolCounts = useMemo(() => {
    const counts = new Map<string, number>();
    DEPARTMENTS.forEach(d => {
      const deptTools = new Set(allPathways
        .filter(p => p.departmentId === d.id)
        .flatMap(p => p.tools.map(t => t.id))
      );
      counts.set(d.id, deptTools.size);
    });
    return counts;
  }, [allPathways]);

  // Available patients for tool assignment
  const filteredPatients = enrolledPatients.filter(ep =>
    ep.status === 'active' &&
    (!assignPatientSearch || ep.patientName.toLowerCase().includes(assignPatientSearch.toLowerCase()))
  );
  const uniquePatients = useMemo(() => {
    const seen = new Set<string>();
    return filteredPatients.filter(ep => {
      if (seen.has(ep.patientId)) return false;
      seen.add(ep.patientId);
      return true;
    });
  }, [filteredPatients]);

  // Assign tool to patient
  const assignTool = async () => {
    if (!selectedTool || !assignPatient) return;
    setAssigning(true);
    try {
      await addDoc(collection(db, 'toolAssignments'), {
        patientId: assignPatient,
        toolId: selectedTool.id,
        toolName: selectedTool.label,
        toolType: selectedTool.type,
        toolIcon: selectedTool.icon,
        doctorId, doctorName,
        assignedAt: serverTimestamp(),
        status: 'active',
        notes: assignNote,
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId: assignPatient,
        type: 'tool_assigned',
        title: `Tool assigned: ${selectedTool.label}`,
        description: assignNote || `Dr. ${doctorName} assigned ${selectedTool.label}`,
        icon: selectedTool.icon,
        doctorId, doctorName,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: assignPatient, doctorId, doctorName,
        title: `🛠️ New Tool: ${selectedTool.label}`,
        message: `Dr. ${doctorName} has assigned you "${selectedTool.label}" — ${selectedTool.description || 'Check your dashboard to start using it.'}`,
        type: 'clinical', read: false, createdAt: serverTimestamp(),
      });
      setAssignPatient('');
      setAssignNote('');
      setSelectedTool(null);
      setViewMode('browse');
    } catch (e) { console.error(e); }
    setAssigning(false);
  };

  // Get tool pathway info
  const getToolPathways = (toolId: string): PathwayDef[] => {
    return allPathways.filter(p => p.tools.some(t => t.id === toolId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeUp .25s ease' }}>

      {/* ── HEADER ── */}
      <div style={{
        flexShrink: 0, background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: 'var(--bg)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
          }}>←</button>
          <span style={{ fontSize: 17, fontWeight: 800 }}>
            {viewMode === 'browse' ? '🛠️ Clinical Tools Workshop' :
             viewMode === 'assign' ? '📋 Assign Tool to Patient' :
             '👁️ Demo View'}
          </span>
          <span style={{
            background: 'rgba(15,118,110,.08)', color: '#0F766E',
            borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px',
          }}>{allTools.length} tools</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {viewMode !== 'browse' && (
            <button onClick={() => { setViewMode('browse'); setSelectedTool(null); setDemoTool(null); }} style={{
              padding: '7px 14px', background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
            }}>← Back to Browse</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: 'var(--bg)' }}>

        {/* ═══ BROWSE VIEW ═══ */}
        {viewMode === 'browse' && (
          <>
            {/* Left: Department sidebar */}
            <div style={{
              width: 230, flexShrink: 0, overflowY: 'auto',
              borderRight: '1px solid var(--border)',
              background: 'var(--white)', padding: '12px 0',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--muted)', padding: '0 14px', marginBottom: 8 }}>
                Departments
              </div>
              <button onClick={() => setSelectedDepartment('all')} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                width: '100%', border: 'none', background: selectedDepartment === 'all' ? 'rgba(15,118,110,.06)' : 'transparent',
                fontSize: 13, fontWeight: selectedDepartment === 'all' ? 700 : 500,
                color: selectedDepartment === 'all' ? '#0F766E' : 'var(--text)',
                cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
              }}>
                <span>📊</span>
                <span style={{ flex: 1 }}>All Tools</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{allTools.length}</span>
              </button>
              <div style={{ height: 1, background: 'var(--border)', margin: '6px 12px' }} />
              {DEPARTMENTS.filter(d => (departmentToolCounts.get(d.id) || 0) > 0).map(d => (
                <button key={d.id} onClick={() => setSelectedDepartment(d.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  width: '100%', border: 'none', background: selectedDepartment === d.id ? d.colorDim : 'transparent',
                  fontSize: 13, fontWeight: selectedDepartment === d.id ? 700 : 500,
                  color: selectedDepartment === d.id ? d.color : 'var(--text)',
                  cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
                }}>
                  <span>{d.icon}</span>
                  <span style={{ flex: 1 }}>{d.label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: selectedDepartment === d.id ? d.color : 'var(--muted)',
                    background: selectedDepartment === d.id ? d.colorDim : 'transparent',
                    borderRadius: 99, padding: '1px 7px',
                  }}>{departmentToolCounts.get(d.id)}</span>
                </button>
              ))}
            </div>

            {/* Right: Tools grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
              {/* Search & filter bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)' }}>🔍</span>
                  <input value={toolSearch} onChange={e => setToolSearch(e.target.value)}
                    placeholder="Search tools by name or description…"
                    style={{ width: '100%', paddingLeft: 32, background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '8px 12px 8px 32px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}
                  />
                </div>
                {toolTypes.map(type => (
                  <button key={type} onClick={() => setSelectedCategory(selectedCategory === type ? 'all' : type)} style={{
                    padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)',
                    background: selectedCategory === type ? '#0F766E' : 'var(--white)',
                    color: selectedCategory === type ? '#fff' : 'var(--muted)',
                    border: selectedCategory !== type ? '1.5px solid var(--border)' : '1.5px solid #0F766E',
                  }}>{type === 'all' ? '📋 All' : type}</button>
                ))}
              </div>

              {filteredTools.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>No tools match your filters</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting the search or department filter.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                  {filteredTools.map(tool => {
                    const pathways = getToolPathways(tool.id);
                    const pwColor = pathways[0]?.color || '#0F766E';
                    const pwColorDim = pathways[0]?.colorDim || 'rgba(15,118,110,.06)';
                    const patientCount = enrolledPatients.filter(ep =>
                      pathways.some(p => p.id === ep.pathwayId)
                    ).length;

                    return (
                      <div key={tool.id} style={{
                        background: 'var(--white)', border: '1.5px solid var(--border)',
                        borderRadius: 14, padding: 16, transition: 'all .15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = pwColor; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ fontSize: 28 }}>{tool.icon}</div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, background: pwColorDim, color: pwColor,
                            borderRadius: 99, padding: '2px 8px', textTransform: 'uppercase',
                          }}>{tool.type}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{tool.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>
                          {tool.description || 'Clinical tool for patient care'}
                        </div>
                        {pathways.length > 0 && (
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
                            {pathways.slice(0, 3).map(p => (
                              <span key={p.id} style={{ fontSize: 9, fontWeight: 700, color: p.color, background: p.colorDim, borderRadius: 99, padding: '1px 6px' }}>
                                {p.icon} {p.label}
                              </span>
                            ))}
                            {pathways.length > 3 && <span style={{ fontSize: 9, color: 'var(--muted)' }}>+{pathways.length - 3}</span>}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                          <button onClick={() => { setSelectedTool(tool); setDemoTool(tool); setViewMode('demo'); }} style={{
                            flex: 1, padding: '6px 10px', background: pwColorDim, color: pwColor,
                            border: `1px solid ${pwColor}40`, borderRadius: 8,
                            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                          }}>👁️ Demo</button>
                          <button onClick={() => { setSelectedTool(tool); setViewMode('assign'); }} style={{
                            flex: 1, padding: '6px 10px', background: pwColor, color: '#fff',
                            border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                          }}>📋 Assign</button>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                          {patientCount} patients in related pathways
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ ASSIGN VIEW ═══ */}
        {viewMode === 'assign' && selectedTool && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{selectedTool.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedTool.label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{selectedTool.description}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, background: 'var(--bg)', color: 'var(--muted)',
                  borderRadius: 99, padding: '2px 10px', marginTop: 8, display: 'inline-block',
                  textTransform: 'uppercase',
                }}>{selectedTool.type}</span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Assign to Patient</div>
              <input value={assignPatientSearch} onChange={e => setAssignPatientSearch(e.target.value)}
                placeholder="Search active patients…"
                style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', marginBottom: 10 }}
              />
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {uniquePatients.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, padding: 8 }}>No active patients found.</div>}
                {uniquePatients.map(ep => (
                  <button key={ep.patientId + ep.pathwayId} onClick={() => setAssignPatient(ep.patientId)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: assignPatient === ep.patientId ? 'rgba(15,118,110,.06)' : 'var(--white)',
                    border: `1.5px solid ${assignPatient === ep.patientId ? '#0F766E' : 'var(--border)'}`,
                    borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', width: '100%',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#5a67d8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{ep.patientName[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{ep.patientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ep.sex && `${ep.sex} · `}{ep.age && `${ep.age}yrs`}</div>
                    </div>
                  </button>
                ))}
              </div>

              <textarea value={assignNote} onChange={e => setAssignNote(e.target.value)} rows={2}
                placeholder="Optional note for the patient about this tool…"
                style={{ width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', marginBottom: 12 }}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setViewMode('browse')} style={{
                  flex: 1, background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px', fontSize: 13, color: 'var(--muted)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Cancel</button>
                <button onClick={assignTool} disabled={assigning || !assignPatient} style={{
                  flex: 2, background: '#0F766E', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>{assigning ? 'Assigning…' : '✅ Assign to Patient'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ DEMO VIEW ═══ */}
        {viewMode === 'demo' && demoTool && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {/* Demo header */}
              <div style={{
                background: 'linear-gradient(135deg, #0F766E, #06b6d4)',
                borderRadius: 16, padding: '24px 28px', color: '#fff', marginBottom: 16,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{demoTool.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{demoTool.label}</div>
                <div style={{ fontSize: 14, opacity: .85, marginTop: 4 }}>{demoTool.description}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{demoTool.type}</span>
                  <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>Demo Mode</span>
                </div>
              </div>

              {/* Tool preview */}
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 20, marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>📋 Tool Preview</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'Tool ID', val: demoTool.id },
                    { label: 'Category', val: demoTool.type },
                    { label: 'Open Mode', val: demoTool.opensIn || 'panel' },
                    { label: 'Assigned Patients', val: enrolledPatients.filter(ep => {
                      const pw = getToolPathways(demoTool.id);
                      return pw.some(p => p.id === ep.pathwayId);
                    }).length },
                  ].map(r => (
                    <div key={r.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>{r.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{r.val}</div>
                    </div>
                  ))}
                </div>

                {/* Related pathways */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>Used in Pathways:</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {getToolPathways(demoTool.id).map(p => (
                      <span key={p.id} style={{
                        background: p.colorDim, color: p.color,
                        borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                      }}>{p.icon} {p.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo instructions */}
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 20, marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>📖 How to Use This Tool</div>
                <ol style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                  <li><strong>Activate:</strong> Assign this tool to a patient via the "Assign" button above.</li>
                  <li><strong>Patient view:</strong> The patient sees the tool on their health dashboard and mobile app.</li>
                  <li><strong>Monitoring:</strong> Track patient progress through the Pathway Monitoring tab.</li>
                  <li><strong>Review:</strong> Check tool readings in the patient's monitoring section during follow-up.</li>
                </ol>
              </div>

              {/* Demo simulated UI for select tools */}
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 20, marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>🖥️ Live Tool Simulation</div>
                {demoTool.type === 'tracker' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, marginBottom: 10 }}>
                      {[45, 62, 58, 73, 81, 68, 77, 85, 72, 90, 84, 78].map((v, i) => (
                        <div key={i} style={{
                          flex: 1, borderRadius: '4px 4px 0 0', minWidth: 8,
                          height: `${v}%`, background: `hsl(${120 - v * 1.2}, 60%, 50%)`,
                          opacity: .7 + (i / 12) * .3,
                        }} title={`Value: ${v}`} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>Simulated tracking data over 12 periods</div>
                  </div>
                )}
                {demoTool.type === 'calculator' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🧮</div>
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>Interactive calculator with input fields for clinical values</div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
                      {['Value 1', 'Value 2', 'Value 3'].map(v => (
                        <div key={v} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{v}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>—</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {demoTool.type === 'assessment' && (
                  <div style={{ padding: '10px 0' }}>
                    {['Question 1: Describe the symptom?', 'Question 2: How severe is it?', 'Question 3: Duration?'].map((q, i) => (
                      <div key={i} style={{ marginBottom: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{q}</div>
                        <div style={{ height: 28, background: 'var(--white)', borderRadius: 6, marginTop: 4, border: '1px solid var(--border)' }} />
                      </div>
                    ))}
                  </div>
                )}
                {demoTool.type === 'protocol' && (
                  <div>
                    {['Step 1: Initial assessment', 'Step 2: Start treatment', 'Step 3: Review in 4 weeks', 'Step 4: Adjust therapy', 'Step 5: Maintenance'].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0F766E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                        <span style={{ fontSize: 13 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
                {demoTool.type === 'order' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🧪</div>
                    <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>Order {demoTool.label.replace('Order ', '').replace('Request ', '')} for a patient</div>
                    <button style={{ background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✓ Simulate Order</button>
                  </div>
                )}
                {demoTool.type === 'education' && (
                  <div style={{ padding: '10px 0' }}>
                    <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>📚</div>
                    <div style={{ fontSize: 14, color: 'var(--text)', textAlign: 'center', marginBottom: 12 }}>Patient education material preview</div>
                    <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Key Points for the Patient:</div>
                      <ul style={{ fontSize: 13, paddingLeft: 16, lineHeight: 1.8 }}>
                        <li>Understanding your condition</li>
                        <li>When and how to take medications</li>
                        <li>Warning signs to watch for</li>
                        <li>When to call your doctor</li>
                      </ul>
                    </div>
                  </div>
                )}
                {demoTool.type === 'screening' && (
                  <div style={{ padding: '10px 0' }}>
                    {['✓ No symptoms', '✗ Has symptom: fever', '✓ No cough', '✗ Shortness of breath'].map((s, i) => (
                      <div key={i} style={{ padding: '6px 10px', fontSize: 13, color: s.startsWith('✓') ? '#38a169' : '#e53e3e', background: 'var(--bg)', borderRadius: 6, marginBottom: 4 }}>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
                {demoTool.type === 'score' && (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: '#0F766E' }}>7/10</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Simulated score result</div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setDemoTool(null); setViewMode('browse'); }} style={{
                  flex: 1, background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px', fontSize: 13, color: 'var(--muted)',
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>← Back to Browse</button>
                <button onClick={() => { setViewMode('assign'); }} style={{
                  flex: 2, background: '#0F766E', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                }}>📋 Assign This Tool</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
