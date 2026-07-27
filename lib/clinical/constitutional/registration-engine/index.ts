export {
  createRegistrationEngine,
} from './registration-engine';

export type { RegistrationState } from './registration-engine';

export {
  buildClinicalContext,
  resolveAgeGroup,
  resolveReproductiveStage,
  resolveClinicalCohort,
  resolveActiveModules,
  resolveWorkflowType,
  getAvailableHPITemplates,
  getExaminationModules,
} from './context-resolver';

export {
  REGISTRATION_FIELDS,
  REGISTRATION_STAGES,
  INFORMANT_RULES,
} from './field-registry';

export type {
  FieldDefinition,
  FieldVisibilityRule,
  FieldAutofillRule,
  FieldOption,
  FieldType,
} from './field-registry';

export type {
  Answer,
  AnswerState,
  AnswerSource,
  AgeGroup,
  Sex,
  ReproductiveStage,
  PregnancyStatus,
  ClinicalCohort,
  GeriatricSubtype,
  EncounterType,
  Department,
  TriageCategory,
  ModeOfArrival,
  ModuleType,
  RegistrationStage,
  RegistrationState as RegistrationEngineState,
  WorkflowType,
  DemographicContext,
  ClinicalContextState,
  EncounterContextState,
  WorkflowContextState,
  VisibilityRules,
  PermissionContext,
  DocumentationPlan,
  DSSContext,
  ClinicalContext,
  StageDefinition,
  InformantRule,
} from './types';
