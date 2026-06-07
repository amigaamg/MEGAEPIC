export interface PhraseTemplate {
  id: string;
  template: string;
  parameters: string[];
  tone: 'neutral' | 'urgent' | 'emergency' | 'informative';
}

export interface SentenceBuilderInput {
  subject: string;
  verb: string;
  object?: string;
  adverb?: string;
  tense: 'present' | 'past' | 'future';
  certainty?: 'definite' | 'probable' | 'possible' | 'unlikely';
}

export interface NarrativeFlowStep {
  topic: string;
  sentences: string[];
  transition?: string;
}

const PHRASE_BANK: Record<string, PhraseTemplate[]> = {
  presentation: [
    { id: 'pc_standard', template: '{patient} presents with {duration} history of {symptom}.', parameters: ['patient', 'duration', 'symptom'], tone: 'neutral' },
    { id: 'pc_emergency', template: '{patient} was brought to {location} as an EMERGENCY with {symptom} of {duration}.', parameters: ['patient', 'location', 'symptom', 'duration'], tone: 'emergency' },
  ],
  onset: [
    { id: 'onset_sudden', template: 'The {symptom} began {onset_type} and has {progression}.', parameters: ['symptom', 'onset_type', 'progression'], tone: 'neutral' },
    { id: 'onset_gradual', template: 'The {symptom} developed {onset_type} over {duration}.', parameters: ['symptom', 'onset_type', 'duration'], tone: 'neutral' },
  ],
  pain: [
    { id: 'pain_colicky', template: 'The pain is {character} in nature, coming in waves, and {severity}.', parameters: ['character', 'severity'], tone: 'neutral' },
    { id: 'pain_constant', template: 'The pain is {character} and constant, rated {severity}/10.', parameters: ['character', 'severity'], tone: 'neutral' },
    { id: 'pain_progression', template: 'The pain was initially colicky but has now become constant — this progression raises concern for bowel ischaemia.', parameters: [], tone: 'urgent' },
  ],
  examination: [
    { id: 'exam_general', template: 'General examination reveals {findings}. Vital signs: BP {bp}, HR {hr}, RR {rr}, Temp {temp}, SpO2 {spo2}.', parameters: ['findings', 'bp', 'hr', 'rr', 'temp', 'spo2'], tone: 'neutral' },
    { id: 'exam_abdomen_distended', template: 'The abdomen is {severity}ly distended, tense, and {symmetry} with visible {peristalsis}.', parameters: ['severity', 'symmetry', 'peristalsis'], tone: 'neutral' },
    { id: 'exam_dre_empty', template: 'Digital rectal examination reveals an empty rectum with normal sphincter tone. No masses or blood.', parameters: [], tone: 'neutral' },
  ],
  diagnosis: [
    { id: 'dx_volvulus', template: 'Based on {evidence}, the diagnosis is sigmoid volvulus ({confidence} confidence).', parameters: ['evidence', 'confidence'], tone: 'neutral' },
    { id: 'dx_cancer', template: 'Based on {evidence}, the diagnosis is obstructing colorectal carcinoma ({confidence} confidence).', parameters: ['evidence', 'confidence'], tone: 'informative' },
    { id: 'dx_ischemia', template: 'EMERGENCY: Evidence of bowel ischaemia. IMMEDIATE surgical exploration required.', parameters: [], tone: 'emergency' },
  ],
  management: [
    { id: 'mgmt_resuscitation', template: 'Immediate resuscitation: NBM, IV access {access}, IV fluids {fluids}, NG tube, catheter.', parameters: ['access', 'fluids'], tone: 'urgent' },
    { id: 'mgmt_antibiotics', template: 'Broad-spectrum IV antibiotics: Ceftriaxone {cef_dose} IV plus Metronidazole {met_dose} IV.', parameters: ['cef_dose', 'met_dose'], tone: 'neutral' },
    { id: 'mgmt_emergency_surgery', template: 'EMERGENCY laparotomy indicated. Diagnosis: {diagnosis}. Ischaemia concern: {ischemia_concern}.', parameters: ['diagnosis', 'ischemia_concern'], tone: 'emergency' },
  ],
  followup: [
    { id: 'fu_wound_check', template: 'Wound check in {timing} at {clinic}. Return immediately if {red_flags}.', parameters: ['timing', 'clinic', 'red_flags'], tone: 'informative' },
    { id: 'fu_stoma_reversal', template: 'Stoma reversal can be considered in {timing} months. Requires colonoscopy and gastrografin enema prior.', parameters: ['timing'], tone: 'informative' },
  ],
  red_flags: [
    { id: 'rf_urgent_review', template: '⚠ {finding} — Urgent surgical review required.', parameters: ['finding'], tone: 'urgent' },
    { id: 'rf_immediate_action', template: '🚨 {finding} — IMMEDIATE ACTION REQUIRED: {action}.', parameters: ['finding', 'action'], tone: 'emergency' },
  ],
};

export function fillTemplate(templateId: string, parameters: Record<string, string>): string | null {
  for (const category of Object.values(PHRASE_BANK)) {
    const tpl = category.find(t => t.id === templateId);
    if (tpl) {
      let result = tpl.template;
      for (const [key, value] of Object.entries(parameters)) {
        result = result.replaceAll(`{${key}}`, value);
      }
      return result;
    }
  }
  return null;
}

export function buildSentence(input: SentenceBuilderInput): string {
  const certaintyPrefix: Record<string, string> = {
    definite: '',
    probable: 'likely ',
    possible: 'possibly ',
    unlikely: 'unlikely to be ',
  };

  const tenseModifiers: Record<string, (v: string) => string> = {
    present: (v) => v + (v.endsWith('s') ? '' : 's'),
    past: (v) => v + 'ed',
    future: (v) => 'will ' + v,
  };

  const verbPhrase = tenseModifiers[input.tense]?.(input.verb) || input.verb;
  const certainty = input.certainty ? certaintyPrefix[input.certainty] : '';

  const parts = [input.subject, certainty + verbPhrase];
  if (input.object) parts.push(input.object);
  if (input.adverb) parts.push(input.adverb);

  return parts.join(' ') + '.';
}

export function buildNarrative(steps: NarrativeFlowStep[]): string {
  return steps.map(step => {
    const sentences = step.sentences.join(' ');
    const transition = step.transition ? `\n${step.transition}\n` : '';
    return transition + sentences;
  }).join('\n').trim();
}

export function getClinicalTone(urgency: string): string {
  const tones: Record<string, string> = {
    emergency: 'Direct, imperative, no hedging language. Use "must", "immediate", "required".',
    urgent: 'Firm, directive, clear timeframe. Use "should", "urgently", "promptly".',
    routine: 'Standard narrative, complete sentences, contextual.',
    informative: 'Explanatory tone, patient-centred when counselling.',
  };
  return tones[urgency] || tones.routine;
}
