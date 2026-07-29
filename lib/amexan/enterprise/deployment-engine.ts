// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DEPLOYMENT / INSTALLATION ENGINE
// Implementation project workflow: assessment, migration, training,
// testing, go-live, hypercare, support. Pure business logic.
// ═══════════════════════════════════════════════════════════════════════════════

import { Organization, Facility, DeploymentStatus } from './business-constitution';

export type ProjectPhase =
  | 'signed' | 'infrastructure_assessment' | 'migration' | 'training'
  | 'testing' | 'go_live' | 'hypercare' | 'support_handoff' | 'complete';

export interface ImplementationProject {
  id: string;
  organizationId: string;
  facilityIds: string[];
  phases: PhaseProgress[];
  currentPhase: ProjectPhase;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'complete' | 'cancelled';
  startDate: string;
  estimatedGoLive: string;
  actualGoLive?: string;
  projectManager: string;
  assignedTeam: string[];
  blockers: Blocker[];
  milestones: Milestone[];
  notes: string;
}

export interface PhaseProgress {
  phase: ProjectPhase;
  label: string;
  completion: number;
  startedAt?: string;
  completedAt?: string;
  assignedTo: string[];
  tasks: TaskItem[];
}

export interface TaskItem {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  assignedTo: string;
}

export interface Blocker {
  id: string;
  description: string;
  category: 'technical' | 'training' | 'data_migration' | 'infrastructure' | 'customer' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  raisedAt: string;
  resolvedAt?: string;
  notes: string;
}

export interface Milestone {
  id: string;
  label: string;
  phase: ProjectPhase;
  dueDate: string;
  completedAt?: string;
  amount?: number;
}

export interface InfrastructureRequirement {
  category: 'server' | 'network' | 'storage' | 'power' | 'internet' | 'workstation';
  requirement: string;
  status: 'pending' | 'met' | 'not_applicable';
  notes: string;
}

export class DeploymentEngine {
  createProject(org: Organization, facilities: Facility[], pm: string): ImplementationProject {
    const now = new Date().toISOString();
    const estimatedGoLive = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const phases: PhaseProgress[] = [
      { phase: 'signed', label: 'Contract Signed', completion: 100, startedAt: now, completedAt: now, assignedTo: [pm], tasks: [] },
      { phase: 'infrastructure_assessment', label: 'Infrastructure Assessment', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('infrastructure') },
      { phase: 'migration', label: 'Data Migration', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('migration') },
      { phase: 'training', label: 'Staff Training', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('training') },
      { phase: 'testing', label: 'System Testing', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('testing') },
      { phase: 'go_live', label: 'Go Live', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('go_live') },
      { phase: 'hypercare', label: 'Hypercare Support', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('hypercare') },
      { phase: 'support_handoff', label: 'Support Handoff', completion: 0, assignedTo: [pm], tasks: this.defaultTasks('handoff') },
    ];

    return {
      id: `impl_${org.id}_${Date.now()}`,
      organizationId: org.id,
      facilityIds: facilities.map(f => f.id),
      phases, currentPhase: 'infrastructure_assessment',
      status: 'in_progress', startDate: now, estimatedGoLive,
      projectManager: pm, assignedTeam: [pm],
      blockers: [], milestones: [], notes: '',
    };
  }

  advancePhase(project: ImplementationProject): ImplementationProject {
    const order: ProjectPhase[] = [
      'signed', 'infrastructure_assessment', 'migration', 'training',
      'testing', 'go_live', 'hypercare', 'support_handoff', 'complete',
    ];
    const currentIdx = order.indexOf(project.currentPhase);
    if (currentIdx >= order.length - 1) return { ...project, status: 'complete' };
    const nextPhase = order[currentIdx + 1];
    const updatedPhases = project.phases.map(p => {
      if (p.phase === project.currentPhase) return { ...p, completion: 100, completedAt: new Date().toISOString() };
      if (p.phase === nextPhase) return { ...p, startedAt: p.startedAt || new Date().toISOString() };
      return p;
    });
    return { ...project, phases: updatedPhases, currentPhase: nextPhase };
  }

  completeTask(project: ImplementationProject, phase: ProjectPhase, taskId: string): ImplementationProject {
    return {
      ...project,
      phases: project.phases.map(p => {
        if (p.phase !== phase) return p;
        const tasks = p.tasks.map(t =>
          t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t,
        );
        const completedCount = tasks.filter(t => t.completed).length;
        const completion = tasks.length > 0 ? Math.round(completedCount / tasks.length * 100) : 100;
        return { ...p, tasks, completion };
      }),
    };
  }

  addBlocker(project: ImplementationProject, blocker: Omit<Blocker, 'id' | 'raisedAt'>): ImplementationProject {
    return {
      ...project,
      blockers: [...project.blockers, { ...blocker, id: `blk_${Date.now()}`, raisedAt: new Date().toISOString() }],
    };
  }

  resolveBlocker(project: ImplementationProject, blockerId: string): ImplementationProject {
    return {
      ...project,
      blockers: project.blockers.map(b =>
        b.id === blockerId ? { ...b, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : b,
      ),
    };
  }

  getInfrastructureChecklist(facilityType: Facility['type']): InfrastructureRequirement[] {
    const common: InfrastructureRequirement[] = [
      { category: 'internet', requirement: 'Stable internet connection (≥10 Mbps)', status: 'pending', notes: '' },
      { category: 'power', requirement: 'Uninterruptible power supply (UPS)', status: 'pending', notes: '' },
    ];
    if (facilityType === 'hospital') {
      return [
        ...common,
        { category: 'server', requirement: 'Dedicated server or cloud instance (8 vCPU, 32GB RAM)', status: 'pending', notes: '' },
        { category: 'storage', requirement: 'Minimum 500GB SSD storage', status: 'pending', notes: '' },
        { category: 'network', requirement: 'Internal LAN with workstation connectivity', status: 'pending', notes: '' },
        { category: 'workstation', requirement: '≥10 workstations with modern browser', status: 'pending', notes: '' },
      ];
    }
    return [
      ...common,
      { category: 'workstation', requirement: 'Minimum 2 workstations with modern browser', status: 'pending', notes: '' },
    ];
  }

  estimateTimeline(facilities: number, scope: 'basic' | 'standard' | 'full'): { minDays: number; maxDays: number; phases: Record<ProjectPhase, { min: number; max: number }> } {
    const mult = scope === 'basic' ? 0.7 : scope === 'full' ? 1.5 : 1.0;
    const base = facilities * mult;
    return {
      minDays: Math.round(30 * base), maxDays: Math.round(90 * base),
      phases: {
        signed: { min: 1, max: 5 },
        infrastructure_assessment: { min: Math.round(3 * base), max: Math.round(7 * base) },
        migration: { min: Math.round(5 * base), max: Math.round(15 * base) },
        training: { min: Math.round(5 * base), max: Math.round(14 * base) },
        testing: { min: Math.round(5 * base), max: Math.round(10 * base) },
        go_live: { min: Math.round(2 * base), max: Math.round(5 * base) },
        hypercare: { min: Math.round(7 * base), max: Math.round(14 * base) },
        support_handoff: { min: 1, max: 3 },
        complete: { min: 0, max: 0 },
      },
    };
  }

  getProjectHealth(project: ImplementationProject): { status: 'on_track' | 'at_risk' | 'delayed'; overallCompletion: number; openBlockers: number } {
    const avgCompletion = Math.round(project.phases.reduce((s, p) => s + p.completion, 0) / project.phases.length);
    const openBlockers = project.blockers.filter(b => b.status !== 'resolved').length;
    const criticalBlockers = project.blockers.filter(b => b.severity === 'critical' && b.status !== 'resolved').length;

    if (criticalBlockers > 0 || openBlockers > 3) return { status: 'delayed', overallCompletion: avgCompletion, openBlockers };
    if (openBlockers > 0) return { status: 'at_risk', overallCompletion: avgCompletion, openBlockers };
    return { status: 'on_track', overallCompletion: avgCompletion, openBlockers };
  }

  private defaultTasks(phase: string): TaskItem[] {
    const tasks: Record<string, TaskItem[]> = {
      infrastructure: [
        { id: 'infra_1', description: 'Assess existing hardware', completed: false, assignedTo: '' },
        { id: 'infra_2', description: 'Verify internet connectivity and speed', completed: false, assignedTo: '' },
        { id: 'infra_3', description: 'Check power backup systems', completed: false, assignedTo: '' },
        { id: 'infra_4', description: 'Provision cloud or on-premise server', completed: false, assignedTo: '' },
        { id: 'infra_5', description: 'Configure network and firewall', completed: false, assignedTo: '' },
      ],
      migration: [
        { id: 'mig_1', description: 'Audit existing data sources', completed: false, assignedTo: '' },
        { id: 'mig_2', description: 'Map data fields to AMEXAN schema', completed: false, assignedTo: '' },
        { id: 'mig_3', description: 'Run data extraction scripts', completed: false, assignedTo: '' },
        { id: 'mig_4', description: 'Validate migrated data integrity', completed: false, assignedTo: '' },
        { id: 'mig_5', description: 'Customer sign-off on migration', completed: false, assignedTo: '' },
      ],
      training: [
        { id: 'train_1', description: 'Schedule training sessions', completed: false, assignedTo: '' },
        { id: 'train_2', description: 'Train administrators', completed: false, assignedTo: '' },
        { id: 'train_3', description: 'Train clinical staff', completed: false, assignedTo: '' },
        { id: 'train_4', description: 'Train billing/finance staff', completed: false, assignedTo: '' },
        { id: 'train_5', description: 'Competency assessment', completed: false, assignedTo: '' },
      ],
      testing: [
        { id: 'test_1', description: 'System integration testing', completed: false, assignedTo: '' },
        { id: 'test_2', description: 'User acceptance testing', completed: false, assignedTo: '' },
        { id: 'test_3', description: 'Performance and load testing', completed: false, assignedTo: '' },
        { id: 'test_4', description: 'Security audit', completed: false, assignedTo: '' },
        { id: 'test_5', description: 'Customer sign-off for go-live', completed: false, assignedTo: '' },
      ],
      go_live: [
        { id: 'gl_1', description: 'Final data sync and backup', completed: false, assignedTo: '' },
        { id: 'gl_2', description: 'Cutover from legacy system', completed: false, assignedTo: '' },
        { id: 'gl_3', description: 'Monitor first 24 hours', completed: false, assignedTo: '' },
        { id: 'gl_4', description: 'Verify all modules operational', completed: false, assignedTo: '' },
        { id: 'gl_5', description: 'Declare go-live complete', completed: false, assignedTo: '' },
      ],
      hypercare: [
        { id: 'hc_1', description: 'Daily check-in with facility', completed: false, assignedTo: '' },
        { id: 'hc_2', description: 'Rapid issue resolution SLA', completed: false, assignedTo: '' },
        { id: 'hc_3', description: 'Monitor system performance', completed: false, assignedTo: '' },
        { id: 'hc_4', description: 'Collect feedback', completed: false, assignedTo: '' },
        { id: 'hc_5', description: 'Prepare handover document', completed: false, assignedTo: '' },
      ],
      handoff: [
        { id: 'ho_1', description: 'Document system configuration', completed: false, assignedTo: '' },
        { id: 'ho_2', description: 'Transfer to support team', completed: false, assignedTo: '' },
        { id: 'ho_3', description: 'Schedule post-launch review', completed: false, assignedTo: '' },
        { id: 'ho_4', description: 'Close implementation project', completed: false, assignedTo: '' },
      ],
    };
    return tasks[phase] || [];
  }
}

export const deploymentEngine = new DeploymentEngine();