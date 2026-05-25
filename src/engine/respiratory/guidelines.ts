import { DiseaseId, Severity } from '@/src/types';
import { DrugDosingRule, GuidelineRecommendation } from '@/src/types/clinical';

// ─── Kenyan MOH / WHO Pediatric Drug Dosing ───────────────────────────────
const DRUG_DOSING: Record<string, DrugDosingRule[]> = {
  amoxicillin: [
    { drugName: 'Amoxicillin', indication: 'Mild-moderate pneumonia (outpatient)', weightBased: true, doseMgPerKg: 50, frequency: '12 hourly', route: 'Oral', maxDose: '1000mg/dose', ageMinMonths: 1, duration: '5 days' },
    { drugName: 'Amoxicillin', indication: 'Severe pneumonia (step-down)', weightBased: true, doseMgPerKg: 80, frequency: '8 hourly', route: 'Oral', maxDose: '1000mg/dose', duration: '5–7 days' },
  ],
  benzylpenicillin: [
    { drugName: 'Benzylpenicillin', indication: 'Severe pneumonia (inpatient)', weightBased: true, doseMgPerKg: 50, frequency: '6 hourly', route: 'IV/IM', maxDose: '2.4g/dose', notes: 'Use 50,000 units/kg = 50 mg/kg' },
  ],
  gentamicin: [
    { drugName: 'Gentamicin', indication: 'Neonatal sepsis / severe pneumonia (combination)', weightBased: true, doseMgPerKg: 7.5, frequency: '24 hourly', route: 'IV/IM', ageMinMonths: 0, ageMaxMonths: 12, duration: '5–7 days', notes: 'Monitor renal function' },
  ],
  ceftriaxone: [
    { drugName: 'Ceftriaxone', indication: 'Severe pneumonia / sepsis', weightBased: true, doseMgPerKg: 80, frequency: '24 hourly', route: 'IV/IM', maxDose: '2g/dose', ageMinMonths: 1, notes: 'First line for severe community-acquired pneumonia in children' },
  ],
  salbutamol_neb: [
    { drugName: 'Salbutamol neb', indication: 'Acute asthma exacerbation', weightBased: false, doseMg: 2.5, frequency: 'Every 20 min PRN', route: 'Nebulised', weightMinKg: 5, weightMaxKg: 20, notes: 'Use 2.5mg if <20kg, 5mg if ≥20kg' },
    { drugName: 'Salbutamol neb', indication: 'Acute asthma exacerbation (≥20kg)', weightBased: false, doseMg: 5, frequency: 'Every 20 min PRN', route: 'Nebulised', weightMinKg: 20, notes: 'Continuous neb in severe attack' },
  ],
  prednisolone: [
    { drugName: 'Prednisolone', indication: 'Acute asthma (oral)', weightBased: true, doseMgPerKg: 2, frequency: '24 hourly', route: 'Oral', maxDose: '40mg/dose', duration: '3–5 days', notes: 'Give early in moderate-severe attack' },
  ],
  dexamethasone: [
    { drugName: 'Dexamethasone', indication: 'Croup (oral/IM)', weightBased: true, doseMgPerKg: 0.15, frequency: 'Single dose', route: 'Oral', maxDose: '10mg', notes: 'Single dose effective for mild-moderate croup' },
    { drugName: 'Dexamethasone', indication: 'Croup (severe)', weightBased: true, doseMgPerKg: 0.6, frequency: 'Single dose', route: 'IV/IM', maxDose: '10mg', notes: 'Use IM/IV if oral not possible' },
  ],
  adrenaline_neb: [
    { drugName: 'Adrenaline neb', indication: 'Severe croup / post-extubation stridor', weightBased: true, doseMgPerKg: 0.5, frequency: 'Stat PRN', route: 'Nebulised', maxDose: '5mg', notes: 'Use 1:1000 solution. Monitor for rebound stridor after 2h' },
  ],
  magnesium_sulfate: [
    { drugName: 'Magnesium sulfate', indication: 'Severe acute asthma (IV)', weightBased: true, doseMgPerKg: 40, frequency: 'Single dose IV over 20 min', route: 'IV', maxDose: '2g', notes: 'Give if no response to intensive nebulised therapy' },
  ],
  rifampicin: [
    { drugName: 'Rifampicin', indication: 'TB — intensive phase', weightBased: true, doseMgPerKg: 15, frequency: '24 hourly', route: 'Oral', maxDose: '600mg/dose', ageMinMonths: 3, duration: '2 months', notes: 'Part of HRZE regimen' },
  ],
  isoniazid: [
    { drugName: 'Isoniazid', indication: 'TB — intensive and continuation phases', weightBased: true, doseMgPerKg: 10, frequency: '24 hourly', route: 'Oral', maxDose: '300mg/dose', ageMinMonths: 3, notes: 'Give with pyridoxine 1mg/kg to prevent peripheral neuropathy' },
  ],
  pyrazinamide: [
    { drugName: 'Pyrazinamide', indication: 'TB — intensive phase', weightBased: true, doseMgPerKg: 35, frequency: '24 hourly', route: 'Oral', maxDose: '2g/dose', ageMinMonths: 3, duration: '2 months' },
  ],
  ethambutol: [
    { drugName: 'Ethambutol', indication: 'TB — intensive phase', weightBased: true, doseMgPerKg: 20, frequency: '24 hourly', route: 'Oral', maxDose: '1.2g/dose', ageMinMonths: 8, duration: '2 months', notes: 'Monitor vision — can cause optic neuritis' },
  ],
  paracetamol: [
    { drugName: 'Paracetamol', indication: 'Fever / pain', weightBased: true, doseMgPerKg: 15, frequency: '6–8 hourly PRN', route: 'Oral', ageMinMonths: 1, notes: 'Max 4 doses per 24 hours' },
  ],
  ibuprofen: [
    { drugName: 'Ibuprofen', indication: 'Fever / pain', weightBased: true, doseMgPerKg: 10, frequency: '8 hourly PRN', route: 'Oral', ageMinMonths: 3, notes: 'Max 3 doses per 24 hours. Avoid if dehydrated or <3 months' },
  ],
};

// ─── Admission Criteria ──────────────────────────────────────────────────
const ADMISSION_CRITERIA: Record<string, string[]> = {
  pneumonia: ['SpO2 < 92%', 'Unable to feed', 'Chest indrawing', 'Age < 6 months', 'Signs of dehydration', 'Cyanosis', 'Convulsions', 'Not improving on oral antibiotics after 48h'],
  asthma: ['SpO2 < 92%', 'Unable to speak in sentences', 'Severe respiratory distress', 'PEF < 50% predicted', 'Poor response to initial bronchodilator therapy', 'Previous PICU admission for asthma'],
  bronchiolitis: ['Age < 6 weeks', 'SpO2 < 92%', 'Moderate-severe respiratory distress', 'Feeding < 50% normal', 'Apnoea', 'Congenital heart disease / CLD / immunodeficiency'],
  tb: ['Miliary TB', 'TB meningitis', 'Spinal TB', 'Drug-resistant TB', 'Severe wasting', 'HIV co-infection with TB'],
};

// ─── Kenyan Guidelines Engine ──────────────────────────────────────────
export class KenyaGuidelinesEngine {
  getDrugDosing(drugName: string): DrugDosingRule[] {
    const key = drugName.toLowerCase().replace(/\s+/g, '_');
    const match = DRUG_DOSING[key] || (() => {
      const found = Object.keys(DRUG_DOSING).find(k => k.includes(key) || key.includes(k));
      return found ? DRUG_DOSING[found] : undefined;
    })();
    return match || [];
  }

  getRecommendations(diseaseId: DiseaseId, severity: Severity): GuidelineRecommendation {
    const admissionCriteria = ADMISSION_CRITERIA[diseaseId] || [];

    let drugs: DrugDosingRule[] = [];
    switch (diseaseId) {
      case 'pneumonia':
        if (severity === 'mild') {
          drugs = [this.getDrugDosing('amoxicillin').find(r => r.indication.includes('Mild'))!].filter(Boolean);
        } else if (severity === 'moderate') {
          drugs = [this.getDrugDosing('amoxicillin').find(r => r.indication.includes('step-down'))!].filter(Boolean);
        } else {
          drugs = [
            this.getDrugDosing('ceftriaxone').find(r => r.indication.includes('Severe'))!,
            this.getDrugDosing('gentamicin').find(r => r.indication.includes('neonatal'))!,
          ].filter(Boolean);
        }
        break;
      case 'asthma':
        if (severity === 'mild') {
          drugs = [this.getDrugDosing('prednisolone').find(r => r.indication.includes('asthma'))!].filter(Boolean);
        } else {
          drugs = [
            this.getDrugDosing('salbutamol_neb').find(r => r.indication.includes('Acute'))!,
            this.getDrugDosing('prednisolone').find(r => r.indication.includes('asthma'))!,
            ...(severity === 'severe' ? [this.getDrugDosing('magnesium_sulfate').find(r => r.indication.includes('Severe'))!].filter(Boolean) : []),
          ].filter(Boolean);
        }
        break;
      case 'bronchiolitis':
        drugs = [];  // supportive care
        break;
      default:
        drugs = [];
    }

    return {
      diseaseId,
      severity: severity,
      firstLine: drugs,
      admissionCriteria,
      referralCriteria: [
        'Not improving after 48 hours of treatment',
        'Requiring oxygen therapy at home',
        'Recurrent admissions (≥3 in 12 months)',
        ...(diseaseId === 'tb' ? ['MDR-TB suspected', 'TB meningitis'] : []),
      ],
      monitoring: [
        'Respiratory rate every 4 hours',
        'SpO2 continuous if <94%',
        'Temperature 6-hourly',
        'Feeding assessment every shift',
        ...(severity === 'severe' || severity === 'critical' ? ['Hourly vital signs', 'Input/output chart', 'Fluid balance'] : []),
      ],
      patientEducation: [
        'Complete full course of medication even if child improves',
        'Return immediately if: difficulty breathing worsens, child becomes drowsy, feeding stops, develops cyanosis',
        'Keep follow-up appointment',
        'Smoke-free home environment',
      ],
      followUp: severity === 'mild' ? '2 days' : severity === 'moderate' ? '1 day (phone) or sooner' : 'Daily while admitted',
    };
  }

  calculateWeightBasedDose(rule: DrugDosingRule, weightKg: number): { dose: string; totalDaily: string } {
    if (rule.weightBased && rule.doseMgPerKg) {
      const dose = rule.doseMgPerKg * weightKg;
      const maxDoseMg = rule.maxDose ? this.parseMg(rule.maxDose) : Infinity;
      const finalDose = Math.min(dose, maxDoseMg);
      return {
        dose: `${finalDose}mg ${rule.frequency}`,
        totalDaily: `${finalDose * this.parseFrequency(rule.frequency)}mg/day`,
      };
    }
    const doseMg = rule.doseMg ?? 0;
    return {
      dose: `${doseMg}mg ${rule.frequency}`,
      totalDaily: `${doseMg * this.parseFrequency(rule.frequency)}mg/day`,
    };
  }

  private parseMg(s: string): number {
    const m = s.match(/(\d+)\s*mg/);
    return m ? parseInt(m[1]) : Infinity;
  }

  private parseFrequency(freq: string): number {
    const hourly = freq.match(/(\d+)\s*hourly/);
    if (hourly) return Math.round(24 / parseInt(hourly[1]));
    const daily = freq.match(/(\d+)\s*[dD]aily/);
    if (daily) return parseInt(daily[1]);
    if (freq.includes('OD') || freq.includes('24 hourly')) return 1;
    if (freq.includes('BD') || freq.includes('12 hourly')) return 2;
    if (freq.includes('TDS') || freq.includes('8 hourly')) return 3;
    if (freq.includes('QDS') || freq.includes('6 hourly')) return 4;
    if (freq.includes('PRN')) return 4;  // estimate for PRN
    return 1;
  }
}
