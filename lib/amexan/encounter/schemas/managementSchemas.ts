// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Management Schemas — ABCDE/FGH clinical management framework
// ═══════════════════════════════════════════════════════════════════════════════
// Management is NEVER one flat list.
// It follows the ABCDE/FGH structure:
//   A — Emergency / ABC / Resuscitation
//   B — Supportive care (fluids, nutrition, analgesia, oxygen, nursing)
//   C — Definitive treatment (drugs, procedures, surgery)
//   D — Monitoring (vitals, scores, I/O, lab repeats, warnings)
//   E — Consultations (specialists, physio, nutrition, social worker, psychology)
//   F — Patient education (counselling, lifestyle, medication adherence)
//   G — Prevention (VTE, pressure sores, falls, secondary prevention)
//   H — Follow-up (clinic, telephone, community, home visit)
// ═══════════════════════════════════════════════════════════════════════════════

export type ManagementCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface ManagementCategoryDef {
  id: ManagementCategory;
  label: string;
  description: string;
  order: number;
}

export const MANAGEMENT_CATEGORIES: readonly ManagementCategoryDef[] = [
  { id: 'A', label: 'Emergency / Resuscitation', description: 'ABC, oxygen, IV access, resuscitation protocols', order: 1 },
  { id: 'B', label: 'Supportive Care', description: 'Fluids, nutrition, analgesia, oxygen therapy, nursing care', order: 2 },
  { id: 'C', label: 'Definitive Treatment', description: 'Drugs, procedures, surgery, obstetric interventions, specialty care', order: 3 },
  { id: 'D', label: 'Monitoring', description: 'Vital signs, clinical scores, input/output, lab repeats, early warning triggers', order: 4 },
  { id: 'E', label: 'Consultations', description: 'Specialist referrals, physiotherapy, nutrition, social worker, psychology', order: 5 },
  { id: 'F', label: 'Patient Education', description: 'Counselling, lifestyle advice, medication adherence, warning signs', order: 6 },
  { id: 'G', label: 'Prevention', description: 'VTE prophylaxis, pressure sore prevention, falls prevention, immunizations', order: 7 },
  { id: 'H', label: 'Follow-up', description: 'Clinic appointment, telephone follow-up, community visit, home care', order: 8 },
];

// ── Management item ────────────────────────────────────────────────────────────

export interface ManagementItem {
  id: string;
  category: ManagementCategory;
  description: string;
  detail: string;
  priority: 'stat' | 'urgent' | 'routine';
  assignedTo?: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  createdAt: number;
  completedAt?: number;
  linkedDiagnosisId?: string;
}

// ── Medication card — full prescription data ──────────────────────────────────

export type MedicationRoute =
  | 'oral' | 'iv' | 'im' | 'sc' | 'sl' | 'pr' | 'inhaled' | 'topical' | 'ophthalmic' | 'otic' | 'intrathecal' | 'intraosseous';

export type MedicationFrequency =
  | 'stat' | 'od' | 'bd' | 'tds' | 'qds' | 'q4h' | 'q6h' | 'q8h' | 'q12h' | 'nocte' | 'prn';

export interface MedicationDose {
  value: number;
  unit: string;
  weightBased?: boolean;
  adjustedForRenal?: boolean;
  adjustedForHepatic?: boolean;
}

export interface MedicationCard {
  id: string;
  genericName: string;
  brandName?: string;
  indication: string;
  dose: MedicationDose;
  route: MedicationRoute;
  frequency: MedicationFrequency;
  durationDays?: number;
  durationText?: string;
  administrationInstructions?: string;
  allergyCheckPassed: boolean;
  interactionCheckPassed: boolean;
  monitoringRequired?: string[];
  prescribedBy?: string;
  prescribedAt?: number;
  status: 'draft' | 'prescribed' | 'administering' | 'completed' | 'discontinued';

  // Dose calculation
  weightKg?: number;
  dosePerKg?: number;
  calculatedDose?: number;
  maxDose?: number;

  // Contraindication checks
  renalAdjustmentRequired?: boolean;
  hepaticAdjustmentRequired?: boolean;
  pregnancySafe?: boolean;
  breastfeedingSafe?: boolean;
}

// ── Category-specific item factories ───────────────────────────────────────────

export function createEmergencyItem(id: string, description: string, detail: string): ManagementItem {
  return { id, category: 'A', description, detail, priority: 'stat', status: 'ordered', createdAt: Date.now() };
}

export function createSupportiveItem(id: string, description: string, detail: string): ManagementItem {
  return { id, category: 'B', description, detail, priority: 'routine', status: 'ordered', createdAt: Date.now() };
}

export function createDefinitiveItem(id: string, description: string, detail: string): ManagementItem {
  return { id, category: 'C', description, detail, priority: 'urgent', status: 'ordered', createdAt: Date.now() };
}

export function createMonitoringItem(id: string, description: string, detail: string): ManagementItem {
  return { id, category: 'D', description, detail, priority: 'routine', status: 'ordered', createdAt: Date.now() };
}

export function createConsultationItem(id: string, specialist: string, reason: string): ManagementItem {
  return { id, category: 'E', description: `Refer to ${specialist}`, detail: reason, priority: 'routine', status: 'ordered', createdAt: Date.now() };
}

export function createEducationItem(id: string, topic: string): ManagementItem {
  return { id, category: 'F', description: topic, detail: '', priority: 'routine', status: 'ordered', createdAt: Date.now() };
}

export function createPreventionItem(id: string, measure: string): ManagementItem {
  return { id, category: 'G', description: measure, detail: '', priority: 'routine', status: 'ordered', createdAt: Date.now() };
}

export function createFollowUpItem(id: string, plan: string): ManagementItem {
  return { id, category: 'H', description: plan, detail: '', priority: 'routine', status: 'ordered', createdAt: Date.now() };
}

// ── Medication prescription helper ─────────────────────────────────────────────

export function createMedication(
  genericName: string,
  indication: string,
  doseValue: number,
  doseUnit: string,
  route: MedicationRoute,
  frequency: MedicationFrequency,
  weightKg?: number,
  dosePerKg?: number,
  maxDose?: number,
): MedicationCard {
  let calculatedDose: number | undefined;
  let adjustedDose = doseValue;

  if (weightKg && dosePerKg) {
    calculatedDose = weightKg * dosePerKg;
    if (maxDose && calculatedDose > maxDose) {
      calculatedDose = maxDose;
    }
    adjustedDose = calculatedDose;
  }

  return {
    id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    genericName,
    indication,
    dose: { value: adjustedDose, unit: doseUnit, weightBased: !!dosePerKg },
    route,
    frequency,
    administrationInstructions: `${adjustedDose} ${doseUnit} ${route} ${frequency}${indication ? ` — ${indication}` : ''}`,
    allergyCheckPassed: true,
    interactionCheckPassed: true,
    status: 'draft',
    weightKg,
    dosePerKg,
    calculatedDose,
    maxDose,
  };
}

// ── Common medication templates ────────────────────────────────────────────────

export const COMMON_MEDICATIONS: Partial<MedicationCard>[] = [
  // Analgesia
  { genericName: 'Paracetamol', dose: { value: 1000, unit: 'mg', weightBased: false }, route: 'oral', frequency: 'q6h', indication: 'Mild to moderate pain / fever' },
  { genericName: 'Paracetamol', dose: { value: 15, unit: 'mg/kg', weightBased: true }, route: 'iv', frequency: 'q6h', indication: 'Fever / pain — paediatric', maxDose: 1000 },
  { genericName: 'Ibuprofen', dose: { value: 400, unit: 'mg', weightBased: false }, route: 'oral', frequency: 'tds', indication: 'Mild to moderate pain / inflammation' },
  { genericName: 'Morphine', dose: { value: 5, unit: 'mg', weightBased: false }, route: 'iv', frequency: 'q4h', indication: 'Severe pain', monitoringRequired: ['RR', 'sedation score', 'SpO₂'] },
  { genericName: 'Tramadol', dose: { value: 50, unit: 'mg', weightBased: false }, route: 'oral', frequency: 'q8h', indication: 'Moderate to severe pain' },

  // Antibiotics
  { genericName: 'Amoxicillin', dose: { value: 500, unit: 'mg', weightBased: false }, route: 'oral', frequency: 'tds', indication: 'Respiratory / urinary infection' },
  { genericName: 'Amoxicillin', dose: { value: 50, unit: 'mg/kg', weightBased: true }, route: 'iv', frequency: 'tds', indication: 'Severe infection — paediatric', maxDose: 2000 },
  { genericName: 'Ceftriaxone', dose: { value: 2000, unit: 'mg', weightBased: false }, route: 'iv', frequency: 'od', indication: 'Severe infection / sepsis / meningitis' },
  { genericName: 'Metronidazole', dose: { value: 500, unit: 'mg', weightBased: false }, route: 'iv', frequency: 'tds', indication: 'Anaerobic infection' },
  { genericName: 'Gentamicin', dose: { value: 5, unit: 'mg/kg', weightBased: true }, route: 'iv', frequency: 'od', indication: 'Gram-negative infection', monitoringRequired: ['U&E', 'gentamicin levels'] },

  // Fluids
  { genericName: '0.9% Sodium Chloride', dose: { value: 1000, unit: 'mL' }, route: 'iv', frequency: 'tds', indication: 'Resuscitation / maintenance' },
  { genericName: 'Ringer\'s Lactate (Hartmann\'s)', dose: { value: 1000, unit: 'mL' }, route: 'iv', frequency: 'prn', indication: 'Resuscitation' },
  { genericName: '5% Dextrose', dose: { value: 500, unit: 'mL' }, route: 'iv', frequency: 'tds', indication: 'Maintenance fluids' },

  // Emergency / resus
  { genericName: 'Adrenaline (Epinephrine)', dose: { value: 0.5, unit: 'mg' }, route: 'im', frequency: 'stat', indication: 'Anaphylaxis / cardiac arrest' },
  { genericName: 'Oxygen', dose: { value: 15, unit: 'L/min' }, route: 'inhaled', frequency: 'stat', indication: 'Hypoxia / shock — via non-rebreather mask', monitoringRequired: ['SpO₂', 'ABG'] },

  // Common chronic meds
  { genericName: 'Atenolol', dose: { value: 50, unit: 'mg' }, route: 'oral', frequency: 'od', indication: 'Hypertension' },
  { genericName: 'Enalapril', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'bd', indication: 'Hypertension / heart failure' },
  { genericName: 'Metformin', dose: { value: 500, unit: 'mg' }, route: 'oral', frequency: 'bd', indication: 'Type 2 diabetes' },
  { genericName: 'Salbutamol (Albuterol)', dose: { value: 2.5, unit: 'mg' }, route: 'inhaled', frequency: 'q4h', indication: 'Asthma / COPD exacerbation' },
  { genericName: 'Furosemide', dose: { value: 40, unit: 'mg' }, route: 'iv', frequency: 'bd', indication: 'Pulmonary oedema / fluid overload' },

  // VTE prophylaxis
  { genericName: 'Enoxaparin', dose: { value: 40, unit: 'mg' }, route: 'sc', frequency: 'od', indication: 'VTE prophylaxis' },
  { genericName: 'Unfractionated Heparin', dose: { value: 5000, unit: 'units' }, route: 'sc', frequency: 'tds', indication: 'VTE prophylaxis' },

  // Paediatric/neonatal
  { genericName: 'Vitamin K', dose: { value: 1, unit: 'mg' }, route: 'im', frequency: 'stat', indication: 'Neonatal haemorrhage prophylaxis' },
  { genericName: 'Chlorhexidine 7.1%', dose: { value: 0, unit: 'application' }, route: 'topical', frequency: 'stat', indication: 'Cord care — neonate' },
];

// ── Disposition ────────────────────────────────────────────────────────────────

export type DispositionType =
  | 'discharge'
  | 'admit_ward'
  | 'admit_hdu'
  | 'admit_icu'
  | 'refer'
  | 'transfer'
  | 'death_certification'
  | 'against_medical_advice';

export interface DispositionCard {
  type: DispositionType;
  reason: string;
  destination?: string;
  escortRequired?: boolean;
  documentsPrepared: string[];
  followUpPlan?: string;
  safetyNetting?: string;
  medicationReconciliationDone: boolean;
  nursingHandoverDone: boolean;
  administrativeWorkflowDone: boolean;
}
