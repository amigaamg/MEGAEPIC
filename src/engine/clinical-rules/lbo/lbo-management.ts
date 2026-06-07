export type LboSubtype = 'sigmoid_volvulus' | 'obstructing_cancer' | 'pseudo_obstruction' | 'other';

export type UrgencyLevel = 'immediate' | 'emergency' | 'urgent' | 'elective';

export interface ManagementPhase {
  phase: 'resuscitation' | 'diagnostic' | 'definitive' | 'postop';
  actions: string[];
  timing: string;
  monitoring: string[];
}

export interface ManagementPlan {
  subtype: LboSubtype;
  urgency: UrgencyLevel;
  phases: ManagementPhase[];
  operativeApproach?: string;
  stomaLikelihood: 'low' | 'moderate' | 'high';
  icuRequired: boolean;
  sameAdmissionResection: boolean;
}

export interface LboManagementInput {
  subtype: LboSubtype;
  ischemiaPresent: boolean;
  perforationPresent: boolean;
  lactate: number;
  previousAttemps: number;
  patientStable: boolean;
  age: number;
  comorbidities: string[];
}

export function generateLboManagement(input: LboManagementInput): ManagementPlan {
  const ischaemicOrPerforated = input.ischemiaPresent || input.perforationPresent;

  const urgency: UrgencyLevel = input.perforationPresent
    ? 'immediate'
    : input.ischemiaPresent
      ? 'emergency'
      : input.subtype === 'sigmoid_volvulus'
        ? 'urgent'
        : input.subtype === 'obstructing_cancer'
          ? 'urgent'
          : 'elective';

  const phases: ManagementPhase[] = [];

  // Phase 1: Resuscitation (always)
  phases.push({
    phase: 'resuscitation',
    actions: [
      'NBM — nil by mouth',
      'Large-bore IV access x2 (16G minimum)',
      'IV crystalloid 30 mL/kg bolus, then 125 mL/hr maintenance',
      'NG tube on free drainage',
      'Urinary catheter — hourly output monitoring',
      'Bloods: FBC, U&E, CRP, Lactate, ABG, Crossmatch, Coagulation',
      'Blood cultures (if febrile)',
      'IV Ceftriaxone 2g + Metronidazole 500mg',
      'IV Paracetamol 1g for analgesia',
    ],
    timing: 'First 1 hour',
    monitoring: ['Vitals q15min', 'Urine output hourly', 'Fluid balance chart', 'Pain scores q30min'],
  });

  // Phase 2: Diagnostic
  phases.push({
    phase: 'diagnostic',
    actions: [
      'Erect + supine AXR',
      'CT Abdomen + Pelvis with IV contrast',
      'Lactate, ABG, FBC, U&E, CRP results review',
      'Confirm subtype and presence of ischaemia/perforation',
    ],
    timing: 'Within 2 hours',
    monitoring: ['Lactate', 'Abdominal girth measurement', 'Pain pattern assessment'],
  });

  // Phase 3: Definitive
  if (ischaemicOrPerforated) {
    phases.push({
      phase: 'definitive',
      actions: [
        'Emergency midline laparotomy',
        input.subtype === 'sigmoid_volvulus'
          ? 'Sigmoid colectomy + Hartmann\'s procedure (end colostomy)'
          : 'Resection of affected segment with stoma formation',
        'Abdominal lavage with warm saline',
        'Pelvic drain insertion',
        'Specimen for histology',
      ],
      timing: 'Within 1-2 hours of decision',
      monitoring: ['Vitals continuous', 'Lactate clearance', 'Urine output', 'Anaesthetic monitoring'],
    });
  } else if (input.subtype === 'sigmoid_volvulus') {
    phases.push({
      phase: 'definitive',
      actions: [
        'Flexible sigmoidoscopy + detorsion',
        'Insert flatus/rectal tube — leave 48 hours',
        'Serial AXR to confirm decompression',
        'Bowel preparation (PEG) over 2 days',
        'Elective sigmoid resection with primary anastomosis',
        'Same admission — recurrence rate >50% without resection',
      ],
      timing: 'Detorsion urgent (<12h). Resection within 2-5 days.',
      monitoring: ['Post-detorsion AXR', 'Vitals', 'Pain', 'Stool/flatus passage'],
    });
  } else if (input.subtype === 'obstructing_cancer') {
    phases.push({
      phase: 'definitive',
      actions: [
        'MDT discussion if time permits',
        input.patientStable
          ? 'Colonic stenting as bridge to surgery'
          : 'Emergency resection (right/left hemicolectomy)',
        'Primary anastomosis if viable bowel and stable patient',
        'Hartmann\'s procedure if contaminated or unstable',
        'Specimen for histology + staging',
      ],
      timing: 'Stenting: <24h. Surgery: 1-3 days (elective) or emergency if unstable.',
      monitoring: ['Post-operative vitals', 'Stoma output (if formed)', 'Drain output'],
    });
  } else {
    phases.push({
      phase: 'definitive',
      actions: [
        'Conservative: NBM, NG tube, correct electrolytes',
        'Mobilise patient',
        'Review medications (stop constipating agents)',
        'Neostigmine 2mg IV over 3-5 minutes if no improvement in 24h',
        'Colonoscopic decompression if neostigmine fails',
        'CT-guided percutaneous caecostomy if all else fails',
      ],
      timing: '24-72 hours',
      monitoring: ['Serial abdominal girth', 'AXR daily', 'Cardiac monitoring with neostigmine'],
    });
  }

  // Phase 4: Post-op (if applicable)
  if (ischaemicOrPerforated || input.subtype !== 'pseudo_obstruction') {
    const postOpActions: string[] = [
      'ICU vs ward depending on stability',
      'VTE prophylaxis: Enoxaparin 40 mg SC daily',
      'Continue IV antibiotics: Ceftriaxone + Metronidazole x 3-5 days',
      'NG tube: free drainage until output <300 mL/24h',
      'IV fluids until tolerating oral intake',
      'Pain management: multimodal (paracetamol + NSAIDs + opioids PRN)',
      'Chest physiotherapy + incentive spirometry',
      'Early mobilisation — OOB day 1',
      'Wound care: keep dry 48h, daily inspection',
    ];

    if (input.subtype === 'sigmoid_volvulus' && !ischaemicOrPerforated) {
      postOpActions.push('Stoma unlikely (primary anastomosis planned)');
    } else {
      postOpActions.push('Stoma therapy review within 24h');
      postOpActions.push('Stoma output monitoring: colour, volume, consistency');
    }

    phases.push({
      phase: 'postop',
      actions: postOpActions,
      timing: 'Day 0 to discharge (typically 5-7 days)',
      monitoring: [
        'Vitals q1h initially, decreasing as stable',
        'Lactate q4-6h x 24h, then daily',
        'Urine output hourly x 24h',
        'Fluid balance daily',
        'Bowel sounds daily',
        'Stoma output daily',
        'Wound inspection daily',
        'Drain output daily',
      ],
    });
  }

  const stomaLikelihood = ischaemicOrPerforated
    ? 'high'
    : input.subtype === 'obstructing_cancer'
      ? 'moderate'
      : 'low';

  return {
    subtype: input.subtype,
    urgency,
    phases,
    operativeApproach: ischaemicOrPerforated
      ? 'Emergency midline laparotomy'
      : input.subtype === 'sigmoid_volvulus'
        ? 'Laparoscopic sigmoid colectomy (elective)'
        : input.subtype === 'obstructing_cancer'
          ? 'Laparoscopic/open colectomy (elective vs emergency)'
          : undefined,
    stomaLikelihood,
    icuRequired: ischaemicOrPerforated || input.lactate > 4 || !input.patientStable,
    sameAdmissionResection: input.subtype === 'sigmoid_volvulus' || ischaemicOrPerforated,
  };
}
