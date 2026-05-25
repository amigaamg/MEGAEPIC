import { DiseaseScore } from '@/src/types';
import {
  ClinicalContext,
  DdxExplanation,
  SeverityScore,
  ClinicalNarrative,
  NarrativeSection,
} from '@/src/types/clinical';

interface NarrativeTemplates {
  hpi: {
    triage: string;
    main: string;
  };
  assessment: Record<string, string>;
  plan: {
    admission: string;
    discharge: string;
    referral: string;
  };
}

const TEMPLATES: NarrativeTemplates = {
  hpi: {
    triage: `{name}, a {age} {sex}, presented with {symptoms} for {duration}. On triage, {triage_findings}.`,
    main: `{name}, a {age} {sex}, presents with a {duration}-day history of {symptoms}. {associated_features}. {past_history}. {risk_factors}.`,
  },
  assessment: {
    pneumonia_cap: `Community Acquired Pneumonia. Fever, cough, and tachypnea are consistent with pneumonia. {severity_note}.`,
    asthma: `Acute Asthma Exacerbation. Recurrent wheeze, nocturnal symptoms, and family history of atopy support asthma. {severity_note}.`,
    bronchiolitis: `Bronchiolitis. Age <24 months with viral prodrome, wheeze, and respiratory distress. {severity_note}.`,
    tb: `Pulmonary Tuberculosis suspected. Chronic cough, {tb_features}, and TB contact history warrant full TB workup. {severity_note}.`,
    default: `Working assessment: {primary_dx}. Differentials include {differentials}. {severity_note}.`,
  },
  plan: {
    admission: `Admit to {ward_type} for {management}. Investigations: {investigations}. Review in {review_interval}.`,
    discharge: `Suitable for outpatient management. Prescribe {medications}. Advise return immediately if {red_flags}. Follow up in {follow_up}.`,
    referral: `Refer to {specialty} for further evaluation of {reason}. {urgency_note}.`,
  },
};

export class NarrativeEngine {
  private readonly llmAvailable: boolean;

  constructor(llmFallback = false) {
    this.llmAvailable = llmFallback;
  }

  generateNote(
    ctx: ClinicalContext,
    ddx: DiseaseScore[],
    explanations: DdxExplanation[],
    severity: SeverityScore
  ): ClinicalNarrative {
    const ageStr = this.formatAge(ctx.ageMonths);
    const sexStr = ctx.sex === 'male' ? 'boy' : ctx.sex === 'female' ? 'girl' : 'child';
    const symptomsStr = ctx.symptoms.map(s => s.replace(/_/g, ' ')).join(', ');
    const durationStr = String(ctx.durationDays || 7);

    const topDx = ddx.filter(d => d.score > 0).slice(0, 3);
    const primaryDx = topDx[0]?.name || 'Respiratory illness';

    const associated: string[] = [];
    if (ctx.answers['fever_present']) associated.push('associated fever');
    if (ctx.answers['wheeze_present']) associated.push('audible wheeze');
    if (ctx.answers['reduced_feeding']) associated.push('reduced feeding');
    if (ctx.answers['night_symptoms']) associated.push('nocturnal worsening');

    const pastHx: string[] = [];
    if (ctx.answers['recurrent_episodes']) pastHx.push('history of similar episodes');
    if (ctx.answers['previous_hospitalization']) pastHx.push('previous hospitalisation for respiratory illness');
    if (ctx.answers['asthma_history']) pastHx.push('history of wheeze/asthma');

    const riskFactorList: string[] = [];
    if (ctx.riskFactors.length > 0) riskFactorList.push(...ctx.riskFactors);
    if (ctx.answers['hiv_exposure']) riskFactorList.push('HIV exposure');
    if (ctx.answers['malnutrition_screen'] && ctx.answers['muac_value']?.toString().includes('Severe'))
      riskFactorList.push('severe acute malnutrition');

    const hpi = TEMPLATES.hpi.main
      .replace('{name}', ctx.patientName || 'This child')
      .replace('{age}', ageStr)
      .replace('{sex}', sexStr)
      .replace('{symptoms}', symptomsStr)
      .replace('{duration}', durationStr)
      .replace('{associated_features}', associated.length > 0 ? `Associated features: ${associated.join(', ')}.` : 'No significant associated features.')
      .replace('{past_history}', pastHx.length > 0 ? `Past history: ${pastHx.join('; ')}.` : 'No significant past respiratory history.')
      .replace('{risk_factors}', riskFactorList.length > 0 ? `Risk factors: ${riskFactorList.join(', ')}.` : 'No identified risk factors.');

    const severityNote = `Severity assessment: ${severity.level.toUpperCase()}. ${severity.redFlags.length > 0 ? `Red flags: ${severity.redFlags.join('; ')}.` : 'No red flags identified.'} ${severity.action}`;

    const assessmentKey = primaryDx.toLowerCase().includes('pneumonia') ? 'pneumonia_cap'
      : primaryDx.toLowerCase().includes('asthma') ? 'asthma'
      : primaryDx.toLowerCase().includes('bronchiolitis') ? 'bronchiolitis'
      : primaryDx.toLowerCase().includes('tb') || primaryDx.toLowerCase().includes('tuberculosis') ? 'tb'
      : 'default';

    let assessment = TEMPLATES.assessment[assessmentKey] || TEMPLATES.assessment.default;
    assessment = assessment
      .replace('{primary_dx}', primaryDx)
      .replace('{severity_note}', severityNote)
      .replace('{differentials}', topDx.slice(1).map(d => d.name).join(', '))
      .replace('{tb_features}', ctx.answers['weight_loss'] ? 'weight loss' : ctx.answers['night_sweats'] ? 'night sweats' : 'constitutional symptoms');

    const planSections: NarrativeSection[] = [];
    if (severity.level === 'critical' || severity.level === 'severe') {
      planSections.push({
        title: 'Admission Plan',
        content: `Admit to ${severity.level === 'critical' ? 'PICU/HDU' : 'ward'} for close monitoring and management of ${primaryDx}. ${severity.action}`,
      });
    } else {
      planSections.push({
        title: 'Management Plan',
        content: `Outpatient management of ${primaryDx}. ${severity.action}`,
      });
    }

    const dxLines = topDx.map((d, i) =>
      `${i + 1}. ${d.name} (${d.confidence.toUpperCase()} — Score: ${d.score})`
    ).join('\n');

    const explanationLines = explanations.map(e => {
      const supporting = e.supportingPoints.slice(0, 2).map(p => `  + ${p}`).join('\n');
      const against = e.againstPoints.slice(0, 1).map(p => `  - ${p}`).join('\n');
      return `${e.diseaseName}:\n${supporting}${against ? '\n' + against : ''}`;
    }).join('\n\n');

    planSections.push({
      title: 'Differential Diagnosis',
      content: dxLines + '\n\nReasoning:\n' + explanationLines,
    });

    const sections: NarrativeSection[] = [
      { title: 'History of Presenting Illness', content: hpi },
      {
        title: 'Vital Signs',
        structured: {
          'SpO2': ctx.vitals.spo2 !== undefined ? `${ctx.vitals.spo2}%` : 'Not recorded',
          'Respiratory Rate': ctx.vitals.rr !== undefined ? `${ctx.vitals.rr}/min` : 'Not recorded',
          'Heart Rate': ctx.vitals.hr !== undefined ? `${ctx.vitals.hr}/min` : 'Not recorded',
          'Temperature': ctx.vitals.temp !== undefined ? `${ctx.vitals.temp}°C` : 'Not recorded',
          'Weight': ctx.vitals.weight !== undefined ? `${ctx.vitals.weight}kg` : 'Not recorded',
          'MUAC': ctx.vitals.muac !== undefined ? `${ctx.vitals.muac}cm` : 'Not recorded',
        },
      },
      {
        title: 'Severity Assessment',
        content: `MEWS: ${severity.mews}/9 | qSOFA: ${severity.qsofa}/3 | SIRS: ${severity.sirs}/4\nLevel: ${severity.level.toUpperCase()}\nAction: ${severity.action}\n${severity.redFlags.length > 0 ? 'Red Flags:\n' + severity.redFlags.map(f => '  • ' + f).join('\n') : 'No red flags'}`,
      },
      { title: 'Assessment', content: assessment },
      ...planSections,
    ];

    return {
      title: `Clinical Note — ${primaryDx}`,
      sections,
      hpi,
      assessment,
      plan: planSections.map(s => s.content).join('\n\n'),
      timestamp: new Date().toISOString(),
    };
  }

  formatSoap(note: ClinicalNarrative): string {
    const line = '─'.repeat(60);
    const parts: string[] = [
      `AMEXAN Clinical Intelligence — ${note.title}`,
      line,
      '',
      'SUBJECTIVE (HPI)',
      note.hpi,
      '',
      'OBJECTIVE',
    ];

    const vitalsSection = note.sections.find(s => s.title === 'Vital Signs');
    if (vitalsSection?.structured) {
      Object.entries(vitalsSection.structured).forEach(([k, v]) => {
        parts.push(`  ${k}: ${v}`);
      });
    }

    const severitySection = note.sections.find(s => s.title === 'Severity Assessment');
    if (severitySection) {
      parts.push('');
      parts.push('SEVERITY');
      parts.push(severitySection.content ?? '');
    }

    parts.push('');
    parts.push('ASSESSMENT');
    parts.push(note.assessment);

    parts.push('');
    parts.push('PLAN');
    parts.push(note.plan);

    parts.push('');
    parts.push(line);
    parts.push(`Generated: ${note.timestamp}`);
    parts.push('AMEXAN Clinical Intelligence System v1.0');

    return parts.join('\n');
  }

  private formatAge(months: number): string {
    if (months < 1) return 'newborn';
    if (months < 24) return `${months}-month-old`;
    const years = Math.floor(months / 12);
    return `${years}-year-old`;
  }
}
