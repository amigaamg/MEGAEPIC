import type { DepartmentDefinition } from './index';

export const hematology: DepartmentDefinition = {
  id: 'HAEM',
  name: 'Hematology',
  shortName: 'HAEM',
  description: 'Disorders of blood, bone marrow and lymphatic systems including benign haematology, haematological malignancies, haemostasis and thrombosis.',
  icon: '🩸',
  color: '#ef4444',
  sections: [
    {
      id: 'anaemia',
      name: 'Anaemia & Red Cell Disorders',
      description: 'Decreased red cell mass and haemoglobin disorders',
      diseaseCategories: ['Iron deficiency anaemia', 'Vitamin B12 deficiency', 'Folate deficiency', 'Anaemia of chronic disease', 'Sickle cell disease', 'Thalassaemia', 'Haemolytic anaemia', 'Aplastic anaemia'],
    },
    {
      id: 'haematological-malignancy',
      name: 'Haematological Malignancy',
      description: 'Cancers of blood and lymphatic systems',
      diseaseCategories: ['Acute myeloid leukaemia', 'Acute lymphoblastic leukaemia', 'Chronic myeloid leukaemia', 'Chronic lymphocytic leukaemia', 'Hodgkin lymphoma', 'Non-Hodgkin lymphoma', 'Multiple myeloma', 'Myelodysplastic syndrome'],
    },
    {
      id: 'haemostasis',
      name: 'Haemostasis & Thrombosis',
      description: 'Bleeding disorders and thrombotic conditions',
      diseaseCategories: ['Haemophilia A', 'Haemophilia B', 'Von Willebrand disease', 'Venous thromboembolism', 'Pulmonary embolism', 'Antiphospholipid syndrome', 'Thrombophilia', 'Thrombotic thrombocytopenic purpura'],
    },
    {
      id: 'transfusion',
      name: 'Transfusion Medicine',
      description: 'Blood component therapy, transfusion reactions, blood banking',
      diseaseCategories: ['Transfusion-dependent anaemia', 'Massive transfusion', 'Transfusion reaction', 'Haemolytic disease of newborn', 'Blood group incompatibility'],
    },
    {
      id: 'stem-cell-transplant',
      name: 'Stem Cell Transplantation',
      description: 'Autologous and allogeneic haematopoietic stem cell transplant',
      diseaseCategories: ['Autologous SCT', 'Allogeneic SCT', 'Graft versus host disease', 'Engraftment syndrome', 'Transplant-associated microangiopathy'],
    },
  ],
  commonSymptoms: [
    'fatigue', 'weakness', 'pallor', 'dyspnoea_on_exertion',
    'palpitations', 'dizziness', 'headache', 'cold_intolerance',
    'easy_bruising', 'spontaneous_bruising', 'petechiae',
    'purpura', 'prolonged_bleeding', 'epistaxis', 'gum_bleeding',
    'menorrhagia', 'haemarthrosis', 'haematoma', 'bone_pain',
    'lymphadenopathy', 'splenomegaly', 'hepatomegaly',
    'fever', 'night_sweats', 'weight_loss', 'recurrent_infections',
    'leg_swelling', 'calibre_pain', 'superficial_thrombophlebitis',
  ],
  commonInvestigations: [
    'FBC', 'Blood film', 'Reticulocyte count', 'Haematinics (B12, folate, ferritin)',
    'Iron studies', 'Hb electrophoresis', 'Coagulation screen', 'PT', 'APTT',
    'Fibrinogen', 'D-dimer', 'Bone marrow aspiration', 'Bone marrow trephine biopsy',
    'Flow cytometry', 'Cytogenetics', 'FISH', 'PCR for BCR-ABL',
    'Serum protein electrophoresis', 'Immunofixation', 'Free light chains',
    'Lymph node biopsy', 'CT PET scan', 'JAK2 mutation',
    'Factor assays', 'Von Willebrand factor', 'Antiphospholipid antibodies',
    'Direct Coombs test', 'Blood group and antibody screen',
  ],
};
