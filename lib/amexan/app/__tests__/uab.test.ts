// UAB — Universal Application Blueprint tests
// Verifies: hierarchy, workspace questions, 13 workspace types, 7 constitutional
// rules, the worked example, and conformance enforcement.

import { describe, it, expect } from 'vitest';
import {
  APPLICATION_HIERARCHY,
  APP_BLUEPRINT_VERSION,
  walkActions,
  walkEvents,
  walkWidgets,
} from '@/lib/amexan/app/blueprint';
import type { ApplicationBlueprint } from '@/lib/amexan/app/blueprint';
import {
  WORKSPACE_QUESTIONS,
  UNIVERSAL_WORKSPACE_TYPES,
  universalWorkspaceDefinitions,
  isUniversalWorkspaceType,
} from '@/lib/amexan/app/workspaces';
import {
  UAB_RULES,
  assertApplicationConstitutional,
  assertApplicationConforms,
  conformantApplication,
  assertCompleteHierarchy,
  APP_FOLDER_STRUCTURE,
} from '@/lib/amexan/app/rules';
import {
  clinicalWorkspaceBlueprint,
  clinicalApplication,
  CLINICAL_WORKED_EXAMPLE_HIERARCHY,
} from '@/lib/amexan/app';

describe('UAB — Core Hierarchy', () => {
  it('defines the 8-level constitutional hierarchy in order', () => {
    expect(APPLICATION_HIERARCHY).toEqual([
      'application',
      'workspace',
      'flow',
      'page',
      'panel',
      'widget',
      'action',
      'event',
    ]);
  });

  it('asserts a complete hierarchy chain', () => {
    expect(() =>
      assertCompleteHierarchy([
        'application',
        'workspace',
        'flow',
        'page',
        'panel',
        'widget',
        'action',
        'event',
      ]),
    ).not.toThrow();
  });

  it('rejects an incomplete hierarchy chain', () => {
    expect(() => assertCompleteHierarchy(['application', 'workspace'])).toThrow(/Incomplete hierarchy/);
  });

  it('blueprint is versioned and immutable', () => {
    expect(APP_BLUEPRINT_VERSION).toBe('1.0.0');
  });
});

describe('UAB — Universal Workspace Model', () => {
  it('defines the four workspace questions', () => {
    expect(WORKSPACE_QUESTIONS).toEqual([
      'what_do_i_need',
      'what_am_i_doing',
      'what_requires_attention',
      'what_happens_next',
    ]);
  });

  it('defines exactly 13 universal workspace types', () => {
    expect(UNIVERSAL_WORKSPACE_TYPES).toEqual([
      'patient',
      'clinician',
      'nursing',
      'emergency',
      'theatre',
      'icu',
      'laboratory',
      'radiology',
      'pharmacy',
      'finance',
      'administration',
      'executive',
      'ministry',
    ]);
  });

  it('every workspace type answers all four questions', () => {
    for (const type of UNIVERSAL_WORKSPACE_TYPES) {
      const def = universalWorkspaceDefinitions[type];
      expect(def.needs.length).toBeGreaterThan(0);
      expect(def.doing.length).toBeGreaterThan(0);
      expect(def.attention.length).toBeGreaterThan(0);
      expect(def.next.length).toBeGreaterThan(0);
    }
  });

  it('validates workspace types', () => {
    expect(isUniversalWorkspaceType('icu')).toBe(true);
    expect(isUniversalWorkspaceType('billing_module')).toBe(false);
  });
});

describe('UAB — Constitutional Rules', () => {
  it('defines the seven rules', () => {
    expect(UAB_RULES).toEqual([
      'applications_expose_constitutional_objects',
      'workspaces_represent_work',
      'flows_represent_healthcare',
      'commands_generate_events',
      'pages_are_lightweight',
      'pages_are_contextual',
      'components_are_universal',
    ]);
  });

  it('defines the folder structure blueprint', () => {
    expect(APP_FOLDER_STRUCTURE).toContain('app/workspaces/');
    expect(APP_FOLDER_STRUCTURE).toContain('app/flows/');
    expect(APP_FOLDER_STRUCTURE).toContain('app/commands/');
    expect(APP_FOLDER_STRUCTURE).toContain('app/actions/');
    expect(APP_FOLDER_STRUCTURE).toContain('app/widgets/');
  });

  it('rejects an application that exposes a table name as an object', () => {
    const bad: ApplicationBlueprint = {
      id: 'bad',
      name: 'Bad',
      description: '',
      objectTypes: ['users_table'],
      workspaces: [],
    };
    const violations = assertApplicationConstitutional(bad);
    expect(violations.some((v) => v.rule === 'applications_expose_constitutional_objects')).toBe(true);
  });

  it('rejects an application with an unknown workspace type', () => {
    const bad: ApplicationBlueprint = {
      id: 'bad',
      name: 'Bad',
      description: '',
      objectTypes: ['patient'],
      workspaces: [
        { id: 'w', type: 'billing_module', title: 'Billing', mission: 'm', questions: [], flows: [] },
      ],
    };
    const violations = assertApplicationConstitutional(bad);
    expect(violations.some((v) => v.rule === 'workspaces_represent_work')).toBe(true);
  });

  it('rejects an action that emits no events', () => {
    const bad: ApplicationBlueprint = {
      id: 'bad',
      name: 'Bad',
      description: '',
      objectTypes: ['patient'],
      workspaces: [
        {
          id: 'w',
          type: 'patient',
          title: 'P',
          mission: 'm',
          questions: [],
          flows: [
            {
              id: 'f',
              name: 'Flow',
              steps: [
                {
                  id: 's',
                  kind: 'end',
                  label: 'End',
                  pages: {
                    p: {
                      purpose: 'purpose',
                      panels: [
                        {
                          id: 'panel',
                          name: 'Panel',
                          widgets: [
                            { id: 'widget', name: 'W', actions: [{ id: 'action', name: 'A', emits: [] }] },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    expect(() => assertApplicationConforms(bad)).toThrow(/commands_generate_events/);
  });
});

describe('UAB — Worked Example (Clinical)', () => {
  it('defines the exact worked-example hierarchy', () => {
    expect(CLINICAL_WORKED_EXAMPLE_HIERARCHY).toEqual([
      'clinical',
      'patient-workspace',
      'encounter-flow',
      'history-page',
      'history-card',
      'symptoms-widget',
      'record-symptom',
      'symptom-recorded',
    ]);
  });

  it('is fully conformant', () => {
    expect(assertApplicationConstitutional(clinicalWorkspaceBlueprint)).toEqual([]);
  });

  it('clinicalApplication reports blueprint version and conformance', () => {
    expect(clinicalApplication.blueprintVersion).toBe('1.0.0');
    expect(clinicalApplication.conformance).toHaveLength(UAB_RULES.length);
    expect(clinicalApplication.conformance).toContain('commands_generate_events');
  });

  it('walks the full hierarchy: 2 workspaces flows', () => {
    const actions = walkActions(clinicalWorkspaceBlueprint);
    expect(actions.length).toBeGreaterThan(0);
  });

  it('every walked event carries EAT-R side effects', () => {
    const events = walkEvents(clinicalWorkspaceBlueprint);
    expect(events.length).toBeGreaterThan(0);
    for (const location of events) {
      expect(location.event.sideEffects.length).toBeGreaterThan(0);
    }
  });

  it('reuses widgets across pages (Rule 7 satisfied)', () => {
    const widgets = walkWidgets(clinicalWorkspaceBlueprint);
    const unique = new Set(widgets.map((w) => w.widget.id));
    expect(unique.size).toBeLessThan(widgets.length);
  });

  it('conformantApplication returns a deep clone with conformance', () => {
    expect(conformantApplication(clinicalWorkspaceBlueprint).conformance).toHaveLength(7);
  });
});
