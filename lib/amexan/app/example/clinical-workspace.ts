/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UAB — Worked Example
 *
 * The canonical worked example from the Phase 5 blueprint:
 *
 *   Clinical Workspace
 *     ↓ Patient Workspace
 *     ↓ Encounter Flow
 *     ↓ History Page
 *     ↓ History Card (Panel)
 *     ↓ Symptoms Widget
 *     ↓ Record Symptom (Action)
 *     ↓ SymptomRecorded (Event)
 *
 * This is a complete, conformant application. It is the reference that every
 * future application mirrors.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { ApplicationBlueprint } from '../blueprint';
import { conformantApplication } from '../rules';

export const clinicalWorkspaceBlueprint: ApplicationBlueprint = {
  id: 'clinical',
  name: 'Clinical',
  description: 'The clinical application: everything needed to care for a patient.',
  objectTypes: ['patient', 'encounter', 'episode', 'problem', 'symptom', 'order', 'observation', 'medication'],
  workspaces: [
    {
      id: 'patient-workspace',
      type: 'patient',
      title: 'Patient Workspace',
      mission: 'Everything about one patient in one place.',
      questions: [
        { question: 'what_do_i_need', answer: 'One lifelong record — history, problems, medications, plans.' },
        { question: 'what_am_i_doing', answer: 'Understand this patient, review status, decide next care.' },
        { question: 'what_requires_attention', answer: 'Alerts, critical results, outstanding tasks for this patient.' },
        { question: 'what_happens_next', answer: 'Next review, next order, next follow-up for this patient.' },
      ],
      flows: [
        {
          id: 'encounter-flow',
          name: 'Encounter',
          steps: [
            {
              id: 'history-step',
              kind: 'task',
              label: 'History',
              pages: {
                'history-page': {
                  purpose: 'Capture the clinical history in one place.',
                  panels: [
                    {
                      id: 'history-card',
                      name: 'History Card',
                      widgets: [
                        {
                          id: 'symptoms-widget',
                          name: 'Symptoms',
                          objectType: 'symptom',
                          actions: [
                            {
                              id: 'record-symptom',
                              name: 'Record Symptom',
                              emits: [
                                {
                                  id: 'symptom-recorded',
                                  name: 'SymptomRecorded',
                                  affects: ['patient', 'encounter', 'symptom'],
                                  sideEffects: ['audit', 'telemetry', 'analytics', 'notification', 'sync', 'workflow', 'rules'],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: 'complaint-widget',
                          name: 'Chief Complaint',
                          objectType: 'symptom',
                          actions: [
                            {
                              id: 'record-chief-complaint',
                              name: 'Record Chief Complaint',
                              emits: [
                                {
                                  id: 'chief-complaint-recorded',
                                  name: 'ChiefComplaintRecorded',
                                  affects: ['patient', 'encounter'],
                                  sideEffects: ['audit', 'telemetry', 'analytics', 'sync', 'workflow'],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                'review-page': {
                  purpose: 'Review the completed history before continuing.',
                  panels: [
                    {
                      id: 'summary-panel',
                      name: 'History Summary',
                      widgets: [
                        {
                          id: 'symptoms-widget',
                          name: 'Symptoms',
                          objectType: 'symptom',
                          actions: [
                            {
                              id: 'confirm-symptoms',
                              name: 'Confirm Symptoms',
                              emits: [
                                {
                                  id: 'symptoms-confirmed',
                                  name: 'SymptomsConfirmed',
                                  affects: ['encounter', 'symptom'],
                                  sideEffects: ['audit', 'telemetry', 'analytics', 'sync', 'workflow'],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              id: 'assessment-step',
              kind: 'task',
              label: 'Assessment',
              pages: {
                'assessment-page': {
                  purpose: 'Document the assessment for this encounter.',
                  panels: [
                    {
                      id: 'assessment-panel',
                      name: 'Assessment',
                      widgets: [
                        {
                          id: 'problems-widget',
                          name: 'Problems',
                          objectType: 'problem',
                          actions: [
                            {
                              id: 'add-problem',
                              name: 'Add Problem',
                              emits: [
                                {
                                  id: 'problem-added',
                                  name: 'ProblemAdded',
                                  affects: ['patient', 'encounter', 'problem'],
                                  sideEffects: ['audit', 'telemetry', 'analytics', 'sync', 'workflow', 'rules'],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              id: 'end-step',
              kind: 'end',
              label: 'Encounter Complete',
              pages: {
                'completion-page': {
                  purpose: 'Confirm the encounter is complete.',
                  panels: [
                    {
                      id: 'completion-panel',
                      name: 'Completion',
                      widgets: [
                        {
                          id: 'symptoms-widget',
                          name: 'Symptoms',
                          objectType: 'symptom',
                          actions: [
                            {
                              id: 'complete-encounter',
                              name: 'Complete Encounter',
                              emits: [
                                {
                                  id: 'encounter-completed',
                                  name: 'EncounterCompleted',
                                  affects: ['encounter', 'episode'],
                                  sideEffects: ['audit', 'telemetry', 'analytics', 'notification', 'sync', 'workflow'],
                                },
                              ],
                            },
                          ],
                        },
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

/** The conformant reference application. Throws if the example itself is unconstitutional. */
export const clinicalApplication = conformantApplication(clinicalWorkspaceBlueprint);

/** The exact hierarchy chain from the Phase 5 worked example. */
export const CLINICAL_WORKED_EXAMPLE_HIERARCHY = [
  'clinical',
  'patient-workspace',
  'encounter-flow',
  'history-page',
  'history-card',
  'symptoms-widget',
  'record-symptom',
  'symptom-recorded',
];
