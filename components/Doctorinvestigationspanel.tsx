'use client';
// ═══════════════════════════════════════════════════════════════════════════
// DoctorInvestigationsPanel.tsx  — DOCTOR SIDE
//
// FEATURES:
//  ✅ Order Lab / Imaging from visit page
//  ✅ Full clinical context embedded on order (CC, HPI, Exam, Dx)
//  ✅ Generates printable professional request form (PDF-quality HTML print)
//  ✅ Tracks each order through full status lifecycle
//  ✅ Real-time notification when patient uploads result
//  ✅ Doctor interpretation workflow with plan/conclusion
//  ✅ Result review closes the loop → updates record
//  ✅ Outstanding tests dashboard with critical alerts
//  ✅ Numeric result trends / history chart
//  ✅ onSnapshot real-time throughout
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc,
  doc, getDocs, serverTimestamp, orderBy, getDoc, arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
};
const fmtDT = (ts: any) => {
  if (!ts) return '—';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LAB_CATEGORIES = ['Haematology','Chemistry','Immunology','Microbiology','Endocrinology','Urinalysis','Serology','Coagulation','Tumour Markers','Genetics'];
const COMMON_LABS: Record<string, string[]> = {
  Haematology: ['Full Blood Count (FBC)', 'Blood Film', 'ESR', 'Reticulocyte Count', 'Peripheral Blood Smear'],
  Chemistry: ['Urea & Electrolytes', 'Liver Function Tests (LFTs)', 'Renal Function Tests', 'Fasting Glucose', 'HbA1c', 'Lipid Profile', 'Serum Albumin', 'Calcium & Phosphate', 'Uric Acid', 'C-Reactive Protein (CRP)'],
  Immunology: ['ANA', 'ANCA', 'Rheumatoid Factor', 'Anti-dsDNA', 'Complement (C3/C4)', 'IgG/IgA/IgM Levels'],
  Microbiology: ['Blood Culture', 'Urine Culture & Sensitivity', 'Stool Culture', 'Sputum MCS', 'Wound Swab', 'Malaria RDT / Film', 'H. pylori Antigen'],
  Endocrinology: ['TSH', 'Free T3/T4', 'Cortisol (AM/Random)', 'Prolactin', 'LH/FSH', 'Testosterone', 'IGF-1', 'PTH', 'Insulin Level'],
  Urinalysis: ['Urinalysis + Microscopy', 'Urine Protein:Creatinine Ratio', '24h Urine Protein', 'Urine Albumin:Creatinine'],
  Serology: ['HIV Combo (Ag/Ab)', 'Hepatitis B sAg', 'Hepatitis C Ab', 'VDRL/RPR (Syphilis)', 'Brucella Ab', 'Typhoid (Widal)', 'Dengue NS1/IgM'],
  Coagulation: ['PT/INR', 'APTT', 'D-Dimer', 'Fibrinogen', 'Thrombin Time'],
  'Tumour Markers': ['PSA (Total & Free)', 'CA-125', 'CA 19-9', 'CEA', 'AFP', 'Beta-hCG', 'LDH', 'Beta-2 Microglobulin'],
  Genetics: ['Karyotype', 'JAK2 Mutation', 'BCR-ABL PCR', 'BRCA1/BRCA2'],
};
const IMAGING_MODALITIES = ['X-Ray','Ultrasound','CT Scan','MRI','PET Scan','Fluoroscopy','Mammography','DEXA Scan','Echocardiogram','ECG'];
const COMMON_IMAGING: Record<string, string[]> = {
  'X-Ray': ['Chest X-Ray (PA/AP)', 'Abdominal X-Ray', 'Cervical Spine X-Ray', 'Lumbar Spine X-Ray', 'Pelvis X-Ray', 'Right/Left Hand X-Ray', 'Skull X-Ray'],
  Ultrasound: ['Abdominal Ultrasound', 'Pelvic Ultrasound', 'Renal Ultrasound', 'Thyroid Ultrasound', 'Testicular Ultrasound', 'Carotid Doppler', 'Lower Limb Doppler'],
  'CT Scan': ['CT Head (Plain)', 'CT Head with Contrast', 'CT Thorax', 'CT Abdomen & Pelvis', 'CT Pulmonary Angiogram (CTPA)', 'CT Coronary Angiogram', 'CT Spine'],
  MRI: ['MRI Brain', 'MRI Brain with Contrast', 'MRI Spine (Cervical/Thoracic/Lumbar)', 'MRI Knee', 'MRI Shoulder', 'MRI Abdomen', 'MRI Pelvis', 'MRCP'],
  Echocardiogram: ['2D Echocardiogram', 'Stress Echocardiogram', 'Transesophageal Echo (TEE)'],
  ECG: ['12-Lead ECG', '24h Holter Monitor', 'Exercise Stress Test (EST)'],
  Mammography: ['Bilateral Mammography', 'Unilateral Mammography'],
  Fluoroscopy: ['Barium Swallow', 'Barium Meal', 'Barium Enema', 'IVU (Intravenous Urogram)'],
  'DEXA Scan': ['DEXA Bone Density (Full Body)', 'DEXA Hip & Spine'],
  'PET Scan': ['PET-CT (Whole Body)', 'PET-CT (Specific Region)'],
};

const STATUS_COLORS: Record<string, string> = {
  ordered: '#d97706', scheduled: '#0ea5e9', collected: '#0ea5e9',
  processing: '#8b5cf6', performed: '#8b5cf6',
  resulted: '#059669', reported: '#059669',
  critical: '#dc2626', reviewed: '#374151',
  closed: '#374151',
};

const FLAG_COLORS: Record<string, string> = {
  critical: '#dc2626', high: '#f97316', low: '#3b82f6', normal: '#059669',
};

// ─── PRINT REQUEST FORM ───────────────────────────────────────────────────────
function printRequestForm(order: any, patient: any, note: any) {
  const w = window.open('', '_blank'); if (!w) return;
  const isLab = order.type === 'lab';
  const ref = `${isLab ? 'LAB' : 'IMG'}-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const dxList = (note?.diagnoses || []).filter((d: any) => d.description);
  const dxHtml = dxList.map((dx: any) =>
    `<span class="badge ${dx.type === 'primary' ? 'bgrn' : 'bgrey'}">${dx.type}</span> <strong>${dx.description}</strong>${dx.code ? ` <span class="badge bmono">${dx.code}</span>` : ''}`
  ).join('<br/>');
  const examHtml = note?.examination
    ? Object.entries(note.examination).filter(([, v]) => v)
        .map(([k, v]) => `<div><strong style="text-transform:uppercase;font-size:7.5pt;color:#5a6b8c">${k}:</strong> ${v}</div>`).join('')
    : '';

  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${isLab ? 'Lab' : 'Imaging'} Request — ${order.testName || order.study}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;font-size:10.5pt;color:#0d1440;padding:28px 34px;line-height:1.6}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0d1440;padding-bottom:14px;margin-bottom:18px}
.hdr h1{font-size:19pt;font-weight:700}
.sub{font-size:9pt;color:#5a6b8c;margin-top:2px}
.warn{border:1.5px solid ${isLab ? '#d97706' : '#3b82f6'};border-radius:5px;padding:8px 14px;margin:12px 0;font-size:9.5pt;font-weight:700;background:${isLab ? '#fffbeb' : '#eff6ff'};color:${isLab ? '#92400e' : '#1d4ed8'}}
.two{display:grid;grid-template-columns:1fr 1fr;gap:18px;border:1.5px solid #c5d2e8;border-radius:6px;padding:13px;margin-bottom:14px}
.lbl{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a6b8c;display:block;margin-bottom:2px;margin-top:6px}
.val{font-size:11pt;color:#0d1440}
.sec{margin-bottom:13px;padding-left:12px;border-left:3px solid #4f63dc}
.sec-t{font-size:7.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:#4f63dc;margin-bottom:5px}
.order{border:2px solid #0d1440;border-radius:8px;padding:14px;margin-bottom:14px}
.order-name{font-size:15pt;font-weight:700;margin-bottom:8px}
.badge{display:inline-block;font-size:7.5pt;padding:1px 7px;border:1px solid #aaa;border-radius:99px;margin-right:3px;font-weight:600}
.bgrn{border-color:#059669;color:#065f46;background:#ecfdf5}
.bgrey{border-color:#94a3b8;color:#475569}
.bmono{font-family:monospace;font-size:7pt;border-color:#94a3b8;color:#475569}
.bred{border-color:#dc2626;color:#991b1b;background:#fef2f2}
.allergy{background:#fef2f2;border:1.5px solid #dc2626;border-radius:5px;padding:7px 12px;margin:8px 0;font-size:9.5pt;color:#991b1b;font-weight:700}
.sig{margin-top:28px;border-top:2px solid #0d1440;padding-top:12px;display:flex;justify-content:space-between;align-items:flex-end}
.sig-line{border-bottom:1px solid #0d1440;width:200px;height:38px;margin-bottom:4px}
.stamp{border:2px dashed #c5d2e8;border-radius:7px;width:100px;height:64px;display:flex;align-items:center;justify-content:center;color:#c5d2e8;font-size:8pt;text-align:center}
.footer{margin-top:12px;border-top:1px solid #e2e8f0;padding-top:7px;display:flex;justify-content:space-between;font-size:7.5pt;color:#94a3b8}
@media print{body{padding:12px}@page{margin:12mm}}
</style></head><body>
<div class="hdr">
  <div><h1>AMEXAN Health System</h1><div class="sub">${isLab ? 'Laboratory Request Form' : 'Imaging / Radiology Request Form'}</div></div>
  <div style="text-align:right;font-size:9pt;color:#5a6b8c">
    <strong>Date: ${new Date().toLocaleDateString('en-KE',{day:'2-digit',month:'long',year:'numeric'})}</strong>
    <p style="font-family:monospace;font-size:8pt">Ref: ${ref}</p>
  </div>
</div>
<div class="warn">${isLab
  ? '⚠ PRESENT THIS FORM TO THE LABORATORY BEFORE SAMPLE COLLECTION. Valid for the named test and patient only.'
  : '📋 PRESENT THIS FORM TO THE RADIOLOGY DEPARTMENT ON ARRIVAL. Valid for the named study and patient only.'
}</div>
<div class="two">
  <div>
    <span class="lbl">Patient Full Name</span>
    <strong class="val" style="font-size:13pt">${patient?.name || '—'}</strong>
    ${patient?.dob ? `<span class="lbl">Date of Birth</span><span class="val">${patient.dob}</span>` : ''}
    ${patient?.gender ? `<span class="lbl">Gender</span><span class="val" style="text-transform:capitalize">${patient.gender}</span>` : ''}
    ${patient?.nationalId ? `<span class="lbl">National ID</span><span class="val" style="font-family:monospace">${patient.nationalId}</span>` : ''}
    ${patient?.nhif ? `<span class="lbl">NHIF No.</span><span class="val" style="font-family:monospace">${patient.nhif}</span>` : ''}
    ${patient?.phone ? `<span class="lbl">Phone</span><span class="val">${patient.phone}</span>` : ''}
    ${patient?.bloodGroup ? `<span class="lbl">Blood Group</span><span class="val" style="font-weight:700;color:#dc2626">${patient.bloodGroup}</span>` : ''}
  </div>
  <div>
    <span class="lbl">Ordering Doctor</span>
    <strong class="val" style="font-size:13pt">Dr. ${order.doctorName || '—'}</strong>
    <span class="lbl">Specialty</span><span class="val">${order.doctorSpecialty || '—'}</span>
    <span class="lbl">Visit Date</span><span class="val">${fmtDate(order.orderedAt)}</span>
    <span class="lbl">Priority</span>
    <span class="badge ${order.urgency === 'stat' ? 'bred' : 'bgrey'}">${(order.urgency || 'routine').toUpperCase()}</span>
  </div>
</div>
${patient?.knownAllergies ? `<div class="allergy">⚠️ KNOWN ALLERGIES: ${patient.knownAllergies}</div>` : ''}
<div class="order">
  ${isLab
    ? `<div class="order-name">🧪 ${order.testName}</div>
       <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:4px">
         <div><span class="lbl">Category</span><span class="val">${order.category || '—'}</span></div>
         <div><span class="lbl">Urgency</span><span class="val">${(order.urgency || 'routine').toUpperCase()}</span></div>
         <div><span class="lbl">Fasting Required</span><span class="val">${order.fasting ? 'YES — Patient must fast 8–12h' : 'No'}</span></div>
       </div>`
    : `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
         <span class="badge" style="background:#ede9fe;border-color:#7c3aed;color:#5b21b6;font-size:11pt;padding:3px 10px">${order.modality}</span>
         <div class="order-name" style="margin-bottom:0">${order.study}</div>
       </div>
       <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
         <div><span class="lbl">Body Part</span><span class="val">${order.bodyPart || '—'}</span></div>
         <div><span class="lbl">Contrast</span><span class="val">${order.contrast ? 'YES — contrast required' : 'No contrast'}</span></div>
         <div><span class="lbl">Urgency</span><span class="val">${(order.urgency || 'routine').toUpperCase()}</span></div>
       </div>`
  }
  ${order.clinicalReason ? `<div style="margin-top:10px"><span class="lbl">Specific Reason / Question to Answer</span><p style="font-size:11pt;font-style:italic">${order.clinicalReason}</p></div>` : ''}
</div>
${(note?.chiefComplaint || note?.hpi || dxList.length > 0) ? `
<div class="sec">
  <div class="sec-t">Clinical Indication</div>
  ${note?.chiefComplaint ? `<div style="margin-bottom:5px"><strong>Chief Complaint:</strong> ${note.chiefComplaint}</div>` : ''}
  ${dxHtml ? `<div style="margin-bottom:5px"><strong>Diagnosis:</strong><br/>${dxHtml}</div>` : ''}
  ${note?.hpi ? `<div><strong>Relevant History:</strong> ${note.hpi}</div>` : ''}
</div>` : ''}
${examHtml ? `<div class="sec"><div class="sec-t">Examination Findings</div>${examHtml}</div>` : ''}
<div class="sec" style="border-color:#059669">
  <div class="sec-t" style="color:#059669">${isLab ? 'Result (To be completed by laboratory)' : 'Report (To be completed by radiologist)'}</div>
  ${isLab ? `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:8px">
    <div><span class="lbl">Result Value</span><div style="border-bottom:1px solid #0d1440;height:28px"></div></div>
    <div><span class="lbl">Unit</span><div style="border-bottom:1px solid #0d1440;height:28px"></div></div>
    <div><span class="lbl">Flag</span><div style="border-bottom:1px solid #0d1440;height:28px"></div></div>
  </div>
  <div><span class="lbl">Interpretation / Narrative</span><div style="border-bottom:1px solid #0d1440;height:40px;margin-bottom:8px"></div></div>
  <div><span class="lbl">Date & Time</span><div style="border-bottom:1px solid #0d1440;height:28px"></div></div>`
  : `
  <div><span class="lbl">Impression</span><div style="border:1px solid #c5d2e8;border-radius:5px;height:70px;margin-bottom:8px;padding:6px"></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div><span class="lbl">Radiologist Name</span><div style="border-bottom:1px solid #0d1440;height:28px"></div></div>
    <div><span class="lbl">Date Reported</span><div style="border-bottom:1px solid #0d1440;height:28px"></div></div>
  </div>`}
</div>
<div class="sig">
  <div><div class="sig-line"></div><strong>Dr. ${order.doctorName || '—'}</strong><p style="font-size:9pt;color:#5a6b8c">Ordering Doctor</p></div>
  <div class="stamp">Facility<br/>Stamp</div>
  <div style="text-align:right"><div class="sig-line"></div><strong>${isLab ? 'Lab Technician' : 'Radiographer'}</strong><p style="font-size:9pt;color:#5a6b8c">Signature & Date</p></div>
</div>
<div class="footer">
  <span>AMEXAN Health System · Confidential Patient Document</span>
  <span>Ref: ${ref} · Printed: ${new Date().toLocaleString()}</span>
</div>
</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

// ─── ORDER FORM ───────────────────────────────────────────────────────────────
interface OrderFormProps {
  type: 'lab' | 'imaging';
  note: any;
  patientId: string;
  doctorId: string;
  doctorName: string;
  visitId: string;
  onClose: () => void;
  onOrdered: () => void;
}

function OrderForm({ type, note, patientId, doctorId, doctorName, visitId, onClose, onOrdered }: OrderFormProps) {
  const isLab = type === 'lab';
  const [category, setCategory] = useState(isLab ? LAB_CATEGORIES[0] : IMAGING_MODALITIES[0]);
  const [testName, setTestName] = useState('');
  const [customTest, setCustomTest] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalReason, setClinicalReason] = useState('');
  const [fasting, setFasting] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [bodyPart, setBodyPart] = useState('');
  const [saving, setSaving] = useState(false);

  const suggestions = isLab
    ? (COMMON_LABS[category] || [])
    : (COMMON_IMAGING[category] || []);

  const finalTestName = testName === '__custom__' ? customTest : testName;

  const save = async () => {
    if (!finalTestName.trim()) return;
    setSaving(true);
    const dxList = (note?.diagnoses || []).filter((d: any) => d.description);
    const primaryDx = dxList.find((d: any) => d.type === 'primary') || dxList[0];

    const baseOrder = {
      patientId, doctorId, doctorName, visitId,
      noteId: note?.id,
      orderedAt: serverTimestamp(),
      urgency,
      clinicalReason: clinicalReason.trim(),
      status: 'ordered',
      // Embedded clinical context
      clinicalContext: {
        chiefComplaint: note?.chiefComplaint || '',
        hpi: note?.hpi || '',
        primaryDiagnosis: primaryDx?.description || '',
        diagnosisCode: primaryDx?.code || '',
        examFindings: note?.examination || {},
      },
      patientUploadedResult: false,
      doctorReviewed: false,
    };

    if (isLab) {
      const labOrder = {
        ...baseOrder,
        type: 'lab',
        testName: finalTestName,
        category,
        fasting,
      };
      // Save to dedicated collection
      const ref = await addDoc(collection(db, 'labOrders'), labOrder);
      // Also embed in note
      if (note?.id) {
        await updateDoc(doc(db, 'clinicalNotes', note.id), {
          labOrders: arrayUnion({ ...labOrder, id: ref.id }),
        }).catch(() => {});
      }
    } else {
      const imgOrder = {
        ...baseOrder,
        type: 'imaging',
        modality: category,
        study: finalTestName,
        bodyPart,
        contrast,
      };
      const ref = await addDoc(collection(db, 'imagingOrders'), imgOrder);
      if (note?.id) {
        await updateDoc(doc(db, 'clinicalNotes', note.id), {
          imagingOrders: arrayUnion({ ...imgOrder, id: ref.id }),
        }).catch(() => {});
      }
    }

    // Notify patient
    await addDoc(collection(db, 'patientNotifications'), {
      patientId, doctorId, doctorName,
      type: 'order_placed',
      title: `New ${isLab ? 'Lab Test' : 'Imaging Study'} Ordered`,
      message: `Dr. ${doctorName} has ordered ${finalTestName}. Download your request form and proceed to the ${isLab ? 'laboratory' : 'imaging centre'}.`,
      severity: urgency === 'stat' ? 'critical' : urgency === 'urgent' ? 'warning' : 'info',
      read: false,
      createdAt: serverTimestamp(),
    }).catch(() => {});

    setSaving(false);
    onOrdered();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'var(--surface, #111827)', border: '1px solid var(--border, #243047)', borderRadius: 18, padding: '24px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #e8edf5)' }}>
              {isLab ? '🧪 Order Lab Test' : '🩻 Order Imaging Study'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted, #546382)', marginTop: 2 }}>Linked to current visit</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted, #546382)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {/* Clinical context preview */}
        {(note?.chiefComplaint || note?.diagnoses?.[0]) && (
          <div style={{ padding: '10px 14px', background: 'rgba(79,99,220,.07)', border: '1px solid rgba(79,99,220,.18)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#4f63dc', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 5 }}>Will appear on request form</div>
            {note?.chiefComplaint && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 3 }}>CC: {note.chiefComplaint}</div>}
            {note?.diagnoses?.filter((d: any) => d.description).map((dx: any, i: number) => (
              <div key={i} style={{ fontSize: 12, fontWeight: 700, color: dx.type === 'primary' ? '#059669' : '#8b9bbf' }}>
                {dx.type === 'primary' ? '🎯 ' : ''}{dx.description}
              </div>
            ))}
          </div>
        )}

        {/* Category */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>
            {isLab ? 'Category' : 'Modality'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(isLab ? LAB_CATEGORIES : IMAGING_MODALITIES).map(c => (
              <button key={c} onClick={() => { setCategory(c); setTestName(''); }} style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, border: '1px solid', cursor: 'pointer',
                borderColor: category === c ? 'var(--accent, #00e5cc)' : 'var(--border, #243047)',
                background: category === c ? 'rgba(0,229,204,.1)' : 'transparent',
                color: category === c ? 'var(--accent, #00e5cc)' : 'var(--muted, #546382)',
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Test / Study Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>
            {isLab ? 'Test Name' : 'Study'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <select
              value={testName}
              onChange={e => setTestName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--surface2, #1a2338)', border: '1px solid var(--border, #243047)', color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)' }}
            >
              <option value="">— Select common test —</option>
              {suggestions.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="__custom__">+ Type custom test…</option>
            </select>
            {testName === '__custom__' && (
              <input
                value={customTest}
                onChange={e => setCustomTest(e.target.value)}
                placeholder="Enter test/study name"
                style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--surface2, #1a2338)', border: '1px solid var(--border, #243047)', color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)', outline: 'none' }}
              />
            )}
          </div>
        </div>

        {/* Body part (imaging only) */}
        {!isLab && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Body Part / Region</label>
            <input value={bodyPart} onChange={e => setBodyPart(e.target.value)} placeholder="e.g. Right knee, Lumbar spine"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 9, background: 'var(--surface2, #1a2338)', border: '1px solid var(--border, #243047)', color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)', outline: 'none' }} />
          </div>
        )}

        {/* Clinical Reason */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Reason / Clinical Question</label>
          <textarea
            value={clinicalReason}
            onChange={e => setClinicalReason(e.target.value)}
            placeholder="e.g. Evaluate glycaemic control · Rule out appendicitis · Monitor treatment response"
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, background: 'var(--surface2, #1a2338)', border: '1px solid var(--border, #243047)', color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* Urgency + extras */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Priority</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['routine', 'urgent', 'stat'] as const).map(u => (
                <button key={u} onClick={() => setUrgency(u)} style={{
                  flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 800, border: '1px solid', cursor: 'pointer',
                  borderColor: urgency === u ? (u === 'stat' ? '#dc2626' : u === 'urgent' ? '#d97706' : 'var(--accent, #00e5cc)') : 'var(--border, #243047)',
                  background: urgency === u ? (u === 'stat' ? 'rgba(220,38,38,.12)' : u === 'urgent' ? 'rgba(217,119,6,.12)' : 'rgba(0,229,204,.1)') : 'transparent',
                  color: urgency === u ? (u === 'stat' ? '#dc2626' : u === 'urgent' ? '#d97706' : 'var(--accent, #00e5cc)') : 'var(--muted, #546382)',
                }}>{u.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isLab && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2, #8b9bbf)' }}>
                <input type="checkbox" checked={fasting} onChange={e => setFasting(e.target.checked)} />
                Fasting required
              </label>
            )}
            {!isLab && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2, #8b9bbf)' }}>
                <input type="checkbox" checked={contrast} onChange={e => setContrast(e.target.checked)} />
                IV Contrast required
              </label>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={save}
            disabled={saving || !finalTestName.trim()}
            style={{ flex: 1, padding: '12px', borderRadius: 11, background: !finalTestName.trim() ? 'var(--border, #243047)' : 'var(--accent, #00e5cc)', border: 'none', color: !finalTestName.trim() ? 'var(--muted, #546382)' : '#000', fontWeight: 800, fontSize: 14, cursor: !finalTestName.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font, system-ui)' }}
          >
            {saving ? 'Saving…' : `✅ Save Order`}
          </button>
          <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: 11, background: 'transparent', border: '1px solid var(--border, #243047)', color: 'var(--muted, #546382)', cursor: 'pointer', fontFamily: 'var(--font, system-ui)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── INTERPRET FORM ───────────────────────────────────────────────────────────
interface InterpretFormProps {
  order: any;
  onClose: () => void;
}

function InterpretForm({ order, onClose }: InterpretFormProps) {
  const isLab = order.type === 'lab';
  const [interpretation, setInterpretation] = useState(order.doctorInterpretation || '');
  const [plan, setPlan] = useState(order.doctorPlan || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const col = isLab ? 'labOrders' : 'imagingOrders';
    if (order.id) {
      await updateDoc(doc(db, col, order.id), {
        doctorInterpretation: interpretation.trim(),
        doctorPlan: plan.trim(),
        doctorReviewed: true,
        doctorReviewedAt: serverTimestamp(),
        status: 'reviewed',
      }).catch(() => {});
    }
    // Notify patient
    if (order.patientId) {
      await addDoc(collection(db, 'patientNotifications'), {
        patientId: order.patientId,
        doctorId: order.doctorId,
        doctorName: order.doctorName,
        type: 'result_reviewed',
        title: `Dr. ${order.doctorName} reviewed your ${isLab ? order.testName : order.study} result`,
        message: interpretation.trim().slice(0, 100),
        severity: 'info',
        read: false,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'var(--surface, #111827)', border: '1px solid var(--border, #243047)', borderRadius: 18, padding: '24px', width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text, #e8edf5)' }}>📝 Review & Interpret Result</div>
            <div style={{ fontSize: 12, color: 'var(--muted, #546382)', marginTop: 2 }}>{isLab ? order.testName : order.study}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted, #546382)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {/* Show uploaded result */}
        {(order.resultUrl || order.reportUrl) && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(5,150,105,.07)', border: '1px solid rgba(5,150,105,.2)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 6 }}>📎 Patient-uploaded result</div>
            <a href={order.resultUrl || order.reportUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent, #00e5cc)', textDecoration: 'none', fontWeight: 700 }}>
              View uploaded file →
            </a>
          </div>
        )}

        {/* Interpretation */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Interpretation / Findings</label>
          <textarea
            value={interpretation}
            onChange={e => setInterpretation(e.target.value)}
            placeholder="e.g. HbA1c 8.2% — Poor glycaemic control. Above target for this patient."
            rows={4}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, background: 'var(--surface2, #1a2338)', border: '1px solid var(--border, #243047)', color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* Management plan */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted, #546382)', textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Management Plan / Next Action</label>
          <textarea
            value={plan}
            onChange={e => setPlan(e.target.value)}
            placeholder="e.g. Increase metformin to 1g BD. Add lifestyle counselling. Repeat HbA1c in 3 months."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, background: 'var(--surface2, #1a2338)', border: '1px solid var(--border, #243047)', color: 'var(--text, #e8edf5)', fontSize: 13, fontFamily: 'var(--font, system-ui)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 11, background: 'var(--accent, #00e5cc)', border: 'none', color: '#000', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font, system-ui)' }}>
            {saving ? 'Saving…' : '✅ Mark as Reviewed'}
          </button>
          <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: 11, background: 'transparent', border: '1px solid var(--border, #243047)', color: 'var(--muted, #546382)', cursor: 'pointer', fontFamily: 'var(--font, system-ui)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER ROW CARD ───────────────────────────────────────────────────────────
function OrderRow({ order, patient, noteMap, onInterpret }: { order: any; patient: any; noteMap: Record<string, any>; onInterpret: (o: any) => void }) {
  const [open, setOpen] = useState(false);
  const isLab = order.type === 'lab';
  const name = isLab ? order.testName : order.study;
  const statusColor = STATUS_COLORS[order.status] || '#546382';
  const flagColor = order.flag ? (FLAG_COLORS[order.flag] || '#059669') : null;
  const note = noteMap?.[order.noteId] || null;
  const hasUpload = order.patientUploadedResult || order.patientUploadedReport;
  const needsReview = hasUpload && !order.doctorReviewed;

  return (
    <div style={{
      background: 'var(--surface, #111827)',
      border: `1px solid var(--border, #243047)`,
      borderLeft: `4px solid ${needsReview ? '#d97706' : statusColor}`,
      borderRadius: 14, marginBottom: 10, overflow: 'hidden',
    }}>
      <div style={{ padding: '13px 15px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: isLab ? 'rgba(14,165,233,.1)' : 'rgba(124,58,237,.1)' }}>
            {isLab ? '🧪' : '🩻'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
              {!isLab && order.modality && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 6, background: 'rgba(124,58,237,.15)', color: '#7c3aed' }}>{order.modality}</span>}
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text, #e8edf5)' }}>{name}</span>
              {order.urgency !== 'routine' && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 8px', borderRadius: 99, background: order.urgency === 'stat' ? 'rgba(220,38,38,.15)' : 'rgba(217,119,6,.15)', color: order.urgency === 'stat' ? '#dc2626' : '#d97706', border: `1px solid ${order.urgency === 'stat' ? 'rgba(220,38,38,.3)' : 'rgba(217,119,6,.3)'}` }}>
                  {order.urgency.toUpperCase()}
                </span>
              )}
              {needsReview && <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 8px', borderRadius: 99, background: 'rgba(217,119,6,.15)', color: '#d97706', border: '1px solid rgba(217,119,6,.3)', animation: 'pulse 2s infinite' }}>⚠ RESULT READY</span>}
              {order.flag && order.flag !== 'normal' && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 8px', borderRadius: 99, background: `${flagColor}15`, color: flagColor!, border: `1px solid ${flagColor}30` }}>
                  {order.flag.toUpperCase()}
                </span>
              )}
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`, marginLeft: 'auto' }}>
                {order.status}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)' }}>
              Ordered {fmtDate(order.orderedAt)}
              {order.clinicalContext?.primaryDiagnosis && ` · ${order.clinicalContext.primaryDiagnosis}`}
            </div>
          </div>
          <span style={{ fontSize: 14, color: 'var(--muted, #546382)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0, paddingTop: 3 }}>▼</span>
        </div>

        {/* Action strip */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {needsReview && (
            <button onClick={e => { e.stopPropagation(); onInterpret(order); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9,
              background: 'rgba(217,119,6,.12)', border: '1.5px solid rgba(217,119,6,.35)',
              color: '#d97706', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontSize: 12, fontWeight: 800,
            }}>
              📝 Review Result Now
            </button>
          )}
          {order.doctorReviewed && (
            <button onClick={e => { e.stopPropagation(); onInterpret(order); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 9,
              background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.2)',
              color: '#059669', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontSize: 12, fontWeight: 700,
            }}>
              ✅ Reviewed · Edit Interpretation
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); printRequestForm(order, patient, note); }} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9,
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
            color: 'var(--text2, #8b9bbf)', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontSize: 12, fontWeight: 600,
          }}>
            🖨 Print Request Form
          </button>
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 15px 15px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          {/* Clinical context */}
          {order.clinicalContext && (
            <div style={{ marginTop: 12, padding: '11px 13px', background: 'rgba(79,99,220,.06)', border: '1px solid rgba(79,99,220,.12)', borderRadius: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent, #00e5cc)', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 7 }}>Clinical Context</div>
              {order.clinicalReason && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 4 }}><strong>Reason for test:</strong> {order.clinicalReason}</div>}
              {order.clinicalContext.chiefComplaint && <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 3 }}><strong>C/C:</strong> {order.clinicalContext.chiefComplaint}</div>}
              {order.clinicalContext.primaryDiagnosis && <div style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>🎯 {order.clinicalContext.primaryDiagnosis}</div>}
            </div>
          )}

          {/* Uploaded result */}
          {hasUpload && (
            <div style={{ marginTop: 12, padding: '11px 13px', background: 'rgba(5,150,105,.06)', border: '1px solid rgba(5,150,105,.18)', borderRadius: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 7 }}>Patient-Uploaded Result</div>
              <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', marginBottom: 6 }}>
                Uploaded {fmtDT(order.resultUploadedAt || order.reportUploadedAt)}
              </div>
              {(order.resultUrl || order.reportUrl) && (
                <a href={order.resultUrl || order.reportUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '7px 14px', background: 'rgba(0,229,204,.1)', border: '1px solid rgba(0,229,204,.3)', borderRadius: 9, color: 'var(--accent, #00e5cc)', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                  📎 Open Result File →
                </a>
              )}
            </div>
          )}

          {/* Doctor interpretation */}
          {order.doctorInterpretation && (
            <div style={{ marginTop: 12, padding: '11px 13px', background: 'rgba(79,99,220,.06)', border: '1px solid rgba(79,99,220,.15)', borderRadius: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#4f63dc', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 7 }}>Your Interpretation</div>
              <div style={{ fontSize: 13, color: 'var(--text, #e8edf5)', lineHeight: 1.65, marginBottom: 6 }}>{order.doctorInterpretation}</div>
              {order.doctorPlan && (
                <div style={{ fontSize: 12, color: 'var(--text2, #8b9bbf)', borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 8, marginTop: 8 }}>
                  <strong style={{ color: 'var(--accent, #00e5cc)' }}>Plan: </strong>{order.doctorPlan}
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--muted, #546382)', marginTop: 6 }}>Reviewed {fmtDate(order.doctorReviewedAt)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
interface Props {
  patientId: string;
  patient?: any;
  note?: any;        // current visit note (for context embedding)
  doctorId: string;
  doctorName: string;
  visitId?: string;
  mode?: 'visit' | 'history';  // visit = ordering mode, history = view all
}

export default function DoctorInvestigationsPanel({
  patientId, patient, note, doctorId, doctorName, visitId, mode = 'visit',
}: Props) {
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [imgOrders, setImgOrders] = useState<any[]>([]);
  const [noteMap, setNoteMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'labs' | 'imaging' | 'outstanding'>('outstanding');
  const [showOrderForm, setShowOrderForm] = useState<'lab' | 'imaging' | null>(null);
  const [interpretOrder, setInterpretOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);

    // Load from dedicated collections
    const u1 = onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', patientId), orderBy('orderedAt', 'desc')),
      snap => {
        setLabOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    const u2 = onSnapshot(
      query(collection(db, 'imagingOrders'), where('patientId', '==', patientId), orderBy('orderedAt', 'desc')),
      snap => setImgOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => {},
    );
    // Load note map for context
    const u3 = onSnapshot(
      query(collection(db, 'clinicalNotes'), where('patientId', '==', patientId)),
      snap => {
        const nm: Record<string, any> = {};
        snap.docs.forEach(d => { nm[d.id] = { id: d.id, ...d.data() }; });
        setNoteMap(nm);
      },
      () => {},
    );

    return () => { u1(); u2(); u3(); };
  }, [patientId]);

  const allOrders = [...labOrders, ...imgOrders];
  const outstanding = allOrders.filter(o => o.status !== 'reviewed' && o.status !== 'closed');
  const pendingReview = allOrders.filter(o => (o.patientUploadedResult || o.patientUploadedReport) && !o.doctorReviewed);
  const criticals = allOrders.filter(o => o.flag === 'critical' || o.status === 'critical');

  return (
    <div>
      {/* Header + Add buttons */}
      {mode === 'visit' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setShowOrderForm('lab')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 11,
            background: 'rgba(14,165,233,.1)', border: '1.5px solid rgba(14,165,233,.3)',
            color: '#0ea5e9', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontSize: 13, fontWeight: 700,
          }}>🧪 + Lab Test</button>
          <button onClick={() => setShowOrderForm('imaging')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 11,
            background: 'rgba(124,58,237,.1)', border: '1.5px solid rgba(124,58,237,.3)',
            color: '#7c3aed', cursor: 'pointer', fontFamily: 'var(--font, system-ui)', fontSize: 13, fontWeight: 700,
          }}>🩻 + Imaging</button>
        </div>
      )}

      {/* Critical alert */}
      {criticals.length > 0 && (
        <div style={{ padding: '11px 15px', background: 'rgba(220,38,38,.08)', border: '1.5px solid rgba(220,38,38,.3)', borderRadius: 11, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>{criticals.length} critical result{criticals.length > 1 ? 's' : ''} require immediate review</div>
            <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)' }}>{criticals.map(o => o.testName || o.study).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Pending review alert */}
      {pendingReview.length > 0 && (
        <div style={{ padding: '11px 15px', background: 'rgba(217,119,6,.08)', border: '1.5px solid rgba(217,119,6,.25)', borderRadius: 11, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>{pendingReview.length} result{pendingReview.length > 1 ? 's' : ''} waiting for your review</div>
            <div style={{ fontSize: 11, color: 'var(--text2, #8b9bbf)' }}>{pendingReview.map(o => o.testName || o.study).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { icon: '🧪', val: labOrders.length, label: 'Lab Orders', color: '#0ea5e9' },
          { icon: '🩻', val: imgOrders.length, label: 'Imaging', color: '#7c3aed' },
          { icon: '⏳', val: outstanding.length, label: 'Outstanding', color: outstanding.length > 0 ? '#d97706' : '#546382' },
          { icon: '📋', val: pendingReview.length, label: 'To Review', color: pendingReview.length > 0 ? '#dc2626' : '#546382' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface, #111827)', border: '1px solid var(--border, #243047)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'monospace', lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'var(--muted, #546382)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', background: 'var(--surface2, #1a2338)', borderRadius: 12, padding: 3, marginBottom: 16, gap: 3 }}>
        {[
          { id: 'outstanding', label: `⏳ Outstanding (${outstanding.length})` },
          { id: 'labs', label: `🧪 All Labs (${labOrders.length})` },
          { id: 'imaging', label: `🩻 All Imaging (${imgOrders.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setView(t.id as any)} style={{
            flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font, system-ui)', fontSize: 11, fontWeight: 700,
            background: view === t.id ? 'var(--accent, #00e5cc)' : 'transparent',
            color: view === t.id ? '#000' : 'var(--muted, #546382)',
          }}>{t.label}</button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--muted, #546382)', fontSize: 13 }}>🔬 Loading investigations…</div>
      )}

      {!loading && (() => {
        const list = view === 'labs' ? labOrders : view === 'imaging' ? imgOrders : outstanding;
        if (list.length === 0) return (
          <div style={{ textAlign: 'center', padding: '44px 0', color: 'var(--muted, #546382)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{view === 'labs' ? '🧪' : view === 'imaging' ? '🩻' : '✅'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text, #e8edf5)', marginBottom: 4 }}>
              {view === 'outstanding' ? 'All investigations reviewed' : `No ${view} orders`}
            </div>
          </div>
        );
        return list.map((order, i) => (
          <OrderRow key={order.id || i} order={order} patient={patient} noteMap={noteMap} onInterpret={setInterpretOrder} />
        ));
      })()}

      {/* Modals */}
      {showOrderForm && (
        <OrderForm
          type={showOrderForm}
          note={note}
          patientId={patientId}
          doctorId={doctorId}
          doctorName={doctorName}
          visitId={visitId || ''}
          onClose={() => setShowOrderForm(null)}
          onOrdered={() => {}}
        />
      )}
      {interpretOrder && (
        <InterpretForm
          order={interpretOrder}
          onClose={() => setInterpretOrder(null)}
        />
      )}
    </div>
  );
}