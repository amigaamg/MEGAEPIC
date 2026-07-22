// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Discharge Engine — complete auto-generated discharge summary
// ═══════════════════════════════════════════════════════════════════════════════
// The hospital course is automatically generated as a chronological narrative.
// Almost no typing required.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DischargeData, DischargeMedication, HospitalDay } from './types';
import type { EncounterState } from '../encounter/encounterState';
import { buildClinicalSummaryInput, generateClinicalSummary } from '../encounter/engines/clinicalSummaryEngine';
import { generateDrugHistory } from '../encounter/engines/documentationEngine';

// ── Generate complete discharge summary ──────────────────────────────────────

export function generateDischargeData(
  encounter: EncounterState,
  hospitalDays: HospitalDay[],
): DischargeData {
  const disp = encounter.disposition;
  const now = Date.now();

  const procedures = extractProcedures(hospitalDays);
  const hospitalCourse = generateHospitalCourse(hospitalDays, encounter);
  const medications = extractDischargeMedications(encounter);

  return {
    dischargedAt: now,
    dischargeType: 'discharged',
    admittingDiagnosis: encounter.provisionalDiagnosis?.diagnosis || encounter.assessment.finalDiagnosis || 'Not documented',
    finalDiagnosis: encounter.assessment.finalDiagnosis || encounter.provisionalDiagnosis?.diagnosis || 'Not documented',
    proceduresPerformed: procedures,
    hospitalCourse,
    dischargeMedications: medications,
    conditionAtDischarge: 'improved',
    followUpPlan: encounter.plan.followUp || disp?.followUpPlan || 'To be followed up in outpatient clinic.',
    activityRestrictions: [],
    dietInstructions: '',
    woundCareInstructions: '',
    redFlags: encounter.assessment.severity.redFlags,
    safetyNetting: encounter.plan.safetyNetting || disp?.safetyNetting || 'Return if worsening symptoms.',
    medicationReconciliationDone: false,
    nursingHandoverDone: false,
    dischargeNote: '',
    generatedAt: now,
  };
}

// ── Generate hospital course (chronological narrative) ───────────────────────

function generateHospitalCourse(
  hospitalDays: HospitalDay[],
  encounter: EncounterState,
): string {
  const paragraphs: string[] = [];
  const d = encounter.demographics;
  const p = d.sex === 'female' ? 'she' : 'he';
  const pos = d.sex === 'female' ? 'her' : 'his';

  if (hospitalDays.length === 0) {
    const clinicalSummary = generateClinicalSummary(buildClinicalSummaryInput(encounter));
    return clinicalSummary;
  }

  for (const day of hospitalDays) {
    const dateStr = new Date(day.date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const dayParts: string[] = [];
    dayParts.push(`On ${dateStr} (Hospital Day ${day.dayNumber}),`);

    if (day.dayNumber === 1) {
      dayParts.push(`${p} was admitted`);
      if (encounter.chiefComplaint.text) {
        dayParts.push(`with ${encounter.chiefComplaint.text}`);
      }
      if (encounter.chiefComplaint.duration) {
        dayParts.push(`of ${encounter.chiefComplaint.duration} duration`);
      }
      dayParts.push('.');

      // Initial interventions
      const initialInterventions: string[] = [];
      for (const med of encounter.medications.filter(m => m.status !== 'discontinued')) {
        initialInterventions.push(`${med.genericName} ${med.dose.value}${med.dose.unit}`);
      }
      if (initialInterventions.length > 0) {
        dayParts.push(`${capitalise(p)} was commenced on ${initialInterventions.join(', ')}.`);
      }
      if (encounter.examination.vitals.spo2 !== undefined && encounter.examination.vitals.spo2 < 94) {
        dayParts.push('Supplemental oxygen was administered.');
      }
    } else {
      const previousDay = hospitalDays[day.dayNumber - 2];
      if (previousDay) {
        // Show improvement/deterioration
        if (day.status === 'improving') {
          dayParts.push(`clinical improvement was noted. ${capitalise(p)} was afebrile, haemodynamically stable, and tolerating oral intake.`);
        } else if (day.status === 'deteriorating') {
          dayParts.push(`the patient's condition deteriorated.`);
        } else {
          dayParts.push(`${p} remained clinically stable.`);
        }
      }

      // New results
      const newResults = day.investigations.filter(i => i.status === 'resulted');
      if (newResults.length > 0) {
        const abnormal = newResults.filter(i => i.flag === 'abnormal' || i.flag === 'critical');
        if (abnormal.length > 0) {
          dayParts.push(`Laboratory results showed ${abnormal.map(i => `${i.testName}: ${i.result}`).join(', ')}.`);
        } else if (newResults.length > 0 && day.dayNumber < 4) {
          dayParts.push(`Investigations were repeated and were reassuring.`);
        }
      }
    }

    paragraphs.push(dayParts.join(' '));
  }

  // Outcome paragraph
  const lastDay = hospitalDays[hospitalDays.length - 1];
  if (lastDay) {
    const outcomeParts: string[] = [];
    outcomeParts.push(`${capitalise(p)} was discharged home in stable condition on`);
    outcomeParts.push(new Date(lastDay.date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }));
    if (encounter.assessment.finalDiagnosis) {
      outcomeParts.push(`with a final diagnosis of ${encounter.assessment.finalDiagnosis}.`);
    }
    paragraphs.push(outcomeParts.join(' '));
  }

  return paragraphs.join(' ');
}

// ── Extract procedures from hospital days ────────────────────────────────────

function extractProcedures(hospitalDays: HospitalDay[]): string[] {
  const procedures: string[] = [];
  for (const day of hospitalDays) {
    for (const event of day.events) {
      if (event.type === 'operation' || event.type === 'procedure') {
        procedures.push(event.title);
      }
    }
  }
  return [...new Set(procedures)];
}

// ── Extract discharge medications ────────────────────────────────────────────

function extractDischargeMedications(encounter: EncounterState): DischargeMedication[] {
  const meds: DischargeMedication[] = [];

  for (const med of encounter.medications) {
    if (med.status === 'discontinued' || med.status === 'draft') continue;
    meds.push({
      name: med.genericName,
      dosage: `${med.dose.value}${med.dose.unit}`,
      route: med.route,
      frequency: med.frequency,
      duration: med.durationDays ? `${med.durationDays} days` : '',
      indication: med.indication,
    });
  }

  // Legacy medications
  if (meds.length === 0) {
    for (const m of encounter.plan.medications) {
      const indication = (m as any).indication || '';
      meds.push({
        name: m.name,
        dosage: m.dose,
        route: m.route,
        frequency: m.frequency,
        duration: m.duration || '',
        indication,
      });
    }
  }

  return meds;
}

// ── Helper ───────────────────────────────────────────────────────────────────

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
