'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/DoctorToolsPanel.tsx
// Doctor UI: assign tools to patients, view real-time readings, manage alerts
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  collection, doc, query, where, onSnapshot, addDoc, updateDoc, deleteDoc,
  serverTimestamp, orderBy, limit, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toolAssignmentsRef, toolReadingsRef } from '@/lib/collections';
import { TOOL_CONFIGS, TOOL_CATEGORIES, ToolAssignment, ToolReading } from '@/lib/diseaseTools';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientRecord { uid: string; name: string; email?: string; condition?: string; }

// ─── Tool Assignment Modal ────────────────────────────────────────────────────
function AssignToolModal({
  doctorId, patient, onClose,
}: { doctorId: string; patient: PatientRecord; onClose: () => void }) {
  const [selected,      setSelected]      = useState<string[]>([]);
  const [instructions,  setInstructions]  = useState<Record<string, string>>({});
  const [frequencies,   setFrequencies]   = useState<Record<string, string>>({});
  const [saving,        setSaving]        = useState(false);
  const [category,      setCategory]      = useState<string>('all');

  const tools = Object.values(TOOL_CONFIGS).filter(t => category === 'all' || t.category === category);

  const toggle = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const assign = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      for (const toolType of selected) {
        const config = TOOL_CONFIGS[toolType];
        await addDoc(collection(db, 'toolAssignments'), {
          toolType,
          patientId:   patient.uid,
          doctorId,
          assignedAt:  serverTimestamp(),
          instructions: instructions[toolType] || config.patientInstruction,
          frequency:    frequencies[toolType]   || config.frequency,
          active:       true,
        });
        // Alert the patient
        await addDoc(collection(db, 'alerts'), {
          patientId: patient.uid,
          doctorId,
          type:    'general',
          title:   `🩺 New Health Tool Assigned: ${config.name}`,
          message: `Your doctor has assigned the ${config.name} monitoring tool to your dashboard. Please log readings ${frequencies[toolType] || config.frequency.toLowerCase()}.`,
          read:    false,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:22,width:'100%',maxWidth:680,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.18)' }} onClick={e=>e.stopPropagation()}>

        <div style={{ padding:'22px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:19,fontWeight:800 }}>🩺 Assign Monitoring Tools</h3>
            <p style={{ fontSize:12,color:'#8fa3bd',marginTop:3 }}>Assigning to: <strong>{patient.name}</strong></p>
          </div>
          <button onClick={onClose} style={{ background:'#f0f4f8',border:'none',width:30,height:30,borderRadius:8,cursor:'pointer',fontSize:14 }}>✕</button>
        </div>

        <div style={{ padding:'0 22px 22px',display:'flex',flexDirection:'column',gap:14 }}>
          {/* Category filter */}
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            <button onClick={()=>setCategory('all')} style={{ padding:'5px 12px',borderRadius:99,border:'1.5px solid',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit', borderColor: category==='all'?'#0aaa76':'#e2e9f3', background: category==='all'?'#0aaa76':'#f8fafc', color: category==='all'?'#fff':'#64748b' }}>All</button>
            {Object.entries(TOOL_CATEGORIES).map(([k,v]) => (
              <button key={k} onClick={()=>setCategory(k)} style={{ padding:'5px 12px',borderRadius:99,border:'1.5px solid',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit', borderColor: category===k?v.color:'#e2e9f3', background: category===k?v.color:'#f8fafc', color: category===k?'#fff':'#64748b' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Tool list */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10 }}>
            {tools.map(tool => {
              const isSelected = selected.includes(tool.id);
              return (
                <button key={tool.id} onClick={()=>toggle(tool.id)} style={{
                  padding:'14px',borderRadius:14,border:`2px solid ${isSelected ? tool.color : '#e2e9f3'}`,
                  background: isSelected ? `${tool.color}12` : '#f8fafc',
                  cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'all .14s',
                }}>
                  <div style={{ fontSize:24,marginBottom:6 }}>{tool.icon}</div>
                  <div style={{ fontSize:13,fontWeight:700,color:'#0d1b2a' }}>{tool.name}</div>
                  <div style={{ fontSize:10,color:'#8fa3bd',marginTop:3,lineHeight:1.4 }}>{tool.frequency}</div>
                  {isSelected && <div style={{ fontSize:10,color:tool.color,fontWeight:700,marginTop:4 }}>✓ Selected</div>}
                </button>
              );
            })}
          </div>

          {/* Per-tool instructions */}
          {selected.length > 0 && (
            <div style={{ background:'#f8fafc',borderRadius:14,padding:16,display:'flex',flexDirection:'column',gap:14 }}>
              <div style={{ fontSize:12,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6 }}>Customise Instructions (optional)</div>
              {selected.map(toolId => {
                const t = TOOL_CONFIGS[toolId];
                return (
                  <div key={toolId} style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#0d1b2a' }}>{t.icon} {t.name}</div>
                    <input
                      placeholder={`Frequency (default: ${t.frequency})`}
                      value={frequencies[toolId] || ''}
                      onChange={e => setFrequencies(p => ({...p,[toolId]:e.target.value}))}
                      style={{ padding:'8px 11px',background:'#fff',border:'1.5px solid #e2e9f3',borderRadius:8,fontSize:12,fontFamily:'inherit',outline:'none',width:'100%' }}
                    />
                    <textarea
                      placeholder={`Doctor's instruction to patient (default: ${t.patientInstruction.slice(0,60)}…)`}
                      value={instructions[toolId] || ''}
                      onChange={e => setInstructions(p => ({...p,[toolId]:e.target.value}))}
                      rows={2}
                      style={{ padding:'8px 11px',background:'#fff',border:'1.5px solid #e2e9f3',borderRadius:8,fontSize:12,fontFamily:'inherit',outline:'none',width:'100%',resize:'none' }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display:'flex',gap:10 }}>
            <button onClick={onClose} style={{ flex:1,padding:'11px',background:'transparent',border:'1.5px solid #e2e9f3',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#64748b' }}>
              Cancel
            </button>
            <button onClick={assign} disabled={saving || !selected.length} style={{ flex:2,padding:'12px',background: !selected.length?'#94a3b8':'linear-gradient(135deg,#0aaa76,#06b6d4)',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor: !selected.length?'not-allowed':'pointer',fontFamily:'inherit' }}>
              {saving ? 'Assigning…' : `🩺 Assign ${selected.length} Tool${selected.length!==1?'s':''} to ${patient.name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reading Detail Modal (doctor reviews a specific reading) ─────────────────
function ReadingDetailModal({ reading, onClose, doctorId }: { reading: ToolReading; onClose: () => void; doctorId: string }) {
  const config = TOOL_CONFIGS[reading.toolType];
  const [note, setNote]       = useState(reading.doctorNote || '');
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(toolReadingsRef, reading.id), { doctorNote: note, doctorReviewed: true });
    onClose();
    setSaving(false);
  };

  const tc = reading.triage;
  const levelColor = tc?.level === 'normal' ? '#10b981' : tc?.level === 'watch' ? '#f59e0b' : tc?.level === 'video' ? '#6366f1' : tc?.level === 'clinic' ? '#f97316' : '#ef4444';

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:480,boxShadow:'0 24px 64px rgba(0,0,0,.18)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
          <h3 style={{ fontSize:16,fontWeight:800 }}>{config?.icon} {config?.name} Reading</h3>
          <button onClick={onClose} style={{ background:'#f0f4f8',border:'none',width:28,height:28,borderRadius:7,cursor:'pointer',fontSize:13 }}>✕</button>
        </div>
        <div style={{ padding:'0 20px 20px',display:'flex',flexDirection:'column',gap:12 }}>
          {tc && (
            <div style={{ borderRadius:12,padding:'12px 14px',background:`${levelColor}14`,border:`1.5px solid ${levelColor}30` }}>
              <div style={{ fontWeight:800,fontSize:14,color:levelColor }}>{tc.label}</div>
              <div style={{ fontSize:12,color:'#4a5568',marginTop:4 }}>{tc.message}</div>
            </div>
          )}
          {/* Reading data */}
          <div style={{ background:'#f8fafc',borderRadius:12,padding:'12px 14px' }}>
            <div style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,marginBottom:10 }}>Reading Values</div>
            {config?.fields.map(f => reading.data[f.key] !== undefined && (
              <div key={f.key} style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #e2e9f3',fontSize:13 }}>
                <span style={{ color:'#64748b',fontWeight:600 }}>{f.label}</span>
                <span style={{ fontWeight:800,fontFamily:'monospace' }}>{String(reading.data[f.key])} {f.unit || ''}</span>
              </div>
            ))}
            <div style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:11,color:'#8fa3bd',marginTop:4 }}>
              <span>Recorded</span>
              <span>{reading.recordedAt?.toDate ? reading.recordedAt.toDate().toLocaleString('en-KE') : '—'}</span>
            </div>
          </div>
          {/* Doctor note */}
          <div>
            <label style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>Your Note to Patient</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Leave a note for this reading (patient will see this)…"
              style={{ width:'100%',padding:'9px 12px',background:'#f8fafc',border:'1.5px solid #e2e9f3',borderRadius:9,fontSize:13,fontFamily:'inherit',outline:'none',resize:'none' }} />
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={onClose} style={{ flex:1,padding:'10px',background:'transparent',border:'1.5px solid #e2e9f3',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#64748b' }}>Close</button>
            <button onClick={save} disabled={saving} style={{ flex:2,padding:'11px',background:'linear-gradient(135deg,#0aaa76,#06b6d4)',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
              {saving ? 'Saving…' : '💾 Save & Mark Reviewed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main DoctorToolsPanel ────────────────────────────────────────────────────
export default function DoctorToolsPanel({
  doctorId,
  appointments,
}: {
  doctorId: string;
  appointments: Array<{ id: string; patientId: string; patientName?: string; specialty?: string; }>;
}) {
  const [assignments,  setAssignments]  = useState<ToolAssignment[]>([]);
  const [allReadings,  setAllReadings]  = useState<ToolReading[]>([]);
  const [showAssign,   setShowAssign]   = useState<PatientRecord | null>(null);
  const [selectedReading, setSelectedReading] = useState<ToolReading | null>(null);
  const [activePatient, setActivePatient] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [triageFilter,  setTriageFilter]  = useState<string>('all');

  // Unique patients from appointments
  const patients: PatientRecord[] = [...new Map(
    appointments.map(a => [a.patientId, { uid: a.patientId, name: a.patientName || 'Patient', condition: a.specialty }])
  ).values()];

  // Load all active assignments
  useEffect(() => {
    const unsub = onSnapshot(
      query(toolAssignmentsRef, where('doctorId', '==', doctorId), where('active', '==', true)),
      snap => setAssignments(snap.docs.map(d => d.data())),
    );
    return () => unsub();
  }, [doctorId]);

  // Load all recent readings from this doctor's patients
  useEffect(() => {
    const unsub = onSnapshot(
      query(toolReadingsRef, where('doctorId', '==', doctorId), orderBy('recordedAt', 'desc'), limit(100)),
      snap => setAllReadings(snap.docs.map(d => d.data())),
    );
    return () => unsub();
  }, [doctorId]);

  const deactivateAssignment = async (id: string) => {
    if (!confirm('Remove this monitoring tool from the patient?')) return;
    await updateDoc(doc(db, 'toolAssignments', id), { active: false });
  };

  // Filter readings
  const filteredReadings = allReadings.filter(r => {
    const matchPatient  = activePatient === 'all' || r.patientId === activePatient;
    const matchCategory = categoryFilter === 'all' || TOOL_CONFIGS[r.toolType]?.category === categoryFilter;
    const matchTriage   = triageFilter === 'all' || r.triage?.level === triageFilter;
    return matchPatient && matchCategory && matchTriage;
  });

  // Stats
  const unreviewed      = allReadings.filter(r => !r.doctorReviewed).length;
  const alertCount      = allReadings.filter(r => r.triage?.level === 'clinic' || r.triage?.level === 'hospital').length;
  const videoNeeded     = allReadings.filter(r => r.triage?.level === 'video').length;
  const totalAssigned   = assignments.length;

  const fmtDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const LEVEL_COLORS: Record<string, string> = {
    normal:   '#10b981', watch: '#f59e0b',
    video:    '#6366f1', clinic: '#f97316', hospital: '#ef4444',
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

      {/* Stats row */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
        {[
          { icon:'🩺', label:'Tools Assigned', val: totalAssigned, color:'var(--accent)' },
          { icon:'🔔', label:'Unreviewed', val: unreviewed, color:'#f59e0b' },
          { icon:'📹', label:'Video Needed', val: videoNeeded, color:'#6366f1' },
          { icon:'🚨', label:'Urgent Alerts', val: alertCount, color:'#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff',border:'1px solid #e2e9f3',borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
            <span style={{ fontSize:26 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:22,fontWeight:900,fontFamily:'monospace',color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10,color:'#8fa3bd',fontWeight:700,textTransform:'uppercase',letterSpacing:.5 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned tools management */}
      <div style={{ background:'#fff',border:'1px solid #e2e9f3',borderRadius:16,padding:'18px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
          <div style={{ fontSize:14,fontWeight:800 }}>🩺 Active Monitoring Tools</div>
          <span style={{ background:'rgba(10,170,118,.1)',color:'#0aaa76',borderRadius:99,fontSize:11,fontWeight:700,padding:'2px 8px' }}>{totalAssigned} active</span>
        </div>

        {/* Patient selector */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
  {patients.map((p) => {
    const pAssignments = assignments.filter((a) => a.patientId === p.uid);
    const patientInitial = p?.name ? p.name.charAt(0).toUpperCase() : '?';

    return (
      <div
        key={`patient-${p.uid}`}
        style={{
          display:'flex',
          alignItems:'center',
          gap:8,
          background:'#f8fafc',
          border:'1.5px solid #e2e9f3',
          borderRadius:12,
          padding:'10px 14px',
          flex:'0 0 auto'
        }}
      >
        <div
          style={{
            width:32,
            height:32,
            borderRadius:9,
            background:'linear-gradient(135deg,#0aaa76,#06b6d4)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontWeight:800,
            fontSize:14,
            color:'#fff'
          }}
        >
          {patientInitial}
        </div>

        <div>
          <div style={{ fontSize:13, fontWeight:700 }}>
            {p?.name || "Unnamed Patient"}
          </div>

          <div style={{ fontSize:10, color:'#8fa3bd' }}>
            {pAssignments.length} tool{pAssignments.length !== 1 ? 's' : ''} active
          </div>
        </div>

        <button
          onClick={() => setShowAssign(p)}
          style={{
            padding:'5px 10px',
            background:'#0aaa76',
            color:'#fff',
            border:'none',
            borderRadius:8,
            fontSize:11,
            fontWeight:700,
            cursor:'pointer',
            fontFamily:'inherit'
          }}
        >
          + Assign
        </button>
      </div>
    );
  })}

  {patients.length === 0 && (
    <div style={{ fontSize:13, color:'#8fa3bd' }}>
      No patients yet. Start by having patients book appointments.
    </div>
  )}
</div>
        {/* Assignments list */}
        {assignments.length > 0 && (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {assignments.map(a => {
              const config = TOOL_CONFIGS[a.toolType];
              const patient = patients.find(p => p.uid === a.patientId);
              const readings = allReadings.filter(r => r.assignmentId === a.id);
              const latest   = readings[0];
              const tc       = latest?.triage;
              const levelColor = LEVEL_COLORS[tc?.level || 'normal'];
              return (
                <div key={a.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'#f8fafc',borderRadius:12,border:`1.5px solid ${tc && tc.level!=='normal' ? levelColor+'50' : '#e2e9f3'}` }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <span style={{ fontSize:22 }}>{config?.icon}</span>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700 }}>{config?.name}</div>
                      <div style={{ fontSize:11,color:'#8fa3bd' }}>→ {patient?.name || a.patientId} · {readings.length} readings</div>
                      {latest && <div style={{ fontSize:11,color:levelColor,fontWeight:700,marginTop:2 }}>{tc?.label} · {fmtDate(latest.recordedAt)}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:6,alignItems:'center' }}>
                    {tc && tc.level !== 'normal' && (
                      <span style={{ fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:99,background:`${levelColor}18`,color:levelColor }}>
                        {tc.level === 'hospital' ? '🚨' : tc.level === 'clinic' ? '⚠️' : tc.level === 'video' ? '📹' : '👀'} {tc.level}
                      </span>
                    )}
                    <button onClick={()=>deactivateAssignment(a.id)} style={{ padding:'4px 8px',background:'rgba(239,68,68,.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,.2)',borderRadius:7,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time readings feed */}
      <div style={{ background:'#fff',border:'1px solid #e2e9f3',borderRadius:16,padding:'18px 20px',boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
          <div style={{ fontSize:14,fontWeight:800 }}>📡 Real-Time Patient Readings</div>
          {unreviewed > 0 && <span style={{ background:'rgba(245,158,11,.15)',color:'#f59e0b',borderRadius:99,fontSize:11,fontWeight:700,padding:'3px 10px' }}>
            {unreviewed} unreviewed
          </span>}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
  <select
    value={activePatient}
    onChange={e => setActivePatient(e.target.value)}
    style={{
      padding: '6px 10px',
      background: '#f8fafc',
      border: '1.5px solid #e2e9f3',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'inherit',
      outline: 'none'
    }}
  >
    <option value="all">All Patients</option>
    {patients.map((p, index) => (
      <option key={p.uid || index} value={p.uid}>
        {p.name}
      </option>
    ))}
  </select>

  <select
    value={categoryFilter}
    onChange={e => setCategoryFilter(e.target.value)}
    style={{
      padding: '6px 10px',
      background: '#f8fafc',
      border: '1.5px solid #e2e9f3',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'inherit',
      outline: 'none'
    }}
  >
    <option value="all">All Categories</option>
    {Object.entries(TOOL_CATEGORIES).map(([k, v], index) => (
      <option key={k + index} value={k}>
        {v.icon} {v.label}
      </option>
    ))}
  </select>

  <select
    value={triageFilter}
    onChange={e => setTriageFilter(e.target.value)}
    style={{
      padding: '6px 10px',
      background: '#f8fafc',
      border: '1.5px solid #e2e9f3',
      borderRadius: 8,
      fontSize: 12,
      fontFamily: 'inherit',
      outline: 'none'
    }}
  >
    <option value="all">All Levels</option>
    <option value="hospital">🚨 Emergency</option>
    <option value="clinic">⚠️ Urgent Clinic</option>
    <option value="video">📹 Video Needed</option>
    <option value="watch">👀 Watch</option>
    <option value="normal">✅ Normal</option>
  </select>
</div>

        {filteredReadings.length === 0 ? (
          <div style={{ textAlign:'center',color:'#8fa3bd',fontSize:13,padding:'28px 0' }}>
            <div style={{ fontSize:36,marginBottom:8 }}>📡</div>
            <p>No readings yet. Assign tools to patients to start monitoring.</p>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:8,maxHeight:480,overflowY:'auto' }}>
            {filteredReadings.map(r => {
              const config      = TOOL_CONFIGS[r.toolType];
              const patient     = patients.find(p => p.uid === r.patientId);
              const tc          = r.triage;
              const levelColor  = LEVEL_COLORS[tc?.level || 'normal'];
              const displayVal  = r.toolType === 'bp_monitor'
                ? `${r.data.systolic}/${r.data.diastolic} mmHg`
                : config?.chartFields?.[0] ? `${r.data[config.chartFields[0]]} ${config.fields.find(f=>f.key===config.chartFields![0])?.unit||''}` : '—';
              return (
                <div key={r.id} onClick={()=>setSelectedReading(r)} style={{
                  display:'flex',justifyContent:'space-between',alignItems:'center',
                  padding:'12px 14px',background: !r.doctorReviewed ? '#fffbeb' : '#f8fafc',
                  borderRadius:12,border:`1.5px solid ${!r.doctorReviewed ? '#fde68a' : '#e2e9f3'}`,
                  cursor:'pointer',transition:'all .14s',
                }}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='#0aaa76')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor= !r.doctorReviewed ? '#fde68a' : '#e2e9f3')}
                >
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:10,background:`${config?.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>
                      {config?.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700 }}>{patient?.name || r.patientId}</div>
                      <div style={{ fontSize:11,color:'#8fa3bd' }}>{config?.name} · {fmtDate(r.recordedAt)}</div>
                      {r.doctorNote && <div style={{ fontSize:10,color:'#0aaa76',marginTop:2 }}>📝 {r.doctorNote}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4 }}>
                    <div style={{ fontSize:16,fontWeight:900,fontFamily:'monospace',color:levelColor }}>{displayVal}</div>
                    {tc && <span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:`${levelColor}18`,color:levelColor }}>{tc.label}</span>}
                    {!r.doctorReviewed && <span style={{ fontSize:9,fontWeight:700,color:'#f59e0b' }}>● Unreviewed</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAssign && <AssignToolModal doctorId={doctorId} patient={showAssign} onClose={()=>setShowAssign(null)} />}
      {selectedReading && <ReadingDetailModal reading={selectedReading} doctorId={doctorId} onClose={()=>setSelectedReading(null)} />}
    </div>
  );
}