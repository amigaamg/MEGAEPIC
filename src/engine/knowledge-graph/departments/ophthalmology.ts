import type { DepartmentDefinition } from './index';

export const ophthalmology: DepartmentDefinition = {
  id: 'OPHTH',
  name: 'Ophthalmology',
  shortName: 'OPHTH',
  description: 'Medical and surgical management of disorders of the eye and visual system.',
  icon: '👁️',
  color: '#06b6d4',
  sections: [
    {
      id: 'anterior-segment',
      name: 'Anterior Segment Disease',
      description: 'Conditions affecting the cornea, conjunctiva, iris and lens',
      diseaseCategories: ['Cataract', 'Glaucoma (open/closed angle)', 'Conjunctivitis', 'Keratitis', 'Corneal ulcer', 'Corneal dystrophy', 'Pterygium', 'Dry eye syndrome', 'Uveitis'],
    },
    {
      id: 'posterior-segment',
      name: 'Posterior Segment Disease',
      description: 'Conditions affecting the retina, vitreous and choroid',
      diseaseCategories: ['Diabetic retinopathy', 'Age-related macular degeneration', 'Retinal detachment', 'Retinal vein occlusion', 'Retinal artery occlusion', 'Vitreous haemorrhage', 'Retinitis pigmentosa'],
    },
    {
      id: 'neuro-ophthalmology',
      name: 'Neuro-Ophthalmology',
      description: 'Visual disorders due to neurological causes',
      diseaseCategories: ['Optic neuritis', 'Optic atrophy', 'Ischaemic optic neuropathy', 'Papilloedema', 'Visual field defects', 'Cranial nerve palsies', 'Horner syndrome', 'Nystagmus'],
    },
    {
      id: 'paediatric-ophth',
      name: 'Paediatric Ophthalmology',
      description: 'Eye conditions in children',
      diseaseCategories: ['Amblyopia', 'Strabismus', 'Retinopathy of prematurity', 'Congenital cataract', 'Congenital glaucoma', 'Paediatric vision screening'],
    },
    {
      id: 'oculoplastics',
      name: 'Oculoplastics & Orbit',
      description: 'Eyelid, lacrimal and orbital disease',
      diseaseCategories: ['Blepharitis', 'Chalazion', 'Ectropion/entropion', 'Ptosis', 'Lacrimal duct obstruction', 'Orbital fracture', 'Orbital cellulitis', 'Eyelid tumours'],
    },
    {
      id: 'emergency-ophth',
      name: 'Ophthalmic Emergencies',
      description: 'Acute sight-threatening conditions',
      diseaseCategories: ['Acute angle closure glaucoma', 'Central retinal artery occlusion', 'Open globe injury', 'Chemical eye injury', 'Hyphaema', 'Endophthalmitis', 'Orbital compartment syndrome'],
    },
  ],
  commonSymptoms: [
    'blurred_vision', 'vision_loss', 'sudden_vision_loss',
    'floaters', 'flashes_of_light', 'visual_field_defect',
    'double_vision', 'eye_pain', 'red_eye', 'photophobia',
    'excess_tearing', 'discharge', 'foreign_body_sensation',
    'itching', 'burning', 'dryness', 'halos_around_lights',
    'colour_desaturation', 'night_blindness', 'headache',
    'eye_strain', 'periorbital_swelling', 'proptosis',
    'drooping_eyelid', 'squint', 'nystagmus', 'photopsia',
  ],
  commonInvestigations: [
    'Visual acuity (Snellen)', 'Slit lamp examination', 'Fundoscopy',
    'Tonometry', 'Perimetry (visual field testing)', 'OCT',
    'Fluorescein angiography', 'Corneal topography', 'Pachymetry',
    'Schirmer test', 'Lid eversion', 'B-scan ultrasound',
    'Orbital CT', 'Orbital MRI', 'CT angiography',
    'Colour vision test (Ishihara)', 'Cover test', 'Hess chart',
    'Electroretinography', 'Optical coherence tomography angiography',
  ],
};
