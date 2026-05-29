import type { DepartmentDefinition } from './index';

export const gastroenterology: DepartmentDefinition = {
  id: 'GI',
  name: 'Gastroenterology',
  shortName: 'GI',
  description: 'Disorders of the gastrointestinal tract, hepatobiliary system and pancreas.',
  icon: '🩺',
  color: '#10b981',
  sections: [
    {
      id: 'upper-gi',
      name: 'Upper Gastrointestinal Disease',
      description: 'Conditions affecting the oesophagus, stomach and duodenum',
      diseaseCategories: ['Gastro-oesophageal reflux disease', 'Peptic ulcer disease', 'Gastritis', 'Dyspepsia', 'Oesophageal stricture', 'Achalasia', 'Barrett oesophagus', 'Oesophageal cancer'],
    },
    {
      id: 'lower-gi',
      name: 'Lower Gastrointestinal Disease',
      description: 'Disorders of the small intestine and colon',
      diseaseCategories: ['Irritable bowel syndrome', 'Inflammatory bowel disease', 'Crohn disease', 'Ulcerative colitis', 'Diverticulitis', 'Colorectal cancer', 'Coeliac disease', 'Intestinal obstruction'],
    },
    {
      id: 'hepatology',
      name: 'Hepatology',
      description: 'Diseases of the liver and biliary system',
      diseaseCategories: ['Viral hepatitis', 'Alcoholic liver disease', 'NAFLD/NASH', 'Cirrhosis', 'Portal hypertension', 'Hepatocellular carcinoma', 'Drug-induced liver injury', 'Autoimmune hepatitis', 'Primary biliary cholangitis', 'Primary sclerosing cholangitis'],
    },
    {
      id: 'pancreatic',
      name: 'Pancreatic Disease',
      description: 'Inflammatory and neoplastic conditions of the pancreas',
      diseaseCategories: ['Acute pancreatitis', 'Chronic pancreatitis', 'Pancreatic cancer', 'Autoimmune pancreatitis', 'Pancreatic pseudocyst'],
    },
    {
      id: 'biliary',
      name: 'Biliary Disease',
      description: 'Gallbladder and bile duct disorders',
      diseaseCategories: ['Cholelithiasis', 'Cholecystitis', 'Choledocholithiasis', 'Cholangitis', 'Biliary stricture', 'Gallbladder polyps'],
    },
    {
      id: 'gi-bleeding',
      name: 'Gastrointestinal Bleeding',
      description: 'Acute and chronic haemorrhage from any GI source',
      diseaseCategories: ['Upper GI bleed', 'Lower GI bleed', 'Variceal haemorrhage', 'Mallory-Weiss tear', 'Angiodysplasia', 'Occult GI bleed'],
    },
  ],
  commonSymptoms: [
    'abdominal_pain', 'dysphagia', 'odynophagia', 'heartburn',
    'regurgitation', 'nausea', 'vomiting', 'haematemesis',
    'melena', 'haematochezia', 'diarrhoea', 'constipation',
    'abdominal_bloating', 'early_satiety', 'anorexia', 'weight_loss',
    'jaundice', 'pruritus', 'dark_urine', 'pale_stools',
    'ascites', 'abdominal_distension', 'dyschezia',
    'tenesmus', 'fever', 'right_upper_quadrant_pain',
    'epigastric_pain', 'periumbilical_pain', 'hypogastric_pain',
  ],
  commonInvestigations: [
    'FBC', 'U&E', 'LFT', 'CRP', 'Lipase', 'Amylase', 'Coeliac serology',
    'H. pylori stool antigen', 'Urea breath test', 'Oesophagogastroduodenoscopy',
    'Colonoscopy', 'Sigmoidoscopy', 'Abdominal ultrasound', 'CT abdomen',
    'MRCP', 'ERCP', 'FibroScan', 'Hepatitis serology', 'Autoimmune liver screen',
    'Faecal calprotectin', 'Stool culture', 'Faecal occult blood',
    'Oesophageal manometry', '24h pH monitoring', 'Liver biopsy',
  ],
};
