export type UniversalDataType =
  | 'boolean' | 'number' | 'integer' | 'decimal' | 'percentage'
  | 'string' | 'text' | 'narrative'
  | 'date' | 'datetime' | 'time' | 'duration'
  | 'age' | 'weight_kg' | 'height_cm' | 'temperature_c' | 'pressure_mmhg' | 'pulse_bpm'
  | 'single_choice' | 'multiple_choice'
  | 'code' | 'concept' | 'icd10' | 'snomed' | 'loinc' | 'atc'
  | 'body_location' | 'severity' | 'frequency' | 'timing'
  | 'image' | 'video' | 'audio' | 'file'
  | 'signal' | 'coordinate' | 'body_map'
  | 'structured_narrative' | 'reference';

export interface DataTypeSchema {
  type: UniversalDataType;
  label: string;
  description: string;
  baseType: 'boolean' | 'number' | 'string' | 'date' | 'object' | 'array' | 'binary';
  validation?: DataTypeValidation;
  display?: DataTypeDisplay;
  unit?: string;
}

export interface DataTypeValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enumValues?: string[];
  required?: boolean;
  unique?: boolean;
}

export interface DataTypeDisplay {
  inputType: 'toggle' | 'slider' | 'input' | 'textarea' | 'select' | 'multi_select' | 'date_picker' | 'time_picker' | 'autocomplete' | 'radio' | 'checkbox' | 'file_upload' | 'image_upload' | 'body_map' | 'signal_viewer';
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  step?: number;
}

export const DATA_TYPE_REGISTRY: Record<UniversalDataType, DataTypeSchema> = {
  boolean: {
    type: 'boolean', label: 'Boolean', description: 'Yes/No/Unknown value',
    baseType: 'boolean', validation: {}, display: { inputType: 'toggle' },
  },
  number: {
    type: 'number', label: 'Number', description: 'Any numeric value',
    baseType: 'number', validation: {}, display: { inputType: 'input' },
  },
  integer: {
    type: 'integer', label: 'Integer', description: 'Whole number value',
    baseType: 'number', validation: {}, display: { inputType: 'input', step: 1 },
  },
  decimal: {
    type: 'decimal', label: 'Decimal', description: 'Decimal number value',
    baseType: 'number', validation: {}, display: { inputType: 'input', step: 0.1 },
  },
  percentage: {
    type: 'percentage', label: 'Percentage', description: 'Percentage value 0-100',
    baseType: 'number', validation: { min: 0, max: 100 }, display: { inputType: 'slider', suffix: '%' },
  },
  string: {
    type: 'string', label: 'String', description: 'Short text value',
    baseType: 'string', validation: {}, display: { inputType: 'input' },
  },
  text: {
    type: 'text', label: 'Text', description: 'Multi-line text value',
    baseType: 'string', validation: {}, display: { inputType: 'textarea' },
  },
  narrative: {
    type: 'narrative', label: 'Narrative', description: 'Structured clinical narrative',
    baseType: 'string', validation: {}, display: { inputType: 'textarea' },
  },
  date: {
    type: 'date', label: 'Date', description: 'Calendar date (YYYY-MM-DD)',
    baseType: 'date', validation: {}, display: { inputType: 'date_picker' },
  },
  datetime: {
    type: 'datetime', label: 'Date/Time', description: 'Date and time value',
    baseType: 'date', validation: {}, display: { inputType: 'date_picker' },
  },
  time: {
    type: 'time', label: 'Time', description: 'Time of day (HH:MM)',
    baseType: 'date', validation: {}, display: { inputType: 'time_picker' },
  },
  duration: {
    type: 'duration', label: 'Duration', description: 'Time duration in days',
    baseType: 'number', validation: { min: 0 }, display: { inputType: 'input', suffix: 'days', step: 1 },
  },
  age: {
    type: 'age', label: 'Age', description: 'Patient age in years',
    baseType: 'number', validation: { min: 0, max: 150 }, display: { inputType: 'input', suffix: 'years', step: 1 },
  },
  weight_kg: {
    type: 'weight_kg', label: 'Weight', description: 'Body weight in kilograms',
    baseType: 'number', validation: { min: 0.5, max: 350 }, display: { inputType: 'input', suffix: 'kg', step: 0.1 },
  },
  height_cm: {
    type: 'height_cm', label: 'Height', description: 'Body height in centimeters',
    baseType: 'number', validation: { min: 20, max: 280 }, display: { inputType: 'input', suffix: 'cm', step: 0.5 },
  },
  temperature_c: {
    type: 'temperature_c', label: 'Temperature', description: 'Body temperature in Celsius',
    baseType: 'number', validation: { min: 32, max: 43 }, display: { inputType: 'input', suffix: '°C', step: 0.1 },
  },
  pressure_mmhg: {
    type: 'pressure_mmhg', label: 'Blood Pressure', description: 'Blood pressure in mmHg',
    baseType: 'number', validation: { min: 20, max: 300 }, display: { inputType: 'input', suffix: 'mmHg', step: 1 },
  },
  pulse_bpm: {
    type: 'pulse_bpm', label: 'Pulse', description: 'Heart rate in beats per minute',
    baseType: 'number', validation: { min: 30, max: 250 }, display: { inputType: 'input', suffix: 'bpm', step: 1 },
  },
  single_choice: {
    type: 'single_choice', label: 'Single Choice', description: 'Select one option from a list',
    baseType: 'string', validation: {}, display: { inputType: 'select' },
  },
  multiple_choice: {
    type: 'multiple_choice', label: 'Multiple Choice', description: 'Select multiple options from a list',
    baseType: 'array', validation: {}, display: { inputType: 'multi_select' },
  },
  code: {
    type: 'code', label: 'Code', description: 'A coded value from a terminology system',
    baseType: 'string', validation: {}, display: { inputType: 'autocomplete' },
  },
  concept: {
    type: 'concept', label: 'Concept', description: 'A medical concept with code + display',
    baseType: 'object', validation: {}, display: { inputType: 'autocomplete' },
  },
  icd10: {
    type: 'icd10', label: 'ICD-10 Code', description: 'International Classification of Diseases code',
    baseType: 'string', validation: { pattern: '^[A-Z][0-9]{2}(\\.[0-9]{1,2})?$' }, display: { inputType: 'autocomplete' },
  },
  snomed: {
    type: 'snomed', label: 'SNOMED CT', description: 'SNOMED CT concept identifier',
    baseType: 'string', validation: { pattern: '^[0-9]+$' }, display: { inputType: 'autocomplete' },
  },
  loinc: {
    type: 'loinc', label: 'LOINC', description: 'Logical Observation Identifiers Names and Codes',
    baseType: 'string', validation: { pattern: '^[0-9]+-[0-9]$' }, display: { inputType: 'autocomplete' },
  },
  atc: {
    type: 'atc', label: 'ATC Code', description: 'Anatomical Therapeutic Chemical classification',
    baseType: 'string', validation: { pattern: '^[A-Z][0-9]{2}[A-Z]{2}[0-9]{2}$' }, display: { inputType: 'autocomplete' },
  },
  body_location: {
    type: 'body_location', label: 'Body Location', description: 'Anatomical location on the body',
    baseType: 'string', validation: {}, display: { inputType: 'select' },
  },
  severity: {
    type: 'severity', label: 'Severity', description: 'Clinical severity level',
    baseType: 'string', validation: { enumValues: ['mild', 'moderate', 'severe', 'critical'] }, display: { inputType: 'select' },
  },
  frequency: {
    type: 'frequency', label: 'Frequency', description: 'How often something occurs',
    baseType: 'string', validation: { enumValues: ['once', 'hourly', 'daily', 'weekly', 'monthly', 'as_needed'] }, display: { inputType: 'select' },
  },
  timing: {
    type: 'timing', label: 'Timing', description: 'When in the day something occurs',
    baseType: 'string', validation: {}, display: { inputType: 'select' },
  },
  image: {
    type: 'image', label: 'Image', description: 'Medical image (X-ray, MRI, CT, photo)',
    baseType: 'binary', validation: {}, display: { inputType: 'image_upload' },
  },
  video: {
    type: 'video', label: 'Video', description: 'Medical video recording',
    baseType: 'binary', validation: {}, display: { inputType: 'file_upload' },
  },
  audio: {
    type: 'audio', label: 'Audio', description: 'Medical audio recording (heart sounds, speech)',
    baseType: 'binary', validation: {}, display: { inputType: 'file_upload' },
  },
  file: {
    type: 'file', label: 'File', description: 'Generic file attachment (PDF, document)',
    baseType: 'binary', validation: {}, display: { inputType: 'file_upload' },
  },
  signal: {
    type: 'signal', label: 'Signal', description: 'Biomedical signal waveform (ECG, EEG)',
    baseType: 'binary', validation: {}, display: { inputType: 'signal_viewer' },
  },
  coordinate: {
    type: 'coordinate', label: 'Coordinate', description: 'X,Y coordinates on a body map or image',
    baseType: 'object', validation: {}, display: { inputType: 'body_map' },
  },
  body_map: {
    type: 'body_map', label: 'Body Map', description: 'Annotated body surface mapping',
    baseType: 'object', validation: {}, display: { inputType: 'body_map' },
  },
  structured_narrative: {
    type: 'structured_narrative', label: 'Structured Narrative', description: 'Template-structured clinical narrative',
    baseType: 'object', validation: {}, display: { inputType: 'textarea' },
  },
  reference: {
    type: 'reference', label: 'Reference', description: 'A reference to another entity (patient, encounter, order)',
    baseType: 'string', validation: {}, display: { inputType: 'autocomplete' },
  },
};
