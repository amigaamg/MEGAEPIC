import type { NursingProtocol } from '../types/protocols'

export const PNEUMONIA_NURSING_PROTOCOLS: NursingProtocol[] = [
  {
    id: 'pneumonia_nursing_moderate',
    diseaseId: 'community_acquired_pneumonia',
    severity: 'moderate',
    monitoring: [
      { id: 'nurse_rr', parameter: 'Respiratory Rate', frequency: 'Q4H', target: '<24/min' },
      { id: 'nurse_temp', parameter: 'Temperature', frequency: 'Q4H', target: '<38°C' },
      { id: 'nurse_pulse', parameter: 'Pulse', frequency: 'Q4H', target: '60-100/min' },
      { id: 'nurse_bp', parameter: 'Blood Pressure', frequency: 'Q4H', target: 'SBP >100' },
      { id: 'nurse_spo2', parameter: 'SpO2', frequency: 'Continuous', target: '>92%' },
      { id: 'nurse_io', parameter: 'Strict Intake & Output', frequency: 'Q8H', notes: 'Accurate fluid balance chart' },
      { id: 'nurse_consciousness', parameter: 'Level of Consciousness', frequency: 'Q4H', notes: 'AVPU scale' },
    ],
    care: [
      { id: 'care_position', parameter: 'Positioning', frequency: 'Q2H', notes: 'Semi-recumbent 30-45°' },
      { id: 'care_deep_breathing', parameter: 'Deep Breathing Exercises', frequency: 'Q2H when awake', notes: 'Encourage 5 deep breaths hourly' },
      { id: 'care_mouth_care', parameter: 'Mouth Care', frequency: 'Q4H', notes: 'Especially if oxygen therapy or NBM' },
      { id: 'care_skin', parameter: 'Pressure Area Care', frequency: 'Q2H', notes: 'Turn if immobile. Use pressure-relieving mattress.' },
      { id: 'care_sputum', parameter: 'Sputum Monitoring', frequency: 'Q8H', notes: 'Record color, volume, consistency. Send for culture if purulent.' },
      { id: 'care_mobilize', parameter: 'Early Mobilization', frequency: 'TID', notes: 'As tolerated — sit up, dangle, ambulate' },
      { id: 'care_education', parameter: 'Patient Education', frequency: 'Once', notes: 'Explain diagnosis, treatment plan, red flags to report' },
    ],
    escalation: [
      { id: 'esc_rr', condition: 'RR >30', threshold: 'Sustained >30 despite treatment', action: 'Immediate doctor review. Assess for severe pneumonia/ARDS.', notify: ['Doctor', 'Registrar'] },
      { id: 'esc_spo2', condition: 'SpO2 <90%', threshold: '<90% on >5L O2', action: 'Escalate oxygen. ABG. Assess for ICU referral.', notify: ['Doctor', 'Respiratory Therapist'] },
      { id: 'esc_bp', condition: 'SBP <90', threshold: 'SBP <90 despite fluids', action: 'Sepsis protocol. Vasopressor assessment. ICU referral.', notify: ['Doctor', 'ICU team'] },
      { id: 'esc_confusion', condition: 'New confusion', threshold: 'AVPU < A', action: 'Sepsis-associated encephalopathy. Urgent medical review.', notify: ['Doctor'] },
      { id: 'esc_urine', condition: 'Urine output <0.5 mL/kg/h', threshold: '<0.5 mL/kg/h for >4h', action: 'Assess volume status. Consider fluid challenge. Monitor creatinine.', notify: ['Doctor'] },
    ],
  },
  {
    id: 'pneumonia_nursing_severe',
    diseaseId: 'community_acquired_pneumonia',
    severity: 'severe',
    monitoring: [
      { id: 'severe_rr', parameter: 'Respiratory Rate', frequency: 'Q1H', target: '<30/min' },
      { id: 'severe_temp', parameter: 'Temperature', frequency: 'Q1H', target: '<38°C' },
      { id: 'severe_pulse', parameter: 'Pulse', frequency: 'Q1H', target: '60-100/min' },
      { id: 'severe_bp', parameter: 'Blood Pressure', frequency: 'Q1H (continuous if on pressors)', target: 'MAP >65' },
      { id: 'severe_spo2', parameter: 'SpO2', frequency: 'Continuous', target: '>92%' },
      { id: 'severe_io', parameter: 'Strict Intake & Output', frequency: 'Q1H', notes: 'Hourly urine output. Fluid balance.' },
      { id: 'severe_consciousness', parameter: 'Level of Consciousness', frequency: 'Q1H', notes: 'AVPU / GCS' },
      { id: 'severe_lactate', parameter: 'Lactate Clearance', frequency: 'Q2H', notes: 'Trend >10% reduction suggests response' },
    ],
    care: [
      { id: 'severe_position', parameter: 'Positioning', frequency: 'Q1H', notes: 'Semi-recumbent 30-45°. Avoid supine.' },
      { id: 'severe_mouth', parameter: 'Mouth Care', frequency: 'Q2H', notes: 'Routine oral care reduces VAP risk' },
      { id: 'severe_skin', parameter: 'Pressure Area Care', frequency: 'Q1H', notes: 'Specialty mattress. Turn schedule.' },
      { id: 'severe_lines', parameter: 'Line / Catheter Care', frequency: 'Q8H', notes: 'Inspect all IV sites, catheter, drains' },
      { id: 'severe_sputum', parameter: 'Sputum Monitoring', frequency: 'Q4H', notes: 'If intubated — ET aspirate for culture' },
      { id: 'severe_family', parameter: 'Family Communication', frequency: 'Daily', notes: 'Update family on condition and plan' },
    ],
    escalation: [
      { id: 'severe_esc_vent', condition: 'Respiratory failure', threshold: 'PaO2/FiO2 <200 or RR >35 on max O2', action: 'ICU referral. Assess for NIV or intubation.', notify: ['ICU team', 'Registrar', 'Consultant'] },
      { id: 'severe_esc_shock', condition: 'Refractory shock', threshold: 'MAP <65 on norepinephrine >0.2 mcg/kg/min', action: 'Escalate vasopressors. Add vasopressin or dobutamine. ICU review.', notify: ['ICU team', 'Consultant'] },
      { id: 'severe_esc_aki', condition: 'Worsening AKI', threshold: 'Creatinine rise >50% from baseline or urine output <0.3 mL/kg/h x6h', action: 'Nephrology review. Assess for RRT.', notify: ['Nephrology', 'ICU team'] },
    ],
  },
  {
    id: 'tb_nursing',
    diseaseId: 'tuberculosis',
    severity: 'moderate',
    monitoring: [
      { id: 'tb_monitor_cough', parameter: 'Cough frequency & character', frequency: 'Daily' },
      { id: 'tb_monitor_temp', parameter: 'Temperature', frequency: 'Q6H' },
      { id: 'tb_monitor_weight', parameter: 'Weight', frequency: 'Weekly' },
      { id: 'tb_monitor_lfts', parameter: 'LFT monitoring', frequency: 'Weekly x4 then monthly', notes: 'INH-associated hepatitis risk' },
    ],
    care: [
      { id: 'tb_care_isolation', parameter: 'Airborne Isolation', frequency: 'Continuous', notes: 'Negative pressure room. N95 for all HCP. Mask patient during transport.' },
      { id: 'tb_care_dot', parameter: 'DOT (Directly Observed Therapy)', frequency: 'Daily', notes: 'Observe every dose. Document in TB register.' },
      { id: 'tb_care_education', parameter: 'Patient Education', frequency: 'Once then reinforce', notes: 'Cough etiquette, duration of treatment, side effects to report' },
      { id: 'tb_care_contact', parameter: 'Contact Tracing Referral', frequency: 'Once', notes: 'Notify public health team for contact investigation' },
    ],
    escalation: [
      { id: 'tb_esc_hepatitis', condition: 'INH hepatitis', threshold: 'LFT >3x ULN with symptoms or >5x ULN regardless', action: 'Stop INH. Check viral hepatitis serology. TB specialist review.', notify: ['TB specialist', 'Doctor'] },
      { id: 'tb_esc_hemoptysis', condition: 'Hemoptysis', threshold: 'Any fresh blood in sputum', action: 'Assess volume. If >200 mL/24h — massive hemoptysis protocol.', notify: ['Doctor', 'Respiratory team'] },
    ],
  },
]
