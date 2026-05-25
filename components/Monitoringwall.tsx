'use client';
// ═══════════════════════════════════════════════════════════════════════════
// components/amexan/MonitoringWall.tsx
// THE CLINICAL INTELLIGENCE WALL — full patient monitoring workstation
// Integrates: alert engine, protocol browser, prescription intelligence,
// disease selector, longitudinal trends, medication overview
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from 'react';
import {
  collection, query, where, onSnapshot, orderBy, limit,
} from 'firebase/firestore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { db } from '@/lib/firebase';
import {
  DISEASE_PROTOCOLS, DEPARTMENTS, DRUG_DB,
  evaluateAlerts, PatientContext, TriggeredAlert,
} from '@/lib/clinicalProtocols';
import { TOOL_CONFIGS, ToolAssignment, ToolReading } from '@/lib/diseaseTools';

import MonitorCard        from './MonitorCard';
import AlertPanel         from './AlertPanel';
import ProtocolPanel      from './ProtocolPanel';
import DiseaseSelector    from './DiseaseSelector';
import PrescriptionIntelligencePanel from './PrescriptionIntelligencePanel';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Prescription {
  id: string;
  medication: string;
  drugClass: string;
  dosage: string;
  frequency: string;
  route: string;
  indication?: string;
  active: boolean;
  createdAt: any;
  doctorName: string;
}

interface TrendPoint { day: string; val: number }

interface MonitoringWallProps {
  patientId:    string;
  patientName:  string;
  patientAge?:  number;
  patientSex?:  'M' | 'F';
  patientWeight?: number;
  patientAllergies?: string[];
  patientDiagnoses?: string[];
  doctor: { uid: string; name: string };
  // Live vitals injected from parent (e.g. from Firestore toolReadings)
  vitals?: Record<string, number>;
  labs?:   Record<string, number>;
}

type WallTab = 'wall' | 'protocols' | 'trends' | 'medications';

// ─── Trend generator ─────────────────────────────────────────────────────────
const makeTrend = (base: number, noise: number, n = 14): TrendPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    day: `D${i + 1}`,
    val: Math.round((base + Math.sin(i * 0.9) * noise + (Math.random() - 0.5) * noise) * 10) / 10,
  }));

// ─── Simple section label ─────────────────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: '#3a4a5e',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: '1px solid #1c2a3d',
      }}
    >
      {children}
    </div>
  );
}

// ─── Full-width trend chart ────────────────────────────────────────────────────
function TrendChart({
  title, data, color, unit, refLow, refHigh,
}: {
  title: string; data: TrendPoint[]; color: string; unit: string;
  refLow?: number; refHigh?: number;
}) {
  return (
    <div
      style={{
        background: '#0d1520',
        border: '1px solid #1e2d42',
        borderRadius: 8,
        padding: '12px 14px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{title}</div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#141f2e" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#3a4a5e' }} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: '#3a4a5e' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: '#141f2e',
              border: '1px solid #2a3d57',
              borderRadius: 6,
              fontSize: 11,
              color: '#e8edf5',
            }}
          />
          {refHigh !== undefined && (
            <ReferenceLine y={refHigh} stroke="#ef444455" strokeDasharray="4 2"
              label={{ value: 'Alert', fill: '#ef4444', fontSize: 8 }} />
          )}
          {refLow !== undefined && (
            <ReferenceLine y={refLow} stroke="#f59e0b55" strokeDasharray="4 2"
              label={{ value: 'Low', fill: '#f59e0b', fontSize: 8 }} />
          )}
          <Area
            type="monotone" dataKey="val" stroke={color} strokeWidth={2}
            fill={`${color}12`} dot={false} activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MonitoringWall({
  patientId,
  patientName,
  patientAge = 0,
  patientSex = 'F',
  patientWeight = 70,
  patientAllergies = [],
  patientDiagnoses = [],
  doctor,
  vitals: externalVitals,
  labs: externalLabs,
}: MonitoringWallProps) {
  const [activeDiagnoses, setActiveDiagnoses] = useState<string[]>(patientDiagnoses);
  const [prescriptions,   setPrescriptions]   = useState<Prescription[]>([]);
  const [assignments,     setAssignments]     = useState<ToolAssignment[]>([]);
  const [allReadings,     setAllReadings]     = useState<Record<string, ToolReading[]>>({});
  const [tab,             setTab]             = useState<WallTab>('wall');
  const [showRx,          setShowRx]          = useState(false);
  const [showDxSelector,  setShowDxSelector]  = useState(false);

  // ── Derived vitals from latest tool readings ─────────────────────────────
  const vitals = useMemo<Record<string, number>>(() => {
    const v: Record<string, number> = { ...externalVitals };
    Object.values(allReadings).flat().forEach((r) => {
      if (r.toolType === 'bp_monitor' && r.data.systolic) {
        v.sbp = r.data.systolic; v.dbp = r.data.diastolic;
      }
      if (r.toolType === 'glucose_tracker' && r.data.value) v.glucose = r.data.value;
      if (r.toolType === 'hba1c_tracker'   && r.data.value) v.hba1c   = r.data.value;
      if (r.toolType === 'spo2_monitor'    && r.data.spo2)  v.spo2    = r.data.spo2;
      if (r.toolType === 'weight_tracker'  && r.data.weight)v.weight  = r.data.weight;
      if (r.toolType === 'peak_flow'       && r.data.value) v.pef     = r.data.value;
      if (r.toolType === 'ecg_monitor'     && r.data.heartRate) v.hr  = r.data.heartRate;
    });
    return v;
  }, [allReadings, externalVitals]);

  const labs = useMemo<Record<string, number>>(() => {
    const l: Record<string, number> = { ...externalLabs };
    Object.values(allReadings).flat().forEach((r) => {
      if (r.toolType === 'renal_panel' && r.data.egfr)       l.egfr      = r.data.egfr;
      if (r.toolType === 'renal_panel' && r.data.creatinine) l.creatinine= r.data.creatinine;
      if (r.toolType === 'electrolytes'&& r.data.potassium)  l.potassium = r.data.potassium;
    });
    return l;
  }, [allReadings, externalLabs]);

  const alerts = useMemo<TriggeredAlert[]>(
    () => evaluateAlerts(vitals, labs, activeDiagnoses),
    [vitals, labs, activeDiagnoses]
  );

  const emergencyAlerts = alerts.filter((a) => a.level === 'emergency');
  const urgentAlerts    = alerts.filter((a) => a.level === 'urgent');

  // ── Firestore: active tool assignments ──────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, 'toolAssignments'),
        where('patientId', '==', patientId),
        where('active', '==', true)
      ),
      (snap) => setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ToolAssignment)))
    );
    return () => unsub();
  }, [patientId]);

  // ── Firestore: latest readings per assignment ────────────────────────────
  useEffect(() => {
    if (!assignments.length) return;
    const unsubs = assignments.map((a) =>
      onSnapshot(
        query(
          collection(db, 'toolReadings'),
          where('patientId', '==', patientId),
          where('assignmentId', '==', a.id),
          orderBy('recordedAt', 'desc'),
          limit(30)
        ),
        (snap) =>
          setAllReadings((prev) => ({
            ...prev,
            [a.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ToolReading)),
          }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [assignments, patientId]);

  // ── Firestore: prescriptions ────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      ),
      (snap) => setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Prescription)))
    );
    return () => unsub();
  }, [patientId]);

  // ── Static trend data (replace with Firestore aggregate in production) ──
  const trends = useMemo(() => ({
    sbp:    makeTrend(vitals.sbp    || 155, 15),
    glucose:makeTrend(vitals.glucose|| 11,   3),
    egfr:   makeTrend(labs.egfr     || 45,   4),
    weight: makeTrend(patientWeight,          0.5),
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Patient context for prescription intelligence ────────────────────────
  const patientCtx: PatientContext & { uid: string; name: string } = {
    uid:       patientId,
    name:      patientName,
    age:       patientAge,
    sex:       patientSex,
    weight:    patientWeight,
    allergies: patientAllergies,
    labs,
    currentMeds: prescriptions.map((p) => `${p.medication} ${p.dosage}`),
    diagnoses:   activeDiagnoses,
  };

  const bmi = Math.round((patientWeight / (1.65 ** 2)) * 10) / 10;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const toggleDx = (id: string) =>
    setActiveDiagnoses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const levelColor = (l: string) =>
    ({ emergency: '#ef4444', urgent: '#f59e0b', watch: '#06b6d4', normal: '#10d47a' } as Record<string, string>)[l] || '#94a3b8';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        background: '#060b14',
        color: '#e8edf5',
        minHeight: '100%',
      }}
    >
      {/* ── Emergency top banner ─────────────────────────────────────────── */}
      {(emergencyAlerts.length > 0 || urgentAlerts.length > 0) && (
        <div
          style={{
            background: emergencyAlerts.length > 0
              ? 'rgba(239,68,68,.10)'
              : 'rgba(245,158,11,.07)',
            borderBottom: `1px solid ${emergencyAlerts.length > 0 ? '#ef444330' : '#f59e0b25'}`,
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13 }}>{emergencyAlerts.length > 0 ? '🚨' : '⚠️'}</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: emergencyAlerts.length > 0 ? '#fca5a5' : '#fcd34d',
            }}
          >
            {emergencyAlerts.length > 0
              ? `${emergencyAlerts.length} EMERGENCY alert${emergencyAlerts.length > 1 ? 's' : ''} — Immediate action required`
              : `${urgentAlerts.length} urgent alert${urgentAlerts.length > 1 ? 's' : ''} — Review required`}
          </span>
          <span style={{ fontSize: 10, color: '#64748b', marginLeft: 'auto' }}>
            {alerts
              .slice(0, 3)
              .map((a) => `${a.param?.toUpperCase()}: ${a.value}`)
              .join(' · ')}
          </span>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Patient header ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 0',
            borderBottom: '1px solid #141f2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: 'linear-gradient(135deg,#1c3d5a,#0f6456)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: '#10d47a',
                flexShrink: 0,
              }}
            >
              {patientName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{patientName}</div>
              <div
                style={{
                  fontSize: 10,
                  color: '#64748b',
                  marginTop: 2,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                {patientAge}y · {patientSex} · {patientWeight}kg · BMI {bmi}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {activeDiagnoses.map((id) => {
                  const proto = DISEASE_PROTOCOLS[id];
                  const dept  = proto ? DEPARTMENTS[proto.dept] : null;
                  return proto ? (
                    <span
                      key={id}
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: dept?.color || '#64748b',
                        background: `${dept?.color || '#64748b'}12`,
                        padding: '1px 6px',
                        borderRadius: 3,
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                      }}
                    >
                      {proto.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowDxSelector(true)}
              style={{
                padding: '6px 12px',
                background: 'rgba(6,182,212,.1)',
                border: '1px solid #06b6d428',
                borderRadius: 5,
                color: '#06b6d4',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + Manage Diagnoses
            </button>
            <button
              onClick={() => setShowRx(true)}
              style={{
                padding: '6px 12px',
                background: 'rgba(16,212,122,.1)',
                border: '1px solid #10d47a28',
                borderRadius: 5,
                color: '#10d47a',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ⚕ Prescribe
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                background:
                  emergencyAlerts.length > 0
                    ? 'rgba(239,68,68,.08)'
                    : alerts.length > 0
                    ? 'rgba(245,158,11,.07)'
                    : 'rgba(16,212,122,.06)',
                border: `1px solid ${
                  emergencyAlerts.length > 0
                    ? '#ef444422'
                    : alerts.length > 0
                    ? '#f59e0b20'
                    : '#10d47a20'
                }`,
                borderRadius: 5,
                fontSize: 9,
                fontWeight: 700,
                color:
                  emergencyAlerts.length > 0
                    ? '#ef4444'
                    : alerts.length > 0
                    ? '#f59e0b'
                    : '#10d47a',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {alerts.length > 0
                ? `${alerts.length} Alert${alerts.length > 1 ? 's' : ''}`
                : 'All Clear'}
            </div>
          </div>
        </div>

        {/* ── Main two-column grid ──────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: 12,
            paddingTop: 12,
            paddingBottom: 28,
          }}
        >
          {/* ── LEFT — Monitoring Wall / Protocols / Trends / Meds ────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Tab navigation */}
            <div
              style={{
                display: 'flex',
                gap: 1,
                borderBottom: '1px solid #1e2d42',
              }}
            >
              {(
                [
                  ['wall',        'Monitoring Wall'],
                  ['protocols',   'Clinical Protocols'],
                  ['trends',      'Longitudinal Trends'],
                  ['medications', 'Medications'],
                ] as [WallTab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${tab === id ? '#06b6d4' : 'transparent'}`,
                    color: tab === id ? '#06b6d4' : '#3a4a5e',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                    transition: 'all .15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ─── MONITORING WALL ─────────────────────────────────────── */}
            {tab === 'wall' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Universal vitals row */}
                <div>
                  <SLabel>Vitals Monitoring</SLabel>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
                      gap: 8,
                    }}
                  >
                    <MonitorCard
                      title="Blood Pressure"
                      value={`${vitals.sbp || '—'}/${vitals.dbp || '—'}`}
                      unit="mmHg"
                      level={
                        (vitals.sbp || 0) >= 180 ? 'emergency' :
                        (vitals.sbp || 0) >= 160 ? 'urgent' :
                        (vitals.sbp || 0) > 0 ? 'normal' : 'watch'
                      }
                      trend={trends.sbp}
                      refHigh={160}
                      color="#ef4444"
                      icon="🩺"
                      subtext={vitals.sbp ? `MAP: ${Math.round(((vitals.sbp || 0) + 2 * (vitals.dbp || 0)) / 3)}` : undefined}
                    />
                    <MonitorCard
                      title="Blood Glucose"
                      value={vitals.glucose || '—'}
                      unit="mmol/L"
                      level={
                        (vitals.glucose || 0) < 3.9 ? 'emergency' :
                        (vitals.glucose || 0) > 13.9 ? 'urgent' :
                        (vitals.glucose || 0) > 0 ? 'watch' : 'watch'
                      }
                      trend={trends.glucose}
                      refLow={3.9}
                      refHigh={13.9}
                      color="#f59e0b"
                      icon="🔬"
                    />
                    <MonitorCard
                      title="SpO₂"
                      value={vitals.spo2 || '—'}
                      unit="%"
                      level={
                        (vitals.spo2 || 100) < 92 ? 'emergency' :
                        (vitals.spo2 || 100) < 95 ? 'urgent' : 'normal'
                      }
                      color="#06b6d4"
                      icon="🫁"
                    />
                    <MonitorCard
                      title="Heart Rate"
                      value={vitals.hr || '—'}
                      unit="bpm"
                      level={
                        (vitals.hr || 75) > 120 ? 'urgent' :
                        (vitals.hr || 75) < 50  ? 'urgent' : 'normal'
                      }
                      color="#8b5cf6"
                      icon="❤️"
                    />
                    <MonitorCard
                      title="Weight"
                      value={patientWeight}
                      unit="kg"
                      level="normal"
                      trend={trends.weight}
                      color="#10d47a"
                      icon="⚖️"
                      subtext={`BMI ${bmi}`}
                    />
                    <MonitorCard
                      title="HbA1c"
                      value={vitals.hba1c || '—'}
                      unit="%"
                      level={(vitals.hba1c || 0) > 10 ? 'urgent' : (vitals.hba1c || 0) > 0 ? 'watch' : 'watch'}
                      color="#f97316"
                      icon="🧬"
                      subtext="Target <7%"
                    />
                  </div>
                </div>

                {/* Per-diagnosis disease monitoring lanes */}
                {activeDiagnoses.map((dxId) => {
                  const proto = DISEASE_PROTOCOLS[dxId];
                  const dept  = proto ? DEPARTMENTS[proto.dept] : null;
                  if (!proto || !dept) return null;
                  return (
                    <div key={dxId}>
                      {/* Lane divider */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ height: 1, flex: 1, background: '#1e2d42' }} />
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: dept.color,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            padding: '0 8px',
                          }}
                        >
                          {dept.icon} {proto.name} Monitoring
                        </span>
                        <div style={{ height: 1, flex: 1, background: '#1e2d42' }} />
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
                          gap: 8,
                        }}
                      >
                        {/* Disease-specific cards */}
                        {dxId === 'ckd' && (
                          <>
                            <MonitorCard
                              title="eGFR"
                              value={labs.egfr || '—'}
                              unit="mL/min"
                              level={(labs.egfr || 60) < 15 ? 'emergency' : (labs.egfr || 60) < 30 ? 'urgent' : 'watch'}
                              trend={trends.egfr}
                              refLow={30}
                              color="#8b5cf6"
                              subtext={
                                (labs.egfr || 60) >= 60 ? 'Stage ≤2' :
                                (labs.egfr || 60) >= 45 ? 'Stage 3a' :
                                (labs.egfr || 60) >= 30 ? 'Stage 3b' :
                                (labs.egfr || 60) >= 15 ? 'Stage 4' : 'Stage 5'
                              }
                            />
                            <MonitorCard
                              title="Potassium"
                              value={labs.potassium || '—'}
                              unit="mmol/L"
                              level={
                                (labs.potassium || 0) >= 6.0 ? 'emergency' :
                                (labs.potassium || 0) >= 5.5 ? 'urgent' :
                                (labs.potassium || 0) > 0 ? 'normal' : 'watch'
                              }
                              color="#ef4444"
                              subtext="Target 3.5–5.0"
                            />
                            <MonitorCard
                              title="Creatinine"
                              value={labs.creatinine || '—'}
                              unit="μmol/L"
                              level={(labs.creatinine || 0) > 200 ? 'urgent' : 'watch'}
                              color="#06b6d4"
                            />
                          </>
                        )}

                        {dxId === 'hypertension' && (
                          <MonitorCard
                            title="BP Compliance"
                            value="71"
                            unit="%"
                            level="watch"
                            color="#f59e0b"
                            subtext="10/14 readings"
                          />
                        )}

                        {dxId === 'diabetes_t2' && (
                          <>
                            <MonitorCard
                              title="Fasting Glucose"
                              value={vitals.glucose || '—'}
                              unit="mmol/L"
                              level={(vitals.glucose || 0) < 3.9 ? 'emergency' : (vitals.glucose || 0) > 13.9 ? 'urgent' : 'watch'}
                              trend={trends.glucose}
                              refLow={3.9}
                              refHigh={13.9}
                              color="#f59e0b"
                              subtext="Target 4–7"
                            />
                            <MonitorCard
                              title="Foot Check"
                              value="Due"
                              unit=""
                              level="watch"
                              color="#8b5cf6"
                              subtext="Last: 3m ago"
                            />
                            <MonitorCard
                              title="Eye Review"
                              value="Due"
                              unit=""
                              level="watch"
                              color="#06b6d4"
                              subtext="Annual fundoscopy"
                            />
                          </>
                        )}

                        {dxId === 'asthma' && (
                          <MonitorCard
                            title="Peak Flow"
                            value={vitals.pef || '—'}
                            unit="L/min"
                            level={(vitals.pef || 500) < 300 ? 'emergency' : (vitals.pef || 500) < 400 ? 'urgent' : 'normal'}
                            color="#06b6d4"
                            subtext="Target >80% PB"
                          />
                        )}

                        {dxId === 'heart_failure' && (
                          <>
                            <MonitorCard
                              title="Fluid Balance"
                              value="±0"
                              unit="mL"
                              level="normal"
                              color="#3b82f6"
                              subtext="24h balance"
                            />
                            <MonitorCard
                              title="Daily Weight"
                              value={patientWeight}
                              unit="kg"
                              level="normal"
                              trend={trends.weight}
                              refHigh={patientWeight + 2}
                              color="#10d47a"
                              subtext="Alert if +2kg/24h"
                            />
                          </>
                        )}

                        {/* Generic monitoring tools from assignment */}
                        {assignments
                          .filter((a) =>
                            DISEASE_PROTOCOLS[dxId]?.monitoring.includes(a.toolType) &&
                            !['bp_monitor', 'glucose_tracker', 'hba1c_tracker', 'spo2_monitor', 'weight_tracker', 'ecg_monitor'].includes(a.toolType)
                          )
                          .map((a) => {
                            const cfg = TOOL_CONFIGS?.[a.toolType];
                            const readings = allReadings[a.id] || [];
                            const latest = readings[0];
                            return cfg ? (
                              <MonitorCard
                                key={a.id}
                                title={cfg.name}
                                value={latest ? Object.values(latest.data)[0] as string : '—'}
                                unit={cfg.fields?.[0]?.unit}
                                level={(latest?.triage?.level || 'watch') as import("@/lib/clinicalProtocols").AlertLevel}
                                color={cfg.color}
                                icon={cfg.icon}
                              />
                            ) : null;
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── CLINICAL PROTOCOLS ────────────────────────────────── */}
            {tab === 'protocols' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeDiagnoses.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#3a4a5e',
                      padding: '40px',
                      fontSize: 12,
                    }}
                  >
                    No active diagnoses. Click "Manage Diagnoses" to activate clinical protocols.
                  </div>
                ) : (
                  activeDiagnoses.map((id) => <ProtocolPanel key={id} dxId={id} />)
                )}
              </div>
            )}

            {/* ─── LONGITUDINAL TRENDS ───────────────────────────────── */}
            {tab === 'trends' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TrendChart
                  title="Blood Pressure — Systolic (mmHg)"
                  data={trends.sbp}
                  color="#ef4444"
                  unit="mmHg"
                  refHigh={160}
                />
                <TrendChart
                  title="Blood Glucose (mmol/L)"
                  data={trends.glucose}
                  color="#f59e0b"
                  unit="mmol/L"
                  refHigh={13.9}
                  refLow={3.9}
                />
                <TrendChart
                  title="eGFR (mL/min)"
                  data={trends.egfr}
                  color="#8b5cf6"
                  unit="mL/min"
                  refLow={30}
                />
                <TrendChart
                  title="Body Weight (kg)"
                  data={trends.weight}
                  color="#10d47a"
                  unit="kg"
                />
              </div>
            )}

            {/* ─── MEDICATIONS ────────────────────────────────────────── */}
            {tab === 'medications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <SLabel>Active Prescriptions</SLabel>
                  <button
                    onClick={() => setShowRx(true)}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(16,212,122,.1)',
                      border: '1px solid #10d47a30',
                      borderRadius: 4,
                      color: '#10d47a',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    + New Prescription
                  </button>
                </div>
                {prescriptions.length === 0 ? (
                  <div style={{ color: '#3a4a5e', fontSize: 12, padding: '20px 0' }}>
                    No active prescriptions.
                  </div>
                ) : (
                  prescriptions.map((rx) => {
                    const drugEntry = Object.entries(DRUG_DB).find(([, d]) =>
                      d.name.toLowerCase() === rx.medication.toLowerCase()
                    );
                    return (
                      <div
                        key={rx.id}
                        style={{
                          padding: '10px 13px',
                          background: '#0d1520',
                          border: '1px solid #1e2d42',
                          borderRadius: 7,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>
                              💊 {rx.medication}{' '}
                              <span
                                style={{
                                  fontSize: 11,
                                  color: '#10d47a',
                                  fontFamily: 'IBM Plex Mono, monospace',
                                }}
                              >
                                {rx.dosage}
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                              {rx.frequency} · {rx.route}
                              {rx.indication ? ` · For: ${rx.indication}` : ''}
                            </div>
                            {drugEntry && (
                              <div style={{ fontSize: 9, color: '#3a4a5e', marginTop: 2 }}>
                                {drugEntry[1].class}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: '#10d47a',
                              background: 'rgba(16,212,122,.1)',
                              padding: '2px 7px',
                              borderRadius: 3,
                            }}
                          >
                            Active
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Labs overview */}
            <div
              style={{
                background: '#0d1520',
                border: '1px solid #1e2d42',
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <SLabel>Laboratory Overview</SLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { label: 'eGFR',       val: labs.egfr,       unit: 'mL/min', danger: (v: number) => v < 30, warn: (v: number) => v < 60 },
                  { label: 'Potassium',  val: labs.potassium,  unit: 'mmol/L', danger: (v: number) => v >= 6.0, warn: (v: number) => v >= 5.5 },
                  { label: 'Creatinine', val: labs.creatinine, unit: 'μmol/L', danger: (v: number) => v > 250, warn: (v: number) => v > 150 },
                  { label: 'HbA1c',     val: vitals.hba1c,    unit: '%',      danger: (v: number) => v > 10,  warn: (v: number) => v > 7 },
                  { label: 'BP (sys)',   val: vitals.sbp,      unit: 'mmHg',   danger: (v: number) => v >= 180, warn: (v: number) => v >= 160 },
                ].map(({ label, val, unit, danger, warn }) => {
                  if (!val) return null;
                  const color = danger(val) ? '#ef4444' : warn(val) ? '#f59e0b' : '#10d47a';
                  return (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 0',
                        borderBottom: '1px solid #141f2e',
                      }}
                    >
                      <span style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color,
                          fontFamily: 'IBM Plex Mono, monospace',
                        }}
                      >
                        {val}{' '}
                        <span style={{ fontSize: 9, color: '#3a4a5e', fontWeight: 400 }}>{unit}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active alerts */}
            <div
              style={{
                background: '#0d1520',
                border: `1px solid ${emergencyAlerts.length > 0 ? '#ef444422' : '#1e2d42'}`,
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <SLabel>Active Alerts</SLabel>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: emergencyAlerts.length
                      ? '#ef4444'
                      : urgentAlerts.length
                      ? '#f59e0b'
                      : '#10d47a',
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                  }}
                >
                  {alerts.length} Active
                </span>
              </div>
              <AlertPanel alerts={alerts} />
            </div>

            {/* Protocol intelligence */}
            <div
              style={{
                background: '#0d1520',
                border: '1px solid #1e2d42',
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <SLabel>Protocol Intelligence</SLabel>
              {activeDiagnoses.length === 0 ? (
                <div style={{ fontSize: 11, color: '#3a4a5e' }}>No diagnoses active.</div>
              ) : (
                activeDiagnoses.map((id) => {
                  const proto = DISEASE_PROTOCOLS[id];
                  const dept  = proto ? DEPARTMENTS[proto.dept] : null;
                  return proto ? (
                    <div
                      key={id}
                      style={{
                        marginBottom: 8,
                        paddingBottom: 8,
                        borderBottom: '1px solid #141f2e',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: dept?.color || '#94a3b8', marginBottom: 2 }}>
                        {proto.name}
                      </div>
                      <div style={{ fontSize: 9, color: '#3a4a5e' }}>Review: {proto.review}</div>
                    </div>
                  ) : null;
                })
              )}
              <div
                style={{
                  marginTop: 6,
                  padding: '8px',
                  background: 'rgba(6,182,212,.05)',
                  borderRadius: 5,
                  border: '1px solid #06b6d418',
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#06b6d4',
                    marginBottom: 5,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Next Actions
                </div>
                {alerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      fontSize: 10,
                      color: '#94a3b8',
                      marginBottom: 3,
                      display: 'flex',
                      gap: 5,
                    }}
                  >
                    <span style={{ color: levelColor(a.level), flexShrink: 0 }}>→</span>
                    <span style={{ lineHeight: 1.4 }}>{a.message.split(' — ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active medications mini-summary */}
            {prescriptions.length > 0 && (
              <div
                style={{
                  background: '#0d1520',
                  border: '1px solid #1e2d42',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <SLabel>Medications ({prescriptions.length})</SLabel>
                {prescriptions.slice(0, 4).map((rx) => (
                  <div
                    key={rx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '3px 0',
                      borderBottom: '1px solid #141f2e',
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{rx.medication}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'IBM Plex Mono, monospace',
                        color: '#10d47a',
                      }}
                    >
                      {rx.dosage}
                    </span>
                  </div>
                ))}
                {prescriptions.length > 4 && (
                  <div style={{ fontSize: 9, color: '#3a4a5e', marginTop: 4 }}>
                    +{prescriptions.length - 4} more — view Medications tab
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showRx && (
        <PrescriptionIntelligencePanel
          patient={patientCtx}
          doctor={doctor}
          onClose={() => setShowRx(false)}
        />
      )}
      {showDxSelector && (
        <DiseaseSelector
          activeDiagnoses={activeDiagnoses}
          onToggle={toggleDx}
          onClose={() => setShowDxSelector(false)}
        />
      )}
    </div>
  );
}