'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection, query, where, onSnapshot, doc, setDoc, addDoc,
  updateDoc, deleteDoc, getDoc, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HistoryExaminationEngine from '@/components/HistoryExaminationEngine';
import {
  ALL_PATHWAYS, RISK_COLORS, RISK_COLORS_DIM, getPathwayById,
  fmtDate, fmtDateTime, fmtTime, bpCategory,
  type PathwayDef, type ToolDef,
} from '@/components/doctor/panels/DepartmentDefinitions';
import ARTICLES, { searchArticles, getArticlesByCondition } from '@/src/data/education';
import { INVESTIGATION_WORKSPACES } from '@/src/data/investigationGroups';
import DiagnosticCommandCenter from '@/components/doctor/panels/DiagnosticCommandCenter';

interface EnrolledPatient {
  id: string; patientId: string; patientName: string; pathwayId: string;
  currentMilestone: number; startDate: any; status: string;
  docketId?: string; docketName?: string;
  riskLevel?: string; notes?: string; lastReview?: any;
  age?: number; sex?: string; patientIdCode?: string;
  recruitmentSource?: string; doctorId?: string; doctorName?: string;
  alerts?: number;
}

interface VitalReading {
  id: string; patientId: string; type: string; value: string;
  systolic?: number; diastolic?: number; unit: string;
  recordedAt: any; note?: string;
}

interface LabResult {
  id: string; patientId: string; tests: string[]; results?: string;
  status: string; createdAt: any; pathwayId?: string;
}

interface Adherence {
  id: string; patientId: string; pathwayId?: string;
  score: number; period: string; recordedAt: any; notes?: string;
}

interface Note {
  id: string; patientId: string; pathwayId?: string;
  type?: string; content: any; createdAt: any;
  doctorId?: string; doctorName?: string;
}

interface Alert {
  id: string; patientId: string; title: string; message: string;
  type?: string; read: boolean; createdAt: any; doctorId?: string;
  _actionType: 'message' | 'education' | 'prescription' | 'lab' | 'referral' | 'notification';
}

interface TimelineEvent {
  id: string; patientId: string; type: string; title: string;
  description?: string; createdAt: any; icon?: string;
}

interface Props {
  patientId: string;
  enrollments: EnrolledPatient[];
  allPathways: PathwayDef[];
  doctorId: string;
  doctorName: string;
  onBack: () => void;
  onEnroll: () => void;
}

type PatientTab = 'overview' | 'pathways' | 'monitoring' | 'notes' | 'labs' | 'prescriptions' | 'adherence' | 'referrals' | 'timeline' | 'education' | 'tools' | 'alerts';

export default function FullPagePatientDossier({
  patientId, enrollments, allPathways, doctorId, doctorName, onBack, onEnroll,
}: Props) {
  const [activeTab, setActiveTab] = useState<PatientTab>('overview');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [imaging, setImaging] = useState<any[]>([]);
  const [adherence, setAdherence] = useState<Adherence[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sentTopics, setSentTopics] = useState<string[]>([]);
  const [allPrescriptions, setAllPrescriptions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralData, setReferralData] = useState({ specialty: '', facility: '', reason: '', notes: '' });
  const [invWorkspace, setInvWorkspace] = useState('respiratory');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderType, setOrderType] = useState<'lab' | 'imaging'>('lab');
  const [orderTest, setOrderTest] = useState('');
  const [orderClinicalIndication, setOrderClinicalIndication] = useState('');
  const [orderDifferential, setOrderDifferential] = useState('');
  const [orderUrgency, setOrderUrgency] = useState('routine');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderProvisionalDiagnosis, setOrderProvisionalDiagnosis] = useState('');
  const [orderClinicalQuestion, setOrderClinicalQuestion] = useState('');
  const [orderSpecimenType, setOrderSpecimenType] = useState('blood');
  const [orderBodySite, setOrderBodySite] = useState('');
  const [orderFastingRequired, setOrderFastingRequired] = useState(false);
  const [orderContrastRequired, setOrderContrastRequired] = useState(false);
  const [interpretOrder, setInterpretOrder] = useState<any>(null);
  const [interpretFindings, setInterpretFindings] = useState('');
  const [interpretImpression, setInterpretImpression] = useState('');
  const [interpretRecommendation, setInterpretRecommendation] = useState('');
  const [interpretSeverity, setInterpretSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical' | ''>('');
  const [interpretDifferentialSupport, setInterpretDifferentialSupport] = useState('');
  const [interpretPriorComparison, setInterpretPriorComparison] = useState('');
  const [showInvestigationHistory, setShowInvestigationHistory] = useState(false);
  const [historyInvestigationId, setHistoryInvestigationId] = useState<string | null>(null);

  // Note composer
  const [noteView, setNoteView] = useState<'quick' | 'full'>('quick');
  const [newNote, setNewNote] = useState({ type: 'progress', content: '', pathwayId: '' });
  const [savingNote, setSavingNote] = useState(false);

  // Alert compose
  const [alertMsg, setAlertMsg] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);

  // Education
  const [sendingEdu, setSendingEdu] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<string | null>(null);
  const [selectedPathwayForTab, setSelectedPathwayForTab] = useState<string>(
    enrollments[0]?.pathwayId || ''
  );
  const [questions, setQuestions] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  useEffect(() => {
    getDoc(doc(db, 'users', patientId)).then(snap => {
      if (snap.exists()) setPatientInfo(snap.data());
    }).catch(() => {});
  }, [patientId]);

  useEffect(() => {
    const subs: (() => void)[] = [];
    const pid = patientId;

    subs.push(onSnapshot(
      query(collection(db, 'toolReadings'), where('patientId', '==', pid), orderBy('recordedAt', 'desc'), limit(50)),
      snap => setVitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as VitalReading)))
    ));
    subs.push(onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', pid), orderBy('createdAt', 'desc'), limit(20)),
      snap => setLabs(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabResult)))
    ));
    subs.push(onSnapshot(
      query(collection(db, 'imagingOrders'), where('patientId', '==', pid), orderBy('createdAt', 'desc'), limit(20)),
      snap => setImaging(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));
    // All prescriptions for this patient (from any doctor)
    subs.push(onSnapshot(
      query(collection(db, 'prescriptions'), where('patientId', '==', pid), orderBy('createdAt', 'desc'), limit(50)),
      snap => setAllPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));
    subs.push(onSnapshot(
      query(collection(db, 'medicationAdherence'), where('patientId', '==', pid), orderBy('recordedAt', 'desc'), limit(20)),
      snap => setAdherence(snap.docs.map(d => ({ id: d.id, ...d.data() } as Adherence)))
    ));
    subs.push(onSnapshot(
      query(collection(db, 'clinicalNotes'), where('patientId', '==', pid), orderBy('createdAt', 'desc'), limit(30)),
      snap => setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Note)))
    ));
    // Doctor action history — what THIS doctor has done for this patient
    subs.push(onSnapshot(
      query(collection(db, 'patientNotifications'), where('patientId', '==', pid), where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'), limit(20)),
      snap => {
        const msgs: Alert[] = snap.docs.map(d => ({ id: d.id, ...d.data(), _actionType: 'message' } as Alert));
        setAlerts(prev => {
          const nonMsg = prev.filter(a => a._actionType !== 'message');
          return [...msgs, ...nonMsg].sort((a, b) => {
            const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return tb.getTime() - ta.getTime();
          });
        });
      }
    ));
    // Education actions
    subs.push(onSnapshot(
      query(collection(db, 'education_logs'), where('patientId', '==', pid), where('doctorId', '==', doctorId), orderBy('sentAt', 'desc'), limit(20)),
      snap => {
        const edu: Alert[] = snap.docs.map(d => ({ id: d.id, ...d.data(), _actionType: 'education' } as Alert));
        setAlerts(prev => {
          const nonEdu = prev.filter(a => a._actionType !== 'education');
          return [...nonEdu, ...edu].sort((a, b) => {
            const getTs = (x: any) => x.createdAt?.toDate ? x.createdAt.toDate() : new Date(x.sentAt || x.createdAt || 0);
            return getTs(b).getTime() - getTs(a).getTime();
          });
        });
      }
    ));
    // Prescription actions
    subs.push(onSnapshot(
      query(collection(db, 'prescriptions'), where('patientId', '==', pid), where('doctorId', '==', doctorId), orderBy('createdAt', 'desc'), limit(20)),
      snap => {
        const rx: Alert[] = snap.docs.map(d => ({ id: d.id, ...d.data(), _actionType: 'prescription' } as Alert));
        setAlerts(prev => {
          const nonRx = prev.filter(a => a._actionType !== 'prescription');
          return [...nonRx, ...rx].sort((a, b) => {
            const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return tb.getTime() - ta.getTime();
          });
        });
      }
    ));
    // Lab orders
    subs.push(onSnapshot(
      query(collection(db, 'labOrders'), where('patientId', '==', pid), where('doctorId', '==', doctorId), orderBy('orderedAt', 'desc'), limit(20)),
      snap => {
        const labs: Alert[] = snap.docs.map(d => ({ id: d.id, ...d.data(), _actionType: 'lab' } as Alert));
        setAlerts(prev => {
          const nonLab = prev.filter(a => a._actionType !== 'lab');
          return [...nonLab, ...labs].sort((a, b) => {
            const getTs = (x: any) => x.createdAt?.toDate ? x.createdAt.toDate() : new Date(x.orderedAt || x.createdAt || 0);
            return getTs(b).getTime() - getTs(a).getTime();
          });
        });
      }
    ));
    // Patient timeline (for all action types)
    subs.push(onSnapshot(
      query(collection(db, 'patient_timeline'), where('patientId', '==', pid), orderBy('createdAt', 'desc'), limit(50)),
      snap => setTimeline(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent)))
    ));
    // Education topics sent (for sent/unsent tracking)
    subs.push(onSnapshot(
      query(collection(db, 'education_logs'), where('patientId', '==', pid)),
      snap => setSentTopics(snap.docs.map(d => d.data().topic as string))
    ));
    // Referrals
    subs.push(onSnapshot(
      query(collection(db, 'referrals'), where('patientId', '==', pid), orderBy('createdAt', 'desc'), limit(20)),
      snap => setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));
    // Patient questions on education content
    subs.push(onSnapshot(
      query(collection(db, 'education_questions'), where('patientId', '==', pid), orderBy('askedAt', 'desc')),
      snap => setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));
    // Patient stories
    subs.push(onSnapshot(
      query(collection(db, 'education_stories'), where('patientId', '==', pid), orderBy('sharedAt', 'desc')),
      snap => setStories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    return () => subs.forEach(u => u());
  }, [patientId]);

  // Derived data
  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const pausedEnrollments = enrollments.filter(e => e.status === 'paused');

  const currentPathway = allPathways.find(p => p.id === selectedPathwayForTab) || allPathways[0] || { id: '', label: '', icon: '📋', color: '#0F766E', colorDim: 'rgba(15,118,110,0.08)', duration: '', category: '', departmentId: '', milestones: [], tools: [], educationTopics: [], description: '' } as PathwayDef;
  const currentEnrollment = enrollments.find(e => e.pathwayId === selectedPathwayForTab) || enrollments[0];
  const pathwayOptions = enrollments.map(e => allPathways.find(p => p.id === e.pathwayId)).filter(Boolean) as PathwayDef[];

  const latestVital = (type: string) => vitals.find(v => v.type === type);
  const avgAdherence = adherence.length
    ? Math.round(adherence.reduce((a, b) => a + b.score, 0) / adherence.length)
    : null;

  const allUniqueTools = useMemo(() => {
    const seen = new Set<string>();
    return enrollments.flatMap(e => {
      const pw = allPathways.find(p => p.id === e.pathwayId);
      return pw ? pw.tools.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      }) : [];
    });
  }, [enrollments, allPathways]);

  const allUniqueMetrics = useMemo(() => {
    const seen = new Set<string>();
    return enrollments.flatMap(e => {
      const pw = allPathways.find(p => p.id === e.pathwayId);
      return pw?.monitoringMetrics ? pw.monitoringMetrics.filter(m => {
        if (seen.has(m.key)) return false;
        seen.add(m.key);
        return true;
      }) : [];
    });
  }, [enrollments, allPathways]);

  const allEducationTopics = useMemo(() => {
    const seen = new Set<string>();
    return enrollments.flatMap(e => {
      const pw = allPathways.find(p => p.id === e.pathwayId);
      return pw ? pw.educationTopics.filter(t => {
        if (seen.has(t)) return false;
        seen.add(t);
        return true;
      }) : [];
    });
  }, [enrollments, allPathways]);

  const investigations = useMemo(() => {
    const merged = [
      ...labs.map(l => ({ ...l, _type: 'lab' as const })),
      ...imaging.map(i => ({ ...i, _type: 'imaging' as const })),
    ];
    merged.sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return tb.getTime() - ta.getTime();
    });
    return merged;
  }, [labs, imaging]);

  const printRequestForm = (item: any, type: string, patient: any, note: any) => {
    const isLab = type === 'lab';
    const now = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const refNum = `INV-${item.id?.slice(-8).toUpperCase() || 'N/A'}`;
    return `<!DOCTYPE html><html><head><title>${isLab ? 'Laboratory' : 'Imaging'} Request Form</title>
<style>
  @page { margin: 15mm 12mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a2e; line-height: 1.5; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0F766E; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 16pt; color: #0F766E; font-weight: 800; }
  .header .badge { font-size: 9pt; background: #0F766E; color: #fff; padding: 3px 12px; border-radius: 99px; font-weight: 700; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .field { margin-bottom: 6px; }
  .field label { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 1px; }
  .field .value { font-size: 10pt; font-weight: 600; color: #1a1a2e; padding: 4px 8px; background: #f8fafc; border-radius: 4px; }
  .section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #0F766E; margin: 14px 0 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th { background: #f1f5f9; font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #475569; padding: 6px 8px; text-align: left; border: 1px solid #e2e8f0; }
  td { font-size: 9pt; padding: 6px 8px; border: 1px solid #e2e8f0; }
  .result-row td { font-size: 10pt; padding: 4px 8px; }
  .flag-critical { color: #dc2626; font-weight: 700; }
  .flag-abnormal { color: #f97316; font-weight: 600; }
  .flag-normal { color: #16a34a; }
  .footer { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8pt; color: #94a3b8; display: flex; justify-content: space-between; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
  .sig-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
  .sig-box .label { font-size: 8pt; font-weight: 700; color: #64748b; }
  .sig-line { border-top: 1px solid #cbd5e1; margin-top: 28px; padding-top: 4px; font-size: 9pt; }
  .disclaimer { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; font-size: 8pt; color: #991b1b; margin-top: 12px; }
  .qr-placeholder { width: 60px; height: 60px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 7pt; color: #94a3b8; text-align: center; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style></head><body>
<div class="header">
  <div><h1>🏥 AMEXAN Health System</h1><div style="font-size:8pt;color:#64748b;">${isLab ? 'Laboratory' : 'Imaging'} Request Form · A4 Clinical Document</div></div>
  <div style="text-align:right;"><div class="badge">${isLab ? '🧪 LAB' : '🩻 IMAGING'}</div><div style="font-size:7pt;color:#94a3b8;margin-top:4px;">Ref: ${refNum}</div></div>
</div>
<div class="grid-2">
  <div class="field"><label>Patient Name</label><div class="value">${patient?.name || patient?.displayName || 'Unknown'}</div></div>
  <div class="field"><label>Patient ID</label><div class="value">${patientId}</div></div>
  <div class="field"><label>Age / Gender</label><div class="value">${patient?.age || '—'} / ${patient?.gender || '—'}</div></div>
  <div class="field"><label>Request Date</label><div class="value">${now}</div></div>
  <div class="field"><label>Ordering Doctor</label><div class="value">${doctorName} (${doctorId})</div></div>
  <div class="field"><label>Priority</label><div class="value" style="color:${item.urgency === 'stat' ? '#dc2626' : item.urgency === 'urgent' ? '#f97316' : '#1a1a2e'};font-weight:700;">${(item.urgency || 'ROUTINE').toUpperCase()}</div></div>
  ${item._type === 'imaging' ? `<div class="field"><label>Body Site</label><div class="value">${item.bodySite || '—'}</div></div>` : ''}
  ${item._type === 'lab' ? `<div class="field"><label>Specimen Type</label><div class="value">${item.specimenType || 'Blood'}</div></div>` : ''}
</div>
${item.fastingRequired ? '<div class="disclaimer">⚠ FASTING REQUIRED: Patient must fast for at least 8 hours before sample collection.</div>' : ''}
${item.contrastRequired ? '<div class="disclaimer">⚠ CONTRAST REQUIRED: Check renal function and allergy history before contrast administration.</div>' : ''}
<div class="section-title">${isLab ? 'Tests Requested' : 'Imaging Study'}</div>
<table><tr><th>#</th><th>${isLab ? 'Test Name' : 'Study'}</th><th>Clinical Indication</th><th>Status</th></tr>
${(item.tests || ['N/A']).map((t: string, i: number) =>
  `<tr><td>${i + 1}</td><td><strong>${t}</strong></td><td>${item.clinicalIndication || '—'}</td><td>${item.status || 'ordered'}</td></tr>`
).join('')}
</table>
${item.provisionalDiagnosis ? `<div class="field" style="margin-top:6px;"><label>Provisional Diagnosis</label><div class="value">${item.provisionalDiagnosis}</div></div>` : ''}
${item.clinicalQuestion ? `<div class="field" style="margin-top:6px;"><label>Clinical Question</label><div class="value">${item.clinicalQuestion}</div></div>` : ''}
${item.differential ? `<div class="field" style="margin-top:6px;"><label>Differential Diagnosis</label><div class="value">${item.differential}</div></div>` : ''}
${item.notes ? `<div class="field" style="margin-top:6px;"><label>Additional Notes</label><div class="value">${item.notes}</div></div>` : ''}
${item.structuredResults?.length ? `
<div class="section-title">Results</div>
<table><tr><th>Test</th><th>Value</th><th>Unit</th><th>Flag</th><th>Reference Range</th></tr>
${item.structuredResults.map((sr: any) => `
<tr class="result-row">
  <td><strong>${sr.test}</strong></td>
  <td class="${sr.flag?.toLowerCase() === 'critical' ? 'flag-critical' : sr.flag?.toLowerCase() === 'high' || sr.flag?.toLowerCase() === 'low' ? 'flag-abnormal' : 'flag-normal'}">${sr.value}</td>
  <td>${sr.unit || '—'}</td>
  <td class="${sr.flag?.toLowerCase() === 'critical' || sr.flag?.toLowerCase() === 'high' || sr.flag?.toLowerCase() === 'low' ? 'flag-critical' : ''}">${sr.flag || 'N'}</td>
  <td>${sr.range || '—'}</td>
</tr>`).join('')}
</table>` : ''}
${item.interpretationImpression ? `<div class="section-title">Doctor Interpretation</div><div style="background:#f0fdf4;border-radius:6px;padding:10px;font-size:10pt;"><strong>Impression:</strong> ${item.interpretationImpression}<br>${item.interpretationRecommendation ? `<strong>Recommendation:</strong> ${item.interpretationRecommendation}` : ''}<br>${item.interpretationDifferentialSupport ? `<strong>Differential Support:</strong> ${item.interpretationDifferentialSupport}` : ''}</div>` : ''}
<div class="signatures">
  <div class="sig-box"><div class="label">Ordering Doctor Signature</div><div class="sig-line">${doctorName}</div><div style="font-size:8pt;color:#94a3b8;margin-top:2px;">Date: ${now}</div></div>
  <div class="sig-box"><div class="label">${isLab ? 'Laboratory' : 'Radiology'} Use Only</div><div class="sig-line">Technologist / Pathologist</div><div style="font-size:8pt;color:#94a3b8;margin-top:2px;">Date/Time: _______________</div></div>
</div>
<div class="footer">
  <span>AMEXAN Health System · Confidential Patient Document</span>
  <span>Ref: ${refNum} · Printed: ${now}</span>
  <div class="qr-placeholder">QR<br/>Code</div>
</div>
${!item.interpreted ? '<p class="disclaimer no-print">⚠ PRELIMINARY REPORT: Results pending review by ordering physician.</p>' : ''}
<script>window.print();</script>
</body></html>`;
  };

  // ─── ACTIONS ───

  const saveNote = async () => {
    if (!newNote.content.trim()) return;
    setSavingNote(true);
    try {
      await addDoc(collection(db, 'clinicalNotes'), {
        patientId, pathwayId: newNote.pathwayId || enrollments[0]?.pathwayId,
        type: newNote.type, content: newNote.content,
        doctorId, doctorName, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'note',
        title: `${(newNote.type || 'progress').replace('_', ' ')} note added`,
        description: newNote.content.slice(0, 80),
        icon: '📝', doctorId, doctorName, createdAt: serverTimestamp(),
      });
      setNewNote({ type: 'progress', content: '', pathwayId: '' });
    } catch (e) { console.error(e); }
    setSavingNote(false);
  };

  const sendAlert = async () => {
    if (!alertMsg.trim()) return;
    setSendingAlert(true);
    try {
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId, doctorName,
        title: `📋 Message from Dr. ${doctorName}`,
        message: alertMsg, type: 'clinical', read: false,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'alerts'), {
        patientId, doctorId, type: 'general',
        title: `Message from Dr. ${doctorName}`,
        message: alertMsg, read: false,
        createdAt: serverTimestamp(),
      });
      setAlertMsg('');
    } catch (e) { console.error(e); }
    setSendingAlert(false);
  };

  const orderLab = async (label: string) => {
    await addDoc(collection(db, 'labOrders'), {
      patientId, doctorId, doctorName,
      pathwayId: currentPathway.id,
      tests: [label], instructions: `Ordered via ${currentPathway.label}`,
      status: 'ordered', createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'patient_timeline'), {
      patientId, type: 'lab',
      title: `Lab ordered: ${label}`, icon: '🧪', doctorId,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'patientNotifications'), {
      patientId, doctorId,
      title: '🧪 Lab Test Ordered',
      message: `Dr. ${doctorName} has ordered: ${label}. Please visit the laboratory.`,
      type: 'lab', read: false, createdAt: serverTimestamp(),
    });
  };

  const submitStructuredOrder = async () => {
    if (!orderTest.trim()) return;
    const tests = orderTest.split(',').map(t => t.trim());
    await addDoc(collection(db, orderType === 'lab' ? 'labOrders' : 'imagingOrders'), {
      patientId, doctorId, doctorName,
      pathwayId: currentPathway.id,
      tests, type: orderType,
      clinicalIndication: orderClinicalIndication,
      differential: orderDifferential,
      provisionalDiagnosis: orderProvisionalDiagnosis,
      clinicalQuestion: orderClinicalQuestion,
      urgency: orderUrgency,
      specimenType: orderType === 'lab' ? orderSpecimenType : undefined,
      bodySite: orderType === 'imaging' ? orderBodySite : undefined,
      fastingRequired: orderType === 'lab' ? orderFastingRequired : undefined,
      contrastRequired: orderType === 'imaging' ? orderContrastRequired : undefined,
      notes: orderNotes,
      status: 'ordered', createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'patient_timeline'), {
      patientId, type: 'lab',
      title: `${orderType === 'lab' ? '🧪' : '🩻'} ${orderType === 'lab' ? 'Lab' : 'Imaging'} ordered: ${tests.join(', ')}`,
      description: orderClinicalIndication,
      icon: orderType === 'lab' ? '🧪' : '🩻', doctorId,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'patientNotifications'), {
      patientId, doctorId,
      title: orderType === 'lab' ? '🧪 Lab Test Ordered' : '🩻 Imaging Ordered',
      message: `Dr. ${doctorName} has ordered: ${tests.join(', ')}. ${orderClinicalIndication ? 'Reason: ' + orderClinicalIndication : ''}`,
      type: 'lab', read: false, createdAt: serverTimestamp(),
    });
    setShowOrderForm(false);
    setOrderTest('');
    setOrderClinicalIndication('');
    setOrderDifferential('');
    setOrderUrgency('routine');
    setOrderNotes('');
    setOrderProvisionalDiagnosis('');
    setOrderClinicalQuestion('');
    setOrderSpecimenType('blood');
    setOrderBodySite('');
    setOrderFastingRequired(false);
    setOrderContrastRequired(false);
  };

  const submitInterpretation = async () => {
    if (!interpretOrder || !interpretFindings.trim()) return;
    try {
      const col = interpretOrder._type === 'imaging' ? 'imagingOrders' : 'labOrders';
      const structuredResults = interpretFindings.split('\n')
        .map(l => l.trim())
        .filter(l => l.includes(','))
        .map(l => {
          const parts = l.split(',').map(p => p.trim());
          return { test: parts[0], value: parts[1] || '', unit: parts[2] || '', flag: parts[3] || '' };
        });
      await updateDoc(doc(db, col, interpretOrder.id), {
        interpreted: true,
        interpretationFindings: interpretFindings,
        structuredResults: structuredResults.length > 0 ? structuredResults : undefined,
        interpretationImpression: interpretImpression,
        interpretationRecommendation: interpretRecommendation,
        interpretationSeverity: interpretSeverity || undefined,
        interpretationDifferentialSupport: interpretDifferentialSupport,
        interpretationPriorComparison: interpretPriorComparison,
        interpretedAt: serverTimestamp(),
        interpretedBy: doctorName,
        status: 'reviewed',
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'lab',
        title: `${interpretOrder._type === 'lab' ? '🧪' : '🩻'} Result interpreted: ${(interpretOrder.tests || []).join(', ')}`,
        description: interpretImpression || interpretFindings.slice(0, 100),
        icon: interpretOrder._type === 'lab' ? '🧪' : '🩻', doctorId,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId,
        title: '📋 Investigation Result Reviewed',
        message: `Dr. ${doctorName} has reviewed your ${(interpretOrder.tests || []).join(', ')} results. Check the app for details.`,
        type: 'lab', read: false, createdAt: serverTimestamp(),
      });
      setInterpretOrder(null);
      setInterpretFindings('');
      setInterpretImpression('');
      setInterpretRecommendation('');
      setInterpretSeverity('');
      setInterpretDifferentialSupport('');
      setInterpretPriorComparison('');
    } catch (e) { console.error('Interpretation failed:', e); }
  };

  const sendEducation = async (topic: string) => {
    setSendingEdu(topic);
    const topicPathway = allPathways.find(p => p.educationTopics.includes(topic));
    let matchedArticles = searchArticles(topic);
    if (matchedArticles.length === 0) {
      matchedArticles = getArticlesByCondition(topicPathway?.id || currentPathway.id);
    }
    const article = matchedArticles[0];
    try {
      await addDoc(collection(db, 'education_logs'), {
        patientId, pathwayId: currentPathway.id,
        topic, doctorId, doctorName, sentAt: serverTimestamp(),
        title: article?.title || topic,
        content: article?.content || topic,
        category: article?.category || '',
        literacyLevel: article?.literacyLevel || 'basic',
        readTimeMinutes: article?.readTimeMinutes || 3,
        icon: article?.icon || '📚',
        summary: article?.summary || '',
        keyPoints: article?.keyPoints || [],
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId,
        title: '📚 Health Education Resource',
        message: `Dr. ${doctorName} has sent: "${topic}"`,
        type: 'education', read: false, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'education',
        title: 'Education material sent',
        description: topic, icon: '📚', doctorId,
        createdAt: serverTimestamp(),
      });
    } catch (e) { console.error(e); }
    setSendingEdu(null);
  };

  const createReferral = async () => {
    if (!referralData.specialty.trim()) return;
    setShowReferralForm(false);
    try {
      await addDoc(collection(db, 'referrals'), {
        patientId, doctorId, doctorName,
        specialty: referralData.specialty,
        facility: referralData.facility,
        reason: referralData.reason,
        notes: referralData.notes,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId,
        title: '🔗 Referral Initiated',
        message: `Dr. ${doctorName} has referred you to ${referralData.specialty} at ${referralData.facility || 'a specialist'}. ${referralData.reason ? 'Reason: ' + referralData.reason : ''}`,
        type: 'referral', read: false, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'referral',
        title: `Referred to ${referralData.specialty}`,
        description: referralData.reason || 'Referral initiated',
        icon: '🔗', doctorId, createdAt: serverTimestamp(),
      });
      setReferralData({ specialty: '', facility: '', reason: '', notes: '' });
    } catch (e) { console.error('Referral failed:', e); }
  };

  const handleAnswerQuestion = async (q: any) => {
    if (!q.id || !answerText[q.id]?.trim()) return;
    try {
      await updateDoc(doc(db, 'education_questions', q.id), {
        answer: answerText[q.id], answeredAt: serverTimestamp(), answeredBy: doctorName,
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId,
        title: '✍️ Your Question Answered',
        message: `Dr. ${doctorName} answered your question about "${q.resourceTitle}"`,
        type: 'education', read: false, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'education',
        title: `Answered patient question about: ${q.resourceTitle}`,
        description: answerText[q.id], icon: '✍️', doctorId,
        createdAt: serverTimestamp(),
      });
      setAnswerText(prev => ({ ...prev, [q.id!]: '' }));
    } catch (e) { console.error('Answer failed:', e); }
  };

  const handleRespondStory = async (s: any) => {
    if (!s.id || !responseText[s.id]?.trim()) return;
    try {
      await updateDoc(doc(db, 'education_stories', s.id), {
        doctorResponse: responseText[s.id], respondedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patientNotifications'), {
        patientId, doctorId,
        title: '💬 Doctor Responded to Your Story',
        message: `Dr. ${doctorName} responded to your health journey story`,
        type: 'education', read: false, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'patient_timeline'), {
        patientId, type: 'education',
        title: 'Responded to patient story',
        description: responseText[s.id], icon: '💬', doctorId,
        createdAt: serverTimestamp(),
      });
      setResponseText(prev => ({ ...prev, [s.id!]: '' }));
    } catch (e) { console.error('Response failed:', e); }
  };

  const updateMilestone = async (enrollmentId: string, milestone: number) => {
    try {
      await updateDoc(doc(db, 'care_pathways', enrollmentId), {
        currentMilestone: milestone, lastReview: serverTimestamp(),
      });
      const ep = enrollments.find(e => e.id === enrollmentId);
      if (ep) {
        const pw = allPathways.find(p => p.id === ep.pathwayId);
        await addDoc(collection(db, 'patient_timeline'), {
          patientId, type: 'milestone',
          title: `Milestone updated: ${pw?.milestones[milestone] || `Milestone ${milestone + 1}`}`,
          icon: '🎯', doctorId, createdAt: serverTimestamp(),
        });
      }
    } catch (e) { console.error(e); }
  };

  const unreadAlerts = alerts.filter(a => a._actionType === 'message' && !a.read).length;

  // ─── RENDER ───

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      animation: 'fadeUp .25s ease',
    }}>
      {/* ── HEADER ── */}
      <div style={{
        flexShrink: 0, background: 'var(--white)',
        borderBottom: '1px solid var(--border)', padding: '14px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{
              background: 'var(--bg)', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer', fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
            }}>←</button>
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: `linear-gradient(135deg, ${currentPathway.color}, ${currentPathway.color}99)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>{currentPathway.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                {enrollments[0]?.patientName || 'Patient'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--mono)' }}>{patientInfo?.patientId || patientId.slice(0, 8).toUpperCase()}</span>
                {patientInfo?.gender && <span>· {patientInfo.gender}</span>}
                {patientInfo?.age && <span>· {patientInfo.age} yrs</span>}
                {patientInfo?.phone && <span>· {patientInfo.phone}</span>}
                <span style={{ background: currentPathway.colorDim, color: currentPathway.color, borderRadius: 99, padding: '1px 8px', fontWeight: 700, fontSize: 11 }}>
                  {activeEnrollments.length} active · {enrollments.length} total
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onEnroll} style={{
              padding: '7px 14px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 12,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
            }}>➕ Enrol in Another</button>
            <button onClick={() => setActiveTab('alerts')} style={{
              position: 'relative', padding: '7px 12px', background: unreadAlerts > 0 ? 'rgba(229,62,62,.1)' : 'var(--bg)',
              border: `1px solid ${unreadAlerts > 0 ? 'rgba(229,62,62,.25)' : 'var(--border)'}`,
              borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font)', color: unreadAlerts > 0 ? '#e53e3e' : 'var(--muted)',
            }}>
              🔔 {unreadAlerts > 0 && <span style={{ marginLeft: 4 }}>{unreadAlerts}</span>}
            </button>
          </div>
        </div>

        {/* Pathway selector tabs */}
        {pathwayOptions.length > 1 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
            {pathwayOptions.map(pw => {
              const ep = enrollments.find(e => e.pathwayId === pw.id);
              return (
                <button key={pw.id} onClick={() => setSelectedPathwayForTab(pw.id)} style={{
                  padding: '4px 10px', border: 'none', borderRadius: 99, cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)',
                  background: selectedPathwayForTab === pw.id ? pw.colorDim : 'var(--bg)',
                  color: selectedPathwayForTab === pw.id ? pw.color : 'var(--muted)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {pw.icon} {pw.label}
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: ep?.status === 'active' ? '#38a169' : ep?.status === 'paused' ? '#d69e2e' : '#8fa3bd',
                    display: 'inline-block',
                  }} />
                </button>
              );
            })}
          </div>
        )}

        {/* Main tabs */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
          {([
            { id: 'overview', label: 'Overview', icon: '🏠' },
            { id: 'pathways', label: `Pathways (${enrollments.length})`, icon: '🛤️' },
            { id: 'monitoring', label: 'Monitoring', icon: '📊' },
            { id: 'notes', label: 'Notes', icon: '📝' },
            { id: 'labs', label: 'Labs', icon: '🧪' },
            { id: 'prescriptions', label: `Prescriptions (${allPrescriptions.length})`, icon: '💊' },
            { id: 'adherence', label: 'Adherence', icon: '📋' },
            { id: 'referrals', label: 'Referrals', icon: '🔗' },
            { id: 'timeline', label: 'Timeline', icon: '⏱️' },
            { id: 'education', label: 'Education', icon: '📚' },
            { id: 'tools', label: 'Tools', icon: '🛠️' },
            { id: 'alerts', label: `Alerts (${unreadAlerts})`, icon: '🔔' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as PatientTab)} style={{
              padding: '8px 14px', border: 'none', background: 'transparent',
              color: activeTab === t.id ? currentPathway.color : 'var(--muted)',
              fontWeight: activeTab === t.id ? 700 : 500, fontSize: 12,
              cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap',
              borderBottom: activeTab === t.id ? `2px solid ${currentPathway.color}` : '2px solid transparent',
              transition: 'all .14s',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', background: 'var(--bg)' }}>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '100%' }}>
            {/* Vital signs snapshot */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10,
            }}>
              {allUniqueMetrics.slice(0, 6).map(m => {
                const v = latestVital(m.key);
                const bpCat = m.key === 'bp' && v?.systolic && v?.diastolic
                  ? bpCategory(v.systolic, v.diastolic) : null;
                return (
                  <div key={m.key} style={{
                    background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12,
                    padding: '12px 14px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20 }}>{m.icon}</div>
                    <div style={{
                      fontSize: 18, fontWeight: 900, fontFamily: 'var(--mono)',
                      color: bpCat?.color || 'var(--text)', marginTop: 4,
                    }}>
                      {v ? (m.key === 'bp' ? (v.systolic != null && v.diastolic != null ? `${v.systolic}/${v.diastolic}` : '—/—') : v.value || '—') : '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>Target: {m.normalRange}</div>
                    {bpCat && <div style={{ fontSize: 9, fontWeight: 700, color: bpCat.color, marginTop: 2 }}>{bpCat.label}</div>}
                  </div>
                );
              })}
            </div>

            {/* Active pathway snapshots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeEnrollments.slice(0, 3).map(ep => {
                const pw = allPathways.find(p => p.id === ep.pathwayId);
                if (!pw) return null;
                const progress = Math.round(((ep.currentMilestone + 1) / pw.milestones.length) * 100);
                return (
                  <div key={ep.id} style={{
                    background: pw.colorDim, border: `1px solid ${pw.color}30`,
                    borderRadius: 14, padding: 14,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{pw.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: pw.color }}>{pw.label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        Since {fmtDate(ep.startDate)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
                      Milestone {ep.currentMilestone + 1}/{pw.milestones.length}: <strong>{pw.milestones[ep.currentMilestone]}</strong>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: pw.color, borderRadius: 99 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button onClick={() => updateMilestone(ep.id, Math.min(ep.currentMilestone + 1, pw.milestones.length - 1))} style={{
                        padding: '5px 12px', background: pw.color, color: '#fff',
                        border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                      }}>✓ Advance Milestone</button>
                      {ep.riskLevel && (
                        <span style={{
                          background: RISK_COLORS_DIM[ep.riskLevel as keyof typeof RISK_COLORS_DIM] || 'transparent',
                          color: RISK_COLORS[ep.riskLevel as keyof typeof RISK_COLORS] || 'var(--muted)',
                          borderRadius: 99, padding: '3px 8px', fontSize: 10, fontWeight: 700,
                        }}>{ep.riskLevel.toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Adherence + Enroll summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Medication Adherence</div>
                <div style={{
                  fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)',
                  color: avgAdherence != null ? (avgAdherence >= 80 ? '#38a169' : avgAdherence >= 60 ? '#d69e2e' : '#e53e3e') : 'var(--muted)',
                }}>{avgAdherence != null ? `${avgAdherence}%` : '—'}</div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  {avgAdherence != null && <div style={{ height: '100%', width: `${avgAdherence}%`, background: avgAdherence >= 80 ? '#38a169' : avgAdherence >= 60 ? '#d69e2e' : '#e53e3e', borderRadius: 2 }} />}
                </div>
              </div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Enrollment Summary</div>
                {[
                  { label: 'Active Pathways', val: activeEnrollments.length },
                  { label: 'Completed', val: completedEnrollments.length },
                  { label: 'Paused', val: pausedEnrollments.length },
                  { label: 'Risk Level', val: enrollments.reduce((a, e) => e.riskLevel === 'high' || e.riskLevel === 'critical' ? 'HIGH' : a, 'LOW') },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                    <span style={{ fontWeight: 700 }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick message */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                🔔 Send Message to {enrollments[0]?.patientName?.split(' ')[0] || 'Patient'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={alertMsg} onChange={e => setAlertMsg(e.target.value)}
                  placeholder="Type a message…"
                  style={{ flex: 1, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}
                  onKeyDown={e => e.key === 'Enter' && sendAlert()}
                />
                <button onClick={sendAlert} disabled={sendingAlert || !alertMsg.trim()} style={{
                  background: currentPathway.color, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>{sendingAlert ? '…' : 'Send'}</button>
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                Patient receives via app notification. Recent alerts: {unreadAlerts} unread
              </div>
            </div>
          </div>
        )}

        {/* ═══ PATHWAYS ═══ */}
        {activeTab === 'pathways' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '100%' }}>
            {enrollments.map(ep => {
              const pw = allPathways.find(p => p.id === ep.pathwayId);
              if (!pw) return null;
              const progress = Math.round(((ep.currentMilestone + 1) / pw.milestones.length) * 100);
              return (
                <div key={ep.id} style={{
                  background: 'var(--white)', border: `1px solid ${pw.color}30`,
                  borderRadius: 14, padding: 16,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{pw.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: pw.color }}>{pw.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{pw.category} · {pw.duration}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{
                        background: ep.status === 'active' ? 'rgba(56,161,105,.1)' : ep.status === 'paused' ? 'rgba(214,158,46,.1)' : 'rgba(100,116,139,.1)',
                        color: ep.status === 'active' ? '#38a169' : ep.status === 'paused' ? '#d69e2e' : '#64748b',
                        borderRadius: 99, padding: '2px 10px', fontSize: 10, fontWeight: 700,
                      }}>{ep.status}</span>
                      {ep.riskLevel && (
                        <span style={{
                          background: RISK_COLORS_DIM[ep.riskLevel as keyof typeof RISK_COLORS_DIM],
                          color: RISK_COLORS[ep.riskLevel as keyof typeof RISK_COLORS],
                          borderRadius: 99, padding: '2px 10px', fontSize: 10, fontWeight: 700,
                        }}>{ep.riskLevel.toUpperCase()}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                      Milestone {ep.currentMilestone + 1} of {pw.milestones.length} · {progress}% complete
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: pw.color, borderRadius: 99 }} />
                    </div>
                    {pw.milestones.map((ms, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
                        opacity: i > ep.currentMilestone ? 0.4 : 1,
                      }}>
                        <button onClick={() => updateMilestone(ep.id, i)} style={{
                          width: 26, height: 26, borderRadius: '50%', border: 'none',
                          background: i <= ep.currentMilestone ? pw.color : 'var(--border)',
                          color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {i < ep.currentMilestone ? '✓' : i + 1}
                        </button>
                        <div style={{ fontSize: 13, fontWeight: i === ep.currentMilestone ? 700 : 400, color: i === ep.currentMilestone ? pw.color : 'var(--text)' }}>
                          {ms}
                        </div>
                        {i === ep.currentMilestone && (
                          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: pw.colorDim, color: pw.color, borderRadius: 99, padding: '2px 8px' }}>CURRENT</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Started: {fmtDate(ep.startDate)}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Last review: {fmtDate(ep.lastReview)}</span>
                    {ep.docketName && <><span style={{ fontSize: 11, color: 'var(--muted)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Docket: {ep.docketName}</span></>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ MONITORING ═══ */}
        {activeTab === 'monitoring' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '100%' }}>
            {allUniqueMetrics.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 24 }}>No monitoring metrics defined.</div>
            ) : allUniqueMetrics.map(m => {
              const readings = vitals.filter(v => v.type === m.key);
              return (
                <div key={m.key} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.icon} {m.label}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Target: {m.normalRange}</span>
                      <span style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 99, padding: '2px 8px', color: 'var(--muted)', fontWeight: 700 }}>{m.frequency}</span>
                    </div>
                  </div>
                  {readings.length === 0 ? (
                    <div style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>No readings recorded yet.</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48, marginBottom: 10 }}>
                        {readings.slice(0, 14).reverse().map((r, i) => {
                          const val = m.key === 'bp' ? r.systolic || 0 : parseFloat(r.value) || 0;
                          const max = m.key === 'bp' ? 180 : 20;
                          const pct = Math.min((val / max) * 100, 100);
                          const color = m.key === 'bp' && r.systolic && r.diastolic
                            ? bpCategory(r.systolic, r.diastolic).color : currentPathway.color;
                          return (
                            <div key={r.id} title={`${fmtDateTime(r.recordedAt)}: ${m.key === 'bp' ? (r.systolic != null && r.diastolic != null ? `${r.systolic}/${r.diastolic}` : '—/—') : r.value || '—'} ${m.unit}`} style={{
                              flex: 1, borderRadius: '3px 3px 0 0', minWidth: 5,
                              height: `${Math.max(pct, 6)}%`, background: color,
                              opacity: 0.5 + (i / readings.length) * 0.5,
                            }} />
                          );
                        })}
                      </div>
                      {readings.slice(0, 5).map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg)', borderRadius: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{fmtDate(r.recordedAt)} {fmtTime(r.recordedAt)}</span>
                          <span style={{
                            fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14,
                            color: m.key === 'bp' && r.systolic && r.diastolic ? bpCategory(r.systolic, r.diastolic).color : 'var(--text)',
                          }}>
                            {m.key === 'bp' ? (r.systolic != null && r.diastolic != null ? `${r.systolic}/${r.diastolic}` : '—/—') : r.value || '—'} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>{m.unit}</span>
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ NOTES ═══ */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '100%' }}>
            <div style={{ display: 'flex', gap: 6, background: 'var(--white)', borderRadius: 99, padding: 3, alignSelf: 'flex-start', border: '1px solid var(--border)' }}>
              <button onClick={() => setNoteView('quick')} style={{
                padding: '6px 14px', borderRadius: 99, border: 'none',
                background: noteView === 'quick' ? currentPathway.color : 'transparent',
                color: noteView === 'quick' ? '#fff' : 'var(--muted)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>📝 Quick Note</button>
              <button onClick={() => setNoteView('full')} style={{
                padding: '6px 14px', borderRadius: 99, border: 'none',
                background: noteView === 'full' ? currentPathway.color : 'transparent',
                color: noteView === 'full' ? '#fff' : 'var(--muted)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>🩺 Full Clinical Exam</button>
            </div>

            {noteView === 'full' ? (
              <div style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <HistoryExaminationEngine
                  patient={{ uid: patientId, name: enrollments[0]?.patientName, age: patientInfo?.age, gender: patientInfo?.gender }}
                  doctorId={doctorId}
                  doctorName={doctorName}
                  onSave={() => {}}
                  onClinicalDataUpdate={() => {}}
                />
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>New Clinical Note</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {['clerking', 'progress', 'clinic_review', 'procedure', 'discharge'].map(type => (
                      <button key={type} onClick={() => setNewNote(n => ({ ...n, type }))} style={{
                        padding: '5px 12px', borderRadius: 99, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font)',
                        background: newNote.type === type ? currentPathway.color : 'var(--bg)',
                        color: newNote.type === type ? '#fff' : 'var(--muted)',
                        border: 'none',
                      }}>{type.replace('_', ' ')}</button>
                    ))}
                  </div>
                  {pathwayOptions.length > 1 && (
                    <select value={newNote.pathwayId} onChange={e => setNewNote(n => ({ ...n, pathwayId: e.target.value }))} style={{
                      width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)',
                      borderRadius: 8, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font)', color: 'var(--text)', marginBottom: 10,
                    }}>
                      <option value="">Associate with pathway…</option>
                      {pathwayOptions.map(pw => (
                        <option key={pw.id} value={pw.id}>{pw.icon} {pw.label}</option>
                      ))}
                    </select>
                  )}
                  <textarea value={newNote.content} onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
                    rows={5} placeholder="Document your clinical findings, assessment, and plan…"
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', resize: 'vertical' }}
                  />
                  <button onClick={saveNote} disabled={savingNote || !newNote.content.trim()} style={{
                    marginTop: 10, background: currentPathway.color, color: '#fff', border: 'none',
                    borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>{savingNote ? 'Saving…' : '💾 Save Note'}</button>
                </div>

                {notes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>No clinical notes yet.</div>
                ) : notes.map(n => (
                  <div key={n.id} style={{ background: 'var(--white)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ background: currentPathway.colorDim, color: currentPathway.color, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                        {(n.type || 'progress').replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        {n.doctorName || 'Dr.'} · {fmtDateTime(n.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {typeof n.content === 'string' ? n.content : JSON.stringify(n.content, null, 2)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ LABS ═══ */}
        {activeTab === 'labs' && (
          <DiagnosticCommandCenter
            patientId={patientId}
            doctorId={doctorId}
            doctorName={doctorName}
            patientInfo={patientInfo}
            enrollments={enrollments}
            allPathways={allPathways}
            vitals={vitals}
          />
        )}

        {/* ═══ PRESCRIPTIONS ═══ */}
        {activeTab === 'prescriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>💊 Prescriptions</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{allPrescriptions.length} total prescription{allPrescriptions.length !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--green)' }}>{allPrescriptions.length}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{new Set(allPrescriptions.map((r: any) => r.medication || r.medicationName)).size}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Unique</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>{new Set(allPrescriptions.map((r: any) => r.doctorId || r.prescriberId)).size}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Prescribers</div>
                </div>
              </div>
            </div>

            {allPrescriptions.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No prescriptions yet</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Prescriptions will appear once ordered.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                {allPrescriptions.map((rx: any, i: number) => {
                  const rxDate = rx.createdAt?.toDate
                    ? rx.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : rx.date || '';
                  return (
                    <div key={rx.id || i} style={{
                      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12,
                      padding: 14, display: 'flex', flexDirection: 'column', gap: 8, transition: 'all 0.15s',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{rx.medication || rx.medicationName}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,214,143,.12)', color: 'var(--green)', textTransform: 'uppercase' }}>Active</span>
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>{rxDate}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {rx.dosage && <span style={{ fontSize: 10.5, color: 'var(--text2)', background: 'var(--surface2)', padding: '3px 9px', borderRadius: 6, fontWeight: 500 }}>💉 {rx.dosage}</span>}
                        {rx.frequency && <span style={{ fontSize: 10.5, color: 'var(--text2)', background: 'var(--surface2)', padding: '3px 9px', borderRadius: 6, fontWeight: 500 }}>🕐 {rx.frequency}</span>}
                        {rx.duration && <span style={{ fontSize: 10.5, color: 'var(--text2)', background: 'var(--surface2)', padding: '3px 9px', borderRadius: 6, fontWeight: 500 }}>📆 {rx.duration}</span>}
                        {rx.route && <span style={{ fontSize: 10.5, color: 'var(--text2)', background: 'var(--surface2)', padding: '3px 9px', borderRadius: 6, fontWeight: 500 }}>🩸 {rx.route}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
                        <span style={{ fontSize: 11, color: 'var(--accent3)', fontWeight: 600 }}>Dr. {rx.doctorName || rx.prescriberName || 'Unknown'}</span>
                        {rx.condition && <span style={{ fontSize: 10, color: 'var(--muted)' }}>For: {rx.condition}</span>}
                      </div>
                      {rx.notes && <div style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 2 }}>📝 {rx.notes}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ ADHERENCE ═══ */}
        {activeTab === 'adherence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Average Adherence', val: avgAdherence != null ? `${avgAdherence}%` : '—', color: avgAdherence != null ? (avgAdherence >= 80 ? '#38a169' : '#e53e3e') : 'var(--muted)' },
                { label: 'Records', val: adherence.length, color: 'var(--text)' },
                { label: 'Last Recorded', val: adherence[0] ? fmtDate(adherence[0].recordedAt) : '—', color: 'var(--text)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--mono)', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {adherence.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>No adherence records.</div>
            ) : adherence.map(a => (
              <div key={a.id} style={{ background: 'var(--white)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.period}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(a.recordedAt)}</div>
                  {a.notes && <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>{a.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${a.score}%`, background: a.score >= 80 ? '#38a169' : a.score >= 60 ? '#d69e2e' : '#e53e3e', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 900, fontFamily: 'var(--mono)', color: a.score >= 80 ? '#38a169' : '#e53e3e' }}>{a.score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ REFERRALS ═══ */}
        {activeTab === 'referrals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>🔗 Referrals</div>
              <button onClick={() => setShowReferralForm(true)} style={{
                background: currentPathway.color, color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>➕ New Referral</button>
            </div>

            {showReferralForm && (
              <div style={{
                background: 'var(--white)', border: `2px solid ${currentPathway.color}50`, borderRadius: 14,
                padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Create Referral</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Specialty *</div>
                    <select value={referralData.specialty} onChange={e => setReferralData(p => ({ ...p, specialty: e.target.value }))} style={{
                      padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%',
                      background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                    }}>
                      <option value="">Select specialty</option>
                      {['Cardiology', 'Endocrinology', 'Gastroenterology', 'Neurology', 'Nephrology', 'Orthopaedics', 'Ophthalmology', 'ENT', 'Dermatology', 'Psychiatry', 'Urology', 'Paediatrics', 'OB/GYN', 'Pulmonology', 'Rheumatology', 'Oncology', 'Infectious Disease', 'General Surgery', 'Physiotherapy'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Facility</div>
                    <input value={referralData.facility} onChange={e => setReferralData(p => ({ ...p, facility: e.target.value }))} placeholder="e.g., Kenyatta NH, private clinic" style={{
                      padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%',
                      background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Reason for Referral</div>
                  <textarea value={referralData.reason} onChange={e => setReferralData(p => ({ ...p, reason: e.target.value }))} placeholder="Brief clinical reason for the referral..." rows={2} style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%',
                    background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Additional Notes</div>
                  <textarea value={referralData.notes} onChange={e => setReferralData(p => ({ ...p, notes: e.target.value }))} placeholder="Any additional instructions..." rows={2} style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%',
                    background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowReferralForm(false)} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>Cancel</button>
                  <button onClick={createReferral} disabled={!referralData.specialty.trim()} style={{
                    background: currentPathway.color, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', opacity: referralData.specialty.trim() ? 1 : 0.5,
                  }}>Submit Referral</button>
                </div>
              </div>
            )}

            {referrals.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--muted)', padding: '24px 0', textAlign: 'center' }}>
                No referrals yet. Click "New Referral" to refer this patient to a specialist.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                {referrals.map(r => {
                  const rDate = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '';
                  return (
                    <div key={r.id} style={{
                      background: 'var(--white)', border: `1px solid ${r.status === 'completed' ? '#38a169' : r.status === 'cancelled' ? '#e53e3e' : 'var(--border)'}30`,
                      borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: currentPathway.color }}>🩺 {r.specialty}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: r.status === 'completed' ? '#f0fdf4' : r.status === 'cancelled' ? '#fef2f2' : '#fefce8',
                          color: r.status === 'completed' ? '#16a34a' : r.status === 'cancelled' ? '#dc2626' : '#ca8a04',
                        }}>{r.status}</span>
                      </div>
                      {r.facility && <div style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {r.facility}</div>}
                      {r.reason && <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text)' }}>"{r.reason}"</div>}
                      {r.notes && <div style={{ fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 6 }}>📝 {r.notes}</div>}
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{rDate}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ TIMELINE ═══ */}
        {activeTab === 'timeline' && (
          <div style={{ maxWidth: '100%' }}>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>No timeline events yet.</div>
            ) : timeline.map((ev, i) => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, background: currentPathway.colorDim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                  }}>{ev.icon || '📋'}</div>
                  {i < timeline.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4, minHeight: 16 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{ev.title}</div>
                  {ev.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{typeof ev.description === 'string' ? ev.description : JSON.stringify(ev.description)}</div>}
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 3 }}>{fmtDateTime(ev.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ EDUCATION ═══ */}
        {activeTab === 'education' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: '100%' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              Click any topic to preview content before sending. Patient receives notification with full content.
            </div>
            {allEducationTopics.map(topic => {
              const sent = sentTopics.includes(topic);
              const topicPathway = allPathways.find(p => p.educationTopics.includes(topic));
              const pwColor = topicPathway?.color || currentPathway.color;
              const pwColorDim = topicPathway?.colorDim || currentPathway.colorDim;
              let matchedArticles = searchArticles(topic);
              if (matchedArticles.length === 0) {
                matchedArticles = getArticlesByCondition(topicPathway?.id || currentPathway.id);
              }
              const previewArticle = matchedArticles[0];
              const showPreview = previewTopic === topic;
              return (
                <div key={topic} style={{
                  borderRadius: 12, border: `1px solid ${showPreview ? pwColor : sent ? pwColor + '40' : 'var(--border)'}`,
                  overflow: 'hidden', background: sent && !showPreview ? pwColorDim : 'var(--white)',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '13px 16px', cursor: 'pointer',
                  }}
                    onClick={() => setPreviewTopic(showPreview ? null : topic)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: sent && !showPreview ? pwColor : 'var(--text)' }}>
                        {topicPathway?.icon} {topic}
                      </div>
                      {sent && <div style={{ fontSize: 11, color: pwColor, marginTop: 2 }}>✓ Previously sent to patient</div>}
                      {showPreview && <div style={{ fontSize: 11, color: pwColor, marginTop: 2 }}>▼ Previewing content</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {showPreview && (
                        <button onClick={e => { e.stopPropagation(); sendEducation(topic); }} disabled={sendingEdu === topic} style={{
                          background: pwColor, color: '#fff', border: 'none', borderRadius: 8,
                          padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                        }}>{sendingEdu === topic ? '…' : sent ? '↺ Resend' : '📤 Send to Patient'}</button>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--muted)', transform: showPreview ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                  </div>
                  {showPreview && previewArticle && (
                    <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${pwColor}30`, paddingTop: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                        {previewArticle.icon} {previewArticle.category} · {previewArticle.readTimeMinutes} min read · {previewArticle.literacyLevel} level
                      </div>
                      <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                        <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                          {previewArticle.content.split('\n').map((line: string, i: number) => {
                            if (line.trim() === '') return <div key={i} style={{ height: 4 }} />;
                            if (line.startsWith('WHAT') || line.startsWith('WHY') || line.startsWith('HOW') || line.startsWith('THE ') || line.startsWith('TARGET') || line.startsWith('SAMPLE') || line.startsWith('START') || line.startsWith('CREATE') || line.startsWith('WIND') || line.startsWith('DO NOT') || line.startsWith('GO TO') || line.startsWith('KNOW') || line.startsWith('KEEP') || line.startsWith('BEFORE') || line.startsWith('DURING') || line.startsWith('CORRECT') || line.startsWith('COMMON') || line.startsWith('TIPS') || line.startsWith('WARNING') || line.startsWith('YOUR') || line.startsWith('EAT') || line.startsWith('REDUCE') || line.startsWith('COOK') || line.startsWith('FOOD') || line.startsWith('SLEEP') || line.startsWith('IF YOU') || line.startsWith('MORNING') || line.startsWith('AFTER') || line.startsWith('HOW MUCH') || line.startsWith('HOW OFTEN') || line.startsWith('QUICK') || line.startsWith('HOW LONG') || line.startsWith('WHEN TO') || line.startsWith('ATTEND') || line.startsWith('VACCINATION') || line.startsWith('NUTRITION') || line.startsWith('DISCLOSURE') || line.startsWith('TREATMENT') || line.startsWith('HIV IS NOT') || line.startsWith('STAGES') || line.startsWith('DIET') || line.startsWith('MEDICATIONS') || line.startsWith('SUPPORTING') || line.startsWith('CRISIS') || line.startsWith('THE 5') || line.startsWith('MISSED') || line.startsWith('STORING') || line.startsWith('WITHDRAWAL') || line.startsWith('CRAVINGS') || line.startsWith('SUPPORT') || line.startsWith('METHOD') || line.startsWith('HEALTH') || line.startsWith('THE BASICS') || line.startsWith('SMART') || line.startsWith('WATER')) {
                              return <div key={i} style={{ fontWeight: 700, fontSize: 13, marginTop: 10, marginBottom: 4, color: pwColor }}>{line}</div>;
                            }
                            if (line.startsWith('•') || line.startsWith('-')) {
                              return <div key={i} style={{ paddingLeft: 14, marginBottom: 1, fontSize: 12 }}>{line}</div>;
                            }
                            if (line.startsWith('✓') || line.startsWith('☐')) {
                              return <div key={i} style={{ paddingLeft: 14, marginBottom: 1, fontSize: 12, color: '#10b981' }}>{line}</div>;
                            }
                            if (line.startsWith('✗')) {
                              return <div key={i} style={{ paddingLeft: 14, marginBottom: 1, fontSize: 12, color: '#ef4444' }}>{line}</div>;
                            }
                            return <div key={i} style={{ marginBottom: 1, fontSize: 12 }}>{line}</div>;
                          })}
                        </div>
                      </div>
                      {previewArticle.keyPoints.length > 0 && (
                        <div style={{ marginTop: 10, padding: 10, background: '#f0fdf4', borderRadius: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#166534', marginBottom: 6 }}>✅ KEY TAKEAWAYS</div>
                          {previewArticle.keyPoints.map((kp: string, i: number) => (
                            <div key={i} style={{ fontSize: 11, color: '#166534', marginBottom: 2, display: 'flex', gap: 4 }}>
                              <span>•</span><span>{kp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {showPreview && !previewArticle && (
                    <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${pwColor}30`, paddingTop: 12 }}>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Preview not available for this topic. Send to share with patient.</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── divider ── */}
            <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />

            {/* ═══ PATIENT QUESTIONS ═══ */}
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>❓ Patient Questions</div>
            {questions.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--muted)', padding: '12px 0' }}>No questions from patient yet.</div>
            ) : questions.map(q => {
              const qDate = q.askedAt?.toDate ? q.askedAt.toDate().toLocaleDateString() : '';
              return (
                <div key={q.id} style={{ borderRadius: 12, border: `1px solid ${q.answer ? '#38a169' : 'var(--border)'}`, overflow: 'hidden', background: 'var(--white)' }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>📝 {q.resourceTitle}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{qDate}</span>
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.5, background: '#f0fdf4', padding: 10, borderRadius: 8, color: 'var(--text)' }}>
                      "{q.question}"
                    </div>
                    {q.answer && (
                      <div style={{ marginTop: 8, padding: 10, background: '#eff6ff', borderRadius: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>✓ Answered by {q.answeredBy}</div>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>{q.answer}</div>
                      </div>
                    )}
                  </div>
                  {!q.answer && (
                    <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: '1px solid var(--border)' }}>
                      <input value={answerText[q.id] || ''} onChange={e => setAnswerText(prev => ({ ...prev, [q.id!]: e.target.value }))}
                        placeholder="Type your answer..." style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, outline: 'none' }} />
                      <button onClick={() => handleAnswerQuestion(q)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Answer</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── divider ── */}
            <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />

            {/* ═══ PATIENT STORIES ═══ */}
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>💬 Patient Journey Stories</div>
            {stories.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--muted)', padding: '12px 0' }}>No stories shared by patient yet.</div>
            ) : stories.map(s => {
              const sDate = s.sharedAt?.toDate ? s.sharedAt.toDate().toLocaleDateString() : '';
              return (
                <div key={s.id} style={{ borderRadius: 12, border: `1px solid ${s.doctorResponse ? '#7c3aed' : 'var(--border)'}`, overflow: 'hidden', background: 'var(--white)' }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{sDate}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.5, fontStyle: 'italic', color: 'var(--text)' }}>
                      "{s.story}"
                    </div>
                    {s.doctorResponse && (
                      <div style={{ marginTop: 8, padding: 10, background: '#f5f3ff', borderRadius: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#6d28d9', marginBottom: 4 }}>💬 Your Response</div>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>{s.doctorResponse}</div>
                      </div>
                    )}
                  </div>
                  {!s.doctorResponse && (
                    <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: '1px solid var(--border)' }}>
                      <input value={responseText[s.id] || ''} onChange={e => setResponseText(prev => ({ ...prev, [s.id!]: e.target.value }))}
                        placeholder="Respond to patient's story..." style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, outline: 'none' }} />
                      <button onClick={() => handleRespondStory(s)} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Respond</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── divider ── */}
            <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />

            {/* ═══ EDUCATION JOURNEY ═══ */}
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>📖 Education Journey</div>
            {(() => {
              const journeyItems = [
                ...questions.filter(q => q.answer).map(q => ({
                  date: q.answeredAt,
                  icon: '✍️',
                  title: `Answered: ${q.resourceTitle}`,
                  detail: q.answer,
                })),
                ...stories.filter(s => s.doctorResponse).map(s => ({
                  date: s.respondedAt,
                  icon: '💬',
                  title: 'Responded to story',
                  detail: s.doctorResponse,
                })),
              ].sort((a, b) => {
                const ta = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date || 0).getTime();
                const tb = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date || 0).getTime();
                return tb - ta;
              });
              return journeyItems.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--muted)', padding: '12px 0' }}>No education interactions yet. Send content to the patient to start the journey.</div>
              ) : journeyItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{item.title}</div>
                    {item.detail && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.detail}</div>}
                    <div style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 2 }}>
                      {item.date?.toDate ? item.date.toDate().toLocaleDateString() : ''}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* ═══ TOOLS ═══ */}
        {activeTab === 'tools' && (
          <div style={{ maxWidth: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {allUniqueTools.map(t => (
                <div key={t.id} style={{
                  background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 14,
                  padding: 16, cursor: 'pointer', transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = currentPathway.color; e.currentTarget.style.background = currentPathway.colorDim; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
                  onClick={() => { if (t.type === 'order') orderLab(t.label.replace('Order ', '').replace('Request ', '').replace('Refer ', '')); }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{t.description}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, background: 'var(--bg)',
                      color: 'var(--muted)', borderRadius: 99, padding: '2px 8px',
                      textTransform: 'uppercase',
                    }}>{t.type}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, background: `${currentPathway.color}12`,
                      color: currentPathway.color, borderRadius: 99, padding: '2px 8px',
                    }}>{t.opensIn || 'panel'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ DOCTOR ACTION HISTORY ═══ */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '100%' }}>
            {/* Send message to patient */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>📨 Send Message to Patient</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={alertMsg} onChange={e => setAlertMsg(e.target.value)}
                  placeholder="Type a message to send to your patient…"
                  style={{ flex: 1, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)' }}
                  onKeyDown={e => e.key === 'Enter' && sendAlert()}
                />
                <button onClick={sendAlert} disabled={sendingAlert || !alertMsg.trim()} style={{
                  background: currentPathway.color, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>{sendingAlert ? '…' : 'Send'}</button>
              </div>
            </div>

            {/* Your Action History */}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', padding: '0 4px' }}>
              📋 Your Action History · {alerts.length} actions
            </div>

            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>
                No actions recorded yet. Actions will appear here as you care for this patient.
              </div>
            ) : alerts.map((a: any) => {
              const actionIcon = {
                message: '💬',
                education: '📚',
                prescription: '💊',
                lab: '🔬',
                referral: '📋',
                notification: '🔔',
              }[a._actionType] || '📌';

              const actionColor = {
                message: '#3b82f6',
                education: '#10b981',
                prescription: '#8b5cf6',
                lab: '#f59e0b',
                referral: '#d69e2e',
                notification: '#6366f1',
              }[a._actionType] || '#64748b';

              const actionLabel = {
                message: 'Sent Message',
                education: 'Sent Education',
                prescription: 'Prescribed',
                lab: 'Ordered Lab',
                referral: 'Created Referral',
                notification: 'Sent Notification',
              }[a._actionType] || 'Action';

              const actionDetail = a._actionType === 'message' ? a.message :
                a._actionType === 'education' ? (a.topic || a.resourceTitle || a.title) :
                a._actionType === 'prescription' ? `${a.medication || ''} ${a.dosage || ''} ${a.frequency || ''}` :
                a._actionType === 'lab' ? (a.testName || a.title) :
                a._actionType === 'referral' ? (a.specialty || a.reason || a.title) :
                a.message || a.title || '';

              const actionTime = a.createdAt || a.sentAt || a.orderedAt || null;

              return (
                <div key={a.id} style={{
                  background: 'var(--white)', borderRadius: 12, padding: 14,
                  border: '1px solid var(--border)', borderLeft: `3px solid ${actionColor}`,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: actionColor + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {actionIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                        {actionLabel}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                        {fmtDateTime(actionTime)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginTop: 2 }}>
                      {actionDetail}
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, background: actionColor + '15',
                        color: actionColor, borderRadius: 99, padding: '2px 8px',
                        textTransform: 'capitalize',
                      }}>{a._actionType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order Form Modal ── */}
      {showOrderForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }} onClick={() => setShowOrderForm(false)}>
          <div style={{
            background: 'var(--white)', borderRadius: 16, padding: 24, maxWidth: 560, width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', gap: 12,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{orderType === 'lab' ? '🧪 Order Lab Tests' : '🩻 Order Imaging Study'}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--bg)', borderRadius: 99, padding: '2px 8px' }}>
                Workspace: {INVESTIGATION_WORKSPACES.find(w => w.id === invWorkspace)?.label || 'General'}
              </div>
            </div>

            {/* Test selection row - pre-selected from workspace click */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>{orderType === 'lab' ? 'Test(s) / Panel' : 'Study'} *</div>
              <input value={orderTest} onChange={e => setOrderTest(e.target.value)}
                placeholder={orderType === 'lab' ? "e.g., FBC, Creatinine, HbA1c, Lipid Profile" : "e.g., Chest X-ray PA, CT Abdomen"}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)' }} />
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Separate multiple tests with commas</div>
            </div>

            {/* Two column layout for clinical context */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Clinical Indication *</div>
                <textarea value={orderClinicalIndication} onChange={e => setOrderClinicalIndication(e.target.value)}
                  placeholder="Why is this being ordered?" rows={2} style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Clinical Question</div>
                <textarea value={orderClinicalQuestion} onChange={e => setOrderClinicalQuestion(e.target.value)}
                  placeholder="What specific question are we answering?" rows={2} style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Differential Diagnosis</div>
                <input value={orderDifferential} onChange={e => setOrderDifferential(e.target.value)}
                  placeholder="e.g., Rule out PE vs pneumonia" style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Provisional Diagnosis</div>
                <input value={orderProvisionalDiagnosis} onChange={e => setOrderProvisionalDiagnosis(e.target.value)}
                  placeholder="e.g., Community-acquired pneumonia" style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)' }} />
              </div>
            </div>

            {/* Specimen / Body site + Urgency row */}
            <div style={{ display: 'grid', gridTemplateColumns: orderType === 'lab' ? '1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 10 }}>
              {orderType === 'lab' ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Specimen Type</div>
                  <select value={orderSpecimenType} onChange={e => setOrderSpecimenType(e.target.value)} style={{
                    padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)',
                  }}>
                    {['Blood', 'Serum', 'Plasma', 'Urine', 'Stool', 'Sputum', 'CSF', 'Pleural Fluid', 'Ascitic Fluid', 'Semen', 'Throat Swab', 'Wound Swab', 'Tissue Biopsy'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Body Site</div>
                  <input value={orderBodySite} onChange={e => setOrderBodySite(e.target.value)}
                    placeholder="e.g., Chest, Abdomen, Head" style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)' }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Urgency</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { value: 'routine', label: 'Routine', color: '#059669' },
                    { value: 'urgent', label: 'Urgent', color: '#f97316' },
                    { value: 'stat', label: 'STAT', color: '#dc2626' },
                  ].map(u => (
                    <button key={u.value} onClick={() => setOrderUrgency(u.value)} style={{
                      flex: 1, padding: '6px 4px', border: `2px solid ${orderUrgency === u.value ? u.color : 'var(--border)'}`,
                      borderRadius: 6, background: orderUrgency === u.value ? `${u.color}10` : 'transparent',
                      fontSize: 10, fontWeight: orderUrgency === u.value ? 700 : 500, cursor: 'pointer',
                      color: orderUrgency === u.value ? u.color : 'var(--muted)', fontFamily: 'var(--font)',
                    }}>{u.label}</button>
                  ))}
                </div>
              </div>
              {orderType === 'lab' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', cursor: 'pointer', paddingTop: 18 }}>
                  <input type="checkbox" checked={orderFastingRequired} onChange={e => setOrderFastingRequired(e.target.checked)} style={{ accentColor: currentPathway.color }} />
                  Fasting required
                </label>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', cursor: 'pointer', paddingTop: 18 }}>
                  <input type="checkbox" checked={orderContrastRequired} onChange={e => setOrderContrastRequired(e.target.checked)} style={{ accentColor: currentPathway.color }} />
                  Contrast required
                </label>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Additional Notes (for lab/radiologist)</div>
              <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                placeholder="Any special handling, clinical notes, or instructions for the performing facility..." rows={2} style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, width: '100%', background: 'var(--bg)', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <button onClick={() => setShowOrderForm(false)} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              }}>Cancel</button>
              <button onClick={submitStructuredOrder} disabled={!orderTest.trim()} style={{
                background: orderType === 'lab' ? currentPathway.color : '#7c3aed', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font)', opacity: orderTest.trim() ? 1 : 0.5,
              }}>🧾 Place Order & Print Form</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Interpretation Workspace Modal ── */}
      {interpretOrder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }} onClick={() => setInterpretOrder(null)}>
          <div style={{
            background: 'var(--white)', borderRadius: 16, maxWidth: 960, width: '100%',
            maxHeight: '92vh', overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0,0,0,.3)', display: 'flex', flexDirection: 'column',
          }} onClick={e => e.stopPropagation()}>
            {/* ── Header ── */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                ✍️ Interpret: {interpretOrder._type === 'imaging' ? '🩻' : '🧪'} {(interpretOrder.tests || []).join(', ')}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>— ordered {fmtDate(interpretOrder.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {(interpretOrder.uploadUrl || interpretOrder.fileUrl) && (
                  <a href={interpretOrder.uploadUrl || interpretOrder.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, color: '#2563eb', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>📎 View Uploaded File</a>
                )}
                {interpretOrder.structuredResults?.length > 0 && (
                  <span style={{ fontSize: 10, color: '#16a34a', background: '#f0fdf4', borderRadius: 99, padding: '2px 8px' }}>
                    {interpretOrder.structuredResults.length} existing results
                  </span>
                )}
              </div>
            </div>

            {/* ── Three-panel layout ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 400 }}>
              {/* LEFT PANEL - Patient Context */}
              <div style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--border)', padding: 14, overflowY: 'auto', background: '#f8fafc' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Patient Context</div>
                {patientInfo && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{patientInfo.name || patientInfo.displayName || 'Patient'}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>ID: {patientId}</div>
                    {patientInfo.age && <div style={{ fontSize: 10, color: 'var(--muted)' }}>Age: {patientInfo.age} · {patientInfo.gender || '—'}</div>}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>Active Diagnoses</div>
                    {enrollments.map(e => {
                      const pw = allPathways.find(p => p.id === e.pathwayId);
                      return pw ? <div key={e.id} style={{ fontSize: 10, padding: '3px 6px', background: `${pw.color}10`, borderRadius: 4, color: pw.color }}>{pw.icon} {pw.label}</div> : null;
                    })}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>Recent Vitals</div>
                    {vitals.slice(0, 4).map(v => (
                      <div key={v.id} style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)' }}>{v.type}</span>
                        <span style={{ fontWeight: 600 }}>{v.value} {v.unit}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>Order Details</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>Doctor: {interpretOrder.doctorName || doctorName}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>Urgency: <span style={{ fontWeight: 700, color: interpretOrder.urgency === 'stat' ? '#dc2626' : interpretOrder.urgency === 'urgent' ? '#f97316' : 'var(--muted)' }}>{(interpretOrder.urgency || 'routine').toUpperCase()}</span></div>
                    {interpretOrder.specimenType && <div style={{ fontSize: 10, color: 'var(--muted)' }}>Specimen: {interpretOrder.specimenType}</div>}
                    {interpretOrder.bodySite && <div style={{ fontSize: 10, color: 'var(--muted)' }}>Site: {interpretOrder.bodySite}</div>}
                    {interpretOrder.fastingRequired && <div style={{ fontSize: 10, color: '#f97316', fontWeight: 600 }}>⚠ Fasting required</div>}
                    {interpretOrder.contrastRequired && <div style={{ fontSize: 10, color: '#f97316', fontWeight: 600 }}>⚠ Contrast required</div>}
                  </div>
                )}
              </div>

              {/* CENTER PANEL - Results / File Viewer */}
              <div style={{ flex: 1, padding: 14, overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Results</div>

                {interpretOrder.clinicalIndication && (
                  <div style={{ marginBottom: 10, padding: '8px 10px', background: '#fefce8', borderRadius: 6, fontSize: 11, borderLeft: '3px solid #ca8a04' }}>
                    <span style={{ fontWeight: 600 }}>Indication:</span> {interpretOrder.clinicalIndication}
                  </div>
                )}

                {interpretOrder.provisionalDiagnosis && (
                  <div style={{ marginBottom: 10, padding: '8px 10px', background: '#eff6ff', borderRadius: 6, fontSize: 11, borderLeft: '3px solid #2563eb' }}>
                    <span style={{ fontWeight: 600 }}>Provisional Dx:</span> {interpretOrder.provisionalDiagnosis}
                  </div>
                )}

                {interpretOrder.differential && (
                  <div style={{ marginBottom: 10, padding: '8px 10px', background: '#f0fdf4', borderRadius: 6, fontSize: 11, borderLeft: '3px solid #16a34a' }}>
                    <span style={{ fontWeight: 600 }}>Differential:</span> {interpretOrder.differential}
                  </div>
                )}

                {(interpretOrder.uploadUrl || interpretOrder.fileUrl) && (
                  <div style={{ marginBottom: 12, background: '#f8fafc', borderRadius: 8, padding: 10, textAlign: 'center', border: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>File Preview</div>
                    {interpretOrder.uploadUrl?.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i) || interpretOrder.fileUrl?.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i) ? (
                      <img src={interpretOrder.uploadUrl || interpretOrder.fileUrl} alt="Uploaded result" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 6, objectFit: 'contain' }} />
                    ) : (
                      <a href={interpretOrder.uploadUrl || interpretOrder.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-block', padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}>📄 Open Document</a>
                    )}
                  </div>
                )}

                {interpretOrder.results && !interpretOrder.structuredResults?.length && (
                  <div style={{ marginBottom: 10, background: '#f8fafc', borderRadius: 8, padding: '8px 12px', fontSize: 11, whiteSpace: 'pre-wrap' }}>{typeof interpretOrder.results === 'string' ? interpretOrder.results : JSON.stringify(interpretOrder.results, null, 2)}</div>
                )}

                {/* Existing structured results display */}
                {interpretOrder.structuredResults?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Previously entered results:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 4 }}>
                      {interpretOrder.structuredResults.map((sr: any, i: number) => (
                        <div key={i} style={{
                          background: sr.flag?.toLowerCase() === 'critical' ? '#fef2f2' : sr.flag?.toLowerCase() === 'high' || sr.flag?.toLowerCase() === 'low' ? '#fff7ed' : '#f0fdf4',
                          borderRadius: 6, padding: '5px 8px', fontSize: 10, border: sr.flag?.toLowerCase() === 'critical' ? '1px solid #dc262630' : 'none',
                        }}>
                          <div style={{ fontWeight: 600, fontSize: 9, color: 'var(--muted)' }}>{sr.test}</div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: sr.flag?.toLowerCase() === 'critical' ? '#dc2626' : 'var(--text)' }}>{sr.value} <span style={{ fontWeight: 400, fontSize: 9 }}>{sr.unit}</span></div>
                          {sr.flag && <div style={{ fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: sr.flag?.toLowerCase() === 'critical' ? '#dc2626' : '#f97316' }}>{sr.flag}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured result entry */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Enter / Edit Results (CSV: test, value, unit, flag, ref_range)</div>
                  <textarea value={interpretFindings} onChange={e => setInterpretFindings(e.target.value)}
                    placeholder={`Hb, 13.2, g/dL, Normal, 12-16\nWBC, 14.5, x10^9/L, High, 4-11\nCreatinine, 95, umol/L, Normal, 60-110`}
                    rows={5} style={{
                      padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%',
                      background: 'var(--bg)', outline: 'none', fontFamily: 'var(--mono)', resize: 'vertical',
                    }} />
                  {interpretFindings.trim() && (() => {
                    const lines = interpretFindings.split('\n').map(l => l.trim()).filter(l => l.includes(','));
                    const criticals = lines.filter(l => l.split(',')[3]?.trim().toLowerCase() === 'critical');
                    const abnormals = lines.filter(l => {
                      const flag = l.split(',')[3]?.trim().toLowerCase();
                      return flag === 'high' || flag === 'low';
                    });
                    return (
                      <div style={{ marginTop: 4, display: 'flex', gap: 6, fontSize: 10, color: 'var(--muted)' }}>
                        <span>{lines.length} result{lines.length > 1 ? 's' : ''} detected</span>
                        {criticals.length > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠ {criticals.length} critical</span>}
                        {abnormals.length > 0 && <span style={{ color: '#f97316', fontWeight: 600 }}>⚠ {abnormals.length} abnormal</span>}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* RIGHT PANEL - Interpretation Tools */}
              <div style={{ width: 280, flexShrink: 0, padding: 14, overflowY: 'auto', background: '#f8fafc' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Interpretation</div>

                {/* Severity */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Severity</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                      { value: 'mild', label: 'Mild', color: '#16a34a' },
                      { value: 'moderate', label: 'Moderate', color: '#ca8a04' },
                      { value: 'severe', label: 'Severe', color: '#f97316' },
                      { value: 'critical', label: 'Critical', color: '#dc2626' },
                    ].map(s => (
                      <button key={s.value} onClick={() => setInterpretSeverity(s.value as any)} style={{
                        flex: 1, padding: '4px', border: `2px solid ${interpretSeverity === s.value ? s.color : 'var(--border)'}`,
                        borderRadius: 6, background: interpretSeverity === s.value ? `${s.color}10` : 'transparent',
                        fontSize: 9, fontWeight: interpretSeverity === s.value ? 700 : 500, cursor: 'pointer',
                        color: interpretSeverity === s.value ? s.color : 'var(--muted)', fontFamily: 'var(--font)',
                      }}>{s.label}</button>
                    ))}
                  </div>
                </div>

                {/* Impression */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Impression *</div>
                  <textarea value={interpretImpression} onChange={e => setInterpretImpression(e.target.value)}
                    placeholder="e.g., Consistent with community-acquired pneumonia. WBC and CRP elevated."
                    rows={3} style={{
                      padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%',
                      background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                </div>

                {/* Differential Support */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Differential Support</div>
                  <textarea value={interpretDifferentialSupport} onChange={e => setInterpretDifferentialSupport(e.target.value)}
                    placeholder="Supports: bacterial pneumonia\nAgainst: TB (sputum AFB neg)"
                    rows={2} style={{
                      padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%',
                      background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                </div>

                {/* Prior Comparison */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Comparison with Prior</div>
                  <textarea value={interpretPriorComparison} onChange={e => setInterpretPriorComparison(e.target.value)}
                    placeholder="e.g., WBC trending down from 18.5 on 20 May. Improving."
                    rows={2} style={{
                      padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%',
                      background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                </div>

                {/* Recommendation */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 3 }}>Recommendation</div>
                  <textarea value={interpretRecommendation} onChange={e => setInterpretRecommendation(e.target.value)}
                    placeholder="e.g., Start IV antibiotics (ceftriaxone + azithromycin). Repeat blood cultures in 48h."
                    rows={2} style={{
                      padding: '6px 8px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 11, width: '100%',
                      background: '#fff', outline: 'none', fontFamily: 'var(--font)', resize: 'vertical',
                    }} />
                </div>

                {/* AI Assistance hint */}
                <div style={{ background: '#eff6ff', borderRadius: 8, padding: 8, fontSize: 10, color: '#1e40af', marginBottom: 10, borderLeft: '3px solid #2563eb' }}>
                  🤖 <strong>AI Suggestion:</strong> Consider correlating with prior imaging and clinical response to guide antibiotic duration.
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                {interpretOrder._type === 'imaging' ? '🩻 Imaging Review' : '🧪 Lab Review'}
                {(interpretOrder.patientUploadedResult || interpretOrder.uploadUrl) && <span style={{ marginLeft: 8 }}>· 📎 Patient-uploaded result</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => {
                  setInterpretOrder(null);
                  setInterpretFindings('');
                  setInterpretImpression('');
                  setInterpretRecommendation('');
                  setInterpretSeverity('');
                  setInterpretDifferentialSupport('');
                  setInterpretPriorComparison('');
                }} style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                }}>Cancel</button>
                <button onClick={async () => {
                  await submitInterpretation();
                  // Print the completed form
                  const printContent = printRequestForm(interpretOrder, interpretOrder._type || 'lab', patientInfo, null);
                  const w = window.open('', '_blank');
                  if (w) { w.document.write(printContent); w.document.close(); }
                }} disabled={!interpretFindings.trim()} style={{
                  background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  opacity: interpretFindings.trim() ? 1 : 0.5,
                }}>💾 Save & Print Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
