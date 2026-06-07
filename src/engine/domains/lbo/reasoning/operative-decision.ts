export type OperativeIndicationUrgency = 'immediate' | 'emergency' | 'urgent' | 'elective';

export interface OperativeDecisionInput {
  subtype: string;
  ischemiaLikelihood: 'low' | 'moderate' | 'high' | 'very_high';
  perforation: boolean;
  freeAir: boolean;
  lactate: number;
  peritonism: boolean;
  endoscopicDetorsionPossible: boolean;
  previousDetorsionAttempts: number;
  patientStable: boolean;
  age: number;
  comorbidities: string[];
  pregnancy: boolean;
  previousAbdominalSurgeries: boolean;
  bmi: number | undefined;
}

export interface OperativeOption {
  procedure: string;
  approach: 'open_laparotomy' | 'laparoscopic' | 'laparoscopic_converted';
  stomaRequired: boolean;
  stomaType: string;
  urgency: OperativeIndicationUrgency;
  indications: string[];
  contraindications: string[];
  evidenceLevel: 'A' | 'B' | 'C';
  mortalityRisk: string;
  morbidityRisk: string;
}

export interface OperativeDecisionResult {
  requiresSurgery: boolean;
  urgency: OperativeIndicationUrgency;
  recommendedProcedure: OperativeOption;
  alternativeProcedures: OperativeOption[];
  reasonForChoice: string;
  preOptimisation: string[];
  specialConsiderations: string[];
  canProceedDirectly: boolean;
  blockingFactors: string[];
}

export function decideOperativeApproach(input: OperativeDecisionInput): OperativeDecisionResult {
  const requiresSurgery = input.ischemiaLikelihood === 'high' || input.ischemiaLikelihood === 'very_high'
    || input.perforation || input.freeAir || input.lactate > 4
    || (input.subtype !== 'pseudo_obstruction' && !input.endoscopicDetorsionPossible);

  const urgency: OperativeIndicationUrgency = input.freeAir || input.ischemiaLikelihood === 'very_high' || input.lactate > 6
    ? 'immediate'
    : input.ischemiaLikelihood === 'high' || input.lactate > 4 || input.perforation
      ? 'emergency'
      : input.subtype === 'sigmoid_volvulus' && input.endoscopicDetorsionPossible
        ? 'urgent'
        : input.subtype === 'obstructing_cancer'
          ? 'urgent'
          : 'elective';

  const blockingFactors: string[] = [];
  if (!input.patientStable && requiresSurgery) {
    blockingFactors.push('Patient haemodynamically unstable — resuscitate before/during surgery');
  }
  if (input.lactate > 6 && !input.patientStable) {
    blockingFactors.push('Critical lactate — damage control surgery protocol recommended');
  }

  // Build procedure options
  const options = buildProcedureOptions(input);

  const recommendedProcedure = options[0];
  const alternativeProcedures = options.slice(1);

  const preOptimisation: string[] = [
    'Crossmatch 2-4 units PRBC',
    'IV broad-spectrum antibiotics at induction',
    'Enoxaparin 40mg SC for VTE prophylaxis',
    'NG tube and urinary catheter in situ',
    'Warming blanket to prevent hypothermia',
  ];
  if (input.age > 70) preOptimisation.push('Arterial line for continuous BP monitoring');
  if (input.lactate > 4) preOptimisation.push('ICU bed booked post-operatively');
  if (input.comorbidities.includes('diabetes')) preOptimisation.push('Sliding scale insulin intra-operatively');

  const specialConsiderations: string[] = [];
  if (input.previousAbdominalSurgeries) {
    specialConsiderations.push('Previous abdominal surgery — adhesions expected, consider open approach or Veress needle placement');
  }
  if (input.pregnancy) {
    specialConsiderations.push('Pregnant — obstetrician present, foetal monitoring, left lateral tilt, minimise pneumoperitoneum pressure');
  }
  if (input.bmi !== undefined && input.bmi > 40) {
    specialConsiderations.push('Morbid obesity — longer instruments, higher pneumoperitoneum pressure, wound complications increased');
  }

  return {
    requiresSurgery,
    urgency,
    recommendedProcedure,
    alternativeProcedures,
    reasonForChoice: buildReasonString(input, recommendedProcedure),
    preOptimisation,
    specialConsiderations,
    canProceedDirectly: blockingFactors.length === 0,
    blockingFactors,
  };
}

function buildProcedureOptions(input: OperativeDecisionInput): OperativeOption[] {
  const options: OperativeOption[] = [];

  if (input.ischemiaLikelihood === 'high' || input.ischemiaLikelihood === 'very_high'
    || input.perforation || input.freeAir || input.lactate > 4) {
    // Ischaemic/perforated — Hartmann's procedure
    options.push({
      procedure: 'Emergency midline laparotomy, sigmoid colectomy, Hartmann\'s procedure (end colostomy + mucous fistula)',
      approach: 'open_laparotomy',
      stomaRequired: true,
      stomaType: 'End colostomy (left iliac fossa)',
      urgency: input.freeAir ? 'immediate' : 'emergency',
      indications: ['Bowel ischaemia/gangrene', 'Perforation', 'Faecal peritonitis', 'Lactate >4 with clinical deterioration'],
      contraindications: ['None in emergency setting — life-saving procedure'],
      evidenceLevel: 'A',
      mortalityRisk: '10-20% (emergency)',
      morbidityRisk: '40-50% (wound infection 15%, stoma complications 20%, ileus 10%)',
    });

    // Alternative: Primary anastomosis if viable
    options.push({
      procedure: 'Emergency laparotomy, sigmoid colectomy, primary anastomosis +/- defunctioning loop ileostomy',
      approach: 'open_laparotomy',
      stomaRequired: false,
      stomaType: 'Temporary loop ileostomy if created',
      urgency: 'emergency',
      indications: ['Bowel viable at resection margins', 'Haemodynamically stable', 'No faecal contamination', 'Well-nourished patient'],
      contraindications: ['Haemodynamic instability', 'Faecal peritonitis', 'Severe malnutrition', 'Prolonged ischaemia time'],
      evidenceLevel: 'B',
      mortalityRisk: '5-8%',
      morbidityRisk: '30-40% (anastomotic leak 3-5%, wound infection 15%)',
    });
  } else if (input.subtype === 'sigmoid_volvulus') {
    // Non-ischaemic volvulus — sigmoid resection with primary anastomosis
    options.push({
      procedure: 'Laparoscopic sigmoid colectomy with primary anastomosis (same admission after endoscopic detorsion)',
      approach: 'laparoscopic',
      stomaRequired: false,
      stomaType: 'N/A',
      urgency: 'urgent',
      indications: ['Non-ischaemic sigmoid volvulus', 'Endoscopic detorsion successful', 'Bowel preparation completed'],
      contraindications: ['Bowel ischaemia', 'Perforation', 'Severe abdominal distension preventing pneumoperitoneum'],
      evidenceLevel: 'A',
      mortalityRisk: '1-3% (elective)',
      morbidityRisk: '15-20% (wound infection 5%, ileus 8%, anastomotic leak 2%)',
    });

    options.push({
      procedure: 'Open sigmoid colectomy with primary anastomosis',
      approach: 'open_laparotomy',
      stomaRequired: false,
      stomaType: 'N/A',
      urgency: 'urgent',
      indications: ['Failed/difficult laparoscopic approach', 'Previous multiple abdominal surgeries', 'Severe distension'],
      contraindications: ['None absolute'],
      evidenceLevel: 'B',
      mortalityRisk: '2-5%',
      morbidityRisk: '20-30%',
    });
  } else if (input.subtype === 'obstructing_cancer') {
    options.push({
      procedure: 'Laparoscopic/open colectomy with primary anastomosis (right/left depending on tumour location)',
      approach: 'laparoscopic',
      stomaRequired: false,
      stomaType: 'Temporary stoma may be required if anastomosis unsafe',
      urgency: 'urgent',
      indications: ['Obstructing colorectal cancer', 'Potentially curable (no metastases or resectable metastases)'],
      contraindications: ['Unresectable metastases (consider stoma only)', 'Perforation (emergency open approach)'],
      evidenceLevel: 'A',
      mortalityRisk: '2-5% (elective)',
      morbidityRisk: '20-30%',
    });

    options.push({
      procedure: 'Colonic stenting as bridge to surgery (for left-sided obstruction)',
      approach: 'laparoscopic',
      stomaRequired: false,
      stomaType: 'N/A',
      urgency: 'urgent',
      indications: ['Left-sided obstructing cancer', 'Medically optimisable', 'Stent-able stricture'],
      contraindications: ['Perforation', 'Peritonitis', 'Multiple level obstruction', 'Rectal cancer <5cm from anal verge'],
      evidenceLevel: 'B',
      mortalityRisk: '0.5-1% (stent-related)',
      morbidityRisk: '10-15% (perforation 4%, stent migration 3%, re-obstruction 5%)',
    });
  } else {
    // Pseudo-obstruction or other
    options.push({
      procedure: 'Conservative management — NBM, NG tube, correct electrolytes, mobilise',
      approach: 'open_laparotomy',
      stomaRequired: false,
      stomaType: 'N/A',
      urgency: 'elective',
      indications: ['Pseudo-obstruction (Ogilvie\'s) confirmed', 'No ischaemia/perforation', 'Stable patient'],
      contraindications: ['Ischaemia', 'Perforation', 'Clinical deterioration'],
      evidenceLevel: 'B',
      mortalityRisk: '<1%',
      morbidityRisk: '<5%',
    });

    options.push({
      procedure: 'Neostigmine 2mg IV over 3-5 minutes with cardiac monitoring',
      approach: 'open_laparotomy',
      stomaRequired: false,
      stomaType: 'N/A',
      urgency: 'urgent',
      indications: ['Pseudo-obstruction not improving after 24h conservative therapy'],
      contraindications: ['Bradycardia', 'Asthma', 'Arrhythmia', 'Mechanical obstruction'],
      evidenceLevel: 'A',
      mortalityRisk: '<1%',
      morbidityRisk: '5-10% (bradycardia, hypersalivation, vomiting)',
    });
  }

  return options;
}

function buildReasonString(input: OperativeDecisionInput, selected: OperativeOption): string {
  const parts: string[] = [];
  parts.push(`Subtype: ${input.subtype}.`);
  parts.push(`Ischaemia likelihood: ${input.ischemiaLikelihood}.`);
  parts.push(`Perforation: ${input.perforation ? 'Yes' : 'No'}.`);

  if (selected.urgency === 'immediate') {
    parts.push('Emergency indications met: free air/perforation/transmural ischaemia — life-saving surgery cannot be delayed.');
  } else if (selected.urgency === 'emergency') {
    parts.push('Urgent indications: high ischaemia concern — surgery within hours.');
  } else if (selected.urgency === 'urgent') {
    parts.push('Non-emergency: proceed with same-admission definitive surgery after optimisation.');
  }

  parts.push(`Selected procedure: ${selected.procedure}.`);
  parts.push(`Stoma required: ${selected.stomaRequired ? `Yes (${selected.stomaType})` : 'No — primary anastomosis planned'}.`);
  parts.push(`Evidence level: ${selected.evidenceLevel}.`);

  if (selected.stomaRequired) {
    parts.push('Stoma formed because: ischaemic/contaminated bowel precludes safe anastomosis. Hartmann\'s procedure is safest in emergency setting (WSES Grade A recommendation).');
  }

  return parts.join(' ');
}
