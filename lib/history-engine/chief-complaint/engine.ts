import type {
  ChiefComplaintObject,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintCertainty,
  ComplaintPriority,
  ComplaintRelationship,
  ComplaintOnset,
  ComplaintSource,
  ComplaintSeverity,
  ComplaintEngineOutput,
  ChronologicalTimelineEntry,
  ComplaintConsistencyCheck,
} from './types';
import { parseDurationToHours, durationToDayLabel } from './duration-converter';
import { buildComplaintGraph, graphToText } from './complaint-graph';
import { runConsistencyChecks, isRedFlagComplaint } from './consistency-checks';
import { evaluateCompletionCriteria } from './completion-criteria';

const CATEGORY_MAP: Record<string, ComplaintCategory> = {
  cough: 'Respiratory',
  fever: 'General',
  chest_pain: 'Pain',
  dyspnea: 'Respiratory',
  abdominal_pain: 'Pain',
  right_upper_quadrant_pain: 'Pain',
  epigastric_pain: 'Pain',
  headache: 'Pain',
  diarrhea: 'GI',
  joint_pain: 'Musculoskeletal',
  fatigue: 'General',
  weight_loss: 'General',
  nausea_vomiting: 'GI',
  skin_rash: 'Dermatology',
  dizziness: 'Neurological',
  palpitations: 'Cardiovascular',
  swallowing_difficulty: 'GI',
  back_pain: 'Pain',
  leg_swelling: 'Cardiovascular',
  seizures: 'Neurological',
  jaundice: 'GI',
  hemoptysis: 'Respiratory',
  hematemesis_melena: 'GI',
  abdominal_distension: 'GI',
  vomiting: 'GI',
  anorexia: 'GI',
  constipation: 'GI',
  urinary_frequency: 'GU',
  dysuria: 'GU',
  haematuria: 'GU',
  vaginal_discharge: 'GU',
  vaginal_bleeding: 'GU',
  amenorrhea: 'GU',
  visual_disturbance: 'Eye',
  hearing_loss: 'ENT',
  tinnitus: 'ENT',
  sore_throat: 'ENT',
  nasal_congestion: 'ENT',
  anxiety: 'Psychiatric',
  depression: 'Psychiatric',
  insomnia: 'Psychiatric',
  trauma: 'Trauma',
  burn: 'Trauma',
  fracture: 'Musculoskeletal',
  wound: 'Dermatology',
  swelling: 'Musculoskeletal',
  syncope: 'Neurological',
  collapse: 'Cardiovascular',
  altered_consciousness: 'Neurological',
  weakness: 'Neurological',
  numbness: 'Neurological',
  rash: 'Dermatology',
  itching: 'Dermatology',
  edema: 'Cardiovascular',
  lymphadenopathy: 'General',
  night_sweats: 'General',
  chills: 'General',
  rigors: 'General',
};

const SCHEMA_MAP: Record<string, string> = {
  abdominal_pain: 'AbdominalPainSchema',
  right_upper_quadrant_pain: 'RUQPainSchema',
  epigastric_pain: 'EpigastricPainSchema',
  chest_pain: 'ChestPainSchema',
  headache: 'HeadacheSchema',
  cough: 'CoughSchema',
  dyspnea: 'DyspneaSchema',
  fever: 'FeverSchema',
  diarrhea: 'DiarrheaSchema',
  nausea_vomiting: 'NauseaVomitingSchema',
  vomiting: 'VomitingSchema',
  jaundice: 'JaundiceSchema',
  seizures: 'SeizureSchema',
  dizziness: 'DizzinessSchema',
  palpitations: 'PalpitationSchema',
  back_pain: 'BackPainSchema',
  joint_pain: 'JointPainSchema',
  leg_swelling: 'LegSwellingSchema',
  fatigue: 'FatigueSchema',
  weight_loss: 'WeightLossSchema',
  skin_rash: 'SkinRashSchema',
  swallowing_difficulty: 'DysphagiaSchema',
  hemoptysis: 'HemoptysisSchema',
  hematemesis_melena: 'GIBleedSchema',
  syncope: 'SyncopeSchema',
  collapse: 'CollapseSchema',
  altered_consciousness: 'AlteredConsciousnessSchema',
  trauma: 'TraumaSchema',
  burn: 'BurnSchema',
  fracture: 'FractureSchema',
  abdominal_distension: 'AbdominalDistensionSchema',
  constipation: 'ConstipationSchema',
  anorexia: 'AnorexiaSchema',
  dysuria: 'DysuriaSchema',
  urinary_frequency: 'UrinaryFrequencySchema',
  haematuria: 'HaematuriaSchema',
  vaginal_discharge: 'VaginalDischargeSchema',
  vaginal_bleeding: 'VaginalBleedingSchema',
  amenorrhea: 'AmenorrheaSchema',
  anxiety: 'AnxietySchema',
  depression: 'DepressionSchema',
  insomnia: 'InsomniaSchema',
  rash: 'RashSchema',
  itching: 'ItchingSchema',
  edema: 'EdemaSchema',
  lymphadenopathy: 'LymphadenopathySchema',
  night_sweats: 'NightSweatsSchema',
  weakness: 'WeaknessSchema',
  numbness: 'NumbnessSchema',
  visual_disturbance: 'VisualDisturbanceSchema',
  hearing_loss: 'HearingLossSchema',
  tinnitus: 'TinnitusSchema',
  sore_throat: 'SoreThroatSchema',
  nasal_congestion: 'NasalCongestionSchema',
};

export class ChiefComplaintEngine {
  private complaints: ChiefComplaintObject[] = [];
  private nextChronology = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.complaints = [];
    this.nextChronology = 0;
  }

  getComplaints(): ChiefComplaintObject[] {
    return [...this.complaints];
  }

  // ── RULE 1: At least one complaint is mandatory ──
  hasMinimumComplaints(): boolean {
    return this.complaints.length >= 1;
  }

  // ── RULE 2: Every complaint is an object ──
  addComplaint(params: {
    symptomId: string;
    name: string;
    duration: string;
    onset?: ComplaintOnset;
    status?: ComplaintStatus;
    certainty?: ComplaintCertainty;
    relationship?: ComplaintRelationship;
    source?: ComplaintSource;
    category?: ComplaintCategory;
    severity?: ComplaintSeverity;
  }): ChiefComplaintObject {
    const durationHours = parseDurationToHours(params.duration);
    const category = params.category || CATEGORY_MAP[params.symptomId] || 'Other';

    // RULE 10: Primary never changes automatically
    const isPrimary = this.complaints.length === 0;

    // RULE 6-7: Chronology is automatic from duration
    const chronology = this.nextChronology++;

    const complaint: ChiefComplaintObject = {
      id: `cc_${params.symptomId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      symptomId: params.symptomId,
      name: params.name,
      label: params.name,
      duration: params.duration,
      durationHours,
      onset: params.onset || this.inferOnset(durationHours),
      primary: isPrimary,
      chronology,
      status: params.status || 'Active',
      certainty: params.certainty || 'Definite',
      relationship: params.relationship || 'Unknown',
      source: params.source || 'Patient',
      category,
      priority: isPrimary ? 'PRIMARY' : 'SECONDARY',
      severity: params.severity || 'Unknown',
      parentId: null,
      simultaneousGroup: null,
      schemaActivated: SCHEMA_MAP[params.symptomId] || null,
      redFlagOverride: false,
      createdAt: Date.now(),
    };

    this.complaints.push(complaint);

    return complaint;
  }

  // ── RULE 3: Exactly one primary complaint ──
  setPrimaryComplaint(id: string): void {
    this.complaints = this.complaints.map(c => ({
      ...c,
      primary: c.id === id,
      priority: c.id === id ? 'PRIMARY' : 'SECONDARY',
    }));
  }

  getPrimaryComplaint(): ChiefComplaintObject | null {
    return this.complaints.find(c => c.primary) || null;
  }

  // ── RULE 4 & 5: Every complaint requires duration, converted to hours ──
  updateDuration(id: string, duration: string): void {
    const hours = parseDurationToHours(duration);
    this.complaints = this.complaints.map(c =>
      c.id === id ? { ...c, duration, durationHours: hours } : c
    );
  }

  // ── RULE 6 & 7: Complaints are automatically ordered by duration (onset) ──
  getChronologicalOrder(): ChiefComplaintObject[] {
    return [...this.complaints].sort((a, b) => {
      const diff = b.durationHours - a.durationHours;
      if (diff === 0) return a.chronology - b.chronology;
      return diff;
    });
  }

  // ── RULE 8: Handle simultaneous complaints ──
  detectSimultaneous(): { groupId: string; complaints: ChiefComplaintObject[] }[] {
    const groups: { groupId: string; complaints: ChiefComplaintObject[] }[] = [];
    const sorted = this.getChronologicalOrder();

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const diff = Math.abs(sorted[i].durationHours - sorted[j].durationHours);
        if (diff < 1) {
          const groupId = `sim_${sorted[i].symptomId}_${sorted[j].symptomId}`;
          const existing = groups.find(g => g.groupId === groupId);
          if (existing) {
            if (!existing.complaints.find(c => c.id === sorted[j].id)) {
              existing.complaints.push(sorted[j]);
            }
          } else {
            groups.push({
              groupId,
              complaints: [sorted[i], sorted[j]],
            });
          }
          this.complaints = this.complaints.map(c =>
            c.id === sorted[i].id || c.id === sorted[j].id
              ? { ...c, simultaneousGroup: groupId }
              : c
          );
        }
      }
    }

    return groups;
  }

  resolveSimultaneous(groupId: string, firstComplaintId: string): void {
    const group = this.complaints.filter(c => c.simultaneousGroup === groupId);
    const first = group.find(c => c.id === firstComplaintId);
    if (!first) return;

    this.complaints = this.complaints.map(c => {
      if (c.simultaneousGroup === groupId && c.id !== firstComplaintId) {
        return {
          ...c,
          simultaneousGroup: null,
          durationHours: c.durationHours + 0.01,
        };
      }
      if (c.simultaneousGroup === groupId && c.id === firstComplaintId) {
        return { ...c, simultaneousGroup: null };
      }
      return c;
    });
  }

  // ── RULE 9: Set relationship between complaints ──
  setRelationship(id: string, relationship: ComplaintRelationship): void {
    this.complaints = this.complaints.map(c =>
      c.id === id ? { ...c, relationship } : c
    );
  }

  // ── RULE 10: Primary never changes automatically (enforced in addComplaint) ──

  // ── RULE 11: Complaint categories — auto-mapped ──
  setCategory(id: string, category: ComplaintCategory): void {
    this.complaints = this.complaints.map(c =>
      c.id === id ? { ...c, category } : c
    );
  }

  // ── RULE 12: One schema per complaint — auto-mapped ──

  // ── RULE 13: Related complaints share context ──
  getRelatedComplaints(symptomId: string): ChiefComplaintObject[] {
    const complaint = this.complaints.find(c => c.symptomId === symptomId);
    if (!complaint) return [];

    return this.complaints.filter(c =>
      c.id !== complaint.id && (
        c.category === complaint.category ||
        c.relationship === 'Associated' ||
        c.relationship === 'Progression' ||
        c.relationship === 'Complication'
      )
    );
  }

  isSameContext(complaintA: ChiefComplaintObject, complaintB: ChiefComplaintObject): boolean {
    if (complaintA.category === complaintB.category) return true;
    const giCategories: ComplaintCategory[] = ['GI', 'Pain'];
    if (giCategories.includes(complaintA.category) && giCategories.includes(complaintB.category)) return true;
    return false;
  }

  // ── RULE 14: Complaint priority ──
  setPriority(id: string, priority: ComplaintPriority): void {
    if (priority === 'PRIMARY') {
      this.setPrimaryComplaint(id);
    } else {
      this.complaints = this.complaints.map(c =>
        c.id === id ? { ...c, priority } : c
      );
    }
  }

  // ── RULE 15: Severity does NOT affect chronology ──
  setSeverity(id: string, severity: ComplaintSeverity): void {
    this.complaints = this.complaints.map(c =>
      c.id === id ? { ...c, severity } : c
    );
  }

  // ── RULE 16: Red flag complaints override workflow ──
  checkRedFlagOverride(): boolean {
    for (const c of this.complaints) {
      if (isRedFlagComplaint(c) || (c.severity === 'Severe' && c.onset === 'Sudden')) {
        this.complaints = this.complaints.map(cc =>
          cc.id === c.id ? { ...cc, redFlagOverride: true } : cc
        );
        return true;
      }
    }
    return false;
  }

  getRedFlagComplaints(): ChiefComplaintObject[] {
    return this.complaints.filter(c =>
      c.redFlagOverride || isRedFlagComplaint(c)
    );
  }

  // ── RULE 17: Complaint graph ──

  // ── RULE 18: Every complaint must have a status ──
  setStatus(id: string, status: ComplaintStatus): void {
    this.complaints = this.complaints.map(c =>
      c.id === id ? { ...c, status } : c
    );
  }

  // ── RULE 20: Timeline is separate ──
  generateTimeline(): ChronologicalTimelineEntry[] {
    const chronological = this.getChronologicalOrder();
    const timeline: ChronologicalTimelineEntry[] = [];
    const seenDays = new Set<string>();

    for (const c of chronological) {
      const dayLabel = durationToDayLabel(c.durationHours);
      if (!seenDays.has(dayLabel)) {
        seenDays.add(dayLabel);
        timeline.push({
          dayLabel,
          relativeHour: c.durationHours,
          complaints: [c],
          description: `${c.name} started`,
        });
      } else {
        const entry = timeline.find(e => e.dayLabel === dayLabel);
        if (entry) {
          entry.complaints.push(c);
          entry.description += `, ${c.name} started`;
        }
      }
    }

    return timeline;
  }

  // ── RULE 21: Chief complaints do not store narrative ──

  // ── RULE 22: Clinical consistency checks ──
  runConsistencyChecks(): ComplaintConsistencyCheck[] {
    return runConsistencyChecks(this.complaints);
  }

  // ── RULE 23: Completion criteria ──
  evaluateCompletion(): ReturnType<typeof evaluateCompletionCriteria> {
    const checks = this.runConsistencyChecks();
    return evaluateCompletionCriteria(this.complaints, checks);
  }

  // ── Remove complaint ──
  removeComplaint(id: string): void {
    const idx = this.complaints.findIndex(c => c.id === id);
    if (idx === -1) return;

    const removed = this.complaints[idx];
    const wasPrimary = removed.primary;

    this.complaints = this.complaints.filter(c => c.id !== id);

    if (wasPrimary && this.complaints.length > 0) {
      this.complaints[0] = { ...this.complaints[0], primary: true, priority: 'PRIMARY' };
    }
  }

  // ── Full output ──
  getOutput(): ComplaintEngineOutput {
    const chronological = this.getChronologicalOrder();
    const graph = buildComplaintGraph(this.complaints);
    const timeline = this.generateTimeline();
    const consistencyChecks = this.runConsistencyChecks();
    const completion = this.evaluateCompletion();
    const primary = this.getPrimaryComplaint();
    const emergencyOverride = this.checkRedFlagOverride();
    const redFlagComplaints = this.getRedFlagComplaints();

    const activatedSchemas = this.complaints
      .map(c => c.schemaActivated)
      .filter((s): s is string => s !== null);

    const narrative = {
      chiefComplaintText: this.generateChiefComplaintText(primary, chronological),
      timelineText: this.generateTimelineText(timeline),
      graphText: graph ? graphToText(graph) : '',
    };

    return {
      complaints: this.complaints,
      primary,
      chronologicalOrder: chronological,
      graph,
      timeline,
      consistencyChecks,
      completion,
      activatedSchemas: [...new Set(activatedSchemas)],
      emergencyOverride,
      redFlagComplaints,
      narrative,
    };
  }

  // ── Private helpers ──

  private inferOnset(durationHours: number): ComplaintOnset {
    if (durationHours <= 1) return 'Sudden';
    if (durationHours <= 72) return 'Gradual';
    return 'Unknown';
  }

  private generateChiefComplaintText(
    primary: ChiefComplaintObject | null,
    chronological: ChiefComplaintObject[]
  ): string {
    if (chronological.length === 0) return 'No presenting complaints.';

    const primaryName = primary?.name || chronological[0]?.name || 'Unknown';
    let text = `Primary Complaint: ${primaryName}`;

    if (chronological.length > 1) {
      const others = chronological.filter(c => !c.primary).map(c => c.name);
      text += `\nAssociated Complaints: ${others.join(', ')}`;
    }

    return text;
  }

  private generateTimelineText(timeline: ChronologicalTimelineEntry[]): string {
    if (timeline.length === 0) return 'No timeline available.';

    return timeline
      .map(e => `${e.dayLabel}: ${e.description}`)
      .join('\n');
  }
}
