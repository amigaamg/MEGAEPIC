'use client';
// ═══════════════════════════════════════════════════════════════════════════
// components/PatientVisitSummary.tsx  v3
// LAYOUT:  Doctor card → expand → visits list → expand → full visit detail
// One doctor = one card. Patient sees "My Doctors" cleanly.
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import {
  collection, query, where, onSnapshot, orderBy,
  getDocs, updateDoc, addDoc, doc, serverTimestamp, limit,
} from 'firebase/firestore';
import { ref as sRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDT = (ts) => {
  if (!ts) return '—';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-KE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
};
const fmtDateOnly = (ts) => {
  if (!ts) return '—';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-KE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
};
const daysSince = (ts) => {
  if (!ts) return null;
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  } catch { return null; }
};

const TOOLS = {
  bp_monitor:      { label: 'Blood Pressure', icon: '🫀', unit: 'mmHg',     color: '#dc2626' },
  glucose_log:     { label: 'Blood Glucose',  icon: '🩸', unit: 'mmol/L',   color: '#d97706' },
  weight_log:      { label: 'Weight',         icon: '⚖️', unit: 'kg',       color: '#7c3aed' },
  peak_flow:       { label: 'Peak Flow',      icon: '💨', unit: 'L/min',    color: '#0ea5e9' },
  pain_diary:      { label: 'Pain Score',     icon: '😣', unit: '/10',      color: '#f97316' },
  mood_tracker:    { label: 'Mood',           icon: '🧠', unit: '/10',      color: '#8b5cf6' },
  kick_count:      { label: 'Fetal Kicks',    icon: '👶', unit: 'kicks/2hr',color: '#ec4899' },
  contraction_log: { label: 'Contractions',   icon: '⏱️', unit: 'min apart',color: '#ef4444' },
  o2_sat_log:      { label: 'SpO₂',           icon: '🫁', unit: '%',        color: '#3b82f6' },
  temp_log:        { label: 'Temperature',    icon: '🌡️', unit: '°C',       color: '#f59e0b' },
  urine_output:    { label: 'Urine Output',   icon: '💧', unit: 'mL/hr',    color: '#06b6d4' },
  custom:          { label: 'Custom',          icon: '📊', unit: '',         color: '#6366f1' },
};

const VT_CFG = {
  new_patient: { icon: '🆕', color: '#059669', label: 'New Patient' },
  follow_up:   { icon: '🔄', color: '#3b82f6', label: 'Follow-Up' },
  emergency:   { icon: '🚨', color: '#dc2626', label: 'Emergency' },
  teleconsult: { icon: '📹', color: '#7c3aed', label: 'Teleconsult' },
  review:      { icon: '📋', color: '#d97706', label: 'Review' },
};

// Doctor avatar colour from name
const drHue = (name = '') => (name.charCodeAt(0) * 7) % 360;

// ─── SPARKLINE ───────────────────────────────────────────────────────────────
function Spark({ readings, color = '#00e5cc', unit = '' }) {
  if (!readings?.length || readings.length < 2) return (
    <span style={{ fontSize: 11, color: '#546382' }}>No readings yet</span>
  );
  const vals = readings.map(r => Number(r.value));
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
  const W = 200, H = 48;
  const pts = readings.map((r, i) => ({
    x: (i / (readings.length - 1)) * W,
    y: H - ((Number(r.value) - mn) / rng) * (H - 12) - 4,
    v: r.value,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${W},${H} L0,${H} Z`;
  const id = `sg${color.replace(/[^a-z0-9]/gi, '')}${Math.random().toString(36).slice(2, 5)}`;
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4 : 2.5} fill={color} stroke="#111827" strokeWidth={1.5} />
          {i === pts.length - 1 && (
            <text x={p.x} y={p.y - 7} fontSize={9} fill={color} textAnchor="middle" fontWeight="700">{p.v}{unit}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── VITAL CHIP ──────────────────────────────────────────────────────────────
function VChip({ icon, label, val, unit, flag }) {
  const col = flag === 'critical' ? '#dc2626' : flag === 'high' ? '#d97706' : '#00e5cc';
  return (
    <div style={{ background: `${col}08`, border: `1.5px solid ${col}28`, borderRadius: 10, padding: '9px 12px', textAlign: 'center', minWidth: 74 }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: col, fontFamily: 'var(--mono, monospace)', lineHeight: 1.1 }}>{val}</div>
      {unit && <div style={{ fontSize: 8, color: '#546382', marginTop: 1 }}>{unit}</div>}
      <div style={{ fontSize: 9, fontWeight: 700, color: '#546382', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────
function Sec({ icon, title, count, accent = 'var(--accent, #00e5cc)', children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 5, borderBottom: `1px solid rgba(255,255,255,.04)` }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '.8px' }}>{title}</span>
        {count !== undefined && (
          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: `${accent}18`, color: accent, fontWeight: 700 }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── UPLOAD BUTTON ────────────────────────────────────────────────────────────
function UploadBtn({ itemId, type, patientId, doctorId, testName }) {
  const [pct, setPct] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const go = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPct(0);
    const path = `results/${patientId}/${type}/${itemId || Date.now()}/${Date.now()}_${file.name}`;
    const task = uploadBytesResumable(sRef(storage, path), file);
    task.on('state_changed',
      s => setPct(Math.round(s.bytesTransferred / s.totalBytes * 100)),
      () => setPct(null),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        if (itemId) {
          const col = type === 'lab' ? 'labOrders' : 'imagingOrders';
          const fields = type === 'lab'
            ? { patientUploadedResult: true, resultUrl: url, resultUploadedAt: serverTimestamp(), status: 'resulted' }
            : { patientUploadedReport: true, reportUrl: url, reportUploadedAt: serverTimestamp(), status: 'reported' };
          await updateDoc(doc(db, col, itemId), fields).catch(() => {});
        }
        if (doctorId) {
          await addDoc(collection(db, 'doctorNotifications'), {
            doctorId, patientId, type: 'result_uploaded',
            title: `📋 Result uploaded`,
            message: `Patient uploaded ${type === 'lab' ? 'lab result' : 'imaging report'} for ${testName}`,
            severity: 'info', read: false, createdAt: serverTimestamp(),
          }).catch(() => {});
        }
        setPct(null); setDone(true);
      }
    );
  };

  if (done) return <span style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>✅ Uploaded · Awaiting doctor review</span>;
  if (pct !== null) return (
    <div style={{ fontSize: 11, color: 'var(--accent, #00e5cc)' }}>
      Uploading {pct}%
      <div style={{ background: 'var(--border, #243047)', borderRadius: 99, height: 3, marginTop: 3 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent, #00e5cc)', borderRadius: 99, transition: 'width .3s' }} />
      </div>
    </div>
  );
  return (
    <>
      <button onClick={() => fileRef.current?.click()} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, background: 'rgba(0,229,204,.08)', border: '1px solid rgba(0,229,204,.25)', color: 'var(--accent, #00e5cc)', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontWeight: 700 }}>
        📤 Upload Result
      </button>
      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={go} />
    </>
  );
}

// ─── PDF PRINT ────────────────────────────────────────────────────────────────
function printPDF(note, patientName = 'Patient') {
  const w = window.open('', '_blank'); if (!w) return;
  const ref = `VS-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const vitBox = (note.vitals && Object.values(note.vitals).some(v => v !== undefined)) ? `
    <div class="sec"><div class="sec-t">VITAL SIGNS</div><div class="vs">
    ${note.vitals.bp ? `<div class="vb"><div class="vv">${note.vitals.bp}</div><div class="vu">mmHg</div><div class="vl">BP</div></div>` : ''}
    ${note.vitals.hr !== undefined ? `<div class="vb"><div class="vv">${note.vitals.hr}</div><div class="vu">bpm</div><div class="vl">HR</div></div>` : ''}
    ${note.vitals.temp !== undefined ? `<div class="vb ${note.vitals.temp >= 38.5 ? 'warn' : ''}"><div class="vv">${note.vitals.temp}</div><div class="vu">°C</div><div class="vl">Temp</div></div>` : ''}
    ${note.vitals.spo2 !== undefined ? `<div class="vb ${note.vitals.spo2 < 92 ? 'crit' : ''}"><div class="vv">${note.vitals.spo2}%</div><div class="vl">SpO₂</div></div>` : ''}
    ${note.vitals.weight !== undefined ? `<div class="vb"><div class="vv">${note.vitals.weight}</div><div class="vu">kg</div><div class="vl">Wt</div></div>` : ''}
    ${note.vitals.bmi !== undefined ? `<div class="vb"><div class="vv">${note.vitals.bmi}</div><div class="vl">BMI</div></div>` : ''}
    ${note.vitals.pain !== undefined ? `<div class="vb ${note.vitals.pain >= 7 ? 'crit' : ''}"><div class="vv">${note.vitals.pain}/10</div><div class="vl">Pain</div></div>` : ''}
    ${note.vitals.fbs !== undefined ? `<div class="vb ${note.vitals.fbs >= 7 ? 'warn' : ''}"><div class="vv">${note.vitals.fbs}</div><div class="vu">mmol/L</div><div class="vl">FBS</div></div>` : ''}
    </div></div>` : '';
  const dxHtml = (note.diagnoses || []).filter(d => d.description).map(dx =>
    `<div class="dx"><span class="b ${dx.type === 'primary' ? 'bgrn' : 'bgrey'}">${dx.type}</span>${dx.code ? `<span class="b bmono">${dx.code}</span>` : ''} <strong>${dx.description}</strong> <span class="b ${dx.status === 'active' ? 'bred' : 'bgrey'}">${dx.status}</span></div>`).join('');
  const rxHtml = (note.prescriptions || []).map(rx =>
    `<div class="drug"><strong>${rx.medication}</strong> — ${rx.dosage} · ${rx.frequency} · ${rx.duration} · ${(rx.route || '').toUpperCase()}${rx.instructions ? ` <em>| ${rx.instructions}</em>` : ''}</div>`).join('');
  const labHtml = (note.labOrders || []).map(l =>
    `<div><span class="b">${(l.urgency || '').toUpperCase()}</span> ${l.test} — ${l.status}${l.resultValue ? ` <strong>${l.resultValue} ${l.unit || ''}</strong>` : ''}${l.flag && l.flag !== 'normal' ? ` <strong style="color:#dc2626">[${l.flag.toUpperCase()}]</strong>` : ''}</div>`).join('');
  const imgHtml = (note.imagingOrders || []).map(i =>
    `<div><span class="b bpurp">${i.modality}</span> ${i.study}${i.bodyPart ? ` (${i.bodyPart})` : ''} — ${i.status}${i.impression ? `<div style="padding-left:10px;font-size:9pt;color:#5a6b8c;font-style:italic">Impression: ${i.impression}</div>` : ''}</div>`).join('');
  const fuHtml = (note.followUps || []).map(fu =>
    `<div>${fu.date}${fu.time ? ` at ${fu.time}` : ''} — ${(fu.type || '').replace(/_/g, ' ')} — ${fu.reason} (${fu.status})</div>`).join('');
  const refHtml = (note.referrals || []).map(r =>
    `<div>→ <strong>${r.toSpecialty}</strong>${r.toFacility ? ` @ ${r.toFacility}` : ''}: ${r.reason}</div>`).join('');

  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Visit Summary</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;font-size:10.5pt;color:#0d1440;padding:28px 34px;line-height:1.6}
.lh{display:flex;justify-content:space-between;border-bottom:3px solid #0d1440;padding-bottom:14px;margin-bottom:18px}
.lh h1{font-size:19pt;font-weight:700}
.hg{display:grid;grid-template-columns:1fr 1fr;gap:18px;border:1.5px solid #c5d2e8;border-radius:6px;padding:13px;margin-bottom:14px}
.lb{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a6b8c;display:block;margin-bottom:2px;margin-top:5px}
.sec{margin-bottom:12px;padding-left:12px;border-left:3px solid #4f63dc}
.sec-t{font-size:7.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#4f63dc;margin-bottom:5px}
.vs{display:flex;gap:7px;flex-wrap:wrap;margin-top:5px}
.vb{border:1px solid #c5d2e8;border-radius:5px;padding:5px 9px;text-align:center;min-width:62px}
.vb.warn{border-color:#d97706;background:#fffbeb}.vb.crit{border-color:#dc2626;background:#fef2f2}
.vv{font-family:monospace;font-size:13pt;font-weight:700}.vu{font-size:7pt;color:#5a6b8c}.vl{font-size:7.5pt;color:#5a6b8c}
.dx{display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid #f0f0f0;flex-wrap:wrap}
.b{display:inline-block;font-size:7.5pt;padding:1px 7px;border:1px solid #aaa;border-radius:99px;margin-right:3px;font-weight:600;white-space:nowrap}
.bgrn{border-color:#059669;color:#065f46;background:#ecfdf5}.bred{border-color:#dc2626;color:#991b1b;background:#fef2f2}
.bgrey{border-color:#94a3b8;color:#475569}.bmono{font-family:monospace;font-size:7pt;border-color:#94a3b8;color:#475569}
.bpurp{border-color:#7c3aed;color:#5b21b6;background:#ede9fe}
.drug{background:#f8faff;border-left:3px solid #4f63dc;padding:5px 10px;margin-bottom:4px;border-radius:0 4px 4px 0}
.plan{background:#f0f5ff;border-left:3px solid #4f63dc;padding:9px 12px;white-space:pre-wrap;line-height:1.7}
.sig{margin-top:30px;border-top:2px solid #0d1440;padding-top:12px;display:flex;justify-content:space-between;align-items:flex-end}
.sig-line{border-bottom:1px solid #0d1440;width:200px;height:38px;margin-bottom:4px}
.footer{margin-top:12px;border-top:1px solid #e2e8f0;padding-top:7px;display:flex;justify-content:space-between;font-size:7.5pt;color:#94a3b8}
@media print{body{padding:12px}@page{margin:12mm}}
</style></head><body>
<div class="lh">
  <div><h1>AMEXAN Health System</h1><p style="font-size:9pt;color:#5a6b8c">Patient Visit Summary · Confidential</p></div>
  <div style="text-align:right;font-size:9pt;color:#5a6b8c"><strong>${fmtDT(note.visitDate)}</strong><p style="font-family:monospace;font-size:8pt">Ref: ${ref}</p></div>
</div>
<div class="hg">
  <div><span class="lb">Patient</span><strong style="font-size:13pt">${patientName}</strong>
    <span class="lb">Visit Type</span><span>${(note.visitType || '').replace(/_/g, ' ').toUpperCase()}</span>
  </div>
  <div><span class="lb">Treating Doctor</span><strong style="font-size:13pt">Dr. ${note.doctorName}</strong>
    <span class="lb">Specialty</span><span>${note.doctorSpecialty}</span>
  </div>
</div>
${(note.alerts || []).filter(a => !a.acknowledged).map(a =>
  `<div style="background:${a.severity === 'critical' ? '#fef2f2' : '#fffbeb'};border-left:3px solid ${a.severity === 'critical' ? '#dc2626' : '#d97706'};padding:6px 10px;margin-bottom:5px;font-size:9.5pt;color:${a.severity === 'critical' ? '#991b1b' : '#92400e'}">${a.severity === 'critical' ? '🚨' : '⚠️'} ${a.message}</div>`
).join('')}
${note.chiefComplaint ? `<div class="sec"><div class="sec-t">Chief Complaint</div><p>${note.chiefComplaint}</p></div>` : ''}
${note.hpi ? `<div class="sec"><div class="sec-t">History of Present Illness</div><p style="white-space:pre-wrap">${note.hpi}</p></div>` : ''}
${note.allergies ? `<div class="sec"><div class="sec-t" style="color:#d97706">Known Allergies</div><p style="font-weight:700;color:#92400e">${note.allergies}</p></div>` : ''}
${vitBox}
${note.examination && Object.values(note.examination).some(Boolean) ? `<div class="sec"><div class="sec-t">Physical Examination</div>${Object.entries(note.examination).filter(([,v])=>v).map(([k,v])=>`<div><strong style="text-transform:uppercase;font-size:7.5pt;color:#5a6b8c">${k}:</strong> ${v}</div>`).join('')}</div>` : ''}
${note.investigations ? `<div class="sec"><div class="sec-t">Investigations / Impression</div><p>${note.investigations}</p></div>` : ''}
${dxHtml ? `<div class="sec"><div class="sec-t">Diagnoses</div>${dxHtml}</div>` : ''}
${note.plan ? `<div class="sec"><div class="sec-t">Management Plan</div><div class="plan">${note.plan}</div></div>` : ''}
${note.progressAssessment ? `<div class="sec"><div class="sec-t">Progress Assessment</div><p>${note.progressAssessment}</p></div>` : ''}
${rxHtml ? `<div class="sec"><div class="sec-t">Prescriptions</div>${rxHtml}</div>` : ''}
${labHtml ? `<div class="sec"><div class="sec-t">Laboratory Orders</div>${labHtml}</div>` : ''}
${imgHtml ? `<div class="sec"><div class="sec-t">Imaging Orders</div>${imgHtml}</div>` : ''}
${refHtml ? `<div class="sec"><div class="sec-t">Referrals</div>${refHtml}</div>` : ''}
${fuHtml ? `<div class="sec"><div class="sec-t">Follow-Up Schedule</div>${fuHtml}</div>` : ''}
${note.educationGiven ? `<div class="sec"><div class="sec-t">Patient Education</div><p>${note.educationGiven}</p></div>` : ''}
<div class="sig">
  <div><div class="sig-line"></div><strong>Dr. ${note.doctorName}</strong><p style="font-size:9pt;color:#5a6b8c">${note.doctorSpecialty}</p></div>
  <div style="text-align:center"><div style="border:2px dashed #c5d2e8;border-radius:7px;width:100px;height:64px;display:flex;align-items:center;justify-content:center;color:#c5d2e8;font-size:8pt">Facility<br/>Stamp</div></div>
  <div style="text-align:right"><div class="sig-line"></div><strong>Patient Signature</strong><p style="font-size:9pt;color:#5a6b8c">Date: ___________</p></div>
</div>
<div class="footer">
  <span>AMEXAN Health System · Confidential</span>
  <span>Ref: ${ref} · Printed: ${new Date().toLocaleString()}</span>
</div>
</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIT DETAIL — expanded single visit inside a doctor's section
// ═══════════════════════════════════════════════════════════════════════════
function VisitDetail({ note, toolReadings, patientId, patientName }) {
  const vtCfg = VT_CFG[note.visitType] || VT_CFG.follow_up;
  const rxList   = note.prescriptions  || [];
  const labList  = note.labOrders      || [];
  const imgList  = note.imagingOrders  || [];
  const fuList   = note.followUps      || [];
  const refList  = note.referrals      || [];
  const toolList = note.monitoringTools|| [];
  const dxList   = (note.diagnoses || []).filter(d => d.description);
  const critAlerts = (note.alerts || []).filter(a => !a.acknowledged && a.severity === 'critical');
  const warnAlerts = (note.alerts || []).filter(a => !a.acknowledged && a.severity === 'warning');

  return (
    <div style={{ padding: '14px 16px 16px', borderTop: '1px solid rgba(255,255,255,.05)' }}>

      {/* Alerts */}
      {[...critAlerts, ...warnAlerts].map(a => (
        <div key={a.id || a.message} style={{ padding: '8px 12px', borderRadius: 9, marginBottom: 6, fontSize: 12, display: 'flex', gap: 8, background: a.severity === 'critical' ? 'rgba(220,38,38,.08)' : 'rgba(217,119,6,.07)', border: `1px solid ${a.severity === 'critical' ? 'rgba(220,38,38,.2)' : 'rgba(217,119,6,.2)'}`, color: a.severity === 'critical' ? '#dc2626' : '#d97706' }}>
          <span>{a.severity === 'critical' ? '🚨' : '⚠️'}</span>
          <div><div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px' }}>{a.type?.replace(/_/g, ' ')}</div>{a.message}</div>
        </div>
      ))}

      {/* Vitals */}
      {note.vitals && Object.values(note.vitals).some(v => v !== undefined) && (
        <Sec icon="💉" title="Vital Signs" count={0} accent="#dc2626">
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {note.vitals.bp && <VChip icon="🫀" label="BP" val={note.vitals.bp} unit="mmHg" flag={undefined} />}
            {note.vitals.hr !== undefined && <VChip icon="💓" label="HR" val={note.vitals.hr} unit="bpm" flag={note.vitals.hr > 100 ? 'high' : note.vitals.hr < 50 ? 'low' : undefined} />}
            {note.vitals.temp !== undefined && <VChip icon="🌡️" label="Temp" val={note.vitals.temp} unit="°C" flag={note.vitals.temp >= 38.5 ? 'high' : undefined} />}
            {note.vitals.spo2 !== undefined && <VChip icon="🫁" label="SpO₂" val={`${note.vitals.spo2}%`} unit="%" flag={note.vitals.spo2 < 92 ? 'critical' : undefined} />}
            {note.vitals.weight !== undefined && <VChip icon="⚖️" label="Wt" val={note.vitals.weight} unit="kg" flag={undefined} />}
            {note.vitals.bmi !== undefined && <VChip icon="📊" label="BMI" val={note.vitals.bmi} unit="" flag={undefined} />}
            {note.vitals.pain !== undefined && <VChip icon="😣" label="Pain" val={`${note.vitals.pain}/10`} unit="/10" flag={note.vitals.pain >= 7 ? 'critical' : note.vitals.pain >= 4 ? 'high' : undefined} />}
            {note.vitals.fbs !== undefined && <VChip icon="🩸" label="FBS" val={note.vitals.fbs} unit="mmol/L" flag={note.vitals.fbs >= 7 ? 'high' : undefined} />}
            {note.vitals.rr !== undefined && <VChip icon="🌬️" label="RR" val={note.vitals.rr} unit="/min" flag={undefined} />}
            {note.vitals.gcs !== undefined && <VChip icon="🧠" label="GCS" val={`${note.vitals.gcs}/15`} unit="/15" flag={note.vitals.gcs < 13 ? 'critical' : undefined} />}
          </div>
        </Sec>
      )}

      {/* HPI */}
      {note.hpi && (
        <Sec icon="📝" title="History of Present Illness" count={0}>
          <div style={{ fontSize: 13, color: 'var(--text2, #8b9bbf)', lineHeight: 1.75, whiteSpace: 'pre-wrap', padding: '10px 13px', background: 'rgba(255,255,255,.02)', borderRadius: 9, border: '1px solid rgba(255,255,255,.05)' }}>{note.hpi}</div>
        </Sec>
      )}

      {/* Background */}
      {(note.pmh || note.allergies || note.currentMeds || note.sh || note.fh) && (
        <Sec icon="📋" title="Medical Background" count={0}>
          {note.allergies && (
            <div style={{ padding: '8px 12px', background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.2)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: 2 }}>⚠ Allergies</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>{note.allergies}</div>
            </div>
          )}
          {note.pmh && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 3 }}><strong>PMH:</strong> {note.pmh}</div>}
          {note.currentMeds && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 3 }}><strong>Current Meds:</strong> {note.currentMeds}</div>}
          {note.sh && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 3 }}><strong>Social Hx:</strong> {note.sh}</div>}
          {note.fh && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)' }}><strong>Family Hx:</strong> {note.fh}</div>}
        </Sec>
      )}

      {/* Exam */}
      {note.examination && Object.values(note.examination).some(Boolean) && (
        <Sec icon="🩺" title="Physical Examination" count={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {Object.entries(note.examination).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ background: 'var(--surface2, #1a2338)', borderRadius: 8, padding: '7px 10px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, color: 'var(--text, #e8edf5)', lineHeight: 1.5 }}>{v as string}</div>
              </div>
            ))}
          </div>
        </Sec>
      )}

      {/* Investigations */}
      {note.investigations && (
        <Sec icon="🔬" title="Investigations / Impression" count={0}>
          <div style={{ fontSize: 13, color: 'var(--text2, #8b9bbf)', lineHeight: 1.65 }}>{note.investigations}</div>
        </Sec>
      )}

      {/* Plan */}
      {note.plan && (
        <Sec icon="📋" title="Management Plan" count={0} accent="#3b82f6">
          <div style={{ fontSize: 13, color: 'var(--text, #e8edf5)', lineHeight: 1.75, whiteSpace: 'pre-wrap', padding: '12px 14px', background: 'rgba(59,130,246,.06)', borderRadius: 10, borderLeft: '3px solid #3b82f6' }}>{note.plan}</div>
        </Sec>
      )}

      {note.progressAssessment && (
        <Sec icon="📈" title="Progress Assessment" count={0}>
          <div style={{ fontSize: 13, color: 'var(--text2, #8b9bbf)', lineHeight: 1.65 }}>{note.progressAssessment}</div>
        </Sec>
      )}

      {/* Prescriptions */}
      {rxList.length > 0 && (
        <Sec icon="💊" title="Prescriptions" count={rxList.length} accent="#059669">
          {rxList.map((rx, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 13px', background: 'rgba(5,150,105,.05)', border: '1px solid rgba(5,150,105,.15)', borderRadius: 10, marginBottom: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>💊</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{rx.medication}</div>
                <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)', marginTop: 2 }}>{rx.dosage} · {rx.frequency} · {rx.duration}{rx.route ? ` · ${rx.route.toUpperCase()}` : ''}</div>
                {rx.instructions && <div style={{ fontSize: 11, color: 'var(--muted, #546382)', fontStyle: 'italic', marginTop: 2 }}>📌 {rx.instructions}</div>}
                {rx.startDate && <div style={{ fontSize: 10, color: 'var(--muted, #546382)', marginTop: 3, fontFamily: 'monospace' }}>{rx.startDate}{rx.endDate ? ` → ${rx.endDate}` : ''}</div>}
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, flexShrink: 0, background: rx.status === 'active' ? 'rgba(5,150,105,.15)' : 'rgba(100,116,139,.1)', color: rx.status === 'active' ? '#059669' : 'var(--muted, #546382)' }}>{rx.status || 'active'}</span>
            </div>
          ))}
        </Sec>
      )}

      {/* Lab Orders */}
      {labList.length > 0 && (
        <Sec icon="🧪" title="Laboratory Orders" count={labList.length} accent="#0ea5e9">
          {labList.map((lab, i) => (
            <div key={i} style={{ padding: '10px 13px', background: 'rgba(14,165,233,.05)', border: '1px solid rgba(14,165,233,.15)', borderRadius: 10, marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <span>🧪</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{lab.test}</span>
                {lab.urgency !== 'routine' && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, fontWeight: 800, background: lab.urgency === 'stat' ? 'rgba(220,38,38,.12)' : 'rgba(217,119,6,.12)', color: lab.urgency === 'stat' ? '#dc2626' : '#d97706' }}>{lab.urgency?.toUpperCase()}</span>}
                <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, fontWeight: 700, marginLeft: 'auto', background: 'rgba(100,116,139,.1)', color: 'var(--muted, #546382)' }}>{lab.status}</span>
              </div>
              {lab.result && (
                <div style={{ padding: '7px 10px', borderRadius: 8, marginTop: 4, background: lab.flag === 'critical' ? 'rgba(220,38,38,.08)' : lab.flag === 'high' ? 'rgba(217,119,6,.07)' : 'rgba(5,150,105,.07)', border: `1px solid ${lab.flag === 'critical' ? 'rgba(220,38,38,.2)' : lab.flag === 'high' ? 'rgba(217,119,6,.2)' : 'rgba(5,150,105,.2)'}` }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: lab.flag === 'critical' ? '#dc2626' : lab.flag === 'high' ? '#d97706' : '#059669', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>Result{lab.flag && lab.flag !== 'normal' ? ` · ${lab.flag.toUpperCase()}` : ''}</div>
                  {lab.resultValue && <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: lab.flag === 'critical' ? '#dc2626' : lab.flag === 'high' ? '#d97706' : '#059669' }}>{lab.resultValue} {lab.unit}</div>}
                  <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)' }}>{lab.result}</div>
                  {lab.referenceRange && <div style={{ fontSize: 10, color: 'var(--muted, #546382)', marginTop: 2 }}>Ref: {lab.referenceRange}</div>}
                  {lab.doctorReviewed && <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 3 }}>✅ Doctor reviewed</div>}
                </div>
              )}
              {(lab.status === 'resulted' || lab.status === 'critical') && !lab.patientUploadedResult && (
                <div style={{ marginTop: 7 }}>
                  <UploadBtn itemId={lab.id} type="lab" patientId={patientId} doctorId={note.doctorId} testName={lab.test} />
                </div>
              )}
              {lab.patientUploadedResult && (
                <div style={{ marginTop: 5, fontSize: 10, color: '#059669', fontWeight: 700 }}>
                  ✅ Result uploaded{!lab.doctorReviewed ? ' · ⏳ Awaiting review' : ''}
                  {lab.resultUrl && <a href={lab.resultUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: 'var(--accent, #00e5cc)', textDecoration: 'none' }}>View →</a>}
                </div>
              )}
            </div>
          ))}
        </Sec>
      )}

      {/* Imaging */}
      {imgList.length > 0 && (
        <Sec icon="🩻" title="Imaging Orders" count={imgList.length} accent="#7c3aed">
          {imgList.map((img, i) => (
            <div key={i} style={{ padding: '10px 13px', background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 10, marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                <span>🩻</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(124,58,237,.15)', color: '#7c3aed' }}>{img.modality}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{img.study}</span>
                {img.bodyPart && <span style={{ fontSize: 11, color: 'var(--muted, #546382)' }}>({img.bodyPart})</span>}
                <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, fontWeight: 700, marginLeft: 'auto', background: 'rgba(100,116,139,.1)', color: 'var(--muted, #546382)' }}>{img.status}</span>
              </div>
              {img.impression && (
                <div style={{ padding: '7px 10px', background: 'rgba(5,150,105,.07)', borderRadius: 8, marginTop: 4, border: '1px solid rgba(5,150,105,.2)' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>Impression</div>
                  <div style={{ fontSize: 12, color: 'var(--text, #e8edf5)' }}>{img.impression}</div>
                  {img.radiologistName && <div style={{ fontSize: 10, color: 'var(--muted, #546382)', marginTop: 2 }}>— {img.radiologistName}</div>}
                </div>
              )}
              {(img.status === 'performed' || img.status === 'reported' || img.status === 'reviewed') && !img.patientUploadedReport && (
                <div style={{ marginTop: 7 }}>
                  <UploadBtn itemId={img.id} type="img" patientId={patientId} doctorId={note.doctorId} testName={img.study} />
                </div>
              )}
              {img.patientUploadedReport && (
                <div style={{ marginTop: 5, fontSize: 10, color: '#059669', fontWeight: 700 }}>
                  ✅ Report uploaded{!img.doctorReviewed ? ' · ⏳ Awaiting review' : ''}
                  {img.reportUrl && <a href={img.reportUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: 'var(--accent, #00e5cc)', textDecoration: 'none' }}>View →</a>}
                </div>
              )}
            </div>
          ))}
        </Sec>
      )}

      {/* Referrals */}
      {refList.length > 0 && (
        <Sec icon="🏥" title="Referrals" count={refList.length} accent="#d97706">
          {refList.map((ref, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, padding: '8px 12px', background: 'rgba(217,119,6,.05)', border: '1px solid rgba(217,119,6,.15)', borderRadius: 9, marginBottom: 5, alignItems: 'center' }}>
              <span>🏥</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{ref.toSpecialty}{ref.toDoctorName ? ` — Dr. ${ref.toDoctorName}` : ''}{ref.toFacility ? ` @ ${ref.toFacility}` : ''}</div>
                <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)' }}>{ref.reason}</div>
              </div>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: ref.urgency === 'emergency' ? 'rgba(220,38,38,.12)' : 'rgba(100,116,139,.1)', color: ref.urgency === 'emergency' ? '#dc2626' : 'var(--muted, #546382)' }}>{ref.urgency}</span>
            </div>
          ))}
        </Sec>
      )}

      {/* Follow-ups */}
      {fuList.length > 0 && (
        <Sec icon="📅" title="Follow-Up Schedule" count={fuList.length} accent="#3b82f6">
          {fuList.map((fu, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, padding: '8px 12px', background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.15)', borderRadius: 9, marginBottom: 5, alignItems: 'center' }}>
              <span>📅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{fu.date}{fu.time ? ` at ${fu.time}` : ''}</div>
                <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)' }}>{(fu.type || '').replace(/_/g, ' ')} · {fu.reason}</div>
              </div>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: fu.status === 'completed' ? 'rgba(5,150,105,.12)' : fu.status === 'missed' ? 'rgba(220,38,38,.1)' : 'rgba(59,130,246,.1)', color: fu.status === 'completed' ? '#059669' : fu.status === 'missed' ? '#dc2626' : '#3b82f6' }}>{fu.status}</span>
            </div>
          ))}
        </Sec>
      )}

      {/* Monitoring tools */}
      {toolList.length > 0 && (
        <Sec icon="📊" title="Monitoring Tools" count={toolList.length} accent="#6366f1">
          {toolList.map((tool, i) => {
            const cfg = TOOLS[tool.tool] || TOOLS.custom;
            const readings = toolReadings?.[tool.id] || [];
            const latest = readings[readings.length - 1];
            return (
              <div key={i} style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}22`, borderRadius: 11, padding: '11px 13px', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: readings.length >= 2 ? 10 : 0 }}>
                  <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{tool.customName || cfg.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)' }}>{tool.frequency}{tool.targetRange ? ` · Target: ${tool.targetRange.min}–${tool.targetRange.max} ${tool.customUnit || cfg.unit}` : ''}</div>
                  </div>
                  {latest && <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: 16, fontWeight: 800, color: cfg.color, fontFamily: 'monospace' }}>{latest.value} {tool.customUnit || cfg.unit}</div><div style={{ fontSize: 9, color: 'var(--muted, #546382)' }}>Latest</div></div>}
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, flexShrink: 0, background: tool.status === 'active' ? 'rgba(5,150,105,.12)' : 'rgba(100,116,139,.1)', color: tool.status === 'active' ? '#059669' : 'var(--muted, #546382)' }}>{tool.status}</span>
                </div>
                {readings.length >= 2 && (
                  <div style={{ padding: '10px 12px', background: 'var(--surface2, #1a2338)', borderRadius: 9 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Trend ({readings.length} readings)</div>
                    <Spark readings={readings} color={cfg.color} unit={tool.customUnit || cfg.unit} />
                  </div>
                )}
              </div>
            );
          })}
        </Sec>
      )}

      {/* Education */}
      {note.educationGiven && (
        <Sec icon="📚" title="Patient Education Given" count={0} accent="#0ea5e9">
          <div style={{ padding: '10px 13px', background: 'rgba(14,165,233,.06)', borderRadius: 9, borderLeft: '3px solid #0ea5e9' }}>
            <p style={{ fontSize: 13, color: 'var(--text2, #8b9bbf)', lineHeight: 1.65 }}>{note.educationGiven}</p>
          </div>
        </Sec>
      )}

      {/* Footer */}
      <div style={{ marginTop: 14, fontSize: 10, color: 'var(--muted, #546382)', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        <span>Created: {fmtDT(note.createdAt)}</span>
        {note.lastEditedAt && <span>Edited: {fmtDT(note.lastEditedAt)}</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIT ROW — collapsed row inside a doctor's expanded section
// ═══════════════════════════════════════════════════════════════════════════
function VisitRow({ note, toolReadings, patientId, patientName }) {
  const [open, setOpen] = useState(false);
  const vtCfg = VT_CFG[note.visitType] || VT_CFG.follow_up;
  const dxList     = (note.diagnoses || []).filter(d => d.description);
  const rxCount    = (note.prescriptions  || []).length;
  const labCount   = (note.labOrders      || []).length;
  const imgCount   = (note.imagingOrders  || []).length;
  const toolCount  = (note.monitoringTools|| []).length;
  const fuCount    = (note.followUps      || []).length;
  const critAlerts = (note.alerts || []).filter(a => !a.acknowledged && a.severity === 'critical').length;
  const warnAlerts = (note.alerts || []).filter(a => !a.acknowledged && a.severity === 'warning').length;
  const dayAgo = daysSince(note.visitDate);

  return (
    <div style={{ borderRadius: 11, overflow: 'hidden', marginBottom: 8, border: `1px solid rgba(255,255,255,.06)`, background: 'var(--surface2, #1a2338)', transition: 'border-color .2s' }}>
      {/* Row header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer', borderLeft: `4px solid ${vtCfg.color}` }}
      >
        {/* Visit type icon */}
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${vtCfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
          {vtCfg.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Date + type + freshness */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #e8edf5)' }}>{fmtDT(note.visitDate)}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: `${vtCfg.color}18`, color: vtCfg.color }}>{vtCfg.label}</span>
            {dayAgo !== null && dayAgo <= 7 && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: 'rgba(0,229,204,.1)', color: 'var(--accent, #00e5cc)', fontWeight: 700 }}>{dayAgo === 0 ? 'Today' : `${dayAgo}d ago`}</span>}
            {critAlerts > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: 'rgba(220,38,38,.12)', color: '#dc2626' }}>🚨 {critAlerts}</span>}
            {warnAlerts > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: 'rgba(217,119,6,.12)', color: '#d97706' }}>⚠ {warnAlerts}</span>}
          </div>

          {/* DIAGNOSES ALWAYS VISIBLE */}
          {dxList.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
              {dxList.map((dx, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: dx.type === 'primary' ? 'rgba(5,150,105,.12)' : 'rgba(100,116,139,.08)', color: dx.type === 'primary' ? '#059669' : '#546382', border: `1px solid ${dx.type === 'primary' ? 'rgba(5,150,105,.25)' : 'rgba(100,116,139,.15)'}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {dx.type === 'primary' && <span style={{ fontSize: 10 }}>🎯</span>}
                  {dx.description}
                  {dx.code && <span style={{ fontSize: 9, opacity: .7, fontFamily: 'monospace' }}>{dx.code}</span>}
                </span>
              ))}
            </div>
          ) : note.chiefComplaint ? (
            <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)', marginBottom: 4, fontStyle: 'italic' }}>C/C: "{note.chiefComplaint}"</div>
          ) : null}

          {/* Content count pills */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {rxCount > 0 && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: 'rgba(5,150,105,.1)', color: '#059669', fontWeight: 700 }}>💊 {rxCount}</span>}
            {labCount > 0 && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: 'rgba(14,165,233,.1)', color: '#0ea5e9', fontWeight: 700 }}>🧪 {labCount}</span>}
            {imgCount > 0 && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: 'rgba(124,58,237,.1)', color: '#7c3aed', fontWeight: 700 }}>🩻 {imgCount}</span>}
            {toolCount > 0 && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: 'rgba(99,102,241,.1)', color: '#6366f1', fontWeight: 700 }}>📊 {toolCount}</span>}
            {fuCount > 0 && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: 'rgba(0,229,204,.08)', color: 'var(--accent, #00e5cc)', fontWeight: 700 }}>📅 {fuCount}</span>}
          </div>
        </div>

        {/* PDF + chevron */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); printPDF(note, patientName); }} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--text2, #8b9bbf)', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontWeight: 600 }}>🖨 PDF</button>
          <span style={{ fontSize: 14, color: 'var(--muted, #546382)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
        </div>
      </div>

      {/* Expanded visit detail */}
      {open && <VisitDetail note={note} toolReadings={toolReadings} patientId={patientId} patientName={patientName} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCTOR CARD — top-level grouping
// ═══════════════════════════════════════════════════════════════════════════
function DoctorCard({ doctorId, doctorName, doctorSpecialty, visits, toolReadings, patientId, patientName }) {
  const [open, setOpen] = useState(false);
  const hue = drHue(doctorName);

  // Stats for this doctor
  const totalDx  = visits.flatMap(n => (n.diagnoses    || []).filter(d => d.description && d.status === 'active')).length;
  const totalRx  = visits.flatMap(n => (n.prescriptions || [])).length;
  const totalLab = visits.flatMap(n => (n.labOrders    || [])).length;
  const totalImg = visits.flatMap(n => (n.imagingOrders|| [])).length;
  const latestVisit = visits[0]; // already sorted desc
  const critAlerts = visits.flatMap(n => (n.alerts || []).filter(a => !a.acknowledged && a.severity === 'critical')).length;
  const dxSummary  = visits.flatMap(n => (n.diagnoses || []).filter(d => d.description && d.type === 'primary' && d.status === 'active')).slice(0, 3);

  return (
    <div style={{
      background: 'var(--surface, #111827)',
      border: '1px solid var(--border, #243047)',
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      transition: 'box-shadow .2s, border-color .2s',
      boxShadow: open ? '0 8px 32px rgba(0,0,0,.4)' : 'none',
    }}>
      {/* ══ DOCTOR HEADER — click to expand ══ */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', gap: 14, padding: '18px 20px', cursor: 'pointer', alignItems: 'center' }}
      >
        {/* Avatar */}
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `hsl(${hue},45%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, border: `2px solid hsl(${hue},45%,45%)` }}>
          {(doctorName || 'D')[0].toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + specialty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #e8edf5)', fontFamily: 'var(--font-display, system-ui)' }}>
              Dr. {doctorName}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99, background: `hsl(${hue},45%,20%)`, color: `hsl(${hue},60%,75%)`, border: `1px solid hsl(${hue},45%,30%)` }}>
              {doctorSpecialty}
            </span>
            {critAlerts > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'rgba(220,38,38,.12)', color: '#dc2626' }}>🚨 {critAlerts} Alert{critAlerts > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Active diagnoses from this doctor */}
          {dxSummary.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
              {dxSummary.map((dx, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: 'rgba(5,150,105,.1)', color: '#059669', border: '1px solid rgba(5,150,105,.22)' }}>
                  🎯 {dx.description}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--muted, #546382)' }}>
            <span>🏥 {visits.length} visit{visits.length !== 1 ? 's' : ''}</span>
            {latestVisit && <span>· Last seen: {fmtDateOnly(latestVisit.visitDate)}</span>}
          </div>
        </div>

        {/* Stats chips + chevron */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {totalDx > 0  && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'rgba(5,150,105,.1)',    color: '#059669', border: '1px solid rgba(5,150,105,.2)' }}>🎯 {totalDx} Dx</span>}
            {totalRx > 0  && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'rgba(217,119,6,.1)',     color: '#d97706', border: '1px solid rgba(217,119,6,.2)' }}>💊 {totalRx} Rx</span>}
            {totalLab > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'rgba(14,165,233,.1)',    color: '#0ea5e9', border: '1px solid rgba(14,165,233,.2)' }}>🧪 {totalLab}</span>}
            {totalImg > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'rgba(124,58,237,.1)',    color: '#7c3aed', border: '1px solid rgba(124,58,237,.2)' }}>🩻 {totalImg}</span>}
          </div>
          <span style={{ fontSize: 18, color: 'var(--muted, #546382)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s', marginRight: 2 }}>▼</span>
        </div>
      </div>

      {/* ══ EXPANDED: list of visits under this doctor ══ */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.7px', margin: '12px 0 10px' }}>
            Visits with Dr. {doctorName} ({visits.length})
          </div>
          {visits.map(note => (
            <VisitRow
              key={note.id}
              note={note}
              toolReadings={toolReadings}
              patientId={patientId}
              patientName={patientName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function PatientVisitSummary({ patientId, patientName = 'Patient' }) {
  const [notes,       setNotes]       = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [toolReadings,setToolReadings]= useState({});
  const [search,      setSearch]      = useState('');

  // ── Real-time clinical notes ─────────────────────────────────────────────
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    const q = query(
      collection(db, 'clinicalNotes'),
      where('patientId', '==', patientId),
      orderBy('visitDate', 'desc'),
    );
    const unsub = onSnapshot(q,
      snap => { setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      async () => {
        const snap = await getDocs(query(collection(db, 'clinicalNotes'), where('patientId', '==', patientId)));
        setNotes(
          snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
            .sort((a: any, b: any) => (b.visitDate?.toDate?.()?.getTime() || 0) - (a.visitDate?.toDate?.()?.getTime() || 0))
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, [patientId]);

  // ── Real-time monitoring readings ────────────────────────────────────────
  useEffect(() => {
    if (!notes.length) return;
    const ids = notes.flatMap(n => (n.monitoringTools || []).map(t => t.id)).filter(Boolean);
    if (!ids.length) return;
    const subs = ids.map(toolId => {
      const q = query(collection(db, 'monitoringReadings'), where('assignmentId', '==', toolId), orderBy('timestamp', 'asc'), limit(30));
      return onSnapshot(q,
        snap => setToolReadings(p => ({ ...p, [toolId]: snap.docs.map(d => ({ id: d.id, ...d.data() })) })),
        async () => {
          const snap = await getDocs(query(collection(db, 'monitoringReadings'), where('assignmentId', '==', toolId)));
          setToolReadings(p => ({
            ...p,
            [toolId]: snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
              .sort((a: any, b: any) => (a.timestamp?.toDate?.()?.getTime() || 0) - (b.timestamp?.toDate?.()?.getTime() || 0)),
          }));
        }
      );
    });
    return () => subs.forEach(u => u());
  }, [notes]);

  // ── Group by doctor ───────────────────────────────────────────────────────
  const filteredNotes = search
    ? notes.filter(n => [
        n.chiefComplaint, n.plan, n.doctorName, n.doctorSpecialty,
        (n.diagnoses     || []).map(d => d.description).join(' '),
        (n.prescriptions || []).map(r => r.medication).join(' '),
        (n.labOrders     || []).map(l => l.test).join(' '),
      ].join(' ').toLowerCase().includes(search.toLowerCase()))
    : notes;

  // Build doctor groups: Map<doctorId, { doctorName, doctorSpecialty, visits[] }>
  const doctorGroups = new Map();
  filteredNotes.forEach(note => {
    const key = note.doctorId || note.doctorName || 'unknown';
    if (!doctorGroups.has(key)) {
      doctorGroups.set(key, {
        doctorId:        note.doctorId,
        doctorName:      note.doctorName || 'Unknown Doctor',
        doctorSpecialty: note.doctorSpecialty || 'General Practice',
        visits:          [],
      });
    }
    doctorGroups.get(key).visits.push(note);
  });
  // Sort doctors by most recent visit
  const doctors = Array.from(doctorGroups.values()).sort((a, b) => {
    const ta = a.visits[0]?.visitDate?.toDate?.()?.getTime() || 0;
    const tb = b.visits[0]?.visitDate?.toDate?.()?.getTime() || 0;
    return tb - ta;
  });

  // Global stats
  const totalVisits = notes.length;
  const totalDx     = notes.flatMap(n => (n.diagnoses    || []).filter(d => d.description && d.status === 'active')).length;
  const totalRx     = notes.flatMap(n => (n.prescriptions || [])).length;
  const totalOrders = notes.flatMap(n => [...(n.labOrders || []), ...(n.imagingOrders || [])]).length;

  return (
    <div>
      {/* Global stats ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
        {[
          { icon: '🏥', val: totalVisits,         label: 'Visits',     color: 'var(--accent, #00e5cc)' },
          { icon: '👨‍⚕️', val: doctors.length,      label: 'Doctors',    color: '#7c3aed' },
          { icon: '🎯', val: totalDx,              label: 'Active Dx',  color: '#059669' },
          { icon: '🔬', val: totalOrders,          label: 'Orders',     color: '#0ea5e9' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface, #111827)', border: '1px solid var(--border, #243047)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--mono, monospace)', lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'var(--muted, #546382)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Search across all visits — diagnosis, medication, complaint, doctor…"
        style={{ width: '100%', padding: '10px 14px', background: 'var(--surface2, #1a2338)', border: '1px solid var(--border2, #2d3f58)', borderRadius: 10, color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)', outline: 'none', marginBottom: 20, transition: 'border-color .15s' }}
      />

      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted, #546382)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏥</div>
          <div style={{ fontSize: 13 }}>Loading your clinical record…</div>
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--muted, #546382)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #e8edf5)', marginBottom: 6 }}>
            {search ? 'No matching visits' : 'No visit notes yet'}
          </div>
          <div style={{ fontSize: 12 }}>
            {search ? 'Try clearing your search.' : 'Your visit history will appear here after consultations.'}
          </div>
        </div>
      )}

      {/* Doctor cards */}
      {doctors.map(dr => (
        <DoctorCard
          key={dr.doctorId || dr.doctorName}
          doctorId={dr.doctorId}
          doctorName={dr.doctorName}
          doctorSpecialty={dr.doctorSpecialty}
          visits={dr.visits}
          toolReadings={toolReadings}
          patientId={patientId}
          patientName={patientName}
        />
      ))}
    </div>
  );
}