import type { ManagementPlanOutput } from './managementEngine';
import type { InvestigationPlanOutput } from './investigationEngine';
import type { SeverityGrade } from './severityEngine';

export interface PatientEducationSection {
  title: string;
  content: string[];
  priority: 1 | 2 | 3;
}

export interface PatientEducationSummary {
  disease: string;
  subtitle: string;
  sections: PatientEducationSection[];
  followUpAdvice: string[];
  warningSigns: string[];
  whenToReturn: string[];
  dietAdvice: string[];
  activityAdvice: string[];
  medicationAdvice: string[];
}

export function generateAppendicitisEducation(
  subtype: ManagementPlanOutput['subtype'],
  severity: SeverityGrade,
  context: {
    age?: number;
    isChild?: boolean;
    isElderly?: boolean;
    pregnant?: boolean;
  },
): PatientEducationSummary {
  const isSurgical = subtype === 'uncomplicated' || subtype === 'complicated_perforated';
  const isComplicated = subtype !== 'uncomplicated';

  const sections: PatientEducationSection[] = [];

  sections.push({
    title: 'What is Appendicitis?',
    priority: 1,
    content: [
      'Appendicitis is inflammation of the appendix — a small finger-like pouch attached to the large intestine on the lower right side of your abdomen.',
      'It happens when the opening of the appendix becomes blocked (by a small piece of hardened stool, enlarged lymph node, or infection), causing bacteria to multiply inside.',
      'If not treated promptly, the appendix can swell and eventually burst (perforate), spilling infected material into the abdominal cavity — this is a life-threatening emergency.',
      'With early diagnosis and treatment, most patients recover fully without complications.',
    ],
  });

  sections.push({
    title: 'How is it Treated?',
    priority: 1,
    content: [
      isSurgical
        ? 'The standard treatment is surgical removal of the appendix (appendicectomy). This can be done laparoscopically (keyhole surgery — 3 small incisions) or as an open operation (through a small cut in the lower right abdomen).'
        : 'Your doctor has decided not to operate immediately. Instead, you will receive antibiotics and close monitoring. This is the safest approach when the body has walled off the appendix with a protective mass of tissue (phlegmon or abscess).',
      isSurgical
        ? 'Laparoscopic appendicectomy is preferred because it causes less pain, shorter hospital stay (12-24 hours), and faster return to normal activities.'
        : 'You will need intravenous antibiotics for 7-10 days, and the appendix will be removed 6-8 weeks later — after the inflammation has completely settled.',
      'You will also receive intravenous fluids (drip) to keep you hydrated and pain medication to keep you comfortable.',
    ],
  });

  if (isComplicated) {
    sections.push({
      title: 'About the Complicated Appendicitis',
      priority: 1,
      content: [
        subtype === 'complicated_perforated'
          ? 'Your appendix has burst (perforated). This means infected material has spilled into your abdominal cavity. Emergency surgery is needed to clean out the infection and remove the appendix.'
          : subtype === 'complicated_mass'
            ? 'Your body has successfully walled off the inflamed appendix with a protective layer of tissue called a phlegmon or mass. This is a natural defence mechanism. Surgery in this stage is dangerous because the inflamed tissue is stuck together. We will treat the infection first and remove the appendix later.'
            : 'An abscess (collection of pus) has formed around your appendix. This will be drained using a small tube inserted through the skin (under CT or ultrasound guidance). The appendix will be removed after the infection resolves.',
        'You will need a longer course of antibiotics (5-7 days IV), and your hospital stay will be longer.',
        'After discharge, you will need to return for a follow-up operation (interval appendicectomy) in 6-8 weeks.',
      ],
    });
  }

  sections.push({
    title: 'What to Expect After Surgery',
    priority: 2,
    content: [
      isSurgical
        ? 'After surgery, you will wake up with a small dressing over your incision(s). You may have a drip in your arm to give fluids until you can drink normally.'
        : 'While on antibiotics, you will have a drip in your arm. You may not be allowed to eat until the infection is under control.',
      'You will be given pain medication. Tell your nurse if pain is not controlled.',
      'Most patients can start drinking water within a few hours after surgery (laparoscopic) or the next day (open surgery).',
      'You will be encouraged to get out of bed and walk as soon as possible — this reduces the risk of blood clots and helps bowel function return.',
      isSurgical
        ? 'If you had laparoscopic surgery, you can expect to go home within 12-24 hours. If open surgery, you may need 2-3 days.'
        : 'If treated conservatively for mass/abscess, you may need to stay in hospital for 7-10 days of IV antibiotics.',
    ],
  });

  return {
    disease: 'Acute Appendicitis',
    subtitle: `Treatment: ${isComplicated ? 'Complicated — antibiotics ± drainage ± surgery' : 'Laparoscopic Appendicectomy'}`,
    sections,
    followUpAdvice: [
      isSurgical
        ? 'Return to the surgical clinic in 1-2 weeks for wound review and suture removal.'
        : 'Return for planned interval appendicectomy in 6-8 weeks. A CT scan may be done before surgery to confirm resolution.',
      'If the appendix tissue was sent for histology (microscopic examination), the results will be discussed at follow-up.',
      'Continue taking any prescribed medications as directed.',
    ],
    warningSigns: [
      'Fever >38°C with chills or shivering',
      'Worsening or spreading abdominal pain',
      'Vomiting that prevents you from keeping down fluids',
      'Redness, swelling, or pus draining from your surgical wound',
      'Inability to pass stool or gas for more than 24 hours after discharge',
      'Feelings of faintness, dizziness, or palpitations',
    ],
    whenToReturn: [
      'If you develop any of the above warning signs',
      'For wound check and suture removal (if non-dissolvable sutures were used)',
      'If you were treated conservatively for a mass: return immediately if pain increases, fever returns, or you feel generally unwell',
      'For scheduled interval appendicectomy (if applicable)',
    ],
    dietAdvice: [
      'Start with clear fluids (water, clear soup, oral rehydration solution).',
      'Progress to soft, easy-to-digest foods: porridge, bread, rice, bananas, boiled potatoes, yoghurt, well-cooked vegetables.',
      'Avoid spicy, greasy, or fried foods for the first 1-2 weeks.',
      'Eat small, frequent meals rather than large meals.',
      'Drink plenty of water — at least 8 glasses daily, unless your doctor advises otherwise.',
      'Fibre-rich foods (fruits, vegetables, whole grains) are good after recovery but introduce gradually.',
    ],
    activityAdvice: [
      'Rest for the first 3-5 days after going home.',
      'Gentle walking is encouraged — it prevents blood clots and helps bowel function return.',
      'Avoid heavy lifting (>5 kg), strenuous exercise, or contact sports for 4-6 weeks (longer if open surgery).',
      'You can resume light household activities after 1-2 weeks.',
      'If you do manual labour or heavy work, discuss return-to-work timing with your surgeon.',
      'Most people return to normal activities within 2-4 weeks (laparoscopic) or 4-6 weeks (open surgery).',
    ],
    medicationAdvice: [
      'Take pain medication as prescribed — usually Paracetamol 1g every 6 hours as needed.',
      'If prescribed NSAIDs (ibuprofen, diclofenac), take with food to protect your stomach.',
      'If you were prescribed antibiotics at discharge (for complicated disease), complete the FULL course even if you feel better.',
      'Avoid aspirin or anti-inflammatory medications unless specifically prescribed by your surgeon.',
      'If you had an interval appendicectomy planned: you will receive pre-operative antibiotics only (single dose).',
    ],
  };
}

export function formatEducationForPatient(summary: PatientEducationSummary): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push(`${summary.disease.toUpperCase()} — Patient Education Summary`);
  lines.push(summary.subtitle);
  lines.push('='.repeat(60));
  lines.push('');

  for (const section of summary.sections.sort((a, b) => a.priority - b.priority)) {
    lines.push(`--- ${section.title.toUpperCase()} ---`);
    for (const item of section.content) {
      lines.push(`  • ${item}`);
    }
    lines.push('');
  }

  lines.push('--- FOLLOW-UP ADVICE ---');
  for (const item of summary.followUpAdvice) {
    lines.push(`  • ${item}`);
  }
  lines.push('');

  lines.push('--- WARNING SIGNALS ---');
  lines.push('  Seek medical attention immediately if you experience any of these:');
  for (const item of summary.warningSigns) {
    lines.push(`  ⚠ ${item}`);
  }
  lines.push('');

  lines.push('--- WHEN TO RETURN ---');
  for (const item of summary.whenToReturn) {
    lines.push(`  • ${item}`);
  }
  lines.push('');

  lines.push('--- DIET ADVICE ---');
  for (const item of summary.dietAdvice) {
    lines.push(`  • ${item}`);
  }
  lines.push('');

  lines.push('--- ACTIVITY ADVICE ---');
  for (const item of summary.activityAdvice) {
    lines.push(`  • ${item}`);
  }
  lines.push('');

  lines.push('--- MEDICATION ADVICE ---');
  for (const item of summary.medicationAdvice) {
    lines.push(`  • ${item}`);
  }
  lines.push('');

  lines.push('='.repeat(60));
  lines.push('Always consult your healthcare provider for advice specific to your case.');
  lines.push('This information is a general guide and not a substitute for professional medical advice.');

  return lines.join('\n');
}
