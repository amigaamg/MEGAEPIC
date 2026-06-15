import type { TreatmentRecommendation } from './treatmentRegistry';
import { getDiseaseCategory, getDiseaseName } from '../diseaseProfile';

const CATEGORY_TREATMENTS: Record<string, TreatmentRecommendation[]> = {
  cardiology: [
    { id: 'fb_tx_card_aspirin', intervention: 'Aspirin 75-100 mg PO daily (if indicated)', category: 'supportive', forCondition: [], rationale: 'Antiplatelet therapy for cardiovascular protection' },
    { id: 'fb_tx_card_beta', intervention: 'Beta-blocker (e.g., Bisoprolol 2.5-10 mg PO daily)', category: 'supportive', forCondition: [], dosage: '2.5-10 mg PO daily', rationale: 'Rate control and cardioprotection' },
    { id: 'fb_tx_card_ace', intervention: 'ACE Inhibitor (e.g., Ramipril 2.5-10 mg PO daily)', category: 'supportive', forCondition: [], dosage: '2.5-10 mg PO daily', rationale: 'Afterload reduction and cardioprotection' },
    { id: 'fb_tx_card_diuretic', intervention: 'Loop diuretic (e.g., Furosemide 20-40 mg PO/IV)', category: 'supportive', forCondition: [], dosage: '20-40 mg PO/IV', rationale: 'Volume management in heart failure' },
    { id: 'fb_tx_card_statin', intervention: 'High-intensity statin (Atorvastatin 40-80 mg PO daily)', category: 'supportive', forCondition: [], dosage: '40-80 mg PO daily', rationale: 'Lipid management and plaque stabilization' },
  ],
  respiratory: [
    { id: 'fb_tx_resp_o2', intervention: 'Oxygen therapy to target SpO2 ≥92%', category: 'supportive', forCondition: [], rationale: 'Correct hypoxemia' },
    { id: 'fb_tx_resp_bronchodilator', intervention: 'Inhaled bronchodilator (Salbutamol 2.5 mg nebulized PRN)', category: 'supportive', forCondition: [], dosage: '2.5 mg nebulized PRN', rationale: 'Relieve bronchospasm' },
    { id: 'fb_tx_resp_steroid', intervention: 'Corticosteroids (e.g., Prednisolone 40 mg PO daily)', category: 'supportive', forCondition: [], dosage: '40 mg PO daily', rationale: 'Reduce airway inflammation' },
    { id: 'fb_tx_resp_abx', intervention: 'Antibiotics if infection suspected (per local guidelines)', category: 'definitive', forCondition: [], rationale: 'Treat suspected bacterial infection' },
    { id: 'fb_tx_resp_physio', intervention: 'Chest physiotherapy and postural drainage', category: 'supportive', forCondition: [], rationale: 'Clear secretions and improve ventilation' },
  ],
  neurology: [
    { id: 'fb_tx_neuro_aspirin', intervention: 'Aspirin 300 mg PO (acute stroke) or antiplatelet therapy', category: 'definitive', forCondition: [], dosage: '300 mg PO loading', rationale: 'Acute ischemic stroke management' },
    { id: 'fb_tx_neuro_rehab', intervention: 'Neurological rehabilitation (physiotherapy, OT, speech therapy)', category: 'supportive', forCondition: [], rationale: 'Maximize functional recovery' },
    { id: 'fb_tx_neuro_analgesia', intervention: 'Analgesia (Paracetamol 1g QDS or NSAIDs PRN)', category: 'supportive', forCondition: [], dosage: '1g QDS', rationale: 'Pain management' },
    { id: 'fb_tx_neuro_anticonvulsant', intervention: 'Anticonvulsant if seizures (e.g., Levetiracetam 500 mg BD)', category: 'definitive', forCondition: [], dosage: '500 mg BD', rationale: 'Seizure control' },
  ],
  infectious: [
    { id: 'fb_tx_inf_abx', intervention: 'Empiric antibiotics per local guidelines and suspected source', category: 'definitive', forCondition: [], rationale: 'Treat suspected bacterial infection' },
    { id: 'fb_tx_inf_fluids', intervention: 'IV fluids (crystalloids) for resuscitation/maintenance', category: 'supportive', forCondition: [], rationale: 'Maintain hemodynamic stability and hydration' },
    { id: 'fb_tx_inf_antipyretics', intervention: 'Antipyretics (Paracetamol 1g PO/IV PRN for fever >38.5°C)', category: 'supportive', forCondition: [], dosage: '1g PO/IV PRN', rationale: 'Symptomatic fever management' },
    { id: 'fb_tx_inf_source', intervention: 'Source control (drainage, debridement, line removal if indicated)', category: 'definitive', forCondition: [], rationale: 'Remove focus of infection' },
  ],
  surgery: [
    { id: 'fb_tx_surg_ivf', intervention: 'IV fluids (crystalloids) — maintenance/resuscitation', category: 'supportive', forCondition: [], rationale: 'Maintain hydration and hemodynamic stability' },
    { id: 'fb_tx_surg_abx', intervention: 'Perioperative antibiotics (per local protocol)', category: 'supportive', forCondition: [], rationale: 'Surgical infection prophylaxis/treatment' },
    { id: 'fb_tx_surg_analgesia', intervention: 'Analgesia (PCA/epidural/regular paracetamol + NSAIDs)', category: 'supportive', forCondition: [], rationale: 'Post-operative pain management' },
    { id: 'fb_tx_surg_definitive', intervention: 'Definitive surgical management (as indicated)', category: 'definitive', forCondition: [], rationale: 'Definitive treatment of surgical pathology' },
    { id: 'fb_tx_surg_dvt_prophy', intervention: 'DVT prophylaxis (LMWH/TED stockings/IPC)', category: 'supportive', forCondition: [], rationale: 'Prevent thromboembolic complications' },
  ],
  orthopaedics: [
    { id: 'fb_tx_ortho_analgesia', intervention: 'Analgesia (Paracetamol + NSAIDs + Opioids PRN stepped approach)', category: 'supportive', forCondition: [], rationale: 'Pain management' },
    { id: 'fb_tx_ortho_immobilize', intervention: 'Immobilization (splint/cast/sling)', category: 'supportive', forCondition: [], rationale: 'Stabilize and protect injury' },
    { id: 'fb_tx_ortho_physio', intervention: 'Physiotherapy and rehabilitation program', category: 'supportive', forCondition: [], rationale: 'Restore function and mobility' },
    { id: 'fb_tx_ortho_surgery', intervention: 'Surgical intervention if indicated (ORIF/arthroplasty/arthroscopy)', category: 'definitive', forCondition: [], rationale: 'Definitive management of surgical orthopaedic conditions' },
  ],
  psychiatry: [
    { id: 'fb_tx_psych_safety', intervention: 'Risk assessment and safety planning (suicide/self-harm)', category: 'supportive', forCondition: [], rationale: 'Ensure patient safety' },
    { id: 'fb_tx_psych_meds', intervention: 'Pharmacotherapy as indicated (SSRI/SNRI/antipsychotic/mood stabilizer)', category: 'definitive', forCondition: [], rationale: 'Symptom management per diagnosis' },
    { id: 'fb_tx_psych_therapy', intervention: 'Psychotherapy (CBT/IPT/DBT as indicated)', category: 'supportive', forCondition: [], rationale: 'Evidence-based psychological intervention' },
    { id: 'fb_tx_psych_social', intervention: 'Social support and referral to community mental health services', category: 'supportive', forCondition: [], rationale: 'Continuity of care and psychosocial support' },
  ],
  endocrinology: [
    { id: 'fb_tx_end_metformin', intervention: 'Metformin (if Type 2 Diabetes) — 500 mg BD titrating to 1 g BD', category: 'supportive', forCondition: [], dosage: '500 mg BD titrating to 1 g BD', rationale: 'First-line glycemic control' },
    { id: 'fb_tx_end_insulin', intervention: 'Insulin therapy (if Type 1 Diabetes or DKA) per protocol', category: 'definitive', forCondition: [], rationale: 'Essential for Type 1 diabetes and acute metabolic emergencies' },
    { id: 'fb_tx_end_thyroxine', intervention: 'Levothyroxine (if hypothyroidism) — 50-100 mcg PO daily', category: 'definitive', forCondition: [], dosage: '50-100 mcg PO daily', rationale: 'Thyroid hormone replacement' },
    { id: 'fb_tx_end_carbimazole', intervention: 'Carbimazole (if hyperthyroidism) — 5-20 mg PO daily', category: 'definitive', forCondition: [], dosage: '5-20 mg PO daily', rationale: 'Antithyroid therapy' },
  ],
  gastroenterology: [
    { id: 'fb_tx_gi_ppis', intervention: 'PPI (Omeprazole 20-40 mg PO/IV daily)', category: 'supportive', forCondition: [], dosage: '20-40 mg PO/IV daily', rationale: 'Gastric acid suppression' },
    { id: 'fb_tx_gi_antiemetic', intervention: 'Antiemetics (Ondansetron 4-8 mg IV/Metoclopramide 10 mg TDS)', category: 'supportive', forCondition: [], dosage: '4-8 mg IV PRN', rationale: 'Symptomatic relief of nausea/vomiting' },
    { id: 'fb_tx_gi_fluids', intervention: 'IV fluids + electrolyte replacement', category: 'supportive', forCondition: [], rationale: 'Correct dehydration and electrolyte imbalance' },
    { id: 'fb_tx_gi_diet', intervention: 'Dietary modification (small frequent meals, avoid triggers)', category: 'supportive', forCondition: [], rationale: 'Symptom management' },
  ],
  urology: [
    { id: 'fb_tx_uro_abx', intervention: 'Antibiotics per culture sensitivity (for UTI/prostatitis)', category: 'definitive', forCondition: [], rationale: 'Treat urinary tract infection' },
    { id: 'fb_tx_uro_analgesia', intervention: 'Analgesia + alpha-blocker (Tamsulosin 0.4 mg PO daily for stones)', category: 'supportive', forCondition: [], dosage: '0.4 mg PO daily', rationale: 'Pain relief and stone passage facilitation' },
    { id: 'fb_tx_uro_catheter', intervention: 'Catheterization if urinary retention', category: 'definitive', forCondition: [], rationale: 'Relieve urinary obstruction' },
    { id: 'fb_tx_uro_surgery', intervention: 'Urological surgery (as indicated — TURP, nephrectomy, cystoscopy)', category: 'definitive', forCondition: [], rationale: 'Definitive management of urological pathology' },
  ],
  ent: [
    { id: 'fb_tx_ent_abx', intervention: 'Antibiotics (if bacterial infection — Amoxicillin 500 mg TDS)', category: 'definitive', forCondition: [], dosage: '500 mg TDS', rationale: 'Treat bacterial ENT infection' },
    { id: 'fb_tx_ent_analgesia', intervention: 'Analgesia + decongestants/antihistamines', category: 'supportive', forCondition: [], rationale: 'Symptomatic relief' },
    { id: 'fb_tx_ent_steroid_nasal', intervention: 'Intranasal corticosteroids (for allergic rhinitis/sinusitis)', category: 'supportive', forCondition: [], rationale: 'Reduce mucosal inflammation' },
    { id: 'fb_tx_ent_irrigation', intervention: 'Ear wick/irrigation (for otitis externa) or nasal saline irrigation', category: 'supportive', forCondition: [], rationale: 'Local management' },
  ],
  dermatology: [
    { id: 'fb_tx_derm_emollient', intervention: 'Emollients + topical steroids (potency matched to severity)', category: 'supportive', forCondition: [], rationale: 'First-line for inflammatory dermatoses' },
    { id: 'fb_tx_derm_antihistamine', intervention: 'Oral antihistamines (Cetirizine 10 mg PO daily for pruritus)', category: 'supportive', forCondition: [], dosage: '10 mg PO daily', rationale: 'Symptomatic relief of itching' },
    { id: 'fb_tx_derm_abx', intervention: 'Topical/oral antibiotics (for bacterial skin infections)', category: 'definitive', forCondition: [], rationale: 'Treat skin infection' },
    { id: 'fb_tx_derm_antifungal', intervention: 'Topical/oral antifungals (for fungal skin infections)', category: 'definitive', forCondition: [], rationale: 'Treat fungal infection' },
  ],
  general_medicine: [
    { id: 'fb_tx_gm_fluids', intervention: 'IV/oral fluids for hydration', category: 'supportive', forCondition: [], rationale: 'Maintain hydration' },
    { id: 'fb_tx_gm_analgesia', intervention: 'Analgesia (Paracetamol 1g QDS stepped approach)', category: 'supportive', forCondition: [], dosage: '1g QDS PRN', rationale: 'Symptomatic pain relief' },
    { id: 'fb_tx_gm_monitoring', intervention: 'Regular vital sign monitoring + clinical review', category: 'supportive', forCondition: [], rationale: 'Monitor progress and detect deterioration' },
    { id: 'fb_tx_gm_investigate', intervention: 'Targeted investigations to confirm diagnosis and guide management', category: 'supportive', forCondition: [], rationale: 'Establish definitive diagnosis' },
    { id: 'fb_tx_gm_referral', intervention: 'Specialist referral as indicated', category: 'supportive', forCondition: [], rationale: 'Appropriate specialist input' },
  ],
};

export function getFallbackTreatments(diseaseIds: string[]): TreatmentRecommendation[] {
  const result: TreatmentRecommendation[] = [];
  const seen = new Set<string>();

  for (const did of diseaseIds) {
    const cat = getDiseaseCategory(did);
    const txs = CATEGORY_TREATMENTS[cat] || CATEGORY_TREATMENTS['general_medicine'];
    for (const tx of txs) {
      if (!seen.has(tx.id)) {
        seen.add(tx.id);
        result.push({
          ...tx,
          forCondition: [did],
          rationale: `${tx.rationale} — suggested for ${getDiseaseName(did)}`,
        });
      }
    }
  }

  return result;
}
