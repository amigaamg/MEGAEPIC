import type { DepartmentDefinition } from './index';

export const urology: DepartmentDefinition = {
  id: 'URO',
  name: 'Urology',
  shortName: 'URO',
  description: 'Medical and surgical management of disorders of the urinary tract in males and females, and the male reproductive system.',
  icon: '🚽',
  color: '#2563eb',
  sections: [
    {
      id: 'lower-urinary-tract',
      name: 'Lower Urinary Tract',
      description: 'Bladder and urethral disorders, voiding dysfunction',
      diseaseCategories: ['Urinary tract infection', 'Recurrent UTI', 'Cystitis', 'Overactive bladder', 'Urinary incontinence', 'Bladder outlet obstruction', 'Neurogenic bladder', 'Urethral stricture'],
    },
    {
      id: 'prostate',
      name: 'Prostatic Disease',
      description: 'Benign and malignant prostatic conditions',
      diseaseCategories: ['Benign prostatic hyperplasia', 'Prostatitis', 'Prostate cancer', 'Chronic pelvic pain syndrome', 'Prostate abscess'],
    },
    {
      id: 'upper-urinary-tract',
      name: 'Upper Urinary Tract',
      description: 'Kidney and ureter disorders',
      diseaseCategories: ['Nephrolithiasis', 'Ureteric calculi', 'Ureteric obstruction', 'Pelviureteric junction obstruction', 'Renal tumour', 'Urothelial carcinoma of ureter'],
    },
    {
      id: 'male-infertility',
      name: 'Male Infertility & Andrology',
      description: 'Male reproductive health and sexual function',
      diseaseCategories: ['Male factor infertility', 'Erectile dysfunction', 'Hypogonadism', 'Varicocele', 'Ejaculatory dysfunction', 'Penile curvature/Peyronie disease'],
    },
    {
      id: 'urological-oncology',
      name: 'Urological Oncology',
      description: 'Cancers of the urinary and male reproductive systems',
      diseaseCategories: ['Bladder cancer', 'Prostate cancer', 'Renal cell carcinoma', 'Testicular cancer', 'Penile cancer', 'Upper tract urothelial carcinoma'],
    },
    {
      id: 'emergency-urology',
      name: 'Emergency Urology',
      description: 'Acute urological presentations',
      diseaseCategories: ['Acute urinary retention', 'Ureteric colic', 'Priapism', 'Testicular torsion', 'Fournier gangrene', 'Scrotal abscess', 'Traumatic haematuria', 'Paraphimosis'],
    },
  ],
  commonSymptoms: [
    'dysuria', 'urinary_frequency', 'urinary_urgency', 'nocturia',
    'haematuria', 'hesitancy', 'poor_stream', 'straining_to_void',
    'urinary_incontinence', 'urinary_retention', 'suprapubic_pain',
    'flank_pain', 'ureteric_colic', 'loin_pain', 'scrotal_pain',
    'testicular_pain', 'scrotal_swelling', 'testicular_lump',
    'penile_lesion', 'penile_discharge', 'erectile_dysfunction',
    'loss_of_libido', 'gynaecomastia', 'infertility', 'oligospermia',
    'haematospermia', 'perineal_pain', 'voiding_difficulty',
    'overflow_incontinence', 'recurrent_uti',
  ],
  commonInvestigations: [
    'Urinalysis', 'Urine culture and sensitivity', 'Urine cytology',
    'FBC', 'U&E', 'Creatinine', 'eGFR', 'PSA', 'Testosterone',
    'Sex hormone profile', 'Renal ultrasound', 'Bladder ultrasound',
    'CT KUB', 'CT urogram', 'MRI prostate', 'Transrectal ultrasound',
    'Prostate biopsy', 'Uroflowmetry', 'Post-void residual',
    'Urodynamics', 'Cystoscopy', 'Ureteroscopy', 'Semen analysis',
    'Scrotal ultrasound', 'Doppler testis', 'Testicular tumour markers',
  ],
};
