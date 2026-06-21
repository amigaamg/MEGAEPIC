'use client';
import { useMemo, useState, useCallback } from 'react';
import { useTheme } from '../../themes/ThemeProvider';
import { runInference } from '@/src/engine/inference/scorer';
import {
  COUGH_SOCRATES_FLOW, COUGH_DIFFERENTIALS,
  getTargetedRiskFactors, classifyCoughDuration, getAgeGroup,
  type TargetedRiskFactor
} from '@/src/engine/cough/coughClinicalProfile';
import type { PatientForm } from '@/src/types';
import type { DocumentEvent, AIInsight } from '@/lib/encounterTypes';

interface Props {
  form: PatientForm;
  setField: (p: string, v: any) => void;
  addEvent: (e: Partial<DocumentEvent>) => void;
  addInsight: (i: Partial<AIInsight>) => void;
  deptColor: string;
}

type SectionId = 
  | 'triage' | 'onset' | 'character' | 'sputum' | 'temporal' 
  | 'triggers' | 'associated_resp' | 'constitutional' | 'cardiovascular'
  | 'gi_ent_meds' | 'impact' | 'risk_factors' | 'prior_tx' | 'narrative';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: string;
  condition?: (form: PatientForm) => boolean;
}

const SECTIONS: SectionDef[] = [
  { id: 'triage', label: 'Triage & Red Flags', icon: '🚨' },
  { id: 'onset', label: 'Onset & Duration', icon: '🕐' },
  { id: 'character', label: 'Character of Cough', icon: '🔊' },
  { id: 'sputum', label: 'Sputum Characterisation', icon: '🫁' },
  { id: 'temporal', label: 'Temporal Pattern & Course', icon: '📈' },
  { id: 'triggers', label: 'Triggers & Relieving Factors', icon: '⚡' },
  { id: 'associated_resp', label: 'Associated Respiratory Symptoms', icon: '🫁' },
  { id: 'constitutional', label: 'Constitutional & Systemic', icon: '🌡️' },
  { id: 'cardiovascular', label: 'Cardiovascular Review', icon: '❤️' },
  { id: 'gi_ent_meds', label: 'GI, ENT & Medications', icon: '💊' },
  { id: 'impact', label: 'Impact on Daily Life', icon: '📊' },
  { id: 'risk_factors', label: 'Risk Factors (Targeted)', icon: '🎯' },
  { id: 'prior_tx', label: 'Prior Treatment & Healthcare', icon: '💊' },
  { id: 'narrative', label: 'HPI Narrative Summary', icon: '📝' },
];

function getAgeInMonths(form: PatientForm): number {
  return parseInt(form.biodata.ageMonths) || 0;
}

function getAgeDisplay(form: PatientForm): string {
  const mo = getAgeInMonths(form);
  if (mo === 0) return 'a newborn';
  if (mo < 12) return `a ${mo}-month-old`;
  const yr = Math.floor(mo / 12), rem = mo % 12;
  return rem === 0 ? `a ${yr}-year-old` : `a ${yr}-year, ${rem}-month-old`;
}

function getSexDisplay(form: PatientForm): string {
  return form.biodata.sex || 'unknown';
}

export function AdaptiveHpiPhase({ form, setField, addEvent, addInsight, deptColor }: Props) {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<SectionId>('triage');
  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(new Set());
  const [showRiskFactors, setShowRiskFactors] = useState(false);

  const ageMonths = getAgeInMonths(form);
  const ageGroup = getAgeGroup(ageMonths);
  const sex = getSexDisplay(form);
  const isChild = ageGroup === 'neonatal' || ageGroup === 'infant' || ageGroup === 'toddler' || ageGroup === 'child';

  const differentials = useMemo(() => {
    try { return runInference(form); } catch { return []; }
  }, [form]);

  const topDifferentialIds = useMemo(() => {
    return differentials.slice(0, 5).map(d => {
      const match = COUGH_DIFFERENTIALS.find(cd => d.disease.name.toLowerCase().includes(cd.name.toLowerCase()));
      return match ? match.id : null;
    }).filter(Boolean) as string[];
  }, [differentials]);

  const targetedRiskFactors = useMemo(() => {
    return getTargetedRiskFactors(topDifferentialIds.length > 0 ? topDifferentialIds : 
      ['community_acquired_pneumonia', 'tuberculosis', 'bronchial_asthma']);
  }, [topDifferentialIds]);

  const markSectionComplete = useCallback((id: SectionId) => {
    setCompletedSections(prev => new Set(prev).add(id));
    const idx = SECTIONS.findIndex(s => s.id === id);
    const nextSection = SECTIONS.slice(idx + 1).find(s => {
      if (s.id === 'risk_factors' && targetedRiskFactors.length === 0) return false;
      return !completedSections.has(s.id);
    });
    if (nextSection) {
      setActiveSection(nextSection.id);
    }
  }, [completedSections, targetedRiskFactors]);

  const handleField = useCallback((path: string, value: any, eventDesc?: string) => {
    setField(path, value);
    if (eventDesc) addEvent({ type: 'hpi_entered', description: eventDesc });
  }, [setField, addEvent]);

  const hpi = form.hpi as any;

  const redFlags = useMemo(() => {
    const flags: { sign: string; severity: 'critical' | 'high' | 'moderate' }[] = [];
    if (form.vitals.examStridor) flags.push({ sign: 'Stridor at rest — impending airway obstruction', severity: 'critical' });
    if (form.vitals.examIndrawing) flags.push({ sign: 'Chest indrawing — severe respiratory distress', severity: 'high' });
    if (form.vitals.examGrunting) flags.push({ sign: 'Grunting — severe respiratory distress', severity: 'high' });
    if (form.vitals.examNasalFlaring) flags.push({ sign: 'Nasal flaring — respiratory distress', severity: 'high' });
    if (hpi.cyanoticEpisodes) flags.push({ sign: 'Cyanotic episodes — severe hypoxia', severity: 'critical' });
    if (hpi.hemoptysis && hpi.hemoptysisVolume === 'massive') flags.push({ sign: 'Massive haemoptysis — airway emergency', severity: 'critical' });
    if (hpi.associatedOrthopnea) flags.push({ sign: 'Orthopnoea — possible heart failure', severity: 'high' });
    if (hpi.associatedPND) flags.push({ sign: 'Paroxysmal Nocturnal Dyspnoea — possible heart failure', severity: 'high' });
    if (hpi.suddenOnset && hpi.unilateralWheeze) flags.push({ sign: 'Sudden onset + unilateral wheeze — foreign body aspiration', severity: 'high' });
    if (hpi.associatedWeightLoss && hpi.associatedNightSweats) flags.push({ sign: 'Weight loss + night sweats — rule out TB', severity: 'high' });
    if (hpi.hemoptysis && hpi.riskSmoking) flags.push({ sign: 'Haemoptysis in a smoker >40 years — rule out lung cancer', severity: 'high' });
    if (hpi.pertussisContact && !hpi.suddenOnset) flags.push({ sign: 'Pertussis contact with paroxysmal cough', severity: 'moderate' });
    if (form.vitals.examStridor && hpi.drooling && hpi.tripodPosition) flags.push({ sign: 'Drooling + tripod positioning — suspect epiglottitis', severity: 'critical' });
    return flags;
  }, [form, hpi]);

  const duration = classifyCoughDuration(parseInt(String(hpi.coughDuration || hpi.durationDays || '0')));

  const hpiNarrative = useMemo(() => {
    const parts: string[] = [];
    const ageText = getAgeDisplay(form);
    const sexText = getSexDisplay(form);
    const dur = hpi.durationDays || hpi.coughDuration || 'several';

    const coughChar = hpi.coughChar || '';
    let charDesc = '';
    if (coughChar.includes('Dry')) charDesc = 'non-productive (dry)';
    else if (coughChar.includes('Productive')) charDesc = 'productive';
    else if (coughChar.includes('Barking')) charDesc = 'barking (seal-like)';
    else if (coughChar.includes('Paroxysmal')) charDesc = 'paroxysmal';
    else if (coughChar.includes('Honking')) charDesc = 'honking';

    if (hpi.onset && hpi.onset.startsWith('S')) {
      parts.push(`${ageText}${sexText !== 'unknown' ? ` ${sexText}` : ''} presents with a${charDesc ? ` ${charDesc}` : ''} cough of ${dur} days' duration. The cough began suddenly`);
      if (hpi.associatedCyanosis && hpi.suddenOnset) parts[parts.length - 1] += ' with an episode of cyanosis';
      parts[parts.length - 1] += '.';
    } else if (hpi.onset && hpi.onset.startsWith('G')) {
      parts.push(`${ageText}${sexText !== 'unknown' ? ` ${sexText}` : ''} presents with a${charDesc ? ` ${charDesc}` : ''} cough that developed gradually over ${dur} days.`);
    } else if (hpi.onset && hpi.onset.startsWith('I')) {
      parts.push(`${ageText}${sexText !== 'unknown' ? ` ${sexText}` : ''} presents with an insidious${charDesc ? ` ${charDesc}` : ''} cough that has been present for ${dur} days.`);
    } else {
      parts.push(`${ageText}${sexText !== 'unknown' ? ` ${sexText}` : ''} presents with a${charDesc ? ` ${charDesc}` : ''} cough of ${dur} days' duration.`);
    }

    if (hpi.progression === 'Worsening') parts.push(' The cough has been progressively worsening since onset.');
    else if (hpi.progression === 'Improving') parts.push(' The cough has been improving since onset.');
    else if (hpi.progression === 'Static') parts.push(' The cough has remained unchanged since onset.');
    else if (hpi.progression === 'Fluctuating') parts.push(' The cough has been fluctuating in severity.');

    if (hpi.productive && hpi.sputumColor && hpi.sputumColor !== 'none') {
      const colorMap: Record<string, string> = {
        'Clear or white (mucoid)': 'clear/white mucoid',
        'Yellow or green (purulent)': 'yellow/green purulent',
        'Rusty-coloured': 'rusty-coloured',
        'Blood-stained': 'blood-stained',
        'Frothy pink': 'frothy pink',
        'Foul-smelling / Putrid': 'foul-smelling putrid',
      };
      const amount = hpi.sputumAmount || '';
      const amtDesc = amount.includes('Small') ? 'scanty' : amount.includes('Moderate') ? 'moderate' : amount.includes('Large') ? 'copious' : '';
      parts.push(` The sputum is ${colorMap[hpi.sputumColor] || hpi.sputumColor} in character${amtDesc ? ` and ${amtDesc} in volume` : ''}.`);
    }
    if (hpi.hemoptysis) {
      const vol = hpi.hemoptysisVolume || '';
      if (vol.includes('Blood-streaked')) parts.push(' There is blood-streaking of the sputum.');
      else if (vol.includes('Frank')) parts.push(' There is frank haemoptysis (teaspoonfuls of blood).');
      else if (vol.includes('Massive')) parts.push(' There is MASSIVE haemoptysis (>200 mL) — this is an airway emergency.');
      else parts.push(' There is haemoptysis.');
    }

    if (hpi.coughTiming) {
      const timingMap: Record<string, string> = {
        'Morning only': ' The cough is most prominent in the mornings.',
        'Night-time / Nocturnal': ' The cough is predominantly nocturnal.',
        'Throughout the day': ' The cough occurs throughout the day.',
        'After meals': ' The cough occurs predominantly after meals.',
        'With exercise only': ' The cough is exclusively exercise-induced.',
        'No particular pattern': ' There is no clear temporal pattern to the cough.',
      };
      parts.push(timingMap[hpi.coughTiming] || '');
    }

    if (Array.isArray(hpi.triggers) && hpi.triggers.length > 0) {
      parts.push(` Exacerbating factors include ${hpi.triggers.join(', ')}.`);
    }

    const respParts: string[] = [];
    if (hpi.associatedDyspnea) {
      const dyspMap: Record<string, string> = {
        'Only with heavy exertion': 'dyspnoea on heavy exertion (MRC 2)',
        'With moderate activity (climbing stairs)': 'dyspnoea on moderate exertion (MRC 3)',
        'With minimal activity (walking to toilet)': 'dyspnoea on minimal exertion (MRC 4)',
        'At rest': 'dyspnoea at rest (MRC 5)',
        'Unable to speak full sentences': 'dyspnoea causing inability to speak in full sentences',
      };
      respParts.push(dyspMap[hpi.dyspneaSeverity] || 'dyspnoea');
    }
    if (hpi.associatedWheeze) respParts.push('audible wheezing');
    if (hpi.associatedChestPain) {
      const cpMap: Record<string, string> = {
        'Sharp / pleuritic (worse with breathing)': 'pleuritic chest pain',
        'Dull / aching': 'dull chest ache',
        'Crushing / squeezing': 'crushing retrosternal chest pain',
        'Burning / retrosternal': 'retrosternal burning chest pain',
      };
      respParts.push(cpMap[hpi.chestPainType] || 'chest pain');
    }
    if (hpi.associatedCyanosis) respParts.push('episodes of cyanosis');
    if (respParts.length > 0) {
      const last = respParts.pop();
      parts.push(` Associated respiratory symptoms include ${respParts.length > 0 ? respParts.join(', ') + ' and ' : ''}${last}.`);
    }

    if (hpi.associatedFever) parts.push(` The illness is associated with fever (${hpi.feverPattern || 'pattern not specified'}).`);
    if (hpi.associatedWeightLoss && hpi.associatedNightSweats) parts.push(' There has been unintentional weight loss accompanied by drenching night sweats — these combined symptoms are concerning for tuberculosis or malignancy.');
    else if (hpi.associatedWeightLoss) parts.push(' There has been unintentional weight loss.');
    else if (hpi.associatedNightSweats) parts.push(' Drenching night sweats are reported.');

    if (hpi.associatedOrthopnea && hpi.associatedPND) parts.push(' The patient reports both orthopnoea and paroxysmal nocturnal dyspnoea, raising concern for heart failure.');
    else if (hpi.associatedOrthopnea) parts.push(' Orthopnoea is present.');
    else if (hpi.associatedPND) parts.push(' Paroxysmal nocturnal dyspnoea is reported.');
    if (hpi.associatedLegSwelling) parts.push(' Bilateral lower extremity oedema is noted.');

    if (hpi.associatedHeartburn) {
      parts.push(' The patient reports heartburn and acid reflux');
      if (hpi.associatedRegurgitation) parts[parts.length - 1] += ' with regurgitation';
      parts[parts.length - 1] += '.';
    }
    if (hpi.associatedHoarseness) parts.push(' Hoarseness of voice is reported.');
    if (hpi.associatedDysphagia) parts.push(' There is difficulty swallowing.');
    if (hpi.postNasalDrip) parts.push(' The patient reports a sensation of post-nasal drip with frequent throat clearing.');
    if (hpi.nasalCongestion && !hpi.postNasalDrip) parts.push(' Nasal congestion is present.');
    if (hpi.medicationACEI) parts.push(' The patient is on an ACE inhibitor — this is a recognised cause of chronic cough.');

    if (hpi.impactSleep && hpi.impactSleep !== 'no_affect') {
      const slpMap: Record<string, string> = {
        'Wakes me occasionally': 'Sleep is occasionally disturbed by the cough',
        'Wakes me frequently': 'Sleep is frequently disturbed by the cough',
        'Cannot sleep due to cough': 'Sleep is severely disrupted by the cough',
      };
      parts.push(` ${slpMap[hpi.impactSleep] || ''}.`);
    }
    if (hpi.impactDaily && hpi.impactDaily !== 'No limitation') {
      parts.push(` The cough causes ${hpi.impactDaily.toLowerCase()} in daily activities.`);
    }
    if (hpi.severity) parts.push(` The patient rates cough severity as ${hpi.severity} out of 10.`);

    return parts.join('');
  }, [form]);

  const s = {
    header: { fontSize: '1.125rem', fontWeight: 600, color: theme.colors.text, marginBottom: 4 },
    sub: { fontSize: '.8125rem', color: theme.colors.textMuted, marginBottom: 20 },
    card: { background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    cardAlt: { background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    label: { fontSize: '.6875rem', fontWeight: 600, color: theme.colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '.08em' as const, marginBottom: 8 },
    labelSection: { fontSize: '.8125rem', fontWeight: 600, color: theme.colors.text, marginBottom: 4 },
    text: { fontSize: '.8125rem', color: theme.colors.text, lineHeight: 1.6, fontWeight: 400 },
    muted: { fontSize: '.75rem', color: theme.colors.textMuted, lineHeight: 1.5 },
    inp: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.bg, color: theme.colors.text, fontSize: '.875rem', outline: 'none', fontFamily: theme.typography.font, boxSizing: 'border-box' as const },
    textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.bg, color: theme.colors.text, fontSize: '.875rem', outline: 'none', fontFamily: theme.typography.font, boxSizing: 'border-box' as const, minHeight: 80, resize: 'vertical' as const },
    chip: { display: 'inline-flex' as const, alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 100, fontSize: '.75rem', border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.textSub, cursor: 'pointer', margin: '0 4px 6px 0', transition: 'all .12s', fontFamily: theme.typography.font, fontWeight: 500 },
    chipActive: { border: 'none', background: `${deptColor}20`, color: deptColor, fontWeight: 600 } as React.CSSProperties,
    dangerCard: { border: `1px solid ${theme.colors.danger}40`, background: theme.colors.dangerBg } as React.CSSProperties,
    dangerLabel: { color: theme.colors.danger, fontSize: '.6875rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.08em' as const, marginBottom: 8 },
    dangerText: { fontSize: '.8125rem', color: theme.colors.danger, lineHeight: 1.5 },
    guide: { fontSize: '.6875rem', color: theme.colors.textMuted, fontStyle: 'italic', marginTop: 4, lineHeight: 1.4 },
    sectionBtn: { padding: '10px 16px', borderRadius: 8, cursor: 'pointer', background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.textSub, fontSize: '.8125rem', fontWeight: 500, fontFamily: theme.typography.font, textAlign: 'left' as const, width: '100%', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .12s' },
    sectionBtnActive: { background: `${deptColor}15`, borderColor: deptColor, color: deptColor, fontWeight: 600 },
    sectionBtnComplete: { borderColor: theme.colors.success, color: theme.colors.success },
    btnPrimary: { padding: '8px 20px', borderRadius: 8, border: 'none', background: deptColor, color: '#fff', fontSize: '.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: theme.typography.font },
    btnGhost: { padding: '8px 16px', borderRadius: 8, border: `1px solid ${theme.colors.border}`, background: 'transparent', color: theme.colors.textSub, fontSize: '.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: theme.typography.font },
    subtleCard: { background: theme.colors.bg, border: `1px solid ${theme.colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
  };

  const renderSelectChips = useCallback((field: string, options: string[], currentValue: any, guide?: string) => {
    const isActive = (opt: string) => {
      if (typeof currentValue === 'string') return currentValue === opt.toLowerCase();
      if (Array.isArray(currentValue)) return currentValue.includes(opt.toLowerCase());
      return false;
    };
    return (
      <div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {options.map(opt => (
            <button key={opt} onClick={() => handleField(field, isActive(opt) ? '' : opt.toLowerCase(), `Cough: ${field} = ${opt}`)}
              style={{ ...s.chip, ...(isActive(opt) ? s.chipActive : {}) }}>{opt}</button>
          ))}
        </div>
        {guide && <div style={s.guide}>{guide}</div>}
      </div>
    );
  }, [handleField, s]);

  const renderBooleanChip = useCallback((field: string, currentValue: any, labelTrue: string, labelFalse: string, guide?: string) => {
    return (
      <div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => handleField(field, currentValue === true ? undefined : true, `Cough: ${field} = Yes`)}
            style={{ ...s.chip, ...(currentValue === true ? { background: `${deptColor}20`, borderColor: deptColor, color: deptColor, fontWeight: 600 } : {}) }}>{labelTrue}</button>
          <button onClick={() => handleField(field, currentValue === false ? undefined : false, `Cough: ${field} = No`)}
            style={{ ...s.chip, ...(currentValue === false ? { background: '#ef444420', borderColor: '#ef4444', color: '#ef4444', fontWeight: 600 } : {}) }}>{labelFalse}</button>
        </div>
        {guide && <div style={s.guide}>{guide}</div>}
      </div>
    );
  }, [handleField, s]);

  const renderMultiSelectChips = useCallback((field: string, options: string[], currentValue: any, guide?: string) => {
    const selected: string[] = Array.isArray(currentValue) ? currentValue : [];
    const toggle = (opt: string) => {
      const next = selected.includes(opt.toLowerCase())
        ? selected.filter(x => x !== opt.toLowerCase())
        : [...selected, opt.toLowerCase()];
      handleField(field, next, `Cough: ${field} toggled ${opt}`);
    };
    return (
      <div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {options.map(opt => (
            <button key={opt} onClick={() => toggle(opt)}
              style={{ ...s.chip, ...(selected.includes(opt.toLowerCase()) ? s.chipActive : {}) }}>{opt}</button>
          ))}
        </div>
        {guide && <div style={s.guide}>{guide}</div>}
      </div>
    );
  }, [handleField, s]);

  const renderSectionNavigation = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 20 }}>
      {SECTIONS.map(section => {
        const isActive = activeSection === section.id;
        const isCompleted = completedSections.has(section.id);
        const isDisabled = false;
        if (section.id === 'risk_factors' && targetedRiskFactors.length === 0 && !isCompleted) return null;
        return (
          <button key={section.id} onClick={() => setActiveSection(section.id)}
            style={{
              ...s.sectionBtn, width: 'auto', fontSize: '.6875rem', padding: '6px 12px',
              ...(isActive ? s.sectionBtnActive : {}),
              ...(isCompleted ? { borderColor: theme.colors.success, color: theme.colors.success } : {}),
              opacity: isDisabled ? 0.4 : 1,
            }}>
            <span>{isCompleted ? '✓' : section.icon}</span>
            <span>{section.label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderTriageSection = () => (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={s.labelSection}>Triage Assessment & Red Flags</div>
          <div style={s.muted}>Patient: {getAgeDisplay(form)}, {sex}. Cough classified as <strong>{duration}</strong> duration.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { markSectionComplete('triage'); addEvent({ type: 'hpi_entered', description: 'Triage section completed' }); }}
            style={s.btnPrimary}>✓ Complete Section</button>
        </div>
      </div>

      {redFlags.length > 0 && (
        <div style={{ ...s.cardAlt, ...s.dangerCard, marginBottom: 16 }}>
          <div style={s.dangerLabel}>Red Flags Detected</div>
          {redFlags.map((rf, i) => (
            <div key={i} style={{ ...s.dangerText, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ flexShrink: 0, width: 60, padding: '1px 6px', borderRadius: 4, fontSize: '.625rem', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase',
                background: rf.severity === 'critical' ? theme.colors.dangerBg : rf.severity === 'high' ? theme.colors.warnBg : theme.colors.successBg,
                color: rf.severity === 'critical' ? theme.colors.danger : rf.severity === 'high' ? theme.colors.warn : theme.colors.success }}>
                {rf.severity}
              </span>
              <span>{rf.sign}</span>
            </div>
          ))}
        </div>
      )}

      {redFlags.length === 0 && (
        <div style={{ ...s.subtleCard, textAlign: 'center', padding: '24px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
          <div style={s.muted}>No red flags detected based on available information.</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
        <div>
          <div style={s.label}>Age Group</div>
          <div style={{ fontSize: '.875rem', color: theme.colors.text, fontWeight: 500 }}>
            {ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1)} ({ageMonths} months)
          </div>
        </div>
        <div>
          <div style={s.label}>Presenting Complaint</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(form.complaints || []).map((c: string) => (
              <span key={c} style={{ padding: '2px 10px', borderRadius: 100, fontSize: '.6875rem', background: `${deptColor}15`, color: deptColor, fontWeight: 500 }}>{c.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      </div>

      {isChild && (
        <div style={{ ...s.subtleCard, marginTop: 12, borderLeft: `3px solid ${theme.colors.warn}` }}>
          <div style={{ fontSize: '.75rem', fontWeight: 600, color: theme.colors.warn, marginBottom: 4 }}>Pediatric-Specific Considerations</div>
          <div style={s.muted}>
            Assess for: chest indrawing, grunting, nasal flaring, head nodding (severe respiratory distress).
            In infants under 3 months: fever may be absent. Apnoea may be presenting sign.
            Check immunization status (pertussis, Hib, pneumococcal).
            Feeding assessment is critical — reduced feeding indicates severity.
          </div>
        </div>
      )}

      {ageGroup === 'elderly' && (
        <div style={{ ...s.subtleCard, marginTop: 12, borderLeft: `3px solid ${theme.colors.warn}` }}>
          <div style={{ fontSize: '.75rem', fontWeight: 600, color: theme.colors.warn, marginBottom: 4 }}>Geriatric-Specific Considerations</div>
          <div style={s.muted}>
            Elderly patients may present with atypical symptoms: confusion, falls, reduced mobility instead of fever and cough.
            Atypical pneumonia (Mycoplasma, Chlamydia) more common. Aspiration pneumonia risk increased.
            Polypharmacy assessment needed. Consider heart failure as cause of cough.
          </div>
        </div>
      )}
    </div>
  );

  const isSectionVisible = useCallback((section: typeof COUGH_SOCRATES_FLOW[0]) => {
    if (!section.condition) return true;
    const condFieldValue = (form as any).hpi?.[section.condition.field];
    const cv = typeof condFieldValue === 'string' ? condFieldValue.toLowerCase() : condFieldValue;
    if (typeof section.condition.value === 'boolean') return cv === section.condition.value;
    if (typeof section.condition.value === 'string') return cv === section.condition.value.toLowerCase();
    return !!cv;
  }, [form]);

  const renderQuestionSection = (sectionId: SectionId) => {
    const socratesSection = COUGH_SOCRATES_FLOW.find(sf => {
      const slug = sf.section.toLowerCase().replace(/[\s&]+/g, '_').replace(/[^a-z_]/g, '');
      const sectionSlug = sectionId.replace(/_/g, '');
      return slug.includes(sectionSlug) || sectionSlug.includes(slug);
    });

    if (!socratesSection || !isSectionVisible(socratesSection)) {
      return (
        <div style={s.card}>
          <div style={s.labelSection}>⏳ Section Unavailable</div>
          <div style={s.muted}>This section depends on answers from previous sections. Please complete the earlier questions first.</div>
        </div>
      );
    }

    const questions = socratesSection.questions || [];

    return (
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={s.labelSection}>
              {SECTIONS.find(s => s.id === sectionId)?.icon} {SECTIONS.find(s => s.id === sectionId)?.label}
            </div>
            <div style={s.muted}>
              {sectionId === 'character' && 'Determine the nature and quality of the cough to narrow the differential'}
              {sectionId === 'sputum' && 'Characterise sputum to identify likely pathogens and underlying pathology'}
              {sectionId === 'onset' && 'Establish timeline — acute vs chronic duration is the most important branching point'}
              {sectionId === 'temporal' && 'Pattern over time and relationship to activities of daily living'}
              {sectionId === 'triggers' && 'Identify provoking and relieving factors that point to specific diagnoses'}
              {sectionId === 'associated_resp' && 'Evaluate for associated respiratory symptoms that localise and characterise the disease'}
              {sectionId === 'constitutional' && 'Constitutional symptoms are key to distinguishing infectious, malignant, and inflammatory causes'}
              {sectionId === 'cardiovascular' && 'Cardiac causes of cough must not be missed, especially in older adults'}
              {sectionId === 'gi_ent_meds' && 'GI reflux and ENT conditions are common causes of chronic cough. ACE inhibitors are a frequently missed cause.'}
              {sectionId === 'impact' && 'Assess functional impact to determine severity and urgency of intervention'}
            </div>
          </div>
          <button onClick={() => markSectionComplete(sectionId)} style={s.btnPrimary}>✓ Complete</button>
        </div>

        {questions.map((q: any) => {
          const currentValue = (form as any).hpi?.[q.field];
          if (q.condition) {
            const conditionField = q.condition.field || q.condition;
            const condFieldValue = (form as any).hpi?.[conditionField];
            const cv = typeof condFieldValue === 'string' ? condFieldValue.toLowerCase() : condFieldValue;
            if (q.condition.values && Array.isArray(q.condition.values)) {
              const matched = q.condition.values.some((v: string) => v.toLowerCase() === cv);
              if (!matched) return null;
            } else if (q.condition.value !== undefined) {
              if (cv !== q.condition.value) return null;
            } else if (!cv && cv !== false) return null;
          }

          return (
            <div key={q.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${theme.colors.border}` }}>
              <div style={s.label}>{q.label}</div>
              {q.type === 'select' && renderSelectChips(`hpi.${q.field}`, q.options, currentValue, q.clinicalGuide)}
              {q.type === 'boolean' && renderBooleanChip(`hpi.${q.field}`, currentValue, 'Yes', 'No', q.clinicalGuide)}
              {q.type === 'multi_select' && renderMultiSelectChips(`hpi.${q.field}`, q.options, currentValue, q.clinicalGuide)}
              {q.type === 'number' && (
                <div>
                  <input type="number" style={s.inp} value={currentValue || ''}
                    onChange={e => handleField(`hpi.${q.field}`, e.target.value, `Cough: ${q.field} = ${e.target.value}`)}
                    placeholder={q.clinicalGuide || 'Enter value'} />
                  {q.clinicalGuide && <div style={s.guide}>{q.clinicalGuide}</div>}
                </div>
              )}
              {q.type === 'text' && (
                <div>
                  <input style={s.inp} value={currentValue || ''}
                    onChange={e => handleField(`hpi.${q.field}`, e.target.value, `Cough: ${q.field} = ${e.target.value}`)}
                    placeholder={q.clinicalGuide || 'Enter details'} />
                  {q.clinicalGuide && <div style={s.guide}>{q.clinicalGuide}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRiskFactorsSection = () => {
    if (targetedRiskFactors.length === 0) {
      return (
        <div style={s.card}>
          <div style={s.labelSection}>🎯 Targeted Risk Factors</div>
          <div style={s.muted}>Answer the SOCRATES questions above first to characterise the cough. The system will then suggest relevant risk factors based on the most likely differentials.</div>
        </div>
      );
    }

    const topDiffs = differentials.slice(0, 5);

    return (
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={s.labelSection}>🎯 Targeted Risk Factors</div>
            <div style={s.muted}>
              Based on the top differentials, the following risk factors are most relevant. 
              Questions are shown only for the most likely diagnoses.
            </div>
          </div>
          <button onClick={() => markSectionComplete('risk_factors')} style={s.btnPrimary}>✓ Complete</button>
        </div>

        {topDiffs.length > 0 && (
          <div style={{ ...s.subtleCard, marginBottom: 16 }}>
            <div style={s.label}>Why these risk factors?</div>
            <div style={s.muted}>
              Based on your answers, the most likely causes of cough are:
              {topDiffs.slice(0, 3).map((d, i) => (
                <span key={d.disease.id}> {i === 0 ? '' : i === 1 ? '; ' : '; and '}<strong>{d.disease.name}</strong></span>
              ))}.
              The risk factor questions below are targeted to confirm or refute these specific diagnoses.
            </div>
          </div>
        )}

        {targetedRiskFactors.map((rf: TargetedRiskFactor) => {
          const currentValue = (form as any).hpi?.[rf.field];
          return (
            <div key={rf.id} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${theme.colors.border}` }}>
              <div style={s.label}>{rf.label}</div>
              {rf.type === 'boolean' && renderBooleanChip(`hpi.${rf.field}`, currentValue, 'Yes', 'No', rf.clinicalGuide)}
              {rf.type === 'select' && rf.options && renderSelectChips(`hpi.${rf.field}`, rf.options, currentValue, rf.clinicalGuide)}
              {rf.type === 'text' && (
                <div>
                  <input style={s.inp} value={currentValue || ''}
                    onChange={e => handleField(`hpi.${rf.field}`, e.target.value)}
                    placeholder={rf.clinicalGuide} />
                  <div style={s.guide}>{rf.clinicalGuide}</div>
                </div>
              )}
              <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {rf.relevantDifferentials.map(did => {
                  const d = COUGH_DIFFERENTIALS.find(cd => cd.id === did);
                  return d ? <span key={did} style={{ padding: '1px 8px', borderRadius: 4, fontSize: '.625rem', background: `${deptColor}10`, color: deptColor }}>{d.name}</span> : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPriorTxSection = () => (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={s.labelSection}>💊 Prior Treatment & Healthcare Utilisation</div>
          <div style={s.muted}>Document prior consultations, treatments tried, and response — this informs resistance patterns and treatment escalation</div>
        </div>
        <button onClick={() => markSectionComplete('prior_tx')} style={s.btnPrimary}>✓ Complete</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={s.label}>Previous Consultations</div>
          <input style={s.inp} placeholder="e.g. GP, pharmacist, traditional healer, hospital" value={hpi.seenByAnyone || ''}
            onChange={e => handleField('hpi.seenByAnyone', e.target.value, `Prior consult: ${e.target.value}`)} />
        </div>
        <div>
          <div style={s.label}>Treatments Received</div>
          <input style={s.inp} placeholder="e.g. Amoxicillin, salbutamol, cough syrup" value={hpi.prevTx || ''}
            onChange={e => handleField('hpi.prevTx', e.target.value, `Prior treatment: ${e.target.value}`)} />
        </div>
      </div>
      <div>
        <div style={s.label}>Response to Treatment</div>
        {renderSelectChips('hpi.txResponse', ['Good improvement', 'Partial improvement', 'No improvement', 'Worsened', 'Not applicable'], hpi.txResponse)}
        <div style={s.guide}>Response to bronchodilators suggests asthma. Partial response to antibiotics suggests TB or viral infection. No response to PPI suggests non-GERD cause.</div>
      </div>
    </div>
  );

  const renderNarrativeSection = () => {

    return (
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={s.labelSection}>📝 HPI Narrative Summary</div>
            <div style={s.muted}>AI-generated summary of the history of presenting complaint</div>
          </div>
          <button onClick={() => markSectionComplete('narrative')} style={s.btnPrimary}>✓ Complete</button>
        </div>

        <div style={{ ...s.subtleCard, background: `${deptColor}08`, borderLeft: `3px solid ${deptColor}` }}>
          <div style={s.text}>{hpiNarrative}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={s.label}>Additional Narrative</div>
          <textarea style={s.textarea} value={hpi.associated || ''}
            onChange={e => handleField('hpi.associated', e.target.value)}
            placeholder="Add any additional context: prior similar episodes, family history of similar illness, social circumstances, concerns ..." />
        </div>
      </div>
    );
  };

  const renderDDXPanel = () => (
    <div style={s.card}>
      <div style={s.labelSection}>🧠 Real-Time Differential Diagnosis</div>
      <div style={s.muted}>Differential probabilities update as you answer questions</div>

      {differentials.length === 0 ? (
        <div style={{ ...s.subtleCard, marginTop: 12, textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🩺</div>
          <div style={s.muted}>Begin the history-taking above. The differential diagnosis will update in real time as you provide information.</div>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {differentials.slice(0, 7).map((d, i) => {
            const barWidth = Math.round((d.probability || 0) * 100);
            const isMustNotMiss = COUGH_DIFFERENTIALS.find(cd => d.disease.name.toLowerCase().includes(cd.name.toLowerCase()) && cd.mustNotMiss);
            return (
              <div key={d.disease.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 6 ? `1px solid ${theme.colors.border}` : 'none' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.625rem', fontWeight: 700, background: i === 0 ? deptColor : theme.colors.surfaceAlt, color: i === 0 ? '#fff' : theme.colors.textMuted }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.8125rem', color: theme.colors.text, fontWeight: i < 3 ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {d.disease.name}
                    {isMustNotMiss && <span style={{ fontSize: '.5625rem', padding: '1px 5px', borderRadius: 3, background: theme.colors.dangerBg, color: theme.colors.danger, fontWeight: 700 }}>MUST NOT MISS</span>}
                  </div>
                </div>
                <div style={{ width: 80, height: 6, borderRadius: 3, background: theme.colors.surfaceAlt, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${barWidth}%`, height: '100%', borderRadius: 3,
                    background: i === 0 ? deptColor : barWidth > 30 ? theme.colors.accent : theme.colors.textMuted, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: '.6875rem', fontWeight: 700, color: deptColor, minWidth: 36, textAlign: 'right', fontFamily: theme.typography.mono, flexShrink: 0 }}>
                  {barWidth}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {topDifferentialIds.length > 0 && (() => {
        const invOrder: { id: string; tests: { name: string; rationale: string; priority: string }[] }[] = [
          { id: 'community_acquired_pneumonia', tests: [
            { name: 'Chest X-ray (PA view)', rationale: 'Confirm or exclude consolidation', priority: 'First-line' },
            { name: 'FBC + CRP', rationale: 'Leukocytosis and elevated CRP support bacterial aetiology', priority: 'First-line' },
            { name: 'Sputum culture', rationale: 'Identify pathogen and antibiotic sensitivities', priority: 'If sputum available' },
          ]},
          { id: 'tuberculosis', tests: [
            { name: 'GeneXpert MTB/RIF on sputum', rationale: 'Molecular detection + rifampicin resistance', priority: 'First-line' },
            { name: 'Chest X-ray (PA)', rationale: 'Upper lobe infiltrates, cavitation, hilar lymphadenopathy', priority: 'First-line' },
            { name: 'HIV test', rationale: 'HIV is the strongest risk factor for TB', priority: 'Essential' },
          ]},
          { id: 'bronchial_asthma', tests: [
            { name: 'Spirometry with bronchodilator reversibility', rationale: 'Confirm reversible airway obstruction', priority: 'First-line' },
            { name: 'Peak expiratory flow monitoring', rationale: 'Assess severity and response to treatment', priority: 'Bedside' },
          ]},
          { id: 'bronchiolitis', tests: [
            { name: 'RSV nasopharyngeal swab/PCR', rationale: 'Confirm RSV aetiology', priority: 'First-line' },
            { name: 'Chest X-ray', rationale: 'Only if severe, asymmetric, or diagnostic uncertainty', priority: 'Selective' },
          ]},
          { id: 'heart_failure', tests: [
            { name: 'BNP or NT-proBNP', rationale: 'Elevated in heart failure; rule-out threshold <100 pg/mL', priority: 'First-line' },
            { name: 'Echocardiogram', rationale: 'Assess LVEF, wall motion, valvular function', priority: 'Essential' },
          ]},
          { id: 'lung_cancer', tests: [
            { name: 'CT chest with contrast', rationale: 'Characterise pulmonary lesion and mediastinal involvement', priority: 'First-line' },
            { name: 'Bronchoscopy with biopsy', rationale: 'Tissue diagnosis and molecular testing', priority: 'Essential' },
          ]},
          { id: 'whooping_cough_pertussis', tests: [
            { name: 'Pertussis PCR on nasopharyngeal swab', rationale: 'Confirm B. pertussis infection', priority: 'First-line' },
            { name: 'CBC with differential', rationale: 'Lymphocytosis is characteristic', priority: 'Supportive' },
          ]},
          { id: 'pulmonary_embolism', tests: [
            { name: 'D-dimer', rationale: 'Rule-out if low/intermediate Wells probability', priority: 'First-line' },
            { name: 'CT pulmonary angiogram (CTPA)', rationale: 'Gold standard for confirmation', priority: 'Definitive' },
          ]},
          { id: 'foreign_body_aspiration', tests: [
            { name: 'Chest X-ray inspiratory + expiratory', rationale: 'Air trapping, mediastinal shift', priority: 'First-line' },
            { name: 'Rigid bronchoscopy', rationale: 'Diagnostic and therapeutic gold standard', priority: 'Definitive' },
          ]},
          { id: 'copd_exacerbation', tests: [
            { name: 'Arterial blood gas', rationale: 'Assess oxygenation, hypercapnia, acidosis', priority: 'If severe' },
            { name: 'Chest X-ray', rationale: 'Exclude pneumonia', priority: 'First-line' },
          ]},
          { id: 'gerd', tests: [
            { name: 'Trial of proton pump inhibitor', rationale: 'Diagnostic and therapeutic for GERD-related cough', priority: 'First-line' },
          ]},
          { id: 'upper_respiratory_tract_infection', tests: [
            { name: 'Clinical diagnosis', rationale: 'No investigations routinely indicated — antibiotic stewardship', priority: 'None' },
          ]},
          { id: 'acute_bronchitis', tests: [
            { name: 'Clinical diagnosis', rationale: 'No routine investigations if typical. CXR only if pneumonia suspected', priority: 'None' },
          ]},
          { id: 'post_nasal_drip', tests: [
            { name: 'Clinical diagnosis', rationale: 'Trial of intranasal corticosteroids is diagnostic and therapeutic', priority: 'First-line' },
          ]},
        ];
        const matched = invOrder.filter(x => topDifferentialIds.includes(x.id)).slice(0, 3);
        if (matched.length === 0) return null;
        return (
          <div style={{ ...s.subtleCard, marginTop: 12 }}>
            <div style={s.label}>Recommended Investigations</div>
            <div style={s.muted}>Prioritised workup based on the top {matched.length} differential(s):</div>
            {matched.map(m => (
              <div key={m.id} style={{ marginTop: 10 }}>
                <div style={{ fontSize: '.75rem', fontWeight: 600, color: deptColor, marginBottom: 4 }}>
                  {COUGH_DIFFERENTIALS.find(d => d.id === m.id)?.name || m.id}
                </div>
                {m.tests.map(t => (
                  <div key={t.name} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: '.75rem', color: theme.colors.text }}>
                    <span style={{ flexShrink: 0, padding: '0 6px', borderRadius: 3, fontSize: '.625rem', fontWeight: 600,
                      background: t.priority === 'First-line' ? `${deptColor}15` : t.priority === 'Essential' ? theme.colors.warnBg : theme.colors.surfaceAlt,
                      color: t.priority === 'First-line' ? deptColor : t.priority === 'Essential' ? theme.colors.warn : theme.colors.textMuted, alignSelf: 'center' }}>
                      {t.priority}
                    </span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ color: theme.colors.textMuted, fontSize: '.6875rem' }}>{t.rationale}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );

  return (
    <div>
      <div style={s.header}>History of Presenting Illness — Cough</div>
      <div style={s.sub}>Comprehensive adaptive history-taking. Characterise the cough first, then targeted risk factors based on the leading differentials.</div>

      {renderDDXPanel()}

      <div style={{ marginTop: 24 }}>{renderSectionNavigation()}</div>

      {activeSection === 'triage' && renderTriageSection()}
      {activeSection === 'onset' && renderQuestionSection('onset')}
      {activeSection === 'character' && renderQuestionSection('character')}
      {activeSection === 'sputum' && renderQuestionSection('sputum')}
      {activeSection === 'temporal' && renderQuestionSection('temporal')}
      {activeSection === 'triggers' && renderQuestionSection('triggers')}
      {activeSection === 'associated_resp' && renderQuestionSection('associated_resp')}
      {activeSection === 'constitutional' && renderQuestionSection('constitutional')}
      {activeSection === 'cardiovascular' && renderQuestionSection('cardiovascular')}
      {activeSection === 'gi_ent_meds' && renderQuestionSection('gi_ent_meds')}
      {activeSection === 'impact' && renderQuestionSection('impact')}
      {activeSection === 'risk_factors' && renderRiskFactorsSection()}
      {activeSection === 'prior_tx' && renderPriorTxSection()}
      {activeSection === 'narrative' && renderNarrativeSection()}
    </div>
  );
}
