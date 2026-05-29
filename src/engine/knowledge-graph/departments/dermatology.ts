import type { DepartmentDefinition } from './index';

export const dermatology: DepartmentDefinition = {
  id: 'DERM',
  name: 'Dermatology',
  shortName: 'DERM',
  description: 'Diagnosis and management of diseases of the skin, hair, nails and mucous membranes, including medical, surgical and cosmetic dermatology.',
  icon: '🩹',
  color: '#fb7185',
  sections: [
    {
      id: 'inflammatory',
      name: 'Inflammatory Skin Disease',
      description: 'Immune-mediated and inflammatory skin conditions',
      diseaseCategories: ['Atopic dermatitis (eczema)', 'Psoriasis', 'Contact dermatitis', 'Seborrhoeic dermatitis', 'Lichen planus', 'Rosacea', 'Acne vulgaris'],
    },
    {
      id: 'skin-infections',
      name: 'Skin Infections & Infestations',
      description: 'Infectious conditions of the skin',
      diseaseCategories: ['Cellulitis', 'Impetigo', 'Fungal skin infections', 'Herpes simplex', 'Herpes zoster', 'Scabies', 'Pediculosis', 'Molluscum contagiosum', 'Warts'],
    },
    {
      id: 'skin-cancer',
      name: 'Skin Cancer & Photodermatology',
      description: 'Benign and malignant skin tumours, photosensitivity disorders',
      diseaseCategories: ['Basal cell carcinoma', 'Squamous cell carcinoma', 'Malignant melanoma', 'Actinic keratosis', 'Dysplastic naevus', 'Photodermatoses', 'Melanoma in situ'],
    },
    {
      id: 'autoimmune-skin',
      name: 'Autoimmune & Bullous Disorders',
      description: 'Autoimmune blistering and connective tissue skin diseases',
      diseaseCategories: ['Pemphigus vulgaris', 'Bullous pemphigoid', 'Dermatitis herpetiformis', 'Scleroderma', 'Lupus erythematosus', 'Dermatomyositis', 'Vasculitis'],
    },
    {
      id: 'hair-nail',
      name: 'Hair & Nail Disorders',
      description: 'Disorders of hair growth and nail structure',
      diseaseCategories: ['Alopecia areata', 'Androgenetic alopecia', 'Hirsutism', 'Nail psoriasis', 'Onychomycosis', 'Ingrown toenail', 'Telogen effluvium'],
    },
    {
      id: 'paediatric-derm',
      name: 'Paediatric Dermatology',
      description: 'Skin conditions in children',
      diseaseCategories: ['Infantile haemangioma', 'Nappy rash', 'Childhood eczema', 'Keratosis pilaris', 'Viral exanthems', 'Epidermolysis bullosa'],
    },
  ],
  commonSymptoms: [
    'rash', 'pruritus', 'itching', 'dry_skin', 'scaling',
    'erythema', 'blister', 'vesicle', 'pustule', 'weal',
    'hives', 'eczema', 'lichenification', 'fissure', 'ulcer',
    'erosion', 'crust', 'nodule', 'tumour', 'pigmentation_change',
    'hypopigmentation', 'hyperpigmentation', 'hair_loss',
    'nail_dystrophy', 'nail_discolouration', 'skin_pain',
    'burning_sensation', 'photosensitivity', 'dermographism',
  ],
  commonInvestigations: [
    'Skin biopsy', 'Punch biopsy', 'Shave biopsy', 'Incisional biopsy',
    'Dermatoscopy', 'Wood lamp examination', 'Skin scraping for fungi',
    'KOH preparation', 'Patch testing', 'Prick testing',
    'Blood IgE', 'Autoimmune serology', 'ANA', 'Anti-dsDNA',
    'Anti-Sm', 'Anti-Ro/La', 'Immunofluorescence',
    'Bacterial swab', 'Viral PCR', 'Fungal culture',
    'CT/MRI for skin cancer staging', 'Sentinel lymph node biopsy',
  ],
};
