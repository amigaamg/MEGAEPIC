import type {
  EncounterBrainState,
  DocumentationGraph,
  DocNode,
  DocNodeType,
  SymptomObject,
  SymptomAttribute,
  HealthSeekingStep,
} from '../encounter-brain/types';

function createDocNode(
  type: DocNodeType,
  label: string,
  content: string,
  order: number,
  complete: boolean,
  children: string[] = [],
  parentId?: string,
  sourceFacts: string[] = [],
): DocNode {
  return { id: type, type, label, content, order, complete, children, parentId, sourceFacts };
}

function getNode(nodes: DocNode[], type: DocNodeType): DocNode | undefined {
  return nodes.find(n => n.type === type);
}

function getPrimarySymptom(brain: EncounterBrainState): SymptomObject | null {
  if (!brain.primarySymptomId) return null;
  return brain.symptoms[brain.primarySymptomId] ?? null;
}

function getAttr(symptom: SymptomObject, featureId: string): SymptomAttribute | undefined {
  return Object.values(symptom.attributes).find(a => a.featureId === featureId);
}

function getAttrStr(symptom: SymptomObject, featureId: string): string {
  const attr = getAttr(symptom, featureId);
  return attr?.value != null ? String(attr.value) : '';
}

function presentFacts(symptom: SymptomObject): string[] {
  return Object.values(symptom.attributes).filter(a => a.polarity === 'present').map(a => a.featureId);
}

function absentFacts(symptom: SymptomObject): string[] {
  return Object.values(symptom.attributes).filter(a => a.polarity === 'absent').map(a => a.featureId);
}

function getTimelineNodeContent(brain: EncounterBrainState): string {
  if (brain.timeline.length === 0) return 'No timeline events recorded.';
  const parts: string[] = [];
  for (const event of brain.timeline) {
    switch (event.eventType) {
      case 'symptom_onset': parts.push(`Symptoms began ${event.date}.`); break;
      case 'symptom_change': parts.push(`Symptoms changed: ${event.description} (${event.date}).`); break;
      case 'self_medication': parts.push(`Patient self-medicated with ${event.treatment || 'unknown'} at home.`); break;
      case 'pharmacy_visit': parts.push(`Visited pharmacy — received ${event.treatment || 'treatment'}.`); break;
      case 'clinic_visit': parts.push(`Attended ${event.facility || 'a clinic'} — evaluated.`); break;
      case 'health_centre_visit': parts.push(`Attended ${event.facility || 'a health centre'} — evaluated.`); break;
      case 'hospital_visit': parts.push(`Presented to ${event.facility || 'hospital'} — evaluated.`); break;
      case 'admission': parts.push(`Admitted to ${event.facility || 'hospital'} on ${event.date}.`); break;
      case 'discharge': parts.push(`Discharged from ${event.facility || 'hospital'} on ${event.date}.`); break;
      case 'referral': parts.push(`Referred from ${event.facility || 'previous facility'} — ${event.description || 'reason not documented'}.`); break;
      case 'transfer': parts.push(`Transferred from ${event.facility || 'previous facility'} — ${event.description || 'reason not documented'}.`); break;
      case 'investigation': parts.push(`Investigation: ${event.description}.`); break;
      case 'diagnosis': parts.push(`Diagnosed with ${event.description}.`); break;
      case 'treatment': parts.push(`Treated with ${event.description}.`); break;
      case 'procedure':
      case 'surgery': parts.push(`${event.eventType === 'surgery' ? 'Surgery' : 'Procedure'}: ${event.description}.`); break;
      case 'complication': parts.push(`Complication: ${event.description}.`); break;
      case 'milestone': parts.push(`Milestone: ${event.description}.`); break;
      case 'follow_up': parts.push(`Follow-up: ${event.description}.`); break;
      default: parts.push(event.description);
    }
  }
  return parts.join(' ');
}

function buildNodeContent(type: DocNodeType, brain: EncounterBrainState): string {
  const p = brain.patient;
  const e = brain.encounter;
  const primary = getPrimarySymptom(brain);

  switch (type) {
    case 'context': {
      const parts: string[] = [];
      const cc = primary?.label ?? 'unknown complaint';
      if (p.ageYears || p.ageMonths) {
        const ageStr = p.ageMonths < 12
          ? `${p.ageMonths}-month-old`
          : `${Math.floor(p.ageYears + p.ageMonths / 12)}-year-old`;
        parts.push(`A ${ageStr} ${p.sex ?? 'patient'}`);
      } else {
        parts.push('A patient');
      }
      const chronicNames = Object.values(brain.chronicDiseases).map(cd => cd.diseaseName);
      if (chronicNames.length > 0) parts.push(`with known ${chronicNames.join(', ')}`);
      parts.push(`presents with ${cc}.`);
      if (e.referralStatus && e.referralStatus !== 'self') parts.push(`This is a ${e.referralStatus} patient.`);
      if (e.isPostoperative && brain.postOperativeState) {
        parts.push(`Post-operative day ${brain.postOperativeState.postOpDay} after ${brain.postOperativeState.operationPerformed}.`);
      }
      return parts.join(' ');
    }

    case 'illness_context': {
      const parts: string[] = [];
      if (e.referralStatus && e.referralStatus !== 'self') {
        if (e.referralReason) parts.push(`Referred due to: ${e.referralReason}.`);
        if (e.referringFacility) parts.push(`Referring facility: ${e.referringFacility}.`);
        if (e.referringClinician) parts.push(`Referring clinician: ${e.referringClinician}.`);
      }
      const chronicNames = Object.values(brain.chronicDiseases).map(cd => cd.diseaseName);
      if (chronicNames.length > 0) parts.push(`Known chronic conditions: ${chronicNames.join(', ')}.`);
      if (e.isPostoperative && brain.postOperativeState) {
        parts.push(`Currently on post-operative day ${brain.postOperativeState.postOpDay} following ${brain.postOperativeState.operationPerformed}.`);
      }
      if (e.isTrauma && e.traumaMechanism) parts.push(`Trauma mechanism: ${e.traumaMechanism}.`);
      return parts.length > 0 ? parts.join(' ') : 'No additional illness context recorded.';
    }

    case 'timeline':
      return getTimelineNodeContent(brain);

    case 'pain_history': {
      if (!primary) return 'Primary symptom not yet characterized.';
      const parts: string[] = [];
      const onset = getAttrStr(primary, 'pain_onset');
      const initLoc = getAttrStr(primary, 'pain_initial_location');
      const currLoc = getAttrStr(primary, 'pain_location_now');
      const migration = getAttrStr(primary, 'pain_migration');
      const character = getAttrStr(primary, 'pain_character');
      const radiation = getAttrStr(primary, 'pain_radiation');
      const severity = getAttrStr(primary, 'pain_severity');
      const tempPattern = getAttrStr(primary, 'pain_temporal_pattern');
      const worsening = getAttrStr(primary, 'pain_worsening_factors');
      const relieving = getAttrStr(primary, 'pain_relieving_factors');

      if (onset) parts.push(`The ${primary.label} began ${onset}.`);
      if (initLoc) parts.push(`It was initially felt in the ${initLoc.toLowerCase()}.`);
      if (migration) parts.push(`The pain ${migration.toLowerCase()}.`);
      if (currLoc) parts.push(`It is now located in the ${currLoc.toLowerCase()}.`);

      if (character) {
        const val = character.toLowerCase();
        if (val.includes('colicky') || val.includes('cramp')) {
          parts.push('The pain is colicky (wavelike), consistent with hollow viscus obstruction.');
        } else if (val.includes('tearing') || val.includes('ripping')) {
          parts.push('The pain is tearing in nature, raising concern for a vascular catastrophe.');
        } else if (val.includes('sharp') || val.includes('stabb')) {
          parts.push('The pain is sharp and constant, suggesting inflammation or ischaemia.');
        } else if (val.includes('burn')) {
          parts.push('The pain is burning in quality, suggestive of peptic or mucosal inflammation.');
        } else {
          parts.push(`The pain is described as ${val}.`);
        }
      }

      if (radiation && radiation.toLowerCase() !== 'no radiation') {
        const radVal = radiation.toLowerCase();
        if (radVal.includes('back')) {
          parts.push('It radiates to the back, characteristic of pancreatic or retroperitoneal pathology.');
        } else if (radVal.includes('shoulder')) {
          parts.push('It radiates to the shoulder, suggesting diaphragmatic irritation.');
        } else if (radVal.includes('groin')) {
          parts.push('It radiates to the groin, typical of ureteric colic.');
        } else {
          parts.push(`It radiates ${radVal}.`);
        }
      }

      if (severity) {
        const s = parseInt(severity);
        if (s >= 8) parts.push(`The pain is severe (${s}/10), out of proportion to clinical findings in some contexts.`);
        else if (s >= 5) parts.push(`The pain is moderate to severe (${s}/10).`);
        else if (s >= 1) parts.push(`The pain is mild (${s}/10).`);
      }

      if (tempPattern) parts.push(`Temporal pattern: ${tempPattern.toLowerCase()}.`);
      if (worsening) parts.push(`Aggravated by ${worsening.toLowerCase()}.`);
      if (relieving) parts.push(`Relieved by ${relieving.toLowerCase()}.`);

      return parts.length > 0 ? parts.join(' ') : 'Pain history not yet characterized.';
    }

    case 'symptom_cluster': {
      const nonPrimary = Object.values(brain.symptoms).filter(s => !s.isPrimary && s.present);
      if (nonPrimary.length === 0) return 'No associated symptoms recorded.';
      const parts: string[] = [];
      for (const symptom of nonPrimary) {
        const descriptors: string[] = [symptom.label];
        for (const attr of Object.values(symptom.attributes)) {
          if (attr.polarity !== 'present') continue;
          const val = String(attr.value).toLowerCase();
          if (val && val !== 'true' && val !== 'yes') descriptors.push(val);
        }
        parts.push(descriptors.join(', ') + '.');
      }
      return parts.join(' ');
    }

    case 'important_negatives': {
      const lines: string[] = [];
      if (primary) {
        const absentFeatures: string[] = [];
        for (const attr of Object.values(primary.attributes)) {
          if (attr.polarity === 'absent') absentFeatures.push(attr.label.toLowerCase());
        }
        if (absentFeatures.length > 0) lines.push(`The patient denies ${absentFeatures.join(', ')}.`);
      }
      const diseaseStates = Object.values(brain.diseaseStates);
      for (const ds of diseaseStates.slice(0, 3)) {
        for (const ev of ds.againstEvidence) {
          lines.push(`Absence of ${ev.featureId.replace(/_/g, ' ')} makes ${ds.diseaseName} significantly less likely.`);
        }
      }
      return lines.length > 0 ? lines.join(' ') : 'Important negatives not yet assessed.';
    }

    case 'health_seeking': {
      const hsj = brain.healthSeekingJourney;
      if (!hsj || hsj.steps.length === 0) return 'Health seeking journey not yet recorded.';
      const parts: string[] = [];
      for (const step of hsj.steps) {
        const detail = step.facilityName ? `${step.actionType} at ${step.facilityName}` : `${step.actionType}`;
        parts.push(detail + (step.response ? ` (${step.response})` : ''));
      }
      return `The patient sought care through ${hsj.steps.length} step(s): ${parts.join('; ')}.`;
    }

    case 'functional_impact': {
      const fs = brain.functionalStatus;
      if (!fs) return 'Functional impact not yet assessed.';
      const parts: string[] = [];
      if (fs.workImpact) parts.push(`Work impact: ${fs.workImpact}`);
      if (fs.overallImpact) parts.push(`Overall functional impact: ${fs.overallImpact}`);
      if (fs.schoolAttendance) parts.push(`School attendance: ${fs.schoolAttendance}`);
      const adls = fs.dailyActivities.filter(a => a.independence !== 'unknown');
      for (const adl of adls) {
        parts.push(`${adl.domain}: ${adl.independence}${adl.details ? ` (${adl.details})` : ''}`);
      }
      if (parts.length === 0) return 'Functional impact assessed but details not available.';
      return parts.join('; ') + '.';
    }

    case 'risk_factors': {
      const parts: string[] = [];
      if (primary) {
        const riskFeatureIds = [
          'smoking', 'alcohol_use', 'nsaid_use', 'steroid_use', 'prior_abdominal_surgery',
          'known_gallstones', 'anticoagulant_use', 'recent_travel', 'family_history_gi_cancer',
          'diabetes', 'htn_cad',
        ];
        for (const fid of riskFeatureIds) {
          const attr = getAttr(primary, fid);
          if (attr?.polarity === 'present') {
            const val = String(attr.value).toLowerCase();
            if (fid === 'alcohol_use' && !val.includes('heavy') && !val.includes('daily')) continue;
            parts.push(attr.label.toLowerCase());
          }
        }
      }
      for (const cd of Object.values(brain.chronicDiseases)) parts.push(`known ${cd.diseaseName}`);
      return parts.length > 0 ? `Relevant risk factors include ${parts.join(', ')}.` : 'Risk factors not yet assessed.';
    }

    case 'chronic_disease_context': {
      const cds = Object.values(brain.chronicDiseases);
      if (cds.length === 0) return 'No known chronic diseases.';
      const parts: string[] = [];
      for (const cd of cds) {
        let desc = `${cd.diseaseName} (diagnosed ${cd.diagnosisYear})`;
        if (cd.currentControl) desc += ` — ${cd.currentControl.replace(/_/g, ' ')}`;
        if (cd.medications.length > 0) {
          desc += `. Medications: ${cd.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join(', ')}`;
        }
        if (cd.compliance) desc += `. Compliance: ${cd.compliance}`;
        if (cd.complications.length > 0) {
          desc += `. Complications: ${cd.complications.map(c => c.complication).join(', ')}`;
        }
        parts.push(desc);
      }
      return parts.join('\n');
    }

    case 'surgical_context': {
      const parts: string[] = [];
      const pos = brain.postOperativeState;
      if (pos) {
        parts.push(`Post-operative day ${pos.postOpDay} after ${pos.operationPerformed} (performed ${pos.operationDate}). Anaesthesia: ${pos.anaesthesia}.`);
        parts.push(`Wound status: ${pos.woundStatus.replace(/_/g, ' ')}. Pain control: ${pos.painControl.replace(/_/g, ' ')}.`);
        parts.push(`Ambulation: ${pos.ambulation.replace(/_/g, ' ')}. Feeding: ${pos.feeding.replace(/_/g, ' ')}.`);
        parts.push(`Urination: ${pos.urination.replace(/_/g, ' ')}.`);
        if (pos.flatus !== 'unknown') parts.push(`Flatus: ${pos.flatus.replace(/_/g, ' ')}.`);
        if (pos.bowelMotion !== 'unknown') parts.push(`Bowel motion: ${pos.bowelMotion.replace(/_/g, ' ')}.`);
        if (pos.complications.length > 0) parts.push(`Complications: ${pos.complications.join(', ')}.`);
        if (pos.dvtProphylaxis) parts.push('DVT prophylaxis in place.');
        if (pos.antibiotics) parts.push('Antibiotics in use.');
        if (pos.fever) parts.push('Fever present.');
      }
      const prevSurgeries = brain.previousSurgeries;
      if (prevSurgeries.length > 0) {
        parts.push('Previous surgeries:');
        for (const surg of prevSurgeries) {
          parts.push(`- ${surg.procedureName} (${surg.date}) at ${surg.facility}. Indication: ${surg.indication}. Approach: ${surg.approach}.`);
        }
      }
      return parts.length > 0 ? parts.join(' ') : 'No surgical context recorded.';
    }

    case 'summary': {
      const parts: string[] = [];
      parts.push(buildNodeContent('context', brain));
      if (primary) {
        const onset = getAttrStr(primary, 'pain_onset');
        const duration = getAttrStr(primary, 'pain_duration_days');
        if (onset) {
          parts.push(`The ${primary.label} began ${onset}${duration ? ` for ${duration} days` : ''}.`);
        }
      }
      if (brain.leadingDiseaseId && brain.diseaseStates[brain.leadingDiseaseId]) {
        const lead = brain.diseaseStates[brain.leadingDiseaseId];
        parts.push(`Leading differential: ${lead.diseaseName} at ${Math.round(lead.currentProb * 100)}% probability.`);
      }
      return parts.join(' ');
    }

    case 'differential_summary': {
      const sorted = Object.values(brain.diseaseStates).sort((a, b) => b.currentProb - a.currentProb);
      if (sorted.length === 0) return 'No differential diagnoses generated.';
      const lines: string[] = ['Differential diagnosis, ranked by probability:'];
      for (let i = 0; i < sorted.length; i++) {
        const ds = sorted[i];
        const prob = Math.round(ds.currentProb * 100);
        const flags: string[] = [];
        if (ds.supportingEvidence.length > 0) flags.push('supported');
        if (ds.againstEvidence.length > 0) flags.push('evidence against');
        if (ds.redFlagTriggered) flags.push('RED FLAG');
        if (ds.mustNotMiss) flags.push('MUST NOT MISS');
        lines.push(`  ${i + 1}. ${ds.diseaseName} (${prob}%) — ${flags.join(', ') || 'under evaluation'}`);
      }
      return lines.join('\n');
    }

    case 'plan_summary': {
      const parts: string[] = [];
      if (brain.leadingDiseaseId && brain.diseaseStates[brain.leadingDiseaseId]) {
        parts.push(`Working diagnosis: ${brain.diseaseStates[brain.leadingDiseaseId].diseaseName}.`);
      }
      const critical = Object.values(brain.diseaseStates).filter(d => d.dangerLevel === 'critical' || d.dangerLevel === 'high');
      if (critical.length > 0) parts.push('Urgent intervention required for critical differentials.');
      parts.push('Awaiting further investigations and clinical correlation.');
      return parts.join(' ');
    }
  }
}

function buildSourceFacts(type: DocNodeType, brain: EncounterBrainState): string[] {
  const primary = getPrimarySymptom(brain);

  switch (type) {
    case 'context': {
      const facts: string[] = ['patient_age', 'patient_sex'];
      if (Object.keys(brain.chronicDiseases).length > 0) facts.push('chronic_disease');
      if (brain.encounter.referralStatus !== 'self') facts.push('referral_status');
      if (brain.encounter.isPostoperative) facts.push('postoperative_state');
      return facts;
    }
    case 'illness_context': {
      const facts: string[] = [];
      if (brain.encounter.referralReason) facts.push('referral_reason');
      if (Object.keys(brain.chronicDiseases).length > 0) facts.push('chronic_disease');
      if (brain.encounter.isPostoperative) facts.push('postoperative_state');
      if (brain.encounter.isTrauma) facts.push('trauma_mechanism');
      return facts;
    }
    case 'timeline':
      return brain.timeline.map(e => `tl_${e.eventType}_${e.id}`);
    case 'pain_history': {
      if (!primary) return [];
      return ['pain_onset', 'pain_initial_location', 'pain_location_now', 'pain_migration',
        'pain_character', 'pain_radiation', 'pain_severity', 'pain_temporal_pattern',
        'pain_worsening_factors', 'pain_relieving_factors',
      ].filter(fid => getAttr(primary, fid) !== undefined);
    }
    case 'symptom_cluster': {
      const facts: string[] = [];
      for (const symptom of Object.values(brain.symptoms)) {
        if (!symptom.isPrimary && symptom.present) {
          facts.push(...presentFacts(symptom));
        }
      }
      return facts;
    }
    case 'important_negatives': {
      const facts: string[] = [];
      if (primary) facts.push(...absentFacts(primary));
      for (const ds of Object.values(brain.diseaseStates)) {
        for (const ev of ds.againstEvidence) facts.push(ev.featureId);
      }
      return facts;
    }
    case 'health_seeking':
      return brain.healthSeekingJourney ? ['health_seeking_journey'] : [];
    case 'functional_impact': {
      const facts: string[] = [];
      if (brain.functionalStatus) {
        facts.push('functional_status');
        if (brain.functionalStatus.workImpact) facts.push('functional_impact_work');
        if (brain.functionalStatus.overallImpact) facts.push('functional_impact_overall');
      }
      return facts;
    }
    case 'risk_factors': {
      const facts: string[] = [];
      if (primary) {
        for (const fid of ['smoking', 'alcohol_use', 'nsaid_use', 'steroid_use', 'prior_abdominal_surgery',
          'known_gallstones', 'anticoagulant_use', 'recent_travel', 'family_history_gi_cancer',
          'diabetes', 'htn_cad']) {
          if (getAttr(primary, fid)) facts.push(fid);
        }
      }
      for (const cdId of Object.keys(brain.chronicDiseases)) facts.push(`chronic_${cdId}`);
      return facts;
    }
    case 'chronic_disease_context':
      return Object.keys(brain.chronicDiseases).map(id => `chronic_${id}`);
    case 'surgical_context': {
      const facts: string[] = [];
      if (brain.postOperativeState) facts.push('postoperative_details');
      for (const surg of brain.previousSurgeries) facts.push(`surgery_${surg.surgeryId}`);
      return facts;
    }
    case 'summary': {
      const facts: string[] = ['patient_age', 'patient_sex'];
      if (primary) facts.push(...presentFacts(primary));
      if (brain.leadingDiseaseId) facts.push(`leading_disease_${brain.leadingDiseaseId}`);
      return facts;
    }
    case 'differential_summary':
      return Object.keys(brain.diseaseStates).map(id => `disease_${id}`);
    case 'plan_summary': {
      const facts: string[] = [];
      if (brain.leadingDiseaseId) facts.push(`leading_disease_${brain.leadingDiseaseId}`);
      for (const ds of Object.values(brain.diseaseStates)) {
        if (ds.dangerLevel === 'critical' || ds.dangerLevel === 'high') facts.push(`danger_${ds.diseaseId}`);
      }
      return facts;
    }
  }
}

function isNodeComplete(type: DocNodeType, brain: EncounterBrainState): boolean {
  switch (type) {
    case 'context': return !!(brain.patient.ageYears || brain.patient.ageMonths) && !!brain.primarySymptomId;
    case 'illness_context': return !!(brain.encounter.referralStatus && brain.encounter.referralStatus !== 'self')
      || Object.keys(brain.chronicDiseases).length > 0
      || brain.encounter.isPostoperative
      || brain.encounter.isTrauma;
    case 'timeline': return brain.timeline.length > 0;
    case 'pain_history': {
      if (!getPrimarySymptom(brain)) return false;
      const primary = getPrimarySymptom(brain)!;
      return !!getAttr(primary, 'pain_onset') || !!getAttr(primary, 'pain_character') || !!getAttr(primary, 'pain_severity');
    }
    case 'symptom_cluster': return Object.values(brain.symptoms).some(s => !s.isPrimary && s.present);
    case 'important_negatives': {
      if (getPrimarySymptom(brain)) {
        const primary = getPrimarySymptom(brain)!;
        if (Object.values(primary.attributes).some(a => a.polarity === 'absent')) return true;
      }
      return Object.values(brain.diseaseStates).some(ds => ds.againstEvidence.length > 0);
    }
    case 'health_seeking': return !!(brain.healthSeekingJourney && brain.healthSeekingJourney.steps.length > 0);
    case 'functional_impact': return !!(brain.functionalStatus && (brain.functionalStatus.workImpact || brain.functionalStatus.dailyActivities.length > 0));
    case 'risk_factors': {
      const primary = getPrimarySymptom(brain);
      if (primary) {
        const riskIds = ['smoking', 'alcohol_use', 'nsaid_use', 'prior_abdominal_surgery', 'diabetes'];
        if (riskIds.some(fid => getAttr(primary, fid)?.polarity === 'present')) return true;
      }
      return Object.keys(brain.chronicDiseases).length > 0;
    }
    case 'chronic_disease_context': return Object.keys(brain.chronicDiseases).length > 0;
    case 'surgical_context': return brain.postOperativeState !== null || brain.previousSurgeries.length > 0;
    case 'summary': return !!(brain.patient.ageYears || brain.patient.ageMonths) && !!brain.primarySymptomId;
    case 'differential_summary': return Object.keys(brain.diseaseStates).length > 0;
    case 'plan_summary': return brain.leadingDiseaseId !== null;
  }
}

const NODE_ORDER: DocNodeType[] = [
  'context',
  'illness_context',
  'chronic_disease_context',
  'surgical_context',
  'timeline',
  'pain_history',
  'symptom_cluster',
  'important_negatives',
  'health_seeking',
  'functional_impact',
  'risk_factors',
  'summary',
  'differential_summary',
  'plan_summary',
];

const NODE_LABELS: Record<DocNodeType, string> = {
  context: 'Patient Context',
  illness_context: 'Illness Context',
  timeline: 'Timeline',
  pain_history: 'Pain History',
  symptom_cluster: 'Symptom Cluster',
  important_negatives: 'Important Negatives',
  health_seeking: 'Health Seeking Journey',
  functional_impact: 'Functional Impact',
  risk_factors: 'Risk Factors',
  chronic_disease_context: 'Chronic Disease Context',
  surgical_context: 'Surgical Context',
  summary: 'Clinical Summary',
  differential_summary: 'Differential Diagnosis',
  plan_summary: 'Management Plan',
};

const NODE_CHILDREN: Partial<Record<DocNodeType, string[]>> = {
  context: ['illness_context', 'pain_history', 'timeline', 'health_seeking', 'functional_impact', 'risk_factors'],
  illness_context: ['chronic_disease_context', 'surgical_context'],
  pain_history: ['symptom_cluster', 'important_negatives'],
  summary: ['differential_summary', 'plan_summary'],
};

function getParentId(type: DocNodeType): string | undefined {
  for (const [parent, children] of Object.entries(NODE_CHILDREN)) {
    if (children.includes(type)) return parent;
  }
  return undefined;
}

export function createDocumentationGraph(): DocumentationGraph {
  return {
    encounterId: '',
    nodes: [],
    rootIds: ['context', 'summary'],
    renderedFormats: {},
    lastRendered: 0,
    owner: 'documentation_engine',
  };
}

export function buildDocNodes(brain: EncounterBrainState): DocumentationGraph {
  const nodes: DocNode[] = [];

  for (const type of NODE_ORDER) {
    const content = buildNodeContent(type, brain);
    const order = NODE_ORDER.indexOf(type);
    const complete = isNodeComplete(type, brain);
    const children = NODE_CHILDREN[type] ?? [];
    const parentId = getParentId(type);
    const sourceFacts = buildSourceFacts(type, brain);

    nodes.push(createDocNode(type, NODE_LABELS[type], content, order, complete, children, parentId, sourceFacts));
  }

  return {
    encounterId: brain.encounterId,
    nodes,
    rootIds: ['context', 'summary'],
    renderedFormats: {},
    lastRendered: Date.now(),
    owner: 'documentation_engine',
  };
}

function findNode(nodes: DocNode[], type: DocNodeType): DocNode {
  const n = nodes.find(node => node.type === type);
  return n ?? createDocNode(type, NODE_LABELS[type], '', 0, false);
}

function getNodeContent(nodes: DocNode[], type: DocNodeType): string {
  return findNode(nodes, type).content;
}

function collectDescendantContent(nodes: DocNode[], type: DocNodeType): string {
  const node = findNode(nodes, type);
  const parts: string[] = [];
  if (node.content && !node.content.endsWith('not yet') && !node.content.startsWith('No')) {
    parts.push(node.content);
  }
  for (const childId of node.children) {
    const childContent = collectDescendantContent(nodes, childId as DocNodeType);
    if (childContent) parts.push(childContent);
  }
  return parts.join('\n\n');
}

function hasContent(node: DocNode): boolean {
  return node.complete && !!node.content;
}

export function renderAdmissionNote(graph: DocumentationGraph): string {
  const { nodes } = graph;
  const lines: string[] = [];

  lines.push('ADMISSION NOTE');
  lines.push('='.repeat(60));
  lines.push('');

  const context = getNodeContent(nodes, 'context');
  if (context) {
    lines.push('Patient');
    lines.push('-'.repeat(40));
    lines.push(context);
    lines.push('');
  }

  const hpiParts: string[] = [];
  const illnessCtx = getNodeContent(nodes, 'illness_context');
  if (hasContent(findNode(nodes, 'illness_context'))) hpiParts.push(illnessCtx);

  const timeline = getNodeContent(nodes, 'timeline');
  if (hasContent(findNode(nodes, 'timeline'))) hpiParts.push(timeline);

  const painHx = getNodeContent(nodes, 'pain_history');
  if (hasContent(findNode(nodes, 'pain_history'))) hpiParts.push(painHx);

  const symptoms = getNodeContent(nodes, 'symptom_cluster');
  if (hasContent(findNode(nodes, 'symptom_cluster'))) hpiParts.push(symptoms);

  const negatives = getNodeContent(nodes, 'important_negatives');
  if (hasContent(findNode(nodes, 'important_negatives'))) hpiParts.push(`Important negatives: ${negatives}`);

  const healthSeeking = getNodeContent(nodes, 'health_seeking');
  if (hasContent(findNode(nodes, 'health_seeking'))) hpiParts.push(healthSeeking);

  const functional = getNodeContent(nodes, 'functional_impact');
  if (hasContent(findNode(nodes, 'functional_impact'))) hpiParts.push(functional);

  const risk = getNodeContent(nodes, 'risk_factors');
  if (hasContent(findNode(nodes, 'risk_factors'))) hpiParts.push(risk);

  if (hpiParts.length > 0) {
    lines.push('History of Presenting Illness');
    lines.push('-'.repeat(40));
    lines.push(hpiParts.join('\n\n'));
    lines.push('');
  }

  const pmh = getNodeContent(nodes, 'chronic_disease_context');
  const surgCtx = getNodeContent(nodes, 'surgical_context');
  const pmhParts: string[] = [];
  if (hasContent(findNode(nodes, 'chronic_disease_context'))) pmhParts.push(pmh);
  if (hasContent(findNode(nodes, 'surgical_context'))) pmhParts.push(surgCtx);
  if (pmhParts.length > 0) {
    lines.push('Past Medical History');
    lines.push('-'.repeat(40));
    lines.push(pmhParts.join('\n\n'));
    lines.push('');
  }

  const summary = getNodeContent(nodes, 'summary');
  if (hasContent(findNode(nodes, 'summary'))) {
    lines.push('Summary');
    lines.push('-'.repeat(40));
    lines.push(summary);
    lines.push('');
  }

  const diffSum = getNodeContent(nodes, 'differential_summary');
  if (hasContent(findNode(nodes, 'differential_summary'))) {
    lines.push('Assessment');
    lines.push('-'.repeat(40));
    lines.push(diffSum);
    lines.push('');
  }

  const plan = getNodeContent(nodes, 'plan_summary');
  if (hasContent(findNode(nodes, 'plan_summary'))) {
    lines.push('Plan');
    lines.push('-'.repeat(40));
    lines.push(plan);
    lines.push('');
  }

  return lines.join('\n');
}

export function renderSOAPNote(graph: DocumentationGraph): string {
  const { nodes } = graph;
  const lines: string[] = [];

  lines.push('SOAP NOTE');
  lines.push('='.repeat(60));
  lines.push('');

  const subjectiveParts: string[] = [];
  const ctx = getNodeContent(nodes, 'context');
  if (ctx) subjectiveParts.push(ctx);

  const illnessCtx = getNodeContent(nodes, 'illness_context');
  if (hasContent(findNode(nodes, 'illness_context'))) subjectiveParts.push(illnessCtx);

  const timeline = getNodeContent(nodes, 'timeline');
  if (hasContent(findNode(nodes, 'timeline'))) subjectiveParts.push(timeline);

  const painHx = getNodeContent(nodes, 'pain_history');
  if (hasContent(findNode(nodes, 'pain_history'))) subjectiveParts.push(painHx);

  const symptoms = getNodeContent(nodes, 'symptom_cluster');
  if (hasContent(findNode(nodes, 'symptom_cluster'))) subjectiveParts.push(symptoms);

  const negatives = getNodeContent(nodes, 'important_negatives');
  if (hasContent(findNode(nodes, 'important_negatives'))) subjectiveParts.push(negatives);

  const healthSeeking = getNodeContent(nodes, 'health_seeking');
  if (hasContent(findNode(nodes, 'health_seeking'))) subjectiveParts.push(healthSeeking);

  const functional = getNodeContent(nodes, 'functional_impact');
  if (hasContent(findNode(nodes, 'functional_impact'))) subjectiveParts.push(functional);

  const risk = getNodeContent(nodes, 'risk_factors');
  if (hasContent(findNode(nodes, 'risk_factors'))) subjectiveParts.push(risk);

  lines.push('SUBJECTIVE');
  lines.push('-'.repeat(40));
  lines.push(subjectiveParts.length > 0 ? subjectiveParts.join('\n\n') : 'Patient reported data pending.');
  lines.push('');

  lines.push('OBJECTIVE');
  lines.push('-'.repeat(40));
  lines.push('Physical examination and investigation data pending.');
  lines.push('');

  const assessmentParts: string[] = [];
  const summary = getNodeContent(nodes, 'summary');
  if (hasContent(findNode(nodes, 'summary'))) assessmentParts.push(summary);

  const diffSum = getNodeContent(nodes, 'differential_summary');
  if (hasContent(findNode(nodes, 'differential_summary'))) assessmentParts.push(diffSum);

  lines.push('ASSESSMENT');
  lines.push('-'.repeat(40));
  lines.push(assessmentParts.length > 0 ? assessmentParts.join('\n\n') : 'Assessment pending.');
  lines.push('');

  const plan = getNodeContent(nodes, 'plan_summary');
  lines.push('PLAN');
  lines.push('-'.repeat(40));
  lines.push(hasContent(findNode(nodes, 'plan_summary')) ? plan : 'Plan pending.');
  lines.push('');

  return lines.join('\n');
}

export function renderDischargeSummary(graph: DocumentationGraph): string {
  const { nodes } = graph;
  const lines: string[] = [];

  lines.push('DISCHARGE SUMMARY');
  lines.push('='.repeat(60));
  lines.push('');

  const ctx = getNodeContent(nodes, 'context');
  if (ctx) {
    lines.push('Patient Information');
    lines.push('-'.repeat(40));
    lines.push(ctx);
    lines.push('');
  }

  if (hasContent(findNode(nodes, 'differential_summary'))) {
    lines.push('Diagnosis');
    lines.push('-'.repeat(40));
    lines.push(getNodeContent(nodes, 'differential_summary'));
    lines.push('');
  }

  const hpiParts: string[] = [];
  const illnessCtx = getNodeContent(nodes, 'illness_context');
  if (hasContent(findNode(nodes, 'illness_context'))) hpiParts.push(illnessCtx);

  const timeline = getNodeContent(nodes, 'timeline');
  if (hasContent(findNode(nodes, 'timeline'))) hpiParts.push(timeline);

  const painHx = getNodeContent(nodes, 'pain_history');
  if (hasContent(findNode(nodes, 'pain_history'))) hpiParts.push(painHx);

  const symptoms = getNodeContent(nodes, 'symptom_cluster');
  if (hasContent(findNode(nodes, 'symptom_cluster'))) hpiParts.push(symptoms);

  const negatives = getNodeContent(nodes, 'important_negatives');
  if (hasContent(findNode(nodes, 'important_negatives'))) hpiParts.push(negatives);

  const healthSeeking = getNodeContent(nodes, 'health_seeking');
  if (hasContent(findNode(nodes, 'health_seeking'))) hpiParts.push(healthSeeking);

  if (hpiParts.length > 0) {
    lines.push('History of Presenting Illness');
    lines.push('-'.repeat(40));
    lines.push(hpiParts.join('\n\n'));
    lines.push('');
  }

  const pmh = getNodeContent(nodes, 'chronic_disease_context');
  const surgCtx = getNodeContent(nodes, 'surgical_context');
  const pmhParts: string[] = [];
  if (hasContent(findNode(nodes, 'chronic_disease_context'))) pmhParts.push(pmh);
  if (hasContent(findNode(nodes, 'surgical_context'))) pmhParts.push(surgCtx);
  if (pmhParts.length > 0) {
    lines.push('Past Medical History');
    lines.push('-'.repeat(40));
    lines.push(pmhParts.join('\n\n'));
    lines.push('');
  }

  lines.push('Hospital Course');
  lines.push('-'.repeat(40));
  lines.push('Details of hospital stay pending.');
  lines.push('');

  const plan = getNodeContent(nodes, 'plan_summary');
  lines.push('Discharge Plan');
  lines.push('-'.repeat(40));
  lines.push(hasContent(findNode(nodes, 'plan_summary')) ? plan : 'Discharge plan pending.');
  lines.push('');

  return lines.join('\n');
}

export function renderHpiNarrative(graph: DocumentationGraph): string {
  const { nodes } = graph;
  const parts: string[] = [];

  const ctx = getNodeContent(nodes, 'context');
  if (ctx) parts.push(ctx);

  const illnessCtx = getNodeContent(nodes, 'illness_context');
  if (hasContent(findNode(nodes, 'illness_context'))) parts.push(illnessCtx);

  const timeline = getNodeContent(nodes, 'timeline');
  if (hasContent(findNode(nodes, 'timeline'))) parts.push(timeline);

  const painHx = getNodeContent(nodes, 'pain_history');
  if (hasContent(findNode(nodes, 'pain_history'))) parts.push(painHx);

  const symptoms = getNodeContent(nodes, 'symptom_cluster');
  if (hasContent(findNode(nodes, 'symptom_cluster'))) parts.push(symptoms);

  const negatives = getNodeContent(nodes, 'important_negatives');
  if (hasContent(findNode(nodes, 'important_negatives'))) parts.push(negatives);

  const healthSeeking = getNodeContent(nodes, 'health_seeking');
  if (hasContent(findNode(nodes, 'health_seeking'))) parts.push(healthSeeking);

  const functional = getNodeContent(nodes, 'functional_impact');
  if (hasContent(findNode(nodes, 'functional_impact'))) parts.push(functional);

  const risk = getNodeContent(nodes, 'risk_factors');
  if (hasContent(findNode(nodes, 'risk_factors'))) parts.push(risk);

  const summary = getNodeContent(nodes, 'summary');
  if (hasContent(findNode(nodes, 'summary'))) parts.push(summary);

  return parts.join('\n\n');
}

export function renderReferral(graph: DocumentationGraph): string {
  const { nodes } = graph;
  const lines: string[] = [];

  lines.push('REFERRAL LETTER');
  lines.push('='.repeat(60));
  lines.push('');

  const ctx = getNodeContent(nodes, 'context');
  if (ctx) {
    lines.push(ctx);
    lines.push('');
  }

  const illnessCtx = getNodeContent(nodes, 'illness_context');
  if (hasContent(findNode(nodes, 'illness_context'))) {
    lines.push('Reason for Referral');
    lines.push('-'.repeat(40));
    lines.push(illnessCtx);
    lines.push('');
  }

  const hpiParts: string[] = [];
  const timeline = getNodeContent(nodes, 'timeline');
  if (hasContent(findNode(nodes, 'timeline'))) hpiParts.push(timeline);

  const painHx = getNodeContent(nodes, 'pain_history');
  if (hasContent(findNode(nodes, 'pain_history'))) hpiParts.push(painHx);

  const symptoms = getNodeContent(nodes, 'symptom_cluster');
  if (hasContent(findNode(nodes, 'symptom_cluster'))) hpiParts.push(symptoms);

  const negatives = getNodeContent(nodes, 'important_negatives');
  if (hasContent(findNode(nodes, 'important_negatives'))) hpiParts.push(negatives);

  const healthSeeking = getNodeContent(nodes, 'health_seeking');
  if (hasContent(findNode(nodes, 'health_seeking'))) hpiParts.push(healthSeeking);

  if (hpiParts.length > 0) {
    lines.push('Clinical History');
    lines.push('-'.repeat(40));
    lines.push(hpiParts.join('\n\n'));
    lines.push('');
  }

  const pmh = getNodeContent(nodes, 'chronic_disease_context');
  if (hasContent(findNode(nodes, 'chronic_disease_context'))) {
    lines.push('Past Medical History');
    lines.push('-'.repeat(40));
    lines.push(pmh);
    lines.push('');
  }

  const diff = getNodeContent(nodes, 'differential_summary');
  if (hasContent(findNode(nodes, 'differential_summary'))) {
    lines.push('Working Diagnosis');
    lines.push('-'.repeat(40));
    lines.push(diff);
    lines.push('');
  }

  lines.push('Reason for Referral');
  lines.push('-'.repeat(40));
  lines.push('Further evaluation and management is requested.');
  lines.push('');

  return lines.join('\n');
}

export function renderWardRound(graph: DocumentationGraph): string {
  const { nodes } = graph;
  const lines: string[] = [];

  lines.push('WARD ROUND NOTE');
  lines.push('='.repeat(60));
  lines.push('');

  const ctx = getNodeContent(nodes, 'context');
  if (ctx) {
    lines.push(ctx);
    lines.push('');
  }

  lines.push('Subjective Update');
  lines.push('-'.repeat(40));
  const subjectiveParts: string[] = [];
  const painHx = getNodeContent(nodes, 'pain_history');
  if (hasContent(findNode(nodes, 'pain_history'))) subjectiveParts.push(painHx);
  const symptoms = getNodeContent(nodes, 'symptom_cluster');
  if (hasContent(findNode(nodes, 'symptom_cluster'))) subjectiveParts.push(symptoms);
  const healthSeeking = getNodeContent(nodes, 'health_seeking');
  if (hasContent(findNode(nodes, 'health_seeking'))) subjectiveParts.push(healthSeeking);
  lines.push(subjectiveParts.length > 0 ? subjectiveParts.join('\n\n') : 'No new subjective data.');
  lines.push('');

  lines.push('Objective');
  lines.push('-'.repeat(40));
  const objectiveParts: string[] = [];
  const surgical = getNodeContent(nodes, 'surgical_context');
  if (hasContent(findNode(nodes, 'surgical_context'))) objectiveParts.push(surgical);
  lines.push(objectiveParts.length > 0 ? objectiveParts.join('\n\n') : 'Examination data pending.');
  lines.push('');

  const diff = getNodeContent(nodes, 'differential_summary');
  if (hasContent(findNode(nodes, 'differential_summary'))) {
    lines.push('Assessment');
    lines.push('-'.repeat(40));
    lines.push(diff);
    lines.push('');
  }

  const plan = getNodeContent(nodes, 'plan_summary');
  lines.push('Plan');
  lines.push('-'.repeat(40));
  lines.push(hasContent(findNode(nodes, 'plan_summary')) ? plan : 'Plan pending.');
  lines.push('');

  return lines.join('\n');
}

export function generateAllFormats(graph: DocumentationGraph): DocumentationGraph {
  return {
    ...graph,
    renderedFormats: {
      admissionNote: renderAdmissionNote(graph),
      soapNote: renderSOAPNote(graph),
      referral: renderReferral(graph),
      dischargeSummary: renderDischargeSummary(graph),
      wardRound: renderWardRound(graph),
      hpiNarrative: renderHpiNarrative(graph),
    },
    lastRendered: Date.now(),
  };
}
