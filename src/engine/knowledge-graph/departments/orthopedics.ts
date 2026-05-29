import type { DepartmentDefinition } from './index';

export const orthopedics: DepartmentDefinition = {
  id: 'ORTHO',
  name: 'Orthopedics',
  shortName: 'ORTHO',
  description: 'Diagnosis and surgical management of disorders of the musculoskeletal system including bones, joints, ligaments, tendons and muscles.',
  icon: '🦴',
  color: '#d97706',
  sections: [
    {
      id: 'trauma-ortho',
      name: 'Orthopaedic Trauma',
      description: 'Fractures, dislocations and acute musculoskeletal injuries',
      diseaseCategories: ['Upper limb fractures', 'Lower limb fractures', 'Pelvic fractures', 'Spinal fractures', 'Open fractures', 'Fracture complications', 'Dislocations', 'Periprosthetic fractures'],
    },
    {
      id: 'arthroplasty',
      name: 'Joint Replacement (Arthroplasty)',
      description: 'Replacement of damaged joints with prosthetic components',
      diseaseCategories: ['Primary hip arthroplasty', 'Primary knee arthroplasty', 'Revision arthroplasty', 'Shoulder arthroplasty', 'Elbow arthroplasty', 'Joint infection/prosthetic joint infection'],
    },
    {
      id: 'sports',
      name: 'Sports Medicine & Arthroscopy',
      description: 'Sports-related injuries and minimally invasive joint surgery',
      diseaseCategories: ['ACL tear', 'Meniscal tear', 'Rotator cuff tear', 'Shoulder instability', 'Tennis elbow', 'Achilles tendon rupture', 'Cartilage injury'],
    },
    {
      id: 'spine',
      name: 'Spine Surgery',
      description: 'Surgical conditions of the vertebral column and spinal cord',
      diseaseCategories: ['Herniated disc', 'Spinal stenosis', 'Spondylolisthesis', 'Scoliosis', 'Vertebral fracture', 'Spinal infection', 'Spinal tumour'],
    },
    {
      id: 'paediatric-ortho',
      name: 'Paediatric Orthopaedics',
      description: 'Musculoskeletal conditions in children',
      diseaseCategories: ['Developmental dysplasia of hip', 'Clubfoot', 'Legg-Calve-Perthes disease', 'Slipped capital femoral epiphysis', 'Growing pains', 'Congenital limb deformities'],
    },
    {
      id: 'hand',
      name: 'Hand & Wrist Surgery',
      description: 'Surgical conditions of the hand and wrist',
      diseaseCategories: ['Carpal tunnel syndrome', 'Trigger finger', 'Dupuytren contracture', 'Hand fractures', 'Tendon injuries', 'Nerve injuries', 'Arthritis of hand'],
    },
    {
      id: 'foot-ankle',
      name: 'Foot & Ankle Surgery',
      description: 'Surgical conditions of the foot and ankle',
      diseaseCategories: ['Ankle fracture', 'Hallux valgus (bunion)', 'Flatfoot', 'Plantar fasciitis', 'Achilles tendinopathy', 'Ankle arthritis', 'Foot deformities'],
    },
  ],
  commonSymptoms: [
    'bone_pain', 'joint_pain', 'joint_swelling', 'joint_stiffness',
    'limited_range_of_motion', 'limping', 'inability_to_weight_bear',
    'deformity', 'shortening', 'crepitus', 'instability',
    'muscle_weakness', 'muscle_atrophy', 'nerve_palsy',
    'paraesthesia', 'radiating_pain', 'back_pain', 'neck_pain',
    'shoulder_pain', 'hip_pain', 'knee_pain', 'ankle_pain',
    'foot_pain', 'hand_pain', 'wrist_pain', 'elbow_pain',
    'fracture_deformity', 'open_wound', 'compartment_syndrome',
  ],
  commonInvestigations: [
    'X-ray affected region', 'CT scan (complex fractures)', 'MRI',
    'CT angiography (trauma)', 'Bone scan', 'DEXA scan',
    'FBC', 'CRP', 'ESR', 'Coagulation screen',
    'Joint aspiration', 'Synovial fluid analysis', 'Uric acid',
    'Vascular doppler', 'Nerve conduction studies', 'Electromyography',
  ],
};
