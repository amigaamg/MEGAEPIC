export function phraseFinding(finding: string, present: boolean): string {
  const label = finding.replace(/_/g, ' ');
  if (present) {
    return `${label} is present`;
  }
  return `${label} is absent`;
}

export function phraseDifferential(diseaseName: string, probability: number): string {
  const pct = (probability * 100).toFixed(0);
  if (probability >= 0.7) {
    return `${diseaseName} is the leading diagnosis (${pct}% probability)`;
  }
  if (probability >= 0.35) {
    return `${diseaseName} is a likely differential (${pct}% probability)`;
  }
  if (probability >= 0.1) {
    return `${diseaseName} is a possible differential (${pct}% probability)`;
  }
  return `${diseaseName} is a remote possibility (${pct}% probability)`;
}

export function phraseSeverity(level: string): string {
  switch (level) {
    case 'critical':
      return 'CRITICAL — life-threatening condition requiring immediate intervention';
    case 'severe':
      return 'SEVERE — urgent management and close monitoring required';
    case 'moderate':
      return 'MODERATE — regular monitoring and treatment indicated';
    case 'mild':
      return 'MILD — supportive care and observation';
    default:
      return `Severity level: ${level}`;
  }
}

export function phraseRecommendation(action: string, urgency: string): string {
  const urgencyPrefix: Record<string, string> = {
    immediate: 'URGENT: ',
    urgent: 'Prompt: ',
    routine: '',
    prn: 'Consider: ',
  };
  const prefix = urgencyPrefix[urgency.toLowerCase()] || '';
  return `${prefix}${action}.`;
}

export function phraseAssessment(differentials: string[], severity: string): string {
  const parts: string[] = [];
  if (differentials.length > 0) {
    parts.push(`The clinical picture is most consistent with ${differentials[0]}.`);
    if (differentials.length > 1) {
      parts.push(`Other differentials to consider include ${differentials.slice(1).join(', ')}.`);
    }
  }
  parts.push(`Overall severity assessment: ${phraseSeverity(severity)}.`);
  return parts.join(' ');
}

export function formatMedicalText(raw: string): string {
  let text = raw
    .replace(/_/g, ' ')
    .replace(/\b(\w+)_(\w+)\b/g, (_, a, b) => `${a} ${b}`);

  text = text.charAt(0).toUpperCase() + text.slice(1);

  if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
    text += '.';
  }

  const medicalTerms: Record<string, string> = {
    'hiv': 'HIV',
    'aids': 'AIDS',
    'crp': 'CRP',
    'wbc': 'WBC',
    'rbc': 'RBC',
    'icu': 'ICU',
    'hdu': 'HDU',
    'spo2': 'SpO₂',
    'po2': 'PO₂',
    'pco2': 'PCO₂',
    'cxr': 'CXR',
    'ecg': 'ECG',
    'echo': 'Echocardiogram',
    'gene xpert': 'GeneXpert',
  };

  for (const [key, val] of Object.entries(medicalTerms)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    text = text.replace(regex, val);
  }

  return text;
}
