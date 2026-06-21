// ═══════════════════════════════════════════════════════════════════════════════
// Dysphagia Manifestation Profiles
// Every disease that causes dysphagia describes its typical pattern here.
// The engine uses these to ask discriminating questions and generate better HPI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DysphagiaManifestation } from '../diseaseNode';

function dm(opts: DysphagiaManifestation): DysphagiaManifestation {
  return opts;
}

// ── SECTION 1: OROPHARYNGEAL NEUROLOGICAL (15 nodes) ────────────────────

export const stroke_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Acute-onset oropharyngeal dysphagia following stroke, with coughing and choking on thin liquids.',
});

export const pseudobulbar_palsy_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Spastic dysphagia with dysarthria and emotional lability due to bilateral UMN lesions. Liquids often cause more difficulty than solids.',
});

export const parkinson_disease_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Late-stage Parkinson disease with oropharyngeal dysphagia, drooling, and silent aspiration. Onset is insidious, years after motor symptoms.',
});

export const multiple_sclerosis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'variable',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Relapsing-remitting oropharyngeal dysphagia correlating with MS disease activity. Improves between relapses but may accumulate over time.',
});

export const motor_neurone_disease_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Rapidly progressive oropharyngeal dysphagia with dysarthria and tongue fasciculations. Both UMN and LMN signs are present. PEG tube is often needed within months.',
});

export const myasthenia_gravis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Fatigable oropharyngeal dysphagia that worsens with prolonged eating and as the day progresses. Symptoms fluctuate and improve with rest or acetylcholinesterase inhibitors.',
});

export const bulbar_palsy_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'variable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Flaccid dysphagia with nasal regurgitation, nasal speech, and tongue fasciculations due to lower motor neuron bulbar involvement.',
});

export const huntington_disease_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Progressive oropharyngeal dysphagia in Huntington disease, driven by choreiform movements disrupting coordinated swallowing. Aspiration risk increases as disease advances.',
});

export const cerebral_palsy_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'variable',
  onset: 'chronic_progressive',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Lifelong oropharyngeal dysphagia in cerebral palsy due to impaired motor control of swallowing. Drooling and aspiration are common. Severity is stable but may require feeding adaptations.',
});

export const dementia_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Gradual loss of swallowing ability in advanced dementia. Patients may forget to chew, hold food in the mouth, or fail to initiate the swallow reflex.',
});

export const brainstem_tumour_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Progressive oropharyngeal dysphagia due to brainstem tumour affecting cranial nerve nuclei. Associated neurological deficits include ataxia, headache, and long-tract signs.',
});

export const guillain_barre_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'acute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Acute onset oropharyngeal dysphagia with ascending weakness and areflexia. Bulbar involvement signals high risk of respiratory failure requiring ICU monitoring.',
});

export const inclusion_body_myositis_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration'],
  riskContext: ['autoimmune'],
  mechanism: 'inflammatory',
  typicalDescription: 'Slowly progressive oropharyngeal dysphagia in an older patient with characteristic finger flexor and quadriceps weakness. Poor response to immunosuppression.',
});

export const oculopharyngeal_muscular_dystrophy_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_then_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration'],
  riskContext: ['none'],
  mechanism: 'neurological',
  typicalDescription: 'Progressive dysphagia starting after age 50 with bilateral ptosis. Family history is often present. Dysphagia slowly worsens over decades.',
});

export const post_polio_syndrome_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'New or worsening oropharyngeal dysphagia decades after acute poliomyelitis. Nasal regurgitation and aspiration may occur.',
});

// ── SECTION 2: STRUCTURAL ENT (12 nodes) ────────────────────────────────

export const oropharyngeal_tumour_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'both',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['weight_loss', 'neck_mass', 'hoarseness'],
  riskContext: ['smoking_alcohol'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia and odynophagia with neck mass and weight loss in a smoking/alcohol user. Pain referred to the ear is classic.',
});

export const nasopharyngeal_carcinoma_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['neck_mass', 'hoarseness'],
  riskContext: ['smoking_alcohol'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia with neck mass, often with ipsilateral ear pain. Common in Southeast Asian populations. May present with cranial nerve palsies.',
});

export const laryngeal_tumour_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'both',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['hoarseness', 'neck_mass', 'weight_loss'],
  riskContext: ['smoking_alcohol'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive hoarseness with dysphagia and throat pain in a heavy smoker. Supraglottic tumours may present with stridor and aspiration.',
});

export const zenker_diverticulum_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation', 'aspiration', 'choking', 'halitosis'],
  riskContext: ['none'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia with regurgitation of undigested food eaten hours earlier, halitosis, and neck gurgling. Symptoms worse when lying flat.',
});

export const cricopharyngeal_bar_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking'],
  riskContext: ['none'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia with sensation of food stuck in the throat, choking episodes, and aspiration. Barium swallow shows a prominent cricopharyngeal impression.',
});

export const globus_pharyngeus_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'intermittent_solids',
  onset: 'intermittent',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['none'],
  riskContext: ['gerd'],
  mechanism: 'functional',
  typicalDescription: 'Persistent sensation of a lump in the throat without actual swallowing difficulty. Symptoms are non-progressive and worse with anxiety or lying supine.',
});

export const goiter_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['neck_mass', 'hoarseness'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Dysphagia due to a large goiter compressing the esophagus. Neck mass is prominent. Symptoms worsen when lying flat.',
});

export const retropharyngeal_abscess_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'acute',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever', 'neck_mass'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Acute onset severe odynophagia with fever, neck pain, and torticollis. Typically in children following URI. Stridor signals impending airway loss.',
});

export const epiglottitis_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Acute rapidly progressive severe odynophagia with drooling fever and muffled voice. The classic tripod positioning signals impending airway emergency.',
});

export const pharyngitis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'burning',
  associatedSymptoms: ['fever'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Acute odynophagia with sore throat, fever, and erythematous tonsils. Self-limiting over 5-7 days. Common in children and young adults.',
});

export const peritonsillar_abscess_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever'],
  riskContext: ['none'],
  mechanism: 'infectious',
  typicalDescription: 'Severe unilateral throat pain with odynophagia, trismus, and referred ear pain following acute tonsillitis. Uvular deviation away from the abscess is classic.',
});

export const cervical_osteophyte_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Dysphagia due to anterior cervical osteophytes compressing the pharyngoesophageal segment. Associated with neck pain and stiffness. More common in elderly.',
});

// ── SECTION 3: ESOPHAGEAL MECHANICAL (16 nodes) ─────────────────────────

export const esophageal_carcinoma_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'solids_then_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['weight_loss', 'regurgitation'],
  riskContext: ['smoking_alcohol', 'gerd'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia starting with solids and advancing to liquids. Weight loss is prominent. Retrosternal pain and regurgitation are common.',
});

export const esophageal_squamous_cell_carcinoma_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'solids_then_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['weight_loss', 'hoarseness', 'regurgitation'],
  riskContext: ['smoking_alcohol'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia in a heavy smoker/drinker. Mid-esophageal tumour causing solid-to-liquid progression with weight loss and hoarseness.',
});

export const esophageal_adenocarcinoma_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_then_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['weight_loss', 'heartburn', 'regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia at the GEJ in a patient with chronic GERD and Barrett esophagus. Weight loss and heartburn are common.',
});

export const peptic_esophageal_stricture_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn'],
  riskContext: ['gerd'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Slowly progressive solid food dysphagia in a patient with long-standing GERD. Heartburn is prominent. Responds to dilation.',
});

export const schatzki_ring_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'intermittent_solids',
  onset: 'intermittent',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Intermittent solid food dysphagia with episodes of food sticking at the lower sternum. Can present acutely with steak impaction (steakhouse syndrome).',
});

export const esophageal_web_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'intermittent_solids',
  onset: 'intermittent',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Intermittent solid food dysphagia from a thin mucosal web in the cervical esophagus. May be associated with Plummer-Vinson syndrome (iron deficiency anaemia).',
});

export const eosinophilic_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'intermittent_solids',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'inflammatory',
  typicalDescription: 'Intermittent dysphagia and food impaction in a young adult with atopic history. Heartburn and chest pain are common. Responds to PPI or swallowed steroids.',
});

export const pill_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn'],
  riskContext: ['medication'],
  mechanism: 'inflammatory',
  typicalDescription: 'Acute onset of severe retrosternal pain and odynophagia after taking a pill (especially doxycycline, bisphosphonates, or NSAIDs) with insufficient water.',
});

export const caustic_esophageal_stricture_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'solids_then_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'burning',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['caustic'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia developing weeks to months after caustic ingestion. Strictures are often long and may require repeated dilation or surgical reconstruction.',
});

export const esophageal_foreign_body_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'sharp',
  associatedSymptoms: ['regurgitation', 'aspiration'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Acute onset of complete or partial dysphagia after swallowing a foreign body (e.g., meat, coin, bone). Pain is localised to the level of impaction.',
});

export const esophageal_diverticulum_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation', 'halitosis', 'aspiration'],
  riskContext: ['none'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Chronic dysphagia with regurgitation of stagnant food, halitosis, and nocturnal aspiration. Mid-esophageal or epiphrenic diverticulum may present with chest pain.',
});

export const barrett_esophagus_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Dysphagia developing in a patient with known Barrett esophagus due to stricture formation or malignant transformation. Long-standing GERD with heartburn is typical.',
});

export const gastric_cardiac_cancer_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_then_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['weight_loss', 'regurgitation'],
  riskContext: ['smoking_alcohol'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia at the GEJ due to gastric cardiac carcinoma extending into the distal esophagus. Weight loss and early satiety are prominent.',
});

export const esophageal_leiomyoma_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Slowly progressive solid food dysphagia from a benign esophageal leiomyoma. Symptoms may be present for years before diagnosis. No weight loss or pain.',
});

export const post_fundoplication_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'subacute',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Post-operative dysphagia following fundoplication. Early dysphagia is common and often resolves. Persistent dysphagia suggests a tight wrap or slipped fundoplication.',
});

export const post_radiation_esophageal_stricture_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'solids_then_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia developing months to years after mediastinal radiation therapy for cancer. Strictures are often long and may be associated with fistula.',
});

// ── SECTION 4: ESOPHAGEAL MOTILITY (10 nodes) ──────────────────────────

export const achalasia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['regurgitation', 'weight_loss'],
  riskContext: ['none'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Progressive dysphagia for both solids and liquids from the onset. Regurgitation of undigested food, nocturnal cough, and weight loss are common. Barium swallow shows a dilated esophagus with bird-beak narrowing.',
});

export const diffuse_esophageal_spasm_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['regurgitation', 'heartburn'],
  riskContext: ['gerd'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Intermittent dysphagia with severe retrosternal chest pain that mimics angina. Symptoms are episodic and may be triggered by cold liquids or stress.',
});

export const nutcracker_esophagus_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['heartburn'],
  riskContext: ['gerd'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Chest pain and intermittent dysphagia with high-amplitude peristaltic contractions on manometry. Pain may be severe and mimic cardiac ischaemia.',
});

export const jackhammer_esophagus_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['heartburn'],
  riskContext: ['gerd'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Severe chest pain with dysphagia due to hypercontractile (jackhammer) esophageal contractions. Symptoms may be debilitating and difficult to treat.',
});

export const ineffective_esophageal_motility_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia with poor esophageal clearance due to weak or failed peristalsis. Often associated with GERD. Symptoms include food sticking and heartburn.',
});

export const scleroderma_esophagus_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['autoimmune'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia in systemic sclerosis with absent peristalsis and a patulous lower esophageal sphincter. Severe reflux is common. Both solids and liquids are affected.',
});

export const crst_syndrome_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['autoimmune'],
  mechanism: 'motility_disorder',
  typicalDescription: 'CRST syndrome (calcinosis, Raynaud, sclerodactyly, telangiectasias) with esophageal dysmotility causing dysphagia and severe reflux. Both solids and liquids are affected.',
});

export const hypertensive_les_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'intermittent',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['heartburn'],
  riskContext: ['gerd'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia due to a hypertensive lower esophageal sphincter with normal peristalsis. May cause food sticking at the GEJ without the dilation seen in achalasia.',
});

export const secondary_achalasia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation', 'weight_loss'],
  riskContext: ['none'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Pseudoachalasia from malignant infiltration (e.g., gastric cancer, lung cancer) mimicking primary achalasia. Rapid progression and weight loss suggest secondary cause.',
});

export const diabetic_gastroparesis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'both',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia in a patient with long-standing diabetes and gastroparesis. Both esophageal and gastric emptying are delayed. Nausea, vomiting, and early satiety are associated.',
});

// ── SECTION 5: INFECTIOUS ESOPHAGITIS (8 nodes) ────────────────────────

export const candida_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'subacute',
  progression: 'stable',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn'],
  riskContext: ['hiv', 'immunosuppression'],
  mechanism: 'infectious',
  typicalDescription: 'Odynophagia and dysphagia in an immunocompromised patient. Oral thrush is often present. Endoscopy shows white plaques in the esophagus.',
});

export const herpes_simplex_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever', 'heartburn'],
  riskContext: ['immunosuppression'],
  mechanism: 'infectious',
  typicalDescription: 'Acute severe odynophagia with fever in an immunocompromised patient. Endoscopy shows vesicular lesions or punched-out ulcers in the mid-distal esophagus.',
});

export const cmv_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'subacute',
  progression: 'stable',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever', 'heartburn'],
  riskContext: ['hiv', 'immunosuppression'],
  mechanism: 'infectious',
  typicalDescription: 'Subacute odynophagia and dysphagia in a severely immunocompromised patient (CD4 < 100). Endoscopy shows large, shallow, linear ulcers in the distal esophagus.',
});

export const hiv_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'subacute',
  progression: 'stable',
  painCharacter: 'burning',
  associatedSymptoms: ['fever', 'heartburn'],
  riskContext: ['hiv'],
  mechanism: 'infectious',
  typicalDescription: 'Odynophagia and dysphagia in an HIV patient, often due to opportunistic infections (Candida, CMV, HSV) or HIV-related ulcers. CD4 count guides aetiology.',
});

export const bacterial_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever'],
  riskContext: ['immunosuppression'],
  mechanism: 'infectious',
  typicalDescription: 'Acute onset of severe odynophagia and dysphagia in a neutropenic or immunocompromised patient. Bacterial plaques or pseudomembranes on endoscopy.',
});

export const tuberculous_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'deep_retrosternal',
  associatedSymptoms: ['fever', 'weight_loss'],
  riskContext: ['hiv', 'immunosuppression'],
  mechanism: 'infectious',
  typicalDescription: 'Subacute dysphagia with constitutional symptoms (fever, night sweats, weight loss) in a patient from a TB-endemic area or immunocompromised host.',
});

export const reflux_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'chronic_progressive',
  progression: 'intermittent',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['gerd'],
  mechanism: 'inflammatory',
  typicalDescription: 'Heartburn-predominant dysphagia with retrosternal burning and acid regurgitation. Dysphagia may indicate erosive esophagitis or peptic stricture formation.',
});

export const aphthous_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'sharp',
  associatedSymptoms: ['fever'],
  riskContext: ['hiv', 'immunosuppression'],
  mechanism: 'infectious',
  typicalDescription: 'Acute severe odynophagia with well-demarcated aphthous ulcers in the esophagus. Typically in HIV patients with low CD4 counts.',
});

// ── SECTION 6: RHEUMATOLOGICAL (6 nodes) ───────────────────────────────

export const dermatomyositis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['neurological'],
  riskContext: ['autoimmune'],
  mechanism: 'autoimmune',
  typicalDescription: 'Progressive dysphagia in a patient with proximal muscle weakness and the characteristic heliotrope rash and Gottron papules. Striated muscle involvement causes oropharyngeal dysphagia.',
});

export const polymyositis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['neurological'],
  riskContext: ['autoimmune'],
  mechanism: 'autoimmune',
  typicalDescription: 'Progressive oropharyngeal dysphagia with proximal muscle weakness and elevated muscle enzymes. No rash distinguishes from dermatomyositis.',
});

export const sjogren_syndrome_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'both',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['none'],
  riskContext: ['autoimmune'],
  mechanism: 'autoimmune',
  typicalDescription: 'Dysphagia due to xerostomia (severe dry mouth) from Sjogren syndrome. Lack of saliva impairs bolus formation and propulsion. Associated with dry eyes and parotid swelling.',
});

export const ra_cricoarytenoid_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'variable',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'sharp',
  associatedSymptoms: ['hoarseness', 'neurological'],
  riskContext: ['autoimmune'],
  mechanism: 'autoimmune',
  typicalDescription: 'Dysphagia and hoarseness from cricoarytenoid joint involvement in rheumatoid arthritis. Painful swallowing and a sensation of fullness in the throat are common.',
});

export const sarcoidosis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['none'],
  riskContext: ['autoimmune'],
  mechanism: 'autoimmune',
  typicalDescription: 'Dysphagia due to sarcoid granulomas involving the esophagus or extrinsic compression from mediastinal lymphadenopathy. Pulmonary involvement is usually present.',
});

export const eosinophilic_gastroenteritis_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'both',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'chronic_progressive',
  progression: 'intermittent',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn', 'regurgitation'],
  riskContext: ['autoimmune'],
  mechanism: 'autoimmune',
  typicalDescription: 'Dysphagia with eosinophilic infiltration of the GI tract. Abdominal pain, nausea, vomiting, and diarrhoea are associated. Responds to steroids and dietary elimination.',
});

// ── SECTION 7: PEDIATRIC (6 nodes) ─────────────────────────────────────

export const esophageal_atresia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Neonatal presentation with drooling, choking, and cyanosis after feeds. Inability to pass a nasogastric tube confirms the diagnosis. Requires urgent surgical repair.',
});

export const congenital_esophageal_stenosis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Progressive dysphagia starting in early childhood when solid foods are introduced. Caused by congenital fibromuscular stenosis of the esophagus.',
});

export const vascular_ring_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Dysphagia and respiratory symptoms in an infant or child due to a vascular ring compressing the esophagus and trachea. Symptoms include stridor, wheeze, and recurrent pneumonia.',
});

export const cricopharyngeal_achalasia_pediatric_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking'],
  riskContext: ['neurological'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Dysphagia in a neonate or infant due to failure of cricopharyngeal relaxation. Choking, aspiration, and failure to thrive are common. Diagnosed by videofluoroscopy.',
});

export const neurological_dysphagia_pediatric_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'chronic_progressive',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'neurological'],
  riskContext: ['neurological'],
  mechanism: 'neurological',
  typicalDescription: 'Oropharyngeal dysphagia in a child with global developmental delay, hypotonia, or genetic syndrome. Poor oral motor control and aspiration are common.',
});

export const laryngomalacia_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'solids_and_liquids',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'none',
  associatedSymptoms: ['aspiration', 'choking'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Inspiratory stridor and feeding difficulties in a neonate. Dysphagia due to prolapse of supraglottic structures into the airway during swallowing. Usually resolves by age 2.',
});

// ── SECTION 8: IATROGENIC / OTHER (7 nodes) ────────────────────────────

export const medication_induced_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'acute',
  progression: 'stable',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn'],
  riskContext: ['medication'],
  mechanism: 'inflammatory',
  typicalDescription: 'Acute odynophagia and retrosternal pain after taking a damaging medication (doxycycline, bisphosphonates, NSAIDs, KCl). Symptoms resolve rapidly with discontinuation.',
});

export const psychogenic_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'oropharyngeal',
  symptomType: 'dysphagia',
  foodType: 'variable',
  onset: 'intermittent',
  progression: 'intermittent',
  painCharacter: 'none',
  associatedSymptoms: ['none'],
  riskContext: ['none'],
  mechanism: 'functional',
  typicalDescription: 'Subjective sensation of swallowing difficulty without objective evidence of organic disease. Often associated with anxiety, globus sensation, or eating disorders.',
});

export const post_surgical_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'acute',
  progression: 'variable',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['none'],
  mechanism: 'mechanical_obstruction',
  typicalDescription: 'Dysphagia following esophageal, gastric, or bariatric surgery. May be due to oedema, stricture, or altered anatomy (e.g., fundoplication wrap, gastric band).',
});

export const caustic_esophageal_injury_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'variable',
  onset: 'acute',
  progression: 'progressive',
  painCharacter: 'burning',
  associatedSymptoms: ['regurgitation', 'aspiration'],
  riskContext: ['caustic'],
  mechanism: 'inflammatory',
  typicalDescription: 'Acute severe odynophagia and dysphagia following caustic ingestion. Oral burns, drooling, and chest pain are present. Stricture formation is common weeks later.',
});

export const radiation_dysphagia_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'both',
  foodType: 'solids_then_liquids',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'burning',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['none'],
  mechanism: 'inflammatory',
  typicalDescription: 'Dysphagia developing during or after mediastinal radiation. Acute mucositis causes odynophagia; late effects include stricture and fistula formation.',
});

export const graft_versus_host_esophagitis_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'odynophagia',
  foodType: 'variable',
  onset: 'subacute',
  progression: 'progressive',
  painCharacter: 'burning',
  associatedSymptoms: ['heartburn'],
  riskContext: ['immunosuppression'],
  mechanism: 'autoimmune',
  typicalDescription: 'Odynophagia and dysphagia following allogeneic stem cell transplant. GVHD causes desquamative esophagitis with webs, strictures, and mucosal fragility.',
});

export const senile_dysphagia_presbyesophagus_manifestation: DysphagiaManifestation = dm({
  phase: 'esophageal',
  symptomType: 'dysphagia',
  foodType: 'solids_only',
  onset: 'chronic_progressive',
  progression: 'progressive',
  painCharacter: 'none',
  associatedSymptoms: ['regurgitation'],
  riskContext: ['none'],
  mechanism: 'motility_disorder',
  typicalDescription: 'Age-related decline in esophageal motility causing mild solid food dysphagia in the elderly. Presbyesophagus involves decreased peristaltic amplitude and incomplete LES relaxation.',
});

// ═══════════════════════════════════════════════════════════════════════════════
// Manifestation Map — all 80 dysphagia disease nodes
// ═══════════════════════════════════════════════════════════════════════════════

export const DYSPHAGIA_MANIFESTATIONS: Record<string, DysphagiaManifestation> = {
  // ── SECTION 1: OROPHARYNGEAL NEUROLOGICAL (15) ──
  stroke_dysphagia: stroke_dysphagia_manifestation,
  pseudobulbar_palsy: pseudobulbar_palsy_manifestation,
  parkinson_disease_dysphagia: parkinson_disease_dysphagia_manifestation,
  multiple_sclerosis_dysphagia: multiple_sclerosis_dysphagia_manifestation,
  motor_neurone_disease: motor_neurone_disease_manifestation,
  myasthenia_gravis_dysphagia: myasthenia_gravis_dysphagia_manifestation,
  bulbar_palsy: bulbar_palsy_manifestation,
  huntington_disease_dysphagia: huntington_disease_dysphagia_manifestation,
  cerebral_palsy_dysphagia: cerebral_palsy_dysphagia_manifestation,
  dementia_dysphagia: dementia_dysphagia_manifestation,
  brainstem_tumour_dysphagia: brainstem_tumour_dysphagia_manifestation,
  guillain_barre_dysphagia: guillain_barre_dysphagia_manifestation,
  inclusion_body_myositis: inclusion_body_myositis_manifestation,
  oculopharyngeal_muscular_dystrophy: oculopharyngeal_muscular_dystrophy_manifestation,
  post_polio_syndrome_dysphagia: post_polio_syndrome_dysphagia_manifestation,

  // ── SECTION 2: STRUCTURAL ENT (12) ──
  oropharyngeal_tumour: oropharyngeal_tumour_manifestation,
  nasopharyngeal_carcinoma: nasopharyngeal_carcinoma_manifestation,
  laryngeal_tumour: laryngeal_tumour_manifestation,
  zenker_diverticulum: zenker_diverticulum_manifestation,
  cricopharyngeal_bar: cricopharyngeal_bar_manifestation,
  globus_pharyngeus: globus_pharyngeus_manifestation,
  goiter_dysphagia: goiter_dysphagia_manifestation,
  retropharyngeal_abscess: retropharyngeal_abscess_manifestation,
  epiglottitis: epiglottitis_manifestation,
  pharyngitis_dysphagia: pharyngitis_dysphagia_manifestation,
  peritonsillar_abscess: peritonsillar_abscess_manifestation,
  cervical_osteophyte_dysphagia: cervical_osteophyte_dysphagia_manifestation,

  // ── SECTION 3: ESOPHAGEAL MECHANICAL (16) ──
  esophageal_carcinoma: esophageal_carcinoma_manifestation,
  esophageal_squamous_cell_carcinoma: esophageal_squamous_cell_carcinoma_manifestation,
  esophageal_adenocarcinoma: esophageal_adenocarcinoma_manifestation,
  peptic_esophageal_stricture: peptic_esophageal_stricture_manifestation,
  schatzki_ring: schatzki_ring_manifestation,
  esophageal_web: esophageal_web_manifestation,
  eosinophilic_esophagitis: eosinophilic_esophagitis_manifestation,
  pill_esophagitis: pill_esophagitis_manifestation,
  caustic_esophageal_stricture: caustic_esophageal_stricture_manifestation,
  esophageal_foreign_body: esophageal_foreign_body_manifestation,
  esophageal_diverticulum: esophageal_diverticulum_manifestation,
  barrett_esophagus: barrett_esophagus_manifestation,
  gastric_cardiac_cancer: gastric_cardiac_cancer_manifestation,
  esophageal_leiomyoma: esophageal_leiomyoma_manifestation,
  post_fundoplication_dysphagia: post_fundoplication_dysphagia_manifestation,
  post_radiation_esophageal_stricture: post_radiation_esophageal_stricture_manifestation,

  // ── SECTION 4: ESOPHAGEAL MOTILITY (10) ──
  achalasia: achalasia_manifestation,
  diffuse_esophageal_spasm: diffuse_esophageal_spasm_manifestation,
  nutcracker_esophagus: nutcracker_esophagus_manifestation,
  jackhammer_esophagus: jackhammer_esophagus_manifestation,
  ineffective_esophageal_motility: ineffective_esophageal_motility_manifestation,
  scleroderma_esophagus: scleroderma_esophagus_manifestation,
  crst_syndrome: crst_syndrome_manifestation,
  hypertensive_les: hypertensive_les_manifestation,
  secondary_achalasia: secondary_achalasia_manifestation,
  diabetic_gastroparesis_dysphagia: diabetic_gastroparesis_dysphagia_manifestation,

  // ── SECTION 5: INFECTIOUS ESOPHAGITIS (8) ──
  candida_esophagitis: candida_esophagitis_manifestation,
  herpes_simplex_esophagitis: herpes_simplex_esophagitis_manifestation,
  cmv_esophagitis: cmv_esophagitis_manifestation,
  hiv_esophagitis: hiv_esophagitis_manifestation,
  bacterial_esophagitis: bacterial_esophagitis_manifestation,
  tuberculous_esophagitis: tuberculous_esophagitis_manifestation,
  reflux_esophagitis: reflux_esophagitis_manifestation,
  aphthous_esophagitis: aphthous_esophagitis_manifestation,

  // ── SECTION 6: RHEUMATOLOGICAL (6) ──
  dermatomyositis_dysphagia: dermatomyositis_dysphagia_manifestation,
  polymyositis_dysphagia: polymyositis_dysphagia_manifestation,
  sjogren_syndrome_dysphagia: sjogren_syndrome_dysphagia_manifestation,
  ra_cricoarytenoid_dysphagia: ra_cricoarytenoid_dysphagia_manifestation,
  sarcoidosis_dysphagia: sarcoidosis_dysphagia_manifestation,
  eosinophilic_gastroenteritis_dysphagia: eosinophilic_gastroenteritis_dysphagia_manifestation,

  // ── SECTION 7: PEDIATRIC (6) ──
  esophageal_atresia: esophageal_atresia_manifestation,
  congenital_esophageal_stenosis: congenital_esophageal_stenosis_manifestation,
  vascular_ring_dysphagia: vascular_ring_dysphagia_manifestation,
  cricopharyngeal_achalasia_pediatric: cricopharyngeal_achalasia_pediatric_manifestation,
  neurological_dysphagia_pediatric: neurological_dysphagia_pediatric_manifestation,
  laryngomalacia_dysphagia: laryngomalacia_dysphagia_manifestation,

  // ── SECTION 8: IATROGENIC / OTHER (7) ──
  medication_induced_dysphagia: medication_induced_dysphagia_manifestation,
  psychogenic_dysphagia: psychogenic_dysphagia_manifestation,
  post_surgical_dysphagia: post_surgical_dysphagia_manifestation,
  caustic_esophageal_injury: caustic_esophageal_injury_manifestation,
  radiation_dysphagia: radiation_dysphagia_manifestation,
  graft_versus_host_esophagitis: graft_versus_host_esophagitis_manifestation,
  senile_dysphagia_presbyesophagus: senile_dysphagia_presbyesophagus_manifestation,
};

export function getDysphagiaDiseaseIds(): string[] {
  return Object.keys(DYSPHAGIA_MANIFESTATIONS);
}

export function getDysphagiaManifestation(diseaseId: string): DysphagiaManifestation | undefined {
  return DYSPHAGIA_MANIFESTATIONS[diseaseId];
}

export function hasDysphagiaManifestation(diseaseId: string): boolean {
  return diseaseId in DYSPHAGIA_MANIFESTATIONS;
}
