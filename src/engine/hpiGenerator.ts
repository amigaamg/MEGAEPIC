import { ConsultationContext, DiseaseScore } from '@/src/types';

export function generateHPI(
  ctx: ConsultationContext,
  topDx: DiseaseScore[]
): string {
  const age = ctx.age
    ? ctx.age < 24
      ? `${ctx.age}-month-old`
      : `${Math.floor(ctx.age / 12)}-year-old`
    : 'child';

  const duration = ctx.answers['cough_duration'] as string | undefined;
  const durationText = duration ?? 'several days';

  const symptomsText = ctx.symptoms
    .map(s => s.replace(/_/g, ' '))
    .join(', ');

  const fever    = ctx.answers['fever_present']    === 'true' ? 'associated fever' : null;
  const wheeze   = ctx.answers['wheeze_present']   === 'true' ? 'wheeze' : null;
  const feeding  = ctx.answers['reduced_feeding']  === 'true' ? 'reduced oral intake' : null;
  const night    = ctx.answers['night_symptoms']   === 'true' ? 'nocturnal worsening' : null;

  const associated = [fever, wheeze, feeding, night].filter(Boolean).join(', ');

  const spo2Line = ctx.vitals.spo2
    ? ` Oxygen saturation on room air is ${ctx.vitals.spo2}%.`
    : '';

  const leadingDx = topDx[0]?.name ?? 'respiratory illness';

  return `
${age.charAt(0).toUpperCase() + age.slice(1)} presenting with a ${durationText} history of ${symptomsText}${associated ? ` with ${associated}` : ''}. There is no prior history of similar episodes documented at this visit.${spo2Line}

Working assessment: ${leadingDx}${topDx[1] ? `, with ${topDx[1].name} in the differential` : ''}.
  `.trim();
}