'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { INVESTIGATION_WORKSPACES, isPanelTest, expandPanel, expandTestList, PANEL_NAMES, PANEL_COMPONENTS, getPanelDefinition, computeFlag } from '@/src/data/investigationGroups';
import { FACILITIES, getFacilitiesByType } from '@/src/data/facilityDirectory';

/* ─── Helpers ─── */
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SHORT_DATE = (ts: any) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};
const fmtTime = (ts: any) => {
  if (!ts) return '';
  try { const d = ts?.toDate ? ts.toDate() : new Date(ts); return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
};

/* ─── Constants ─── */
const SIDEBAR_NAV = [
  { id: 'workspaces', icon: '📋', label: 'Active Workspaces' },
  { id: 'inbox', icon: '📥', label: 'Results Inbox' },
  { id: 'history', icon: '🕐', label: 'Investigation History' },
  { id: 'trends', icon: '📈', label: 'Longitudinal Trends' },
] as const;

type SidebarView = typeof SIDEBAR_NAV[number]['id'];

const LAB_PIPELINE = ['ordered', 'collected', 'processing', 'resulted', 'reviewed'] as const;
const IMG_PIPELINE = ['ordered', 'scheduled', 'performed', 'reported', 'reviewed'] as const;

/* ─── Props ─── */
interface Props {
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientInfo?: any;
  enrollments?: any[];
  allPathways?: any[];
  vitals?: any[];
}

/* ─── Types ─── */
interface DiagnosticWorkspace {
  id: string;
  patientId: string;
  name: string;
  clinicalProblem: string;
  suspectedDiagnoses: string[];
  clinicalQuestions: string[];
  status: 'active' | 'resolved' | 'monitoring';
  urgency: 'routine' | 'urgent' | 'stat';
  createdBy: string;
  createdAt: any;
  notes: string;
}

/* ─── Component ─── */
export default function DiagnosticCommandCenter({
  patientId, doctorId, doctorName, patientInfo, enrollments, allPathways, vitals,
}: Props) {
  /* ── Navigation & workspace state ── */
  const [sidebarView, setSidebarView] = useState<SidebarView>('workspaces');
  const [workspaces, setWorkspaces] = useState<DiagnosticWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [wsForm, setWsForm] = useState({ name: '', problem: '', diagnoses: '', questions: '', urgency: 'routine' as const, notes: '' });

  /* ── Orders & results ── */
  const [labs, setLabs] = useState<any[]>([]);
  const [imaging, setImaging] = useState<any[]>([]);

  /* ── Order modal state ── */
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderWorkspaceId, setOrderWorkspaceId] = useState<string | null>(null);
  const [orderStep, setOrderStep] = useState(1);
  const [orderTests, setOrderTests] = useState('');
  const [orderType, setOrderType] = useState<'lab' | 'imaging'>('lab');
  const [orderIndication, setOrderIndication] = useState('');
  const [orderQuestion, setOrderQuestion] = useState('');
  const [orderDifferential, setOrderDifferential] = useState('');
  const [orderProvisional, setOrderProvisional] = useState('');
  const [orderUrgency, setOrderUrgency] = useState('routine');
  const [orderSpecimen, setOrderSpecimen] = useState('blood');
  const [orderBodySite, setOrderBodySite] = useState('');
  const [orderFasting, setOrderFasting] = useState(false);
  const [orderContrast, setOrderContrast] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPatientExplanation, setOrderPatientExplanation] = useState('');
  const [orderRecurrence, setOrderRecurrence] = useState<'none'|'daily'|'weekly'|'biweekly'|'monthly'>('none');
  const [orderRecurrenceCount, setOrderRecurrenceCount] = useState(3);
  const [orderFacility, setOrderFacility] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── Interpretation state (side panel) ── */
  const [interpretingOrderId, setInterpretingOrderId] = useState<string | null>(null);
  const [intPanelOrder, setIntPanelOrder] = useState<any>(null);
  const [showIntPanel, setShowIntPanel] = useState(false);
  const [intFindings, setIntFindings] = useState('');
  const [intImpression, setIntImpression] = useState('');
  const [intSeverity, setIntSeverity] = useState<'mild'|'moderate'|'severe'|'critical'|''>('');
  const [intDifferential, setIntDifferential] = useState('');
  const [intComparison, setIntComparison] = useState('');
  const [intRecommendation, setIntRecommendation] = useState('');
  const [intSaving, setIntSaving] = useState(false);
  const [panelValues, setPanelValues] = useState<Record<string, string>>({});

  /* Sync panelValues ←→ intFindings when interpreting order changes */
  const syncPanelFromFindings = useCallback((findings: string) => {
    const vals: Record<string, string> = {};
    findings.split('\n').filter(l => l.trim() && l.includes(',')).forEach(l => {
      const parts = l.split(',').map(p => p.trim());
      if (parts[0]) vals[parts[0]] = parts[1] || '';
    });
    setPanelValues(vals);
  }, []);
  const buildFindingsFromPanel = useCallback((vals: Record<string, string>, panelName: string): string => {
    const def = getPanelDefinition(panelName);
    if (!def) return '';
    return def.sections.flatMap(s => s.analytes).map(a => {
      const val = vals[a.name] || '';
      const flag = val ? computeFlag(val, a.refRange) : '';
      return `${a.name}, ${val}, ${a.unit}, ${flag}, ${a.refRange}`;
    }).join('\n');
  }, []);

  /* ═══ Uploadcare Config ═══ */
  const UC_PUB_KEY = '205b104100680fa4f052';
  const [doctorUploading, setDoctorUploading] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const [wsMsgText, setWsMsgText] = useState('');
  const [wsMsgSending, setWsMsgSending] = useState(false);

  /* ── History state ── */
  const [historyWorkspaceId, setHistoryWorkspaceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Firestore subscriptions ── */
  useEffect(() => {
    if (!patientId) return;
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(
      query(collection(db, 'investigationWorkspaces'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(20)),
      snap => {
        const ws = snap.docs.map(d => ({ id: d.id, ...d.data() } as DiagnosticWorkspace));
        setWorkspaces(ws);
        if (!activeWorkspaceId && ws.length > 0) setActiveWorkspaceId(ws[0].id);
      }
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(50)),
      snap => setLabs(snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'lab' as const })))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'imagingOrders'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(50)),
      snap => setImaging(snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'imaging' as const })))
    ));

    return () => unsubs.forEach(u => u());
  }, [patientId]);

  /* ── Merged investigations ── */
  const allOrders = useMemo(() => {
    return [...labs, ...imaging].sort((a: any, b: any) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return tb.getTime() - ta.getTime();
    });
  }, [labs, imaging]);

  /* ── Active workspace data ── */
  const activeWorkspace = useMemo(() => workspaces.find(w => w.id === activeWorkspaceId), [workspaces, activeWorkspaceId]);

  /* ── Orders filtered by workspace ── */
  const workspaceOrders = useMemo(() => {
    if (!activeWorkspaceId) return [];
    return allOrders.filter((o: any) => o.workspaceId === activeWorkspaceId);
  }, [allOrders, activeWorkspaceId]);

  const pendingOrders = useMemo(() => workspaceOrders.filter((o: any) => o.status !== 'resulted' && o.status !== 'reviewed' && o.status !== 'closed'), [workspaceOrders]);
  const resultedOrders = useMemo(() => workspaceOrders.filter((o: any) => o.status === 'resulted' || o.status === 'reviewed' || o.status === 'closed'), [workspaceOrders]);
  const awaitingReview = useMemo(() => workspaceOrders.filter((o: any) => (o.uploadUrl || o.fileUrl) && !o.interpreted), [workspaceOrders]);

  /* ── Inbox items ── */
  const inboxItems = useMemo(() => {
    const items = allOrders.filter((o: any) => (o.uploadUrl || o.fileUrl) && !o.interpreted);
    const critical = items.filter((o: any) => {
      if (!o.structuredResults) return false;
      return o.structuredResults.some((sr: any) => sr.flag?.toLowerCase() === 'critical');
    });
    return { total: items.length, critical: critical.length, items };
  }, [allOrders]);

  /* ── Create workspace ── */
  const createWorkspace = useCallback(async () => {
    if (!wsForm.name.trim()) return;
    try {
      await addDoc(collection(db, 'investigationWorkspaces'), {
        patientId,
        name: wsForm.name,
        clinicalProblem: wsForm.problem,
        suspectedDiagnoses: wsForm.diagnoses.split(',').map(d => d.trim()).filter(Boolean),
        clinicalQuestions: wsForm.questions.split('\n').map(q => q.trim()).filter(Boolean),
        status: 'active',
        urgency: wsForm.urgency,
        createdBy: doctorName,
        createdAt: serverTimestamp(),
        notes: wsForm.notes,
      });
      // Also add a timeline event
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'lab',
        title: `📋 Diagnostic workspace created: ${wsForm.name}`,
        description: wsForm.problem || 'New diagnostic investigation',
        icon: '📋', doctorId, createdAt: serverTimestamp(),
      });
      setWsForm({ name: '', problem: '', diagnoses: '', questions: '', urgency: 'routine', notes: '' });
      setShowNewWorkspace(false);
    } catch (e) { console.error('Create workspace failed:', e); }
  }, [wsForm, patientId, doctorId, doctorName]);

  /* ── Add test (panel name, no expansion — analytes are only in result entry) ── */
  const addTestToOrder = useCallback((testName: string) => {
    setOrderTests(prev => {
      const existing = prev ? prev.split(',').map(x => x.trim().toLowerCase()) : [];
      if (existing.includes(testName.trim().toLowerCase())) return prev;
      return prev ? `${prev}, ${testName.trim()}` : testName.trim();
    });
  }, []);

  /* ── Submit structured order (each test = separate doc) ── */
  const submitOrder = useCallback(async () => {
    if (!orderTests.trim() || !orderWorkspaceId) return;
    setSubmitting(true);
    try {
      const tests = orderTests.split(',').map(t => t.trim()).filter(Boolean);
      const col = orderType === 'lab' ? 'labOrders' : 'imagingOrders';
      const baseData: Record<string, any> = {
        patientId, doctorId, doctorName,
        workspaceId: orderWorkspaceId,
        type: orderType,
        clinicalIndication: orderIndication,
        clinicalQuestion: orderQuestion,
        differential: orderDifferential,
        provisionalDiagnosis: orderProvisional,
        urgency: orderUrgency,
        patientExplanation: orderPatientExplanation,
        notes: orderNotes,
        status: 'ordered',
        createdAt: serverTimestamp(),
      };
      if (orderType === 'lab') { baseData.specimenType = orderSpecimen; baseData.fastingRequired = orderFasting; }
      else { baseData.bodySite = orderBodySite; baseData.contrastRequired = orderContrast; }
      if (orderRecurrence !== 'none') { baseData.recurrence = orderRecurrence; baseData.recurrenceCount = orderRecurrenceCount; }
      if (orderFacility) { const f = FACILITIES.find(f => f.id === orderFacility); baseData.facilityId = orderFacility; baseData.facilityName = f?.name; }

      const orderIds: string[] = [];
      for (const test of tests) {
        const ref = await addDoc(collection(db, col), { ...baseData, tests: [test] });
        orderIds.push(ref.id);
      }

      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'lab',
        title: `${orderType === 'lab' ? '🧪' : '🩻'} ${orderType === 'lab' ? 'Labs' : 'Imaging'} ordered: ${tests.join(', ')}`,
        description: orderIndication || activeWorkspace?.name || '',
        icon: orderType === 'lab' ? '🧪' : '🩻', doctorId, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId, doctorName,
        title: orderType === 'lab' ? '🧪 Lab Tests Ordered' : '🩻 Imaging Ordered',
        message: `Dr. ${doctorName} has ordered ${tests.join(', ')}.${orderPatientExplanation ? `\n\n${orderPatientExplanation}` : ''}`,
        type: 'lab', read: false, createdAt: serverTimestamp(),
      });
      setShowOrderModal(false);
      resetOrderForm();
    } catch (e) { console.error('Order failed:', e); }
    setSubmitting(false);
  }, [orderTests, orderWorkspaceId, orderType, orderIndication, orderQuestion, orderDifferential, orderProvisional, orderUrgency, orderSpecimen, orderBodySite, orderFasting, orderContrast, orderPatientExplanation, orderNotes, orderRecurrence, orderRecurrenceCount, orderFacility, patientId, doctorId, doctorName, activeWorkspace]);

  const resetOrderForm = () => {
    setOrderStep(1);
    setOrderTests('');
    setOrderIndication('');
    setOrderQuestion('');
    setOrderDifferential('');
    setOrderProvisional('');
    setOrderUrgency('routine');
    setOrderSpecimen('blood');
    setOrderBodySite('');
    setOrderFasting(false);
    setOrderContrast(false);
    setOrderNotes('');
    setOrderPatientExplanation('');
    setOrderRecurrence('none');
    setOrderRecurrenceCount(3);
    setOrderFacility('');
  };

  /* ── Submit interpretation (inline) ── */
  const submitInterpretationInline = useCallback(async (order: any) => {
    if (!order || !intFindings.trim()) return;
    setIntSaving(true);
    try {
      const col = order._type === 'imaging' ? 'imagingOrders' : 'labOrders';
      const structuredResults = intFindings.split('\n')
        .map(l => l.trim()).filter(l => l.includes(','))
        .map(l => {
          const parts = l.split(',').map(p => p.trim());
          return { test: parts[0], value: parts[1] || '', unit: parts[2] || '', flag: parts[3] || '', range: parts[4] || '' };
        });
      const updateData: Record<string, any> = {
        interpreted: true,
        interpretationFindings: intFindings,
        interpretationImpression: intImpression,
        interpretationDifferentialSupport: intDifferential,
        interpretationPriorComparison: intComparison,
        interpretationRecommendation: intRecommendation,
        interpretedAt: serverTimestamp(),
        interpretedBy: doctorName,
        status: 'reviewed',
      };
      if (structuredResults.length > 0) updateData.structuredResults = structuredResults;
      if (intSeverity) updateData.interpretationSeverity = intSeverity;
      await updateDoc(doc(db, col, order.id), updateData);
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'lab',
        title: `${order._type === 'lab' ? '🧪' : '🩻'} Result reviewed: ${(order.tests || []).join(', ')}`,
        description: intImpression || intFindings.slice(0, 100),
        icon: order._type === 'lab' ? '🧪' : '🩻', doctorId, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId, doctorName,
        title: '📋 Investigation Result Reviewed',
        message: `Dr. ${doctorName} has reviewed your ${(order.tests || []).join(', ')} results. Impression: ${intImpression || 'See app for details.'}`,
        type: 'lab', read: false, createdAt: serverTimestamp(),
      });
      setInterpretingOrderId(null);
      setIntFindings('');
      setIntImpression('');
      setIntSeverity('');
      setIntDifferential('');
      setIntComparison('');
      setIntRecommendation('');
    } catch (e) { console.error('Interpretation failed:', e); }
    setIntSaving(false);
  }, [intFindings, intImpression, intSeverity, intDifferential, intComparison, intRecommendation, patientId, doctorId, doctorName]);

  /* ═══ Uploadcare Helpers ═══ */
  let ucLoaded = false;
  const loadUploadcare = (): Promise<void> => new Promise(res => {
    if (typeof window !== 'undefined' && (window as any).uploadcare) { ucLoaded = true; res(); return; }
    const s = document.createElement('script');
    s.src = `https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js`;
    s.async = true;
    s.onload = () => { ucLoaded = true; res(); };
    document.head.appendChild(s);
  });

  const openUploadcareForDoctor = useCallback(async (order: any) => {
    setDoctorUploading(true);
    try {
      await loadUploadcare();
      const uc = (window as any).uploadcare;
      if (!uc) { alert('Upload service loading. Please try again.'); setDoctorUploading(false); return; }
      const dialog = uc.openDialog(null, {
        publicKey: UC_PUB_KEY, multiple: false,
        imagesOnly: false, previewStep: true,
        crop: false,
        // validators removed — not supported in all widget versions
      });
      dialog.done((file: any) => {
        file.promise().then(async (info: any) => {
          const col = order._type === 'imaging' ? 'imagingOrders' : 'labOrders';
          try {
            await updateDoc(doc(db, col, order.id), {
              uploadUrl: info.cdnUrl || info.originalUrl,
              fileName: info.originalFilename || 'uploaded_file',
              uploadedBy: doctorName,
              uploadedAt: serverTimestamp(),
              doctorUploadedResult: true,
              status: 'resulted',
            });
            await addDoc(collection(db, 'patientNotifications'), {
              patientId, doctorId, doctorName,
              title: '📎 Doctor uploaded result',
              message: `Dr. ${doctorName} has uploaded results for ${(order.tests || []).join(', ')}.`,
              type: 'lab', read: false, createdAt: serverTimestamp(),
            });
            await addDoc(collection(db, 'patient_timeline'), {
              patientId, type: 'lab',
              title: `📎 Doctor uploaded result: ${(order.tests || []).join(', ')}`,
              icon: order._type === 'imaging' ? '🩻' : '🧪',
              createdAt: serverTimestamp(),
            });
          } catch (e) { console.error('Doctor upload failed:', e); }
          setDoctorUploading(false);
        });
      });
    } catch (e) { console.error('Uploadcare init failed:', e); setDoctorUploading(false); }
  }, [patientId, doctorId, doctorName]);

  /* ── Workspace message subscription ── */
  useEffect(() => {
    if (!activeWorkspaceId) { setWsMessages([]); return; }
    const q = query(
      collection(db, 'workspaceMessages'),
      where('workspaceId', '==', activeWorkspaceId),
      orderBy('createdAt', 'asc'),
      limit(50),
    );
    const unsub = onSnapshot(q, snap => setWsMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [activeWorkspaceId]);

  const sendWsMessage = useCallback(async () => {
    if (!wsMsgText.trim() || !activeWorkspaceId || !patientId) return;
    setWsMsgSending(true);
    try {
      await addDoc(collection(db, 'workspaceMessages'), {
        workspaceId: activeWorkspaceId, patientId,
        text: wsMsgText.trim(),
        senderRole: 'doctor',
        senderName: doctorName,
        createdAt: serverTimestamp(),
      });
      setWsMsgText('');
    } catch (e) { console.error('Failed to send message:', e); }
    setWsMsgSending(false);
  }, [wsMsgText, activeWorkspaceId, patientId, doctorName]);

  const runOcr = useCallback(async (imageUrl: string) => {
    setOcrRunning(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.text) {
        setIntFindings(data.text);
      } else {
        alert('No text could be extracted from this image.');
      }
    } catch (e) {
      console.error('OCR failed:', e);
      alert('OCR extraction failed. The image may not be accessible or not contain readable text.');
    }
    setOcrRunning(false);
  }, []);

  /* ── Workspace summary stats ── */
  const wsSummary = useMemo(() => {
    return workspaces.map(ws => {
      const orders = allOrders.filter((o: any) => o.workspaceId === ws.id);
      return {
        ...ws,
        total: orders.length,
        pending: orders.filter((o: any) => o.status !== 'resulted' && o.status !== 'reviewed' && o.status !== 'closed').length,
        resulted: orders.filter((o: any) => o.status === 'resulted' || o.status === 'reviewed' || o.status === 'closed').length,
        unreviewed: orders.filter((o: any) => o.status === 'resulted' && !o.interpreted).length,
        critical: orders.filter((o: any) => o.structuredResults?.some((sr: any) => sr.flag?.toLowerCase() === 'critical')).length,
      };
    });
  }, [workspaces, allOrders]);

  /* ── Print request form ── */
  const printForm = (item: any) => {
    if (!item) return;
    const isLab = item._type === 'lab';
    const now = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const ref = `INV-${item.id?.slice(-8).toUpperCase() || 'N/A'}`;
    const ws = workspaces.find(w => w.id === item.workspaceId);
    // PDF generation (simplified - triggers browser print)
    const html = `<!DOCTYPE html><html><head><title>${isLab ? 'Lab' : 'Imaging'} Request</title>
    <style>
      @page { margin: 12mm 10mm; size: A4; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', Arial, sans-serif; font-size: 10pt; color: #1a1a2e; padding: 20px; }
      .header { border-bottom: 2px solid #0F766E; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; }
      .header h1 { font-size: 14pt; color: #0F766E; }
      .badge { background: #0F766E; color: #fff; padding: 2px 10px; border-radius: 99px; font-size: 8pt; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
      .field label { font-size: 7pt; font-weight: 700; color: #64748b; text-transform: uppercase; }
      .field .val { font-size: 10pt; font-weight: 600; padding: 3px 6px; background: #f8fafc; border-radius: 4px; }
      .section { font-size: 8pt; font-weight: 700; color: #0F766E; text-transform: uppercase; margin: 10px 0 4px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
      table { width: 100%; border-collapse: collapse; margin: 6px 0; }
      th { background: #f1f5f9; font-size: 7pt; padding: 4px 6px; border: 1px solid #e2e8f0; text-align: left; }
      td { font-size: 9pt; padding: 4px 6px; border: 1px solid #e2e8f0; }
      .crit { color: #dc2626; font-weight: 700; }
      .abn { color: #f97316; font-weight: 600; }
      .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 7pt; color: #94a3b8; }
      .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
      .sig-box { border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; }
      .sig-box .lbl { font-size: 7pt; font-weight: 700; color: #64748b; }
      .sig-line { border-top: 1px solid #cbd5e1; margin-top: 20px; padding-top: 3px; font-size: 8pt; }
      .warn { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px 10px; font-size: 8pt; color: #991b1b; margin: 6px 0; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <div class="header"><div><h1>🏥 AMEXAN Health System</h1><div style="font-size:7pt;color:#64748b;">${isLab ? 'Laboratory' : 'Imaging'} Request · A4 Clinical Document</div></div>
    <div style="text-align:right;"><div class="badge">${isLab ? '🧪 LAB' : '🩻 IMAGING'}</div><div style="font-size:6pt;color:#94a3b8;">Ref: ${ref}</div></div></div>
    <div class="grid-2">
      <div class="field"><label>Patient</label><div class="val">${patientInfo?.name || patientInfo?.displayName || 'Unknown'}</div></div>
      <div class="field"><label>ID</label><div class="val">${patientId}</div></div>
      <div class="field"><label>Doctor</label><div class="val">${doctorName}</div></div>
      <div class="field"><label>Date</label><div class="val">${now}</div></div>
      <div class="field"><label>Priority</label><div class="val" style="color:${item.urgency === 'stat' ? '#dc2626' : item.urgency === 'urgent' ? '#f97316' : '#1a1a2e'};font-weight:700;">${(item.urgency || 'routine').toUpperCase()}</div></div>
      ${ws ? `<div class="field"><label>Workspace</label><div class="val">${ws.name}</div></div>` : ''}
    </div>
    ${item.fastingRequired ? '<div class="warn">⚠ FASTING REQUIRED: Patient must fast 8+ hours before collection.</div>' : ''}
    ${item.contrastRequired ? '<div class="warn">⚠ CONTRAST REQUIRED: Check renal function and allergy history.</div>' : ''}
    <div class="section">${isLab ? 'Tests' : 'Study'}</div>
    <table><tr><th>#</th><th>Name</th><th>Indication</th><th>Question</th><th>Status</th></tr>
    ${(item.tests || ['N/A']).map((t: string, i: number) => `<tr><td>${i+1}</td><td><strong>${t}</strong></td><td>${item.clinicalIndication || '—'}</td><td>${item.clinicalQuestion || '—'}</td><td>${item.status}</td></tr>`).join('')}
    </table>
    ${item.provisionalDiagnosis ? `<div class="field" style="margin-top:6px;"><label>Provisional Dx</label><div class="val">${item.provisionalDiagnosis}</div></div>` : ''}
    ${item.differential ? `<div class="field"><label>Differential</label><div class="val">${item.differential}</div></div>` : ''}
    ${item.notes ? `<div class="field"><label>Notes</label><div class="val">${item.notes}</div></div>` : ''}
    ${item.patientExplanation ? `<div style="margin-top:6px;padding:6px 8px;background:#f0fdf4;border-radius:4px;font-size:8pt;"><strong>Patient explanation:</strong> ${item.patientExplanation}</div>` : ''}
    ${item.structuredResults?.length ? `
    <div class="section">Results</div>
    <table><tr><th>Test</th><th>Value</th><th>Unit</th><th>Flag</th></tr>
    ${item.structuredResults.map((sr: any) => `<tr><td><strong>${sr.test}</strong></td><td class="${sr.flag==='critical'?'crit':sr.flag==='high'||sr.flag==='low'?'abn':''}">${sr.value}</td><td>${sr.unit||'—'}</td><td class="${sr.flag==='critical'?'crit':''}">${sr.flag||'N'}</td></tr>`).join('')}
    </table>` : ''}
    ${item.interpretationImpression ? `<div class="section">Interpretation</div><div style="background:#f0fdf4;padding:8px;border-radius:4px;font-size:9pt;"><strong>Impression:</strong> ${item.interpretationImpression}</div>` : ''}
    <div class="sig">
      <div class="sig-box"><div class="lbl">Ordering Doctor</div><div class="sig-line">${doctorName}</div><div style="font-size:7pt;color:#94a3b8;">${now}</div></div>
      <div class="sig-box"><div class="lbl">${isLab ? 'Laboratory' : 'Radiology'}</div><div class="sig-line">Technologist / Pathologist</div><div style="font-size:7pt;color:#94a3b8;">Date: _______________</div></div>
    </div>
    <div class="footer">AMEXAN Health System · Confidential · Ref: ${ref} · Printed: ${now}</div>
    <script>window.print()</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  /* ── Smart test suggestions based on workspace ── */
  const IMAGING_TESTS = /^(CT|MRI|X-?Ray|Ultrasound|Echocardiogram|Mammogram|Angiogram|Stress|Holter|Pulse|Peak|Spirometry)/i;
  const ALL_TESTS = useMemo(() => {
    const groups = INVESTIGATION_WORKSPACES.flatMap(ws => ws.groups);
    const all = groups.flatMap(g => g.tests.map(t => ({
      test: t, group: g.label, icon: g.icon,
      workspace: INVESTIGATION_WORKSPACES.find(w => w.groups.includes(g))?.label || '',
    })));
    return {
      lab: all.filter(t => !IMAGING_TESTS.test(t.test)),
      imaging: all.filter(t => IMAGING_TESTS.test(t.test)),
    };
  }, []);

  const [testSearch, setTestSearch] = useState('');
  const [showTestBrowser, setShowTestBrowser] = useState(false);

  const filteredTests = useMemo(() => {
    const pool = orderType === 'lab' ? ALL_TESTS.lab : ALL_TESTS.imaging;
    if (!testSearch.trim()) return pool;
    const q = testSearch.toLowerCase();
    return pool.filter(t => t.test.toLowerCase().includes(q) || t.group.toLowerCase().includes(q) || t.workspace.toLowerCase().includes(q));
  }, [orderType, ALL_TESTS, testSearch]);

  const suggestedTests = useMemo(() => {
    if (!activeWorkspace) return [];
    const problem = (activeWorkspace.clinicalProblem || '').toLowerCase();
    const diagnoses = (activeWorkspace.suspectedDiagnoses || []).join(' ').toLowerCase();
    const combined = problem + ' ' + diagnoses;

    if (combined.includes('chest pain') || combined.includes('acs') || combined.includes('myocardial') || combined.includes('angina')) {
      return ['High-Sensitivity Troponin', '12-Lead ECG', '2D Echocardiogram', 'Chest X-Ray (PA/AP)', 'Lipid Profile', 'D-Dimer'];
    }
    if (combined.includes('diabetes') || combined.includes('dka') || combined.includes('hyperglycemia')) {
      return ['HbA1c', 'Fasting Glucose', 'Urea & Electrolytes', 'Arterial Blood Gas (ABG)', 'Urinalysis + Microscopy', 'Lipid Profile'];
    }
    if (combined.includes('sepsis') || combined.includes('infection') || combined.includes('fever') || combined.includes('bacteremia')) {
      return ['Full Blood Count (FBC)', 'C-Reactive Protein (CRP)', 'Blood Culture', 'Lactate', 'Procalcitonin', 'Urea & Electrolytes'];
    }
    if (combined.includes('aki') || combined.includes('renal') || combined.includes('kidney') || combined.includes('ckd')) {
      return ['Urea & Electrolytes', 'Creatinine / eGFR', 'Urinalysis + Microscopy', 'Urine Albumin:Creatinine (UACR)', 'Renal Ultrasound', 'Arterial Blood Gas (ABG)'];
    }
    if (combined.includes('stroke') || combined.includes('cva') || combined.includes('tia')) {
      return ['CT Head', 'MRI Brain', 'Lipid Profile', 'Fasting Glucose', 'ECG'];
    }
    if (combined.includes('pneumonia') || combined.includes('respiratory') || combined.includes('cough') || combined.includes('tb')) {
      return ['Full Blood Count (FBC)', 'C-Reactive Protein (CRP)', 'Chest X-Ray (PA/AP)', 'Sputum MCS', 'GeneXpert MTB/RIF', 'Procalcitonin'];
    }
    if (combined.includes('anemia') || combined.includes('anaemia') || combined.includes('bleeding')) {
      return ['Full Blood Count (FBC)', 'Serum Ferritin', 'Vitamin B12', 'Folate', 'PT/INR', 'Blood Film'];
    }
    if (combined.includes('liver') || combined.includes('hepatic') || combined.includes('jaundice') || combined.includes('cirrhosis')) {
      return ['Liver Function Tests (LFTs)', 'PT/INR', 'Serum Albumin', 'Abdominal Ultrasound', 'HBsAg', 'Anti-HCV'];
    }
    if (combined.includes('uti') || combined.includes('urinary') || combined.includes('dysuria')) {
      return ['Urinalysis + Microscopy', 'Urine MCS', 'Urea & Electrolytes', 'Renal Ultrasound', 'Full Blood Count (FBC)', 'CRP'];
    }
    if (combined.includes('hypertension') || combined.includes('htn')) {
      return ['Urea & Electrolytes', 'Creatinine / eGFR', 'Lipid Profile', 'ECG', 'Urinalysis', 'Fasting Glucose'];
    }
    if (combined.includes('thyroid') || combined.includes('hyperthyroid') || combined.includes('hypothyroid')) {
      return ['TSH', 'Free T3/T4', 'Anti-TPO Antibodies'];
    }
    if (combined.includes('cancer') || combined.includes('malignancy') || combined.includes('tumour') || combined.includes('tumor')) {
      return ['Full Blood Count (FBC)', 'Liver Function Tests (LFTs)', 'CA-125', 'CA 19-9', 'CEA', 'CT Scan', 'MRI'];
    }
    if (combined.includes('pre-op') || combined.includes('preoperative') || combined.includes('surgery')) {
      return ['Full Blood Count (FBC)', 'Urea & Electrolytes', 'PT/INR', 'APTT', 'ECG', 'Chest X-Ray', 'Blood Group & Crossmatch'];
    }
    if (combined.includes('routine') || combined.includes('checkup')) {
      return ['Full Blood Count (FBC)', 'Lipid Profile', 'Fasting Glucose', 'HbA1c', 'Urinalysis', 'Urea & Electrolytes'];
    }
    return [];
  }, [activeWorkspace]);

  /* ── Render workspace detail ── */
  const renderWorkspaceDetail = () => {
    if (!activeWorkspace) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)', gap: 12 }}>
          <div style={{ fontSize: 40, opacity: 0.3 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>No Workspace Selected</div>
          <div style={{ fontSize: 12 }}>Create a new diagnostic workspace or select one from the sidebar.</div>
          <button onClick={() => setShowNewWorkspace(true)} style={{
            background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
          }}>➕ New Diagnostic Workspace</button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Workspace header */}
        <div style={{
          background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', padding: 14,
          borderLeft: `4px solid ${activeWorkspace.urgency === 'stat' ? '#dc2626' : activeWorkspace.urgency === 'urgent' ? '#f97316' : '#0F766E'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                {activeWorkspace.name}
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '1px 8px', borderRadius: 99,
                  background: activeWorkspace.status === 'active' ? '#f0fdf4' : '#fefce8',
                  color: activeWorkspace.status === 'active' ? '#16a34a' : '#ca8a04',
                }}>{activeWorkspace.status}</span>
                {activeWorkspace.urgency !== 'routine' && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '1px 8px', borderRadius: 4,
                    background: activeWorkspace.urgency === 'stat' ? '#dc2626' : '#f97316', color: '#fff',
                  }}>{activeWorkspace.urgency.toUpperCase()}</span>
                )}
              </div>
              {activeWorkspace.clinicalProblem && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>🧠 {activeWorkspace.clinicalProblem}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { setOrderWorkspaceId(activeWorkspace.id); setOrderType('lab'); setShowOrderModal(true); setOrderStep(1); }} style={{
                background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>🧪 Order Lab</button>
              <button onClick={() => { setOrderWorkspaceId(activeWorkspace.id); setOrderType('imaging'); setShowOrderModal(true); setOrderStep(1); }} style={{
                background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>🩻 Order Imaging</button>
              <button onClick={() => {
                const noUpload = pendingOrders.filter((o: any) => !(o.uploadUrl || o.fileUrl));
                if (noUpload.length > 0) { openUploadcareForDoctor(noUpload[0]); }
                else { alert('No pending orders to upload for. Place an order first.'); }
              }} disabled={doctorUploading} style={{
                background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                opacity: doctorUploading ? 0.6 : 1,
              }}>{doctorUploading ? '⌛' : '📤 Upload Result'}</button>
            </div>
          </div>

          {/* Clinical context chips */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {activeWorkspace.suspectedDiagnoses?.map((d: string, i: number) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 600, background: '#fefce8', color: '#ca8a04', borderRadius: 99, padding: '2px 8px' }}>🏷 {d}</span>
            ))}
          </div>
          {/* ── Smart overview counts strip ── */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {[
              { label: 'Total', count: wsSummary.find(s => s.id === activeWorkspace.id)?.total || 0, icon: '📊', color: '#475569' },
              { label: 'Pending', count: wsSummary.find(s => s.id === activeWorkspace.id)?.pending || 0, icon: '⏳', color: '#ca8a04' },
              { label: 'Unreviewed', count: wsSummary.find(s => s.id === activeWorkspace.id)?.unreviewed || 0, icon: '📎', color: '#f97316' },
              { label: 'Critical', count: wsSummary.find(s => s.id === activeWorkspace.id)?.critical || 0, icon: '🚨', color: '#dc2626' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#f8fafc', borderRadius: 6, padding: '2px 8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 10 }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.count}</span>
                <span style={{ fontSize: 9, color: 'var(--muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Clinical questions */}
          {activeWorkspace.clinicalQuestions?.length > 0 && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: '#eff6ff', borderRadius: 6, fontSize: 11, color: '#1e40af' }}>
              <strong>Clinical questions:</strong> {activeWorkspace.clinicalQuestions.join(' · ')}
            </div>
          )}
        </div>

        {/* Awaiting review alert */}
        {awaitingReview.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #dc262630', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              📎 {awaitingReview.length} Result{awaitingReview.length > 1 ? 's' : ''} Awaiting Review
              <button onClick={() => {
                const first = awaitingReview[0];
                setInterpretingOrderId(first.id);
                setIntFindings(first.structuredResults?.map((sr: any) => `${sr.test}, ${sr.value}, ${sr.unit}, ${sr.flag}`).join('\n') || '');
                setIntImpression(first.interpretationImpression || '');
                setIntRecommendation(first.interpretationRecommendation || '');
              }} style={{ fontSize: 9, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700 }}>
                Review All
              </button>
            </div>
            {awaitingReview.slice(0, 3).map((o: any) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #dc262610', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{o._type === 'imaging' ? '🩻' : '🧪'} {(o.tests || []).join(', ')}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtDate(o.createdAt)}</div>
                </div>
                <a href={o.uploadUrl || o.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'underline' }}>View</a>
                <button onClick={() => { const f = o.structuredResults?.map((sr: any) => `${sr.test}, ${sr.value}, ${sr.unit}, ${sr.flag}`).join('\n') || ''; setInterpretingOrderId(o.id); setIntPanelOrder(o); setIntFindings(f); syncPanelFromFindings(f); setIntImpression(o.interpretationImpression || ''); setIntRecommendation(o.interpretationRecommendation || ''); setShowIntPanel(true); }} style={{
                  background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Interpret</button>
              </div>
            ))}
            {awaitingReview.length > 3 && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>+{awaitingReview.length - 3} more</div>}
          </div>
        )}

        {/* Pending orders */}
        {pendingOrders.filter((o: any) => !(o.uploadUrl || o.fileUrl)).length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>⏳ Active Orders ({pendingOrders.length})</div>
            {pendingOrders.filter((o: any) => !(o.uploadUrl || o.fileUrl)).map((o: any, pIdx: number) => (
              <div key={o.id} style={{
                background: 'var(--white)', borderRadius: 10, padding: '10px 14px', marginBottom: 6,
                border: o.urgency === 'stat' ? '1.5px solid #dc262640' : o.urgency === 'urgent' ? '1.5px solid #f9731640' : '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {o._type === 'imaging' ? '🩻' : '🧪'} #{pIdx + 1} {(o.tests || []).join(', ')}
                      {o.urgency === 'stat' && <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', background: '#dc2626', borderRadius: 4, padding: '1px 5px' }}>STAT</span>}
                      {o.urgency === 'urgent' && <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', background: '#f97316', borderRadius: 4, padding: '1px 5px' }}>URGENT</span>}
                      {o.recurrence && <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', background: '#0F766E', borderRadius: 4, padding: '1px 5px' }}>🔄 {o.recurrence}×{o.recurrenceCount || 3}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmtDate(o.createdAt)} · {o.doctorName || doctorName}</div>
                    {o.clinicalIndication && <div style={{ fontSize: 11, color: 'var(--text)', fontStyle: 'italic', marginTop: 2 }}>💡 {o.clinicalIndication}</div>}
                    {/* Pipeline dots */}
                    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                      {(o._type === 'imaging' ? IMG_PIPELINE : LAB_PIPELINE).map((step: string) => {
                        const statuses = ['ordered', 'collected', 'processing', 'resulted', 'reviewed'];
                        const idx = statuses.indexOf(o.status);
                        const stepIdx = statuses.indexOf(step);
                        const done = stepIdx <= idx;
                        return (
                          <div key={step} style={{
                            width: 8, height: 8, borderRadius: '50%', background: done ? '#059669' : 'var(--border)',
                            opacity: done ? 1 : 0.5,
                          }} title={step} />
                        );
                      })}
                      <span style={{ fontSize: 8, color: 'var(--muted)', marginLeft: 4 }}>{o.status}</span>
                    {o.facilityName && <span style={{ fontSize: 8, color: 'var(--muted)', marginLeft: 4 }}>· {o.facilityName}</span>}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: o.status === 'processing' ? '#fefce8' : o.status === 'collected' ? '#eff6ff' : o.status === 'ordered' ? '#f0fdf4' : '#f0fdf4',
                    color: o.status === 'processing' ? '#ca8a04' : o.status === 'collected' ? '#2563eb' : '#16a34a',
                  }}>{o.status}</span>
                  <button onClick={() => openUploadcareForDoctor(o)} disabled={doctorUploading} style={{
                    background: '#0F766E', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                    opacity: doctorUploading ? 0.6 : 1, whiteSpace: 'nowrap',
                  }}>{doctorUploading ? '⌛' : '📤 Upload Result'}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resulted orders */}
        {resultedOrders.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>✅ Results ({resultedOrders.length})</div>
            {resultedOrders.map((o: any, idx: number) => (
              <div key={o.id} style={{
                background: 'var(--white)', borderRadius: 10, padding: '10px 14px', marginBottom: 6,
                border: o.interpreted ? '1px solid #38a16940' : '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{o._type === 'imaging' ? '🩻' : '🧪'} #{idx + 1} {(o.tests || []).join(', ')}</span>
                      {o.interpreted && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', borderRadius: 99, padding: '1px 6px' }}>✓ Reviewed</span>}
                      {o.interpretationSeverity && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, borderRadius: 99, padding: '1px 6px',
                          background: o.interpretationSeverity === 'critical' ? '#fef2f2' : o.interpretationSeverity === 'severe' ? '#fff7ed' : '#f0fdf4',
                          color: o.interpretationSeverity === 'critical' ? '#dc2626' : o.interpretationSeverity === 'severe' ? '#f97316' : '#16a34a',
                        }}>{o.interpretationSeverity}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{fmtDate(o.createdAt)}</div>
                    {o.uploadUrl && <a href={o.uploadUrl} target="_blank" style={{ fontSize: 10, color: '#2563eb', textDecoration: 'underline' }}>📎 View File</a>}

                    {o.structuredResults?.length > 0 && (
                      <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 4 }}>
                        {o.structuredResults.map((sr: any, i: number) => (
                          <div key={i} style={{
                            background: sr.flag === 'critical' ? '#fef2f2' : sr.flag === 'high' || sr.flag === 'low' ? '#fff7ed' : '#f0fdf4',
                            borderRadius: 6, padding: '4px 6px', fontSize: 10,
                            border: sr.flag === 'critical' ? '1px solid #dc262630' : 'none',
                          }}>
                            <div style={{ fontWeight: 600, fontSize: 9, color: 'var(--muted)' }}>{sr.test}</div>
                            <div style={{ fontWeight: 700, color: sr.flag === 'critical' ? '#dc2626' : 'var(--text)' }}>
                              {sr.value} <span style={{ fontWeight: 400, fontSize: 9 }}>{sr.unit}</span>
                              {sr.flag && <span style={{ fontWeight: 700, fontSize: 9, color: '#dc2626', marginLeft: 2 }}>{sr.flag}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {o.interpretationImpression && (
                      <div style={{ marginTop: 4, fontSize: 11, color: '#166534', fontStyle: 'italic' }}>💬 {o.interpretationImpression}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    {!o.interpreted && (
                      <button onClick={() => {
                        const findings = o.structuredResults?.map((sr: any) => `${sr.test}, ${sr.value}, ${sr.unit}, ${sr.flag}`).join('\n') || '';
                        setInterpretingOrderId(o.id);
                        setIntPanelOrder(o);
                        setIntFindings(findings);
                        syncPanelFromFindings(findings);
                        setIntImpression(o.interpretationImpression || '');
                        setIntSeverity(o.interpretationSeverity || '');
                        setIntDifferential(o.interpretationDifferentialSupport || '');
                        setIntComparison(o.interpretationPriorComparison || '');
                        setIntRecommendation(o.interpretationRecommendation || '');
                        setShowIntPanel(true);
                      }} style={{
                        background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                      }}>✍️ Interpret</button>
                    )}
                    <button onClick={() => printForm(o)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--muted)' }}>🖨 PDF</button>
                  </div>
                </div>
                {/* Interpretation now opens in right-side sliding panel */}
              </div>
            ))}
          </div>
        )}

        {workspaceOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🫁</div>
            <div style={{ fontWeight: 600 }}>No investigations yet for this workspace.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Use "Order Lab" or "Order Imaging" to begin the diagnostic workup.</div>
            {suggestedTests.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>💡 Suggested tests for this clinical context:</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {suggestedTests.map(t => (
                    <button key={t} onClick={() => { addTestToOrder(t); setOrderWorkspaceId(activeWorkspace.id); setShowOrderModal(true); }} style={{
                      fontSize: 10, padding: '4px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 99, cursor: 'pointer', fontFamily: 'var(--font)', color: '#166534', fontWeight: 600,
                    }}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Workspace Chat ── */}
        <div style={{ background: 'var(--white)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            💬 Workspace Discussion
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)' }}>— messages with patient</span>
          </div>
          <div style={{ padding: '8px 12px', maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {wsMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 16, color: 'var(--muted)', fontSize: 11 }}>
                No messages yet. Messages from the patient about this workspace will appear here.
              </div>
            )}
            {wsMessages.map((m: any) => (
              <div key={m.id} style={{
                alignSelf: m.senderRole === 'doctor' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}>
                <div style={{
                  padding: '6px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.4,
                  background: m.senderRole === 'doctor' ? '#0F766E' : '#f0fdf4',
                  color: m.senderRole === 'doctor' ? '#fff' : '#166534',
                  borderTopRightRadius: m.senderRole === 'doctor' ? 4 : 12,
                  borderTopLeftRadius: m.senderRole === 'doctor' ? 12 : 4,
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1, textAlign: m.senderRole === 'doctor' ? 'right' : 'left' }}>
                  {m.senderName} · {fmtTime(m.createdAt)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
            <input value={wsMsgText} onChange={e => setWsMsgText(e.target.value)}
              placeholder="Reply to patient about this workspace…"
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
  };

  /* ── Render Inbox ── */
  const renderInbox = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>📥 Results Inbox</div>
      {inboxItems.critical > 0 && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #dc2626', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626' }}>🚨 {inboxItems.critical} Critical Result{inboxItems.critical > 1 ? 's' : ''}</div>
          <div style={{ fontSize: 11, color: '#991b1b', marginTop: 2 }}>Immediate review required</div>
        </div>
      )}
      {inboxItems.total === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📥</div>
          <div>No results awaiting review.</div>
        </div>
      ) : (
        inboxItems.items.map((o: any, iIdx: number) => (
          <div key={o.id} style={{ background: 'var(--white)', borderRadius: 10, border: '1px solid var(--border)', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{o._type === 'imaging' ? '🩻' : '🧪'} #{iIdx + 1} {(o.tests || []).join(', ')}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmtDate(o.createdAt)} · {workspaces.find(w => w.id === o.workspaceId)?.name || 'No workspace'}</div>
                {o.clinicalIndication && <div style={{ fontSize: 11, color: 'var(--text)', fontStyle: 'italic', marginTop: 2 }}>{o.clinicalIndication}</div>}
                {o.structuredResults?.some((sr: any) => sr.flag?.toLowerCase() === 'critical') && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', background: '#fef2f2', borderRadius: 4, padding: '1px 6px', marginTop: 2, display: 'inline-block' }}>🚨 CRITICAL</span>
                )}
              </div>
              <a href={o.uploadUrl || o.fileUrl} target="_blank" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'underline', marginRight: 8 }}>View</a>
              <button onClick={() => { const f = o.structuredResults?.map((sr: any) => `${sr.test}, ${sr.value}, ${sr.unit}, ${sr.flag}`).join('\n') || ''; setInterpretingOrderId(o.id); setIntPanelOrder(o); setIntFindings(f); syncPanelFromFindings(f); setIntImpression(o.interpretationImpression || ''); setIntRecommendation(o.interpretationRecommendation || ''); setShowIntPanel(true); }} style={{
                background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Interpret</button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  /* ── Render History ── */
  const renderHistory = () => {
    const groupedByWorkspace = workspaces.map(ws => ({
      workspace: ws,
      orders: allOrders.filter((o: any) => o.workspaceId === ws.id).sort((a: any, b: any) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return tb.getTime() - ta.getTime();
      }),
    }));
    const ungroupedOrders = allOrders.filter((o: any) => !o.workspaceId);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>🕐 Investigation History</div>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tests, conditions…" style={{
            flex: 1, padding: '7px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12,
            background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', maxWidth: 300,
          }} />
        </div>

        {groupedByWorkspace.map(({ workspace: ws, orders }) => {
          if (orders.length === 0) return null;
          const filtered = searchQuery ? orders.filter((o: any) =>
            (o.tests || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase()) ||
            ws.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) : orders;
          if (filtered.length === 0) return null;
          return (
            <div key={ws.id} style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>📋 {ws.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{orders.length} investigations · {ws.clinicalProblem}</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: ws.status === 'active' ? '#f0fdf4' : '#fefce8',
                  color: ws.status === 'active' ? '#16a34a' : '#ca8a04',
                }}>{ws.status}</span>
              </div>
              {filtered.map((o: any) => (
                <div key={o.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{o._type === 'imaging' ? '🩻' : '🧪'} {(o.tests || []).join(', ')}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtDate(o.createdAt)} · {o.doctorName || '—'} · <span style={{ color: o.interpreted ? '#16a34a' : '#ca8a04' }}>{o.interpreted ? 'Reviewed' : o.status}</span></div>
                  </div>
                  <button onClick={() => { setActiveWorkspaceId(o.workspaceId); setSidebarView('workspaces'); }} style={{
                    fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--muted)',
                  }}>Open Workspace</button>
                </div>
              ))}
            </div>
          );
        })}

        {ungroupedOrders.length > 0 && (
          <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 800, fontSize: 13 }}>📋 Unassigned Orders</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{ungroupedOrders.length} orders without workspace</span>
            </div>
            {ungroupedOrders.slice(0, 10).map((o: any) => (
              <div key={o.id} style={{ padding: '6px 14px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                {o._type === 'imaging' ? '🩻' : '🧪'} {(o.tests || []).join(', ')} · {fmtDate(o.createdAt)}
              </div>
            ))}
          </div>
        )}

        {allOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
            <div>No investigation history yet.</div>
          </div>
        )}
      </div>
    );
  };

  /* ── Render Trends ── */
  const renderTrends = () => {
    const biomarkers = ['Creatinine', 'HbA1c', 'Haemoglobin', 'eGFR', 'CRP', 'WBC', 'Platelets', 'ALT', 'AST', 'Potassium', 'Sodium'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>📈 Longitudinal Biomarker Trends</div>
        {biomarkers.map(biomarker => {
          const filtered = allOrders
            .filter((o: any) => o.structuredResults?.some((sr: any) => sr.test?.toLowerCase().includes(biomarker.toLowerCase())))
            .sort((a: any, b: any) => {
              const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
              const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
              return ta.getTime() - tb.getTime();
            });
          if (filtered.length < 2) return null;
          const latest = filtered[filtered.length - 1];
          const latestSr = latest?.structuredResults?.find((s: any) => s.test?.toLowerCase().includes(biomarker.toLowerCase()));
          const isAbnormal = latestSr?.flag === 'high' || latestSr?.flag === 'low' || latestSr?.flag === 'critical';
          const allVals = filtered.map(o => {
            const sr = o.structuredResults.find((s: any) => s.test?.toLowerCase().includes(biomarker.toLowerCase()));
            return sr ? parseFloat(sr.value) : NaN;
          }).filter((v: number) => !isNaN(v));
          const maxVal = Math.max(...allVals, 1);
          const direction = allVals.length > 1 ? (allVals[allVals.length - 1] > allVals[0] ? '↑' : '↓') : '→';
          return (
            <div key={biomarker} style={{ background: 'var(--white)', borderRadius: 10, border: isAbnormal ? '1px solid #dc262630' : '1px solid var(--border)', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: isAbnormal ? '#dc2626' : 'var(--text)' }}>
                  {biomarker} {direction}
                  {latestSr?.value && <span style={{ fontWeight: 800, marginLeft: 8, fontSize: 15 }}>{latestSr.value} <span style={{ fontWeight: 400, fontSize: 10, color: 'var(--muted)' }}>{latestSr.unit}</span></span>}
                  {latestSr?.flag && <span style={{ fontWeight: 700, fontSize: 10, marginLeft: 4, color: '#dc2626' }}>({latestSr.flag})</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{filtered.length} points · {SHORT_DATE(filtered[0].createdAt)} – {SHORT_DATE(filtered[filtered.length - 1].createdAt)}</div>
              </div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 50, padding: '4px 0' }}>
                {filtered.map((o: any, i: number) => {
                  const sr = o.structuredResults.find((s: any) => s.test?.toLowerCase().includes(biomarker.toLowerCase()));
                  if (!sr) return null;
                  const val = parseFloat(sr.value);
                  if (isNaN(val)) return null;
                  const pct = Math.max((val / maxVal) * 100, 4);
                  const abnormal = sr.flag === 'high' || sr.flag === 'low' || sr.flag === 'critical';
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                      onClick={() => { setHistoryWorkspaceId(o.workspaceId); setSidebarView('history'); }}>
                      <div style={{
                        height: `${pct}%`, width: '100%', maxWidth: 24, borderRadius: '3px 3px 0 0',
                        background: abnormal ? '#ef4444' : '#059669', opacity: i === filtered.length - 1 ? 1 : 0.4, minHeight: 4,
                      }} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: abnormal ? '#ef4444' : 'var(--text)' }}>{sr.value}</span>
                      <span style={{ fontSize: 6, color: 'var(--muted)' }}>{SHORT_DATE(o.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {allOrders.filter((o: any) => o.structuredResults?.length > 0).length < 2 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📈</div>
            <div>Need at least 2 resulted investigations with structured data to show trends.</div>
          </div>
        )}
      </div>
    );
  };

  /* ── SMART ORDER MODAL ── */
  const renderOrderModal = () => {
    if (!showOrderModal) return null;
    const currentWs = workspaces.find(w => w.id === orderWorkspaceId);
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
      }} onClick={() => setShowOrderModal(false)}>
        <div style={{
          background: 'var(--white)', borderRadius: 16, maxWidth: 680, width: '100%',
          maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,.3)',
          padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
        }} onClick={e => e.stopPropagation()}>
          {/* ── Header with step indicator ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {orderType === 'lab' ? '🧪' : '🩻'} {orderType === 'lab' ? 'Order Lab Tests' : 'Order Imaging'}
            </div>
            <div style={{ display: 'flex', gap: 4, fontSize: 10 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: orderStep >= s ? '#0F766E' : 'var(--border)', color: orderStep >= s ? '#fff' : 'var(--muted)',
                  fontWeight: 700, fontSize: 11,
                }}>{s}</div>
              ))}
            </div>
          </div>

          {/* Workspace context */}
          {currentWs && (
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#166534', borderLeft: '3px solid #16a34a' }}>
              📋 Workspace: <strong>{currentWs.name}</strong>
              {currentWs.clinicalProblem && <span style={{ marginLeft: 6 }}>· 🧠 {currentWs.clinicalProblem}</span>}
              {currentWs.suspectedDiagnoses?.length > 0 && (
                <span style={{ marginLeft: 6 }}>· 🏷 {currentWs.suspectedDiagnoses.join(', ')}</span>
              )}
            </div>
          )}

          {/* Step 1: Test Selection */}
          {orderStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>1. Select {orderType === 'lab' ? 'Tests' : 'Study'}</div>
              <div style={{ position: 'relative' }}>
                <input value={orderTests} onChange={e => setOrderTests(e.target.value)}
                  placeholder={orderType === 'lab' ? 'Type tests (e.g., FBC, CRP, Creatinine) or use browser below' : "Type study (e.g., Chest X-ray, CT Abdomen)"}
                  style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)' }}
                  autoFocus onFocus={() => setShowTestBrowser(true)}
                />
                {orderTests && (
                  <button onClick={() => setOrderTests('')} style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                    fontSize: 16, color: 'var(--muted)',
                  }}>✕</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 120, overflowY: 'auto', padding: '2px 0' }}>
                {orderTests.split(',').map((t, i) => t.trim() && (
                  <span key={i} style={{
                    fontSize: 10, fontWeight: 600, background: '#0F766E10', color: '#0F766E',
                    border: '1px solid #0F766E30', borderRadius: 99, padding: '2px 7px',
                    display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
                  }}>
                    {t.trim()}
                    <span onClick={() => setOrderTests(orderTests.split(',').filter((_, j) => j !== i).join(','))}
                      style={{ cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>×</span>
                  </span>
                ))}
              </div>

              {/* Smart suggestions */}
              {suggestedTests.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>💡 Suggested for this clinical context:</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {suggestedTests.map(t => (
                      <button key={t} onClick={() => addTestToOrder(t)} style={{
                        fontSize: 10, padding: '4px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 99,
                        cursor: 'pointer', fontFamily: 'var(--font)', color: '#166534', fontWeight: 600,
                      }}>+ {t}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Test browser */}
              {showTestBrowser && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, maxHeight: 220, overflowY: 'auto', background: '#fff' }}>
                  <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
                    <input value={testSearch} onChange={e => setTestSearch(e.target.value)}
                      placeholder={`Search ${orderType === 'lab' ? 'lab tests' : 'imaging studies'}…`}
                      style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)' }}
                      autoFocus
                    />
                  </div>
                  <div>
                    {filteredTests.length === 0 && (
                      <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>
                        No tests found for "{testSearch}"
                      </div>
                    )}
                    {filteredTests.map((item, i) => (
                      <button key={i} onClick={() => {
                        addTestToOrder(item.test);
                      }} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
                        border: 'none', borderBottom: '1px solid var(--border)', width: '100%',
                        textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)',
                        background: orderTests.split(',').map(x => x.trim().toLowerCase()).includes(item.test.toLowerCase()) ? '#f0fdf4' : 'transparent',
                        fontSize: 11, color: 'var(--text)',
                      }}>
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{item.test}</div>
                          <div style={{ fontSize: 9, color: 'var(--muted)' }}>{item.group} · {item.workspace}</div>
                        </div>
                        {orderTests.split(',').map(x => x.trim().toLowerCase()).includes(item.test.toLowerCase()) && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a' }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Separate multiple tests with commas. Click tests above to add them.</div>
            </div>
          )}

          {/* Step 2: Clinical Reasoning */}
          {orderStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>2. Clinical Reasoning</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Clinical Indication *</div>
                  <textarea value={orderIndication} onChange={e => setOrderIndication(e.target.value)} placeholder="Why are we investigating?" rows={3} style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Clinical Question</div>
                  <textarea value={orderQuestion} onChange={e => setOrderQuestion(e.target.value)} placeholder="What question are we answering?" rows={3} style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                  }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Suspected Diagnoses</div>
                  <input value={orderDifferential} onChange={e => setOrderDifferential(e.target.value)} placeholder="e.g., DKA, Pneumonia, PE" style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Provisional Diagnosis</div>
                  <input value={orderProvisional} onChange={e => setOrderProvisional(e.target.value)} placeholder="Primary working diagnosis" style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                  }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Patient-Friendly Explanation</div>
                <textarea value={orderPatientExplanation} onChange={e => setOrderPatientExplanation(e.target.value)} placeholder="Simple explanation for the patient about why these tests are needed..." rows={2} style={{
                  padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                }} />
              </div>
            </div>
          )}

          {/* Step 3: Execution Settings */}
          {orderStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>3. Execution Settings</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Urgency</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                      { value: 'routine', label: 'Routine', color: '#059669' },
                      { value: 'urgent', label: 'Urgent', color: '#f97316' },
                      { value: 'stat', label: 'STAT', color: '#dc2626' },
                    ].map(u => (
                      <button key={u.value} onClick={() => setOrderUrgency(u.value)} style={{
                        flex: 1, padding: '6px', border: `2px solid ${orderUrgency === u.value ? u.color : 'var(--border)'}`,
                        borderRadius: 6, background: orderUrgency === u.value ? `${u.color}10` : 'transparent',
                        fontSize: 10, fontWeight: orderUrgency === u.value ? 700 : 500, cursor: 'pointer',
                        color: orderUrgency === u.value ? u.color : 'var(--muted)', fontFamily: 'var(--font)',
                      }}>{u.label}</button>
                    ))}
                  </div>
                </div>
                {orderType === 'lab' ? (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Specimen Type</div>
                    <select value={orderSpecimen} onChange={e => setOrderSpecimen(e.target.value)} style={{
                      padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                    }}>
                      {['Blood', 'Serum', 'Plasma', 'Urine', 'Stool', 'Sputum', 'CSF', 'Pleural Fluid', 'Ascitic Fluid'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Body Site</div>
                    <input value={orderBodySite} onChange={e => setOrderBodySite(e.target.value)} placeholder="e.g., Chest, Abdomen" style={{
                      padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                    }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {orderType === 'lab' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={orderFasting} onChange={e => setOrderFasting(e.target.checked)} style={{ accentColor: '#0F766E' }} />
                    Fasting required (8+ hours)
                  </label>
                )}
                {orderType === 'imaging' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={orderContrast} onChange={e => setOrderContrast(e.target.checked)} style={{ accentColor: '#0F766E' }} />
                    Contrast required
                  </label>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={true} onChange={() => {}} style={{ accentColor: '#0F766E' }} />
                  Notify patient when resulted
                </label>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Notes for Facility</div>
                <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Special handling instructions, clinical context for the lab/radiologist..." rows={2} style={{
                  padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Recurring Monitoring</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select value={orderRecurrence} onChange={e => setOrderRecurrence(e.target.value as any)} style={{
                    padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11,
                    background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                  }}>
                    <option value="none">One-time order</option>
                    <option value="daily">Repeat daily</option>
                    <option value="weekly">Repeat weekly</option>
                    <option value="biweekly">Repeat every 2 weeks</option>
                    <option value="monthly">Repeat monthly</option>
                  </select>
                  {orderRecurrence !== 'none' && (
                    <>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>×</span>
                      <input type="number" min={1} max={52} value={orderRecurrenceCount} onChange={e => setOrderRecurrenceCount(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                        style={{
                          width: 48, padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)',
                          fontSize: 11, background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', textAlign: 'center',
                        }} />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>times</span>
                    </>
                  )}
                </div>
                {orderRecurrence !== 'none' && (
                  <div style={{ fontSize: 10, color: '#0F766E', marginTop: 4 }}>🔄 This order will repeat {orderRecurrence}ly, {orderRecurrenceCount} times.</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Facility</div>
                <select value={orderFacility} onChange={e => setOrderFacility(e.target.value)} style={{
                  padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%',
                  background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                }}>
                  <option value="">— Select facility (optional) —</option>
                  {getFacilitiesByType(orderType).map(f => (
                    <option key={f.id} value={f.id}>{f.name} — {f.location}</option>
                  ))}
                </select>
                {orderFacility && (() => {
                  const f = FACILITIES.find(f => f.id === orderFacility);
                  return f ? (
                    <div style={{ marginTop: 4, fontSize: 10, color: 'var(--muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span>📍 {f.location}</span>
                      {f.phone && <span>📞 {f.phone}</span>}
                      <span>📋 {f.services.slice(0, 3).join(', ')}{f.services.length > 3 ? '…' : ''}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div>
              {orderStep > 1 && (
                <button onClick={() => setOrderStep(s => s - 1)} style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>← Back</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowOrderModal(false)} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Cancel</button>
              {orderStep < 3 ? (
                <button onClick={() => setOrderStep(s => s + 1)} disabled={orderStep === 1 && !orderTests.trim()} style={{
                  background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  opacity: orderStep === 1 && !orderTests.trim() ? 0.5 : 1,
                }}>Next →</button>
              ) : (
                <button onClick={submitOrder} disabled={submitting || !orderTests.trim() || !orderIndication.trim()} style={{
                  background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  opacity: submitting || !orderTests.trim() || !orderIndication.trim() ? 0.5 : 1,
                }}>{submitting ? 'Placing Order…' : '🧾 Place Order'}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── (removed - interpretation is now inline in workspace detail) ── */

  /* ── New Workspace Modal ── */
  const renderNewWorkspace = () => {
    if (!showNewWorkspace) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
      }} onClick={() => setShowNewWorkspace(false)}>
        <div style={{
          background: 'var(--white)', borderRadius: 16, padding: 24, maxWidth: 520, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', gap: 12,
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>📋 New Diagnostic Workspace</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Create a clinical episode to organize all investigations around a specific problem.</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Workspace Name *</div>
            <input value={wsForm.name} onChange={e => setWsForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Acute Chest Pain Evaluation" style={{
              padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
            }} autoFocus />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Clinical Problem</div>
            <textarea value={wsForm.problem} onChange={e => setWsForm(p => ({ ...p, problem: e.target.value }))} placeholder="e.g., 55yo male with chest pain and dyspnea for 2 days" rows={2} style={{
              padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Suspected Diagnoses (comma-separated)</div>
            <input value={wsForm.diagnoses} onChange={e => setWsForm(p => ({ ...p, diagnoses: e.target.value }))} placeholder="e.g., ACS, Pulmonary Embolism, Pericarditis" style={{
              padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Clinical Questions (one per line)</div>
            <textarea value={wsForm.questions} onChange={e => setWsForm(p => ({ ...p, questions: e.target.value }))} placeholder="Is this ischemic?
Is there heart failure?
Does the patient need admission?" rows={3} style={{
              padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Urgency</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: 'routine', label: 'Routine', color: '#059669' },
                { value: 'urgent', label: 'Urgent', color: '#f97316' },
                { value: 'stat', label: 'STAT', color: '#dc2626' },
              ].map(u => (
                <button key={u.value} onClick={() => setWsForm(p => ({ ...p, urgency: u.value as any }))} style={{
                  flex: 1, padding: '6px', border: `2px solid ${wsForm.urgency === u.value ? u.color : 'var(--border)'}`,
                  borderRadius: 8, background: wsForm.urgency === u.value ? `${u.color}10` : 'transparent',
                  fontSize: 11, fontWeight: wsForm.urgency === u.value ? 700 : 500, cursor: 'pointer',
                  color: wsForm.urgency === u.value ? u.color : 'var(--muted)', fontFamily: 'var(--font)',
                }}>{u.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button onClick={() => setShowNewWorkspace(false)} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
            }}>Cancel</button>
            <button onClick={createWorkspace} disabled={!wsForm.name.trim()} style={{
              background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              opacity: wsForm.name.trim() ? 1 : 0.5,
            }}>Create Workspace</button>
          </div>
        </div>
      </div>
    );
  };

  /* ── MAIN RENDER ── */
  return (
    <div style={{ display: 'flex', gap: 0, maxWidth: '100%', minHeight: 400 }}>
      {/* ── SIDEBAR ── */}
      <div style={{
        width: 240, flexShrink: 0, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '12px 0 0 12px',
        overflow: 'hidden',
      }}>
        {/* Sidebar nav */}
        {SIDEBAR_NAV.map(item => (
          <button key={item.id} onClick={() => setSidebarView(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: 'none', width: '100%',
            background: sidebarView === item.id ? '#fff' : 'transparent',
            borderLeft: sidebarView === item.id ? '3px solid #0F766E' : '3px solid transparent',
            cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: sidebarView === item.id ? 700 : 500,
            color: sidebarView === item.id ? '#0F766E' : 'var(--text)',
            textAlign: 'left', transition: 'all 0.1s',
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'inbox' && inboxItems.total > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: inboxItems.critical > 0 ? '#dc2626' : '#0F766E',
                color: '#fff', borderRadius: 99, padding: '1px 7px', minWidth: 18, textAlign: 'center',
              }}>{inboxItems.total}</span>
            )}
          </button>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 10px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Active Workspaces
        </div>

        {/* Workspace list in sidebar */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {wsSummary.length === 0 && (
            <div style={{ padding: '12px 14px', fontSize: 11, color: 'var(--muted)' }}>
              No workspaces yet. Create one to start organizing investigations.
            </div>
          )}
          {wsSummary.filter(ws => ws.status === 'active').map(ws => (
            <button key={ws.id} onClick={() => { setActiveWorkspaceId(ws.id); setSidebarView('workspaces'); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', width: '100%',
              background: activeWorkspaceId === ws.id ? '#fff' : 'transparent',
              cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 11, textAlign: 'left',
              color: 'var(--text)', borderLeft: activeWorkspaceId === ws.id ? '3px solid #0F766E' : '3px solid transparent',
            }}>
              <span>📋</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                  {ws.pending} pending · {ws.unreviewed > 0 && <span style={{ color: '#dc2626' }}>{ws.unreviewed} new </span>}
                  {ws.critical > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>🚨{ws.critical}</span>}
                </div>
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, color: ws.urgency === 'stat' ? '#dc2626' : ws.urgency === 'urgent' ? '#f97316' : 'var(--muted)',
                background: ws.urgency === 'stat' ? '#fef2f2' : ws.urgency === 'urgent' ? '#fff7ed' : 'transparent',
                borderRadius: 4, padding: '1px 5px',
              }}>{ws.urgency === 'stat' ? 'STAT' : ws.urgency === 'urgent' ? 'URGENT' : ''}</div>
            </button>
          ))}
          <button onClick={() => setShowNewWorkspace(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', width: '100%',
            background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 11, color: '#0F766E', fontWeight: 600,
          }}>
            <span style={{ fontSize: 14 }}>➕</span> New Workspace
          </button>
        </div>

        {/* Quick actions at bottom */}
        <div style={{ borderTop: '1px solid var(--border)', padding: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={() => { setShowNewWorkspace(true); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: 'none', width: '100%',
              background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 10, color: 'var(--text)', textAlign: 'left',
              borderRadius: 6,
            }}><span style={{ fontSize: 12 }}>➕</span> New Workspace</button>
            <button onClick={() => { setSidebarView('inbox'); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: 'none', width: '100%',
              background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 10, color: 'var(--text)', textAlign: 'left',
              borderRadius: 6,
            }}><span style={{ fontSize: 12 }}>📥</span> Results Inbox {inboxItems.total > 0 && `(${inboxItems.total})`}</button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        {sidebarView === 'workspaces' && renderWorkspaceDetail()}
        {sidebarView === 'inbox' && renderInbox()}
        {sidebarView === 'history' && renderHistory()}
        {sidebarView === 'trends' && renderTrends()}
      </div>

      {/* ── Modals ── */}
      {renderOrderModal()}
      {renderNewWorkspace()}

      {/* ── Right-side Interpretation Panel ── */}
      {showIntPanel && intPanelOrder && (() => {
        const o = intPanelOrder;
        const panelName = (o.tests || [])[0];
        const panelDef = getPanelDefinition(panelName);
        const isImage = (o.uploadUrl || o.fileUrl)?.match(/\.(png|jpg|jpeg|gif|webp)$/i);
        return (
          <div style={{
            position: 'fixed', top: 0, right: 0, width: '52%', height: '100%', background: '#fff', zIndex: 1001,
            boxShadow: '-6px 0 32px rgba(0,0,0,.12)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            borderLeft: '1px solid var(--border)',
          }}>
            {/* Header */}
            <div style={{ padding: '10px 16px', borderBottom: '2px solid #059669', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>✍️ Interpreting: {panelName}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{panelDef?.purpose || ''}</div>
              </div>
              <button onClick={() => { setShowIntPanel(false); setIntPanelOrder(null); }} style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 10px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#dc2626', fontFamily: 'var(--font)',
              }}>✕ Close</button>
            </div>
            {/* Scrollable content */}
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: '100%' }}>
                {/* LEFT: Results entry */}
                <div>
                  {isImage && (
                    <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
                      <button onClick={() => runOcr(o.uploadUrl || o.fileUrl)} disabled={ocrRunning} style={{
                        flex: 1, padding: '5px 10px', background: ocrRunning ? '#ccc' : '#f8fafc',
                        border: '1px solid var(--border)', borderRadius: 6, fontSize: 10, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
                      }}>{ocrRunning ? '🔍 Extracting…' : '🔍 Extract Text from Image'}</button>
                      <button onClick={() => openUploadcareForDoctor(o)} disabled={doctorUploading} style={{
                        background: '#0F766E', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px',
                        fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                      }}>📤 Upload</button>
                    </div>
                  )}
                  {panelDef ? (
                    <>
                      {panelDef.sections.map((section, si) => (
                        <div key={si} style={{ marginBottom: 6, background: '#f8fafc', borderRadius: 6, padding: 5, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {section.icon} {section.label}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                            {section.analytes.map((analyte, ai) => {
                              const val = panelValues[analyte.name] || '';
                              const flag = val ? computeFlag(val, analyte.refRange) : '';
                              const isAbn = flag === 'High' || flag === 'Low';
                              const isCrit = flag === 'Critical';
                              const flagIcon = isCrit ? '🔴' : isAbn ? (flag === 'High' ? '🟠' : '🟡') : '🟢';
                              const dir = val ? (isAbn ? (parseFloat(val) > 0 ? '↑' : '↓') : '→') : '';
                              return (
                                <div key={ai} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 48px 48px 55px', gap: 2, alignItems: 'center' }}>
                                  <div style={{ fontWeight: 600, fontSize: 9, color: 'var(--text)' }}>{analyte.name}</div>
                                  <input value={val} onChange={e => {
                                    const newVal = e.target.value;
                                    const newPanelVals = { ...panelValues, [analyte.name]: newVal };
                                    setPanelValues(newPanelVals);
                                    setIntFindings(buildFindingsFromPanel(newPanelVals, panelName));
                                  }} placeholder="—" style={{
                                    padding: '2px 5px', borderRadius: 4,
                                    border: isCrit ? '1.5px solid #dc2626' : isAbn ? '1.5px solid #f97316' : '1px solid var(--border)',
                                    fontSize: 10, width: '100%', background: isCrit ? '#fef2f2' : isAbn ? '#fffbeb' : '#fff',
                                    outline: 'none', fontFamily: 'var(--mono)', textAlign: 'right', boxSizing: 'border-box', fontWeight: isAbn ? 700 : 400,
                                  }} />
                                  <div style={{ color: 'var(--muted)', fontSize: 8 }}>{analyte.unit}</div>
                                  <div style={{ fontSize: 8, whiteSpace: 'nowrap' }}>
                                    {val ? <span style={{ color: isCrit ? '#dc2626' : isAbn ? '#f97316' : '#16a34a', fontWeight: 700 }}>{flagIcon} {dir}</span> : ''}
                                  </div>
                                  <div style={{ color: 'var(--muted)', fontSize: 7 }}>{analyte.refRange}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {/* WBC Pie Chart */}
                      {panelName === 'Full Blood Count (FBC)' && (() => {
                        const diffNames = ['Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'];
                        const diffVals = diffNames.map(n => parseFloat(panelValues[n]) || 0);
                        if (!diffVals.some(v => v > 0)) return null;
                        const total = diffVals.reduce((a, b) => a + b, 0) || 1;
                        const colors = ['#0F766E', '#2563eb', '#ca8a04', '#dc2626', '#805ad5'];
                        let cum = 0;
                        return (
                          <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center', background: '#f8fafc', borderRadius: 6, padding: 6 }}>
                            <svg width="64" height="64" viewBox="0 0 32 32">
                              {diffVals.map((v, i) => {
                                const pct = v / total;
                                const sa = cum * 360; cum += pct;
                                const ea = cum * 360;
                                const x1 = 16 + 14 * Math.cos((sa - 90) * Math.PI / 180);
                                const y1 = 16 + 14 * Math.sin((sa - 90) * Math.PI / 180);
                                const x2 = 16 + 14 * Math.cos((ea - 90) * Math.PI / 180);
                                const y2 = 16 + 14 * Math.sin((ea - 90) * Math.PI / 180);
                                return <path key={i} d={`M16,16 L${x1},${y1} A14,14 0 ${pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`} fill={colors[i]} stroke="#fff" strokeWidth="0.5" />;
                              })}
                              <circle cx="16" cy="16" r="6" fill="#fff" />
                              <text x="16" y="18" textAnchor="middle" fontSize="5" fontWeight="700" fill="var(--text)">WBC</text>
                            </svg>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 10px', fontSize: 8 }}>
                              {diffNames.map((n, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors[i], display: 'inline-block' }} />
                                  <span style={{ color: 'var(--muted)' }}>{n}</span>
                                  <span style={{ fontWeight: 700 }}>{panelValues[n] || '—'}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      {/* Abnormalities summary */}
                      {(() => {
                        const abn = panelDef.sections.flatMap(s => s.analytes).filter(a => {
                          const v = panelValues[a.name];
                          return v && computeFlag(v, a.refRange);
                        });
                        if (abn.length === 0) return null;
                        return (
                          <div style={{ marginTop: 4, fontSize: 8, background: '#fffbeb', borderRadius: 4, padding: '4px 6px', border: '1px solid #fde68a' }}>
                            <div style={{ fontWeight: 700, marginBottom: 1, color: '#92400e' }}>⚠ {abn.length} abnormal</div>
                            {abn.map(a => {
                              const v = panelValues[a.name];
                              const f = v ? computeFlag(v, a.refRange) : '';
                              const lbl = f === 'High' ? a.highLabel : f === 'Low' ? a.lowLabel : '';
                              return <div key={a.name} style={{ color: '#92400e' }}>• <strong>{a.name}</strong>: {v} {a.unit} ({f}){lbl ? ` — ${lbl}` : ''}</div>;
                            })}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    /* Fallback CSV entry */
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>Results (CSV: test, value, unit, flag, ref_range)</div>
                  )}
                </div>
                {/* RIGHT: Interpretation */}
                <div>
                  {panelDef && (
                    <div style={{ marginBottom: 6, background: '#f0fdf4', borderRadius: 6, padding: 5, border: '1px solid #86efac' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#166534', marginBottom: 2 }}>🧠 Clinical Reasoning</div>
                      {panelDef.interpretationQuestions.map((q, qi) => (
                        <button key={qi} onClick={() => setIntImpression(prev => prev ? `${prev}\n• ${q}` : `• ${q}`)} style={{
                          display: 'block', width: '100%', textAlign: 'left', fontSize: 8, padding: '2px 4px', background: 'transparent', border: 'none',
                          cursor: 'pointer', fontFamily: 'var(--font)', color: '#166534', lineHeight: 1.3,
                          borderBottom: qi < panelDef.interpretationQuestions.length - 1 ? '1px solid #86efac30' : 'none',
                        }}>🔍 {q}</button>
                      ))}
                    </div>
                  )}
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>Severity</div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[
                        { v: 'mild', l: 'Mild', c: '#16a34a' },
                        { v: 'moderate', l: 'Mod', c: '#ca8a04' },
                        { v: 'severe', l: 'Sev', c: '#f97316' },
                        { v: 'critical', l: 'Crit', c: '#dc2626' },
                      ].map(s => (
                        <button key={s.v} onClick={() => setIntSeverity(s.v as any)} style={{
                          flex: 1, padding: '3px', border: `2px solid ${intSeverity === s.v ? s.c : 'var(--border)'}`,
                          borderRadius: 4, background: intSeverity === s.v ? `${s.c}10` : 'transparent',
                          fontSize: 9, fontWeight: intSeverity === s.v ? 700 : 500, cursor: 'pointer',
                          color: intSeverity === s.v ? s.c : 'var(--muted)', fontFamily: 'var(--font)',
                        }}>{s.l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>Impression *</div>
                    <textarea value={intImpression} onChange={e => setIntImpression(e.target.value)} placeholder="e.g., Consistent with CAP" rows={2} style={{
                      padding: '5px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: 10, width: '100%', background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>Differential Support</div>
                    <textarea value={intDifferential} onChange={e => setIntDifferential(e.target.value)} placeholder="Supports: AGN / Against: UTI" rows={1} style={{
                      padding: '5px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: 10, width: '100%', background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>Prior Comparison</div>
                    <textarea value={intComparison} onChange={e => setIntComparison(e.target.value)} placeholder="Trending up/down" rows={1} style={{
                      padding: '5px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: 10, width: '100%', background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginBottom: 2 }}>Recommendation</div>
                    <textarea value={intRecommendation} onChange={e => setIntRecommendation(e.target.value)} placeholder="Next steps" rows={1} style={{
                      padding: '5px 8px', borderRadius: 6, border: '1.5px solid var(--border)', fontSize: 10, width: '100%', background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Footer with actions */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
              <button onClick={() => { setShowIntPanel(false); setIntPanelOrder(null); setIntFindings(''); setIntImpression(''); setIntSeverity(''); setIntDifferential(''); setIntComparison(''); setIntRecommendation(''); }} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 14px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Cancel</button>
              <button onClick={() => submitInterpretationInline(o)} disabled={intSaving || !intFindings.trim()} style={{
                background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px',
                fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                opacity: intSaving || !intFindings.trim() ? 0.5 : 1,
              }}>{intSaving ? 'Saving…' : '💾 Save Interpretation'}</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
