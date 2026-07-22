export type SafetyCategory =
  | 'harmful_content'
  | 'phi_leakage'
  | 'hallucination_risk'
  | 'diagnostic_uncertainty'
  | 'treatment_recommendation'
  | 'contraindication'
  | 'scope_violation'
  | 'bias_discrimination'
  | 'legal_compliance'
  | 'emergency_trigger'

export type SafetySeverity = 'info' | 'warning' | 'error' | 'critical'

export interface SafetyRule {
  id: string
  category: SafetyCategory
  description: string
  severity: SafetySeverity
  check: (content: string, context: SafetyContext) => SafetyViolation | null
}

export interface SafetyViolation {
  ruleId: string
  category: SafetyCategory
  severity: SafetySeverity
  message: string
  snippet?: string
  suggestion?: string
  autoRemediate?: boolean
}

export interface SafetyContext {
  patientId?: string
  encounterType: string
  department: string
  knownAllergies: string[]
  activeMedications: string[]
  knownDiagnoses: string[]
  patientAge: number
  pregnant: boolean
  liverDisease: boolean
  renalDisease: boolean
  userRole: 'doctor' | 'nurse' | 'medical_officer' | 'consultant' | 'student'
  jurisdiction?: string
}

export interface SafetyReport {
  passed: boolean
  violations: SafetyViolation[]
  summary: string
  recommendedActions: string[]
  timestamp: string
}

// ── Safety Rules ──────────────────────────────────────────────────────────────

const SAFETY_RULES: SafetyRule[] = [
  {
    id: 'PHI-001',
    category: 'phi_leakage',
    description: 'Detect patient identifiers in AI-generated content',
    severity: 'critical',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      const phiPatterns = [
        /\b\d{3}-\d{2}-\d{4}\b/,   // SSN
        /\b\d{10}\b/,               // 10-digit IDs
        /\b[A-Z]{2}\d{6}\b/,        // Medical record numbers
        /\b\d{3}\s?\d{3}\s?\d{4}\b/, // Phone numbers
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
      ];
      for (const pattern of phiPatterns) {
        const match = content.match(pattern);
        if (match) {
          return {
            ruleId: 'PHI-001',
            category: 'phi_leakage',
            severity: 'critical',
            message: 'Potential PHI detected in generated content',
            snippet: match[0],
            suggestion: 'Redact or mask the identified PHI before using content',
            autoRemediate: false,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'HARM-001',
    category: 'harmful_content',
    description: 'Detect unsafe clinical suggestions',
    severity: 'error',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      const harmfulPatterns = [
        /\bdo\s+not\s+(treat|resuscitate|admit)/i,
        /\bwithhold\s+(treatment|medication|care)/i,
        /\bdischarge\s+(against|without)\s+(medical\s+)?advice\b/i,
      ];
      for (const pattern of harmfulPatterns) {
        if (pattern.test(content)) {
          return {
            ruleId: 'HARM-001',
            category: 'harmful_content',
            severity: 'error',
            message: 'Content contains potentially harmful clinical instructions',
            suggestion: 'Review clinical decision support override carefully',
            autoRemediate: false,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'DXDX-001',
    category: 'diagnostic_uncertainty',
    description: 'Flag definitive diagnostic language when uncertainty exists',
    severity: 'warning',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      const definitive = /\b(diagnosed|confirmed|definite|certain|ruled\s+out)\s+(with|as|to\s+be)\b/i;
      const uncertain = /\b(may|might|could|possibly|probably|suggests|consistent\s+with)\b/i;
      const defMatch = content.match(definitive);
      const uncMatch = content.match(uncertain);
      if (defMatch && !uncMatch) {
        return {
          ruleId: 'DXDX-001',
          category: 'diagnostic_uncertainty',
          severity: 'warning',
          message: 'Definitive diagnostic language used without qualifying uncertainty',
          snippet: defMatch[0],
          suggestion: 'Add qualifiers like "consistent with" or "suggests" instead',
          autoRemediate: true,
        };
      }
      return null;
    },
  },
  {
    id: 'CONTRA-001',
    category: 'contraindication',
    description: 'Check medication suggestions against known allergies',
    severity: 'critical',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      if (ctx.knownAllergies.length === 0) return null;
      const contentLower = content.toLowerCase();
      for (const allergy of ctx.knownAllergies) {
        const allergyLower = allergy.toLowerCase();
        if (contentLower.includes(allergyLower)) {
          return {
            ruleId: 'CONTRA-001',
            category: 'contraindication',
            severity: 'critical',
            message: `Suggested ${allergy} which is listed as an allergy for this patient`,
            snippet: allergy,
            suggestion: `Consider alternative to ${allergy}`,
            autoRemediate: false,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'CONTRA-002',
    category: 'contraindication',
    description: 'Pregnancy-related medication safety check',
    severity: 'critical',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      if (!ctx.pregnant) return null;
      const pregnancyContraindicated = [
        'isotretinoin', 'valproate', 'methotrexate', 'warfarin',
        'lisinopril', 'enalapril', 'atorvastatin', 'tetracycline',
        'doxycycline', 'phenytoin', 'carbamazepine',
      ];
      const contentLower = content.toLowerCase();
      for (const drug of pregnancyContraindicated) {
        if (contentLower.includes(drug)) {
          return {
            ruleId: 'CONTRA-002',
            category: 'contraindication',
            severity: 'critical',
            message: `${drug} is contraindicated in pregnancy`,
            snippet: drug,
            suggestion: `Consider pregnancy-safe alternative to ${drug}`,
            autoRemediate: false,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'CONTRA-003',
    category: 'contraindication',
    description: 'Renal/hepatic impairment medication safety check',
    severity: 'error',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      if (!ctx.renalDisease && !ctx.liverDisease) return null;
      const renallyCleared = ['gentamicin', 'vancomycin', 'metformin', 'digoxin', 'enoxaparin', 'rivaroxaban'];
      const hepaticallyMetabolized = ['paracetamol', 'acetaminophen', 'methotrexate', 'rifampin', 'isoniazid'];
      const contentLower = content.toLowerCase();
      const issues: string[] = [];
      if (ctx.renalDisease) {
        for (const drug of renallyCleared) {
          if (contentLower.includes(drug)) issues.push(`${drug} (renally cleared — adjust dose)`);
        }
      }
      if (ctx.liverDisease) {
        for (const drug of hepaticallyMetabolized) {
          if (contentLower.includes(drug)) issues.push(`${drug} (hepatically metabolized — caution)`);
        }
      }
      if (issues.length > 0) {
        return {
          ruleId: 'CONTRA-003',
          category: 'contraindication',
          severity: 'error',
          message: `Medication(s) requiring adjustment: ${issues.join(', ')}`,
          suggestion: 'Dose adjustment or alternative recommended',
          autoRemediate: false,
        };
      }
      return null;
    },
  },
  {
    id: 'HALL-001',
    category: 'hallucination_risk',
    description: 'Flag fabricated-looking numeric values',
    severity: 'warning',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      const unrealisticNumeric = [
        /heart\s*rate\s*:?\s*\d{4,}/i,
        /temperature\s*:?\s*\d{3,}/i,
        /blood\s*pressure\s*:?\s*\d{4,}\/\d+/i,
        /weight\s*:?\s*\d{4,}\s*kg/i,
      ];
      for (const pattern of unrealisticNumeric) {
        const match = content.match(pattern);
        if (match) {
          return {
            ruleId: 'HALL-001',
            category: 'hallucination_risk',
            severity: 'warning',
            message: 'Unrealistic clinical values detected — possible hallucination',
            snippet: match[0],
            suggestion: 'Verify values against actual measurements',
            autoRemediate: false,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'SCOPE-001',
    category: 'scope_violation',
    description: 'Check if recommendations are within clinician scope',
    severity: 'warning',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      if (ctx.userRole === 'student' || ctx.userRole === 'nurse') {
        const prescriptionPatterns = [
          /prescribe\b/i, /start\s+\w+\s+(therapy|treatment)/i,
          /administer\s+\w+\s+(mg|g|IU)/i, /order\s+\w+\s+(x-ray|ct|mri|lab)/i,
        ];
        for (const pattern of prescriptionPatterns) {
          if (pattern.test(content)) {
            return {
              ruleId: 'SCOPE-001',
              category: 'scope_violation',
              severity: 'warning',
              message: `Content contains prescribing/ordering actions beyond ${ctx.userRole} scope`,
              suggestion: 'Flag for physician review before execution',
              autoRemediate: false,
            };
          }
        }
      }
      return null;
    },
  },
  {
    id: 'EMERG-001',
    category: 'emergency_trigger',
    description: 'Detect emergency clinical situations requiring immediate action',
    severity: 'critical',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      const emergencyTriggers = [
        /\b(anaphylaxis|septic\s*shock|cardiac\s*arrest|respiratory\s*arrest|status\s+epilepticus)\b/i,
        /\b(airway\s*compromise|impending\s*airway|stridor|complete\s*airway\s*obstruction)\b/i,
        /\b(meningitis|encephalitis|subarachnoid\s*hemorrhage|intracranial\s*hemorrhage)\b/i,
      ];
      for (const pattern of emergencyTriggers) {
        const match = content.match(pattern);
        if (match) {
          return {
            ruleId: 'EMERG-001',
            category: 'emergency_trigger',
            severity: 'critical',
            message: `Emergency condition detected: ${match[0]}`,
            snippet: match[0],
            suggestion: 'Immediate clinical intervention required — escalate to senior clinician',
            autoRemediate: false,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'BIAS-001',
    category: 'bias_discrimination',
    description: 'Detect potentially biased or discriminatory language',
    severity: 'warning',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      const biasPatterns = [
        /\bnon[-\s]?compliant\b/i,
        /\bdrug[-\s]?seeking\b/i,
        /\bfrequent[-\s]?flyer\b/i,
        /\bpatient\s+refuses?\b/i,
        /\bover[-\s]?react(ing|s)?\b/i,
      ];
      for (const pattern of biasPatterns) {
        const match = content.match(pattern);
        if (match) {
          return {
            ruleId: 'BIAS-001',
            category: 'bias_discrimination',
            severity: 'warning',
            message: 'Potentially biased or stigmatizing language detected',
            snippet: match[0],
            suggestion: 'Use neutral, objective clinical language',
            autoRemediate: true,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'LEGAL-001',
    category: 'legal_compliance',
    description: 'Check jurisdiction-specific content compliance',
    severity: 'error',
    check: (content: string, ctx: SafetyContext): SafetyViolation | null => {
      if (ctx.jurisdiction === 'uk') {
        const nonNhs = /\b(recommend|suggest)\s+(brand[-\s]?name|proprietary)\s+(drug|medication)\b/i;
        if (nonNhs.test(content)) {
          return {
            ruleId: 'LEGAL-001',
            category: 'legal_compliance',
            severity: 'error',
            message: 'Brand-name recommendation in NHS context — use generic names',
            suggestion: 'Use generic (INN) medication names',
            autoRemediate: true,
          };
        }
      }
      return null;
    },
  },
];

export function registerSafetyRule(rule: SafetyRule): void {
  SAFETY_RULES.push(rule);
}

export function registerSafetyRules(rules: SafetyRule[]): void {
  SAFETY_RULES.push(...rules);
}

// ── Safety Evaluation ─────────────────────────────────────────────────────────

export function evaluateAIContentSafety(
  content: string,
  context: SafetyContext,
  options?: { rules?: string[]; categories?: SafetyCategory[] },
): SafetyReport {
  const violations: SafetyViolation[] = [];
  let rulesToCheck = SAFETY_RULES;

  if (options?.rules) {
    rulesToCheck = rulesToCheck.filter(r => options.rules!.includes(r.id));
  }

  if (options?.categories) {
    rulesToCheck = rulesToCheck.filter(r => options.categories!.includes(r.category));
  }

  for (const rule of rulesToCheck) {
    try {
      const result = rule.check(content, context);
      if (result) {
        violations.push(result);
      }
    } catch {
      violations.push({
        ruleId: rule.id,
        category: rule.category,
        severity: 'error',
        message: `Error evaluating rule ${rule.id}`,
        autoRemediate: false,
      });
    }
  }

  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const errorViolations = violations.filter(v => v.severity === 'error');

  return {
    passed: criticalViolations.length === 0,
    violations,
    summary: buildSafetySummary(violations),
    recommendedActions: buildRecommendedActions(violations),
    timestamp: new Date().toISOString(),
  };
}

export function autoRemediate(content: string, report: SafetyReport): string {
  let remediated = content;

  for (const violation of report.violations) {
    if (!violation.autoRemediate) continue;

    switch (violation.ruleId) {
      case 'DXDX-001':
        remediated = remediated.replace(/\b(diagnosed)\b/gi, 'suspected');
        remediated = remediated.replace(/\b(confirmed)\b/gi, 'consistent with');
        remediated = remediated.replace(/\b(definite|certain)\b/gi, 'likely');
        break;
      case 'BIAS-001':
        remediated = remediated.replace(/\bnon-compliant\b/gi, 'not adherent to');
        remediated = remediated.replace(/\bnoncompliant\b/gi, 'nonadherent');
        remediated = remediated.replace(/\bdrug-seeking\b/gi, 'requesting analgesia');
        remediated = remediated.replace(/\bfrequent-flyer\b/gi, 'frequent attender');
        remediated = remediated.replace(/\bover-react(s|ing)?\b/gi, 'expresses strong');
        break;
      case 'LEGAL-001':
        remediated = remediated.replace(/\b(brand[-\s]?name)\s+(drug|medication)\b/gi, 'generic');
        break;
    }
  }

  return remediated;
}

function buildSafetySummary(violations: SafetyViolation[]): string {
  if (violations.length === 0) return 'All safety checks passed';

  const critical = violations.filter(v => v.severity === 'critical').length;
  const errors = violations.filter(v => v.severity === 'error').length;
  const warnings = violations.filter(v => v.severity === 'warning').length;

  const parts: string[] = [];
  if (critical > 0) parts.push(`${critical} critical`);
  if (errors > 0) parts.push(`${errors} error`);
  if (warnings > 0) parts.push(`${warnings} warning`);

  return `${parts.join(', ')} violation(s) detected`;
}

function buildRecommendedActions(violations: SafetyViolation[]): string[] {
  const actions = new Set<string>();

  for (const v of violations) {
    if (v.severity === 'critical' || v.severity === 'error') {
      if (v.suggestion) actions.add(v.suggestion);
    }
  }

  if (violations.some(v => v.category === 'emergency_trigger')) {
    actions.add('Escalate to senior clinician immediately');
  }

  return Array.from(actions);
}

// ── Utility ───────────────────────────────────────────────────────────────────

export function getSafetyRulesByCategory(category: SafetyCategory): SafetyRule[] {
  return SAFETY_RULES.filter(r => r.category === category);
}

export function getSafetyRulesByIds(ids: string[]): SafetyRule[] {
  return SAFETY_RULES.filter(r => ids.includes(r.id));
}

export function getAllSafetyRules(): SafetyRule[] {
  return [...SAFETY_RULES];
}
