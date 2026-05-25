export type { DrugEntry, DrugDose, DrugInteraction } from './drugDatabase';
export {
  getDrug,
  searchDrugs,
  getDrugsByCategory,
  getDrugsByClass,
  checkInteractions,
  generateDosingSuggestion,
  checkContraindications,
  calculateDoseByWeight,
  DRUG_DATABASE,
} from './drugDatabase';
