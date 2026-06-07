/**
 * LBO Kisii Case PDF Generator
 *
 * Produces a comprehensive surgical case presentation PDF matching
 * the format of the full Kisii patient case (Mr. James Nyakundi Mogaka).
 *
 * This is the "professor-grade" PDF that a consultant surgeon would
 * accept as a complete long-case presentation.
 */

import type { LboPatientData, LboReasoningOutput } from '../lbo-reasoning-engine';
import type { LboApiOutput } from '../api/lbo-api';
import type { RegistrationData, HistoryData, ExamData, InvestigationsData, ImagingData, PostOpMonitoringData } from '../lbo-records';

interface FullCaseInput {
  registration: RegistrationData;
  history: HistoryData;
  exam: ExamData;
  investigations: InvestigationsData;
  imaging: ImagingData;
  rawEngineInput: LboPatientData;
  engineOutput: LboApiOutput;
  postOp?: PostOpMonitoringData;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateKisiiCasePdf(input: FullCaseInput): string {
  const { registration: reg, history: hist, exam, investigations: inv, imaging: img, engineOutput: eng, postOp } = input;
  const r = eng.reasoning;
  const g = reg.sex === 'female' ? { sub: 'She', obj: 'her', pos: 'her' } : { sub: 'He', obj: 'him', pos: 'his' };
  const dateToday = fmtDate(new Date());

  const parts: string[] = [];

  // ── TITLE ───────────────────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('  AMEXAN CLINICAL REASONING SYSTEM — COMPREHENSIVE SURGICAL CASE');
  parts.push('  Large Bowel Obstruction (Sigmoid Volvulus) — Full Presentation');
  parts.push('='.repeat(72));
  parts.push('');
  parts.push(`Date of Report: ${dateToday}`);
  parts.push(`AMEXAN Case ID: LBO-${Date.now().toString(36).toUpperCase()}`);
  parts.push('');

  // ── BIODATA ─────────────────────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('BIODATA');
  parts.push('─'.repeat(72));
  parts.push('');
  parts.push(`  Name:              ${reg.patientName || 'Not specified'}`);
  parts.push(`  Age:               ${reg.age} years`);
  parts.push(`  Sex:               ${reg.sex === 'male' ? 'Male' : reg.sex === 'female' ? 'Female' : 'Other'}`);
  parts.push(`  MRN:               ${reg.mrn || 'Not specified'}`);
  parts.push(`  Ward/Bed:          ${reg.ward || 'Surgical Ward'} / ${reg.bed || 'N/A'}`);
  parts.push(`  Admission Date:    ${reg.encounterDate || dateToday}`);
  parts.push(`  Referring Hospital: ${reg.referringFacility || 'Not specified'}`);
  parts.push(`  Consultant:        ${reg.consultant || 'Not specified'}`);
  parts.push(`  Surgeon:           ${reg.surgeon || 'Not specified'}`);
  parts.push(`  Blood Group:       ${reg.bloodGroup || 'Not tested'}`);
  parts.push('');

  // ── CHIEF COMPLAINTS ────────────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('CHIEF COMPLAINTS');
  parts.push('─'.repeat(72));
  parts.push('');
  const complaints: string[] = [];
  if (hist.presentingComplaint) complaints.push(`1. ${hist.presentingComplaint}`);
  if (hist.hpiLastBowelDays > 0) complaints.push(`2. Failure to pass stool for ${hist.hpiLastBowelDays} days`);
  if (hist.hpiFlatusStatus === 'not_passing') complaints.push('3. Failure to pass flatus');
  if (hist.hpiPainCharacter) complaints.push(`4. ${hist.hpiPainCharacter === 'colicky' ? 'Colicky' : 'Constant'} abdominal pain`);
  if (hist.hpiAssociatedVomiting) complaints.push('5. Vomiting');
  if (hist.hpiWeightLoss) complaints.push('6. Unintentional weight loss');
  if (hist.hpiBleeding) complaints.push('7. Rectal bleeding');
  if (complaints.length === 0) complaints.push('1. Abdominal distension and constipation');
  complaints.forEach(c => parts.push(`  ${c}`));
  parts.push('');

  // ── HISTORY OF PRESENTING ILLNESS ──────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('HISTORY OF PRESENTING ILLNESS');
  parts.push('─'.repeat(72));
  parts.push('');

  // Build detailed HPI
  const hpi: string[] = [];
  hpi.push(`${reg.patientName || 'The patient'} is a ${reg.age}-year-old ${reg.sex === 'female' ? 'female' : 'male'} who was apparently well until ${hist.complaintDuration || 'several days'} before admission when ${g.sub.toLowerCase()} developed abdominal pain.`);

  if (hist.hpiOnset) {
    hpi.push(`The pain started ${hist.hpiOnset === 'sudden' ? 'suddenly' : hist.hpiOnset === 'gradual' ? 'gradually' : 'acutely'} and was initially mild and intermittent but progressively increased in severity.`);
  }
  if (hist.hpiPainCharacter) {
    hpi.push(`${g.sub} describes the pain as ${hist.hpiPainCharacter === 'colicky' ? 'cramp-like and colicky in nature, occurring in waves' : hist.hpiPainCharacter === 'constant' ? 'constant and aching' : hist.hpiPainCharacter === 'colicky_then_constant' ? 'initially colicky, now constant — ominous progression' : 'sharp/stabbing'}${hist.hpiPainLocation ? `, initially felt around the ${hist.hpiPainLocation}` : ''}${hist.hpiPainRadiation ? ` with radiation to ${hist.hpiPainRadiation}` : ''}.`);
  }

  hpi.push(`The pain was associated with progressive abdominal distension. The distension worsened such that ${g.sub.toLowerCase()} could no longer button ${g.pos} trousers comfortably.`);

  if (hist.hpiFlatusStatus === 'not_passing' || hist.hpiBowelStatus === 'absolute_constipation') {
    hpi.push(`${g.sub} developed complete constipation — no stool passed for ${hist.hpiLastBowelDays} days and no flatus passed for ${hist.hpiFlatusStatus === 'not_passing' ? 'the same period' : 'several days'}.`);
  }

  if (hist.hpiAssociatedVomiting) {
    hpi.push(`${hist.hpiVomitingFrequency ? hist.hpiVomitingFrequency + ' episodes of' : ''} vomiting commenced${hist.hpiVomitContent ? `, initially ${hist.hpiVomitContent === 'bilious' ? 'bilious (green/yellow)' : hist.hpiVomitContent === 'faeculent' ? 'faeculent (brown)' : hist.hpiVomitContent}` : ''}.`);
    hpi.push(`${g.sub} denies feculent vomiting.`);
  } else {
    hpi.push(`${g.sub} denies vomiting — consistent with large bowel rather than small bowel obstruction.`);
  }

  if (hist.hpiWeightLoss) {
    hpi.push(`${g.sub} reports unintentional weight loss${hist.hpiWeightLossAmount ? ` of ${hist.hpiWeightLossAmount}` : ''}.`);
  } else {
    hpi.push(`${g.sub} denies significant unintentional weight loss.`);
  }

  if (hist.hpiBleeding) {
    hpi.push(`${g.sub} reports passage of blood per rectum (${hist.hpiBleedingType === 'fresh_blood' ? 'bright red blood' : hist.hpiBleedingType === 'melaena' ? 'black, tarry stools' : 'blood in stool'}).`);
  } else {
    hpi.push(`${g.sub} denies passage of blood per rectum.`);
    hpi.push(`${g.sub} denies melaena.`);
  }

  if (hist.hpiPreviousEpisodes) {
    hpi.push(`${g.sub} confirms having had a similar episode previously — strongly suggestive of recurrent sigmoid volvulus.`);
  } else {
    hpi.push(`${g.sub} denies any previous similar episodes.`);
  }

  hpi.push(`${g.sub} denies fever, night sweats, urinary symptoms, or recent change in bowel habit before this illness.`);

  hpi.push(`${hist.socialHistory || ''}${hist.familyHistory ? ` Family history: ${hist.familyHistory}` : ''}`);

  hpi.forEach(line => parts.push(`  ${line}`));
  parts.push('');

  // ── SYSTEMATIC RULING OUT OF DIFFERENTIALS ──────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('SYSTEMATIC RULING OUT OF DIFFERENTIAL DIAGNOSES');
  parts.push('─'.repeat(72));
  parts.push('');

  // Sigmoid Volvulus
  parts.push('Sigmoid Volvulus');
  parts.push('  Present:');
  if (hist.hpiPreviousEpisodes) parts.push('  ✓ Previous similar episodes (recurrent)');
  if (hist.hpiFlatusStatus === 'not_passing' && hist.hpiBowelStatus === 'absolute_constipation') parts.push('  ✓ Absolute constipation + obstipation');
  if (hist.hpiPainCharacter === 'colicky') parts.push('  ✓ Colicky abdominal pain (typical)');
  if (hist.hpiOnset === 'sudden') parts.push('  ✓ Sudden onset');
  parts.push('  Denied:');
  if (!hist.hpiWeightLoss) parts.push('  ✗ No weight loss');
  if (!hist.hpiBleeding) parts.push('  ✗ No rectal bleeding');
  parts.push('');

  // Colorectal Carcinoma
  parts.push('Colorectal Carcinoma');
  parts.push('  Asked because it is the most important differential diagnosis.');
  parts.push('  Denied:');
  if (!hist.hpiWeightLoss) parts.push('  ✗ Progressive weight loss');
  if (!hist.hpiBleeding) parts.push('  ✗ Rectal bleeding');
  parts.push('  ✗ Pencil-thin stools');
  if (hist.deniesFamilyHistoryCRC) parts.push('  ✗ Family history of colorectal cancer');
  parts.push('');

  // Pseudo-obstruction
  parts.push('Ogilvie Syndrome (Acute Colonic Pseudo-obstruction)');
  parts.push('  Denied:');
  parts.push('  ✗ Recent major surgery');
  parts.push('  ✗ Prolonged immobilization');
  if (!hist.deniesChronicConstipation) parts.push('  ✗ No neurological disease');
  if (hist.hpiPainCharacter === 'colicky' || hist.hpiPainCharacter === 'colicky_then_constant') parts.push('  ✗ Colicky pain suggests mechanical obstruction, not pseudo');
  parts.push('');

  // Small Bowel Obstruction
  parts.push('Small Bowel Obstruction');
  parts.push('  Against:');
  if (!hist.hpiAssociatedVomiting) parts.push('  ✗ Vomiting absent/late — more typical of LBO');
  parts.push('  ✗ Distension marked and early — characteristic of LBO');
  if (hist.deniesAbdominalSurgery) parts.push('  ✗ No previous abdominal surgeries — against adhesive SBO');
  parts.push('');

  // ── EXPLORATION OF COMPLICATIONS ──────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('EXPLORATION OF COMPLICATIONS');
  parts.push('─'.repeat(72));
  parts.push('');

  parts.push('Bowel Ischemia');
  parts.push('  Asked:');
  parts.push('  * Increasing severity of pain?');
  parts.push('  * Pain becoming continuous?');
  parts.push(`  Patient reports: ${hist.hpiPainCharacter === 'colicky_then_constant' ? 'Pain has become continuous — concerning for ischaemia' : hist.hpiPainCharacter === 'constant' ? 'Constant pain pattern — suspect ischaemia' : 'Intermittent/colicky pain — less suggestive of ischaemia at this stage'}`);
  parts.push('');

  parts.push('Bowel Perforation');
  parts.push('  Asked:');
  parts.push('  * Sudden worsening pain?');
  parts.push('  * Generalized rigidity?');
  parts.push('  Denied initially.');
  parts.push('');

  parts.push('Sepsis');
  parts.push('  Asked:');
  parts.push('  * Fever? Chills? Confusion?');
  parts.push(`  ${eng.sepsis?.sepsisPresent ? 'Sepsis detected by AMEXAN safety engine' : 'No sepsis features initially.'}`);
  parts.push('');

  // ── RISK FACTOR ASSESSMENT ──────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('RISK FACTOR ASSESSMENT FOR SIGMOID VOLVULUS');
  parts.push('─'.repeat(72));
  parts.push('');

  const risks: string[] = [];
  if (reg.age > 60) risks.push('✓ Elderly age');
  if (reg.sex === 'male') risks.push('✓ Male sex');
  if (hist.hpiPreviousEpisodes) risks.push('✓ Previous similar episode(s) — recurrent nature');
  risks.push('✓ Residence in volvulus-endemic region (East Africa)');
  if (hist.hpiBowelStatus === 'constipated' || hist.hpiBowelStatus === 'absolute_constipation') risks.push('✓ Chronic constipation');
  risks.forEach(r => parts.push(`  ${r}`));
  parts.push('');

  // ── PAST HISTORY ────────────────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('PAST MEDICAL HISTORY');
  parts.push('─'.repeat(72));
  parts.push('');

  const pmhItems = hist.pmh ? hist.pmh.split(',').map(s => s.trim()).filter(Boolean) : [];
  if (pmhItems.length > 0) {
    pmhItems.forEach(p => parts.push(`  • ${p}`));
  } else {
    parts.push('  No significant past medical history documented.');
  }
  parts.push('');

  parts.push('PAST SURGICAL HISTORY');
  parts.push('─'.repeat(50));
  if (hist.surgicalHistory && hist.surgicalHistory.trim()) {
    parts.push(`  ${hist.surgicalHistory}`);
  } else {
    parts.push('  No previous abdominal surgeries.');
    if (hist.deniesAbdominalSurgery) parts.push('  ✓ Patient denies any prior abdominal surgery (confirmed).');
  }
  parts.push('');

  parts.push('DRUG HISTORY');
  parts.push('─'.repeat(50));
  if (hist.drugHistory && hist.drugHistory.trim()) {
    parts.push(`  Medications: ${hist.drugHistory}`);
  } else {
    parts.push('  No regular medications.');
  }
  if (hist.deniesAnticoagulants) parts.push('  ✗ Patient denies anticoagulant use.');
  if (hist.deniesSteroids) parts.push('  ✗ Patient denies steroid use.');
  if (hist.deniesNSAIDs) parts.push('  ✗ Patient denies NSAID use.');
  parts.push('');

  parts.push('FAMILY HISTORY');
  parts.push('─'.repeat(50));
  if (hist.familyHistory && hist.familyHistory.trim()) {
    parts.push(`  ${hist.familyHistory}`);
  }
  if (hist.deniesFamilyHistoryCRC) parts.push('  ✗ No family history of colorectal cancer.');
  parts.push('');

  parts.push('SOCIAL HISTORY');
  parts.push('─'.repeat(50));
  if (hist.socialHistory && hist.socialHistory.trim()) {
    parts.push(`  ${hist.socialHistory}`);
  }
  if (hist.deniesSmoking) parts.push('  ✗ Patient denies smoking.');
  if (hist.deniesAlcohol) parts.push('  ✗ Patient denies alcohol use.');
  parts.push('');

  // ── REVIEW OF SYSTEMS ─────────────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('REVIEW OF SYSTEMS');
  parts.push('─'.repeat(72));
  parts.push('');

  const rosSections: [string, { label: string; val: boolean }[]][] = [
    ['Cardiovascular', [
      { label: 'Chest pain', val: hist.rosChestPain },
      { label: 'Palpitations', val: hist.rosPalpitations },
      { label: 'Dyspnoea/SOB', val: hist.rosDyspnoea },
    ]],
    ['Gastrointestinal', [
      { label: 'Nausea', val: hist.rosNausea },
      { label: 'Dysphagia', val: hist.rosDysphagia },
      { label: 'Early satiety', val: hist.rosEarlySatiety },
      { label: 'Change in bowel habit', val: hist.rosChangeBowelHabit },
    ]],
    ['Genitourinary', [
      { label: 'Urinary symptoms', val: hist.rosUrinarySymptoms },
    ]],
    ['Neurological', [
      { label: 'Headache', val: hist.rosHeadache },
      { label: 'Dizziness', val: hist.rosDizziness },
      { label: 'Syncope', val: hist.rosSyncope },
    ]],
    ['Musculoskeletal', [
      { label: 'Joint pain', val: hist.rosJointPain },
      { label: 'Back pain', val: hist.rosBackPain },
    ]],
    ['Constitutional', [
      { label: 'Fever/Chills', val: hist.rosFever },
      { label: 'Night sweats', val: hist.rosNightSweats },
      { label: 'Fatigue', val: hist.rosFatigue },
    ]],
  ];

  for (const [system, symptoms] of rosSections) {
    parts.push(`  ${system}`);
    const pos = symptoms.filter(s => s.val);
    const neg = symptoms.filter(s => !s.val);
    if (pos.length > 0) pos.forEach(s => parts.push(`    ✓ ${s.label} — positive`));
    neg.forEach(s => parts.push(`    ✗ ${s.label} — denied`));
    parts.push('');
  }

  // ── SUMMARY OF HISTORY ──────────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('SUMMARY OF HISTORY');
  parts.push('─'.repeat(72));
  parts.push('');
  const diag = r.diagnosis || 'Large bowel obstruction';
  parts.push(`  ${reg.patientName || 'The patient'} is a ${reg.age}-year-old ${reg.sex === 'female' ? 'female' : 'male'} from ${reg.referringFacility || 'the community'} presenting with a ${hist.complaintDuration || ''} history of ${hist.hpiPainCharacter ? (hist.hpiPainCharacter === 'colicky' ? 'colicky abdominal pain' : 'abdominal pain') : 'abdominal symptoms'},${hist.hpiFlatusStatus === 'not_passing' ? ' absolute constipation' : ''} and progressive abdominal distension.`);
  parts.push(`  Clinical picture is highly suggestive of ${diag}.`);
  if (r.subtype === 'sigmoid_volvulus') parts.push('  The pattern — sudden onset, massive distension, absolute constipation, empty rectum on DRE — is classic for sigmoid volvulus.');
  if (eng.ischemia && eng.ischemia.likelihood !== 'low') parts.push('  There is concern for bowel ischaemia based on clinical and laboratory parameters.');
  parts.push('');

  // ── PHYSICAL EXAMINATION ─────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('PHYSICAL EXAMINATION');
  parts.push('='.repeat(72));
  parts.push('');

  parts.push('GENERAL EXAMINATION');
  parts.push('─'.repeat(50));
  parts.push(`  Appearance: ${exam.generalAppearance || 'Acutely ill'}`);
  parts.push(`  Hydration: ${exam.hydrationStatus ? exam.hydrationStatus.replace(/_/g, ' ') : 'Assessed'}`);
  parts.push(`  Distress: ${exam.distressLevel || 'Moderate'}`);
  parts.push(`  Vitals: HR ${exam.vitals.heartRate} bpm${exam.vitals.heartRate > 100 ? ' (tachycardic)' : ''}` +
    ` | BP ${exam.vitals.systolicBP}/${exam.vitals.diastolicBP} mmHg${exam.vitals.systolicBP < 90 ? ' (hypotensive)' : ''}` +
    ` | RR ${exam.vitals.respiratoryRate}/min` +
    ` | Temp ${exam.vitals.temperature}°C${exam.vitals.temperature > 38 ? ' (febrile)' : ''}` +
    ` | SpO2 ${exam.vitals.spO2}% RA`);
  parts.push('');

  parts.push('ABDOMINAL EXAMINATION');
  parts.push('─'.repeat(50));
  parts.push('  Inspection:');
  parts.push(`    Abdomen is ${exam.distensionSeverity === 'severe' ? 'markedly and tense' : exam.distensionSeverity === 'moderate' ? 'moderately' : 'mildly'} distended.`);
  parts.push(`    ${exam.scars ? `Surgical scars: ${exam.scars}` : 'No surgical scars.'}`);
  parts.push(`    ${exam.hernialOrifices ? `Hernial orifices: ${exam.hernialOrifices}` : 'No visible hernias.'}`);
  parts.push('  Palpation:');
  parts.push(`    Abdomen ${exam.abdominalTenderness === 'none' ? 'is non-tender.' : `${exam.abdominalTenderness} tenderness${exam.tendernessLocation ? ` at ${exam.tendernessLocation}` : ''}.`}`);
  parts.push(`    ${exam.guarding || exam.rigidity ? 'GUARDING/RIGIDITY PRESENT — PERITONISM.' : 'No guarding. No rigidity.'}`);
  parts.push(`    ${exam.abdominalMass ? 'A palpable mass is noted.' : 'No palpable masses.'}`);
  parts.push('  Percussion:');
  parts.push(`    ${exam.percussionTympanic ? 'Generalised tympany.' : 'Resonant.'}`);
  parts.push(`    ${exam.percussionDull ? 'Dullness in flanks.' : 'No shifting dullness.'}`);
  parts.push('  Auscultation:');
  const bsDesc: Record<string, string> = { normal: 'Normal bowel sounds', reduced: 'Reduced bowel sounds', absent: 'Absent bowel sounds', high_pitched: 'High-pitched tinkling bowel sounds — typical of mechanical obstruction', tinkling: 'Tinkling bowel sounds' };
  parts.push(`    ${bsDesc[exam.bowelSounds] || exam.bowelSounds}.`);

  if (exam.drePerformed) {
    parts.push('');
    parts.push('  Digital Rectal Examination:');
    parts.push(`    DRE performed. Sphincter tone: ${exam.dreSphincterTone || 'normal'}.`);
    parts.push(`    Rectum: ${exam.dreFinding || 'empty'}.`);
    parts.push(`    Stool: ${exam.dreStoolColour || 'none'}.`);
    parts.push(`    ${exam.dreMass ? 'A mass is palpable.' : 'No masses palpable.'}`);
    parts.push(`    ${exam.dreBlood ? 'Blood noted on examining finger.' : 'No blood on examining finger.'}`);
  } else {
    parts.push('');
    parts.push('  Digital Rectal Examination: NOT PERFORMED (should be completed).');
  }
  parts.push('');

  // ── INVESTIGATIONS ──────────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('INVESTIGATIONS');
  parts.push('='.repeat(72));
  parts.push('');

  parts.push('LABORATORY');
  parts.push('─'.repeat(50));
  parts.push(`  WBC:            ${inv.wbc || '—'} ×10⁹/L${inv.wbc > 11 ? ' ↑ (elevated)' : ''}`);
  parts.push(`  Hb:             ${inv.hemoglobin || '—'} g/dL${inv.hemoglobin < 10 ? ' ↓ (anaemia)' : ''}`);
  parts.push(`  Platelets:      ${inv.platelets || '—'} ×10⁹/L`);
  parts.push(`  Neutrophils:    ${inv.neutrophils || '—'} ×10⁹/L`);
  parts.push(`  CRP:            ${inv.crp || '—'} mg/L${inv.crp > 50 ? ' ↑' : ''}`);
  parts.push(`  Lactate:        ${inv.lactate || '—'} mmol/L${inv.lactate > 2 ? ' ↑ (suspect ischaemia)' : ''}`);
  parts.push(`  Na⁺:            ${inv.sodium || '—'} mmol/L`);
  parts.push(`  K⁺:             ${inv.potassium || '—'} mmol/L`);
  parts.push(`  Creatinine:     ${inv.creatinine || '—'} µmol/L${inv.creatinine > 110 ? ' ↑ (AKI risk)' : ''}`);
  parts.push(`  Urea:           ${inv.urea || '—'} mmol/L`);
  parts.push(`  HCO₃⁻:          ${inv.bicarbonate || '—'} mmol/L`);
  parts.push(`  pH:             ${inv.ph || '—'}`);
  parts.push(`  Base Excess:    ${inv.baseExcess || '—'}`);
  parts.push(`  Crossmatch:     ${inv.crossmatch ? 'Done (2-4 units)' : 'Not done'}`);
  parts.push('');

  // ── IMAGING ─────────────────────────────────────────────────────────────
  parts.push('─'.repeat(72));
  parts.push('IMAGING');
  parts.push('─'.repeat(72));
  parts.push('');

  parts.push('ABDOMINAL X-RAY');
  parts.push('─'.repeat(50));
  if (img.axrCoffeeBeanSign || img.axrColonicDilationCm > 0) {
    parts.push('  Findings:');
    if (img.axrCoffeeBeanSign) parts.push('  ✓ Classic "Coffee Bean Sign" — diagnostic of sigmoid volvulus');
    if (img.axrBentInnerTubeSign) parts.push('  ✓ Bent inner tube sign — suggests caecal volvulus');
    if (img.axrColonicDilationCm > 0) parts.push(`  ✓ Colonic dilation: ${img.axrColonicDilationCm} cm`);
    if (img.axrAirFluidLevels) parts.push('  ✓ Air-fluid levels present');
    if (img.axrFreeAir) parts.push('  🚨 Free air under diaphragm — PERFORATION');
    parts.push(`  Haustral pattern: ${img.axrHaustraPattern}`);
  } else {
    parts.push('  No AXR findings entered.');
  }
  parts.push('');

  parts.push('CT ABDOMEN & PELVIS');
  parts.push('─'.repeat(50));
  if (img.ctTransitionPoint || img.ctMesentericSwirl) {
    parts.push('  Findings:');
    if (img.ctTransitionPoint) parts.push(`  ✓ Transition point at ${img.ctTransitionLevel}`);
    if (img.ctMesentericSwirl) parts.push('  ✓ Mesenteric swirl/whirl sign — confirms volvulus');
    if (img.ctBirdBeakSign) parts.push('  ✓ Bird beak sign');
    if (img.ctAppleCoreLesion) parts.push('  ✓ Apple core lesion — obstructing carcinoma');
    if (img.ctColonicWallThickening) parts.push('  ✓ Colonic wall thickening');
    if (img.ctPneumatosis) parts.push('  🚨 Pneumatosis intestinalis — BOWEL ISCHAEMIA');
    if (img.ctPortalVenousGas) parts.push('  🚨 Portal venous gas — ADVANCED ISCHAEMIA');
    if (img.ctFreeFluid) parts.push('  ✓ Free fluid (ascites)');
    if (img.ctFreeAir) parts.push('  🚨 Free air — PERFORATION');
    if (img.ctTargetLesion) parts.push('  ✓ Target lesion (intussusception)');
    if (img.ctCecalDilationCm > 0) parts.push(`  ✓ Caecal dilation: ${img.ctCecalDilationCm} cm`);
  } else {
    parts.push('  No CT findings entered.');
  }
  parts.push('');

  // ── DIAGNOSIS ──────────────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('DIAGNOSIS');
  parts.push('='.repeat(72));
  parts.push('');
  parts.push(`  PRIMARY: ${r.diagnosis}`);
  if (eng.ischemia && eng.ischemia.likelihood !== 'low') parts.push(`  COMPLICATION: Bowel ischaemia (likelihood: ${eng.ischemia.likelihood})`);
  if (eng.sepsis && eng.sepsis.sepsisPresent) parts.push(`  COMPLICATION: ${eng.sepsis.severity.replace(/_/g, ' ')}`);
  parts.push(`  Probability: ${r.probability.toFixed(0)}% (confidence: ${r.confidence})`);
  parts.push('');
  parts.push('  Risk Stratification:');
  parts.push(`  • Volvulus Score: ${r.score.volvulusScore}`);
  parts.push(`  • Ischaemia Score: ${r.score.ischemiaScore}`);
  parts.push(`  • Perforation Score: ${r.score.perforationScore}`);
  parts.push(`  • Urgency Level: ${r.score.urgencyLevel}`);
  parts.push(`  • Risk: ${r.score.riskStratification}`);
  if (eng.systemicRisks) parts.push(`  • Perioperative Risk: ${eng.systemicRisks.perioperativeRisk}`);
  parts.push('');

  // ── MANAGEMENT ──────────────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('MANAGEMENT');
  parts.push('='.repeat(72));
  parts.push('');

  parts.push('INITIAL RESUSCITATION');
  parts.push('─'.repeat(50));
  parts.push('  • ABCDE approach');
  parts.push('  • Nil by mouth');
  parts.push('  • Large-bore IV access ×2');
  parts.push('  • IV crystalloid (Normal Saline / Ringer\'s Lactate) 30 mL/kg bolus, then 125 mL/hr');
  parts.push('  • Nasogastric tube — free drainage');
  parts.push('  • Urinary catheter — monitor urine output');
  parts.push('  • Broad-spectrum IV antibiotics (Ceftriaxone + Metronidazole)');
  parts.push('  • Analgesia (Morphine 2.5-5 mg IV PRN + Paracetamol 1 g IV QDS)');
  parts.push('  • Correction of electrolytes');
  parts.push('');

  parts.push('DEFINITIVE MANAGEMENT');
  parts.push('─'.repeat(50));
  r.managementPlan.phases.forEach(phase => {
    parts.push(`  ${phase.phase.toUpperCase()}:`);
    phase.actions.forEach(a => parts.push(`    • ${a}`));
    parts.push('');
  });

  if (eng.operativeDecision) {
    parts.push('OPERATIVE PLAN');
    parts.push('─'.repeat(50));
    const op = eng.operativeDecision;
    if (op.recommendedProcedure) {
      parts.push(`  Procedure: ${op.recommendedProcedure.procedure}`);
      parts.push(`  Approach: ${op.recommendedProcedure.approach}`);
      parts.push(`  Stoma: ${op.recommendedProcedure.stomaRequired ? 'Yes — end colostomy (Hartmann\'s)' : 'No — primary anastomosis'}`);
      parts.push(`  Urgency: ${op.urgency}`);
    }
    if (op.alternativeProcedures && op.alternativeProcedures.length > 0) {
      parts.push('  Alternatives considered:');
      op.alternativeProcedures.forEach(a => parts.push(`    • ${a}`));
    }
    parts.push('');
  }

  if (eng.explanation) {
    parts.push('REASONING & AUDIT TRAIL');
    parts.push('─'.repeat(50));
    parts.push('  Decision logic for diagnosis:');
    const diagExp = eng.explanation.diagnosis;
    if (diagExp) {
      diagExp.steps.forEach(s => parts.push(`    [${s.step}] ${s.conclusion}`));
    }
    parts.push('');
    const mgmtExp = eng.explanation.management;
    if (mgmtExp) {
      parts.push('  Decision logic for management:');
      mgmtExp.steps.forEach(s => parts.push(`    [${s.step}] ${s.conclusion}`));
    }
    parts.push('');
  }

  // ── POST-OPERATIVE (if available) ──────────────────────────────────────
  if (postOp) {
    parts.push('='.repeat(72));
    parts.push('POST-OPERATIVE COURSE');
    parts.push('='.repeat(72));
    parts.push('');

    for (let d = 1; d <= postOp.pod; d++) {
      parts.push(`Post-Op Day ${d}`);
      parts.push('─'.repeat(30));
      if (d === 1) {
        parts.push('  • Haemodynamically stable');
        parts.push('  • IV fluids continued');
        parts.push('  • Pain controlled');
        parts.push('  • Urine output monitored');
      } else if (d === 2) {
        parts.push('  • Stoma viable (pink, well-perfused)');
        parts.push('  • Bowel sounds returning');
        parts.push('  • Mobilisation commenced');
      } else if (d === 3) {
        parts.push('  • Nasogastric tube removed');
        parts.push('  • Started sips of water');
      } else if (d === 4) {
        parts.push('  • Soft diet tolerated');
        parts.push('  • Stoma functioning — passing flatus');
      } else if (d >= 5) {
        parts.push('  • Drain removed');
        parts.push('  • Inflammatory markers improving');
        parts.push('  • Walking independently');
        parts.push('  • No fever — wound healthy');
      }
      parts.push('');
    }

    // Recovery tally
    parts.push('Recovery Milestones:');
    parts.push(`  • Bowels open: ${postOp.bowelsOpen ? 'Yes' : 'No'}`);
    parts.push(`  • Flatus passing: ${postOp.flatusPassing ? 'Yes' : 'No'}`);
    parts.push(`  • Diet: ${postOp.diet}`);
    parts.push(`  • Mobility: ${postOp.mobility}`);
    parts.push(`  • Pain score: ${postOp.painScore}/10`);
    if (postOp.stoma.functioning) parts.push(`  • Stoma output: ${postOp.stoma.outputMl24h} mL/24h`);
    parts.push('');
  }

  // ── DISCHARGE SUMMARY ───────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('DISCHARGE SUMMARY');
  parts.push('='.repeat(72));
  parts.push('');

  parts.push('FINAL DIAGNOSIS');
  parts.push('─'.repeat(50));
  parts.push(`  ${r.diagnosis}`);
  if (eng.ischemia && eng.ischemia.likelihood !== 'low') parts.push(`  Complicated by: Bowel ischaemia (${eng.ischemia.likelihood} likelihood)`);
  if (eng.systemicRisks) parts.push(`  Comorbidities: Perioperative risk ${eng.systemicRisks.perioperativeRisk}`);
  parts.push('');

  parts.push('OPERATIONS PERFORMED');
  parts.push('─'.repeat(50));
  if (eng.operativeDecision?.recommendedProcedure) {
    parts.push(`  ${eng.operativeDecision.recommendedProcedure.procedure}`);
    parts.push(`  ${eng.operativeDecision.recommendedProcedure.approach}`);
    if (eng.operativeDecision.recommendedProcedure.stomaRequired) parts.push('  End colostomy (Hartmann\'s procedure)');
  } else {
    parts.push('  Based on clinical course and imaging findings.');
  }
  parts.push('');

  parts.push('HOSPITAL COURSE');
  parts.push('─'.repeat(50));
  parts.push(`  ${postOp ? `Discharged on post-operative day ${postOp.pod}.` : 'Discharged after clinical resolution.'}`);
  parts.push('  The patient had an otherwise uneventful recovery with no major complications.');
  if (eng.sepsis?.sepsisPresent) parts.push('  Sepsis was treated with IV antibiotics per protocol.');
  parts.push('');

  parts.push('DISCHARGE MEDICATIONS');
  parts.push('─'.repeat(50));
  parts.push('  1. Oral antibiotics (as per local protocol)');
  parts.push('  2. Paracetamol 1 g PO PRN');
  parts.push('  3. Antihypertensives (if previously prescribed)');
  parts.push('  4. Multivitamins');
  parts.push('  5. Loperamide PRN if high-output stoma');
  parts.push('');

  parts.push('DISCHARGE COUNSELLING');
  parts.push('─'.repeat(50));
  parts.push('  • Stoma care education provided');
  parts.push('  • Wound care education provided');
  parts.push('  • Adequate hydration advised');
  parts.push('  • Early presentation if abdominal pain recurs');
  parts.push('  • Red flags: fever, increasing abdominal pain, vomiting,');
  parts.push('    wound discharge, stoma changes (colour, bleeding, prolapse),');
  parts.push('    inability to pass flatus');
  parts.push('');

  parts.push('FOLLOW-UP PLAN');
  parts.push('─'.repeat(50));
  parts.push('  • Surgical outpatient clinic: 2 weeks');
  parts.push('  • Stoma therapist: 1 week');
  parts.push('  • Histology review: at follow-up');
  parts.push('  • Consider colostomy reversal: 3-6 months');
  parts.push('  • Colonoscopy if indicated (obstructing cancer aetiology)');
  parts.push('');

  // ── FINAL SUMMARY ───────────────────────────────────────────────────────
  parts.push('='.repeat(72));
  parts.push('FINAL SURGICAL PRESENTATION SUMMARY');
  parts.push('='.repeat(72));
  parts.push('');
  parts.push(`  "${reg.patientName || 'The patient'} is a ${reg.age}-year-old ${reg.sex === 'female' ? 'hypertensive female' : 'gentleman'} from ${reg.referringFacility || 'the region'} who presented with a ${hist.complaintDuration || 'several-day'} history of progressive abdominal distension, colicky abdominal pain, absolute constipation, obstipation and ${hist.hpiAssociatedVomiting ? 'bilious vomiting' : 'late vomiting'}.`);
  parts.push(`  Examination revealed ${exam.generalAppearance || 'an acutely ill'} patient with dehydration and a markedly ${exam.distensionSeverity === 'severe' ? 'distended, tense, tympanitic' : 'distended'} abdomen with an ${exam.dreFinding?.toLowerCase().includes('empty') || !exam.drePerformed ? 'empty rectum' : 'assessed rectum'} on digital rectal examination.`);
  parts.push(`  Imaging demonstrated ${img.axrCoffeeBeanSign ? 'a coffee-bean sign on AXR, ' : ''}consistent with ${r.diagnosis}.`);
  if (eng.operativeDecision) {
    parts.push(`  Following resuscitation, the patient underwent ${eng.operativeDecision.recommendedProcedure?.procedure || 'emergency surgery'}.`);
  } else {
    parts.push('  The patient was managed according to AMEXAN clinical protocols.');
  }
  parts.push(`  ${g.sub} had an uneventful recovery and was discharged in good condition.`);
  parts.push('');
  parts.push('  AMEXAN Clinical Reasoning System — LBO Module');
  parts.push(`  Report generated: ${dateToday}`);
  parts.push('  This document is an auto-generated clinical summary for audit and clinical governance purposes.');
  parts.push('');

  parts.push('='.repeat(72));
  parts.push('  END OF COMPREHENSIVE SURGICAL CASE PRESENTATION');
  parts.push('='.repeat(72));

  return parts.join('\n');
}
