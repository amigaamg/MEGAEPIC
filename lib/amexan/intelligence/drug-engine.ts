import { type Observation, type ClinicalContext, ConfidenceLevel } from './types'

export interface DrugRecord {
  id: string
  name: string
  genericName: string
  brandName?: string
  category: string
  interactions: DrugInteraction[]
  contraindications: string[]
  dosing: DosingInfo
  pregnancy: PregnancyCategory
  lactation: LactationCategory
  renalAdjustment?: RenalAdjustment
  hepaticAdjustment?: HepaticAdjustment
  monitoring: string[]
  storage: StorageInfo
  countryAvailability?: string[]
}

export interface DrugInteraction {
  drug: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  mechanism: string
  management: string
}

export interface DosingInfo {
  standardDose: string
  weightBased?: boolean
  ageAdjusted?: boolean
  renalDose?: string
  hepaticDose?: string
  frequency: string
  route: string[]
}

export interface PregnancyCategory {
  category: string
  riskLevel: 'safe' | 'caution' | 'contraindicated'
  notes: string
}

export interface LactationCategory {
  compatible: boolean
  riskLevel: 'safe' | 'caution' | 'avoid'
  notes: string
}

export interface RenalAdjustment {
  crclThreshold: number
  doseReduction: string
}

export interface HepaticAdjustment {
  childPughThreshold: string
  doseReduction: string
}

export interface StorageInfo {
  temperature: string
  lightSensitive: boolean
  expiryAfterOpening?: string
}

const drugDatabase = new Map<string, DrugRecord>()

export function registerDrug(drug: DrugRecord): void {
  drugDatabase.set(drug.id, drug)
  if (drug.genericName) {
    drugDatabase.set(drug.genericName.toLowerCase(), drug)
  }
  if (drug.brandName) {
    drugDatabase.set(drug.brandName.toLowerCase(), drug)
  }
}

export function getDrug(drugId: string): DrugRecord | undefined {
  return drugDatabase.get(drugId)
}

export function searchDrugs(query: string): DrugRecord[] {
  const lowerQuery = query.toLowerCase()
  const results: DrugRecord[] = []
  for (const [, drug] of drugDatabase) {
    if (
      drug.name.toLowerCase().includes(lowerQuery) ||
      drug.genericName.toLowerCase().includes(lowerQuery) ||
      (drug.brandName && drug.brandName.toLowerCase().includes(lowerQuery)) ||
      drug.category.toLowerCase().includes(lowerQuery)
    ) {
      results.push(drug)
    }
  }
  return results
}

export function checkDrugInteractions(
  currentDrugs: string[],
  newDrug: string,
): DrugInteraction[] {
  const newDrugRecord = getDrug(newDrug)
  if (!newDrugRecord) return []

  const interactions: DrugInteraction[] = []
  for (const currentDrugId of currentDrugs) {
    const currentDrug = getDrug(currentDrugId)
    if (currentDrug) {
      for (const interaction of newDrugRecord.interactions) {
        if (interaction.drug === currentDrug.name || interaction.drug === currentDrug.genericName) {
          interactions.push(interaction)
        }
      }
    }
  }
  return interactions
}

export function checkContraindications(
  drugId: string,
  patientConditions: string[],
): string[] {
  const drug = getDrug(drugId)
  if (!drug) return []

  const contraindications: string[] = []
  for (const condition of patientConditions) {
    if (drug.contraindications.some(c => c.toLowerCase().includes(condition.toLowerCase()))) {
      contraindications.push(`Contraindicated: ${condition}`)
    }
  }
  return contraindications
}

export function getDosingForPatient(
  drugId: string,
  weight?: number,
  age?: number,
  renalFunction?: number,
  hepaticFunction?: string,
): DosingInfo {
  const drug = getDrug(drugId)
  if (!drug) return { standardDose: 'Unknown', frequency: 'Unknown', route: ['Unknown'] }

  let dose = drug.dosing.standardDose
  let frequency = drug.dosing.frequency
  let route = drug.dosing.route

  if (weight && drug.dosing.weightBased) {
    dose = `${drug.dosing.standardDose} per kg`
  }

  if (renalFunction && drug.dosing.renalDose) {
    dose = drug.dosing.renalDose
  }

  if (hepaticFunction && drug.dosing.hepaticDose) {
    dose = drug.dosing.hepaticDose
  }

  return { standardDose: dose, frequency, route }
}

export function checkPregnancySafety(drugId: string): PregnancyCategory {
  const drug = getDrug(drugId)
  if (!drug) return { category: 'Unknown', riskLevel: 'caution', notes: 'Drug not found' }
  return drug.pregnancy
}

export function checkLactationSafety(drugId: string): LactationCategory {
  const drug = getDrug(drugId)
  if (!drug) return { compatible: false, riskLevel: 'caution', notes: 'Drug not found' }
  return drug.lactation
}

export function getMonitoringRequirements(drugId: string): string[] {
  const drug = getDrug(drugId)
  if (!drug) return []
  return drug.monitoring
}

export function getAllDrugs(): DrugRecord[] {
  return Array.from(drugDatabase.values())
}

export function clearDrugDatabase(): void {
  drugDatabase.clear()
}

export default {
  registerDrug,
  getDrug,
  searchDrugs,
  checkDrugInteractions,
  checkContraindications,
  getDosingForPatient,
  checkPregnancySafety,
  checkLactationSafety,
  getMonitoringRequirements,
  getAllDrugs,
  clearDrugDatabase,
}