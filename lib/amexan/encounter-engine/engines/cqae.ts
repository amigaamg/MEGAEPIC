// ═══════════════════════════════════════════════════════════════════════════════
// Constitutional Contextual Question Activation Engine (CQAE)
// Governs whether ANY question is displayed based on constitutional context.
// Constitutional Principles:
//   - Questions are never displayed because they exist.
//   - Questions are displayed because they are applicable.
//   - Applicability is determined from structured facts already known.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  SymptomQuestion, ConstitutionalContext, ComplaintObject, ContextCondition,
} from '../knowledge/symptom-types';

export interface CqaeInput {
  question: SymptomQuestion
  context: ConstitutionalContext
  alreadyCapturedFacts: Set<string>     // fact keys already collected
  patientAge: number
  symptomNodeName?: string              // canonical name of the symptom node being evaluated
  symptomNodeSynonyms?: string[]        // synonyms of the symptom node
}

export interface CqaeResult {
  applicable: boolean
  reason?: string
  displayText: string
  displayChips?: string[]
}

// ─── Rule CQAE-001: Constitutional Applicability ────────────────────────────
// Before a question is displayed, the engine asks: Does this question apply?

export function evaluateCqae(input: CqaeInput): CqaeResult {
  const { question, context, alreadyCapturedFacts } = input;

  // ── Rule CQAE-008: Duplicate Prevention ────────────────────────────────
  if (question.factKey && alreadyCapturedFacts.has(question.factKey)) {
    return { applicable: false, reason: 'Already captured', displayText: question.text };
  }

  // ── Rule CQAE-002: Age Rules ───────────────────────────────────────────
  const age = input.patientAge;

  // Adult-only questions
  const adultOnlyPatterns = ['smoking', 'alcohol', 'marital', 'occupation', 'insurance'];
  if (age < 13) {
    for (const pattern of adultOnlyPatterns) {
      if (question.id.includes(pattern) || question.factKey.includes(pattern)) {
        return { applicable: false, reason: `Not applicable for age < 13 (${pattern})`, displayText: question.text };
      }
    }
  }

  // Neonate-only questions
  if (age >= 0.08) { // older than 28 days
    const neonatePatterns = ['apnea', 'grunting', 'neonatal_', 'antenatal', 'natal_', 'postnatal_', 'perinatal'];
    for (const pattern of neonatePatterns) {
      if (question.id.includes(pattern) || question.factKey.includes(pattern)) {
        return { applicable: false, reason: `Not applicable beyond neonatal period (${pattern})`, displayText: question.text };
      }
    }
  }

  // Pediatric-only questions (not applicable to adults)
  if (age >= 13) {
    const pediatricPatterns = ['ped_', 'school', 'immunization', 'feeding', 'milestone', 'birth_', 'growth_'];
    for (const pattern of pediatricPatterns) {
      if (question.id.includes(pattern) || question.factKey.includes(pattern)) {
        return { applicable: false, reason: `Not applicable for adults (${pattern})`, displayText: question.text };
      }
    }
  }

  // ── Rule CQAE-003: Sex Rules ───────────────────────────────────────────
  if (context.sex === 'male') {
    const femalePatterns = ['pregnant', 'gestation', 'lochia', 'menstrual', 'cervical', 'contraceptive', 'obstetric', 'gynae', 'vaginal', 'breastfeeding'];
    for (const pattern of femalePatterns) {
      if (question.id.includes(pattern) || question.factKey.includes(pattern)) {
        return { applicable: false, reason: `Female-specific (${pattern})`, displayText: question.text };
      }
    }
  }

  if (context.sex === 'female') {
    const malePatterns = ['prostate', 'testicular', 'erectile'];
    for (const pattern of malePatterns) {
      if (question.id.includes(pattern) || question.factKey.includes(pattern)) {
        return { applicable: false, reason: `Male-specific (${pattern})`, displayText: question.text };
      }
    }
  }

  // ── Rule CQAE-004: Pregnancy Rules ─────────────────────────────────────
  if (!context.pregnant) {
    const pregnancyPatterns = ['gestation', 'lochia', 'prom_', 'fetal_movement', 'antenatal_', 'contraction', 'show_'];
    for (const pattern of pregnancyPatterns) {
      if (question.id.includes(pattern) || question.factKey.includes(pattern)) {
        return { applicable: false, reason: 'Not applicable outside pregnancy', displayText: question.text };
      }
    }
  }

  // ── Rule CQAE-005: Chief Complaint Rules ───────────────────────────────
  let chiefComplaintMatch = true;
  if (input.symptomNodeName && context.chiefComplaints.length > 0) {
    chiefComplaintMatch = matchesChiefComplaint(
      question, context, input.symptomNodeName, input.symptomNodeSynonyms ?? [],
    );
  }

  // ── Rule CQAE-006: Disease Rules ──────────────────────────────────────
  if (!chiefComplaintMatch) {
    if (context.knownDiseases.length > 0) {
      for (const disease of context.knownDiseases) {
        if (disease.active && matchesDiseaseQuestion(disease.name, question)) {
          chiefComplaintMatch = true;
          break;
        }
      }
    }
    if (!chiefComplaintMatch && context.currentMedications.length > 0) {
      for (const med of context.currentMedications) {
        if (med.category === 'anticoagulant' && question.factKey.includes('bleeding')) {
          chiefComplaintMatch = true;
          break;
        }
      }
    }
  }

  // ── Rule CQAE-007: Environmental Rules ─────────────────────────────────
  if (!chiefComplaintMatch) {
    if (matchesEnvironmentalQuestion(question, context)) {
      chiefComplaintMatch = true;
    }
  }

  if (!chiefComplaintMatch) {
    return { applicable: false, reason: 'No matching chief complaint', displayText: question.text };
  }

  // ── Check question alternatives for context-appropriate wording ────────
  let displayText = question.text;
  let displayChips = question.chips;

  for (const alt of question.alternatives) {
    if (matchesConstitutionalContext(alt.condition, context)) {
      displayText = alt.text;
      if (alt.chips) displayChips = alt.chips;
      if (alt.type) break;
    }
  }

  return { applicable: true, displayText, displayChips };
}

function matchesConstitutionalContext(condition: ContextCondition, context: ConstitutionalContext): boolean {
  if (condition.ageMin !== undefined && context.age < condition.ageMin) return false;
  if (condition.ageMax !== undefined && context.age > condition.ageMax) return false;
  if (condition.sex !== undefined && context.sex !== condition.sex) return false;
  if (condition.pregnant !== undefined && context.pregnant !== condition.pregnant) return false;
  if (condition.departments && !condition.departments.includes(context.department)) return false;
  if (condition.module && context.module !== condition.module) return false;
  return true;
}

// ─── CQAE-005 Helper ──────────────────────────────────────────────────────────

function matchesChiefComplaint(
  question: SymptomQuestion,
  context: ConstitutionalContext,
  symptomNodeName: string,
  symptomNodeSynonyms: string[],
): boolean {
  const lowerName = symptomNodeName.toLowerCase();
  const lowerSynonyms = symptomNodeSynonyms.map(s => s.toLowerCase());
  const matchNames = [lowerName, ...lowerSynonyms];

  for (const complaint of context.chiefComplaints) {
    const concept = complaint.standardizedConcept.toLowerCase();
    if (matchNames.includes(concept)) return true;
    for (const name of matchNames) {
      if (concept.includes(name) || name.includes(concept)) return true;
    }
  }
  return false;
}

// ─── CQAE-006 Helpers ─────────────────────────────────────────────────────────

const diseaseQuestionPatterns: Record<string, string[]> = {
  diabetes: ['diabetic', 'foot_ulcer', 'glucose', 'insulin', 'hypoglyc'],
  asthma: ['asthma', 'wheezing', 'bronchodilator', 'peak_flow'],
};

function matchesDiseaseQuestion(diseaseName: string, question: SymptomQuestion): boolean {
  const name = diseaseName.toLowerCase().trim();
  const patterns = diseaseQuestionPatterns[name];
  if (!patterns) return false;
  const factKey = question.factKey.toLowerCase();
  return patterns.some(pattern => factKey.includes(pattern));
}

// ─── CQAE-007 Helper ──────────────────────────────────────────────────────────

function matchesEnvironmentalQuestion(question: SymptomQuestion, context: ConstitutionalContext): boolean {
  const isEmergencyOrIcu = context.department === 'emergency' || context.location === 'icu';
  const isInpatient = context.encounterType === 'inpatient';

  if (isEmergencyOrIcu) {
    const emergencyPatterns = ['emergency', 'resuscitation', 'abcde', 'triage', 'code_', 'crash_', 'defibrill', 'intubation'];
    const factKey = question.factKey.toLowerCase();
    if (emergencyPatterns.some(pattern => factKey.includes(pattern))) return true;
  }

  if (isInpatient) {
    const inpatientPatterns = ['admission', 'ward_', 'inpatient_', 'discharge_', 'length_of_stay'];
    const factKey = question.factKey.toLowerCase();
    if (inpatientPatterns.some(pattern => factKey.includes(pattern))) return true;
  }

  return false;
}
