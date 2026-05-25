import { Severity } from '@/src/types';
import { ClinicalContext, SeverityScore, MewsScore } from '@/src/types/clinical';

const SCORING_TABLE: Record<string, number[]> = {
  hr: [71, 81, 91, 101, 111, 121, 131, 141], // thresholds: bpm
  rr: [11, 16, 21, 26, 31, 36, 41, 46],
  temp: [35.1, 35.5, 36, 36.5, 37.5, 38, 38.5, 39],
};

const AGE_GROUP = (m: number) =>
  m < 3 ? 'infant' : m < 12 ? 'baby' : m < 60 ? 'child' : 'adolescent';

const RR_RANGES: Record<string, [number, number][]> = {
  infant:  [[0, 60], [61, 70], [71, 80], [81, 90]],
  baby:    [[0, 40], [41, 50], [51, 60], [61, 70]],
  child:   [[0, 30], [31, 35], [36, 40], [41, 50]],
  adolescent: [[0, 20], [21, 25], [26, 30], [31, 35]],
};

const HR_RANGES: Record<string, [number, number][]> = {
  infant:  [[0, 160], [161, 170], [171, 180], [181, 190]],
  baby:    [[0, 140], [141, 150], [151, 160], [161, 170]],
  child:   [[0, 120], [121, 130], [131, 140], [141, 150]],
  adolescent: [[0, 100], [101, 110], [111, 120], [121, 130]],
};

function scoreInRange(val: number, ranges: [number, number][]): MewsScore {
  for (let i = 0; i < ranges.length; i++) {
    if (val >= ranges[i][0] && val <= ranges[i][1]) return i as MewsScore;
  }
  return 3;
}

function pediatricAVPU(avpu: string): MewsScore {
  switch (avpu) {
    case 'alert': return 0;
    case 'voice': return 1;
    case 'pain': return 2;
    case 'unresponsive': return 3;
    default: return 0;
  }
}

export class SeverityEngine {
  assess(ctx: ClinicalContext): SeverityScore {
    const { vitals, exam, symptoms, answers } = ctx;
    const ageGroup = AGE_GROUP(ctx.ageMonths);
    const redFlags: string[] = [];
    let mews = 0;
    let qsofa = 0;
    let sirs = 0;

    // ═══ MEWS (Modified Early Warning Score) ═══
    if (vitals.hr !== undefined) {
      const ranges = HR_RANGES[ageGroup] || HR_RANGES.child;
      mews += scoreInRange(vitals.hr, ranges);
    }

    if (vitals.rr !== undefined) {
      const ranges = RR_RANGES[ageGroup] || RR_RANGES.child;
      mews += scoreInRange(vitals.rr, ranges);
    }

    if (vitals.temp !== undefined) {
      if (vitals.temp < 36) mews += 2;
      else if (vitals.temp > 38.5) mews += 2;
      else if (vitals.temp > 39) mews += 3;
    }

    if (vitals.avpu) {
      mews += pediatricAVPU(vitals.avpu);
    }

    // ═══ qSOFA ═══
    if (vitals.rr !== undefined && vitals.rr >= (ageGroup === 'infant' ? 60 : 30)) {
      qsofa += 1;
    }
    if (vitals.avpu && vitals.avpu !== 'alert') {
      qsofa += 1;
    }
    if (vitals.bpSystolic !== undefined && vitals.bpSystolic < 100) {
      qsofa += 1;
    }

    // ═══ SIRS criteria ═══
    if (vitals.temp !== undefined && (vitals.temp > 38 || vitals.temp < 36)) sirs += 1;
    if (vitals.hr !== undefined && vitals.hr > (HR_RANGES[ageGroup]?.[0]?.[1] ?? 140)) sirs += 1;
    if (vitals.rr !== undefined && vitals.rr > (RR_RANGES[ageGroup]?.[0]?.[1] ?? 40)) sirs += 1;

    // ═══ Danger signs (WHO Emergency Triage) ═══
    if (exam.cyanosis || (vitals.spo2 !== undefined && vitals.spo2 < 90)) {
      redFlags.push('Central cyanosis or SpO2 <90% — severe hypoxaemia');
    }

    if (vitals.spo2 !== undefined && vitals.spo2 < 92) {
      redFlags.push(`Hypoxia: SpO2 ${vitals.spo2}%`);
    }

    if (exam.chestIndrawing && exam.nasalFlaring) {
      redFlags.push('Severe respiratory distress: chest indrawing + nasal flaring');
    }

    if (exam.grunting) {
      redFlags.push('Expiratory grunting — sign of severe pneumonia/lung disease');
    }

    if (exam.headNodding) {
      redFlags.push('Head nodding — impending respiratory failure');
    }

    if (exam.stridor) {
      redFlags.push('Stridor — upper airway obstruction');
    }

    if (vitals.avpu && (vitals.avpu === 'pain' || vitals.avpu === 'unresponsive')) {
      redFlags.push(`AVPU: ${vitals.avpu} — altered consciousness`);
    }

    if (symptoms.includes('lethargy')) {
      redFlags.push('Lethargy — severe illness / possible sepsis');
    }

    if (vitals.capRefill !== undefined && vitals.capRefill > 3) {
      redFlags.push('Capillary refill >3 seconds — shock');
    }

    if (exam.oedema) {
      redFlags.push('Oedema — consider nephrotic syndrome, severe malnutrition, or heart failure');
    }

    if (exam.meningism) {
      redFlags.push('Meningism — possible CNS infection');
    }

    // ═══ Overall severity classification ═══
    const criticalRedFlags = redFlags.filter(f =>
      f.includes('cyanosis') || f.includes('90%') || f.includes('unresponsive') ||
      f.includes('failure') || f.includes('shock') || f.includes('meningism')
    );

    let level: Severity;
    let triagePriority: 'green' | 'yellow' | 'orange' | 'red';
    let action: string;

    if (criticalRedFlags.length > 0 || qsofa >= 2 || mews >= 5) {
      level = 'critical';
      triagePriority = 'red';
      action = 'IMMEDIATE RESUSCITATION. Call senior clinician. Secure airway, high-flow oxygen, IV access. Prepare for PICU/HDU transfer.';
    } else if (redFlags.length >= 3 || mews >= 3 || qsofa >= 1) {
      level = 'severe';
      triagePriority = 'orange';
      action = 'URGENT ASSESSMENT. Oxygen if hypoxic. IV fluids. Broad-spectrum antibiotics if sepsis suspected. Senior review within 30 minutes.';
    } else if (redFlags.length >= 1 || sirs >= 2) {
      level = 'moderate';
      triagePriority = 'yellow';
      action = 'PROMPT TREATMENT. Monitor closely. Treat underlying condition. Reassess in 1 hour.';
    } else {
      level = 'mild';
      triagePriority = 'green';
      action = 'Outpatient management. Symptomatic treatment. Return if worsening.';
    }

    return {
      mews: Math.min(mews, 9),
      qsofa,
      sirs: Math.min(sirs, 4),
      redFlags,
      level,
      action,
      triagePriority,
    };
  }
}
