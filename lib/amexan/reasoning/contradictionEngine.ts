import type { EncounterState, AnswerRecord, Contradiction } from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';

interface ContradictionRule {
  id: string;
  check: (answers: AnswerRecord[], state?: EncounterState) => Contradiction | null;
}

const TEMPORAL_RULES: ContradictionRule[] = [
  {
    id: 'onset_vs_duration',
    check: (answers) => {
      const onset = answers.find(a => a.featureId === 'pain_onset');
      const duration = answers.find(a => a.featureId === 'pain_duration_hours');
      if (!onset || !duration) return null;
      const dur = typeof duration.value === 'number' ? duration.value : parseFloat(String(duration.value));
      if (isNaN(dur)) return null;
      const onsetVal = String(onset.value).toLowerCase();
      if (onsetVal.includes('sudden') && dur > 72) {
        return {
          type: 'temporal',
          featureA: 'pain_onset',
          valueA: 'sudden',
          featureB: 'pain_duration_hours',
          valueB: `${dur} hours`,
          description: `Pain described as sudden onset but has lasted ${dur} hours (>72h). Sudden pain with prolonged duration suggests perforation or ischaemia — clarify if the pain truly started suddenly or gradually worsened.`,
        };
      }
      if (onsetVal.includes('gradual') && dur < 1) {
        return {
          type: 'temporal',
          featureA: 'pain_onset',
          valueA: 'gradual',
          featureB: 'pain_duration_hours',
          valueB: `${dur} hours`,
          description: `Pain described as gradual onset but duration is only ${dur} hour(s). Brief duration with gradual onset is unusual — clarify the exact timeframe.`,
        };
      }
      return null;
    },
  },
  {
    id: 'duration_vs_duration_days',
    check: (answers) => {
      const hours = answers.find(a => a.featureId === 'pain_duration_hours');
      const months = answers.find(a => a.featureId === 'pain_duration_months');
      if (!hours || !months) return null;
      const h = parseFloat(String(hours.value));
      const m = parseFloat(String(months.value));
      if (isNaN(h) || isNaN(m)) return null;
      if (h > 24 && m > 0) {
        const expectedMonths = h / (24 * 30);
        if (Math.abs(expectedMonths - m) > 2) {
          return {
            type: 'temporal',
            featureA: 'pain_duration_hours',
            valueA: `${h} hours`,
            featureB: 'pain_duration_months',
            valueB: `${m} months`,
            description: `Inconsistent duration: ${h} hours (~${Math.round(expectedMonths)} months) vs ${m} months reported.`,
          };
        }
      }
      return null;
    },
  },
  {
    id: 'age_vs_duration',
    check: (answers, state?) => {
      if (!state) return null;
      const duration = answers.find(a => a.featureId === 'pain_duration_hours');
      if (!duration || !duration.value) return null;
      const dur = parseFloat(String(duration.value));
      if (isNaN(dur)) return null;
      if (state.patient.age >= 65 && dur > 48) {
        return {
          type: 'temporal',
          featureA: 'pain_duration_hours',
          valueA: `${dur} hours`,
          featureB: 'patient.age',
          valueB: String(state.patient.age),
          description: `Elderly patient (${state.patient.age} years) with abdominal pain for ${dur} hours. Prolonged duration in the elderly is a red flag — pain perception may be blunted, and delayed presentation is associated with worse outcomes.`,
        };
      }
      return null;
    },
  },
];

const ANATOMICAL_RULES: ContradictionRule[] = [
  {
    id: 'location_vs_migration',
    check: (answers) => {
      const initLoc = answers.find(a => a.featureId === 'pain_initial_location');
      const currLoc = answers.find(a => a.featureId === 'pain_location_now');
      const migration = answers.find(a => a.featureId === 'pain_migration');
      if (initLoc && currLoc) {
        const init = String(initLoc.value).toLowerCase();
        const curr = String(currLoc.value).toLowerCase();
        if (init === curr && migration) {
          const migVal = String(migration.value).toLowerCase();
          if (migVal.includes('yes') || migVal.includes('migrated') || migVal.includes('moved')) {
            return {
              type: 'anatomical',
              featureA: 'pain_initial_location',
              valueA: init,
              featureB: 'pain_migration',
              valueB: migVal,
              description: `Pain started in ${init} and is still in ${curr}, yet patient reports migration. Clarify: did the pain truly move, or did it spread/worsen in the same area?`,
            };
          }
        }
        if (init !== curr && migration) {
          const migVal = String(migration.value).toLowerCase();
          if (migVal.includes('no') || migVal.includes('not') || migVal.includes('same')) {
            return {
              type: 'anatomical',
              featureA: 'pain_initial_location',
              valueA: init,
              featureB: 'pain_location_now',
              valueB: curr,
              description: `Pain started in ${init} and is now in ${curr}, but patient denies migration. Different locations without acknowledged migration — clarify: did it move or is there a separate pain?`,
            };
          }
        }
      }
      return null;
    },
  },
  {
    id: 'radiation_vs_location',
    check: (answers) => {
      const loc = answers.find(a => a.featureId === 'pain_location_now' || a.featureId === 'pain_initial_location');
      const rad = answers.find(a => a.featureId === 'pain_radiation');
      if (!loc || !rad) return null;
      const l = String(loc.value).toLowerCase();
      const r = String(rad.value).toLowerCase();
      if (l.includes('rlq') && r.includes('shoulder')) {
        return {
          type: 'anatomical',
          featureA: 'pain_location_now',
          valueA: l,
          featureB: 'pain_radiation',
          valueB: r,
          description: 'RLQ pain radiating to the shoulder is unusual. RLQ pain typically does not radiate to the shoulder — consider diaphragmatic irritation or a separate process (e.g., biliary).',
        };
      }
      return null;
    },
  },
];

const LOGICAL_RULES: ContradictionRule[] = [
  {
    id: 'obstipation_vs_diarrhea',
    check: (answers) => {
      const obst = answers.find(a => a.featureId === 'obstipation' && a.polarity === 'present');
      const diarr = answers.find(a => (a.featureId === 'diarrhea' || a.featureId === 'diarrhoea') && a.polarity === 'present');
      if (obst && diarr) {
        return {
          type: 'logical',
          featureA: 'obstipation',
          valueA: 'Yes',
          featureB: 'diarrhea',
          valueB: 'Yes',
          description: 'Both obstipation (no stool/gas) and diarrhoea (loose/watery stool) reported. These are mutually exclusive — clarify which is correct. Overflow diarrhoea with underlying constipation may explain this.',
        };
      }
      return null;
    },
  },
  {
    id: 'vomiting_hematemesis',
    check: (answers) => {
      const vomit = answers.find(a => a.featureId === 'vomiting' && a.polarity === 'absent');
      const hematemesis = answers.find(a => a.featureId === 'hematemesis' && a.polarity === 'present');
      if (vomit && hematemesis) {
        return {
          type: 'logical',
          featureA: 'vomiting',
          valueA: 'No',
          featureB: 'hematemesis',
          valueB: 'Yes',
          description: 'Patient denies vomiting but reports vomiting blood (hematemesis). Clarify: is the blood coming from vomiting, coughing, or another source?',
        };
      }
      return null;
    },
  },
  {
    id: 'pregnancy_no_lmp',
    check: (answers) => {
      const preg = answers.find(a => a.featureId === 'pregnancy_status' && a.polarity === 'present');
      const lmp = answers.find(a => a.featureId === 'last_menstrual_period');
      if (preg && (!lmp || lmp.polarity === 'absent')) {
        return {
          type: 'logical',
          featureA: 'pregnancy_status',
          valueA: 'Yes',
          featureB: 'last_menstrual_period',
          valueB: lmp ? String(lmp.value) : 'not asked',
          description: 'Patient reports pregnancy but LMP is not recorded. All pregnant patients with abdominal pain must have LMP documented — critical for ectopic risk stratification.',
        };
      }
      return null;
    },
  },
  {
    id: 'male_gynae',
    check: (answers, state) => {
      if (!state) return null;
      if (state.patient.sex !== 'male') return null;
      const gynaeQuestions = answers.filter(a =>
        ['vaginal_bleeding', 'vaginal_discharge', 'last_menstrual_period', 'dyspareunia'].includes(a.featureId) &&
        a.value !== undefined && String(a.value) !== ''
      );
      if (gynaeQuestions.length > 0) {
        return {
          type: 'logical',
          featureA: 'patient.sex',
          valueA: 'male',
          featureB: gynaeQuestions[0].featureId,
          valueB: String(gynaeQuestions[0].value),
          description: 'Gynaecological questions should not apply to a male patient. Check if patient sex is correctly recorded.',
        };
      }
      return null;
    },
  },
];

const SEVERITY_RULES: ContradictionRule[] = [
  {
    id: 'severity_vs_activity',
    check: (answers) => {
      const severity = answers.find(a => a.featureId === 'pain_severity');
      const impact = answers.find(a => a.featureId === 'impact_daily_activity' || a.featureId === 'functional_impact');
      if (!severity || !impact) return null;
      const sev = typeof severity.value === 'number' ? severity.value : parseFloat(String(severity.value));
      if (isNaN(sev)) return null;
      const imp = String(impact.value).toLowerCase();
      if (sev >= 8 && (imp.includes('no') || imp.includes('mild') || imp.includes('normal'))) {
        return {
          type: 'severity',
          featureA: 'pain_severity',
          valueA: `${sev}/10`,
          featureB: impact.featureId,
          valueB: imp,
          description: `Pain rated ${sev}/10 (severe) but functional impact is described as "${imp}". Severe pain typically causes significant functional limitation — clarify.`,
        };
      }
      if (sev <= 3 && (imp.includes('severe') || imp.includes('unable') || imp.includes('cant'))) {
        return {
          type: 'severity',
          featureA: 'pain_severity',
          valueA: `${sev}/10`,
          featureB: impact.featureId,
          valueB: imp,
          description: `Pain rated only ${sev}/10 but causes "${imp}" functional limitation. Mild pain should not severely limit function — clarify.`,
        };
      }
      return null;
    },
  },
];

const ALL_CONTRADICTION_RULES: ContradictionRule[] = [
  ...TEMPORAL_RULES,
  ...ANATOMICAL_RULES,
  ...LOGICAL_RULES,
  ...SEVERITY_RULES,
];

export function detectContradictions(
  state: EncounterState,
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  for (const rule of ALL_CONTRADICTION_RULES) {
    try {
      const result = rule.check(state.answers, state as any);
      if (result) {
        // Avoid duplicates
        const exists = contradictions.some(c =>
          c.featureA === result.featureA && c.featureB === result.featureB
        );
        if (!exists) contradictions.push(result);
      }
    } catch {
      // Silently skip rule failures
    }
  }

  return contradictions;
}
