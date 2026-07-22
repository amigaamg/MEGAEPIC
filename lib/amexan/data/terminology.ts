import type { CodeSystem, TerminologyEntry } from './types'

const _entries = new Map<string, TerminologyEntry>()

export function registerConcept(entry: TerminologyEntry) {
  _entries.set(entry.code, entry)
}

export function getConcept(code: string): TerminologyEntry | undefined {
  return _entries.get(code)
}

export function mapToSystem(code: string, system: CodeSystem): { code: string; system: CodeSystem; display: string } | undefined {
  const entry = _entries.get(code)
  if (!entry) return undefined
  if (entry.system === system) return { code: entry.code, system: entry.system, display: entry.display }
  return entry.concepts.find(c => c.system === system)
}

export function mapToSnomed(code: string): string {
  const mapped = mapToSystem(code, 'snomed')
  return mapped?.code ?? code
}

export function mapToIcd10(code: string): string {
  const mapped = mapToSystem(code, 'icd_10')
  return mapped?.code ?? code
}

export function mapToLoinc(code: string): string {
  const mapped = mapToSystem(code, 'loinc')
  return mapped?.code ?? code
}

export function mapToRxNorm(code: string): string {
  const mapped = mapToSystem(code, 'rxnorm')
  return mapped?.code ?? code
}

export function searchConcepts(query: string, system?: CodeSystem): TerminologyEntry[] {
  const q = query.toLowerCase()
  return Array.from(_entries.values()).filter(e => {
    if (system && e.system !== system) return false
    return e.display.toLowerCase().includes(q) ||
      e.synonyms.some(s => s.toLowerCase().includes(q)) ||
      e.code.toLowerCase().includes(q)
  })
}

export function getCommonDiagnoses(): TerminologyEntry[] {
  const commonCodes = ['A09', 'I10', 'E11', 'J15', 'N39', 'J45', 'E86', 'D50', 'I50', 'N18']
  return commonCodes.map(c => _entries.get(c)).filter(Boolean) as TerminologyEntry[]
}

export function getCommonLabs(): TerminologyEntry[] {
  const commonCodes = ['58410-2', '718-7', '6299-2', '2345-7', '26453-1', '590-5']
  return commonCodes.map(c => _entries.get(c)).filter(Boolean) as TerminologyEntry[]
}

export function getCommonMedications(): TerminologyEntry[] {
  const commonCodes = ['1656', '2670', '723', '10582', '751', '860975']
  return commonCodes.map(c => _entries.get(c)).filter(Boolean) as TerminologyEntry[]
}

export function seedTerminology() {
  const concepts: TerminologyEntry[] = [
    { code: 'A09', system: 'icd_10', display: 'Infectious gastroenteritis', synonyms: ['diarrhea', 'gastroenteritis', 'stomach flu'], concepts: [{ system: 'snomed', code: '62315008', display: 'Infectious gastroenteritis' }] },
    { code: 'I10', system: 'icd_10', display: 'Essential hypertension', synonyms: ['high blood pressure', 'HTN'], concepts: [{ system: 'snomed', code: '38341003', display: 'Essential hypertension' }] },
    { code: 'E11', system: 'icd_10', display: 'Type 2 diabetes mellitus', synonyms: ['diabetes', 'T2DM', 'adult onset diabetes'], concepts: [{ system: 'snomed', code: '44054006', display: 'Type 2 diabetes mellitus' }] },
    { code: 'J15', system: 'icd_10', display: 'Bacterial pneumonia', synonyms: ['pneumonia', 'chest infection'], concepts: [{ system: 'snomed', code: '385093006', display: 'Bacterial pneumonia' }] },
    { code: 'N39', system: 'icd_10', display: 'Urinary tract infection', synonyms: ['UTI', 'urinary infection'], concepts: [{ system: 'snomed', code: '68566005', display: 'Urinary tract infection' }] },
    { code: 'J45', system: 'icd_10', display: 'Asthma', synonyms: ['reactive airway disease', 'bronchial asthma'], concepts: [{ system: 'snomed', code: '195967001', display: 'Asthma' }] },
    { code: 'E86', system: 'icd_10', display: 'Volume depletion', synonyms: ['dehydration', 'hypovolemia'], concepts: [{ system: 'snomed', code: '34095006', display: 'Dehydration' }] },
    { code: 'D50', system: 'icd_10', display: 'Iron deficiency anemia', synonyms: ['anemia', 'low hemoglobin'], concepts: [{ system: 'snomed', code: '417746004', display: 'Iron deficiency anemia' }] },
    { code: 'I50', system: 'icd_10', display: 'Heart failure', synonyms: ['CHF', 'congestive heart failure', 'cardiac failure'], concepts: [{ system: 'snomed', code: '42343007', display: 'Heart failure' }] },
    { code: 'N18', system: 'icd_10', display: 'Chronic kidney disease', synonyms: ['CKD', 'renal failure', 'kidney disease'], concepts: [{ system: 'snomed', code: '709044004', display: 'Chronic kidney disease' }] },
    { code: '58410-2', system: 'loinc', display: 'Complete blood count', synonyms: ['CBC', 'full blood count', 'FBC', 'hemogram'], concepts: [{ system: 'snomed', code: '26604007', display: 'Complete blood count' }] },
    { code: '718-7', system: 'loinc', display: 'Hemoglobin', synonyms: ['Hb', 'Hgb'], concepts: [] },
    { code: '6299-2', system: 'loinc', display: 'Blood urea nitrogen', synonyms: ['BUN', 'urea'], concepts: [] },
    { code: '2345-7', system: 'loinc', display: 'Serum creatinine', synonyms: ['creatinine', 'Cr'], concepts: [] },
    { code: '26453-1', system: 'loinc', display: 'Erythrocyte sedimentation rate', synonyms: ['ESR', 'sed rate'], concepts: [] },
    { code: '590-5', system: 'loinc', display: 'White blood cell count', synonyms: ['WBC', 'leukocyte count'], concepts: [] },
    { code: '1656', system: 'rxnorm', display: 'Amoxicillin', synonyms: ['Amoxil', 'amoxicillin trihydrate'], concepts: [{ system: 'snomed', code: '387406002', display: 'Amoxicillin' }] },
    { code: '2670', system: 'rxnorm', display: 'Paracetamol', synonyms: ['acetaminophen', 'Panadol', 'Tylenol'], concepts: [{ system: 'snomed', code: '322235009', display: 'Paracetamol' }] },
    { code: '723', system: 'rxnorm', display: 'Metformin', synonyms: ['Glucophage', 'metformin hydrochloride'], concepts: [] },
    { code: '10582', system: 'rxnorm', display: 'Amlodipine', synonyms: ['Norvasc', 'amlodipine besylate'], concepts: [] },
    { code: '751', system: 'rxnorm', display: 'Omeprazole', synonyms: ['Prilosec', 'Losec', 'omeprazole magnesium'], concepts: [] },
    { code: '860975', system: 'rxnorm', display: 'Artemether-lumefantrine', synonyms: ['Coartem', 'AL', 'artemether with lumefantrine'], concepts: [] },
  ]

  for (const c of concepts) _entries.set(c.code, c)
}

seedTerminology()
