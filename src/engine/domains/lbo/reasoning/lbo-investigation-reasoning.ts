/**
 * LBO Investigation Reasoning Engine
 *
 * Suggests appropriate laboratory and imaging investigations based on
 * the patient's clinical presentation, with rationale for each.
 */

import type { RegistrationData, HistoryData, ExamData, InvestigationsData, ImagingData } from '../lbo-records';

export interface InvestigationSuggestion {
  category: 'lab' | 'imaging' | 'other';
  test: string;
  rationale: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  priority: number;
}

export interface InvestigationReasoningOutput {
  suggestions: InvestigationSuggestion[];
  labInterpretation: {
    keyFindings: { parameter: string; value: number; interpretation: string; flag: 'normal' | 'elevated' | 'low' | 'critical' }[];
    summary: string;
  };
  imagingInterpretation: {
    axrSummary: string;
    ctSummary: string;
    keyFindings: { modality: string; finding: string; significance: string }[];
  };
}

export function reasonInvestigations(
  history: HistoryData,
  exam: ExamData,
  investigations: InvestigationsData,
  imaging: ImagingData,
  reg: RegistrationData,
): InvestigationReasoningOutput {
  const suggestions: InvestigationSuggestion[] = [];
  const v = exam.vitals;
  const tachycardia = v.heartRate > 100;
  const febrile = v.temperature > 38;

  // ── Laboratory Suggestions ───────────────────────────────────────────────

  suggestions.push({
    category: 'lab',
    test: 'Full blood count (FBC)',
    rationale: 'To assess for leukocytosis (suggesting infection, ischaemia, or inflammation) and anaemia (suggesting chronic blood loss from colorectal cancer).',
    urgency: 'urgent',
    priority: 1,
  });

  suggestions.push({
    category: 'lab',
    test: 'Serum electrolytes, urea & creatinine',
    rationale: 'To assess for dehydration, AKI, and electrolyte derangements from vomiting and third-spacing. Hyponatraemia and hypokalaemia are common in prolonged obstruction.',
    urgency: 'urgent',
    priority: 1,
  });

  suggestions.push({
    category: 'lab',
    test: 'C-reactive protein (CRP)',
    rationale: 'Markedly elevated CRP (>100 mg/L) suggests significant inflammation or ischaemia and may indicate the need for urgent surgical intervention.',
    urgency: 'urgent',
    priority: 2,
  });

  suggestions.push({
    category: 'lab',
    test: 'Serum lactate',
    rationale: 'Elevated lactate (>2 mmol/L) raises concern for bowel ischaemia or hypoperfusion. Levels >4 mmol/L are strongly associated with gangrenous bowel.',
    urgency: 'emergency',
    priority: 1,
  });

  suggestions.push({
    category: 'lab',
    test: 'Blood gas (arterial or venous)',
    rationale: 'To assess acid-base status. Metabolic acidosis with elevated lactate suggests ischaemic bowel. Also provides rapid haemoglobin and electrolyte assessment.',
    urgency: 'emergency',
    priority: 2,
  });

  if (tachycardia || febrile || exam.distensionSeverity !== 'none') {
    suggestions.push({
      category: 'lab',
      test: 'Blood cultures (aerobic + anaerobic)',
      rationale: 'To rule out bacteraemia in the setting of suspected bowel ischaemia or perforation. Positive cultures may guide antibiotic therapy.',
      urgency: 'emergency',
      priority: 3,
    });
  }

  if (reg.age > 50 || history.hpiWeightLoss || history.hpiBleeding || history.familyHistory?.toLowerCase().includes('cancer')) {
    suggestions.push({
      category: 'lab',
      test: 'Carcinoembryonic antigen (CEA)',
      rationale: 'CEA is a tumour marker that may be elevated in colorectal cancer. Useful as a baseline if malignancy is suspected, though not diagnostic alone.',
      urgency: 'routine',
      priority: 4,
    });
    suggestions.push({
      category: 'lab',
      test: 'Coagulation profile (PT/APTT/INR)',
      rationale: 'To assess bleeding risk, particularly if surgical intervention is anticipated. Also may be deranged in malnutrition or liver disease.',
      urgency: 'urgent',
      priority: 3,
    });
  }

  suggestions.push({
    category: 'lab',
    test: 'Blood group & crossmatch',
    rationale: 'Essential before any surgical intervention. At least 2 units of packed red cells should be available given the potential for haemorrhage during laparotomy.',
    urgency: 'urgent',
    priority: 2,
  });

  // ── Imaging Suggestions ─────────────────────────────────────────────────

  suggestions.push({
    category: 'imaging',
    test: 'Erect chest X-ray',
    rationale: 'To exclude free air under the diaphragm (indicating perforation) and to assess for associated cardiopulmonary pathology.',
    urgency: 'emergency',
    priority: 1,
  });

  suggestions.push({
    category: 'imaging',
    test: 'Abdominal X-ray (erect + supine)',
    rationale: 'AXR is the first-line imaging for suspected LBO. Look for: coffee bean sign (sigmoid volvulus), bent inner tube sign (caecal volvulus), colonic dilation >6 cm, air-fluid levels, and the distribution of haustra vs. valvulae conniventes to distinguish large from small bowel.',
    urgency: 'emergency',
    priority: 1,
  });

  suggestions.push({
    category: 'imaging',
    test: 'CT abdomen & pelvis with IV contrast',
    rationale: 'Definitive imaging for LBO. CT identifies the transition point, distinguishes mechanical obstruction from pseudo-obstruction, identifies the cause (mass, volvulus, stricture), and detects complications (pneumatosis, free air, pneumoperitoneum).',
    urgency: 'emergency',
    priority: 2,
  });

  if (reg.sex === 'female' && reg.age >= 10 && reg.age <= 55) {
    const gynae = history.gynae;
    if (gynae?.pregnant) {
      suggestions.push({
        category: 'imaging',
        test: 'Pelvic USS (obstetric)',
        rationale: 'Patient is pregnant — CT with contrast is relatively contraindicated. Pelvic USS should be performed to assess the pregnancy and exclude gynaecological causes of distension.',
        urgency: 'urgent',
        priority: 2,
      });
    } else if (!gynae?.deniesPregnancy) {
      suggestions.push({
        category: 'other',
        test: 'Urine or serum β-hCG',
        rationale: 'Female patient of reproductive age — β-hCG must be checked before any radiation-based imaging to exclude pregnancy.',
        urgency: 'urgent',
        priority: 1,
      });
    }
  }

  // ── Lab Interpretation ───────────────────────────────────────────────────
  const keyFindings: { parameter: string; value: number; interpretation: string; flag: 'normal' | 'elevated' | 'low' | 'critical' }[] = [];

  if (investigations.wbc > 0) {
    if (investigations.wbc > 15) keyFindings.push({ parameter: 'WBC', value: investigations.wbc, interpretation: 'Leukocytosis — concerning for infection, ischaemia, or inflammatory process', flag: 'critical' });
    else if (investigations.wbc > 11) keyFindings.push({ parameter: 'WBC', value: investigations.wbc, interpretation: 'Mildly elevated white cell count', flag: 'elevated' });
    else keyFindings.push({ parameter: 'WBC', value: investigations.wbc, interpretation: 'White cell count within normal range', flag: 'normal' });
  }

  if (investigations.crp > 0) {
    if (investigations.crp > 100) keyFindings.push({ parameter: 'CRP', value: investigations.crp, interpretation: 'Markedly elevated CRP — significant inflammation; suspect ischaemia or perforation', flag: 'critical' });
    else if (investigations.crp > 10) keyFindings.push({ parameter: 'CRP', value: investigations.crp, interpretation: 'Elevated CRP — consistent with inflammatory process', flag: 'elevated' });
    else keyFindings.push({ parameter: 'CRP', value: investigations.crp, interpretation: 'CRP within normal range', flag: 'normal' });
  }

  if (investigations.lactate > 0) {
    if (investigations.lactate > 4) keyFindings.push({ parameter: 'Lactate', value: investigations.lactate, interpretation: 'Severely elevated lactate — strongly suggestive of bowel ischaemia or gangrene; emergency laparotomy indicated', flag: 'critical' });
    else if (investigations.lactate > 2) keyFindings.push({ parameter: 'Lactate', value: investigations.lactate, interpretation: 'Elevated lactate — concern for hypoperfusion or early ischaemia', flag: 'elevated' });
    else keyFindings.push({ parameter: 'Lactate', value: investigations.lactate, interpretation: 'Lactate within normal range — no evidence of tissue hypoperfusion', flag: 'normal' });
  }

  if (investigations.creatinine > 0) {
    if (investigations.creatinine > 110) keyFindings.push({ parameter: 'Creatinine', value: investigations.creatinine, interpretation: 'Elevated creatinine — acute kidney injury likely secondary to dehydration and third-spacing', flag: 'elevated' });
    else keyFindings.push({ parameter: 'Creatinine', value: investigations.creatinine, interpretation: 'Renal function within normal range', flag: 'normal' });
  }

  if (investigations.hemoglobin > 0) {
    if (investigations.hemoglobin < 7) keyFindings.push({ parameter: 'Hb', value: investigations.hemoglobin, interpretation: 'Severe anaemia — may reflect chronic blood loss from colorectal cancer', flag: 'critical' });
    else if (investigations.hemoglobin < 10) keyFindings.push({ parameter: 'Hb', value: investigations.hemoglobin, interpretation: 'Moderate anaemia — consider chronic disease or blood loss', flag: 'low' });
    else keyFindings.push({ parameter: 'Hb', value: investigations.hemoglobin, interpretation: 'Haemoglobin within normal range', flag: 'normal' });
  }

  let labSummary = '';
  if (keyFindings.length === 0) {
    labSummary = 'No laboratory results have been entered yet.';
  } else {
    const criticals = keyFindings.filter(k => k.flag === 'critical');
    const abnormals = keyFindings.filter(k => k.flag === 'elevated' || k.flag === 'low');
    if (criticals.length > 0) {
      labSummary = `Critical findings: ${criticals.map(c => `${c.parameter} ${c.value} (${c.interpretation})`).join('; ')}.`;
      if (abnormals.length > 0) labSummary += ` Additionally, ${abnormals.map(a => `${a.parameter} ${a.value}`).join(', ')}.`;
    } else if (abnormals.length > 0) {
      labSummary = `Abnormal findings: ${abnormals.map(a => `${a.parameter} ${a.value} — ${a.interpretation}`).join('; ')}.`;
    } else {
      labSummary = 'All laboratory parameters are within normal limits.';
    }
  }

  // ── Imaging Interpretation ───────────────────────────────────────────────
  const imgFindings: { modality: string; finding: string; significance: string }[] = [];

  // AXR
  let axrSummary = 'No AXR findings have been entered.';
  if (imaging.axrCoffeeBeanSign || imaging.axrBentInnerTubeSign || imaging.axrFreeAir || imaging.axrColonicDilationCm > 0 || imaging.axrAirFluidLevels) {
    const axrParts: string[] = [];
    if (imaging.axrCoffeeBeanSign) {
      axrParts.push('Coffee bean sign is present — diagnostic of sigmoid volvulus');
      imgFindings.push({ modality: 'AXR', finding: 'Coffee bean sign', significance: 'Diagnostic of sigmoid volvulus' });
    }
    if (imaging.axrBentInnerTubeSign) {
      axrParts.push('Bent inner tube sign — suggestive of caecal volvulus');
      imgFindings.push({ modality: 'AXR', finding: 'Bent inner tube sign', significance: 'Suggestive of caecal volvulus' });
    }
    if (imaging.axrFreeAir) {
      axrParts.push('Free air is present — indicates perforation (surgical emergency)');
      imgFindings.push({ modality: 'AXR', finding: 'Free air under diaphragm', significance: 'Surgical emergency — perforation' });
    }
    if (imaging.axrColonicDilationCm > 0) {
      axrParts.push(`Maximum colonic diameter measured at ${imaging.axrColonicDilationCm} cm`);
      if (imaging.axrColonicDilationCm >= 9) axrParts.push('(>9 cm — high risk of perforation)');
    }
    if (imaging.axrAirFluidLevels) {
      axrParts.push('Air-fluid levels are present');
    }
    const haustraNote = imaging.axrHaustraPattern === 'haustra' ? 'Haustral folds are preserved, consistent with large bowel distension.' : 'Haustral pattern is effaced.';
    axrParts.push(haustraNote);
    axrSummary = axrParts.join('. ') + '.';
  }

  // CT
  let ctSummary = 'No CT findings have been entered.';
  if (imaging.ctTransitionPoint || imaging.ctMesentericSwirl || imaging.ctBirdBeakSign || imaging.ctAppleCoreLesion || imaging.ctColonicWallThickening || imaging.ctPneumatosis || imaging.ctPortalVenousGas || imaging.ctFreeFluid || imaging.ctFreeAir || imaging.ctTargetLesion || imaging.ctCecalDilationCm > 0) {
    const ctParts: string[] = [];
    if (imaging.ctTransitionPoint) {
      ctParts.push(`A transition point is identified at the ${imaging.ctTransitionLevel || 'identified'} level, confirming mechanical obstruction`);
      imgFindings.push({ modality: 'CT', finding: `Transition point at ${imaging.ctTransitionLevel || 'identified'} level`, significance: 'Confirms mechanical obstruction' });
    }
    if (imaging.ctMesentericSwirl) {
      ctParts.push('Mesenteric swirl sign is present — diagnostic of sigmoid volvulus');
      imgFindings.push({ modality: 'CT', finding: 'Mesenteric swirl sign', significance: 'Diagnostic of sigmoid volvulus' });
    }
    if (imaging.ctBirdBeakSign) {
      ctParts.push('Bird beak sign — tapering at the transition point, consistent with volvulus');
      imgFindings.push({ modality: 'CT', finding: 'Bird beak sign', significance: 'Consistent with volvulus' });
    }
    if (imaging.ctAppleCoreLesion) {
      ctParts.push('Apple core lesion identified — suspicious for obstructing colorectal carcinoma');
      imgFindings.push({ modality: 'CT', finding: 'Apple core lesion', significance: 'Suspicious for colorectal carcinoma' });
    }
    if (imaging.ctColonicWallThickening) {
      ctParts.push('Colonic wall thickening noted — may represent inflammatory or malignant process');
      imgFindings.push({ modality: 'CT', finding: 'Colonic wall thickening', significance: 'May represent inflammation or malignancy' });
    }
    if (imaging.ctPneumatosis) {
      ctParts.push('PNEUMATOSIS INTESTINALIS — gas within the bowel wall, indicating transmural ischaemia/necrosis');
      imgFindings.push({ modality: 'CT', finding: 'Pneumatosis intestinalis', significance: 'Transmural ischaemia/necrosis — emergency resection indicated' });
    }
    if (imaging.ctPortalVenousGas) {
      ctParts.push('PORTAL VENOUS GAS — ominous sign of extensive bowel ischaemia with high mortality');
      imgFindings.push({ modality: 'CT', finding: 'Portal venous gas', significance: 'Extensive bowel ischaemia — grave prognosis' });
    }
    if (imaging.ctFreeAir) {
      ctParts.push('Free air in the peritoneal cavity — indicates hollow viscus perforation');
      imgFindings.push({ modality: 'CT', finding: 'Free air (pneumoperitoneum)', significance: 'Hollow viscus perforation' });
    }
    if (imaging.ctFreeFluid) {
      ctParts.push('Free fluid is present in the peritoneal cavity');
    }
    if (imaging.ctTargetLesion) {
      ctParts.push('Target lesion identified — suggests intussusception as the cause');
      imgFindings.push({ modality: 'CT', finding: 'Target lesion', significance: 'Suggests intussusception' });
    }
    if (imaging.ctCecalDilationCm > 0) {
      ctParts.push(`Caecal diameter measured at ${imaging.ctCecalDilationCm} cm`);
      if (imaging.ctCecalDilationCm >= 10) ctParts.push('(≥10 cm — high risk of caecal perforation)');
    }
    ctSummary = ctParts.join('. ') + '.';
  }

  return {
    suggestions,
    labInterpretation: { keyFindings, summary: labSummary },
    imagingInterpretation: {
      axrSummary,
      ctSummary,
      keyFindings: imgFindings,
    },
  };
}
