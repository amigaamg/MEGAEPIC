'use client';

import { useState } from 'react';
import { Brain, ShieldAlert } from 'lucide-react';
import { FacilityAdministrationEngine, type FacilityAdminModel } from '@/lib/amexan/facility';
import { C, Card, Kpi, NumberFields } from '../ui';

// Center 15 — Clinical Intelligence. The administrator OBSERVES Clinical
// Intelligence; it never overrides contextual reasoning (constitutionally
// preserved). It views AI usage, decision support, protocol compliance,
// recommendations, missed opportunities, and knowledge updates.

export function IntelligenceCenter({ model, onPatch }: { model: FacilityAdminModel; onPatch: (patch: any) => void }) {
  const snaps = FacilityAdministrationEngine.getClinicalIntelligence(model);
  const fields = [
    { id: 'aiUsageCount', label: 'AI Usage', value: snaps.aiUsageCount },
    { id: 'decisionSupportCount', label: 'Decision Support', value: snaps.decisionSupportCount },
    { id: 'protocolCompliancePercent', label: 'Protocol Compliance %', value: snaps.protocolCompliancePercent },
    { id: 'clinicalRecommendations', label: 'Clinical Recommendations', value: snaps.clinicalRecommendations },
    { id: 'missedOpportunities', label: 'Missed Opportunities', value: snaps.missedOpportunities },
    { id: 'knowledgeUpdates', label: 'Knowledge Updates', value: snaps.knowledgeUpdates },
    { id: 'newGuidelines', label: 'New Guidelines', value: snaps.newGuidelines },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={S_banner}>
        <Brain size={15} color={C.purple} /> Clinical Intelligence is observation-only. AMEXAN's contextual reasoning is never overridden.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="AI Usage" value={snaps.aiUsageCount} color={C.purple} />
        <Kpi label="Protocol Compliance" value={`${snaps.protocolCompliancePercent}%`} accent={snaps.protocolCompliancePercent > 80 ? 'green' : snaps.protocolCompliancePercent > 50 ? 'amber' : 'red'} />
        <Kpi label="Recommendations" value={snaps.clinicalRecommendations} />
        <Kpi label="Missed Opportunities" value={snaps.missedOpportunities} accent="amber" />
        <Kpi label="Knowledge Updates" value={snaps.knowledgeUpdates} color={C.sky} />
      </div>
      <NumberFields
        title="Clinical Intelligence Snapshot"
        sub="AI usage, decision support, protocol compliance, recommendations, missed opportunities, knowledge updates, new guidelines."
        fields={fields}
        onSave={(patch) => onPatch(patch)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: '#f0f4fa', color: C.slate }}>
        <ShieldAlert size={15} /> <span>Runtime intelligence is computed by the engine; counters above reflect observed activity and are tracked for governance.</span>
      </div>
    </div>
  );
}

const S_banner = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: '#f0f4fa', color: C.slate };