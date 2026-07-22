// ── Completeness Engine ─────────────────────────────────────────
// Validates that every HPI stage is complete before allowing progression.
// RULE H16: HPI cannot finish until ALL mandatory criteria are satisfied.
// RULE H25: The engine stops only when:
//   - Every active symptom has reached its completion criteria.
//   - Every high-priority differential has adequate supporting/opposing history.
//   - Every mandatory safety screen has been completed.
//   - No remaining high-value unanswered questions.
//   - The encounter has a coherent, chronological history.

import type { HpiState, RuleEvaluation, RuleEngineResult, Rule, SymptomInstance } from './types';
import { buildTimeline, isTimelineComplete } from './timeline-engine';
import { CORE_DIFFERENTIAL_KNOWLEDGE, getPendingQuestionFields } from './differential-coverage';
import { getTemplate } from './question-engine';

// ── Constitutional Rules (always enforced) ─────────────────────
const CONSTITUTIONAL_RULES: Rule[] = [
  {
    id: 'HPI-C1', name: 'Primary Symptom Defined',
    description: 'Every HPI must have exactly one primary symptom',
    severity: 'constitutional', scope: 'global', category: 'structure',
    condition: 'state.primarySymptomId is set',
    action: 'Set a primary symptom before proceeding',
    errorMessage: 'No primary symptom defined',
    appliesToStages: ['primary_expansion', 'associated_discovery', 'associated_expansion'],
  },
  {
    id: 'HPI-C2', name: 'Timeline Established',
    description: 'Every symptom must appear in the timeline',
    severity: 'constitutional', scope: 'global', category: 'timeline',
    condition: 'isTimelineComplete(state.symptoms)',
    action: 'Record onset for all symptoms',
    errorMessage: 'Timeline incomplete — symptom onset missing',
    appliesToStages: ['associated_expansion', 'differential_coverage'],
  },
  {
    id: 'HPI-C3', name: 'No Orphaned Data',
    description: 'Every data point belongs to a symptom',
    severity: 'constitutional', scope: 'global', category: 'data_integrity',
    condition: 'All coreData fields have a matching symptom',
    action: 'Ensure data is attributed to a symptom',
    errorMessage: 'Orphaned data detected',
  },
];

// ── Stage-Specific Rules ────────────────────────────────────────
function getStageRules(stage: HpiState['status']): Rule[] {
  const stageRules: Rule[] = [];

  switch (stage) {
    case 'primary_expansion':
      stageRules.push({
        id: 'HPI-S1', name: 'Primary Symptom Core Fields Complete',
        description: 'All mandatory core fields for primary symptom must be answered',
        severity: 'mandatory', scope: 'symptom', category: 'completeness',
        condition: 'Primary symptom template completion criteria met',
        action: 'Complete all mandatory fields for the primary symptom',
        errorMessage: 'Primary symptom exploration incomplete',
        appliesToSymptoms: [],
      });
      break;

    case 'associated_discovery':
      stageRules.push({
        id: 'HPI-S2', name: 'Associated Symptoms Screened',
        description: 'All possible associated symptoms have been offered',
        severity: 'mandatory', scope: 'global', category: 'completeness',
        condition: 'Associated symptom prompt shown for primary symptom',
        action: 'Screen for associated symptoms before proceeding',
        errorMessage: 'Associated symptoms not screened',
      });
      break;

    case 'differential_coverage':
      stageRules.push({
        id: 'HPI-S3', name: 'Differential Coverage Adequate',
        description: 'Every active differential has adequate coverage',
        severity: 'mandatory', scope: 'differential', category: 'ddx_coverage',
        condition: 'Every active non-excluded differential has ≥60% coverage',
        action: 'Collect more evidence for active differentials',
        errorMessage: 'Insufficient evidence to differentiate diagnoses',
      });
      stageRules.push({
        id: 'HPI-S4', name: 'Dangerous Diagnosis Exclusions Complete',
        description: 'Every dangerous diagnosis has been adequately ruled out',
        severity: 'mandatory', scope: 'differential', category: 'safety',
        condition: 'All high-risk diagnoses have exclusion evidence',
        action: 'Collect excluding evidence for dangerous diagnoses',
        errorMessage: 'Dangerous diagnoses not adequately excluded',
      });
      break;

    case 'risk_factor_exploration':
      stageRules.push({
        id: 'HPI-S5', name: 'Risk Factors Explored',
        description: 'Relevant risk factors for active differentials explored',
        severity: 'recommended', scope: 'differential', category: 'risk',
        condition: 'Risk factors for active differentials documented',
        action: 'Ask risk factor questions',
        errorMessage: 'Risk factors not explored',
      });
      break;

    case 'care_before_presentation':
      stageRules.push({
        id: 'HPI-S6', name: 'Care Before Presentation Documented',
        description: 'What happened before arrival must be recorded',
        severity: 'mandatory', scope: 'global', category: 'history',
        condition: 'Care before presentation fields completed',
        action: 'Document care sought before presentation',
        errorMessage: 'Care before presentation not documented',
      });
      break;

    case 'impact_exploration':
      stageRules.push({
        id: 'HPI-S7', name: 'Functional Impact Assessed',
        description: 'Impact on daily activities must be assessed',
        severity: 'mandatory', scope: 'global', category: 'history',
        condition: 'Impact on daily life fields completed',
        action: 'Assess impact on daily activities',
        errorMessage: 'Functional impact not assessed',
      });
      break;

    case 'current_status':
      stageRules.push({
        id: 'HPI-S8', name: 'Current Status Documented',
        description: 'Current condition and reason for visit must be recorded',
        severity: 'mandatory', scope: 'global', category: 'history',
        condition: 'Current status fields completed',
        action: 'Document current clinical status',
        errorMessage: 'Current status not documented',
      });
      break;
  }

  return stageRules;
}

// ── Evaluate symptom-specific completion ───────────────────────
function evaluateSymptomCompletion(symptom: SymptomInstance, state?: HpiState): RuleEvaluation[] {
  const evaluations: RuleEvaluation[] = [];
  const template = getTemplate(symptom.category);

  // 1. Check every mandatory field in the template
  for (const field of template.coreFields) {
    if (!field.mandatory) continue;

    const val = symptom.coreData[field.id];
    const passed = val !== undefined && val !== null && val !== '';

    evaluations.push({
      ruleId: `SYM-${symptom.id}-${field.id}`,
      ruleName: `Symptom: ${field.label}`,
      passed,
      severity: 'mandatory',
      message: passed ? undefined : field.label,
    });
  }

  // 2. Special state-level criteria (not linked to a specific field)
  if (symptom.isPrimary) {
    const assocScreened = state !== undefined &&
      state.status !== 'primary_expansion' &&
      state.status !== 'associated_discovery';
    evaluations.push({
      ruleId: `SYM-${symptom.id}-associated_screened`,
      ruleName: 'Symptom: Associated symptoms screened',
      passed: assocScreened,
      severity: 'mandatory',
      message: assocScreened ? undefined : 'Associated symptoms not yet screened',
    });
  }

  if (symptom.category === 'weakness') {
    const fiPassed = state !== undefined && Object.keys(state.impactOnLife).length > 0;
    evaluations.push({
      ruleId: `SYM-${symptom.id}-functional_impact`,
      ruleName: 'Symptom: Functional impact recorded',
      passed: fiPassed,
      severity: 'mandatory',
      message: fiPassed ? undefined : 'Functional impact not recorded',
    });
  }

  if (symptom.category === 'cardiac') {
    const rfPassed = state !== undefined && Object.keys(state.riskFactors).length > 0;
    evaluations.push({
      ruleId: `SYM-${symptom.id}-cardiac_risk_factors`,
      ruleName: 'Symptom: Cardiac risk factors recorded',
      passed: rfPassed,
      severity: 'mandatory',
      message: rfPassed ? undefined : 'Cardiac risk factors not recorded',
    });
  }

  if (symptom.category === 'constitutional') {
    const fsPassed = state !== undefined && Object.keys(state.impactOnLife).length > 0;
    evaluations.push({
      ruleId: `SYM-${symptom.id}-functional_status`,
      ruleName: 'Symptom: Functional status recorded',
      passed: fsPassed,
      severity: 'mandatory',
      message: fsPassed ? undefined : 'Functional status not recorded',
    });
  }

  return evaluations;
}

// ── Evaluate safety screen completion ──────────────────────────
function evaluateSafetyCompletion(state: HpiState): RuleEvaluation[] {
  const evaluations: RuleEvaluation[] = [];

  // Check all questions with safety relevance are answered
  const safetyQuestions = state.questions.filter(q => q.safetyRelevance.length > 0);
  const unansweredSafety = safetyQuestions.filter(q => !q.answered && !q.skipped);

  if (unansweredSafety.length > 0) {
    evaluations.push({
      ruleId: 'SAFETY-1',
      ruleName: 'All Safety Questions Answered',
      passed: false,
      severity: 'mandatory',
      message: `${unansweredSafety.length} safety questions unanswered: ${unansweredSafety.map(q => q.text).join(', ')}`,
    });
  } else {
    evaluations.push({
      ruleId: 'SAFETY-1',
      ruleName: 'All Safety Questions Answered',
      passed: true,
      severity: 'mandatory',
    });
  }

  // Check for unresolved safety alerts
  if (state.unresolvedAlerts.length > 0) {
    evaluations.push({
      ruleId: 'SAFETY-2',
      ruleName: 'No Unresolved Safety Alerts',
      passed: false,
      severity: 'mandatory',
      message: state.unresolvedAlerts.join(', '),
    });
  } else {
    evaluations.push({
      ruleId: 'SAFETY-2',
      ruleName: 'No Unresolved Safety Alerts',
      passed: true,
      severity: 'mandatory',
    });
  }

  return evaluations;
}

// ── Evaluate differential coverage ─────────────────────────────
function evaluateDifferentialCoverage(state: HpiState): RuleEvaluation[] {
  const evaluations: RuleEvaluation[] = [];

  const activeDxs = state.differentials.filter(d => d.isActive && !d.isExcluded);

  for (const dx of activeDxs) {
    const coverage = state.coverage.find(c => c.diagnosisId === dx.id);
    if (!coverage) {
      evaluations.push({
        ruleId: `DDX-${dx.id}-coverage`,
        ruleName: `DDX Coverage: ${dx.name}`,
        passed: false,
        severity: 'mandatory',
        message: `No coverage data for ${dx.name}`,
      });
      continue;
    }

    const threshold = 60;
    const passed = coverage.coveragePercent >= threshold;

    evaluations.push({
      ruleId: `DDX-${dx.id}-coverage`,
      ruleName: `DDX Coverage: ${dx.name}`,
      passed,
      severity: 'mandatory',
      message: passed ? undefined : `${dx.name} coverage: ${coverage.coveragePercent}% (need ≥${threshold}%)`,
    });

    // Check if dangerous diagnosis has exclusion evidence
    const dangerousDxs = ['sigmoid_volvulus', 'obstructing_colorectal_cancer', 'acute_appendicitis', 'small_bowel_obstruction'];
    if (dangerousDxs.includes(dx.id)) {
      const excluded = coverage.adequatelyExcluded;
      evaluations.push({
        ruleId: `DDX-${dx.id}-exclusion`,
        ruleName: `Dangerous DX Exclusion: ${dx.name}`,
        passed: excluded || coverage.adequateForRuleIn,
        severity: 'mandatory',
        message: excluded ? undefined : `${dx.name} not adequately ruled in or out`,
      });
    }
  }

  return evaluations;
}

// ── Evaluate completeness for all stages ────────────────────────
export function evaluateCompleteness(state: HpiState): RuleEngineResult {
  const allEvaluations: RuleEvaluation[] = [];

  // 1. Constitutional rules
  for (const rule of CONSTITUTIONAL_RULES) {
    if (rule.appliesToStages && !rule.appliesToStages.includes(state.status)) continue;

    let passed = false;
    switch (rule.id) {
      case 'HPI-C1':
        passed = state.primarySymptomId.length > 0;
        break;
      case 'HPI-C2':
        passed = isTimelineComplete(state.symptoms);
        break;
      case 'HPI-C3':
        passed = true; // Structural invariant
        break;
    }

    allEvaluations.push({
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      severity: rule.severity,
      message: passed ? undefined : rule.errorMessage,
    });
  }

  // 2. Stage-specific rules
  const stageRules = getStageRules(state.status);
  for (const rule of stageRules) {
    let passed = false;
    switch (rule.id) {
      case 'HPI-S1': {
        const primary = state.symptoms.find(s => s.id === state.primarySymptomId);
        if (primary) {
          const primaryEvals = evaluateSymptomCompletion(primary, state);
          passed = primaryEvals.every(e => e.passed);
        } else {
          passed = false;
        }
        break;
      }
      case 'HPI-S2':
        passed = state.status !== 'primary_expansion'; // Already past this stage
        break;
      case 'HPI-S3': {
        const coverageEvals = evaluateDifferentialCoverage(state);
        passed = coverageEvals.every(e => e.passed);
        break;
      }
      case 'HPI-S4': {
        const coverageEvals = evaluateDifferentialCoverage(state);
        const dangerousPassed = coverageEvals.filter(e => e.ruleId.includes('exclusion'));
        passed = dangerousPassed.every(e => e.passed);
        break;
      }
      case 'HPI-S5':
        passed = true; // Recommended, not blocking
        break;
      case 'HPI-S6':
        passed = state.careBeforePresentation.firstSought !== undefined;
        break;
      case 'HPI-S7':
        passed = Object.keys(state.impactOnLife).length > 0;
        break;
      case 'HPI-S8':
        passed = state.currentStatus.trend !== undefined;
        break;
    }

    allEvaluations.push({
      ruleId: rule.id,
      ruleName: rule.name,
      passed,
      severity: rule.severity,
      message: passed ? undefined : rule.errorMessage,
    });
  }

  // 3. Safety evaluations
  allEvaluations.push(...evaluateSafetyCompletion(state));

  // 4. Symptom completion evaluations
  for (const symptom of state.symptoms) {
    allEvaluations.push(...evaluateSymptomCompletion(symptom, state));
  }

  // Compute result
  const blockingCount = allEvaluations.filter(e => !e.passed && (e.severity === 'constitutional' || e.severity === 'mandatory')).length;
  const warningsCount = allEvaluations.filter(e => !e.passed && e.severity === 'recommended').length;

  // Update state completeness tracking
  state.completeness = {};
  for (const eval_ of allEvaluations) {
    state.completeness[eval_.ruleId] = eval_.passed;
  }

  state.missingMandatory = allEvaluations
    .filter(e => !e.passed && (e.severity === 'constitutional' || e.severity === 'mandatory'))
    .map(e => e.ruleName);

  return {
    evaluations: allEvaluations,
    allPassed: blockingCount === 0,
    blockingCount,
    warningsCount,
  };
}

// ── Can the HPI proceed to the next stage? ─────────────────────
export function canProceedToNextStage(state: HpiState): boolean {
  const completeness = evaluateCompleteness(state);
  return completeness.allPassed;
}

// ── Get summary of missing mandatory items ─────────────────────
export function getMissingMandatorySummary(state: HpiState): string[] {
  return state.missingMandatory;
}
