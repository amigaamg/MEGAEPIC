import type { FeatureRegistry } from '../../core/types';
import type { SeverityGrade } from './severityEngine';

export interface ManagementAction {
  category: 'resuscitation' | 'antibiotic' | 'surgical' | 'supportive' | 'monitoring' | 'disposition';
  action: string;
  detail: string;
  timing: 'immediate' | 'urgent' | 'routine' | 'ongoing';
  evidence?: string;
}

export interface AntibioticRegimen {
  regimen: string;
  duration: string;
  route: string;
  indication: string;
}

export interface ManagementPlanOutput {
  disease: string;
  diseaseId: string;
  severity: SeverityGrade;
  subtype: 'uncomplicated' | 'complicated_mass' | 'complicated_abscess' | 'complicated_perforated' | 'conservative_ocsner_sherren';
  resuscitation: ManagementAction[];
  antibiotics: AntibioticRegimen[];
  definitive: ManagementAction[];
  supportive: ManagementAction[];
  monitoring: ManagementAction[];
  disposition: ManagementAction[];
  intervalPlan: string;
  notes: string;
}

export function generateAppendicitisManagement(
  registry: FeatureRegistry,
  severity: SeverityGrade,
  context: {
    age?: number;
    pregnant?: boolean;
    isChild?: boolean;
    isElderly?: boolean;
  },
): ManagementPlanOutput {
  const suspectedPerforation =
    registry.generalized_guarding?.present ||
    registry.generalized_rigidity?.present ||
    registry.absent_bowel_sounds?.present ||
    registry.septic_appearance?.present;

  const suspectedMass =
    registry.palpable_rlq_mass?.present ||
    (registry.RIF_tenderness?.present && Number(registry.symptom_duration_days?.present ?? 0) >= 3);

  const suspectedAbscess =
    registry.high_fever?.present &&
    registry.tachycardia?.present &&
    (registry.rigors?.present || registry.wbc_above_15k?.present) &&
    (suspectedMass || !suspectedPerforation);

  let subtype: ManagementPlanOutput['subtype'] = 'uncomplicated';
  if (suspectedAbscess) subtype = 'complicated_abscess';
  else if (suspectedMass) subtype = 'complicated_mass';
  else if (suspectedPerforation) subtype = 'complicated_perforated';

  const resuscitation: ManagementAction[] = [];
  const antibiotics: AntibioticRegimen[] = [];
  const definitive: ManagementAction[] = [];
  const supportive: ManagementAction[] = [];
  const monitoring: ManagementAction[] = [];
  const disposition: ManagementAction[] = [];

  resuscitation.push({
    category: 'resuscitation',
    action: 'NBM (Nil By Mouth)',
    detail: 'Keep patient strictly NBM in preparation for possible surgery.',
    timing: 'immediate',
  });
  resuscitation.push({
    category: 'resuscitation',
    action: 'IV Access (×2 wide bore)',
    detail: 'Insert 14G or 16G IV cannula ×2. One in each forearm for fluid resuscitation.',
    timing: 'immediate',
  });
  resuscitation.push({
    category: 'resuscitation',
    action: 'IV Fluid Resuscitation',
    detail: 'Hartmann\'s or Normal Saline 1-2 L bolus (20 mL/kg in children), then 125 mL/hr maintenance. Correct electrolyte imbalances.',
    timing: 'immediate',
  });

  if (severity.level === 'critical' || severity.level === 'severe') {
    resuscitation.push({
      category: 'resuscitation',
      action: 'Urinary Catheter',
      detail: 'Insert Foley catheter. Monitor hourly urine output — target >0.5 mL/kg/hr.',
      timing: 'immediate',
    });
    resuscitation.push({
      category: 'resuscitation',
      action: 'NG Tube Insertion',
      detail: 'Insert NG tube on free drainage for gastric decompression if persistent vomiting or ileus.',
      timing: 'immediate',
    });
    resuscitation.push({
      category: 'resuscitation',
      action: 'Vasopressors if Hypotensive',
      detail: 'Start Noradrenaline IV infusion if MAP <65 mmHg despite adequate fluid resuscitation. Titrate to MAP ≥65 mmHg.',
      timing: 'immediate',
    });
  }

  if (subtype === 'uncomplicated') {
    antibiotics.push({
      regimen: 'Ceftriaxone 2g IV stat (30-60 min pre-incision) + Metronidazole 500mg IV stat',
      duration: 'Single pre-operative dose only',
      route: 'IV',
      indication: 'Surgical wound prophylaxis — uncomplicated appendicitis. Post-op antibiotics NOT needed.',
    });
  } else {
    antibiotics.push({
      regimen: 'Ceftriaxone 2g IV 24-hourly + Metronidazole 500mg IV 8-hourly',
      duration: '5-7 days (until afebrile, WBC normalizing, clinical improvement)',
      route: 'IV',
      indication: 'Complicated appendicitis — perforated, gangrenous, abscess, or phlegmon. Covers Gram-negative (E. coli, Klebsiella, Pseudomonas) and anaerobes (Bacteroides fragilis, Peptostreptococcus).',
    });
  }

  if (subtype === 'complicated_perforated' && registry.septic_appearance?.present) {
    antibiotics.push({
      regimen: 'Piperacillin/Tazobactam 4.5g IV 6-hourly OR Meropenem 1g IV 8-hourly',
      duration: '7-10 days (or until clinical resolution)',
      route: 'IV',
      indication: 'Escalation for severe sepsis/septic shock. Broad-spectrum coverage including Pseudomonas and ESBL-producing organisms.',
    });
  }

  if ((subtype as string) === 'conservative_ocsner_sherren' || subtype === 'complicated_mass') {
    antibiotics.push({
      regimen: 'Ceftriaxone 2g IV 24-hourly + Metronidazole 500mg IV 8-hourly',
      duration: '7-10 days IV, then 7 days oral (Ciprofloxacin 500mg BD + Metronidazole 400mg TDS)',
      route: 'IV then oral',
      indication: 'Antibiotics for appendix mass — treat the phlegmon/intra-abdominal infection.',
    });
  }

  if (context.isChild) {
    antibiotics.forEach(abx => {
      if (abx.regimen.includes('Ceftriaxone 2g')) {
        abx.regimen = abx.regimen.replace('Ceftriaxone 2g', 'Ceftriaxone 50-75 mg/kg');
      }
      if (abx.regimen.includes('Metronidazole 500mg')) {
        abx.regimen = abx.regimen.replace('Metronidazole 500mg', 'Metronidazole 7.5 mg/kg');
      }
    });
  }

  if (subtype === 'uncomplicated') {
    definitive.push({
      category: 'surgical',
      action: 'Laparoscopic Appendicectomy',
      detail: 'Gold standard. Three-port technique. Less post-op pain, shorter hospital stay (12-24h), faster return to normal activity. Can proceed to open if needed.',
      timing: 'urgent',
      evidence: 'Laparoscopic appendicectomy is preferred for uncomplicated appendicitis (EAES guidelines).',
    });
  } else if (subtype === 'complicated_mass') {
    definitive.push({
      category: 'surgical',
      action: 'Interval Appendicectomy (Ochsner-Sherren Regimen)',
      detail: 'Stage 1: Conservative — NBM, IV fluids, IV antibiotics (7-10 days), close monitoring of pulse, mass size, pain distribution. Contrast-enhanced CT to confirm mass. Stage 2: Interval appendicectomy 6-8 weeks later after mass has resolved and inflammation subsided.',
      timing: 'routine',
      evidence: 'Ochsner-Sherren regimen reduces operative difficulty and complication rate in appendix mass.',
    });
    definitive.push({
      category: 'monitoring',
      action: 'Daily Monitoring of Mass Size & Pulse',
      detail: 'Chart the mass dimensions daily (mark borders on abdomen). Monitor pulse rate 4-hourly. Rising pulse or enlarging mass suggests failure of conservative treatment.',
      timing: 'ongoing',
    });
    definitive.push({
      category: 'supportive',
      action: 'Exceptions Requiring Immediate Surgery',
      detail: 'Very young, very elderly, suspected appendicular abscess, clinical deterioration (peritonitis, rising pulse, enlarging mass, fever despite antibiotics).',
      timing: 'immediate',
    });
  } else if (subtype === 'complicated_abscess') {
    definitive.push({
      category: 'surgical',
      action: 'Percutaneous Drainage (Radiologically Guided)',
      detail: 'CT- or US-guided percutaneous drainage of appendicular abscess. Send pus for culture and sensitivity. Definitive appendicectomy after resolution of infection (6-8 weeks interval).',
      timing: 'urgent',
      evidence: 'Image-guided drainage is first-line for well-defined appendicular abscess (WSES guidelines).',
    });
  } else if (subtype === 'complicated_perforated') {
    definitive.push({
      category: 'surgical',
      action: 'Emergency Appendicectomy (Open or Laparoscopic)',
      detail: 'Midline laparotomy or laparoscopic approach depending on surgeon preference and patient stability. Peritoneal lavage with 3-5L warm saline. Broad-spectrum IV antibiotics. Drain placement if heavy contamination. Wound left open or delayed primary closure if gross contamination.',
      timing: 'immediate',
      evidence: 'Emergency surgery for perforated appendicitis with peritonitis — delay increases morbidity and mortality.',
    });
    definitive.push({
      category: 'surgical',
      action: 'Peritoneal Fluid Culture',
      detail: 'Send peritoneal fluid for microscopy, culture, and sensitivity. Tailor antibiotics based on culture results.',
      timing: 'immediate',
    });
  }

  supportive.push({
    category: 'supportive',
    action: 'IV Analgesia',
    detail: 'IV Paracetamol 1g 6-hourly (pediatric: 15 mg/kg). IV NSAIDs (Diclofenac 75mg or Ketorolac 30mg) if no contraindication. IV Morphine 2.5-5mg PRN for breakthrough pain (titrate to effect). Avoid masking peritonitis — document before analgesia.',
    timing: 'immediate',
  });
  supportive.push({
    category: 'supportive',
    action: 'Antiemetics',
    detail: 'IV Ondansetron 4-8mg 8-hourly (pediatric: 0.15 mg/kg). IV Metoclopramide 10mg 8-hourly PRN.',
    timing: 'urgent',
  });
  supportive.push({
    category: 'supportive',
    action: 'Correct Electrolyte Imbalance',
    detail: 'Replace K+, Na+, based on U/E/Cr results. Use maintenance IV fluids with appropriate electrolyte additives.',
    timing: 'urgent',
  });
  if (subtype !== 'uncomplicated') {
    supportive.push({
      category: 'supportive',
      action: 'NBM Status',
      detail: 'May need prolonged NBM with NG decompression until ileus resolves (bowel sounds return, patient passes flatus).',
      timing: 'ongoing',
    });
  }

  monitoring.push({
    category: 'monitoring',
    action: 'Vital Signs 4-hourly',
    detail: 'Monitor BP, HR, RR, SpO2, temperature every 4 hours. More frequently (hourly) if severe/critical.',
    timing: 'ongoing',
  });
  monitoring.push({
    category: 'monitoring',
    action: 'Serial Abdominal Examinations',
    detail: 'Document pain location, tenderness, guarding, rigidity, bowel sounds every 4 hours. Monitor for progression from localized to generalized peritonitis.',
    timing: 'ongoing',
  });
  monitoring.push({
    category: 'monitoring',
    action: 'Fluid Balance Chart',
    detail: 'Strict input/output chart. Monitor urine output (target >0.5 mL/kg/hr). Weigh daily if prolonged admission.',
    timing: 'ongoing',
  });
  if (subtype !== 'uncomplicated') {
    monitoring.push({
      category: 'monitoring',
      action: 'Serial WBC & CRP (48-72h)',
      detail: 'Monitor treatment response. Rising or persistently high levels suggest treatment failure, residual abscess, or ongoing infection.',
      timing: 'urgent',
    });
    monitoring.push({
      category: 'monitoring',
      action: 'Escalation Criteria',
      detail: 'Call surgeon immediately if: rising pulse, spreading peritonitis, enlarging mass, fever >39°C despite antibiotics, hypotension, oliguria, altered consciousness, lactate rising.',
      timing: 'immediate',
    });
  } else {
    monitoring.push({
      category: 'monitoring',
      action: 'Discharge Criteria',
      detail: 'Afebrile 24h, pain controlled on oral analgesia, tolerating oral intake, normalizing WBC/CRP, mobile independently. Discharge on day 1 post-op (laparoscopic) or day 2-3 (open).',
      timing: 'routine',
    });
  }

  if (subtype === 'uncomplicated' && registry.laparoscopic_available?.present !== false) {
    disposition.push({
      category: 'disposition',
      action: 'Admit to Surgical Ward',
      detail: 'Admit for urgent laparoscopic appendicectomy. Expected LOS: 12-24h post-op. Discharge when tolerating oral intake and pain controlled.',
      timing: 'urgent',
    });
  } else if (subtype === 'complicated_perforated') {
    disposition.push({
      category: 'disposition',
      action: 'Admit to ICU/HDU',
      detail: 'Severe/critical disease requires ICU monitoring. Vasopressors, close monitoring of organ function, post-operative care.',
      timing: 'immediate',
    });
  } else if (subtype === 'complicated_mass' || subtype === 'complicated_abscess') {
    disposition.push({
      category: 'disposition',
      action: 'Admit to Surgical Ward (Conservative)',
      detail: 'Admit for conservative management. IV antibiotics, NBM, serial monitoring. Plan interval appendicectomy in 6-8 weeks.',
      timing: 'urgent',
    });
  } else {
    disposition.push({
      category: 'disposition',
      action: 'Admit to Surgical Ward',
      detail: 'Admit for appendicectomy. Monitor post-op and discharge as per recovery.',
      timing: 'urgent',
    });
  }

  let intervalPlan = '';
  if (subtype === 'complicated_mass' || subtype === 'complicated_abscess') {
    intervalPlan = 'Interval appendicectomy scheduled 6-8 weeks after discharge. Confirm resolution of mass/abscess on CT before surgery. Laparoscopic approach if feasible.';
  } else if (subtype === 'uncomplicated') {
    intervalPlan = 'No interval procedure needed. Appendicectomy is definitive treatment. Routine follow-up in surgical clinic at 2 weeks for wound check.';
  } else {
    intervalPlan = 'Post-operative follow-up in surgical clinic at 2 weeks for wound review. If drain placed: plan drain removal when output <20 mL/day (usually 3-5 days). Histology results review at follow-up.';
  }

  let notes = '';
  switch (subtype) {
    case 'uncomplicated':
      notes = 'UNCOMPLICATED APPENDICITIS: Laparoscopic appendicectomy is definitive. Single-dose pre-op antibiotics sufficient. Early feeding post-op. Discharge 12-24h after surgery.';
      break;
    case 'complicated_mass':
      notes = 'APPENDIX MASS: Manage conservatively with Ochsner-Sherren regimen. DO NOT attempt appendicectomy in acute phase — risk of iatrogenic injury to inflamed adherent bowel. Interval appendicectomy at 6-8 weeks.';
      break;
    case 'complicated_abscess':
      notes = 'APPENDICULAR ABSCESS: Percutaneous drainage + IV antibiotics. Drain culture guides targeted antibiotics. Interval appendicectomy after complete resolution. If drainage fails or abscess ruptures → emergency surgery.';
      break;
    case 'complicated_perforated':
      notes = 'PERFORATED APPENDICITIS: Emergency laparotomy or laparoscopic appendicectomy. Peritoneal lavage. Broad-spectrum IV antibiotics 5-7 days. ICU/HDU monitoring. High risk of post-op complications (wound infection, abscess, ileus).';
      break;
    default:
      notes = 'Appendicitis management plan generated.';
  }

  return {
    disease: 'Acute Appendicitis',
    diseaseId: 'appendicitis',
    severity,
    subtype,
    resuscitation,
    antibiotics,
    definitive,
    supportive,
    monitoring,
    disposition,
    intervalPlan,
    notes,
  };
}
