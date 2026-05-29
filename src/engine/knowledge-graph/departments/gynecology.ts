import type { DepartmentDefinition } from './index';

export const gynecology: DepartmentDefinition = {
  id: 'GYN',
  name: 'Gynecology',
  shortName: 'GYN',
  description: 'Disorders of the female reproductive system including menstrual disorders, pelvic pain, infections, benign and malignant gynaecological conditions.',
  icon: '🌸',
  color: '#f472b6',
  sections: [
    {
      id: 'menstrual',
      name: 'Menstrual Disorders',
      description: 'Abnormal uterine bleeding, amenorrhoea, dysmenorrhoea',
      diseaseCategories: ['Menorrhagia', 'Metrorrhagia', 'Amenorrhoea', 'Oligomenorrhoea', 'Dysmenorrhoea', 'Premenstrual syndrome', 'Polycystic ovary syndrome'],
    },
    {
      id: 'pelvic-mass',
      name: 'Pelvic Mass & Benign Disease',
      description: 'Benign tumours, cysts and structural abnormalities',
      diseaseCategories: ['Ovarian cyst', 'Uterine fibroids', 'Endometriosis', 'Adenomyosis', 'Pelvic organ prolapse', 'Cervical polyp', 'Endometrial polyp'],
    },
    {
      id: 'gynae-infections',
      name: 'Gynaecological Infections',
      description: 'Infections of the female genital tract',
      diseaseCategories: ['Vaginitis', 'Cervicitis', 'Pelvic inflammatory disease', 'Bartholin cyst/abscess', 'STI screening', 'Recurrent UTI'],
    },
    {
      id: 'gynae-oncology',
      name: 'Gynaecological Oncology',
      description: 'Malignancies of the female reproductive system',
      diseaseCategories: ['Cervical cancer', 'Ovarian cancer', 'Endometrial cancer', 'Vulval cancer', 'Vaginal cancer', 'Gestational trophoblastic disease'],
    },
    {
      id: 'fertility',
      name: 'Fertility & Reproductive Medicine',
      description: 'Subfertility investigation and assisted reproduction',
      diseaseCategories: ['Female factor infertility', 'Ovulatory disorders', 'Tubal disease', 'Recurrent pregnancy loss', 'Assisted reproductive technology'],
    },
    {
      id: 'menopause',
      name: 'Menopause & Urogynaecology',
      description: 'Perimenopause, menopause, pelvic floor disorders',
      diseaseCategories: ['Perimenopause', 'Menopause', 'HRT management', 'Urinary incontinence', 'Pelvic organ prolapse', 'Osteoporosis prevention'],
    },
  ],
  commonSymptoms: [
    'abnormal_vaginal_bleeding', 'amenorrhoea', 'dysmenorrhoea',
    'pelvic_pain', 'dyspareunia', 'vaginal_discharge', 'vaginal_itching',
    'postmenopausal_bleeding', 'intermenstrual_bleeding', 'menorrhagia',
    'abdominal_bloating', 'early_satiety', 'pelvic_mass', 'infertility',
    'recurrent_miscarriage', 'urinary_incontinence', 'pelvic_pressure',
    'back_pain', 'constipation', 'fever', 'lower_abdominal_pain',
    'breast_pain', 'virilisation', 'hirsutism',
  ],
  commonInvestigations: [
    'Pelvic ultrasound', 'Transvaginal ultrasound', 'CA-125', 'HE4',
    'Cervical smear', 'HPV test', 'Colposcopy', 'Endometrial biopsy',
    'Hysteroscopy', 'Laparoscopy', 'Hysterosalpingography',
    'FSH', 'LH', 'Oestradiol', 'Progesterone', 'Testosterone',
    'AMH', 'Prolactin', 'TSH', 'Sex hormone binding globulin',
    'Full STI screen', 'Urinalysis', 'MRI pelvis',
  ],
};
