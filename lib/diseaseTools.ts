// ─────────────────────────────────────────────────────────────────────────────
// lib/diseaseTools.ts
// Tool configurations + Firebase assignment/reading helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'scale' | 'checkbox';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  icon: string;
  category: 'cardiovascular' | 'metabolic' | 'respiratory' | 'musculoskeletal' | 'mental_health' | 'general';
  description: string;
  patientInstruction: string;
  fields: ToolField[];
  frequency: string;          // how often to log
  color: string;              // accent color
  chartable: boolean;
  chartFields?: string[];     // which fields to chart over time
  diseases: string[];         // applicable specialties/diseases
  unit?: string;
  chartRef?: { unit: string };
}

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  bp_monitor: {
    id: 'bp_monitor', name: 'Blood Pressure Monitor', icon: '❤️',
    category: 'cardiovascular', color: '#dc2626',
    description: 'Track systolic, diastolic and pulse readings',
    patientInstruction: 'Sit quietly for 5 minutes before measuring. Record both values from your BP cuff.',
    frequency: 'Twice daily (morning & evening)',
    chartable: true, chartFields: ['systolic', 'diastolic'],
    diseases: ['Hypertension', 'Cardiology', 'General Practice'],
    fields: [
      { key: 'systolic',  label: 'Systolic',  type: 'number', unit: 'mmHg', min: 60,  max: 250, step: 1, required: true,  hint: 'Top number' },
      { key: 'diastolic', label: 'Diastolic', type: 'number', unit: 'mmHg', min: 40,  max: 150, step: 1, required: true,  hint: 'Bottom number' },
      { key: 'pulse',     label: 'Pulse',     type: 'number', unit: 'bpm',  min: 30,  max: 220, step: 1, required: false, hint: 'Heart rate' },
      { key: 'arm',       label: 'Arm Used',  type: 'select', required: false, options: [{ value: 'left', label: 'Left Arm' }, { value: 'right', label: 'Right Arm' }] },
      { key: 'position',  label: 'Position',  type: 'select', required: false, options: [{ value: 'sitting', label: 'Sitting' }, { value: 'lying', label: 'Lying down' }] },
      { key: 'note',      label: 'Note',      type: 'text',  placeholder: 'Any symptoms? e.g. headache, dizziness', required: false },
    ],
  },

  glucose_tracker: {
    id: 'glucose_tracker', name: 'Blood Glucose Tracker', icon: '🩸',
    category: 'metabolic', color: '#d97706',
    description: 'Log blood glucose readings with context',
    patientInstruction: 'Record reading type (fasting, before meal, after meal). Always note what you ate if post-meal.',
    frequency: 'Per doctor\'s instruction (usually 2–4× daily)',
    chartable: true, chartFields: ['value'],
    diseases: ['Diabetes', 'Endocrinology', 'General Practice'],
    fields: [
      { key: 'value',       label: 'Glucose Level', type: 'number', unit: 'mmol/L', min: 1.0, max: 33.3, step: 0.1, required: true },
      { key: 'readingType', label: 'Reading Type',  type: 'select', required: true,
        options: [{ value: 'fasting', label: 'Fasting (before breakfast)' }, { value: 'pre_meal', label: 'Before Meal' }, { value: 'post_meal', label: '2h After Meal' }, { value: 'random', label: 'Random' }, { value: 'bedtime', label: 'Bedtime' }] },
      { key: 'meal',        label: 'What Did You Eat?', type: 'text', placeholder: 'e.g. ugali and sukuma, 2 chapattis', required: false },
      { key: 'insulin',     label: 'Insulin Taken?', type: 'select', required: false,
        options: [{ value: 'none', label: 'None' }, { value: 'yes_rapid', label: 'Yes – rapid acting' }, { value: 'yes_long', label: 'Yes – long acting' }, { value: 'yes_both', label: 'Yes – both' }] },
      { key: 'note',        label: 'Note', type: 'text', placeholder: 'Unusual activity, stress, illness?', required: false },
    ],
  },

  hba1c_tracker: {
    id: 'hba1c_tracker', name: 'HbA1c Tracker', icon: '📊',
    category: 'metabolic', color: '#7c3aed',
    description: 'Log HbA1c results from lab tests',
    patientInstruction: 'Enter your HbA1c result from your latest lab report. This is a 3-month average of blood sugar.',
    frequency: 'Every 3 months (after lab test)',
    chartable: true, chartFields: ['value'],
    diseases: ['Diabetes', 'Endocrinology'],
    fields: [
      { key: 'value',   label: 'HbA1c',     type: 'number', unit: '%',     min: 4.0, max: 15.0, step: 0.1, required: true },
      { key: 'lab',     label: 'Lab Name',  type: 'text',   placeholder: 'e.g. Lancet Laboratories', required: false },
      { key: 'labDate', label: 'Test Date', type: 'text',   placeholder: 'DD/MM/YYYY', required: false },
    ],
  },

  peak_flow: {
    id: 'peak_flow', name: 'Peak Flow Monitor', icon: '🌬️',
    category: 'respiratory', color: '#2563eb',
    description: 'Track peak expiratory flow rate for asthma management',
    patientInstruction: 'Blow into your peak flow meter as hard and fast as possible. Take 3 readings and enter the best one.',
    frequency: 'Twice daily (morning & evening)',
    chartable: true, chartFields: ['value'],
    diseases: ['Asthma', 'COPD', 'Respiratory', 'Pulmonology'],
    fields: [
      { key: 'value',       label: 'Best of 3 Readings', type: 'number', unit: 'L/min', min: 100, max: 900, step: 5, required: true },
      { key: 'personalBest', label: 'Your Personal Best', type: 'number', unit: 'L/min', min: 100, max: 900, step: 5, required: false, hint: 'From your asthma action plan' },
      { key: 'timeOfDay',   label: 'Time', type: 'select', required: true,
        options: [{ value: 'morning', label: 'Morning (before inhalers)' }, { value: 'evening', label: 'Evening' }, { value: 'other', label: 'Other' }] },
      { key: 'symptoms',    label: 'Symptoms', type: 'select', required: false,
        options: [{ value: 'none', label: 'No symptoms' }, { value: 'wheeze', label: 'Wheeze' }, { value: 'cough', label: 'Cough' }, { value: 'tight', label: 'Chest tightness' }, { value: 'breathless', label: 'Breathlessness' }] },
      { key: 'inhalerUsed', label: 'Reliever Inhaler Used?', type: 'select', required: false,
        options: [{ value: 'no', label: 'No' }, { value: 'yes_1', label: 'Yes – 1 puff' }, { value: 'yes_2', label: 'Yes – 2 puffs' }, { value: 'yes_more', label: 'Yes – more than 2 puffs' }] },
    ],
  },

  spo2_monitor: {
    id: 'spo2_monitor', name: 'Oxygen Saturation (SpO₂)', icon: '💨',
    category: 'respiratory', color: '#0891b2',
    description: 'Track blood oxygen saturation with pulse oximeter',
    patientInstruction: 'Place pulse oximeter on your index finger. Rest for 2 minutes, then record the reading.',
    frequency: 'As directed by doctor',
    chartable: true, chartFields: ['spo2'],
    diseases: ['COPD', 'Heart Failure', 'COVID-19 Recovery', 'Respiratory'],
    fields: [
      { key: 'value',    label: 'SpO₂',  type: 'number', unit: '%',   min: 70, max: 100, step: 1,  required: true },
      { key: 'pulse',    label: 'Pulse', type: 'number', unit: 'bpm', min: 30, max: 220, step: 1,  required: false },
      { key: 'activity', label: 'Activity at Time of Reading', type: 'select', required: false,
        options: [{ value: 'rest', label: 'At rest' }, { value: 'after_walk', label: 'After walking' }, { value: 'after_exertion', label: 'After exertion' }] },
      { key: 'symptoms', label: 'Symptoms', type: 'text', placeholder: 'Any breathlessness, dizziness?', required: false },
    ],
  },

  weight_tracker: {
    id: 'weight_tracker', name: 'Weight & BMI Tracker', icon: '⚖️',
    category: 'general', color: '#059669',
    description: 'Weekly weight monitoring for fluid retention, obesity management',
    patientInstruction: 'Weigh yourself at the same time each day, preferably in the morning before eating.',
    frequency: 'Daily or weekly as directed',
    chartable: true, chartFields: ['value'],
    diseases: ['Heart Failure', 'Obesity', 'Hypertension', 'Diabetes', 'General Practice'],
    fields: [
      { key: 'value',  label: 'Weight',  type: 'number', unit: 'kg',  min: 20, max: 300, step: 0.1, required: true },
      { key: 'height', label: 'Height',  type: 'number', unit: 'cm',  min: 100, max: 250, step: 0.5, required: false, hint: 'Needed for BMI' },
      { key: 'waist',  label: 'Waist Circumference', type: 'number', unit: 'cm', min: 40, max: 200, step: 0.5, required: false },
      { key: 'time',   label: 'Time of Day', type: 'select', required: false,
        options: [{ value: 'morning_before_eating', label: 'Morning – before eating' }, { value: 'morning_after', label: 'Morning – after eating' }, { value: 'evening', label: 'Evening' }] },
    ],
  },

  pain_scale: {
    id: 'pain_scale', name: 'Pain Assessment', icon: '🩹',
    category: 'general', color: '#9333ea',
    description: 'Track pain levels, location, and character',
    patientInstruction: 'Rate your pain honestly: 0 = no pain, 10 = worst pain imaginable.',
    frequency: 'Twice daily or as needed',
    chartable: true, chartFields: ['value'],
    diseases: ['Orthopaedics', 'Rheumatology', 'General Practice', 'Pain Management'],
    fields: [
      { key: 'value',     label: 'Pain Score', type: 'scale', min: 0, max: 10, required: true },
      { key: 'location',  label: 'Location', type: 'text', placeholder: 'e.g. lower back, right knee', required: false },
      { key: 'character', label: 'Character', type: 'select', required: false,
        options: [{ value: 'aching', label: 'Aching' }, { value: 'sharp', label: 'Sharp/Stabbing' }, { value: 'burning', label: 'Burning' }, { value: 'throbbing', label: 'Throbbing' }, { value: 'cramping', label: 'Cramping' }, { value: 'shooting', label: 'Shooting' }] },
      { key: 'worse',     label: 'Made Worse By', type: 'text', placeholder: 'e.g. movement, sitting', required: false },
      { key: 'better',    label: 'Relieved By',   type: 'text', placeholder: 'e.g. heat, rest, medication', required: false },
      { key: 'meds_taken', label: 'Pain Medication Taken?', type: 'select', required: false,
        options: [{ value: 'none', label: 'None' }, { value: 'paracetamol', label: 'Paracetamol' }, { value: 'ibuprofen', label: 'Ibuprofen' }, { value: 'prescribed', label: 'Prescribed analgesic' }, { value: 'combination', label: 'Combination' }] },
    ],
  },

  mood_tracker: {
    id: 'mood_tracker', name: 'Mood & Mental Health', icon: '🧠',
    category: 'mental_health', color: '#6366f1',
    description: 'PHQ-9 depression screening + daily mood log',
    patientInstruction: 'Answer honestly — these answers help your doctor understand how you are feeling and adjust your care.',
    frequency: 'Weekly PHQ-9; daily mood log',
    chartable: true, chartFields: ['phq9', 'wellbeing'],
    diseases: ['Psychiatry', 'General Practice', 'Chronic Disease Management'],
    fields: [
      { key: 'wellbeing', label: 'Overall Wellbeing Today', type: 'scale', min: 1, max: 10, required: true, hint: '1 = Very poor, 10 = Excellent' },
      { key: 'phq9',      label: 'PHQ-9 Score (0–27)',      type: 'number', min: 0, max: 27, step: 1, required: false, hint: 'From your PHQ-9 questionnaire' },
      { key: 'sleep',     label: 'Sleep Quality',           type: 'select', required: false,
        options: [{ value: 'great', label: '😴 Great (7+ hrs)' }, { value: 'ok', label: '😐 OK (5–7 hrs)' }, { value: 'poor', label: '😞 Poor (<5 hrs)' }, { value: 'none', label: '😰 Couldn\'t sleep' }] },
      { key: 'appetite',  label: 'Appetite', type: 'select', required: false,
        options: [{ value: 'normal', label: 'Normal' }, { value: 'increased', label: 'Increased' }, { value: 'decreased', label: 'Decreased' }, { value: 'none', label: 'Not eating' }] },
      { key: 'note',      label: 'How Are You Feeling?', type: 'text', placeholder: 'In your own words...', required: false },
    ],
  },

  medication_adherence: {
    id: 'medication_adherence', name: 'Medication Tracker', icon: '💊',
    category: 'general', color: '#0aaa76',
    description: 'Daily medication adherence log',
    patientInstruction: 'Check off each medication as you take it. Log any side effects or missed doses.',
    frequency: 'Daily',
    chartable: false,
    diseases: ['Hypertension', 'Diabetes', 'Asthma', 'HIV', 'TB', 'General Practice'],
    fields: [
      { key: 'taken',      label: 'Medications Taken Today', type: 'select', required: true,
        options: [{ value: 'all', label: '✅ All medications taken' }, { value: 'some', label: '⚠️ Some medications missed' }, { value: 'none', label: '❌ No medications taken' }] },
      { key: 'missed',     label: 'Which Were Missed?', type: 'text', placeholder: 'Name the missed medications', required: false },
      { key: 'reason',     label: 'Reason for Missing', type: 'select', required: false,
        options: [{ value: 'forgot', label: 'Forgot' }, { value: 'no_stock', label: 'Ran out / no stock' }, { value: 'side_effects', label: 'Side effects' }, { value: 'cost', label: 'Cost' }, { value: 'feeling_better', label: 'Felt better' }] },
      { key: 'side_effects', label: 'Any Side Effects?', type: 'text', placeholder: 'e.g. nausea, dizziness, rash', required: false },
      { key: 'refill_needed', label: 'Need Refill?', type: 'select', required: false,
        options: [{ value: 'no', label: 'No' }, { value: 'soon', label: 'Within 1 week' }, { value: 'urgent', label: 'Out of stock' }] },
    ],
  },

  ecg_monitor: {
    id: 'ecg_monitor', name: 'Heart Rate & ECG Log', icon: '💓',
    category: 'cardiovascular', color: '#e11d48',
    description: 'Log heart rate, rhythm observations, and palpitations',
    patientInstruction: 'Record after using your smartwatch ECG feature or pulse oximeter. Note any irregular beats or episodes.',
    frequency: 'Daily or per episode',
    chartable: true, chartFields: ['heartRate'],
    diseases: ['Cardiology', 'Arrhythmia', 'Heart Failure', 'Hypertension'],
    fields: [
      { key: 'heartRate',   label: 'Heart Rate', type: 'number', unit: 'bpm', min: 30, max: 250, step: 1, required: true },
      { key: 'rhythm',      label: 'Rhythm', type: 'select', required: false,
        options: [{ value: 'regular', label: 'Regular' }, { value: 'irregular', label: 'Irregular/Skipping' }, { value: 'fast', label: 'Fast but regular' }, { value: 'unknown', label: 'Not sure' }] },
      { key: 'palpitations', label: 'Palpitations?', type: 'select', required: false,
        options: [{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild – briefly' }, { value: 'moderate', label: 'Moderate – minutes' }, { value: 'severe', label: 'Severe – ongoing' }] },
      { key: 'symptoms',    label: 'Other Symptoms', type: 'text', placeholder: 'e.g. chest pain, breathlessness, fainting', required: false },
    ],
  },

  fluid_tracker: {
    id: 'fluid_tracker', name: 'Fluid Intake & Output', icon: '💧',
    category: 'general', color: '#0284c7',
    description: 'Track fluid intake and urine output for heart/kidney patients',
    patientInstruction: 'Log all fluids consumed and estimate urine output. Use a measuring jug if advised.',
    frequency: 'Daily',
    chartable: true, chartFields: ['intake', 'output'],
    diseases: ['Heart Failure', 'Kidney Disease', 'Nephrology', 'Cardiology'],
    fields: [
      { key: 'intake',  label: 'Total Fluid Intake', type: 'number', unit: 'mL', min: 0, max: 5000, step: 50, required: true },
      { key: 'output',  label: 'Urine Output (estimate)', type: 'number', unit: 'mL', min: 0, max: 5000, step: 50, required: false },
      { key: 'oedema',  label: 'Ankle Swelling?', type: 'select', required: false,
        options: [{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild – socks leaving marks' }, { value: 'moderate', label: 'Moderate – pitting' }, { value: 'severe', label: 'Severe – pitting to knee' }] },
      { key: 'note',    label: 'Note', type: 'text', placeholder: 'Any breathlessness when lying flat?', required: false },
    ],
  },
};

// ─── Category groupings for doctor UI ─────────────────────────────────────────
export const TOOL_CATEGORIES = {
  cardiovascular: { label: 'Cardiovascular', icon: '❤️', color: '#dc2626' },
  metabolic:      { label: 'Metabolic',      icon: '🩸', color: '#d97706' },
  respiratory:    { label: 'Respiratory',    icon: '🌬️', color: '#2563eb' },
  musculoskeletal:{ label: 'Musculoskeletal',icon: '🦴', color: '#9333ea' },
  mental_health:  { label: 'Mental Health',  icon: '🧠', color: '#6366f1' },
  general:        { label: 'General',        icon: '📋', color: '#0aaa76' },
};

// ─── TypeScript types for Firestore documents ──────────────────────────────────
export interface ToolAssignment {
  id: string;
  toolType: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  assignedAt: any;
  instructions?: string;      // doctor's custom instruction
  frequency?: string;         // override default
  active: boolean;
  targetValues?: Record<string, any>;  // doctor sets patient-specific targets
  alertThresholds?: Record<string, any>; // doctor overrides triage thresholds
}

export interface ToolReading {
  id: string;
  toolType: string;
  patientId: string;
  doctorId: string;
  assignmentId: string;
  data: Record<string, any>;
  recordedAt: any;
  triage?: {
    level: string;
    label: string;
    message: string;
    actionLabel: string;
    urgency: string;
    alertDoctor: boolean;
    alertPatient: boolean;
  };
  doctorReviewed?: boolean;
  doctorNote?: string;
}

export interface AuditEntry {
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;  // doctor UID
  changedByName: string;
  reason: string;
  changedAt: string;  // ISO string
}

export interface AuditedRecord {
  id: string;
  type: 'prescription' | 'note' | 'lab' | 'imaging' | 'referral';
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  content: Record<string, any>;
  auditLog: AuditEntry[];
  createdAt: any;
  updatedAt?: any;
}