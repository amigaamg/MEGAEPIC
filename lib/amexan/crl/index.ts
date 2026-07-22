// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Rule Language (CRL) — Public API
// ═══════════════════════════════════════════════════════════════════════════════

// ── Core Types ────────────────────────────────────────────────────────────
export type {
  ClinicalRule,
  RuleIdentity,
  RuleCategory,
  ConditionGroup,
  Condition,
  ConditionOperator,
  RuleAction,
  ActionType,
  RuleContext,
  PatientContext,
  EncounterContext,
  UserContext,
  EnvironmentContext,
  RuleEvaluation,
  RuleEngineResult,
  ActivatedContext,
  RuleRegistry,
  AgeCategory,
  EncounterType,
  EncounterPriority,
  ClinicianRole,
  SpecialtyPlugin,
} from './types';

// ── Rule Engine ───────────────────────────────────────────────────────────
export {
  evaluateAllRules,
  toActivatedContext,
  createRuleRegistry,
} from './engine';

// ── Context Builder ───────────────────────────────────────────────────────
export { buildRuleContext } from './context-builder';
export type { WorkflowState } from './context-builder';

// ── Built-in Rules ────────────────────────────────────────────────────────
export {
  getAllRules,
  getRulesByCategory,
  createDefaultRuleRegistry,
  SPECIALTY_PLUGINS,
  getActiveSpecialties,
} from './rules/index';
