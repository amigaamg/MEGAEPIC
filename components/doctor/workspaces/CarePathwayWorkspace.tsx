'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, doc, setDoc, addDoc,
  updateDoc, deleteDoc, getDoc, getDocs, serverTimestamp, orderBy, limit, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DEPARTMENTS, ALL_PATHWAYS, RISK_COLORS, RISK_COLORS_DIM, STATUS_COLORS,
  getPathwayById, getPathwaysByDepartment, fmtDate, fmtDateTime, fmtTime,
  type PathwayDef, type DepartmentDef,
} from '@/components/doctor/panels/DepartmentDefinitions';
import FullPagePatientDossier from '@/components/doctor/panels/FullPagePatientDossier';
import FullPageDocketCenter from '@/components/doctor/panels/FullPageDocketCenter';
import FullPageToolsWorkshop from '@/components/doctor/panels/FullPageToolsWorkshop';
import FullPageAlertsMessaging from '@/components/doctor/panels/FullPageAlertsMessaging';
import FullPageReferrals from '@/components/doctor/panels/FullPageReferrals';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface EnrolledPatient {
  id: string;
  patientId: string;
  patientName: string;
  pathwayId: string;
  currentMilestone: number;
  startDate: any;
  status: 'active' | 'completed' | 'paused' | 'discharged';
  docketId?: string;
  docketName?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  lastReview?: any;
  age?: number;
  sex?: string;
  patientIdCode?: string;
  recruitmentSource?: 'internal' | 'external';
  doctorId?: string;
  doctorName?: string;
  alerts?: number;
}

interface DocketType {
  id: string;
  name: string;
  specialty: string;
  description?: string;
  tools: string[];
  patientCount: number;
  createdBy: string;
  isActive: boolean;
  createdAt?: any;
  color?: string;
}

interface AlertNotification {
  id: string;
  patientId: string;
  patientName?: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: any;
  doctorId?: string;
}

interface Props {
  patients: { uid: string; name: string; condition?: string }[];
  doctorId: string;
  doctorName: string;
}

// ─── VIEW TYPES ───────────────────────────────────────────────────────────────

type HubView = 'registry' | 'patient' | 'docket' | 'tools' | 'alerts' | 'enroll' | 'referrals';

// ─── MAIN WORKSPACE HUB ───────────────────────────────────────────────────────

export default function CarePathwayWorkspace({ patients, doctorId, doctorName }: Props) {
  const [enrolledPatients, setEnrolledPatients] = useState<EnrolledPatient[]>([]);
  const [dockets, setDockets] = useState<DocketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<AlertNotification[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState(0);

  // Navigation state
  const [currentView, setCurrentView] = useState<HubView>('registry');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedDocket, setSelectedDocket] = useState<string | null>(null);
  const [activePathwayFilter, setActivePathwayFilter] = useState<string>('all');

  // Department toggles
  const [activeDepartments, setActiveDepartments] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amx-active-depts');
      return saved ? JSON.parse(saved) : DEPARTMENTS.slice(0, 8).map(d => d.id);
    }
    return DEPARTMENTS.slice(0, 8).map(d => d.id);
  });

  // Save department preferences
  useEffect(() => {
    localStorage.setItem('amx-active-depts', JSON.stringify(activeDepartments));
  }, [activeDepartments]);

  const toggleDepartment = (id: string) => {
    setActiveDepartments(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Firebase subscriptions
  useEffect(() => {
    const subs: (() => void)[] = [];

    subs.push(onSnapshot(
      query(collection(db, 'care_pathways'), where('doctorId', '==', doctorId)),
      async snap => {
        const rows: EnrolledPatient[] = await Promise.all(snap.docs.map(async d => {
          const data = d.data();
          let age: number | undefined;
          let sex: string | undefined;
          let patientIdCode: string | undefined;
          try {
            const uSnap = await getDoc(doc(db, 'users', data.patientId));
            if (uSnap.exists()) {
              const u = uSnap.data();
              age = u.age;
              sex = u.gender || u.sex;
              patientIdCode = u.patientId || `AMX-${d.id.slice(0, 5).toUpperCase()}`;
            }
          } catch {}
          return {
            id: d.id, patientId: data.patientId, patientName: data.patientName,
            pathwayId: data.pathwayId, currentMilestone: data.currentMilestone ?? 0,
            startDate: data.startDate, status: data.status ?? 'active',
            docketId: data.docketId, docketName: data.docketName,
            riskLevel: data.riskLevel, notes: data.notes, lastReview: data.lastReview,
            age, sex, patientIdCode, recruitmentSource: data.recruitmentSource ?? 'internal',
            doctorId: data.doctorId, doctorName: data.doctorName,
          } as EnrolledPatient;
        }));
        setEnrolledPatients(rows);
        setLoading(false);
      }
    ));

    subs.push(onSnapshot(
      query(collection(db, 'dockets'), where('createdBy', '==', doctorId)),
      snap => setDockets(snap.docs.map(d => ({ id: d.id, ...d.data() } as DocketType)))
    ));

    subs.push(onSnapshot(
      query(collection(db, 'patientNotifications'), where('doctorId', '==', doctorId), where('read', '==', false), orderBy('createdAt', 'desc'), limit(5)),
      snap => {
        const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertNotification));
        setRecentAlerts(alerts);
        setUnreadAlerts(alerts.length);
      }
    ));

    subs.push(onSnapshot(
      query(collection(db, 'referrals'), where('doctorId', '==', doctorId), where('status', '==', 'pending')),
      snap => setPendingReferrals(snap.size)
    ));

    return () => subs.forEach(u => u());
  }, [doctorId]);

  // ── DERIVED DATA ──

  // Patients grouped by patientId for deduplication
  const deduplicatedPatients = useMemo(() => {
    const map = new Map<string, {
      patientId: string; patientName: string; age?: number; sex?: string;
      patientIdCode?: string; enrollments: EnrolledPatient[];
    }>();
    enrolledPatients.forEach(ep => {
      const existing = map.get(ep.patientId);
      if (existing) {
        existing.enrollments.push(ep);
      } else {
        map.set(ep.patientId, {
          patientId: ep.patientId, patientName: ep.patientName,
          age: ep.age, sex: ep.sex, patientIdCode: ep.patientIdCode,
          enrollments: [ep],
        });
      }
    });
    return Array.from(map.values());
  }, [enrolledPatients]);

  const activeCount = enrolledPatients.filter(e => e.status === 'active').length;
  const highRiskCount = enrolledPatients.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length;
  const pathwayCounts = useMemo(() => {
    const counts = new Map<string, number>();
    enrolledPatients.filter(e => e.status === 'active').forEach(e => {
      counts.set(e.pathwayId, (counts.get(e.pathwayId) || 0) + 1);
    });
    return ALL_PATHWAYS.filter(p => counts.has(p.id)).map(p => ({
      ...p, count: counts.get(p.id) || 0,
    }));
  }, [enrolledPatients]);

  const activeDockets = dockets.filter(d => d.isActive);

  // ── NAVIGATION ──

  const navigateTo = useCallback((view: HubView, params?: { patientId?: string; docketId?: string }) => {
    setCurrentView(view);
    if (params?.patientId) setSelectedPatient(params.patientId);
    if (params?.docketId) setSelectedDocket(params.docketId);
  }, []);

  const goBack = useCallback(() => {
    setCurrentView('registry');
    setSelectedPatient(null);
    setSelectedDocket(null);
  }, []);

  // ── FULL PAGE VIEWS ──

  if (currentView === 'patient' && selectedPatient) {
    const patientEnrollments = enrolledPatients.filter(e => e.patientId === selectedPatient);
    return (
      <FullPagePatientDossier
        patientId={selectedPatient}
        enrollments={patientEnrollments}
        allPathways={ALL_PATHWAYS}
        doctorId={doctorId}
        doctorName={doctorName}
        onBack={goBack}
        onEnroll={() => navigateTo('enroll', { patientId: selectedPatient })}
      />
    );
  }

  if (currentView === 'docket') {
    return (
      <FullPageDocketCenter
        doctorId={doctorId}
        doctorName={doctorName}
        dockets={dockets}
        enrolledPatients={enrolledPatients}
        patients={patients}
        allPathways={ALL_PATHWAYS}
        onBack={goBack}
        onSelectPatient={(pid) => navigateTo('patient', { patientId: pid })}
      />
    );
  }

  if (currentView === 'tools') {
    return (
      <FullPageToolsWorkshop
        allPathways={ALL_PATHWAYS}
        enrolledPatients={enrolledPatients}
        doctorId={doctorId}
        doctorName={doctorName}
        onBack={goBack}
      />
    );
  }

  if (currentView === 'alerts') {
    return (
      <FullPageAlertsMessaging
        doctorId={doctorId}
        doctorName={doctorName}
        enrolledPatients={enrolledPatients}
        patients={patients}
        onBack={goBack}
        onSelectPatient={(pid) => navigateTo('patient', { patientId: pid })}
      />
    );
  }

  if (currentView === 'referrals') {
    return (
      <FullPageReferrals
        doctorId={doctorId}
        doctorName={doctorName}
        enrolledPatients={enrolledPatients}
        patients={patients}
        onBack={goBack}
        onSelectPatient={(pid) => navigateTo('patient', { patientId: pid })}
      />
    );
  }

  if (currentView === 'enroll') {
    return (
      <FullPageDocketCenter
        doctorId={doctorId}
        doctorName={doctorName}
        dockets={dockets}
        enrolledPatients={enrolledPatients}
        patients={patients}
        allPathways={ALL_PATHWAYS}
        onBack={goBack}
        onSelectPatient={(pid) => navigateTo('patient', { patientId: pid })}
        defaultMode="enroll"
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#0aaa76', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13 }}>Loading care pathways…</div>
      </div>
    );
  }

  // ─── HUB / REGISTRY VIEW ─────────────────────────────────────────────────────

  const filteredPatients = activePathwayFilter === 'all'
    ? deduplicatedPatients
    : deduplicatedPatients.filter(dp =>
        dp.enrollments.some(e => e.pathwayId === activePathwayFilter)
      );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .3s ease', height: '100%' }}>

      {/* ── TOP STAT BAR ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10, flexShrink: 0,
      }}>
        {[
          { icon: '🛤️', label: 'Active Enrolments', val: activeCount, color: '#0F766E', onClick: 'registry' as HubView | null },
          { icon: '⚠️', label: 'High Risk Patients', val: highRiskCount, color: '#e53e3e', onClick: null as HubView | null },
          { icon: '📋', label: 'Active Dockets', val: activeDockets.length, color: '#5a67d8', onClick: 'docket' as HubView | null },
          { icon: '🛠️', label: 'Clinical Tools', val: ALL_PATHWAYS.reduce((a, p) => a + p.tools.length, 0), color: '#d69e2e', onClick: 'tools' as HubView | null },
          { icon: '📋', label: 'Referrals', val: pendingReferrals, color: '#d69e2e', onClick: 'referrals' as HubView | null, pulse: pendingReferrals > 0 },
          { icon: '🔔', label: 'Unread Alerts', val: unreadAlerts, color: '#e53e3e', onClick: 'alerts' as HubView | null, pulse: unreadAlerts > 0 },
        ].map(s => (
          <div
            key={s.label}
            onClick={() => { if (s.onClick) navigateTo(s.onClick as HubView); }}
            style={{
              background: 'var(--white)', border: `1px solid var(--border)`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: s.onClick ? 'pointer' : 'default',
              transition: 'all .15s', position: 'relative',
              boxShadow: s.pulse ? `0 0 0 2px ${s.color}30` : 'none',
            }}
            onMouseEnter={e => { if (s.onClick) { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-1px)'; } else { e.currentTarget.style.cursor = 'default'; }}}
            onMouseLeave={e => { if (s.onClick) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}}
          >
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={{
                fontSize: 22, fontWeight: 900, fontFamily: 'var(--mono)',
                color: s.color,
              }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>{s.label}</div>
            </div>
            {s.pulse && <span style={{
              position: 'absolute', top: 8, right: 8, width: 8, height: 8,
              borderRadius: '50%', background: s.color, animation: 'pulse-g 1.5s infinite',
            }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: DEPARTMENT PANELS ── */}
        <div style={{
          width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8,
          overflowY: 'auto', paddingRight: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .8, color: 'var(--muted)', padding: '4px 8px', marginBottom: 4 }}>
            🏥 Clinical Departments
            <span style={{ fontWeight: 500, marginLeft: 6, fontSize: 10, color: 'var(--muted)' }}>
              ({activeDepartments.length}/{DEPARTMENTS.length})
            </span>
          </div>

          <button
            onClick={() => setActivePathwayFilter('all')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
              background: activePathwayFilter === 'all' ? 'rgba(15,118,110,.08)' : 'transparent',
              border: `1.5px solid ${activePathwayFilter === 'all' ? '#0F766E' : 'transparent'}`,
              borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font)',
              color: activePathwayFilter === 'all' ? '#0F766E' : 'var(--text)',
              fontWeight: activePathwayFilter === 'all' ? 700 : 500,
              fontSize: 13, textAlign: 'left', transition: 'all .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,118,110,.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = activePathwayFilter === 'all' ? 'rgba(15,118,110,.08)' : 'transparent'; }}
          >
            <span style={{ fontSize: 18 }}>📊</span>
            <span>All Patients</span>
            <span style={{
              marginLeft: 'auto', background: activePathwayFilter === 'all' ? '#0F766E' : 'var(--bg)',
              color: activePathwayFilter === 'all' ? '#fff' : 'var(--muted)',
              borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 700,
            }}>{deduplicatedPatients.length}</span>
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          {DEPARTMENTS.filter(d => activeDepartments.includes(d.id)).length === 0 && (
            <div style={{ padding: '12px 8px', fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
              No departments selected. Click "Customize" to add departments.
            </div>
          )}

          {DEPARTMENTS.filter(d => activeDepartments.includes(d.id)).map(dept => {
            const deptPathways = ALL_PATHWAYS.filter(p => p.departmentId === dept.id);
            const activeInDept = enrolledPatients.filter(e =>
              e.status === 'active' && deptPathways.some(p => p.id === e.pathwayId)
            ).length;
            return (
              <div key={dept.id} style={{ borderRadius: 12, overflow: 'hidden', background: dept.colorDim }}>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    width: '100%', fontFamily: 'var(--font)', textAlign: 'left',
                    color: dept.color, fontWeight: 700, fontSize: 13,
                    transition: 'all .12s',
                  }}
                  onClick={() => setActivePathwayFilter(
                    activePathwayFilter === dept.id ? 'all' : dept.id
                  )}
                  onMouseEnter={e => { e.currentTarget.style.background = `${dept.color}10`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16 }}>{dept.icon}</span>
                  <span style={{ flex: 1 }}>{dept.label}</span>
                  <span style={{
                    background: activeInDept > 0 ? dept.color : 'transparent',
                    color: activeInDept > 0 ? '#fff' : 'var(--muted)',
                    borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                  }}>{activeInDept}</span>
                </button>
                {activePathwayFilter === dept.id && deptPathways.map(pw => {
                  const pwCount = enrolledPatients.filter(e => e.pathwayId === pw.id && e.status === 'active').length;
                  return (
                    <button
                      key={pw.id}
                      onClick={() => setActivePathwayFilter(
                        activePathwayFilter === pw.id ? dept.id : pw.id
                      )}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px 7px 44px',
                        border: 'none', background: activePathwayFilter === pw.id ? dept.colorDim : 'transparent',
                        cursor: 'pointer', width: '100%', fontFamily: 'var(--font)',
                        textAlign: 'left', fontSize: 12, fontWeight: activePathwayFilter === pw.id ? 700 : 400,
                        color: activePathwayFilter === pw.id ? dept.color : 'var(--text)',
                        transition: 'all .1s',
                      }}
                    >
                      <span>{pw.icon}</span>
                      <span style={{ flex: 1 }}>{pw.label}</span>
                      <span style={{
                        color: 'var(--muted)', fontSize: 10, fontWeight: 700,
                      }}>{pwCount > 0 ? pwCount : ''}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Referrals shortcut */}
          <button onClick={() => navigateTo('referrals')} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            border: '1.5px solid transparent', borderRadius: 12, cursor: 'pointer',
            background: pendingReferrals > 0 ? 'rgba(214,158,46,.08)' : 'transparent',
            color: pendingReferrals > 0 ? '#d69e2e' : 'var(--text)',
            fontWeight: pendingReferrals > 0 ? 700 : 500,
            width: '100%', fontFamily: 'var(--font)', textAlign: 'left', fontSize: 13,
            transition: 'all .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(214,158,46,.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = pendingReferrals > 0 ? 'rgba(214,158,46,.08)' : 'transparent'; }}
          >
            <span style={{ fontSize: 16 }}>📋</span>
            <span style={{ flex: 1 }}>Referrals</span>
            {pendingReferrals > 0 && (
              <span style={{
                background: '#d69e2e', color: '#fff',
                borderRadius: 99, padding: '1px 8px', fontSize: 10, fontWeight: 700,
              }}>{pendingReferrals}</span>
            )}
          </button>

          {/* Department customization toggle */}
          <details style={{ marginTop: 8 }}>
            <summary style={{
              fontSize: 11, fontWeight: 700, color: 'var(--muted)',
              cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
            }}>⚙️ Customize {activeDepartments.length} depts</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, maxHeight: 200, overflowY: 'auto' }}>
              {DEPARTMENTS.map(d => (
                <label key={d.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                  fontSize: 12, cursor: 'pointer', borderRadius: 6, color: 'var(--text)',
                }}>
                  <input
                    type="checkbox"
                    checked={activeDepartments.includes(d.id)}
                    onChange={() => toggleDepartment(d.id)}
                    style={{ accentColor: d.color }}
                  />
                  <span>{d.icon}</span>
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        {/* ── RIGHT: PATIENT REGISTRY ── */}
        <div style={{
          flex: 1, background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minWidth: 0,
        }}>
          {/* Registry header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>🛤️ Patient Registry</span>
              <span style={{
                background: 'rgba(15,118,110,.08)', color: '#0F766E',
                borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '2px 8px',
              }}>{deduplicatedPatients.length} unique · {activeCount} active</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <QuickActionButton icon="🔔" label="Alerts" count={unreadAlerts} color="#e53e3e"
                onClick={() => navigateTo('alerts')} />
              <QuickActionButton icon="📋" label="Referrals" count={pendingReferrals} color="#d69e2e"
                onClick={() => navigateTo('referrals')} />
              <QuickActionButton icon="🛠️" label="Tools" color="#d69e2e"
                onClick={() => navigateTo('tools')} />
              <QuickActionButton icon="🗂️" label="Dockets" color="#5a67d8"
                onClick={() => navigateTo('docket')} />
              <button onClick={() => navigateTo('enroll')} style={{
                padding: '7px 16px', background: 'linear-gradient(135deg,#0F766E,#06b6d4)',
                color: '#fff', border: 'none', borderRadius: 9, fontSize: 12,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                ➕ Enrol Patient
              </button>
            </div>
          </div>

          {/* Pathway filter chips */}
          {pathwayCounts.length > 0 && (
            <div style={{
              padding: '8px 18px', borderBottom: '1px solid var(--border)',
              display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto',
            }}>
              <button onClick={() => setActivePathwayFilter('all')} style={pathwayChipStyle(activePathwayFilter === 'all', '#0F766E', 'rgba(15,118,110,0.08)')}>
                📊 All
              </button>
              {pathwayCounts.slice(0, 10).map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePathwayFilter(activePathwayFilter === p.id ? 'all' : p.id)}
                  style={pathwayChipStyle(activePathwayFilter === p.id, p.color, p.colorDim)}
                >
                  {p.icon} {p.label} <span style={{
                    background: activePathwayFilter === p.id ? p.color : 'var(--bg)',
                    color: activePathwayFilter === p.id ? '#fff' : 'var(--muted)',
                    borderRadius: 99, padding: '0 6px', fontSize: 9, fontWeight: 700, marginLeft: 3,
                  }}>{p.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Patient cards */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            {filteredPatients.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🛤️</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                  {deduplicatedPatients.length === 0 ? 'No patients enrolled yet' : 'No matches found'}
                </div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>
                  {deduplicatedPatients.length === 0 ? 'Click "Enrol Patient" to begin structured care.' : 'Try a different filter.'}
                </div>
                {deduplicatedPatients.length === 0 && (
                  <button onClick={() => navigateTo('enroll')} style={{
                    background: '#0F766E', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>➕ Enrol First Patient</button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredPatients.map(dp => {
                  const mainEnrollment = dp.enrollments[0];
                  const pathways = dp.enrollments.map(e => getPathwayById(e.pathwayId)).filter(Boolean) as PathwayDef[];
                  const highestRisk = dp.enrollments.reduce((max, e) => {
                    const levels: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
                    const currentVal = levels[e.riskLevel || ''] || 0;
                    const maxVal = levels[max || ''] || 0;
                    return currentVal > maxVal ? e.riskLevel || max : max;
                  }, undefined as string | undefined);
                  const activeEnrollments = dp.enrollments.filter(e => e.status === 'active');
                  const lastReview = dp.enrollments.reduce((latest, e) => {
                    if (!e.lastReview) return latest;
                    const t = e.lastReview?.toDate ? e.lastReview.toDate() : new Date(e.lastReview);
                    return !latest || t > latest ? t : latest;
                  }, null as Date | null);

                  return (
                    <div
                      key={dp.patientId}
                      onClick={() => navigateTo('patient', { patientId: dp.patientId })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', background: 'var(--white)',
                        border: '1.5px solid var(--border)', borderRadius: 12,
                        cursor: 'pointer', transition: 'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#0F766E40'; e.currentTarget.style.background = 'rgba(15,118,110,.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 11,
                        background: `linear-gradient(135deg, ${pathways[0]?.color || '#0F766E'}, ${pathways[0]?.color || '#0F766E'}99)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, flexShrink: 0,
                      }}>{pathways[0]?.icon || '🩺'}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{dp.patientName}</span>
                          <span style={{
                            fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)',
                            background: 'var(--bg)', padding: '1px 6px', borderRadius: 4,
                          }}>{dp.patientIdCode || (dp.patientId && dp.patientId.slice(0, 8).toUpperCase()) || 'AMX-???'}</span>
                          {dp.sex && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{dp.sex}/{dp.age || '?'}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {pathways.slice(0, 3).map(pw => (
                            <span key={pw.id} style={{
                              background: pw.colorDim, color: pw.color,
                              borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                            }}>{pw.icon} {pw.label}</span>
                          ))}
                          {pathways.length > 3 && (
                            <span style={{
                              background: 'var(--bg)', color: 'var(--muted)',
                              borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                            }}>+{pathways.length - 3}</span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--mono)', color: '#0F766E' }}>
                            {activeEnrollments.length}
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active</div>
                        </div>
                        {highestRisk && (
                          <span style={{
                            background: RISK_COLORS_DIM[highestRisk as keyof typeof RISK_COLORS_DIM] || 'var(--bg)',
                            color: RISK_COLORS[highestRisk as keyof typeof RISK_COLORS] || 'var(--text)',
                            borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                          }}>{highestRisk.toUpperCase()}</span>
                        )}
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                          {lastReview ? fmtDate(lastReview) : '—'}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); if (dp.patientId) navigateTo('patient', { patientId: dp.patientId }); }}
                          style={{ background: pathways[0]?.colorDim || 'rgba(15,118,110,.08)', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: pathways[0]?.color || '#0F766E', fontFamily: 'var(--font)' }}
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RECENT ALERTS BAR ── */}
      {recentAlerts.length > 0 && currentView === 'registry' && (
        <div style={{
          flexShrink: 0, background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 16 }}>🔔</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {unreadAlerts} new
          </span>
          <div style={{ display: 'flex', gap: 10, overflow: 'hidden', flex: 1 }}>
            {recentAlerts.slice(0, 3).map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 10px', background: 'var(--bg)', borderRadius: 8,
                fontSize: 12, cursor: 'pointer', flexShrink: 0,
              }} onClick={() => navigateTo('alerts')}>
                <span style={{ color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--mono)' }}>
                  {fmtDateTime(a.createdAt)}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{a.title}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigateTo('alerts')} style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text)',
          }}>View All</button>
        </div>
      )}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function pathwayChipStyle(active: boolean, color: string, colorDim: string): React.CSSProperties {
  return {
    padding: '5px 12px', border: 'none', borderRadius: 99, cursor: 'pointer',
    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)',
    background: active ? color : colorDim,
    color: active ? '#fff' : color,
    whiteSpace: 'nowrap', transition: 'all .12s',
  };
}

function QuickActionButton({ icon, label, count, color, onClick }: {
  icon: string; label: string; count?: number; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', padding: '7px 12px',
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      fontFamily: 'var(--font)', color, display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {icon} {label}
      {count != null && count > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5,
          background: color, color: '#fff', borderRadius: '50%',
          width: 18, height: 18, fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{count}</span>
      )}
    </button>
  );
}


