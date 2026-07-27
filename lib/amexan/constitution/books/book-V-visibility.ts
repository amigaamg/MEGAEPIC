import { ObjectType } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';
import { ClinicalContext } from './book-III-context';

export type VisibilityAction = 'show' | 'hide' | 'disable' | 'require' | 'optional';

export interface VisibilityEdge {
  id: string;
  context: ClinicalContext;
  action: VisibilityAction;
  targetType: ObjectType;
  targetId: string;
  reason: string;
  priority: number;
  conditions?: VisibilityCondition[];
}

export interface VisibilityCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'exists';
  value: unknown;
}

export type VisibilityRelationship =
  | RelationshipType.Shows
  | RelationshipType.Hides
  | RelationshipType.Enables
  | RelationshipType.Disables;

export const VISIBILITY_GRAPH: VisibilityEdge[] = [
  { id: 'v001', context: ClinicalContext.Pregnant, action: 'show', targetType: ObjectType.Question, targetId: 'anc_booking', reason: 'ANC booking required for pregnant patients', priority: 10 },
  { id: 'v002', context: ClinicalContext.Pregnant, action: 'show', targetType: ObjectType.PhysicalFinding, targetId: 'leopolds_manoeuvres', reason: 'Obstetric examination', priority: 10 },
  { id: 'v003', context: ClinicalContext.Pregnant, action: 'show', targetType: ObjectType.Measurement, targetId: 'fundal_height', reason: 'Fundal height measurement', priority: 10 },
  { id: 'v004', context: ClinicalContext.Pregnant, action: 'hide', targetType: ObjectType.PhysicalFinding, targetId: 'prostate_exam', reason: 'Not applicable in pregnancy', priority: 10 },
  { id: 'v005', context: ClinicalContext.Neonate, action: 'show', targetType: ObjectType.Measurement, targetId: 'head_circumference', reason: 'WHO growth standard', priority: 10 },
  { id: 'v006', context: ClinicalContext.Neonate, action: 'hide', targetType: ObjectType.Question, targetId: 'smoking_history', reason: 'Not applicable', priority: 10 },
  { id: 'v007', context: ClinicalContext.Child, action: 'show', targetType: ObjectType.Score, targetId: 'peds_glasgow', reason: 'Pediatric GCS', priority: 10 },
  { id: 'v008', context: ClinicalContext.Adult, action: 'show', targetType: ObjectType.Score, targetId: 'glasgow_coma_scale', reason: 'Standard GCS', priority: 10 },
  { id: 'v009', context: ClinicalContext.HIV, action: 'show', targetType: ObjectType.Question, targetId: 'cd4_count', reason: 'HIV monitoring', priority: 10 },
  { id: 'v010', context: ClinicalContext.HIV, action: 'show', targetType: ObjectType.Question, targetId: 'viral_load', reason: 'HIV monitoring', priority: 10 },
  { id: 'v011', context: ClinicalContext.HIV, action: 'show', targetType: ObjectType.Drug, targetId: 'art_regimen', reason: 'ART required', priority: 10 },

  { id: 'v012', context: ClinicalContext.TB, action: 'show', targetType: ObjectType.Question, targetId: 'cough_duration', reason: 'TB symptom screen', priority: 10 },
  { id: 'v013', context: ClinicalContext.TB, action: 'show', targetType: ObjectType.Investigation, targetId: 'sputum_microscopy', reason: 'AFB smear required', priority: 10 },
  { id: 'v014', context: ClinicalContext.TB, action: 'show', targetType: ObjectType.Investigation, targetId: 'gene_xpert', reason: 'WHO-recommended molecular test', priority: 10 },
  { id: 'v015', context: ClinicalContext.TB, action: 'show', targetType: ObjectType.Question, targetId: 'night_sweats', reason: 'TB constitutional symptom', priority: 9 },
  { id: 'v016', context: ClinicalContext.TB, action: 'show', targetType: ObjectType.Question, targetId: 'weight_loss_unintentional', reason: 'TB wasting', priority: 9 },
  { id: 'v017', context: ClinicalContext.TB, action: 'show', targetType: ObjectType.Question, targetId: 'household_tb_contact', reason: 'TB exposure history', priority: 8 },

  { id: 'v018', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.Question, targetId: 'anosmia', reason: 'COVID-19 sentinel symptom', priority: 10 },
  { id: 'v019', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.Question, targetId: 'ageusia', reason: 'COVID-19 sentinel symptom', priority: 10 },
  { id: 'v020', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.Investigation, targetId: 'covid_pcr', reason: 'Confirmatory test', priority: 10 },
  { id: 'v021', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.Investigation, targetId: 'chest_imaging_covid', reason: 'Typical COVID-19 findings', priority: 9 },
  { id: 'v022', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.VitalSign, targetId: 'oxygen_saturation', reason: 'Hypoxia monitoring', priority: 10 },
  { id: 'v023', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.Score, targetId: 'news2', reason: 'Early warning score for deterioration', priority: 9 },
  { id: 'v024', context: ClinicalContext.COVID19, action: 'show', targetType: ObjectType.Drug, targetId: 'anticoagulation', reason: 'Thromboprophylaxis in COVID-19', priority: 8 },

  { id: 'v025', context: ClinicalContext.PostCOVID, action: 'show', targetType: ObjectType.Question, targetId: 'post_covid_fatigue', reason: 'Post-acute sequelae assessment', priority: 9 },
  { id: 'v026', context: ClinicalContext.PostCOVID, action: 'show', targetType: ObjectType.Question, targetId: 'post_covid_dyspnoea', reason: 'Long COVID respiratory assessment', priority: 9 },
  { id: 'v027', context: ClinicalContext.PostCOVID, action: 'show', targetType: ObjectType.Investigation, targetId: 'pft_post_covid', reason: 'Pulmonary function test follow-up', priority: 8 },
  { id: 'v028', context: ClinicalContext.PostCOVID, action: 'show', targetType: ObjectType.Rehabilitation, targetId: 'pulmonary_rehab', reason: 'Post-COVID rehabilitation', priority: 7 },

  { id: 'v029', context: ClinicalContext.Cancer, action: 'show', targetType: ObjectType.Question, targetId: 'cancer_type', reason: 'Oncology history', priority: 10 },
  { id: 'v030', context: ClinicalContext.Cancer, action: 'show', targetType: ObjectType.Question, targetId: 'cancer_stage', reason: 'Staging for treatment planning', priority: 10 },
  { id: 'v031', context: ClinicalContext.Cancer, action: 'show', targetType: ObjectType.Score, targetId: 'ecog_status', reason: 'Performance status assessment', priority: 9 },
  { id: 'v032', context: ClinicalContext.Cancer, action: 'show', targetType: ObjectType.Question, targetId: 'chemotherapy_history', reason: 'Treatment history', priority: 9 },
  { id: 'v033', context: ClinicalContext.Cancer, action: 'show', targetType: ObjectType.Question, targetId: 'radiotherapy_history', reason: 'Radiation exposure history', priority: 9 },

  { id: 'v034', context: ClinicalContext.Neutropenic, action: 'show', targetType: ObjectType.Investigation, targetId: 'neutrophil_count', reason: 'Neutropenia monitoring', priority: 10 },
  { id: 'v035', context: ClinicalContext.Neutropenic, action: 'show', targetType: ObjectType.Protocol, targetId: 'febrile_neutropenia_protocol', reason: 'Empiric antibiotics protocol', priority: 10 },
  { id: 'v036', context: ClinicalContext.Neutropenic, action: 'show', targetType: ObjectType.Symptom, targetId: 'fever', reason: 'Key presenting symptom in neutropenia', priority: 10 },

  { id: 'v037', context: ClinicalContext.Geriatric, action: 'show', targetType: ObjectType.Score, targetId: 'fall_risk_score', reason: 'Geriatric fall risk assessment', priority: 9 },
  { id: 'v038', context: ClinicalContext.Geriatric, action: 'show', targetType: ObjectType.Question, targetId: 'cognitive_impairment', reason: 'Dementia/cognitive screen', priority: 9 },
  { id: 'v039', context: ClinicalContext.Geriatric, action: 'show', targetType: ObjectType.Score, targetId: 'braden_score', reason: 'Pressure ulcer risk', priority: 8 },
  { id: 'v040', context: ClinicalContext.Geriatric, action: 'show', targetType: ObjectType.Question, targetId: 'polypharmacy', reason: 'Polypharmacy review', priority: 9 },
  { id: 'v041', context: ClinicalContext.Geriatric, action: 'hide', targetType: ObjectType.Question, targetId: 'pregnancy_test', reason: 'Not applicable in geriatric population', priority: 10 },

  { id: 'v042', context: ClinicalContext.MechanicallyVentilated, action: 'show', targetType: ObjectType.Score, targetId: 'richmond_agitation', reason: 'Sedation assessment', priority: 10 },
  { id: 'v043', context: ClinicalContext.MechanicallyVentilated, action: 'show', targetType: ObjectType.Question, targetId: 'vap_screen', reason: 'VAP surveillance', priority: 10 },
  { id: 'v044', context: ClinicalContext.MechanicallyVentilated, action: 'show', targetType: ObjectType.Score, targetId: 'cpt_score', reason: 'CPT weaning readiness', priority: 9 },
  { id: 'v045', context: ClinicalContext.MechanicallyVentilated, action: 'show', targetType: ObjectType.Question, targetId: 'sedation_hold', reason: 'Daily sedation interruption', priority: 9 },

  { id: 'v046', context: ClinicalContext.Transplant, action: 'show', targetType: ObjectType.Investigation, targetId: 'tacrolimus_level', reason: 'Tacrolimus therapeutic drug monitoring', priority: 10 },
  { id: 'v047', context: ClinicalContext.Transplant, action: 'show', targetType: ObjectType.Investigation, targetId: 'cmv_pcr', reason: 'CMV surveillance after transplant', priority: 10 },
  { id: 'v048', context: ClinicalContext.Transplant, action: 'show', targetType: ObjectType.Question, targetId: 'rejection_symptoms', reason: 'Transplant rejection monitoring', priority: 10 },

  { id: 'v049', context: ClinicalContext.Obese, action: 'show', targetType: ObjectType.Score, targetId: 'stop_bang', reason: 'OSA screening', priority: 9 },
  { id: 'v050', context: ClinicalContext.Obese, action: 'show', targetType: ObjectType.Question, targetId: 'cpap_use', reason: 'CPAP adherence assessment', priority: 8 },
  { id: 'v051', context: ClinicalContext.Obese, action: 'show', targetType: ObjectType.Investigation, targetId: 'hba1c', reason: 'Diabetes screening in obesity', priority: 8 },

  { id: 'v052', context: ClinicalContext.Dialysis, action: 'show', targetType: ObjectType.Question, targetId: 'dry_weight', reason: 'Dialysis adequacy', priority: 9 },
  { id: 'v053', context: ClinicalContext.Dialysis, action: 'show', targetType: ObjectType.Investigation, targetId: 'kt_v', reason: 'Dialysis clearance monitoring', priority: 9 },
  { id: 'v054', context: ClinicalContext.Dialysis, action: 'show', targetType: ObjectType.Question, targetId: 'av_fistula_status', reason: 'Vascular access assessment', priority: 10 },

  { id: 'v055', context: ClinicalContext.PreTerm, action: 'show', targetType: ObjectType.Question, targetId: 'corrected_age', reason: 'Corrected gestational age for development', priority: 10 },
  { id: 'v056', context: ClinicalContext.PreTerm, action: 'show', targetType: ObjectType.Score, targetId: 'rop_screen', reason: 'Retinopathy of prematurity screening', priority: 9 },

  { id: 'v057', context: ClinicalContext.Autoimmune, action: 'show', targetType: ObjectType.Question, targetId: 'autoimmune_disease_type', reason: 'Specific autoimmune condition', priority: 9 },
  { id: 'v058', context: ClinicalContext.Autoimmune, action: 'show', targetType: ObjectType.Drug, targetId: 'immunosuppressant', reason: 'Immunosuppressive therapy', priority: 9 },

  { id: 'v059', context: ClinicalContext.Occupational, action: 'show', targetType: ObjectType.Question, targetId: 'occupational_exposure', reason: 'Workplace exposure history', priority: 9 },
  { id: 'v060', context: ClinicalContext.Occupational, action: 'show', targetType: ObjectType.Question, targetId: 'occupational_lung_disease', reason: 'Work-related lung disease assessment', priority: 9 },
  { id: 'v061', context: ClinicalContext.Occupational, action: 'show', targetType: ObjectType.Question, targetId: 'improvement_on_holidays', reason: 'Occupational asthma indicator', priority: 8 },
];

export class VisibilityGraphEngine {
  private edges: VisibilityEdge[] = [...VISIBILITY_GRAPH];

  evaluate(contexts: ClinicalContext[], targetType: ObjectType, targetId: string): VisibilityAction {
    const applicable = this.edges.filter(
      e => contexts.includes(e.context) && e.targetType === targetType && e.targetId === targetId,
    );
    if (applicable.length === 0) return 'optional';
    applicable.sort((a, b) => b.priority - a.priority);
    return applicable[0].action;
  }

  evaluateAll(contexts: ClinicalContext[]): Map<string, VisibilityAction> {
    const results = new Map<string, VisibilityAction>();
    for (const edge of this.edges) {
      if (contexts.includes(edge.context)) {
        const key = `${edge.targetType}:${edge.targetId}`;
        const existing = results.get(key);
        if (!existing || this.priority(edge.action) > this.priority(existing)) {
          results.set(key, edge.action);
        }
      }
    }
    return results;
  }

  registerEdge(edge: VisibilityEdge): void {
    this.edges.push(edge);
  }

  getVisible(contexts: ClinicalContext[]): string[] {
    const visible: string[] = [];
    for (const edge of this.edges) {
      if (contexts.includes(edge.context) && edge.action === 'show') {
        visible.push(`${edge.targetType}:${edge.targetId}`);
      }
    }
    return visible;
  }

  getHidden(contexts: ClinicalContext[]): string[] {
    const hidden: string[] = [];
    for (const edge of this.edges) {
      if (contexts.includes(edge.context) && edge.action === 'hide') {
        hidden.push(`${edge.targetType}:${edge.targetId}`);
      }
    }
    return hidden;
  }

  toNeo4jEdges(): { source: string; target: string; type: RelationshipType; properties: Record<string, unknown> }[] {
    return this.edges.map(e => ({
      source: `context:${e.context}`,
      target: `${e.targetType}:${e.targetId}`,
      type: e.action === 'show' ? RelationshipType.Shows : e.action === 'hide' ? RelationshipType.Hides : RelationshipType.Triggers,
      properties: { reason: e.reason, priority: e.priority },
    }));
  }

  private priority(a: VisibilityAction): number {
    return a === 'hide' ? 4 : a === 'disable' ? 3 : a === 'require' ? 2 : a === 'show' ? 1 : 0;
  }
}

export const visibilityEngine = new VisibilityGraphEngine();
