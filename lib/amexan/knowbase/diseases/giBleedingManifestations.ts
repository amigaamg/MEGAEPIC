// ═══════════════════════════════════════════════════════════════════════════════
// GI Bleeding Manifestation Profiles
// Every disease that causes GI bleeding describes its typical pattern here.
// The engine uses these to ask discriminating questions and generate better HPI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { GiBleedingManifestation } from '../diseaseNode';

function gm(opts: GiBleedingManifestation): GiBleedingManifestation {
  return opts;
}

// ── SECTION 1: UGIB — ESOPHAGEAL (8 nodes) ─────────────────────────────

export const esophageal_varices_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'esophageal',
  onset: 'acute',
  severity: 'massive_shock',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['vomiting', 'jaundice', 'ascites', 'syncope'],
  riskContext: ['portal_hypertension', 'alcohol', 'prior_gi_bleed'],
  mechanism: 'portal_hypertension',
  typicalDescription: 'Painless massive hematemesis in a patient with known cirrhosis and portal hypertension. Rapid hemodynamic compromise. High mortality without urgent endoscopic therapy.',
});

export const gastric_varices_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'gastric',
  onset: 'acute',
  severity: 'massive_shock',
  character: 'dark_red_maroon',
  painPattern: 'painless',
  associatedSymptoms: ['vomiting', 'jaundice', 'ascites', 'syncope'],
  riskContext: ['portal_hypertension', 'alcohol'],
  mechanism: 'portal_hypertension',
  typicalDescription: 'Torrential UGIB from gastric fundal varices in cirrhosis. More difficult to control endoscopically than esophageal varices. Mortality exceeds 30%.',
});

export const mallory_weiss_tear_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis'],
  site: 'esophageal',
  onset: 'acute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['vomiting', 'nausea'],
  riskContext: ['alcohol'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Hematemesis after forceful non-bloody vomiting or retching, often after binge drinking. Typically self-limited over 24-48 hours.',
});

export const reflux_esophagitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'occult'],
  site: 'esophageal',
  onset: 'chronic_occult',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['dysphagia', 'nausea'],
  riskContext: ['gerd'],
  mechanism: 'acid_related',
  typicalDescription: 'Chronic heartburn with occasional small hematemesis or occult blood loss causing iron deficiency anemia. Bleeding from severe erosive esophagitis.',
});

export const infectious_esophagitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis'],
  site: 'esophageal',
  onset: 'subacute',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['dysphagia', 'fever'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Odynophagia and dysphagia in an immunocompromised patient with minor hematemesis from ulcerative esophagitis due to Candida, CMV, or HSV.',
});

export const esophageal_cancer_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'occult'],
  site: 'esophageal',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'bright_red',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['dysphagia', 'weight_loss', 'anemia'],
  riskContext: ['alcohol', 'smoking'],
  mechanism: 'neoplastic',
  typicalDescription: 'Progressive dysphagia with weight loss and occult blood loss causing iron deficiency anemia. Overt hematemesis occurs with advanced tumor friability.',
});

export const boerhaave_syndrome_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis'],
  site: 'esophageal',
  onset: 'acute',
  severity: 'massive_shock',
  character: 'bright_red',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['vomiting', 'fever'],
  riskContext: ['alcohol'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Excruciating retrosternal pain after forceful vomiting with hematemesis. Subcutaneous emphysema and Mackler triad. Surgical emergency with high mortality.',
});

export const pill_esophagitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis'],
  site: 'esophageal',
  onset: 'acute',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['dysphagia'],
  riskContext: ['none'],
  mechanism: 'acid_related',
  typicalDescription: 'Acute odynophagia and retrosternal pain after taking pills (doxycycline, bisphosphonates, KCl, NSAIDs) with insufficient water. Minor hematemesis that resolves rapidly.',
});

// ── SECTION 2: UGIB — GASTRODUODENAL (9 nodes) ─────────────────────────

export const gastric_ulcer_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'gastric',
  onset: 'acute',
  severity: 'moderate',
  character: 'coffee_ground',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['vomiting', 'nausea', 'syncope', 'anemia'],
  riskContext: ['nsaid', 'alcohol', 'smoking', 'h_pylori', 'prior_gi_bleed'],
  mechanism: 'acid_related',
  typicalDescription: 'Epigastric pain with coffee-ground emesis and melena. Pain may be relieved by food. Most are NSAID or H pylori related. Approximately 80% stop spontaneously.',
});

export const duodenal_ulcer_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['melena', 'hematemesis'],
  site: 'duodenal',
  onset: 'acute',
  severity: 'moderate',
  character: 'black_tarry',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['nausea', 'syncope', 'anemia'],
  riskContext: ['nsaid', 'smoking', 'h_pylori', 'prior_gi_bleed'],
  mechanism: 'acid_related',
  typicalDescription: 'Black tarry melena with gnawing epigastric pain relieved by food or antacids. Most common cause of melena. Hematemesis is less frequent than with gastric ulcers.',
});

export const acute_gastritis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'gastric',
  onset: 'acute',
  severity: 'mild_self_limited',
  character: 'coffee_ground',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['nausea'],
  riskContext: ['nsaid', 'alcohol'],
  mechanism: 'acid_related',
  typicalDescription: 'Epigastric burning with coffee-ground emesis after NSAID use or heavy alcohol intake. Diffuse gastric mucosal oozing rather than a single arterial bleed. Self-limited.',
});

export const stress_gastritis_icu_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'gastric',
  onset: 'subacute',
  severity: 'moderate',
  character: 'coffee_ground',
  painPattern: 'painless',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'acid_related',
  typicalDescription: 'Painless UGIB in an ICU patient 3-7 days after admission from splanchnic hypoperfusion and mucosal ischemia. Clinically significant bleeding in approximately 5% of ICU patients.',
});

export const gastric_cancer_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena', 'occult'],
  site: 'gastric',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'coffee_ground',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['weight_loss', 'nausea', 'anemia'],
  riskContext: ['smoking', 'h_pylori'],
  mechanism: 'neoplastic',
  typicalDescription: 'Chronic occult blood loss with iron deficiency anemia, weight loss, early satiety, and dull epigastric pain. Overt bleeding indicates advanced disease.',
});

export const dieulafoy_lesion_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'gastric',
  onset: 'acute',
  severity: 'massive_shock',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['syncope', 'anemia'],
  riskContext: ['none'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Recurrent massive painless hematemesis in an elderly patient from an abnormally large submucosal artery. Bleeding is intermittent due to clot formation and dissolution, requiring precise timing of endoscopy.',
});

export const cameron_ulcers_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['occult', 'hematemesis'],
  site: 'gastric',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'occult',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['gerd'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Chronic iron deficiency anemia in an elderly patient with a large hiatal hernia. Linear gastric erosions at the diaphragmatic hiatus cause chronic occult blood loss.',
});

export const gastric_erosions_nsaid_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'gastric',
  onset: 'subacute',
  severity: 'mild_self_limited',
  character: 'coffee_ground',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['nausea'],
  riskContext: ['nsaid'],
  mechanism: 'acid_related',
  typicalDescription: 'Epigastric burning with coffee-ground emesis in a patient taking NSAIDs. Shallow mucosal erosions cause bleeding, especially with concurrent anticoagulant use. Reversible upon NSAID cessation.',
});

export const gastric_antral_vascular_ectasia_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['occult', 'melena'],
  site: 'gastric',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'occult',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['portal_hypertension'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Chronic iron deficiency anemia in a middle-aged woman. Endoscopy shows characteristic watermelon appearance of the gastric antrum. Associated with cirrhosis and autoimmune disease.',
});

// ── SECTION 3: UGIB — VASCULAR/EMERGENCY (3 nodes) ─────────────────────

export const aortoenteric_fistula_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'duodenal',
  onset: 'acute',
  severity: 'massive_shock',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['syncope'],
  riskContext: ['aaa'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Sentinel herald bleed followed by catastrophic hemorrhage in a patient with prior AAA repair. Communication between aorta and third portion of duodenum. Mortality >80% without emergency surgery.',
});

export const hemobilia_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'duodenal',
  onset: 'acute',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['jaundice'],
  riskContext: ['none'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Quincke triad: RUQ colicky pain, obstructive jaundice, and GI bleeding from the ampulla of Vater. Most often follows biliary instrumentation, ERCP, or liver biopsy.',
});

export const pancreatic_pseudocyst_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'duodenal',
  onset: 'acute',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'epigastric_pain',
  associatedSymptoms: ['vomiting'],
  riskContext: ['alcohol'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Epigastric pain radiating to the back in a patient with known pancreatitis. Pseudoaneurysm of the splenic artery erodes into the pancreatic duct causing hemosuccus pancreaticus.',
});

// ── SECTION 4: LGIB — COLONIC (10 nodes) ───────────────────────────────

export const diverticular_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'acute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['syncope', 'anemia'],
  riskContext: ['nsaid', 'anticoagulant', 'prior_gi_bleed'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Painless massive hematochezia in an elderly patient. Rupture of vasa recta artery into a diverticulum. Most common cause of LGIB. Approximately 80% stop spontaneously.',
});

export const colorectal_cancer_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia', 'occult'],
  site: 'colonic',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'dark_red_maroon',
  painPattern: 'painless',
  associatedSymptoms: ['weight_loss', 'tenesmus', 'anemia'],
  riskContext: ['smoking', 'prior_gi_bleed'],
  mechanism: 'neoplastic',
  typicalDescription: 'Chronic occult blood loss causing iron deficiency anemia. Right-sided tumors present with anemia; left-sided tumors present with visible blood mixed with stool and change in bowel habit.',
});

export const colonic_angiodysplasia_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia', 'occult'],
  site: 'colonic',
  onset: 'intermittent',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['none'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Painless recurrent hematochezia in an elderly patient from right colon angiodysplasia. Second most common cause of LGIB after diverticulosis. May be associated with aortic stenosis (Heyde syndrome).',
});

export const ischemic_colitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'acute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea'],
  riskContext: ['none'],
  mechanism: 'ischemic',
  typicalDescription: 'Sudden cramping left lower quadrant pain followed by bloody diarrhea in an elderly patient with vascular risk factors. Watershed areas at splenic flexure and rectosigmoid. Most resolve spontaneously.',
});

export const ulcerative_colitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'subacute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea', 'tenesmus', 'fever'],
  riskContext: ['smoking'],
  mechanism: 'inflammatory',
  typicalDescription: 'Bloody diarrhea with mucus, tenesmus, and urgency. Continuous inflammation starting in the rectum and extending proximally. Relapsing-remitting chronic condition in a young adult.',
});

export const crohn_colitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'subacute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea', 'fever', 'weight_loss'],
  riskContext: ['smoking'],
  mechanism: 'inflammatory',
  typicalDescription: 'Right lower quadrant cramping pain with bloody diarrhea in a young adult. Transmural inflammation with deep fissuring ulcers. May have perianal fistulas and strictures.',
});

export const infectious_colitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'acute',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea', 'fever', 'tenesmus'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Acute bloody diarrhea with fever and abdominal cramping. Often travel or food related. Caused by Shigella, Salmonella, Campylobacter, EHEC, or C difficile. Typically self-limited over 3-7 days.',
});

export const radiation_colitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'chronic_occult',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['tenesmus'],
  riskContext: ['none'],
  mechanism: 'ischemic',
  typicalDescription: 'Painless hematochezia starting 6-24 months after pelvic radiation. Obliterative endarteritis causes mucosal telangiectasias and chronic intermittent bleeding.',
});

export const solitary_rectal_ulcer_syndrome_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'rectal',
  onset: 'chronic_occult',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'rectal_pain',
  associatedSymptoms: ['tenesmus'],
  riskContext: ['none'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Rectal bleeding with mucus and tenesmus in a young patient with chronic constipation and dyssynergic defecation. Benign rectal ulcer from mucosal trauma and prolapse.',
});

export const stercoral_ulcer_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'colonic',
  onset: 'subacute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'ischemic',
  typicalDescription: 'Hematochezia in an elderly constipated patient from pressure necrosis of the colonic or rectal wall by impacted fecal mass. Can cause massive bleeding or perforation.',
});

// ── SECTION 5: LGIB — ANORECTAL (4 nodes) ──────────────────────────────

export const hemorrhoids_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'anal',
  onset: 'intermittent',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Painless bright red blood on toilet paper or on stool surface after straining. Most common cause of hematochezia in young adults. Intermittent and self-limited.',
});

export const anal_fissure_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'anal',
  onset: 'acute',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'rectal_pain',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Sharp tearing anal pain during passage of hard stool with streaks of bright red blood on toilet paper. Anal fissure most commonly in posterior midline.',
});

export const rectal_polyps_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'rectal',
  onset: 'intermittent',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'neoplastic',
  typicalDescription: 'Painless bright red blood per rectum from a friable polyp. Juvenile polyps cause bleeding in children ages 2-10. Adenomatous polyps in adults require colonoscopic removal.',
});

export const proctitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'rectal',
  onset: 'subacute',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'rectal_pain',
  associatedSymptoms: ['tenesmus'],
  riskContext: ['none'],
  mechanism: 'inflammatory',
  typicalDescription: 'Rectal bleeding with mucus, tenesmus, and urgency. May be from ulcerative proctitis or sexually transmitted infection. Inflammation limited to the rectal mucosa.',
});

// ── SECTION 6: SMALL BOWEL (8 nodes) ───────────────────────────────────

export const meckel_diverticulum_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia', 'melena'],
  site: 'small_bowel',
  onset: 'acute',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['none'],
  mechanism: 'acid_related',
  typicalDescription: 'Painless dark red or maroon hematochezia in a child under 5 years. Ectopic gastric mucosa in Meckel diverticulum secretes acid causing ulceration of adjacent ileal mucosa. Rule of 2s.',
});

export const crohn_enteritis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['melena', 'hematochezia'],
  site: 'small_bowel',
  onset: 'chronic_occult',
  severity: 'mild_self_limited',
  character: 'dark_red_maroon',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea', 'fever', 'weight_loss'],
  riskContext: ['smoking'],
  mechanism: 'inflammatory',
  typicalDescription: 'Chronic RLQ cramping pain with diarrhea, weight loss, and occasional melena or hematochezia from deep fissuring ulcers in the terminal ileum. Bleeding is less common than in colonic Crohn.',
});

export const small_bowel_tumor_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['melena', 'hematochezia', 'occult'],
  site: 'small_bowel',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'dark_red_maroon',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['weight_loss', 'anemia'],
  riskContext: ['none'],
  mechanism: 'neoplastic',
  typicalDescription: 'Occult GI bleeding or melena from a small bowel tumor (GIST, lymphoma, adenocarcinoma, carcinoid). Often diagnosed at capsule endoscopy after negative upper and lower endoscopy.',
});

export const small_bowel_angiodysplasia_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['melena', 'hematochezia', 'occult'],
  site: 'small_bowel',
  onset: 'intermittent',
  severity: 'mild_self_limited',
  character: 'dark_red_maroon',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['none'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Intermittent painless melena or hematochezia in an elderly patient. Most common cause of obscure GI bleeding after age 65. Often multiple lesions in the jejunum and ileum.',
});

export const nsaid_enteropathy_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['occult', 'melena'],
  site: 'small_bowel',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'occult',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['nsaid'],
  mechanism: 'acid_related',
  typicalDescription: 'Chronic iron deficiency anemia in a patient on long-term NSAIDs. Small bowel erosions and ulcerations cause occult blood loss. Negative upper and lower endoscopy leads to diagnosis via capsule endoscopy.',
});

export const tuberculous_enteritis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia', 'melena', 'occult'],
  site: 'small_bowel',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'dark_red_maroon',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea', 'fever', 'weight_loss'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Chronic RLQ pain with diarrhea, fever, night sweats, weight loss, and GI bleeding in a patient from an endemic area. Granulomatous inflammation of the terminal ileum mimics Crohns disease.',
});

export const typhoid_intestinal_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia', 'melena'],
  site: 'small_bowel',
  onset: 'subacute',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['diarrhea', 'fever'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'GI bleeding in the 2nd-3rd week of untreated typhoid fever in a returned traveler. Necrosis and sloughing of Peyers patches in the terminal ileum causes ulceration and hemorrhage.',
});

export const jejunal_diverticulosis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['melena', 'hematochezia'],
  site: 'small_bowel',
  onset: 'acute',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['none'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Painless melena or hematochezia in an elderly patient from acquired jejunal diverticula. Erosion into vasa recta causes bleeding. Rare but potentially massive. Often diagnosed on angiography.',
});

// ── SECTION 7: PEDIATRIC / NEONATAL (5 nodes) ──────────────────────────

export const necrotizing_enterocolitis_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'small_bowel',
  onset: 'acute',
  severity: 'moderate',
  character: 'bright_red',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['vomiting', 'fever'],
  riskContext: ['none'],
  mechanism: 'ischemic',
  typicalDescription: 'Bloody stools, abdominal distension, and feeding intolerance in a preterm neonate. Ischemic necrosis of the bowel wall. Rapidly progresses to perforation and peritonitis without surgical intervention.',
});

export const intussusception_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'small_bowel',
  onset: 'acute',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'colicky_pain',
  associatedSymptoms: ['vomiting'],
  riskContext: ['none'],
  mechanism: 'ischemic',
  typicalDescription: 'Intermittent severe colicky abdominal pain in an infant with drawing up of legs, followed by currant jelly stools from venous congestion of the intussuscepted bowel.',
});

export const juvenile_polyps_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematochezia'],
  site: 'rectal',
  onset: 'intermittent',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'neoplastic',
  typicalDescription: 'Painless bright red blood per rectum in a child aged 2-10 years. Benign hamartomatous polyps. Most common cause of pediatric hematochezia. Polyps may prolapse or auto-amputate.',
});

export const vitamin_k_deficiency_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena', 'hematochezia'],
  site: 'variable',
  onset: 'acute',
  severity: 'moderate',
  character: 'variable',
  painPattern: 'painless',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'coagulopathy',
  typicalDescription: 'Neonatal GI bleeding from deficiency of vitamin K-dependent clotting factors. May involve multiple bleeding sites including umbilical stump. Preventable with vitamin K prophylaxis at birth.',
});

export const swallowed_maternal_blood_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena'],
  site: 'variable',
  onset: 'acute',
  severity: 'mild_self_limited',
  character: 'bright_red',
  painPattern: 'painless',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'mechanical_trauma',
  typicalDescription: 'Blood in vomit or stool of a newborn in the first 24-48 hours of life. Blood swallowed during delivery or from cracked maternal nipples. Benign and self-limited. Apt test differentiates fetal from maternal hemoglobin.',
});

// ── SECTION 8: OBSCURE / OTHER (3 nodes) ───────────────────────────────

export const obscure_gi_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['melena', 'hematochezia', 'occult'],
  site: 'small_bowel',
  onset: 'intermittent',
  severity: 'moderate',
  character: 'dark_red_maroon',
  painPattern: 'painless',
  associatedSymptoms: ['anemia', 'syncope'],
  riskContext: ['nsaid', 'anticoagulant', 'prior_gi_bleed'],
  mechanism: 'variable',
  typicalDescription: 'Recurrent or persistent GI bleeding with negative upper endoscopy and colonoscopy. Small bowel is the source in approximately 75% of cases. Capsule endoscopy is the diagnostic test of choice.',
});

export const gi_lymphoma_bleeding_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena', 'hematochezia'],
  site: 'variable',
  onset: 'chronic_occult',
  severity: 'occult',
  character: 'dark_red_maroon',
  painPattern: 'abdominal_pain',
  associatedSymptoms: ['weight_loss', 'fever'],
  riskContext: ['none'],
  mechanism: 'neoplastic',
  typicalDescription: 'Abdominal pain with weight loss, fever, night sweats, and GI bleeding. Stomach is the most common site of primary GI lymphoma, followed by small bowel. May present with a palpable mass.',
});

export const hereditary_hemorrhagic_telangiectasia_manifestation: GiBleedingManifestation = gm({
  bleedingType: ['hematemesis', 'melena', 'hematochezia'],
  site: 'variable',
  onset: 'intermittent',
  severity: 'mild_self_limited',
  character: 'variable',
  painPattern: 'painless',
  associatedSymptoms: ['anemia'],
  riskContext: ['none'],
  mechanism: 'vascular_malformation',
  typicalDescription: 'Recurrent multi-site GI bleeding in a patient with known Osler-Weber-Rendu syndrome. Telangiectasias throughout the GI tract cause chronic intermittent bleeding. Epistaxis and family history are typical.',
});

// ═══════════════════════════════════════════════════════════════════════════════
// Manifestation Map — all 50 GI bleeding disease nodes
// ═══════════════════════════════════════════════════════════════════════════════

export const GI_BLEEDING_MANIFESTATIONS: Record<string, GiBleedingManifestation> = {
  // ── SECTION 1: UGIB — ESOPHAGEAL (8) ──
  esophageal_varices_bleeding: esophageal_varices_bleeding_manifestation,
  gastric_varices_bleeding: gastric_varices_bleeding_manifestation,
  mallory_weiss_tear: mallory_weiss_tear_manifestation,
  reflux_esophagitis_bleeding: reflux_esophagitis_bleeding_manifestation,
  infectious_esophagitis_bleeding: infectious_esophagitis_bleeding_manifestation,
  esophageal_cancer_bleeding: esophageal_cancer_bleeding_manifestation,
  boerhaave_syndrome: boerhaave_syndrome_manifestation,
  pill_esophagitis_bleeding: pill_esophagitis_bleeding_manifestation,

  // ── SECTION 2: UGIB — GASTRODUODENAL (9) ──
  gastric_ulcer_bleeding: gastric_ulcer_bleeding_manifestation,
  duodenal_ulcer_bleeding: duodenal_ulcer_bleeding_manifestation,
  acute_gastritis_bleeding: acute_gastritis_bleeding_manifestation,
  stress_gastritis_icu_bleeding: stress_gastritis_icu_bleeding_manifestation,
  gastric_cancer_bleeding: gastric_cancer_bleeding_manifestation,
  dieulafoy_lesion: dieulafoy_lesion_manifestation,
  cameron_ulcers: cameron_ulcers_manifestation,
  gastric_erosions_nsaid: gastric_erosions_nsaid_manifestation,
  gastric_antral_vascular_ectasia: gastric_antral_vascular_ectasia_manifestation,

  // ── SECTION 3: UGIB — VASCULAR/EMERGENCY (3) ──
  aortoenteric_fistula: aortoenteric_fistula_manifestation,
  hemobilia: hemobilia_manifestation,
  pancreatic_pseudocyst_bleeding: pancreatic_pseudocyst_bleeding_manifestation,

  // ── SECTION 4: LGIB — COLONIC (10) ──
  diverticular_bleeding: diverticular_bleeding_manifestation,
  colorectal_cancer_bleeding: colorectal_cancer_bleeding_manifestation,
  colonic_angiodysplasia: colonic_angiodysplasia_manifestation,
  ischemic_colitis_bleeding: ischemic_colitis_bleeding_manifestation,
  ulcerative_colitis_bleeding: ulcerative_colitis_bleeding_manifestation,
  crohn_colitis_bleeding: crohn_colitis_bleeding_manifestation,
  infectious_colitis_bleeding: infectious_colitis_bleeding_manifestation,
  radiation_colitis_bleeding: radiation_colitis_bleeding_manifestation,
  solitary_rectal_ulcer_syndrome: solitary_rectal_ulcer_syndrome_manifestation,
  stercoral_ulcer_bleeding: stercoral_ulcer_bleeding_manifestation,

  // ── SECTION 5: LGIB — ANORECTAL (4) ──
  hemorrhoids_bleeding: hemorrhoids_bleeding_manifestation,
  anal_fissure_bleeding: anal_fissure_bleeding_manifestation,
  rectal_polyps_bleeding: rectal_polyps_bleeding_manifestation,
  proctitis_bleeding: proctitis_bleeding_manifestation,

  // ── SECTION 6: SMALL BOWEL (8) ──
  meckel_diverticulum_bleeding: meckel_diverticulum_bleeding_manifestation,
  crohn_enteritis_bleeding: crohn_enteritis_bleeding_manifestation,
  small_bowel_tumor_bleeding: small_bowel_tumor_bleeding_manifestation,
  small_bowel_angiodysplasia: small_bowel_angiodysplasia_manifestation,
  nsaid_enteropathy_bleeding: nsaid_enteropathy_bleeding_manifestation,
  tuberculous_enteritis_bleeding: tuberculous_enteritis_bleeding_manifestation,
  typhoid_intestinal_bleeding: typhoid_intestinal_bleeding_manifestation,
  jejunal_diverticulosis_bleeding: jejunal_diverticulosis_bleeding_manifestation,

  // ── SECTION 7: PEDIATRIC / NEONATAL (5) ──
  necrotizing_enterocolitis_bleeding: necrotizing_enterocolitis_bleeding_manifestation,
  intussusception_bleeding: intussusception_bleeding_manifestation,
  juvenile_polyps_bleeding: juvenile_polyps_bleeding_manifestation,
  vitamin_k_deficiency_bleeding: vitamin_k_deficiency_bleeding_manifestation,
  swallowed_maternal_blood: swallowed_maternal_blood_manifestation,

  // ── SECTION 8: OBSCURE / OTHER (3) ──
  obscure_gi_bleeding: obscure_gi_bleeding_manifestation,
  gi_lymphoma_bleeding: gi_lymphoma_bleeding_manifestation,
  hereditary_hemorrhagic_telangiectasia: hereditary_hemorrhagic_telangiectasia_manifestation,
};

export function getGiBleedingDiseaseIds(): string[] {
  return Object.keys(GI_BLEEDING_MANIFESTATIONS);
}

export function getGiBleedingManifestation(diseaseId: string): GiBleedingManifestation | undefined {
  return GI_BLEEDING_MANIFESTATIONS[diseaseId];
}

export function hasGiBleedingManifestation(diseaseId: string): boolean {
  return diseaseId in GI_BLEEDING_MANIFESTATIONS;
}
