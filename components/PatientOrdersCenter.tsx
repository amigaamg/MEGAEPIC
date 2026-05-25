'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { expandPanel, isPanelTest, getPanelDefinition } from '@/src/data/investigationGroups';

/* ═══ Uploadcare Config ═══ */
const UC_PUB_KEY = '205b104100680fa4f052';
let ucLoaded = false;
const loadUploadcare = (): Promise<void> => new Promise(res => {
  if (typeof window !== 'undefined' && (window as any).uploadcare) { ucLoaded = true; res(); return; }
  const s = document.createElement('script');
  s.src = `https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js`;
  s.async = true;
  s.onload = () => { ucLoaded = true; res(); };
  document.head.appendChild(s);
});

/* ═══ Helpers ═══ */
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  try { const d = ts?.toDate ? ts.toDate() : new Date(ts); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '—'; }
};
const fmtDT = (ts: any) => {
  if (!ts) return '—';
  try { const d = ts?.toDate ? ts.toDate() : new Date(ts); return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; }
};
const fmtTime = (ts: any) => {
  if (!ts) return '';
  try { const d = ts?.toDate ? ts.toDate() : new Date(ts); return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
};

const STATUS_LABELS: Record<string, string> = {
  ordered: 'Order Created', collected: 'Sample Collected', processing: 'Processing',
  resulted: 'Results Ready', reviewed: 'Doctor Reviewed', scheduled: 'Appointment Made',
  performed: 'Study Done', reported: 'Report Ready', closed: 'Completed',
};
const JOURNEY_STEPS_LAB = ['ordered', 'collected', 'processing', 'resulted', 'reviewed'];
const JOURNEY_STEPS_IMG = ['ordered', 'scheduled', 'performed', 'reported', 'reviewed'];

const printPatientOrder = (o: any, ws: any) => {
  if (!o) return;
  const isLab = o._type !== 'imaging';
  const now = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
  const ref = `ORD-${o.id?.slice(-8).toUpperCase() || 'N/A'}`;
  const tests = (o.tests || []);
  const testRows = tests.flatMap((t: string, i: number) => {
    const panelDef = getPanelDefinition(t);
    if (panelDef) {
      const allAnalytes = panelDef.sections.flatMap(s => s.analytes);
      const mainRow = `<tr><td style="text-align:center;width:30px;font-weight:700">${i + 1}</td><td><strong>${t}</strong><br><span style="font-size:8pt;color:#64748b">${panelDef.purpose}</span></td><td>${isLab ? (o.specimenType || 'Blood') : (o.bodySite || '—')}</td><td style="font-size:8pt;color:#64748b">${o.clinicalIndication ? o.clinicalIndication.slice(0, 60) : '—'}</td></tr>`;
      const analyteRows = allAnalytes.map((a, ai) =>
        `<tr><td style="text-align:center;color:#94a3b8;font-size:8pt"></td><td style="padding-left:16px;font-size:8pt;color:#475569">${a.name} <span style="color:#94a3b8">(${a.refRange} ${a.unit})</span></td><td style="font-size:8pt"></td><td style="font-size:8pt"></td></tr>`
      ).join('');
      return [mainRow, analyteRows];
    }
    return [`<tr><td style="text-align:center;width:30px">${i + 1}</td><td><strong>${t}</strong></td><td>${isLab ? (o.specimenType || 'Blood') : (o.bodySite || '—')}</td><td style="font-size:9pt;color:#64748b">${o.clinicalIndication ? o.clinicalIndication.slice(0, 60) : '—'}</td></tr>`];
  }).join('');
  const html = `<!DOCTYPE html><html><head><title>Test Order</title>
  <style>
    @page { margin: 10mm 10mm; size: A4; }
    body { font-family: 'Times New Roman', serif; color: #1a1a1a; padding: 0; margin: 0; font-size: 10pt; line-height: 1.4; }
    .header { text-align: center; border-bottom: 2px solid #0F766E; padding-bottom: 8px; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 15pt; color: #0F766E; }
    .header p { margin: 1px 0; font-size: 8pt; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0; }
    td, th { padding: 4px 6px; text-align: left; border: 1px solid #d1d5db; font-size: 9pt; }
    th { background: #f1f5f9; font-weight: 700; font-size: 8pt; text-transform: uppercase; color: #475569; }
    .section { font-weight: 700; font-size: 10pt; margin: 10px 0 3px; color: #0F766E; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
    .footer { text-align: center; font-size: 7pt; color: #94a3b8; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 6px; }
    .info-table td:first-child { font-weight: 600; width: 28%; color: #475569; background: #f8fafc; }
    .sig { display: flex; justify-content: space-between; margin-top: 20px; }
    .sig-box { width: 45%; }
    .sig-line { border-bottom: 1px solid #1a1a1a; height: 18px; margin-top: 3px; }
    .lbl { font-size: 7pt; color: #64748b; }
  </style></head><body>
  <div class="header">
    <h1>AMEXAN Health System</h1>
    <p>Patient Investigation Order Form</p>
    <p>Reference: ${ref} · ${now}</p>
  </div>
  <table class="info-table">
    <tr><td>Patient</td><td>${ws?.name || 'Patient'}</td><td>Date</td><td>${new Date().toLocaleDateString('en-KE')}</td></tr>
    <tr><td>Type</td><td>${isLab ? 'Laboratory' : 'Imaging'}</td><td>Urgency</td><td>${(o.urgency || 'routine').toUpperCase()}</td></tr>
    <tr><td>Indication</td><td colspan="3">${o.clinicalIndication || '—'}</td></tr>
    ${o.facilityName ? `<tr><td>Facility</td><td colspan="3">${o.facilityName}</td></tr>` : ''}
    ${isLab && o.fastingRequired ? `<tr><td>Fasting</td><td colspan="3">Required (8+ hours) — morning collection preferred</td></tr>` : ''}
  </table>
  <div class="section">Tests Ordered (${tests.length})</div>
  <table>
    <tr><th style="width:30px">#</th><th>Test Name</th><th>Specimen / Site</th><th>Clinical Context</th></tr>
    ${testRows}
  </table>
  ${o.notes ? `<div class="section">Additional Notes</div><div style="background:#f8fafc;padding:6px 10px;border-radius:4px;font-size:9pt">${o.notes}</div>` : ''}
  ${o.patientExplanation ? `<div class="section">Your Doctor's Explanation</div><div style="background:#f0fdf4;padding:6px 10px;border-radius:4px;font-size:9pt">${o.patientExplanation}</div>` : ''}
  <div class="sig">
    <div class="sig-box"><div class="lbl">Ordering Doctor</div><div class="sig-line">${o.doctorName || '—'}</div></div>
    <div class="sig-box"><div class="lbl">Patient / Guardian Signature</div><div class="sig-line"></div></div>
  </div>
  <div class="footer">Present at reception · ${ref} · Printed ${now}</div>
  <script>window.print()</script></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
};

/* ═══ Props ═══ */
interface Props {
  patientId: string;
  patientName?: string;
  patient?: any;
  onOpenChat?: (doctorId: string, doctorName: string) => void;
}

/* ═══ Types ═══ */
interface Workspace {
  id: string; patientId: string; name: string; clinicalProblem: string;
  suspectedDiagnoses: string[]; clinicalQuestions: string[];
  status: string; urgency: string; createdBy: string; createdAt: any; notes: string;
}

/* ═══ Component ═══ */
export default function PatientOrdersCenter({ patientId, patientName, patient, onOpenChat }: Props) {
  /* ── State ── */
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [imaging, setImaging] = useState<any[]>([]);
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'journeys' | 'actions' | 'timeline' | 'results'>('journeys');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [uploadItem, setUploadItem] = useState<any>(null);
  const [uploadType, setUploadType] = useState<'lab' | 'imaging'>('lab');
  const [uploadStep, setUploadStep] = useState<'categorize' | 'upload' | 'confirm'>('categorize');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showInterpretation, setShowInterpretation] = useState<any>(null);
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const [wsMsgText, setWsMsgText] = useState('');
  const [wsMsgSending, setWsMsgSending] = useState(false);
  const [ocrExtracting, setOcrExtracting] = useState(false);
  const [ocrText, setOcrText] = useState('');

  /* ── Data fetching ── */
  useEffect(() => {
    if (!patientId) return;
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(
      query(collection(db, 'investigationWorkspaces'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(20)),
      snap => setWorkspaces(snap.docs.map(d => ({ id: d.id, ...d.data() } as Workspace)))
    ));
    unsubs.push(onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(50)),
      snap => setLabs(snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'lab' })))
    ));
    unsubs.push(onSnapshot(
      query(collection(db, 'imagingOrders'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(50)),
      snap => setImaging(snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'imaging' })))
    ));
    return () => unsubs.forEach(u => u());
  }, [patientId]);

  /* ── Workspace messages subscription ── */
  useEffect(() => {
    if (!activeJourney) { setWsMessages([]); return; }
    const q = query(
      collection(db, 'workspaceMessages'),
      where('workspaceId', '==', activeJourney),
      orderBy('createdAt', 'asc'),
      limit(50),
    );
    const unsub = onSnapshot(q, snap => setWsMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [activeJourney]);

  const sendWsMessage = useCallback(async () => {
    if (!wsMsgText.trim() || !activeJourney || !patientId) return;
    setWsMsgSending(true);
    try {
      await addDoc(collection(db, 'workspaceMessages'), {
        workspaceId: activeJourney,
        patientId,
        text: wsMsgText.trim(),
        senderRole: 'patient',
        senderName: patientName || 'Patient',
        createdAt: serverTimestamp(),
      });
      setWsMsgText('');
    } catch (e) { console.error('Failed to send message:', e); }
    setWsMsgSending(false);
  }, [wsMsgText, activeJourney, patientId, patientName]);

  /* ── Merged orders ── */
  const allOrders = useMemo(() => {
    return [...labs, ...imaging].sort((a: any, b: any) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return tb.getTime() - ta.getTime();
    });
  }, [labs, imaging]);

  /* ── Active journey data ── */
  const activeWs = useMemo(() => workspaces.find(w => w.id === activeJourney), [workspaces, activeJourney]);
  const journeyOrders = useMemo(() => {
    if (!activeJourney) return [];
    return allOrders.filter((o: any) => o.workspaceId === activeJourney);
  }, [allOrders, activeJourney]);

  /* ── Pending actions ── */
  const pendingActions = useMemo(() => {
    const actions: { id: string; type: string; label: string; icon: string; order: any; due?: string; priority: string }[] = [];
    allOrders.forEach((o: any) => {
      if (!o.uploadUrl && !o.fileUrl && (o.status === 'ordered' || o.status === 'collected')) {
        actions.push({
          id: o.id, type: 'upload', label: `Upload ${(o.tests || ['result']).join(', ')}`, icon: o._type === 'imaging' ? '🩻' : '🧪',
          order: o, priority: o.urgency || 'routine',
        });
      }
      if ((o.uploadUrl || o.fileUrl) && o.interpreted && o.interpretationImpression) {
        actions.push({
          id: o.id, type: 'review', label: `Review result: ${(o.tests || []).join(', ')}`, icon: '📋',
          order: o, priority: 'routine',
        });
      }
    });
    const criticals = allOrders.filter((o: any) => o.structuredResults?.some((sr: any) => sr.flag === 'critical'));
    criticals.forEach(o => {
      if (!actions.find(a => a.id === o.id)) {
        actions.push({ id: o.id, type: 'critical', label: `Important: ${(o.tests || []).join(', ')} needs attention`, icon: '🚨', order: o, priority: 'critical' });
      }
    });
    return actions.sort((a, b) => {
      const rank = { critical: 0, stat: 1, urgent: 2, routine: 3 };
      return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3);
    });
  }, [allOrders]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: allOrders.length,
    pendingUpload: allOrders.filter((o: any) => !o.uploadUrl && !o.fileUrl && o.status !== 'reviewed').length,
    received: allOrders.filter((o: any) => o.uploadUrl || o.fileUrl).length,
    reviewed: allOrders.filter((o: any) => o.interpreted).length,
    critical: allOrders.filter((o: any) => o.structuredResults?.some((sr: any) => sr.flag === 'critical')).length,
  }), [allOrders]);

  /* ── Uploadcare upload handler ── */
  const openUploadcare = useCallback(async () => {
    await loadUploadcare();
    const uc = (window as any).uploadcare;
    if (!uc) { alert('Upload service loading. Please try again.'); return; }
    const dialog = uc.openDialog(null, {
      publicKey: UC_PUB_KEY, multiple: false,
      imagesOnly: false, previewStep: true,
      crop: false,
    });
    dialog.done((file: any) => {
      file.promise().then((info: any) => {
        setUploadFileUrl(info.cdnUrl || info.originalUrl);
        setUploadFileName(info.originalFilename || 'uploaded_file');
        setUploadStep('confirm');
        setUploading(false);
      });
    });
  }, []);

  const runPatientOcr = useCallback(async (imageUrl: string) => {
    setOcrExtracting(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.text) {
        setOcrText(data.text);
      } else {
        alert('No text could be extracted from this image.');
      }
    } catch (e) {
      console.error('OCR failed:', e);
      alert('OCR extraction failed.');
    }
    setOcrExtracting(false);
  }, []);

  const submitUpload = useCallback(async () => {
    if (!uploadItem || !uploadFileUrl) return;
    setUploading(true);
    try {
      const col = uploadItem._type === 'imaging' ? 'imagingOrders' : 'labOrders';
      await updateDoc(doc(db, col, uploadItem.id), {
        uploadUrl: uploadFileUrl,
        fileName: uploadFileName,
        uploadCategory: uploadCategory || undefined,
        patientUploadedResult: true,
        uploadedBy: patientName || 'Patient',
        uploadedAt: serverTimestamp(),
        status: 'resulted',
      });
      await addDoc(collection(db, 'doctorNotifications'), {
        patientId, patientName: patientName || 'Patient',
        type: 'result_upload', orderId: uploadItem.id,
        tests: uploadItem.tests,
        title: `📎 Result uploaded: ${(uploadItem.tests || []).join(', ')}`,
        message: `${patientName || 'Patient'} has uploaded results for ${(uploadItem.tests || []).join(', ')}.`,
        read: false, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'lab',
        title: `📎 ${uploadItem._type === 'imaging' ? 'Imaging' : 'Lab'} result uploaded: ${(uploadItem.tests || []).join(', ')}`,
        icon: uploadItem._type === 'imaging' ? '🩻' : '🧪', createdAt: serverTimestamp(),
      });
      setShowUploadModal(false);
      setUploadItem(null);
      setUploadFileUrl('');
      setUploadFileName('');
      setUploadCategory('');
      setUploadStep('categorize');
      setOcrText('');
    } catch (e) { console.error('Upload failed:', e); }
    setUploading(false);
  }, [uploadItem, uploadFileUrl, uploadFileName, uploadCategory, patientId, patientName]);

  /* ── Journey summary helper ── */
  const journeySummary = useMemo(() => {
    return workspaces.filter(ws => ws.status === 'active').map(ws => {
      const orders = allOrders.filter((o: any) => o.workspaceId === ws.id);
      return {
        ...ws,
        total: orders.length,
        pending: orders.filter((o: any) => !o.uploadUrl && !o.fileUrl).length,
        completed: orders.filter((o: any) => o.interpreted).length,
        awaitingReview: orders.filter((o: any) => o.uploadUrl && !o.interpreted).length,
        recentOrder: orders.length > 0 ? orders[0] : null,
      };
    });
  }, [workspaces, allOrders]);

  /* ── Upload modal ── */
  const renderUploadModal = () => {
    if (!showUploadModal) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
      }} onClick={() => setShowUploadModal(false)}>
        <div style={{
          background: 'var(--white)', borderRadius: 16, maxWidth: 520, width: '100%',
          boxShadow: '0 25px 80px rgba(0,0,0,.3)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
        }} onClick={e => e.stopPropagation()}>
          {uploadStep === 'categorize' && (
            <>
              <div style={{ fontWeight: 800, fontSize: 16 }}>📤 What are you uploading?</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                For: <strong>{(uploadItem?.tests || []).join(', ')}</strong>
                {uploadItem?.workspaceId && <span> · {workspaces.find(w => w.id === uploadItem.workspaceId)?.name || ''}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { id: 'lab_report', label: 'Lab Report', icon: '🧪' },
                  { id: 'xray', label: 'X-ray', icon: '🩻' },
                  { id: 'ct_scan', label: 'CT Scan', icon: '🔄' },
                  { id: 'mri', label: 'MRI', icon: '🧠' },
                  { id: 'ultrasound', label: 'Ultrasound', icon: '🔊' },
                  { id: 'ecg', label: 'ECG', icon: '📈' },
                  { id: 'photo', label: 'Photo', icon: '📸' },
                  { id: 'other', label: 'Other Document', icon: '📄' },
                ].map(cat => (
                  <button key={cat.id} onClick={() => { setUploadCategory(cat.id); setUploadStep('upload'); }} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                    border: `2px solid ${uploadCategory === cat.id ? '#0F766E' : 'var(--border)'}`,
                    borderRadius: 10, background: uploadCategory === cat.id ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
                    color: 'var(--text)', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 20 }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {uploadStep === 'upload' && (
            <>
              <div style={{ fontWeight: 800, fontSize: 16 }}>📤 Upload {uploadCategory.replace('_', ' ')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Choose how to upload your {uploadCategory.replace('_', ' ')} result.</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: '📸', label: 'Take Photo', hint: 'Use camera' },
                  { icon: '🖼️', label: 'Choose from Gallery', hint: 'Photos' },
                  { icon: '📄', label: 'Upload PDF', hint: 'Documents' },
                ].map(opt => (
                  <button key={opt.label} onClick={() => { openUploadcare(); }} style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '16px 8px', border: '2px dashed var(--border)', borderRadius: 12,
                    background: 'var(--bg)', cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>
                    <span style={{ fontSize: 28 }}>{opt.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>{opt.hint}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setUploadStep('categorize')} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', alignSelf: 'flex-start',
              }}>← Back</button>
            </>
          )}

          {uploadStep === 'confirm' && (
            <>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>✅ File Selected</div>
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{uploadFileName}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{uploadCategory?.replace('_', ' ')} result</div>
                  <div style={{ fontSize: 10, color: '#2563eb', wordBreak: 'break-all' }}>{uploadFileUrl?.slice(0, 60)}...</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                This will be attached to <strong>{(uploadItem?.tests || []).join(', ')}</strong>
                {uploadItem?.workspaceId && workspaces.find(w => w.id === uploadItem.workspaceId) && (
                  <span> in <strong>{workspaces.find(w => w.id === uploadItem.workspaceId)?.name}</strong></span>
                )}.
              </div>
              {uploadFileUrl?.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                <div>
                  <button onClick={() => runPatientOcr(uploadFileUrl)} disabled={ocrExtracting} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    background: ocrExtracting ? '#ccc' : '#f8fafc', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font)', color: 'var(--text)',
                  }}>{ocrExtracting ? '🔍 Extracting text…' : '🔍 Extract Text from Image'}</button>
                  {ocrText && (
                    <textarea value={ocrText} onChange={e => setOcrText(e.target.value)}
                      placeholder="Extracted text from image appears here…"
                      rows={4} style={{
                        marginTop: 6, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
                        fontSize: 11, width: '100%', background: 'var(--bg)', outline: 'none',
                        fontFamily: 'var(--mono)', resize: 'vertical',
                      }} />
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button onClick={() => setShowUploadModal(false)} style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Cancel</button>
                <button onClick={submitUpload} disabled={uploading} style={{
                  background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  opacity: uploading ? 0.6 : 1,
                }}>{uploading ? 'Uploading…' : '✅ Confirm Upload'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ── Interpretation display modal ── */
  const renderInterpretation = () => {
    if (!showInterpretation) return null;
    const o = showInterpretation;
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
      }} onClick={() => setShowInterpretation(null)}>
        <div style={{
          background: 'var(--white)', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,.3)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {o._type === 'imaging' ? '🩻' : '🧪'} Result Details: {(o.tests || []).join(', ')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>From {fmtDate(o.createdAt)} · {(o.doctorName || 'Your doctor')}</div>

          {/* Doctor's clinical context */}
          {o.clinicalIndication && (
            <div style={{ padding: '8px 12px', background: '#fefce8', borderRadius: 8, borderLeft: '3px solid #ca8a04', fontSize: 12 }}>
              <strong>Why this was ordered:</strong> {o.clinicalIndication}
            </div>
          )}

          {/* Results */}
          {o.structuredResults?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Results</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                {o.structuredResults.map((sr: any, i: number) => {
                  const isAbnormal = sr.flag === 'high' || sr.flag === 'low' || sr.flag === 'critical';
                  return (
                    <div key={i} style={{
                      background: isAbnormal ? '#fef2f2' : '#f0fdf4',
                      borderRadius: 8, padding: '8px 10px', border: sr.flag === 'critical' ? '1px solid #dc262630' : 'none',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{sr.test}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: isAbnormal ? '#dc2626' : 'var(--text)' }}>
                        {sr.value} <span style={{ fontSize: 11, fontWeight: 400 }}>{sr.unit}</span>
                      </div>
                      {sr.flag && <div style={{ fontSize: 10, fontWeight: 700, color: sr.flag === 'critical' ? '#dc2626' : '#f97316' }}>{sr.flag.toUpperCase()}</div>}
                      {sr.range && <div style={{ fontSize: 9, color: 'var(--muted)' }}>Normal range: {sr.range}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Doctor interpretation */}
          {o.interpretationImpression && (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, borderLeft: '3px solid #16a34a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>💬 Doctor's Review</div>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>"{o.interpretationImpression}"</div>
              {o.interpretationRecommendation && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#166534' }}>
                  <strong>Recommended next steps:</strong> {o.interpretationRecommendation}
                </div>
              )}
              {o.interpretedBy && <div style={{ fontSize: 10, color: '#166534', marginTop: 4 }}>Reviewed by Dr. {o.interpretedBy}</div>}
            </div>
          )}

          {!o.interpretationImpression && o.interpreted && (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: '#166534' }}>✓ Your doctor has reviewed this result and marked it as reviewed.</div>
            </div>
          )}

          {!o.interpreted && (
            <div style={{ padding: '10px 14px', background: '#fefce8', borderRadius: 10, border: '1px solid #ca8a0430' }}>
              <div style={{ fontSize: 12, color: '#ca8a04' }}>⏳ Your doctor hasn't reviewed this result yet. Check back soon.</div>
            </div>
          )}

          {o.uploadUrl && (
            <a href={o.uploadUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: 8,
              fontSize: 12, fontWeight: 700, textDecoration: 'none', alignSelf: 'flex-start',
            }}>📎 View Uploaded File</a>
          )}

          <button onClick={() => {
            if (onOpenChat && o.doctorId) onOpenChat(o.doctorId, o.doctorName || 'Doctor');
            setShowInterpretation(null);
          }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
            alignSelf: 'flex-start',
          }}>💬 Message Your Doctor About This Result</button>
        </div>
      </div>
    );
  };

  /* ── JOURNEYS VIEW ── */
  const renderJourneys = () => {
    if (activeJourney && activeWs) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setActiveJourney(null)} style={{
            display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
            fontSize: 12, color: '#0F766E', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', padding: 0,
          }}>← All Health Journeys</button>

          {/* Journey Header */}
          <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', padding: 16, borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>📋 {activeWs.name}</div>
                {activeWs.clinicalProblem && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{activeWs.clinicalProblem}</div>}
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Started {fmtDate(activeWs.createdAt)} · Dr. {activeWs.createdBy || 'Your Doctor'} · {journeyOrders.length} test{journeyOrders.length !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {onOpenChat && <button onClick={() => onOpenChat('', activeWs.createdBy || 'Doctor')} style={{
                  background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>💬 Message Doctor</button>}
              </div>
            </div>

            {activeWs.suspectedDiagnoses?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {activeWs.suspectedDiagnoses.map((d: string, i: number) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 600, background: '#fefce8', color: '#ca8a04', borderRadius: 99, padding: '2px 8px' }}>{d}</span>
                ))}
              </div>
            )}

            {activeWs.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text)', background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>📝 {activeWs.notes}</div>}
          </div>

          {/* Tasks */}
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>Your Tasks ({journeyOrders.length} test{journeyOrders.length !== 1 ? 's' : ''})</div>
          {journeyOrders.map((o: any, idx: number) => {
            const steps = o._type === 'imaging' ? JOURNEY_STEPS_IMG : JOURNEY_STEPS_LAB;
            const currentIdx = steps.indexOf(o.status);
            const isUploaded = !!(o.uploadUrl || o.fileUrl);
            const isReviewed = o.interpreted;
            const needsUpload = !isUploaded && o.status !== 'reviewed';
            return (
              <div key={o.id} style={{
                background: 'var(--white)', borderRadius: 12, border: needsUpload ? '1px solid #f9731630' : isReviewed ? '1px solid #16a34a30' : '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{o._type === 'imaging' ? '🩻' : '🧪'} #{idx + 1} {isPanelTest((o.tests || [])[0]) ? (
                        <span title={expandPanel((o.tests || [])[0]).join(', ')}>
                          {expandPanel((o.tests || [])[0])[0]} <span style={{ fontSize: 9, fontWeight: 400, color: 'var(--muted)' }}>+{expandPanel((o.tests || [])[0]).length - 1} more components</span>
                        </span>
                      ) : (o.tests || []).join(', ')}</span>
                      {o.recurrence && <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', background: '#0F766E', borderRadius: 4, padding: '1px 5px' }}>🔄 {o.recurrence}</span>}
                      {isReviewed && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', borderRadius: 99, padding: '1px 6px' }}>✅ Reviewed</span>}
                      {isUploaded && !isReviewed && <span style={{ fontSize: 9, fontWeight: 700, color: '#ca8a04', background: '#fefce8', borderRadius: 99, padding: '1px 6px' }}>📎 Awaiting Review</span>}
                      {needsUpload && <span style={{ fontSize: 9, fontWeight: 700, color: '#f97316', background: '#fff7ed', borderRadius: 99, padding: '1px 6px' }}>⏳ Needs Upload</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Ordered {fmtDate(o.createdAt)} {o.urgency === 'stat' || o.urgency === 'urgent' ? `· ${o.urgency.toUpperCase()}` : ''}
                      {o.facilityName && <span> · {o.facilityName}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{expandedOrder === o.id ? '▲' : '▼'}</span>
                </div>

                {expandedOrder === o.id && (
                  <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    {/* Journey tracker */}
                    <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                      {steps.map((step, i) => {
                        const done = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: done ? (isCurrent && needsUpload ? '#f97316' : '#16a34a') : 'var(--border)',
                              color: '#fff', fontSize: 9, fontWeight: 700,
                            }}>{done ? (isCurrent && needsUpload ? '!' : '✓') : i + 1}</div>
                            <div style={{ fontSize: 7, color: done ? '#16a34a' : 'var(--muted)', textAlign: 'center', maxWidth: 60 }}>{STATUS_LABELS[step] || step}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Clinical context */}
                    {o.clinicalIndication && <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: 8, padding: '6px 8px', background: '#f8fafc', borderRadius: 6 }}>💡 {o.clinicalIndication}</div>}

                    {/* Panel analyte breakdown */}
                    {isPanelTest((o.tests || [])[0]) && (() => {
                      const def = getPanelDefinition((o.tests || [])[0]);
                      if (!def) return null;
                      return (
                        <div style={{ marginBottom: 8, background: '#f8fafc', borderRadius: 8, padding: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#0F766E', marginBottom: 4 }}>🧪 {def.purpose}</div>
                          {def.sections.map((s, si) => (
                            <div key={si} style={{ marginBottom: 4 }}>
                              <div style={{ fontSize: 9, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>{s.icon} {s.label}</div>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {s.analytes.map((a, ai) => (
                                  <span key={ai} style={{ fontSize: 10, background: '#fff', borderRadius: 4, padding: '1px 6px', border: '1px solid #e2e8f0', color: '#475569' }}>
                                    {a.name} <span style={{ color: '#94a3b8' }}>({a.refRange} {a.unit})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Results display */}
                    {isUploaded && o.structuredResults?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Results</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 4 }}>
                          {o.structuredResults.map((sr: any, i: number) => (
                            <div key={i} style={{
                              background: sr.flag === 'critical' ? '#fef2f2' : sr.flag === 'high' || sr.flag === 'low' ? '#fff7ed' : '#f0fdf4',
                              borderRadius: 6, padding: '6px 8px',
                            }}>
                              <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>{sr.test}</div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: sr.flag === 'critical' ? '#dc2626' : 'var(--text)' }}>
                                {sr.value} <span style={{ fontWeight: 400, fontSize: 10 }}>{sr.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Doctor interpretation preview */}
                    {o.interpretationImpression && (
                      <div style={{ marginBottom: 8, padding: '8px 10px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#166534' }}>
                        💬 <strong>Doctor:</strong> "{o.interpretationImpression}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {needsUpload && (
                        <button onClick={() => { setUploadItem(o); setUploadType(o._type || 'lab'); setShowUploadModal(true); setUploadStep('categorize'); }}
                          style={{
                            background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px',
                            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                          }}>📤 Upload Result</button>
                      )}
                      {isUploaded && (
                        <button onClick={() => setShowInterpretation(o)}
                          style={{
                            background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px',
                            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                          }}>📋 View Results</button>
                      )}
                      <button onClick={() => printPatientOrder(o, activeWs)}
                        style={{
                          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
                        }}>📄 Order Form</button>
                      {onOpenChat && (
                        <button onClick={() => onOpenChat(o.doctorId || '', o.doctorName || 'Doctor')}
                          style={{
                            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
                          }}>💬 Message</button>
                      )}
                    </div>

                    {/* Upload link */}
                    {o.uploadUrl && (
                      <a href={o.uploadUrl} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-block', marginTop: 6, fontSize: 11, color: '#2563eb', textDecoration: 'underline',
                      }}>📎 View uploaded file</a>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {journeyOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
              <div style={{ fontWeight: 600 }}>No tasks yet for this health journey.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Your doctor will add tests and investigations here.</div>
            </div>
          )}

          {/* ── Workspace Chat ── */}
          <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              💬 Conversation with Your Doctor
              <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)' }}>— about this health journey</span>
            </div>
            <div style={{ padding: '8px 12px', maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {wsMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 12 }}>
                  No messages yet. Ask your doctor a question about this health journey.
                </div>
              )}
              {wsMessages.map((m: any) => (
                <div key={m.id} style={{
                  alignSelf: m.senderRole === 'patient' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}>
                  <div style={{
                    padding: '6px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.4,
                    background: m.senderRole === 'patient' ? '#0F766E' : '#f0fdf4',
                    color: m.senderRole === 'patient' ? '#fff' : '#166534',
                    borderTopRightRadius: m.senderRole === 'patient' ? 4 : 12,
                    borderTopLeftRadius: m.senderRole === 'patient' ? 12 : 4,
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1, textAlign: m.senderRole === 'patient' ? 'right' : 'left' }}>
                    {m.senderName} · {fmtTime(m.createdAt)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
              <input value={wsMsgText} onChange={e => setWsMsgText(e.target.value)}
                placeholder="Ask a question about this health journey…"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendWsMessage(); } }}
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)',
                  fontSize: 12, outline: 'none', fontFamily: 'var(--font)', background: 'var(--bg)',
                }} />
              <button onClick={sendWsMessage} disabled={wsMsgSending || !wsMsgText.trim()} style={{
                background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                opacity: wsMsgSending || !wsMsgText.trim() ? 0.5 : 1,
              }}>{wsMsgSending ? '…' : 'Send'}</button>
            </div>
          </div>
        </div>
      );
    }

    /* ── All Journeys (no active journey) ── */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>🏥 Your Health Journeys</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
          Your doctor has organized your care into health journeys. Each journey tracks a specific health concern.
        </div>

        {journeySummary.filter(ws => ws.status === 'active').length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏥</div>
            <div style={{ fontWeight: 600 }}>No active health journeys yet.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>When your doctor creates a diagnostic workspace, it will appear here.</div>
          </div>
        )}

        {journeySummary.filter(ws => ws.status === 'active').map(ws => (
          <div key={ws.id} onClick={() => setActiveJourney(ws.id)} style={{
            background: 'var(--white)', borderRadius: 14, border: `1px solid var(--border)`,
            padding: 16, cursor: 'pointer', transition: 'all 0.15s',
            borderLeft: ws.urgency === 'stat' ? '4px solid #dc2626' : ws.urgency === 'urgent' ? '4px solid #f97316' : '4px solid #0F766E',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>📋 {ws.name}</div>
                {ws.clinicalProblem && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{ws.clinicalProblem}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', borderRadius: 99, padding: '2px 8px' }}>
                    {ws.total} test{ws.total !== 1 ? 's' : ''}
                  </span>
                  {ws.pending > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#fff7ed', color: '#f97316', borderRadius: 99, padding: '2px 8px' }}>
                      {ws.pending} pending upload
                    </span>
                  )}
                  {ws.awaitingReview > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#fefce8', color: '#ca8a04', borderRadius: 99, padding: '2px 8px' }}>
                      {ws.awaitingReview} awaiting doctor review
                    </span>
                  )}
                  {ws.completed > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', borderRadius: 99, padding: '2px 8px' }}>
                      {ws.completed} reviewed
                    </span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: ws.urgency === 'stat' ? '#fef2f2' : ws.urgency === 'urgent' ? '#fff7ed' : 'transparent',
                color: ws.urgency === 'stat' ? '#dc2626' : ws.urgency === 'urgent' ? '#f97316' : 'var(--muted)',
                borderRadius: 6, padding: '2px 8px',
              }}>
                {ws.urgency === 'stat' ? '🚨 URGENT' : ws.urgency === 'urgent' ? '⚠ URGENT' : '→'}
              </span>
            </div>
          </div>
        ))}

        {/* Also show workspaces not created by doctor (any orders without workspace) */}
        {(() => {
          const unassigned = allOrders.filter((o: any) => !o.workspaceId && workspaces.length > 0);
          if (unassigned.length === 0) return null;
          return (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
              + {unassigned.length} other test{unassigned.length > 1 ? 's' : ''} not yet grouped into a journey.
            </div>
          );
        })()}
      </div>
    );
  };

  /* ── ACTIONS VIEW ── */
  const renderActions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>📌 Actions Required</div>
      {pendingActions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 600 }}>All caught up!</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>No pending actions at this time.</div>
        </div>
      ) : (
        pendingActions.map(a => (
          <div key={a.id} style={{
            background: 'var(--white)', borderRadius: 12, padding: 12,
            border: a.priority === 'critical' ? '1.5px solid #dc2626' : a.priority === 'urgent' ? '1.5px solid #f97316' : '1px solid var(--border)',
            borderLeft: a.priority === 'critical' ? '4px solid #dc2626' : a.priority === 'urgent' ? '4px solid #f97316' : '4px solid #0F766E',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{a.label}</span>
                  {a.priority === 'critical' && <span style={{ fontSize: 9, fontWeight: 800, background: '#dc2626', color: '#fff', borderRadius: 4, padding: '1px 6px' }}>ACTION NEEDED</span>}
                </div>
                {a.order.clinicalIndication && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.order.clinicalIndication}</div>}
                {a.order.workspaceId && <div style={{ fontSize: 10, color: '#0F766E', marginTop: 1 }}>📋 {workspaces.find(w => w.id === a.order.workspaceId)?.name || ''}</div>}
              </div>
              {a.type === 'upload' && (
                <button onClick={() => { setUploadItem(a.order); setUploadType(a.order._type || 'lab'); setShowUploadModal(true); setUploadStep('categorize'); }}
                  style={{
                    background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>📤 Upload</button>
              )}
              {a.type === 'review' && a.order.interpreted && (
                <button onClick={() => setShowInterpretation(a.order)}
                  style={{
                    background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>📋 View</button>
              )}
              {a.type === 'critical' && (
                <button onClick={() => setShowInterpretation(a.order)}
                  style={{
                    background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>🚨 View Alert</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  /* ── TIMELINE VIEW ── */
  const renderTimeline = () => {
    const grouped = allOrders.reduce((acc: Record<string, any[]>, o: any) => {
      const month = fmtDate(o.createdAt).split(' ').slice(1).join(' ');
      const year = new Date(o.createdAt?.toDate ? o.createdAt.toDate() : o.createdAt).getFullYear();
      const key = `${month} ${year}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>🕐 Your Health Timeline</div>
        {Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
            <div>No health events yet.</div>
          </div>
        )}
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 6, marginTop: 4 }}>{month}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(items as any[]).map((o: any) => (
                <div key={o.id} style={{
                  display: 'flex', gap: 10, padding: '8px 12px', background: 'var(--white)',
                  borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
                }} onClick={() => { setShowInterpretation(o); }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: o.interpreted ? '#f0fdf4' : o.uploadUrl ? '#fefce8' : '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{o._type === 'imaging' ? '🩻' : '🧪'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{(o.tests || []).join(', ')}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                      {fmtDate(o.createdAt)} · {o.interpreted ? '✅ Reviewed' : o.uploadUrl ? '📎 Uploaded' : '⏳ Pending'}
                      {o.interpretationImpression && ` · "${o.interpretationImpression.slice(0, 40)}..."`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ── RESULTS VIEW (all interpreted) ── */
  const renderResults = () => {
    const interpreted = allOrders.filter((o: any) => o.interpreted);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>📋 Doctor Reviews & Results</div>
        {interpreted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div>No reviewed results yet.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Once your doctor reviews your results, they will appear here.</div>
          </div>
        ) : interpreted.map((o: any) => (
          <div key={o.id} onClick={() => setShowInterpretation(o)} style={{
            background: 'var(--white)', borderRadius: 12, padding: 12, border: '1px solid var(--border)', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{o._type === 'imaging' ? '🩻' : '🧪'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{(o.tests || []).join(', ')}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtDate(o.createdAt)} · {o.interpretedBy ? `Dr. ${o.interpretedBy}` : ''}</div>
              </div>
              {o.interpretationSeverity && (
                <span style={{
                  fontSize: 9, fontWeight: 700, borderRadius: 99, padding: '2px 8px',
                  background: o.interpretationSeverity === 'critical' ? '#fef2f2' : o.interpretationSeverity === 'severe' ? '#fff7ed' : '#f0fdf4',
                  color: o.interpretationSeverity === 'critical' ? '#dc2626' : o.interpretationSeverity === 'severe' ? '#f97316' : '#16a34a',
                }}>{o.interpretationSeverity}</span>
              )}
            </div>
            {o.interpretationImpression && <div style={{ fontSize: 11, color: '#166534', marginTop: 4, fontStyle: 'italic' }}>"{o.interpretationImpression.slice(0, 80)}..."</div>}
          </div>
        ))}
      </div>
    );
  };

  /* ── MAIN RENDER ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '100%' }}>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
        {[
          { icon: '🧪', label: 'All Tests', value: stats.total, color: 'var(--text)' },
          { icon: '📤', label: 'Need Upload', value: stats.pendingUpload, color: '#f97316' },
          { icon: '📎', label: 'Uploaded', value: stats.received, color: '#ca8a04' },
          { icon: '✅', label: 'Reviewed', value: stats.reviewed, color: '#16a34a' },
          stats.critical > 0 ? { icon: '🚨', label: 'Alerts', value: stats.critical, color: '#dc2626' } : null,
        ].filter(Boolean).map((s: any) => (
          <div key={s.label} style={{ background: 'var(--white)', borderRadius: 10, border: '1px solid var(--border)', padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Critical alert banner */}
      {stats.critical > 0 && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #dc2626', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626' }}>Important Result{stats.critical > 1 ? 's' : ''} Detected</div>
            <div style={{ fontSize: 11, color: '#991b1b' }}>
              Your doctor has been notified and will review these results. Please wait for their feedback.
            </div>
          </div>
        </div>
      )}

      {/* Navigation pills */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
        {[
          { id: 'journeys', icon: '🏥', label: 'Health Journeys', count: journeySummary.filter(ws => ws.status === 'active').length },
          { id: 'actions', icon: '📌', label: 'Actions', count: pendingActions.length },
          { id: 'results', icon: '📋', label: 'Results', count: allOrders.filter((o: any) => o.interpreted).length },
          { id: 'timeline', icon: '🕐', label: 'Timeline', count: allOrders.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id as any)} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: 'none',
            background: 'transparent', color: activeView === tab.id ? '#0F766E' : 'var(--muted)',
            fontWeight: activeView === tab.id ? 700 : 500, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)',
            borderBottom: activeView === tab.id ? '2px solid #0F766E' : '2px solid transparent',
            whiteSpace: 'nowrap',
          }}>
            {tab.icon} {tab.label}
            {tab.count > 0 && <span style={{
              fontSize: 9, fontWeight: 700, background: activeView === tab.id ? '#0F766E' : 'var(--border)',
              color: activeView === tab.id ? '#fff' : 'var(--muted)', borderRadius: 99, padding: '0 5px', lineHeight: '16px', minWidth: 16, textAlign: 'center',
            }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeView === 'journeys' && renderJourneys()}
      {activeView === 'actions' && renderActions()}
      {activeView === 'timeline' && renderTimeline()}
      {activeView === 'results' && renderResults()}

      {/* Modals */}
      {renderUploadModal()}
      {renderInterpretation()}
    </div>
  );
}
