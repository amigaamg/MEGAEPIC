import { ConsultationContext, Severity } from '@/src/types';

export interface SeverityResult {
  level: Severity;
  redFlags: string[];
  action: string;
}

export function assessSeverity(ctx: ConsultationContext): SeverityResult {
  const flags: string[] = [];

  // CRITICAL flags
  if (ctx.symptoms.includes('cyanosis'))       flags.push('Cyanosis present');
  if (ctx.vitals.spo2 !== undefined && ctx.vitals.spo2 < 90)
    flags.push(`SpO2 critically low: ${ctx.vitals.spo2}%`);
  if (ctx.answers['stridor_present'] === 'true' && ctx.symptoms.includes('cyanosis'))
    flags.push('Stridor + cyanosis — airway emergency');
  if (ctx.symptoms.includes('lethargy'))       flags.push('Altered consciousness / lethargy');

  // SEVERE flags
  const spo2 = ctx.vitals.spo2;
  if (spo2 !== undefined && spo2 < 92)         flags.push(`SpO2 low: ${spo2}%`);
  if (ctx.symptoms.includes('reduced_feeding')) flags.push('Unable to feed');
  if (ctx.vitals.rr !== undefined) {
    const age = ctx.age ?? 24; // months, default 2yr
    const tachypneaThreshold = age < 12 ? 50 : age < 60 ? 40 : 30;
    if (ctx.vitals.rr > tachypneaThreshold)
      flags.push(`Tachypnea: RR ${ctx.vitals.rr} (threshold ${tachypneaThreshold})`);
  }

  // Severity classification
  if (
    flags.some(f =>
      f.includes('Cyanosis') ||
      f.includes('critically low') ||
      f.includes('airway emergency') ||
      f.includes('consciousness')
    )
  ) {
    return { level: 'critical', redFlags: flags, action: 'Immediate resuscitation. Call for senior help.' };
  }

  if (flags.length >= 2) {
    return { level: 'severe', redFlags: flags, action: 'Urgent assessment. IV access, oxygen, senior review.' };
  }

  if (flags.length === 1) {
    return { level: 'moderate', redFlags: flags, action: 'Prompt treatment. Monitor closely.' };
  }

  return { level: 'mild', redFlags: [], action: 'Outpatient or ward management.' };
}