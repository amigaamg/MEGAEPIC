import type { DepartmentDefinition } from './index';

export const neurology: DepartmentDefinition = {
  id: 'NEURO',
  name: 'Neurology',
  shortName: 'NEURO',
  description: 'Disorders of the brain, spinal cord, peripheral nerves, and neuromuscular junction.',
  icon: '🧠',
  color: '#ec4899',
  sections: [
    {
      id: 'cerebrovascular',
      name: 'Cerebrovascular Disease',
      description: 'Stroke, transient ischaemic attack and cerebral haemorrhage',
      diseaseCategories: ['Ischaemic stroke', 'Haemorrhagic stroke', 'TIA', 'Cerebral venous sinus thrombosis', 'Intracerebral haemorrhage', 'Subarachnoid haemorrhage'],
    },
    {
      id: 'epilepsy',
      name: 'Epilepsy & Seizure Disorders',
      description: 'Recurrent unprovoked seizures and epilepsy syndromes',
      diseaseCategories: ['Generalised epilepsy', 'Focal epilepsy', 'Status epilepticus', 'Febrile seizures', 'First unprovoked seizure', 'Epilepsy in pregnancy'],
    },
    {
      id: 'neurodegenerative',
      name: 'Neurodegenerative Disorders',
      description: 'Progressive neurological conditions with neuronal loss',
      diseaseCategories: ['Alzheimer disease', 'Parkinson disease', 'Motor neurone disease', 'Huntington disease', 'Multiple system atrophy', 'Progressive supranuclear palsy', 'Lewy body dementia'],
    },
    {
      id: 'demyelinating',
      name: 'Demyelinating Disease',
      description: 'Conditions affecting myelin in the central and peripheral nervous system',
      diseaseCategories: ['Multiple sclerosis', 'Neuromyelitis optica', 'Transverse myelitis', 'Acute disseminated encephalomyelitis', 'Guillain-Barre syndrome', 'Chronic inflammatory demyelinating polyneuropathy'],
    },
    {
      id: 'neuromuscular',
      name: 'Neuromuscular Disorders',
      description: 'Diseases of the motor unit including nerve, muscle and neuromuscular junction',
      diseaseCategories: ['Myasthenia gravis', 'Muscular dystrophy', 'Myopathy', 'Peripheral neuropathy', 'Mononeuritis multiplex', 'Plexopathy'],
    },
    {
      id: 'headache',
      name: 'Headache & Pain Disorders',
      description: 'Primary and secondary headache syndromes, facial pain',
      diseaseCategories: ['Migraine', 'Tension-type headache', 'Cluster headache', 'Trigeminal neuralgia', 'Medication-overuse headache', 'Idiopathic intracranial hypertension'],
    },
  ],
  commonSymptoms: [
    'headache', 'dizziness', 'vertigo', 'syncope', 'seizures',
    'loss_of_consciousness', 'confusion', 'memory_loss', 'cognitive_decline',
    'speech_disturbance', 'dysphasia', 'dysarthria', 'dysphagia',
    'visual_disturbance', 'diplopia', 'visual_field_loss', 'ptosis',
    'facial_droop', 'hemiparesis', 'hemisensory_loss', 'ataxia',
    'tremor', 'involuntary_movements', 'gait_disturbance',
    'muscle_weakness', 'numbness', 'tingling', 'burning_pain',
    'radicular_pain', 'bladder_dysfunction', 'bowel_dysfunction',
  ],
  commonInvestigations: [
    'CT head', 'MRI brain', 'MRA/MRV', 'EEG', 'Lumbar puncture', 'CSF analysis',
    'Nerve conduction studies', 'EMG', 'Visual evoked potentials',
    'Carotid doppler', 'Echocardiogram', 'ECG', 'Holter monitor',
    'Autoimmune encephalitis panel', 'Anti-AChR antibodies', 'Anti-MuSK',
    'Genetic testing', 'Vitamin B12', 'Copper studies', 'HIV',
    'Syphilis serology', 'ESR', 'CRP', 'Autoimmune screen',
  ],
};
