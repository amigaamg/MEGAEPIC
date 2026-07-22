// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Exam Narrative Engine — DUMB formatter for examination findings
// ═══════════════════════════════════════════════════════════════════════════════
// Input: GiExam (structured abdominal examination data)
// Output: English text — consultant-quality examination description
// The engine does NOT decide what to examine, does NOT update state.
// It only formats structured examination findings into clinical prose.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GiExam } from '../encounterState';
import { EXAM_SCHEMAS } from '../examinationSchemas';

// ── Value formatters ───────────────────────────────────────────────────────

function fmtSelect(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmtBooleanPresent(value: boolean | undefined, label: string): string {
  if (value === undefined) return '';
  return value ? label : '';
}

function fmtList(items: string[] | undefined): string {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
}

// ── Section builders ───────────────────────────────────────────────────────
// Each section returns a paragraph or sentence fragment.

function describeInspection(gi: GiExam): string {
  const parts: string[] = [];

  // Contour / distension
  if (gi.contour) {
    if (gi.contour === 'flat') parts.push('The abdomen is flat');
    else if (gi.contour === 'scaphoid') parts.push('The abdomen is scaphoid');
    else if (gi.contour === 'distended') {
      const pattern = gi.distensionPattern ? `, mainly ${fmtSelect(gi.distensionPattern)}` : '';
      parts.push(`The abdomen is distended${pattern}`);
    }
    else if (gi.contour === 'obese') parts.push('The abdomen is obese');
    else if (gi.contour === 'protuberant') parts.push('The abdomen is protuberant');
    else parts.push(`Abdominal contour: ${fmtSelect(gi.contour)}`);
  }

  // Scars
  if (gi.abdominalScars && gi.abdominalScars.length > 0 && !gi.abdominalScars.includes('none')) {
    parts.push(`There are scars from previous surgery: ${fmtList(gi.abdominalScars.map(s => fmtSelect(s)))}`);
  }

  // Striae
  if (gi.striae && gi.striae !== 'none') {
    const striaeDesc: Record<string, string> = {
      pink_recent: 'pink striae (recent)',
      silver_old: 'silver striae (old)',
      purple_cushings: 'purple striae suggestive of Cushing syndrome',
    };
    parts.push(striaeDesc[gi.striae] || fmtSelect(gi.striae) + ' striae');
  }

  // Visible veins / caput medusae
  if (gi.visibleVeins && gi.visibleVeins !== 'none') {
    if (gi.caputMedusae) {
      parts.push('Caput medusae is present — dilated collateral veins radiating from the umbilicus suggesting portal hypertension');
    } else {
      parts.push(`Visible abdominal veins: ${fmtSelect(gi.visibleVeins)}`);
    }
  }

  // Visible peristalsis
  if (gi.visiblePeristalsis) {
    parts.push('Visible peristalsis is noted');
  }

  // Hernial orifices
  if (gi.hernialOrifices && gi.hernialOrifices !== 'normal') {
    parts.push(`Hernial orifices: ${fmtSelect(gi.hernialOrifices)}`);
  }

  // Umbilicus
  if (gi.umbilicus && gi.umbilicus !== 'normal_inverted') {
    const umbilicusDesc: Record<string, string> = {
      everted: 'The umbilicus is everted',
      inflamed: 'The umbilicus is inflamed',
      herniated: 'There is an umbilical hernia',
      discharge: 'There is discharge from the umbilicus',
      nodule_sister_mary_joseph: 'A Sister Mary Joseph nodule is noted at the umbilicus, concerning for intra-abdominal malignancy',
    };
    parts.push(umbilicusDesc[gi.umbilicus] || `Umbilicus: ${fmtSelect(gi.umbilicus)}`);
  }

  // Flank fullness
  if (gi.flankFullness) {
    parts.push('There is bilateral flank fullness suggesting ascites');
  }

  // Cullen sign
  if (gi.cullensSign) {
    parts.push('Cullen sign is positive — periumbilical bruising indicating retroperitoneal haemorrhage');
  }

  // Grey-Turner sign
  if (gi.greyTurnerSign) {
    parts.push('Grey-Turner sign is positive — flank bruising indicating retroperitoneal haemorrhage');
  }

  if (parts.length === 0) return '';
  return parts.join('. ') + '.';
}

function describePalpation(gi: GiExam): string {
  const parts: string[] = [];

  // Tenderness
  if (gi.tenderness) {
    if (gi.tenderness === 'none') {
      parts.push('The abdomen is soft and non-tender');
    } else if (gi.tenderness === 'localized') {
      const locations = gi.tendernessLocation ? ` in the ${fmtList(gi.tendernessLocation.map(l => fmtSelect(l)))}` : '';
      parts.push(`There is localized tenderness${locations}`);
    } else if (gi.tenderness === 'generalized') {
      parts.push('There is generalized abdominal tenderness');
    } else if (gi.tenderness === 'rebound_present') {
      parts.push('There is generalized tenderness with rebound');
    }
  }

  // Guarding / rigidity
  if (gi.guarding) {
    if (gi.guarding === 'voluntary') {
      parts.push('with voluntary guarding');
    } else if (gi.guarding === 'involuntary_rigidity') {
      parts.push('with involuntary rigidity — peritonism is present');
    }
  }

  // McBurney's
  if (gi.mcburneysTenderness !== undefined) {
    if (gi.mcburneysTenderness) parts.push('McBurney point is tender');
  }

  // Rovsing's sign
  if (gi.rovsignsSign === 'positive') {
    parts.push("Rovsing's sign is positive");
  }

  // Psoas sign
  if (gi.psoasSign === 'positive') {
    parts.push("Psoas sign is positive — suggesting retrocaecal irritation");
  }

  // Obturator sign
  if (gi.obturatorSign === 'positive') {
    parts.push("Obturator sign is positive — suggesting pelvic inflammation");
  }

  // Murphy's sign
  if (gi.murphysSign === 'positive') {
    parts.push("Murphy's sign is positive — highly suggestive of acute cholecystitis");
  }

  // Blumberg's sign
  if (gi.blumbergSign === 'positive') {
    parts.push("Blumberg sign is positive — parietal peritoneal inflammation confirmed");
  }

  if (parts.length === 0) return '';
  return parts.join('. ') + '.';
}

function describeDeepPalpation(gi: GiExam): string {
  const parts: string[] = [];

  // Liver
  if (gi.liverPalpable !== undefined) {
    if (gi.liverPalpable) {
      const span = gi.liverSpan ? `, span ${gi.liverSpan} cm` : '';
      const surface = gi.liverSurface ? ` with a ${fmtSelect(gi.liverSurface)} surface` : '';
      const edge = gi.liverEdge ? ` and ${fmtSelect(gi.liverEdge)} edge` : '';
      const tender = gi.liverTenderness ? '. The liver is tender to palpation' : '';
      parts.push(`The liver is palpable ${gi.liverSpan ? `${gi.liverSpan} cm below the costal margin` : 'below the costal margin'}${span}${surface}${edge}${tender}`);
    } else {
      parts.push('The liver is not palpable');
    }
  }

  // Spleen
  if (gi.spleenPalpable !== undefined) {
    if (gi.spleenPalpable) {
      const grade = gi.spleenGrade ? ` (Hackett grade ${fmtSelect(gi.spleenGrade)})` : '';
      const tender = gi.spleenTenderness ? ', and is tender' : '';
      parts.push(`The spleen is palpable${grade}${tender}`);
    } else {
      parts.push('The spleen is not palpable');
    }
  }

  // Kidneys
  if (gi.kidneysPalpable && gi.kidneysPalpable !== 'not_palpable') {
    const kidneyDesc: Record<string, string> = {
      right_ballotable: 'The right kidney is ballotable',
      left_ballotable: 'The left kidney is ballotable',
      both_ballotable: 'Both kidneys are ballotable',
    };
    parts.push(kidneyDesc[gi.kidneysPalpable] || `Kidneys: ${fmtSelect(gi.kidneysPalpable)}`);
  }

  // Abdominal mass
  if (gi.abdominalMass !== undefined) {
    if (gi.abdominalMass) {
      const loc = gi.massLocation ? ` in the ${fmtSelect(gi.massLocation)}` : '';
      const consistency = gi.massConsistency ? `, ${fmtSelect(gi.massConsistency)} in consistency` : '';
      const mobility = gi.massMobility ? `, ${fmtSelect(gi.massMobility)}` : '';
      parts.push(`There is a palpable mass${loc}${consistency}${mobility}`);
    } else {
      parts.push('No abdominal masses are palpable');
    }
  }

  // Aorta
  if (gi.aorticWidth) {
    if (gi.aorticWidth === 'normal_not_palpable') {
      // Already implied by "no masses" - skip unless standalone
    } else if (gi.aorticWidth === 'palpable_normal_width') {
      parts.push('The abdominal aorta is palpable but of normal width');
    } else if (gi.aorticWidth === 'wide_expansile') {
      parts.push('The abdominal aorta is wide and expansile — concerning for AAA');
    } else if (gi.aorticWidth === 'tender') {
      parts.push('The abdominal aorta is tender and expansile — leaking AAA until proven otherwise');
    }
  }

  if (parts.length === 0) return '';
  return parts.join('. ') + '.';
}

function describePercussion(gi: GiExam): string {
  const parts: string[] = [];

  if (gi.percussionNote) {
    if (gi.percussionNote === 'tympanic') {
      // Normal finding, only mention if other findings are present
    } else if (gi.percussionNote === 'dull') {
      parts.push('Percussion reveals dullness');
    } else if (gi.percussionNote === 'shifting_dullness') {
      parts.push('Shifting dullness is present — confirming ascites');
    } else if (gi.percussionNote === 'hyperresonant') {
      parts.push('The abdomen is hyperresonant to percussion suggesting gaseous distension');
    }
  }

  if (gi.shiftingDullness) {
    parts.push('Shifting dullness is demonstrated — consistent with free intra-abdominal fluid');
  }

  if (gi.fluidThrill) {
    parts.push('A fluid thrill is present — indicating tense ascites');
  }

  if (gi.liverSpanPercussion !== undefined) {
    parts.push(`Liver span is ${gi.liverSpanPercussion} cm by percussion`);
  }

  if (gi.splenicDullness) {
    parts.push('Splenic dullness is present');
  }

  if (parts.length === 0 && (gi.percussionNote === 'tympanic')) {
    return 'Percussion is tympanic throughout.';
  }

  if (parts.length === 0) return '';
  return parts.join('. ') + '.';
}

function describeAuscultation(gi: GiExam): string {
  const parts: string[] = [];

  if (gi.bowelSounds) {
    if (gi.bowelSounds === 'normal') {
      parts.push('Bowel sounds are normal');
    } else if (gi.bowelSounds === 'increased') {
      parts.push('Bowel sounds are increased');
    } else if (gi.bowelSounds === 'reduced') {
      parts.push('Bowel sounds are reduced');
    } else if (gi.bowelSounds === 'absent') {
      parts.push('Bowel sounds are absent (auscultated for a full 2 minutes)');
    } else if (gi.bowelSounds === 'tinkling') {
      parts.push('Tinkling bowel sounds are heard — suggestive of early intestinal obstruction');
    } else if (gi.bowelSounds === 'rushing') {
      parts.push('Rushing bowel sounds are heard — suggestive of intestinal obstruction');
    }
  }

  if (gi.bruits && gi.bruits !== 'none') {
    const bruitDesc: Record<string, string> = {
      aortic: 'An aortic bruit is present',
      renal: 'A renal artery bruit is present — suggestive of renal artery stenosis',
      hepatic: 'A hepatic bruit is present — may suggest hepatocellular carcinoma',
      femoral: 'A femoral bruit is present',
      splenic: 'A splenic bruit is present',
    };
    parts.push(bruitDesc[gi.bruits] || `A ${fmtSelect(gi.bruits)} bruit is present`);
  }

  if (gi.frictionRub) {
    parts.push('A peritoneal friction rub is audible — suggests capsular inflammation');
  }

  if (gi.succussionSplash) {
    parts.push('A succussion splash is elicited — suggests gastric outlet obstruction or dilated bowel');
  }

  return parts.length > 0 ? parts.join('. ') + '.' : '';
}

function describeSpecialSigns(gi: GiExam): string {
  const parts: string[] = [];

  if (gi.courvoisierSign === 'positive') {
    parts.push("A palpable, non-tender gallbladder is noted (Courvoisier's sign) — concerning for pancreatic head malignancy");
  }

  if (gi.kehrSign === 'positive') {
    parts.push("Kehr's sign is positive — left shoulder tip pain suggests diaphragmatic irritation, concerning for splenic injury");
  }

  if (gi.ballanceSign === 'positive') {
    parts.push("Ballance's sign is positive — suggesting splenic rupture with perisplenic haematoma");
  }

  if (gi.boasSign === 'positive') {
    parts.push("Boas' sign is positive — referred right infrascapular hyperaesthesia suggesting cholecystitis");
  }

  if (gi.danceSign === 'positive') {
    parts.push("Dance's sign is positive — empty RIF suggesting intussusception");
  }

  return parts.length > 0 ? parts.join('. ') + '.' : '';
}

function describeDRE(gi: GiExam): string {
  if (!gi.drePerformed) return '';

  const parts: string[] = ['Digital rectal examination was performed.'];

  // Sphincter tone
  if (gi.dreSphincterTone) {
    const toneDesc: Record<string, string> = {
      normal: 'Anal sphincter tone is normal',
      reduced: 'Anal sphincter tone is reduced',
      increased_spasm: 'There is increased sphincter tone/spasm',
      absent: 'Anal sphincter tone is absent',
    };
    parts.push(toneDesc[gi.dreSphincterTone] || `Anal sphincter tone: ${gi.dreSphincterTone}`);
  }

  if (gi.dreFecalLoading) {
    parts.push('There is fecal loading in the rectum');
  }

  if (gi.dreMass) {
    parts.push('A rectal mass is palpable — further characterization is required');
  }

  if (gi.dreBlood) {
    parts.push('Blood is noted on the examining finger');
  }

  if (gi.dreProstate && gi.dreProstate !== 'not_assessed_applicable' && gi.dreProstate !== 'normal') {
    const prostateDesc: Record<string, string> = {
      enlarged_smooth: 'The prostate is enlarged and smooth — consistent with BPH',
      enlarged_nodular: 'The prostate is enlarged with nodularity — suspicious for malignancy',
      tender: 'The prostate is tender — consistent with prostatitis',
      firm_hard: 'The prostate is firm and hard — suspicious for prostate carcinoma',
    };
    parts.push(prostateDesc[gi.dreProstate] || `Prostate: ${fmtSelect(gi.dreProstate)}`);
  }

  return parts.join(' ') + (parts.length === 1 ? '' : '');
}

function describeInguinal(gi: GiExam): string {
  const parts: string[] = [];

  if (gi.inguinalHernia && gi.inguinalHernia !== 'none') {
    const herniaDesc: Record<string, string> = {
      direct_inguinal: 'There is a direct inguinal hernia',
      indirect_inguinal: 'There is an indirect inguinal hernia',
      femoral: 'There is a femoral hernia',
      incisional: 'There is an incisional hernia in the groin',
      irreducible: 'There is an irreducible hernia in the groin',
    };
    parts.push(herniaDesc[gi.inguinalHernia] || `Hernia: ${fmtSelect(gi.inguinalHernia)}`);

    if (gi.coughImpulse !== undefined) {
      parts.push(gi.coughImpulse ? 'with a positive cough impulse (reducible)' : 'with absent cough impulse (concern for incarceration)');
    }
  }

  if (gi.inguinalLymphNodes && gi.inguinalLymphNodes !== 'not_palpable') {
    const nodeDesc: Record<string, string> = {
      palpable_benign: 'Inguinal lymph nodes are palpable but benign in character',
      palpable_suspicious: 'Inguinal lymph nodes are palpable and suspicious for malignancy',
      matted: 'Inguinal lymph nodes are matted — suggesting TB or metastatic disease',
      discharging_sinus: 'There is a discharging sinus in the groin — suggesting TB lymphadenitis',
    };
    parts.push(nodeDesc[gi.inguinalLymphNodes] || `Inguinal nodes: ${fmtSelect(gi.inguinalLymphNodes)}`);
  }

  return parts.length > 0 ? parts.join('. ') + '.' : '';
}

// ── Main narrative builder ────────────────────────────────────────────────

export function buildGiExamNarrative(gi: GiExam): string {
  const paragraphs: string[] = [];

  const inspection = describeInspection(gi);
  if (inspection) paragraphs.push(inspection);

  const palpation = describePalpation(gi);
  if (palpation) paragraphs.push(palpation);

  const deepPalpation = describeDeepPalpation(gi);
  if (deepPalpation) paragraphs.push(deepPalpation);

  const percussion = describePercussion(gi);
  if (percussion) paragraphs.push(percussion);

  const auscultation = describeAuscultation(gi);
  if (auscultation) paragraphs.push(auscultation);

  const specialSigns = describeSpecialSigns(gi);
  if (specialSigns) paragraphs.push(specialSigns);

  const dre = describeDRE(gi);
  if (dre) paragraphs.push(dre);

  const inguinal = describeInguinal(gi);
  if (inguinal) paragraphs.push(inguinal);

  // Notes
  if (gi.giNotes) {
    paragraphs.push(gi.giNotes);
  }

  if (paragraphs.length === 0) {
    return 'Abdominal examination not yet documented.';
  }

  return paragraphs.join('\n');
}

// ── Summary sentence for SOAP/assessment ──────────────────────────────────

export function buildGiExamSummary(gi: GiExam): string {
  const parts: string[] = [];

  // Quick summary — normal vs abnormal
  const isNormal =
    (!gi.tenderness || gi.tenderness === 'none') &&
    gi.guarding !== 'involuntary_rigidity' &&
    !gi.liverPalpable &&
    !gi.spleenPalpable &&
    !gi.abdominalMass &&
    gi.aorticWidth !== 'wide_expansile' &&
    gi.aorticWidth !== 'tender' &&
    gi.bowelSounds !== 'absent' &&
    gi.bowelSounds !== 'tinkling' &&
    gi.bowelSounds !== 'rushing' &&
    !gi.cullensSign &&
    !gi.greyTurnerSign;

  if (isNormal) {
    return 'Abdomen: soft, non-tender, no organomegaly. Bowel sounds normal.';
  }

  // Build abnormal summary
  if (gi.tenderness && gi.tenderness !== 'none') {
    if (gi.tenderness === 'localized') {
      const loc = gi.tendernessLocation ? ` ${fmtList(gi.tendernessLocation.map(l => fmtSelect(l)))}` : '';
      parts.push(`Tender${loc}`);
    } else if (gi.tenderness === 'generalized') {
      parts.push('Generalized tenderness');
    }
    if (gi.guarding === 'involuntary_rigidity') parts.push('with rigidity');
    else if (gi.guarding === 'voluntary') parts.push('with guarding');
  }

  if (gi.liverPalpable) parts.push('hepatomegaly');
  if (gi.spleenPalpable) parts.push('splenomegaly');
  if (gi.abdominalMass) parts.push('palpable mass');
  if (gi.aorticWidth === 'wide_expansile' || gi.aorticWidth === 'tender') parts.push('AAA on palpation');
  if (gi.shiftingDullness) parts.push('ascites');
  if (gi.bowelSounds === 'absent') parts.push('absent bowel sounds');
  else if (gi.bowelSounds === 'tinkling' || gi.bowelSounds === 'rushing') parts.push('obstructive bowel sounds');
  if (gi.cullensSign || gi.greyTurnerSign) parts.push('retroperitoneal haemorrhage signs');

  if (parts.length === 0) {
    return 'Abdominal examination findings documented (see full narrative).';
  }

  return `Abdomen: ${fmtList(parts)}.`;
}
