import { EventEngine } from '../events/engine';
import type { CascadeEffect, ClinicalEvent } from '../events/types';
import { PatientState } from './types';
import * as StateMachine from './state-machine';
import * as TaskEngine from './task-engine';

export interface ActiveWorkflow {
  id: string;
  patientId: string;
  patientName?: string;
  currentState: PatientState;
  previousStates: PatientState[];
  tasks: string[];
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, unknown>;
}

export class WorkflowCoordinator {
  private workflows: Map<string, ActiveWorkflow> = new Map();
  private unsubscribers: Array<() => void> = [];

  connect(eventEngine: EventEngine): void {
    const unsub = eventEngine.onCascade(this.handleCascade.bind(this));
    this.unsubscribers.push(unsub);
  }

  disconnect(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
  }

  createWorkflow(patientId: string, opts?: { metadata?: Record<string, unknown>; patientName?: string }): ActiveWorkflow {
    const id = `wf_${crypto.randomUUID()}`;
    const wf: ActiveWorkflow = {
      id,
      patientId,
      patientName: opts?.patientName,
      currentState: PatientState.SelfCare,
      previousStates: [],
      tasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: opts?.metadata || {},
    };
    this.workflows.set(id, wf);
    return wf;
  }

  getWorkflow(id: string): ActiveWorkflow | undefined {
    return this.workflows.get(id);
  }

  getWorkflowsByPatient(patientId: string): ActiveWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.patientId === patientId);
  }

  getWorkflowsByState(state: PatientState): ActiveWorkflow[] {
    return Array.from(this.workflows.values()).filter(w => w.currentState === state);
  }

  getAllWorkflows(): ActiveWorkflow[] {
    return Array.from(this.workflows.values());
  }

  transitionTo(workflowId: string, newState: PatientState): { success: boolean; error?: string } {
    const wf = this.workflows.get(workflowId);
    if (!wf) return { success: false, error: 'Workflow not found' };

    const result = StateMachine.transitionPatient(
      { id: wf.id, patientId: wf.patientId, currentState: wf.currentState, previousStates: wf.previousStates, owner: '', priority: 0, dependencies: [], clock: 0, tasks: [], escalationLevel: 0, createdAt: wf.createdAt },
      newState,
    );

    if (result.error) return { success: false, error: result.error };

    wf.previousStates = result.workflow!.previousStates;
    wf.currentState = result.workflow!.currentState;
    wf.updatedAt = Date.now();
    return { success: true };
  }

  getValidTransitions(workflowId: string): PatientState[] {
    const wf = this.workflows.get(workflowId);
    if (!wf) return [];
    return StateMachine.getValidTransitions(wf.currentState);
  }

  private handleCascade(effect: CascadeEffect, trigger: ClinicalEvent): void {
    const patientId = trigger.patient.id;

    switch (effect.type) {
      case 'trigger_workflow': {
        const targetState = effect.params?.state as PatientState | undefined;
        const step = effect.params?.step as string | undefined;
        if (targetState) {
          const wfs = this.getWorkflowsByPatient(patientId);
          for (const wf of wfs) {
            this.transitionTo(wf.id, targetState);
          }
        } else if (step) {
          const stateFromStep = this.mapStepToState(step);
          if (stateFromStep) {
            const wfs = this.getWorkflowsByPatient(patientId);
            for (const wf of wfs) {
              this.transitionTo(wf.id, stateFromStep);
            }
          }
        }
        break;
      }

      case 'generate_task': {
        const taskType = (effect.params?.type as string) || 'clinical_task';
        const priority = (effect.params?.priority as string) || 'normal';
        const wfs = this.getWorkflowsByPatient(patientId);
        if (wfs.length > 0) {
          const task = TaskEngine.createTask(
            wfs[0].id,
            taskType,
            `${taskType.replace(/_/g, ' ')} (${trigger.type})`,
            undefined,
            priority === 'critical' ? Date.now() + 15 * 60000 : priority === 'high' ? Date.now() + 60 * 60000 : undefined,
          );
          wfs[0].tasks.push(task.id);
        }
        break;
      }

      case 'send_notification': {
        break;
      }
    }
  }

  private mapStepToState(step: string): PatientState | null {
    const map: Record<string, PatientState> = {
      triage: PatientState.Triage,
      consultation: PatientState.Consultation,
      pharmacy: PatientState.Pharmacy,
      laboratory: PatientState.Laboratory,
      radiology: PatientState.Radiology,
      ward_assignment: PatientState.Ward,
      admission: PatientState.Admission,
      discharge: PatientState.Discharge,
      icu: PatientState.ICU,
      theatre: PatientState.Theatre,
      follow_up: PatientState.FollowUp,
      referral: PatientState.Referral,
      telemedicine: PatientState.Telemedicine,
      physiotherapy: PatientState.Physiotherapy,
      monitoring: PatientState.LongTermMonitoring,
      home_care: PatientState.HomeCare,
      community: PatientState.CommunityCare,
      observation: PatientState.Observation,
      recovery: PatientState.Recovery,
      escalation: PatientState.Escalation,
    };
    return map[step] || null;
  }
}
