/**
 * LBO PDF Generator — jspdf-based proper PDF documents
 *
 * Produces professional, downloadable PDFs with:
 *   - Full surgical case presentation
 *   - Clerking document
 *   - Operative note
 *   - Discharge summary
 *
 * All documents are generated as Blob URLs for download or print.
 */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { RegistrationData, HistoryData, ExamData, InvestigationsData, ImagingData, PostOpMonitoringData } from '../lbo-records';
import type { LboPatientData } from '../lbo-reasoning-engine';
import type { LboApiOutput } from '../api/lbo-api';

// ── Constants ──────────────────────────────────────────────────────────────

const COLORS = {
  primary: [6, 182, 212] as [number, number, number],
  dark: [7, 16, 41] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  accent: [0, 214, 143] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

const FONT_SIZE = {
  title: 16,
  heading: 12,
  subheading: 10,
  body: 9,
  small: 8,
};

// ── Helpers ────────────────────────────────────────────────────────────────

function line(doc: jsPDF, y: number): number {
  doc.setDrawColor(...COLORS.border);
  doc.line(15, y, 195, y);
  return y + 3;
}

function textBlock(doc: jsPDF, text: string, x: number, y: number, opts: { fontSize?: number; color?: [number, number, number]; bold?: boolean; maxWidth?: number; align?: 'left' | 'center' | 'right' }): number {
  const fs = opts.fontSize || FONT_SIZE.body;
  doc.setFontSize(fs);
  if (opts.bold) doc.setFont('helvetica', 'bold');
  else doc.setFont('helvetica', 'normal');
  if (opts.color) doc.setTextColor(...opts.color);
  else doc.setTextColor(...COLORS.text);
  const maxW = opts.maxWidth || 175;
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * (fs * 0.35 + 2);
}

function checkPage(doc: jsPDF, y: number, margin = 20): number {
  if (y > 270) {
    doc.addPage();
    return margin;
  }
  return y;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Case Presentation PDF ─────────────────────────────────────────────────

export function generateCasePresentationPdf(
  reg: RegistrationData,
  hist: HistoryData,
  exam: ExamData,
  inv: InvestigationsData,
  img: ImagingData,
  eng: LboApiOutput,
  postOp?: PostOpMonitoringData,
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 20;
  const r = eng.reasoning;
  const g = reg.sex === 'female' ? { sub: 'She', obj: 'her', pos: 'her' } : { sub: 'He', obj: 'him', pos: 'his' };
  const dateToday = fmtDate(new Date());

  // ── Cover / Title ──────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, 210, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.title);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPREHENSIVE SURGICAL CASE PRESENTATION', 105, 20, { align: 'center' });
  doc.setFontSize(FONT_SIZE.subheading);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 182, 212);
  doc.text('Large Bowel Obstruction (LBO) — AMEXAN Clinical Reasoning System', 105, 30, { align: 'center' });
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(FONT_SIZE.small);
  doc.text(`Report generated: ${dateToday}  |  Case ID: LBO-${Date.now().toString(36).toUpperCase()}`, 105, 40, { align: 'center' });
  y = 58;

  // ── Section: Biodata ───────────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('BIODATA', 20, y + 1);
  y += 10;

  const biodata = [
    ['Name', reg.patientName || 'Not specified'],
    ['Age', `${reg.age} years`],
    ['Sex', reg.sex === 'male' ? 'Male' : reg.sex === 'female' ? 'Female' : 'Other'],
    ['MRN', reg.mrn || 'Not specified'],
    ['Ward / Bed', `${reg.ward || 'Surgical Ward'} / ${reg.bed || 'N/A'}`],
    ['Admission Date', reg.encounterDate || dateToday],
    ['Referring Hospital', reg.referringFacility || 'Not specified'],
    ['Consultant', reg.consultant || 'Not specified'],
    ['Surgeon', reg.surgeon || 'Not specified'],
    ['Blood Group', reg.bloodGroup || 'Not tested'],
  ];
  (doc as any).autoTable({
    startY: y,
    head: [],
    body: biodata,
    theme: 'plain',
    styles: { fontSize: FONT_SIZE.body, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] }, 1: { cellWidth: 130 } },
    margin: { left: 20 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Chief Complaints ──────────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('CHIEF COMPLAINTS', 20, y + 1);
  y += 10;

  const complaints: string[] = [];
  if (hist.presentingComplaint) complaints.push(hist.presentingComplaint);
  if (hist.hpiLastBowelDays > 0) complaints.push(`Failure to pass stool for ${hist.hpiLastBowelDays} days`);
  if (hist.hpiFlatusStatus === 'not_passing') complaints.push('Failure to pass flatus');
  if (hist.hpiPainCharacter) complaints.push(`${hist.hpiPainCharacter === 'colicky' ? 'Colicky' : 'Constant'} abdominal pain`);
  if (hist.hpiAssociatedVomiting) complaints.push('Vomiting');
  if (hist.hpiWeightLoss) complaints.push('Unintentional weight loss');
  if (hist.hpiBleeding) complaints.push('Rectal bleeding');
  if (complaints.length === 0) complaints.push('Abdominal distension and constipation');

  complaints.forEach((c, i) => {
    y = textBlock(doc, `${i + 1}. ${c}`, 20, y, { fontSize: FONT_SIZE.body });
    y += 1;
  });
  y += 4;

  // ── History of Presenting Illness ──────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('HISTORY OF PRESENTING ILLNESS', 20, y + 1);
  y += 10;

  const hpiLines = [
    `${reg.patientName || 'The patient'} is a ${reg.age}-year-old ${reg.sex === 'female' ? 'female' : 'male'} who presented with a ${hist.complaintDuration || 'several-day'} history of ${hist.presentingComplaint || 'abdominal distension and constipation'}.`,
  ];
  if (hist.hpiOnset) {
    hpiLines.push(`The onset was ${hist.hpiOnset === 'sudden' ? 'sudden' : hist.hpiOnset === 'gradual' ? 'gradual' : 'acute'}, and the symptoms have been ${hist.hpiProgression === 'worsening' ? 'progressively worsening' : hist.hpiProgression || 'evolving'}.`);
  }
  if (hist.hpiPainCharacter) {
    const pc = hist.hpiPainCharacter === 'colicky' ? 'colicky (cramping) — typical of mechanical obstruction' : hist.hpiPainCharacter === 'constant' ? 'constant — raising concern for ischaemia' : hist.hpiPainCharacter === 'colicky_then_constant' ? 'initially colicky, now constant — ominous progression' : hist.hpiPainCharacter;
    hpiLines.push(`The pain is ${pc}${hist.hpiPainLocation ? `, localised to the ${hist.hpiPainLocation}` : ''}${hist.hpiPainRadiation ? `, radiating to ${hist.hpiPainRadiation}` : ''}.`);
  }
  if (hist.hpiAssociatedVomiting) {
    hpiLines.push(`There has been vomiting (${hist.hpiVomitingFrequency || 'multiple episodes'}), with vomitus described as ${hist.hpiVomitContent || 'gastric contents'}.`);
  }
  if (hist.hpiFlatusStatus === 'not_passing' && hist.hpiBowelStatus === 'absolute_constipation') {
    hpiLines.push(`There is absolute constipation — no passage of stool or flatus for ${Math.max(hist.hpiLastBowelDays, 1)} day(s).`);
  } else {
    hpiLines.push(`Bowel habit: ${hist.hpiBowelStatus === 'open' ? 'bowels are open' : hist.hpiBowelStatus === 'constipated' ? 'constipated' : 'absolute constipation'}. Flatus status: ${hist.hpiFlatusStatus === 'passing' ? 'passing' : 'not passing'}.`);
  }

  hpiLines.forEach(line => {
    y = checkPage(doc, y, 15);
    y = textBlock(doc, line, 20, y, { fontSize: FONT_SIZE.body, maxWidth: 170 });
    y += 2;
  });
  y += 4;

  // ── Past Medical & Surgical History ─────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('PAST MEDICAL & SURGICAL HISTORY', 20, y + 1);
  y += 10;

  const pmhLines: string[] = [];
  if (hist.pmh && hist.pmh.trim()) pmhLines.push(`Medical: ${hist.pmh}.`);
  if (hist.surgicalHistory && hist.surgicalHistory.trim()) pmhLines.push(`Surgical: ${hist.surgicalHistory}.`);
  if (pmhLines.length === 0) pmhLines.push('No significant past medical or surgical history.');
  pmhLines.forEach(l => {
    y = checkPage(doc, y, 15);
    y = textBlock(doc, l, 20, y, { fontSize: FONT_SIZE.body });
    y += 2;
  });

  // ── Drug History & Allergies ────────────────────────────────────────────
  y = checkPage(doc, y);
  y = textBlock(doc, `Medications: ${hist.drugHistory || 'None'}.`, 20, y, { fontSize: FONT_SIZE.body, bold: true });
  y += 2;
  y = textBlock(doc, `Allergies: ${hist.allergies_text || 'None known'}.`, 20, y, { fontSize: FONT_SIZE.body, bold: true });
  y += 6;

  // ── Family & Social History ─────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('FAMILY & SOCIAL HISTORY', 20, y + 1);
  y += 10;
  y = textBlock(doc, `Family: ${hist.familyHistory || 'Non-contributory'}.`, 20, y, { fontSize: FONT_SIZE.body });
  y += 3;
  y = textBlock(doc, `Social: ${hist.socialHistory || 'Not specified'}.`, 20, y, { fontSize: FONT_SIZE.body });
  y += 6;

  // ── Examination Findings ────────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAMINATION FINDINGS', 20, y + 1);
  y += 10;

  const v = exam.vitals;
  const examLines: string[] = [];
  examLines.push(`General: ${exam.generalAppearance || 'Acutely unwell'}. Hydration: ${exam.hydrationStatus || 'Assessed'}.`);
  examLines.push(`Vitals: BP ${v.systolicBP}/${v.diastolicBP}, HR ${v.heartRate}, RR ${v.respiratoryRate}, Temp ${v.temperature}°C, SpO₂ ${v.spO2}%`);
  examLines.push(`Abdomen: ${exam.distensionSeverity === 'severe' ? 'Severely' : exam.distensionSeverity === 'moderate' ? 'Moderately' : 'Mildly'} distended. Tenderness: ${exam.abdominalTenderness}. Peritonism: ${exam.peritonism ? 'Present' : 'Absent'}. Bowel sounds: ${exam.bowelSounds}.`);
  if (exam.drePerformed) {
    examLines.push(`DRE: Sphincter tone ${exam.dreSphincterTone || 'normal'}. Mass: ${exam.dreMass ? 'Palpable' : 'None'}. Blood: ${exam.dreBlood ? 'Present' : 'Absent'}.`);
  }
  examLines.forEach(l => {
    y = checkPage(doc, y, 15);
    y = textBlock(doc, l, 20, y, { fontSize: FONT_SIZE.body });
    y += 2;
  });
  y += 4;

  // ── Investigations ──────────────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTIGATIONS', 20, y + 1);
  y += 10;

  if (inv.wbc > 0 || inv.crp > 0 || inv.lactate > 0 || inv.creatinine > 0 || inv.hemoglobin > 0) {
    const labRows: string[][] = [];
    if (inv.wbc > 0) labRows.push(['WBC', `${inv.wbc}`, inv.wbc > 11 ? '↑' : '']);
    if (inv.hemoglobin > 0) labRows.push(['Hb', `${inv.hemoglobin}`, inv.hemoglobin < 10 ? '↓' : '']);
    if (inv.crp > 0) labRows.push(['CRP', `${inv.crp}`, inv.crp > 10 ? '↑' : '']);
    if (inv.lactate > 0) labRows.push(['Lactate', `${inv.lactate}`, inv.lactate > 2 ? '↑' : '']);
    if (inv.creatinine > 0) labRows.push(['Creatinine', `${inv.creatinine}`, inv.creatinine > 110 ? '↑' : '']);
    if (inv.sodium > 0) labRows.push(['Na⁺', `${inv.sodium}`, '']);
    if (inv.potassium > 0) labRows.push(['K⁺', `${inv.potassium}`, '']);
    if (inv.ph > 0) labRows.push(['pH', `${inv.ph}`, inv.ph < 7.35 ? '↓' : '']);
    if (inv.baseExcess !== 0) labRows.push(['Base Excess', `${inv.baseExcess}`, inv.baseExcess < -2 ? '↓' : '']);

    (doc as any).autoTable({
      startY: y,
      head: [['Parameter', 'Value', 'Flag']],
      body: labRows,
      theme: 'grid',
      styles: { fontSize: FONT_SIZE.body, cellPadding: 2 },
      headStyles: { fillColor: COLORS.dark as any, textColor: 255, fontStyle: 'bold' },
      margin: { left: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  } else {
    y = textBlock(doc, 'No laboratory results recorded.', 20, y, { fontSize: FONT_SIZE.body, color: COLORS.muted });
    y += 6;
  }

  // ── Imaging ─────────────────────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('IMAGING FINDINGS', 20, y + 1);
  y += 10;

  const axrFindings: string[] = [];
  if (img.axrCoffeeBeanSign) axrFindings.push('Coffee bean sign (sigmoid volvulus)');
  if (img.axrBentInnerTubeSign) axrFindings.push('Bent inner tube sign (caecal volvulus)');
  if (img.axrFreeAir) axrFindings.push('Free air (perforation)');
  if (img.axrColonicDilationCm > 0) axrFindings.push(`Colonic dilation ${img.axrColonicDilationCm} cm`);
  if (img.axrAirFluidLevels) axrFindings.push('Air-fluid levels present');
  y = textBlock(doc, `AXR: ${axrFindings.length > 0 ? axrFindings.join('; ') : 'No significant findings recorded.'}`, 20, y, { fontSize: FONT_SIZE.body });
  y += 4;

  const ctFindings: string[] = [];
  if (img.ctTransitionPoint) ctFindings.push(`Transition point at ${img.ctTransitionLevel || 'identified level'}`);
  if (img.ctMesentericSwirl) ctFindings.push('Mesenteric swirl (volvulus)');
  if (img.ctBirdBeakSign) ctFindings.push('Bird beak sign (volvulus)');
  if (img.ctAppleCoreLesion) ctFindings.push('Apple core lesion (carcinoma)');
  if (img.ctPneumatosis) ctFindings.push('Pneumatosis intestinalis (ischaemia)');
  if (img.ctPortalVenousGas) ctFindings.push('Portal venous gas (extensive ischaemia)');
  if (img.ctFreeAir) ctFindings.push('Free air (perforation)');
  if (img.ctFreeFluid) ctFindings.push('Free fluid');
  y = textBlock(doc, `CT: ${ctFindings.length > 0 ? ctFindings.join('; ') : 'No significant findings recorded.'}`, 20, y, { fontSize: FONT_SIZE.body });
  y += 6;

  // ── Diagnosis & Reasoning ───────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNOSIS & CLINICAL REASONING', 20, y + 1);
  y += 10;

  y = textBlock(doc, `Diagnosis: ${r.diagnosis}`, 20, y, { fontSize: FONT_SIZE.body, bold: true });
  y += 3;
  y = textBlock(doc, `Confidence: ${(r.probability * 100).toFixed(0)}% (${r.confidence})`, 20, y, { fontSize: FONT_SIZE.body });
  y += 3;

  const ddxEntries = r.detailedDdx?.length ? r.detailedDdx : (r.historyReasoning?.ddxClues ?? []);
  if (ddxEntries.length > 0) {
    y = textBlock(doc, 'Differential Diagnoses:', 20, y, { fontSize: FONT_SIZE.body, bold: true });
    y += 3;
    ddxEntries.forEach((d: any) => {
      y = checkPage(doc, y, 15);
      y = textBlock(doc, `  • ${d.diagnosis}: ${((d.probability ?? 0) * 100).toFixed(0)}%`, 20, y, { fontSize: FONT_SIZE.body });
      y += 1;
    });
    y += 3;
  }

  // ── Management Plan ─────────────────────────────────────────────────────
  y = checkPage(doc, y);
  doc.setFillColor(...COLORS.primary);
  doc.rect(15, y - 4, 180, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(FONT_SIZE.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('MANAGEMENT PLAN', 20, y + 1);
  y += 10;

  if (r.managementPlan) {
    y = textBlock(doc, `Urgency: ${r.managementPlan.urgency}`, 20, y, { fontSize: FONT_SIZE.body });
    y += 3;
    const resusPhase = r.managementPlan.phases.find(p => p.phase === 'resuscitation');
    const definitivePhase = r.managementPlan.phases.find(p => p.phase === 'definitive');
    y = textBlock(doc, `Resuscitation: ${resusPhase?.actions?.join('; ') || 'Standard LBO resuscitation protocol'}`, 20, y, { fontSize: FONT_SIZE.body });
    y += 3;
    y = textBlock(doc, `Definitive: ${definitivePhase?.actions?.join('; ') || 'See operative plan'}`, 20, y, { fontSize: FONT_SIZE.body });
    y += 6;
  }

  if (eng.operativeDecision?.recommendedProcedure) {
    y = textBlock(doc, `Recommended Procedure: ${eng.operativeDecision.recommendedProcedure.procedure}`, 20, y, { fontSize: FONT_SIZE.body, bold: true });
    y += 3;
    y = textBlock(doc, `Approach: ${eng.operativeDecision.recommendedProcedure.approach}`, 20, y, { fontSize: FONT_SIZE.body });
    y += 3;
    y = textBlock(doc, `Stoma formation: ${eng.operativeDecision.recommendedProcedure.stomaRequired ? 'Yes' : 'No'}`, 20, y, { fontSize: FONT_SIZE.body });
    y += 3;
    y += 3;
  }

  // ── Red Flags ───────────────────────────────────────────────────────────
  if (r.redFlags?.flags && r.redFlags.flags.length > 0) {
    y = checkPage(doc, y);
    doc.setFillColor(...COLORS.danger);
    doc.rect(15, y - 4, 180, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(FONT_SIZE.heading);
    doc.setFont('helvetica', 'bold');
    doc.text('RED FLAGS', 20, y + 1);
    y += 10;
    r.redFlags.flags.forEach((rf: any) => {
      y = checkPage(doc, y, 15);
      const icon = rf.severity === 'critical' ? '🚨' : '⚠️';
      y = textBlock(doc, `${icon} ${rf.name}: ${rf.finding} (${rf.severity})`, 20, y, {
        fontSize: FONT_SIZE.body,
        color: rf.severity === 'critical' ? COLORS.danger : COLORS.warning,
      });
      y += 2;
    });
    y += 4;
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  y = Math.max(y, 270);
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(FONT_SIZE.small);
  doc.setFont('helvetica', 'normal');
  doc.text(`AMEXAN Clinical Reasoning System — LBO Module  |  ${dateToday}  |  Case LBO-${Date.now().toString(36).toUpperCase()}`, 105, 293, { align: 'center' });

  return doc;
}

// ── Download helper ────────────────────────────────────────────────────────

export function downloadPdf(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

export function getPdfBlobUrl(doc: jsPDF): URL | string {
  return doc.output('bloburl');
}
