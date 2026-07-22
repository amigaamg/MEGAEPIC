import type { ChiefComplaintObject, ComplaintConsistencyCheck } from './types';

const RED_FLAG_SYMPTOMS = new Set([
  'chest_pain', 'collapse', 'syncope', 'seizures', 'hemoptysis',
  'hematemesis_melena', 'stridor', 'respiratory_distress',
  'anaphylaxis', 'meningitis', 'stroke', 'cauda_equina',
  'aortic_dissection', 'ectopic_pregnancy', 'testicular_torsion',
  'ovarian_torsion', 'status_epilepticus', 'airway_obstruction',
  'severe_trauma', 'burns_major',
]);

const RED_FLAG_LABELS = new Set([
  'Chest Pain', 'Collapse', 'Loss of Consciousness', 'Seizures',
  'Coughing Blood', 'Vomiting Blood', 'Black Stool',
  'Difficulty Breathing', 'Severe Trauma', 'Severe Burn',
  'Fitting', 'Unresponsive',
]);

export function runConsistencyChecks(complaints: ChiefComplaintObject[]): ComplaintConsistencyCheck[] {
  const checks: ComplaintConsistencyCheck[] = [];

  if (complaints.length < 2) return checks;

  const sorted = [...complaints].sort((a, b) => a.durationHours - b.durationHours);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const earlier = sorted[i];
      const later = sorted[j];

      const diffHours = later.durationHours - earlier.durationHours;

      if (diffHours < 0.5 && earlier.onset === 'Sudden' && later.onset === 'Gradual') {
        checks.push({
          passed: false,
          ruleId: 'CC-22-001',
          message: `${later.name} has gradual onset but started near the same time as sudden ${earlier.name}`,
          severity: 'info',
          clarification: `Can you confirm which symptom started first — ${earlier.name} or ${later.name}?`,
        });
      }
    }
  }

  const severeDistension = complaints.find(c =>
    c.symptomId === 'abdominal_distension' && c.severity === 'Severe'
  );
  const abdominalPain = complaints.find(c =>
    c.symptomId === 'abdominal_pain'
  );

  if (severeDistension && abdominalPain) {
    if (severeDistension.durationHours < abdominalPain.durationHours) {
      checks.push({
        passed: false,
        ruleId: 'CC-22-002',
        message: `Severe abdominal distension before abdominal pain in suspected obstruction`,
        severity: 'warning',
        clarification: `Can you confirm which symptom started first — the abdominal pain or the distension?`,
      });
    }
  }

  const chestPain = complaints.find(c =>
    c.symptomId === 'chest_pain'
  );
  const collapse = complaints.find(c =>
    c.symptomId === 'collapse' || c.symptomId === 'syncope'
  );

  if (chestPain && collapse) {
    if (collapse.durationHours < chestPain.durationHours) {
      checks.push({
        passed: false,
        ruleId: 'CC-22-003',
        message: `Chest pain occurring after loss of consciousness`,
        severity: 'warning',
        clarification: `Did the chest pain begin before or after you collapsed?`,
      });
    }
  }

  const fever = complaints.find(c => c.symptomId === 'fever');
  const jaundice = complaints.find(c => c.symptomId === 'jaundice');

  if (fever && jaundice) {
    if (jaundice.durationHours < fever.durationHours - 24) {
      checks.push({
        passed: false,
        ruleId: 'CC-22-004',
        message: `Jaundice developed shortly after fever onset`,
        severity: 'info',
        clarification: `Did the yellowing of eyes start around the same time as the fever?`,
      });
    }
  }

  const vomiting = complaints.find(c =>
    c.symptomId === 'nausea_vomiting'
  );
  const diarrhea = complaints.find(c =>
    c.symptomId === 'diarrhea'
  );

  if (vomiting && diarrhea && !fever) {
    checks.push({
      passed: true,
      ruleId: 'CC-22-005',
      message: `Vomiting and diarrhea without fever — consider gastroenteritis vs non-infectious causes`,
      severity: 'info',
      clarification: null,
    });
  }

  return checks;
}

export function isRedFlagComplaint(complaint: ChiefComplaintObject): boolean {
  if (RED_FLAG_SYMPTOMS.has(complaint.symptomId)) return true;
  if (RED_FLAG_LABELS.has(complaint.label)) return true;
  if (complaint.severity === 'Severe' && complaint.onset === 'Sudden') return true;
  return false;
}
