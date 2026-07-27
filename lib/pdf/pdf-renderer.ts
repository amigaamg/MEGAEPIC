import type { ClinicalDocument, VitalSign, DiagnosisItem, InvestigationRecommendation, MonitoringParameter, EscalationCriteria, ProblemItem, ExaminationFinding, ScoreResult, GuidelineRef } from './document-types';

const PDF_UNIT = 'mm';
const PDF_FORMAT = 'a4';
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

const COLORS = {
  primary: { r: 0, g: 95, b: 115 },
  secondary: { r: 84, g: 110, b: 122 },
  accent: { r: 231, g: 76, b: 60 },
  success: { r: 39, g: 174, b: 96 },
  warning: { r: 243, g: 156, b: 18 },
  dark: { r: 44, g: 62, b: 80 },
  light: { r: 236, g: 240, b: 241 },
  white: { r: 255, g: 255, b: 255 },
  muted: { r: 149, g: 165, b: 166 },
  bordergrey: { r: 200, g: 200, b: 200 },
};

async function getJsPdf() {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');
  return jsPDF;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export async function renderClinicalPdf(doc: ClinicalDocument): Promise<Blob> {
  const jsPDF = await getJsPdf();
  const pdf = new jsPDF({ orientation: 'portrait', unit: PDF_UNIT, format: PDF_FORMAT });

  let y = MARGIN;

  function addPage() {
    pdf.addPage();
    y = MARGIN;
    drawHeader();
  }

  function checkPage(needed: number) {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      addPage();
    }
  }

  function drawHeader() {
    pdf.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    pdf.rect(0, 0, PAGE_WIDTH, 12, 'F');
    pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(doc.metadata.facility || 'AMEXAN Clinical Intelligence', MARGIN, 8);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(doc.metadata.department || '', PAGE_WIDTH - MARGIN, 8, { align: 'right' });
    pdf.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    y = 18;
  }

  function drawSectionTitle(title: string) {
    checkPage(10);
    pdf.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
    pdf.rect(MARGIN, y, CONTENT_WIDTH, 7, 'F');
    pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(title.toUpperCase(), MARGIN + 2, y + 5);
    pdf.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    y += 10;
  }

  function drawField(label: string, value: string | undefined | null, indent = 0) {
    if (!value && value !== '0') return;
    checkPage(6);
    const x = MARGIN + indent;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    pdf.text(label + ':', x, y);
    const labelWidth = pdf.getTextWidth(label + ': ');
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    const lines = pdf.splitTextToSize(value, CONTENT_WIDTH - indent - labelWidth - 2);
    pdf.text(lines, x + labelWidth + 1, y);
    y += 4 + (lines.length - 1) * 3.5;
  }

  function drawMultiline(text: string, indent = 0) {
    if (!text) return;
    const x = MARGIN + indent;
    const lines = pdf.splitTextToSize(text, CONTENT_WIDTH - indent - 2);
    checkPage(lines.length * 3.5 + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    pdf.text(lines, x, y);
    y += lines.length * 3.5 + 2;
  }

  function drawList(items: string[], indent = 0) {
    if (!items || items.length === 0) return;
    for (const item of items) {
      checkPage(5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      const lines = pdf.splitTextToSize('• ' + item, CONTENT_WIDTH - indent - 4);
      pdf.text(lines, MARGIN + indent + 2, y);
      y += lines.length * 3.5 + 1;
    }
  }

  function drawTable(headers: string[], rows: (string | number)[][], widths?: number[]) {
    if (rows.length === 0) return;
    checkPage(rows.length * 6 + 20);
    (pdf as any).autoTable({
      startY: y,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b], textColor: [255, 255, 255], fontSize: 7, font: 'helvetica', fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, font: 'helvetica', textColor: [COLORS.dark.r, COLORS.dark.g, COLORS.dark.b] },
      alternateRowStyles: { fillColor: [COLORS.light.r, COLORS.light.g, COLORS.light.b] },
      columnStyles: widths ? Object.fromEntries(widths.map((w, i) => [i, { cellWidth: w * CONTENT_WIDTH / 100 }])) : {},
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: CONTENT_WIDTH,
    });
    y = (pdf as any).lastAutoTable.finalY + 5;
  }

  drawHeader();

  // Document Title
  pdf.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.rect(0, 12, PAGE_WIDTH, 3, 'F');
  pdf.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(doc.metadata.title, MARGIN, y + 2);
  y += 8;

  // Metadata line
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  pdf.text('Generated: ' + formatDate(doc.metadata.generatedAt) + ' | v' + doc.metadata.version + ' | ' + doc.metadata.generatedBy, MARGIN, y);
  y += 6;

  // ── Patient Info ──
  drawSectionTitle('Patient Information');
  drawField('Name', doc.patient.name);
  drawField('MRN', doc.patient.mrn);
  drawField('Age', doc.patient.age + ' ' + doc.patient.ageUnit);
  drawField('Gender', doc.patient.gender);
  drawField('Pregnancy', doc.patient.pregnancyStatus);
  if (doc.patient.allergies.length) drawField('Allergies', doc.patient.allergies.join(', '));
  if (doc.patient.activeMedications.length) drawField('Active Medications', doc.patient.activeMedications.join(', '));
  if (doc.patient.pastMedicalHistory.length) drawField('Past Medical History', doc.patient.pastMedicalHistory.join(', '));
  y += 3;

  // ── Encounter ──
  drawSectionTitle('Encounter Details');
  drawField('Date', doc.encounter.date + ' ' + doc.encounter.time);
  drawField('Location', doc.encounter.location);
  drawField('Type', doc.encounter.encounterType);
  drawField('Chief Complaint', doc.encounter.chiefComplaint);
  drawField('Duration', doc.encounter.duration);
  drawField('Onset', doc.encounter.onset);
  y += 3;

  // ── Subjective ──
  drawSectionTitle('Subjective');
  drawField('Chief Complaint', doc.subjective.chiefComplaint);
  drawMultiline(doc.subjective.historyOfPresentingIllness);
  if (doc.subjective.symptomReview.length) {
    drawField('Symptom Review', doc.subjective.symptomReview.filter(s => s.present).map(s => s.symptom + (s.duration ? ' (' + s.duration + ')' : '')).join(', '));
  }
  if (doc.subjective.pastMedicalHistory) drawMultiline('PMH: ' + doc.subjective.pastMedicalHistory);
  if (doc.subjective.socialHistory) drawMultiline('Social: ' + doc.subjective.socialHistory);
  if (doc.subjective.travelHistory) drawMultiline('Travel: ' + doc.subjective.travelHistory);
  if (doc.subjective.occupationalHistory) drawMultiline('Occupational: ' + doc.subjective.occupationalHistory);
  y += 3;

  // ── Objective ──
  drawSectionTitle('Objective');
  if (doc.objective.vitalSigns.length) {
    drawTable(
      ['Vital Sign', 'Value', 'Unit', 'Reference'],
      doc.objective.vitalSigns.map((v: VitalSign) => [v.name, v.value, v.unit, v.reference || '']),
      [25, 15, 15, 25],
    );
  }
  if (doc.objective.physicalExamination) drawMultiline(doc.objective.physicalExamination);
  if (doc.objective.examinationFindings.length) {
    drawTable(
      ['System', 'Finding', 'Status', 'Detail'],
      doc.objective.examinationFindings.map((f: ExaminationFinding) => [f.system, f.finding, f.normal ? 'Normal' : 'Abnormal', f.detail || '']),
      [20, 25, 15, 30],
    );
  }
  if (doc.objective.scores.length) {
    drawTable(
      ['Score', 'Value', 'Interpretation'],
      doc.objective.scores.map((s: ScoreResult) => [s.name, s.value.toString(), s.interpretation]),
      [35, 15, 40],
    );
  }
  y += 3;

  // ── Differentials ──
  drawSectionTitle('Differential Diagnosis');
  if (doc.differentials.topDiagnoses.length) {
    drawTable(
      ['Rank', 'Diagnosis', 'ICD-10', 'Probability', 'Score', 'Red Flag'],
      doc.differentials.topDiagnoses.map((d: DiagnosisItem) => [d.rank.toString(), d.diseaseName, d.icd10 || '-', d.probability.toUpperCase(), d.score.toString(), d.isRedFlag ? '⚠ YES' : 'No']),
      [8, 30, 12, 15, 10, 15],
    );
  }
  drawMultiline(doc.differentials.ddxNarrative);
  drawMultiline(doc.differentials.reasoningRationale);
  drawField('Category', doc.differentials.category);
  drawField('Uncertainty Score', (doc.differentials.uncertaintyScore * 100).toFixed(0) + '%');
  y += 3;

  // ── Assessment ──
  drawSectionTitle('Assessment');
  drawMultiline(doc.assessment.summary);
  if (doc.assessment.problemList.length) {
    drawTable(
      ['#', 'Problem', 'Active', 'Chronic'],
      doc.assessment.problemList.map((p: ProblemItem) => [p.number.toString(), p.description, p.active ? 'Yes' : 'No', p.chronic ? 'Yes' : 'No']),
      [5, 55, 10, 10],
    );
  }
  drawMultiline(doc.assessment.clinicalImpression);
  y += 3;

  // ── Plan ──
  drawSectionTitle('Plan');
  if (doc.plan.immediateActions.length) { drawField('Immediate Actions', ''); drawList(doc.plan.immediateActions); checkPage(3); }
  if (doc.plan.treatments.length) { drawField('Treatments', ''); drawList(doc.plan.treatments); checkPage(3); }
  if (doc.plan.monitoring.length) { drawField('Monitoring', ''); drawList(doc.plan.monitoring); checkPage(3); }
  if (doc.plan.followUp.length) { drawField('Follow-Up', ''); drawList(doc.plan.followUp); checkPage(3); }
  if (doc.plan.referrals.length) { drawField('Referrals', ''); drawList(doc.plan.referrals); checkPage(3); }
  if (doc.plan.patientEducation.length) { drawField('Patient Education', ''); drawList(doc.plan.patientEducation); checkPage(3); }
  if (doc.plan.contingencyPlan.length) { drawField('Contingency Plan', ''); drawList(doc.plan.contingencyPlan); checkPage(3); }
  y += 3;

  // ── Investigations ──
  drawSectionTitle('Investigations');
  if (doc.investigations.recommended.length) {
    drawTable(
      ['Investigation', 'Purpose', 'Priority', 'For'],
      doc.investigations.recommended.map((inv: InvestigationRecommendation) => [inv.name, inv.purpose, inv.priority, inv.diseaseIds.map(id => id.replace('disease_', '')).join(', ')]),
      [25, 30, 12, 23],
    );
  }
  drawMultiline(doc.investigations.interpretation);
  y += 3;

  // ── Monitoring ──
  drawSectionTitle('Monitoring');
  drawField('Frequency', doc.monitoring.frequency);
  if (doc.monitoring.parameters.length) {
    drawTable(
      ['Parameter', 'Frequency', 'Target', 'Threshold'],
      doc.monitoring.parameters.map((p: MonitoringParameter) => [p.parameter, p.frequency, p.target, p.threshold || '-']),
      [25, 18, 22, 25],
    );
  }
  if (doc.monitoring.escalationCriteria.length) {
    drawTable(
      ['Condition', 'Action'],
      doc.monitoring.escalationCriteria.map((e: EscalationCriteria) => [e.condition, e.action]),
      [40, 50],
    );
  }
  y += 3;

  // ── References ──
  drawSectionTitle('References & Evidence');
  if (doc.references.guidelines.length) {
    drawTable(
      ['Guideline', 'Body', 'Year'],
      doc.references.guidelines.map((g: GuidelineRef) => [g.title, g.issuingBody, g.year.toString()]),
      [45, 25, 10],
    );
  }
  if (doc.references.evidence.length) {
    drawList(doc.references.evidence.map(e => e.citation));
  }
  drawMultiline(doc.references.notes);
  y += 3;

  // Footer
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(6);
  pdf.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  pdf.text('AMEXAN Clinical Intelligence Platform — Document ID: ' + doc.metadata.generatedAt.toString(36).toUpperCase(), MARGIN, PAGE_HEIGHT - 5);
  pdf.text('Page ' + pdf.internal.pages.length, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 5, { align: 'right' });

  return pdf.output('blob');
}

export async function downloadPdf(doc: ClinicalDocument, filename?: string) {
  const blob = await renderClinicalPdf(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'clinical-document-' + Date.now() + '.pdf';
  a.click();
  URL.revokeObjectURL(url);
}

export async function openPdfInTab(doc: ClinicalDocument) {
  const blob = await renderClinicalPdf(doc);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
