export type RuleType = 'data' | 'ui' | 'clinical' | 'workflow' | 'notification' | 'security';

export type RuleOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in' | 'contains' | 'matches'
  | 'exists' | 'not_exists' | 'empty' | 'not_empty'
  | 'between' | 'one_of' | 'every';

export interface RuleCondition {
  fact: string;
  operator: RuleOperator;
  value?: unknown;
}

export interface RuleAction {
  type: string;
  target: string;
  value?: unknown;
  message?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  params?: Record<string, unknown>;
}

export interface RuleDefinition {
  id: string;
  type: RuleType;
  name: string;
  description: string;
  priority: number;
  domain?: string;
  contexts: RuleCondition[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  active: boolean;
  tags: string[];
}

export interface RuleContext {
  patient?: {
    age?: number;
    ageGroup?: 'neonatal' | 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly';
    gender?: 'male' | 'female' | 'other';
    pregnant?: boolean;
    weight?: number;
  };
  encounter?: {
    type?: string;
    phase?: string;
    department?: string;
    specialty?: string;
  };
  symptoms?: Record<string, Record<string, unknown>>;
  vitals?: Record<string, number | string>;
  diagnoses?: string[];
  facts?: Record<string, unknown>;
  environment?: {
    resourceLimited?: boolean;
    icu?: boolean;
    telemedicine?: boolean;
  };
}

export interface RuleValidation {
  valid: boolean;
  errors: RuleValidationError[];
  warnings: RuleValidationWarning[];
}

export interface RuleValidationError {
  field: string;
  message: string;
  code: string;
  actual?: unknown;
  expected?: unknown;
}

export interface RuleValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  ruleType: RuleType;
  priority: number;
  matched: boolean;
  actions: RuleAction[];
  context: RuleContext;
  timestamp: number;
}

export interface RuleSuggestion {
  id: string;
  type: 'investigation' | 'treatment' | 'referral' | 'monitoring' | 'alert' | 'documentation';
  label: string;
  description: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  source: string;
  actions: RuleAction[];
}
