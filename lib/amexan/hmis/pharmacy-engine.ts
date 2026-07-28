// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book X: Pharmacy Engine
// Drug master database, prescribing, dispensing, interactions, inventory.
// ═══════════════════════════════════════════════════════════════════════════════

export interface DrugMaster {
  id: string;
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  pharmacologicClass: string;
  mechanismOfAction: string;
  indications: string[];
  contraindications: string[];
  forms: DrugForm[];
  routes: DrugRoute[];
  strengths: DrugStrength[];
  dosing: DosingInfo;
  interactions: DrugInteraction[];
  contraindicatedIn: string[];
  pregnancyCategory: PregnancyCategory;
  lactationSafe: boolean;
  renalAdjustment: string;
  hepaticAdjustment: string;
  pediatricDosing: string;
  geriatricDosing: string;
  monitoring: string[];
  maxDailyDose?: string;
  overdoseTreatment?: string;
  adverseEffects: AdverseEffect[];
  storages: StorageRequirement;
  isControlled: boolean;
  controlledSchedule?: string;
  isAntibiotic: boolean;
  antibioticClass?: string;
  requiresTherapeuticDrugMonitoring: boolean;
  halfLife?: string;
  metabolism?: string;
  excretion?: string;
}

export interface DrugForm {
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'infusion' | 'topical' | 'suppository' | 'inhaler' | 'drops' | 'patch' | 'cream' | 'ointment' | 'gel' | 'spray' | 'powder' | 'implant';
}

export type DrugRoute = 'oral' | 'iv' | 'im' | 'sc' | 'topical' | 'rectal' | 'inhaled' | 'sublingual' | 'intrathecal' | 'intraosseous' | 'intraarticular' | 'intravitreal' | 'intranasal' | 'ophthalmic' | 'otic';

export interface DrugStrength {
  form: string;
  value: number;
  unit: string;
}

export interface DosingInfo {
  adultDose: string;
  pediatricDose?: string;
  neonatalDose?: string;
  renalImpairment?: string;
  hepaticImpairment?: string;
  frequency: string;
  duration?: string;
  maxDose?: string;
}

export interface DrugInteraction {
  drug: string;
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  effect: string;
  mechanism: string;
  management: string;
}

export enum PregnancyCategory {
  A = 'A', B = 'B', C = 'C', D = 'D', X = 'X',
}

export interface AdverseEffect {
  effect: string;
  frequency: 'common' | 'uncommon' | 'rare' | 'very_rare';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  management: string;
}

export interface StorageRequirement {
  temperatureMin?: number;
  temperatureMax?: number;
  humidity?: string;
  lightSensitive: boolean;
  refrigeration: boolean;
  specialHandling?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  encounterId: string;
  prescriberId: string;
  prescriberName: string;
  items: PrescriptionItem[];
  status: PrescriptionStatus;
  type: PrescriptionType;
  clinicalIndication: string;
  diagnosis?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  dispensedAt?: number;
  dispensedBy?: string;
  verifiedAt?: number;
  verifiedBy?: string;
}

export interface PrescriptionItem {
  drugId: string;
  drugName: string;
  genericName: string;
  strength: string;
  form: string;
  route: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions: string;
  indication: string;
  substitutionAllowed: boolean;
  isControlled: boolean;
  status: PrescriptionItemStatus;
  administered: AdministeredDose[];
}

export enum PrescriptionType {
  Acute = 'acute',
  Chronic = 'chronic',
  PRN = 'prn',
  Standing = 'standing',
  OneTime = 'one_time',
  Protocol = 'protocol',
  Discharge = 'discharge',
}

export enum PrescriptionStatus {
  Draft = 'draft',
  Ordered = 'ordered',
  Reviewed = 'reviewed',
  Verified = 'verified',
  Dispensed = 'dispensed',
  Administering = 'administering',
  Completed = 'completed',
  Discontinued = 'discontinued',
  Cancelled = 'cancelled',
  OnHold = 'on_hold',
}

export enum PrescriptionItemStatus {
  Pending = 'pending',
  Dispensed = 'dispensed',
  Administered = 'administered',
  Missed = 'missed',
  Refused = 'refused',
  Held = 'held',
  Discontinued = 'discontinued',
}

export interface AdministeredDose {
  id: string;
  administeredAt: number;
  administeredBy: string;
  dose: string;
  route: string;
  site?: string;
  confirmation: 'given' | 'refused' | 'held' | 'missed';
  reason?: string;
  witnessedBy?: string;
  notes?: string;
}

export interface MedicationInventory {
  id: string;
  drugId: string;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  unit: string;
  location: string;
  supplier: string;
  receivedAt: number;
  costPerUnit: number;
  sellingPricePerUnit: number;
  reorderLevel: number;
  reorderQuantity: number;
  dispensingUnit: string;
  isControlled: boolean;
}

export const COMMON_DRUG_INTERACTIONS: DrugInteraction[] = [];

export function calculateStockStatus(inventory: MedicationInventory[]): { inStock: number; lowStock: number; expired: number; outOfStock: number } {
  const now = new Date();
  let inStock = 0, lowStock = 0, expired = 0, outOfStock = 0;
  for (const item of inventory) {
    const isExpired = new Date(item.expiryDate) < now;
    if (isExpired) { expired++; continue; }
    if (item.quantityOnHand <= 0) { outOfStock++; continue; }
    if (item.quantityOnHand <= item.reorderLevel) { lowStock++; continue; }
    inStock++;
  }
  return { inStock, lowStock, expired, outOfStock };
}

export function getDrugInteractions(drugIds: string[], drugMaster: DrugMaster[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  for (let i = 0; i < drugIds.length; i++) {
    for (let j = i + 1; j < drugIds.length; j++) {
      const drugA = drugMaster.find(d => d.id === drugIds[i]);
      const drugB = drugMaster.find(d => d.id === drugIds[j]);
      if (!drugA || !drugB) continue;
      const aOnB = drugA.interactions.find(int => drugB.brandNames.some(b => int.drug.toLowerCase().includes(b.toLowerCase())) || int.drug.toLowerCase().includes(drugB.genericName.toLowerCase()));
      if (aOnB) interactions.push(aOnB);
    }
  }
  return interactions;
}

export function checkContraindications(drugId: string, conditions: string[], drugMaster: DrugMaster[]): string[] {
  const drug = drugMaster.find(d => d.id === drugId);
  if (!drug) return [];
  return drug.contraindicatedIn.filter(c => conditions.some(cond => cond.toLowerCase().includes(c.toLowerCase())));
}
