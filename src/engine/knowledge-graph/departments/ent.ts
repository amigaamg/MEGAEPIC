import type { DepartmentDefinition } from './index';

export const ent: DepartmentDefinition = {
  id: 'ENT',
  name: 'Ear, Nose & Throat (Otolaryngology)',
  shortName: 'ENT',
  description: 'Medical and surgical management of disorders of the ear, nose, throat, head and neck region.',
  icon: '👂',
  color: '#14b8a6',
  sections: [
    {
      id: 'otology',
      name: 'Otology & Hearing Disorders',
      description: 'Conditions affecting the ear and hearing',
      diseaseCategories: ['Otitis externa', 'Otitis media', 'Chronic suppurative otitis media', 'Cholesteatoma', 'Hearing loss', 'Tinnitus', 'Meniere disease', 'Vestibular neuritis', 'Perforated tympanic membrane'],
    },
    {
      id: 'rhinology',
      name: 'Rhinology & Sinus Disease',
      description: 'Nasal and sinus conditions',
      diseaseCategories: ['Allergic rhinitis', 'Chronic rhinosinusitis', 'Nasal polyps', 'Acute sinusitis', 'Epistaxis', 'Deviated nasal septum', 'Nasal fracture', 'Olfactory disorders', 'CSF rhinorrhoea'],
    },
    {
      id: 'laryngology',
      name: 'Laryngology & Voice Disorders',
      description: 'Disorders of the larynx, pharynx and voice',
      diseaseCategories: ['Laryngitis', 'Vocal cord nodules/polyps', 'Vocal cord palsy', 'Laryngeal papillomatosis', 'Dysphonia', 'Laryngeal cancer', 'Airway stenosis', 'Foreign body in airway'],
    },
    {
      id: 'head-neck-ent',
      name: 'Head & Neck Surgery',
      description: 'Tumours and masses of the head and neck',
      diseaseCategories: ['Neck lump', 'Cervical lymphadenopathy', 'Thyroid mass', 'Salivary gland tumours', 'Branchial cleft cyst', 'Thyroglossal duct cyst', 'Head and neck squamous cell carcinoma'],
    },
    {
      id: 'paediatric-ent',
      name: 'Paediatric ENT',
      description: 'ENT conditions in children',
      diseaseCategories: ['Tonsillitis', 'Adenoid hypertrophy', 'Otitis media with effusion/glue ear', 'Recurrent tonsillitis', 'Tonsillectomy', 'Grommet insertion', 'Foreign body ear/nose'],
    },
    {
      id: 'sleep-ent',
      name: 'Sleep Disordered Breathing',
      description: 'Obstructive sleep apnoea and snoring surgery',
      diseaseCategories: ['Snoring', 'Obstructive sleep apnoea surgical', 'Tonsillar hypertrophy', 'Uvulopalatopharyngoplasty', 'Hypoglossal nerve stimulation'],
    },
  ],
  commonSymptoms: [
    'ear_pain', 'ear_discharge', 'hearing_loss', 'tinnitus',
    'vertigo', 'dizziness', 'fullness_in_ear', 'nasal_congestion',
    'runny_nose', 'postnasal_drip', 'sneezing', 'facial_pain',
    'headache_sinus', 'epistaxis', 'loss_of_smell', 'nasal_obstruction',
    'sore_throat', 'dysphagia', 'odynophagia', 'hoarseness',
    'voice_change', 'lump_in_throat', 'globus', 'neck_mass',
    'snoring', 'mouth_breathing', 'tonsillar_exudate',
    'airway_obstruction', 'stridor', 'cough',
  ],
  commonInvestigations: [
    'Otoscopy', 'Tuning fork tests (Rinne/Weber)', 'Pure tone audiometry',
    'Tympanometry', 'Otoacoustic emissions', 'Nasal endoscopy',
    'Flexible laryngoscopy', 'Stroboscopy', 'CT sinuses', 'CT temporal bone',
    'MRI internal auditory meatus', 'Barium swallow',
    'Fine needle aspiration of neck mass', 'Ultrasound neck',
    'Allergy testing', 'Rhinomanometry', 'Sleep study', 'Biopsy',
  ],
};
