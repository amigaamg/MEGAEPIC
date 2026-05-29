'use client';
import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EncounterLayout } from '@/src/ui/layouts/EncounterLayout';
import { PhaseRenderer } from '@/src/ui/encounter/PhaseRenderer';
import { useEncounterState } from '@/src/ui/encounter/useEncounterState';
import { useEncounterRealtime } from '@/src/ui/encounter/useEncounterRealtime';
import { getDepartment, getUnit } from '@/lib/workspaceData';
import { ENCOUNTER_LABELS, ENCOUNTER_PHASES, type EncounterType, type AIInsight } from '@/lib/encounterTypes';
import { createEncounter } from '@/lib/firebase/encounterService';
import { runInference, getSeverity } from '@/src/engine/inference/scorer';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/authService';


const PHASE_LABELS: Record<string, string> = {
  registration: 'Registration', triage: 'Triage', abcde: 'ABCDE Assessment',
  presenting_complaint: 'Presenting Complaint', hpi: 'HPI', systems_review: 'Review of Systems',
  pmh: 'PMH', drug_allergy: 'Drug & Allergy', social_history: 'Social History',
  examination: 'Examination', scores: 'Bedside Scores', ddx: 'Differential Diagnosis',
  investigations: 'Investigations', imaging: 'Imaging', procedures: 'Procedures',
  treatment: 'Treatment', progress: 'Progress Notes', team_comm: 'Team Communication',
  disposition: 'Disposition', follow_up: 'Follow-up Plan', audit: 'Analytics & Audit',
};

export default function EncounterPage() {
  const raw = useParams();
  const params = raw || {};
  const router = useRouter();
  const { user, loading } = useAuth();
  const deptKey = typeof params.dept === 'string' ? params.dept.toUpperCase() : '';
  const unitId = typeof params.unit === 'string' ? params.unit : '';
  const encType = typeof params.encounterType === 'string' ? params.encounterType : '';
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const createdRef = useRef(false);

  useEffect(() => { if (!loading && !user) router.replace('/clinical-auth'); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(p => {
      if (!p) return;
      const oid = (p as any).activeOrganizationId || (p as any).organizations?.[0];
      if (oid) setOrgId(oid);
    });
  }, [user]);

  useEffect(() => {
    if (!orgId || !deptKey || !unitId || !encType || createdRef.current) return;
    createdRef.current = true;
    const oid = orgId;
    const id = `${deptKey}-${unitId}-${encType}-${Date.now()}`;
    setEncounterId(id);
    createEncounter({
      patientId: 'new',
      patientName: 'New Patient',
      departmentId: deptKey,
      unitId,
      encounterType: encType as EncounterType,
      status: 'active',
      createdBy: user?.uid || '',
      activePhase: (ENCOUNTER_PHASES[encType] || [])[0] || 'triage',
      completedPhases: [],
      diagnosis: [],
      clinicianNotes: '',
    }, oid).then((realId) => {
      setEncounterId(realId);
    }).catch(() => {
      // fallback to synthetic ID if creation fails
    });
  }, [orgId, deptKey, unitId, encType, user]);

  if (loading || !user) return null;

  const dept = getDepartment(deptKey);
  const unit = getUnit(deptKey, unitId);
  const isValidEncounter = Object.keys(ENCOUNTER_LABELS).includes(encType);
  const eid = encounterId || `${deptKey}-${unitId}-${encType}-live`;

  const store = useEncounterState();
  const { form, activePhase, completedPhases, events, insights, setActivePhase, completePhase, addEvent, setInsights, setField, addInsight } = store;

  const actorName = user?.displayName || `Dr. ${user?.email?.split('@')[0] || 'Unknown'}`;

  const { isLive, error, addLiveEvent, changePhase } = useEncounterRealtime({
    deptId: deptKey,
    unitId,
    encounterId: eid,
    actorName,
    actorRole: 'doctor',
    orgId: orgId || undefined,
  });

  useEffect(() => {
    if (encType && isValidEncounter) {
      store.setEncounterType(encType as EncounterType);
      store.setDepartment(deptKey);
      store.setUnit(unitId);
      if (events.length === 0) {
        addLiveEvent({ type: 'note_added', description: `Encounter started: ${unit?.label || unitId} — ${encType.replace(/_/g, ' ')}` });
        const firstPhase = (ENCOUNTER_PHASES[encType as EncounterType] || [])[0];
        if (firstPhase) setActivePhase(firstPhase);
      }
    }
  }, [encType, isValidEncounter]);

  useEffect(() => {
    const diff = runInference(form);
    const sev = getSeverity(form);
    const newInsights: AIInsight[] = [];

    if (sev && sev.level !== 'normal' && sev.level !== 'unknown') {
      newInsights.push({
        id: `ins-sev-${Date.now()}`, type: 'alert', timestamp: Date.now(),
        severity: sev.level === 'emergency' ? 'critical' : 'warning',
        title: `${sev.level === 'emergency' ? '🚨 ' : '⚠ '}Severity: ${sev.msg}`,
        description: `Patient acuity flagged as ${sev.level}`,
        acknowledged: false, source: 'AMEXAN Engine',
      });
    }

    diff.slice(0, 4).forEach((d, i) => {
      newInsights.push({
        id: `ins-dd-${i}-${Date.now()}`, type: 'differential', timestamp: Date.now(),
        severity: 'info',
        title: d.disease.name,
        description: `${Math.round(d.probability * 100)}% probability`,
        acknowledged: false, source: 'AMEXAN Engine',
      });
    });

    if (diff.length > 0 && diff[0].disease.investigations) {
      const invs = diff[0].disease.investigations.slice(0, 4) as unknown as string[];
      invs.forEach((inv, i) => {
        newInsights.push({
          id: `ins-inv-${i}-${Date.now()}`, type: 'suggestion', timestamp: Date.now(),
          severity: 'info', title: String(inv), description: `Suggested for ${diff[0].disease.name}`,
          acknowledged: false, source: 'AMEXAN Engine',
        });
      });
    }

    if (newInsights.length > 0) setInsights(newInsights);
  }, [form.complaints, form.hpi]);

  const handlePhaseChange = useCallback((phaseId: string) => {
    changePhase(phaseId);
  }, [changePhase]);

  const handleBack = useCallback(() => {
    router.push(`/workspace/${deptKey}/${unitId}`);
  }, [router, deptKey, unitId]);

  if (!dept || !unit || !isValidEncounter) {
    return (
      <div style={{ padding: '80px 5%', textAlign: 'center', background: '#070B14', minHeight: '100vh', color: '#94A3B8' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
        <h2 style={{ color: '#E2E8F0', marginBottom: 8 }}>Encounter Not Found</h2>
        <p style={{ marginBottom: 24, fontSize: '.875rem' }}>
          {!dept ? `Department "${deptKey}" not found.` : !unit ? `Unit "${unitId}" not found.` : `Encounter type "${encType}" invalid.`}
        </p>
        <button onClick={() => router.push('/workspace')} style={{
          padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
          background: 'rgba(255,255,255,.04)', color: '#E2E8F0', cursor: 'pointer', fontSize: '.875rem', fontFamily: 'Inter, sans-serif',
        }}>← Back to Workspace Hub</button>
      </div>
    );
  }

  const encLabel = ENCOUNTER_LABELS[encType as EncounterType];

  return (
    <EncounterLayout
      encounterType={encType as EncounterType}
      departmentLabel={dept.label}
      departmentColor={dept.color}
      unitLabel={unit.label}
      patientName={store.patientName || 'New Patient'}
      userRole="doctor"
      activePhase={activePhase}
      onPhaseChange={handlePhaseChange}
      completedPhases={completedPhases}
      events={events}
      insights={insights}
      onBack={handleBack}
      isLive={isLive}
    >
      <PhaseRenderer phaseId={activePhase} store={store} departmentColor={dept.color} />
    </EncounterLayout>
  );
}
