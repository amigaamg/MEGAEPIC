import { mapCaseToRegistry, caseToAlvarado, type ClinicalCaseInput } from './ise/caseMapper';
import { calculateSeverity } from './ise/severityEngine';
import { generateAppendicitisInvestigationPlan, interpretLabResults } from './ise/investigationEngine';
import { generateAppendicitisManagement } from './ise/managementEngine';
import { generateAppendicitisEducation, formatEducationForPatient } from './ise/educationEngine';

export interface AppendicitisAssessmentOutput {
  caseInput: ClinicalCaseInput;
  alvarado: { score: number; risk: 'low' | 'moderate' | 'high' | 'very_high' };
  severity: ReturnType<typeof calculateSeverity>;
  investigations: ReturnType<typeof generateAppendicitisInvestigationPlan>;
  management: ReturnType<typeof generateAppendicitisManagement>;
  education: ReturnType<typeof generateAppendicitisEducation>;
  educationText: string;
  labInterpretations: string[];
}

export function assessAppendicitis(caseInput: ClinicalCaseInput): AppendicitisAssessmentOutput {
  const registry = mapCaseToRegistry(caseInput);

  const alvarado = caseToAlvarado(caseInput);

  const severity = calculateSeverity('appendicitis', registry);

  const context = {
    age: caseInput.demographics.age,
    sex: caseInput.demographics.sex,
    pregnant: caseInput.demographics.pregnant ?? false,
    isChild: caseInput.demographics.isChild ?? (caseInput.demographics.age < 12),
    isElderly: caseInput.demographics.isElderly ?? (caseInput.demographics.age > 60),
  };

  const investigations = generateAppendicitisInvestigationPlan(registry, context);

  const labInterpretations = interpretLabResults(registry, {
    wbc: caseInput.labs?.wbc ?? 0,
    crp: caseInput.labs?.crp ?? 0,
    lactate: caseInput.labs?.lactate ?? 0,
    beta_hcg: caseInput.labs?.betaHcg ?? '',
  });

  const management = generateAppendicitisManagement(registry, severity, context);

  const education = generateAppendicitisEducation(management.subtype, severity, context);
  const educationText = formatEducationForPatient(education);

  return {
    caseInput,
    alvarado,
    severity,
    investigations,
    management,
    education,
    educationText,
    labInterpretations,
  };
}

export function formatAssessmentSummary(output: AppendicitisAssessmentOutput): string {
  const lines: string[] = [];

  lines.push('='.repeat(72));
  lines.push('  APPENDICITIS CLINICAL ASSESSMENT — COMPREHENSIVE REPORT');
  lines.push('='.repeat(72));
  lines.push('');

  // Alvarado Score
  lines.push('─── ALVARADO SCORE ───');
  lines.push(`  M = Migration of pain: ${output.caseInput.symptoms.painMigratedToRIF ? 'YES (1)' : 'NO (0)'}`);
  lines.push(`  A = Anorexia: ${output.caseInput.symptoms.anorexia ? 'YES (1)' : 'NO (0)'}`);
  lines.push(`  N = Nausea/Vomiting: ${(output.caseInput.symptoms.nausea || output.caseInput.symptoms.vomiting) ? 'YES (1)' : 'NO (0)'}`);
  lines.push(`  T = Tenderness RIF: ${(output.caseInput.signs.RIFTenderness || output.caseInput.signs.mcburneyTenderness) ? 'YES (2)' : 'NO (0)'}`);
  lines.push(`  R = Rebound: ${output.caseInput.signs.reboundTenderness ? 'YES (1)' : 'NO (0)'}`);
  lines.push(`  E = Elevated Temp: ${(output.caseInput.signs.temperature ?? 0) > 37.3 ? 'YES (1)' : 'NO (0)'}`);
  lines.push(`  L = Leukocytosis: ${(output.caseInput.labs?.wbc ?? 0) > 10000 ? 'YES (2)' : 'NO (0)'}`);
  lines.push(`  S = Shift Left: ${(output.caseInput.labs?.neutrophils ?? 0) > 75 ? 'YES (1)' : 'NO (0)'}`);
  lines.push(`  ─────────────────────────────`);
  lines.push(`  TOTAL ALVARADO SCORE: ${output.alvarado.score}/10`);
  lines.push(`  RISK CATEGORY: ${output.alvarado.risk.toUpperCase()}`);
  lines.push('');

  // Severity
  lines.push('─── SEVERITY ASSESSMENT ───');
  lines.push(`  Grade: ${output.severity.level.toUpperCase()} (Score: ${output.severity.score})`);
  lines.push(`  Triggers: ${output.severity.triggers.length > 0 ? output.severity.triggers.join(', ') : 'None'}`);
  lines.push(`  Action: ${output.severity.action}`);
  lines.push('');

  // Investigations
  lines.push('─── INVESTIGATION PLAN ───');
  lines.push('  [Diagnostic Investigations]');
  for (const inv of output.investigations.diagnostic) {
    lines.push(`    ${inv.priority === 'essential' ? '★' : '○'} ${inv.name} — ${inv.rationale}`);
  }
  lines.push('  [Pre-Operative Investigations]');
  for (const inv of output.investigations.preOperative) {
    lines.push(`    ${inv.priority === 'essential' ? '★' : '○'} ${inv.name} — ${inv.rationale}`);
  }
  if (output.investigations.complications.length > 0) {
    lines.push('  [Complication-Specific Investigations]');
    for (const inv of output.investigations.complications) {
      lines.push(`    ${inv.priority === 'essential' ? '★' : '○'} ${inv.name} — ${inv.rationale}`);
    }
  }
  lines.push(`  Notes: ${output.investigations.notes}`);
  lines.push('');

  // Lab interpretations
  if (output.labInterpretations.length > 0) {
    lines.push('─── LAB INTERPRETATIONS ───');
    for (const interp of output.labInterpretations) {
      lines.push(`  • ${interp}`);
    }
    lines.push('');
  }

  // Management
  lines.push('─── MANAGEMENT PLAN ───');
  lines.push(`  Subtype: ${output.management.subtype.replace(/_/g, ' ').toUpperCase()}`);
  lines.push('');
  lines.push('  [Resuscitation]');
  for (const m of output.management.resuscitation) {
    lines.push(`    • ${m.action}: ${m.detail}`);
  }
  lines.push('');
  lines.push('  [Antibiotics]');
  for (const abx of output.management.antibiotics) {
    lines.push(`    • ${abx.regimen}`);
    lines.push(`      Duration: ${abx.duration} | Route: ${abx.route} | Indication: ${abx.indication}`);
  }
  lines.push('');
  lines.push('  [Definitive Treatment]');
  for (const m of output.management.definitive) {
    lines.push(`    • ${m.action}: ${m.detail}`);
  }
  lines.push('');
  lines.push('  [Supportive Care]');
  for (const m of output.management.supportive) {
    lines.push(`    • ${m.action}: ${m.detail}`);
  }
  lines.push('');
  lines.push('  [Monitoring]');
  for (const m of output.management.monitoring) {
    lines.push(`    • ${m.action}: ${m.detail}`);
  }
  lines.push('');
  lines.push('  [Disposition]');
  for (const m of output.management.disposition) {
    lines.push(`    • ${m.action}: ${m.detail}`);
  }
  lines.push('');
  lines.push(`  Interval Plan: ${output.management.intervalPlan}`);
  lines.push(`  ${output.management.notes}`);
  lines.push('');

  // Education
  lines.push('─── PATIENT EDUCATION ───');
  lines.push(output.educationText);

  return lines.join('\n');
}
