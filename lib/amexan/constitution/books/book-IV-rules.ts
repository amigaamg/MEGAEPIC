import { ObjectType } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';
import { ClinicalContext } from './book-III-context';

export enum RuleCategory {
  Data = 'data',
  Clinical = 'clinical',
  Workflow = 'workflow',
  Security = 'security',
  UI = 'ui',
  Notification = 'notification',
  Reporting = 'reporting',
  Audit = 'audit',
  Interoperability = 'interoperability',
  Versioning = 'versioning',
  Governance = 'governance',
  Privacy = 'privacy',
  Documentation = 'documentation',
}

export enum RuleTrigger {
  BeforeCreate = 'before_create',
  AfterCreate = 'after_create',
  BeforeUpdate = 'before_update',
  AfterUpdate = 'after_update',
  BeforeDelete = 'before_delete',
  OnRead = 'on_read',
  OnTransition = 'on_transition',
  OnEvent = 'on_event',
  Scheduled = 'scheduled',
  BeforeRender = 'before_render',
}

export enum RuleAction {
  Allow = 'allow',
  Deny = 'deny',
  Warn = 'warn',
  Block = 'block',
  Show = 'show',
  Hide = 'hide',
  Require = 'require',
  SetValue = 'set_value',
  SetDefault = 'set_default',
  Notify = 'notify',
  Escalate = 'escalate',
  CreateTask = 'create_task',
  Cascade = 'cascade',
  Log = 'log',
  Override = 'override',
}

export interface Condition {
  field?: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'between' | 'matches' | 'exists' | 'not_exists' | 'one_of' | 'all_of';
  value: unknown;
  path?: string;
}

export interface RuleNode {
  id: string;
  name: string;
  category: RuleCategory;
  trigger: RuleTrigger;
  conditions: Condition[];
  action: RuleAction;
  priority: number;
  targetTypes: ObjectType[];
  contexts: ClinicalContext[];
  overrides: string[];
  explanation: string;
  evidence: string[];
  isActive: boolean;
  version: number;
  metadata: {
    author: string;
    created: number;
    updated: number;
    source: string;
  };
}

export interface RuleGraphEdge {
  sourceId: string;
  targetId: string;
  relationship: RelationshipType.Overrides | RelationshipType.Modifies | RelationshipType.Triggers;
  priority: number;
}

export function createRule(overrides: Partial<RuleNode>): RuleNode {
  return {
    id: crypto.randomUUID(),
    name: 'untitled rule',
    category: RuleCategory.Data,
    trigger: RuleTrigger.BeforeCreate,
    conditions: [],
    action: RuleAction.Allow,
    priority: 0,
    targetTypes: [],
    contexts: [],
    overrides: [],
    explanation: '',
    evidence: [],
    isActive: true,
    version: 1,
    metadata: { author: 'system', created: Date.now(), updated: Date.now(), source: 'amexan-constitution' },
    ...overrides,
  };
}
