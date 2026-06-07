export interface ImagingFinding {
  sign: string;
  positive: boolean;
  weight: number;
  favoursSubtype?: string;
  interpretation: string;
}

export interface AxrResult {
  findings: ImagingFinding[];
  coffeeBeanSign: boolean;
  bentInnerTubeSign: boolean;
  freeAir: boolean;
  colonicDilationCm: number | undefined;
  airFluidLevels: boolean;
  haustraPattern: boolean;
  interpretation: string;
  subtypeProbability: Record<string, number>;
}

export interface CtResult {
  findings: ImagingFinding[];
  transitionPoint: boolean;
  transitionLevel: string;
  mesentericSwirl: boolean;
  birdBeakSign: boolean;
  appleCoreLesion: boolean;
  colonicWallThickening: boolean;
  pneumatosis: boolean;
  portalVenousGas: boolean;
  freeFluid: boolean;
  freeAir: boolean;
  targetLesion: boolean;
  interpretation: string;
  subtype: string;
  ischemiaLikelihood: 'low' | 'moderate' | 'high';
}

export function interpretAxr(axrData: {
  coffeeBeanSign: boolean;
  bentInnerTubeSign: boolean;
  freeAir: boolean;
  colonicDilationCm: number;
  airFluidLevels: boolean;
  haustraPattern: 'haustra' | 'valvulae' | 'absent';
}): AxrResult {
  const findings: ImagingFinding[] = [];
  let volvulusScore = 0;
  let obstructionScore = 0;
  let perforationScore = 0;

  findings.push({
    sign: 'Coffee bean sign',
    positive: axrData.coffeeBeanSign,
    weight: axrData.coffeeBeanSign ? 40 : -10,
    favoursSubtype: 'sigmoid_volvulus',
    interpretation: axrData.coffeeBeanSign
      ? 'Pathognomonic for sigmoid volvulus — distended sigmoid loop with absent haustra forming a coffee bean shape'
      : 'Absent — does not exclude volvulus (sensitivity 70%)',
  });
  if (axrData.coffeeBeanSign) volvulusScore += 40;

  findings.push({
    sign: 'Bent inner tube sign',
    positive: axrData.bentInnerTubeSign,
    weight: axrData.bentInnerTubeSign ? 35 : 0,
    favoursSubtype: 'sigmoid_volvulus',
    interpretation: axrData.bentInnerTubeSign
      ? 'Suggests sigmoid volvulus — the twisted sigmoid loop resembles a bent inner tube'
      : 'Absent',
  });
  if (axrData.bentInnerTubeSign) volvulusScore += 35;

  findings.push({
    sign: 'Free air under diaphragm',
    positive: axrData.freeAir,
    weight: axrData.freeAir ? 50 : -5,
    favoursSubtype: undefined,
    interpretation: axrData.freeAir
      ? 'Pneumoperitoneum — indicates hollow viscus perforation. EMERGENCY.'
      : 'No free air — perforation unlikely',
  });
  if (axrData.freeAir) perforationScore += 50;

  findings.push({
    sign: 'Colonic dilation',
    positive: axrData.colonicDilationCm > 6,
    weight: axrData.colonicDilationCm > 10 ? 30 : axrData.colonicDilationCm > 6 ? 20 : -5,
    favoursSubtype: undefined,
    interpretation: `Colonic dilation ${axrData.colonicDilationCm}cm — normal <6cm, >10cm suggests volvulus (risk of perforation)`,
  });
  obstructionScore += axrData.colonicDilationCm > 10 ? 30 : axrData.colonicDilationCm > 6 ? 20 : -5;

  findings.push({
    sign: 'Air-fluid levels',
    positive: axrData.airFluidLevels,
    weight: axrData.airFluidLevels ? 15 : -3,
    favoursSubtype: undefined,
    interpretation: axrData.airFluidLevels
      ? 'Air-fluid levels present — consistent with mechanical obstruction'
      : 'Absent — may indicate pseudo-obstruction or early obstruction',
  });
  if (axrData.airFluidLevels) obstructionScore += 15;

  findings.push({
    sign: 'Haustra pattern',
    positive: axrData.haustraPattern === 'haustra',
    weight: axrData.haustraPattern === 'haustra' ? 10 : axrData.haustraPattern === 'valvulae' ? -10 : 0,
    favoursSubtype: undefined,
    interpretation: axrData.haustraPattern === 'haustra'
      ? 'Haustra visible — confirms large bowel (not small bowel) obstruction'
      : axrData.haustraPattern === 'valvulae'
        ? 'Valvulae conniventes visible — suggests SMALL BOWEL obstruction, not LBO'
        : 'Pattern cannot be determined',
  });

  const subtypeProbability: Record<string, number> = {
    sigmoid_volvulus: volvulusScore,
    simple_obstruction: Math.max(0, obstructionScore - volvulusScore),
    perforation: perforationScore,
  };

  let interpretation: string;
  if (axrData.freeAir) {
    interpretation = 'EMERGENCY: Free air under diaphragm — perforation. Immediate laparotomy indicated.';
  } else if (axrData.coffeeBeanSign && axrData.colonicDilationCm > 10) {
    interpretation = 'Findings strongly suggest sigmoid volvulus with significant colonic dilation.';
  } else if (axrData.coffeeBeanSign) {
    interpretation = 'Findings suggestive of sigmoid volvulus. CT recommended for confirmation and assessment of ischemia.';
  } else if (axrData.colonicDilationCm > 6 && axrData.airFluidLevels) {
    interpretation = 'Findings consistent with large bowel obstruction. CT recommended to identify cause.';
  } else if (axrData.colonicDilationCm > 6) {
    interpretation = 'Colonic dilation present. Clinical correlation needed.';
  } else {
    interpretation = 'No definitive signs of large bowel obstruction on AXR. If clinical suspicion remains, proceed to CT.';
  }

  return {
    findings,
    coffeeBeanSign: axrData.coffeeBeanSign,
    bentInnerTubeSign: axrData.bentInnerTubeSign,
    freeAir: axrData.freeAir,
    colonicDilationCm: axrData.colonicDilationCm,
    airFluidLevels: axrData.airFluidLevels,
    haustraPattern: axrData.haustraPattern === 'haustra',
    interpretation,
    subtypeProbability,
  };
}

export function interpretCt(ctData: {
  transitionPoint: boolean;
  transitionLevel: 'sigmoid' | 'rectosigmoid' | 'descending' | 'splenic_flexure' | 'transverse' | 'hepatic_flexure' | 'ascending' | 'caecum' | 'none';
  mesentericSwirl: boolean;
  birdBeakSign: boolean;
  appleCoreLesion: boolean;
  colonicWallThickening: boolean;
  pneumatosis: boolean;
  portalVenousGas: boolean;
  freeFluid: boolean;
  freeAir: boolean;
  targetLesion: boolean;
  cecalDilationCm: number;
}): CtResult {
  const findings: ImagingFinding[] = [];
  let subtype = 'other';
  let ischemiaLikelihood: CtResult['ischemiaLikelihood'] = 'low';

  findings.push({
    sign: 'Transition point',
    positive: ctData.transitionPoint,
    weight: ctData.transitionPoint ? 30 : -20,
    interpretation: ctData.transitionPoint
      ? `Transition point at ${ctData.transitionLevel} — confirms mechanical obstruction`
      : 'No transition point — consider pseudo-obstruction (Ogilvie\'s)',
  });

  findings.push({
    sign: 'Mesenteric swirl sign',
    positive: ctData.mesentericSwirl,
    weight: ctData.mesentericSwirl ? 45 : 0,
    favoursSubtype: 'sigmoid_volvulus',
    interpretation: ctData.mesentericSwirl
      ? 'Twisting of mesenteric vessels at the sigmoid — diagnostic of sigmoid volvulus'
      : 'Absent',
  });

  findings.push({
    sign: 'Bird beak sign',
    positive: ctData.birdBeakSign,
    weight: ctData.birdBeakSign ? 45 : 0,
    favoursSubtype: 'sigmoid_volvulus',
    interpretation: ctData.birdBeakSign
      ? 'Tapered narrowing at rectosigmoid junction with twisting — diagnostic of sigmoid volvulus'
      : 'Absent',
  });

  findings.push({
    sign: 'Apple core lesion',
    positive: ctData.appleCoreLesion,
    weight: ctData.appleCoreLesion ? 50 : 0,
    favoursSubtype: 'obstructing_cancer',
    interpretation: ctData.appleCoreLesion
      ? 'Apple core (napkin ring) lesion — characteristic of obstructing colorectal carcinoma'
      : 'Absent',
  });

  findings.push({
    sign: 'Colonic wall thickening',
    positive: ctData.colonicWallThickening,
    weight: ctData.colonicWallThickening ? 15 : 0,
    favoursSubtype: ctData.appleCoreLesion ? 'obstructing_cancer' : 'inflammatory',
    interpretation: ctData.colonicWallThickening
      ? 'Colonic wall thickening present — may indicate ischaemia, inflammation, or malignancy'
      : 'Normal colonic wall thickness',
  });

  // Ischemia assessment
  if (ctData.pneumatosis) {
    findings.push({
      sign: 'Pneumatosis intestinalis',
      positive: true,
      weight: 50,
      interpretation: 'Gas in the colonic wall — indicates transmural ischaemia/infarction. EMERGENCY.',
    });
    ischemiaLikelihood = 'high';
  }

  if (ctData.portalVenousGas) {
    findings.push({
      sign: 'Portal venous gas',
      positive: true,
      weight: 55,
      interpretation: 'Gas in portal venous system — indicates mesenteric infarction. EMERGENCY.',
    });
    ischemiaLikelihood = 'high';
  }

  if (ctData.freeAir) {
    findings.push({
      sign: 'Free air',
      positive: true,
      weight: 50,
      interpretation: 'Extraluminal air — indicates perforation. EMERGENCY.',
    });
    ischemiaLikelihood = 'high';
  }

  if (!ctData.pneumatosis && !ctData.portalVenousGas && ctData.mesentericSwirl) {
    ischemiaLikelihood = 'low';
  } else if (!ctData.pneumatosis && ctData.colonicWallThickening) {
    ischemiaLikelihood = 'moderate';
  }

  findings.push({
    sign: 'Free fluid',
    positive: ctData.freeFluid,
    weight: ctData.freeFluid ? 10 : 0,
    interpretation: ctData.freeFluid
      ? 'Free fluid present — may indicate peritonitis, ischaemia, or ascites'
      : 'No free fluid',
  });

  findings.push({
    sign: 'Target lesion',
    positive: ctData.targetLesion,
    weight: ctData.targetLesion ? 40 : 0,
    favoursSubtype: 'other',
    interpretation: ctData.targetLesion
      ? 'Target lesion — suggests intussusception (lead point)'
      : 'Absent',
  });

  // Determine subtype
  if (ctData.mesentericSwirl && ctData.birdBeakSign) {
    subtype = 'sigmoid_volvulus';
  } else if (ctData.appleCoreLesion) {
    subtype = 'obstructing_cancer';
  } else if (!ctData.transitionPoint) {
    subtype = 'pseudo_obstruction';
  } else if (ctData.targetLesion) {
    subtype = 'other';
  } else {
    subtype = 'other_mechanical';
  }

  let interpretation: string;
  if (ctData.freeAir || ctData.pneumatosis || ctData.portalVenousGas) {
    interpretation = `EMERGENCY: ${ctData.freeAir ? 'Perforation' : 'Bowel ischaemia/infarction'} detected. Requires immediate laparotomy.`;
  } else if (ctData.mesentericSwirl) {
    interpretation = 'Sigmoid volvulus confirmed with mesenteric swirl sign. No evidence of ischaemia. Non-ischaemic pattern — suitable for endoscopic detorsion.';
  } else if (ctData.appleCoreLesion) {
    interpretation = 'Obstructing colonic mass (apple core lesion) confirmed. Likely colorectal carcinoma. Requires surgical resection. Staging CT chest recommended.';
  } else if (!ctData.transitionPoint) {
    interpretation = 'No mechanical obstruction identified. Consider pseudo-obstruction (Ogilvie\'s syndrome). Manage conservatively.';
  } else {
    interpretation = `Mechanical large bowel obstruction at ${ctData.transitionLevel}. Further characterisation needed.`;
  }

  return {
    findings,
    transitionPoint: ctData.transitionPoint,
    transitionLevel: ctData.transitionLevel,
    mesentericSwirl: ctData.mesentericSwirl,
    birdBeakSign: ctData.birdBeakSign,
    appleCoreLesion: ctData.appleCoreLesion,
    colonicWallThickening: ctData.colonicWallThickening,
    pneumatosis: ctData.pneumatosis,
    portalVenousGas: ctData.portalVenousGas,
    freeFluid: ctData.freeFluid,
    freeAir: ctData.freeAir,
    targetLesion: ctData.targetLesion,
    interpretation,
    subtype,
    ischemiaLikelihood,
  };
}
