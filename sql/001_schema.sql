-- Create database
CREATE DATABASE IF NOT EXISTS amexan;
USE amexan;

-- Doctors
CREATE TABLE doctors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE patients (
  id VARCHAR(50) PRIMARY KEY,
  doctor_id VARCHAR(50),
  name VARCHAR(100),
  dob DATE,
  phone VARCHAR(30),
  risk_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Patient Tools (disease monitoring tools)
CREATE TABLE patient_tools (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  tool_type VARCHAR(50),
  diagnosis TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Blood pressure entries
CREATE TABLE bp_entries (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  systolic INT,
  diastolic INT,
  pulse INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Prescriptions
CREATE TABLE prescriptions (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  drug_name VARCHAR(100),
  dose VARCHAR(50),
  frequency VARCHAR(50),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Medication adherence
CREATE TABLE medication_adherence (
  id VARCHAR(50) PRIMARY KEY,
  prescription_id VARCHAR(50),
  taken BOOLEAN,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

-- Clinical notes
CREATE TABLE clinical_notes (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  doctor_id VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follow ups
CREATE TABLE follow_ups (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  scheduled_date DATE,
  status VARCHAR(20)
);

-- Lab orders
CREATE TABLE lab_orders (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  test_name VARCHAR(100),
  status VARCHAR(20),
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Imaging orders
CREATE TABLE imaging_orders (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  imaging_type VARCHAR(100),
  status VARCHAR(20),
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complications
CREATE TABLE complications (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  description TEXT,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE system_alerts (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50),
  alert_type VARCHAR(100),
  message TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor messages
CREATE TABLE doctor_messages (
  id VARCHAR(50) PRIMARY KEY,
  doctor_id VARCHAR(50),
  patient_id VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patient summary view
CREATE VIEW v_patient_summary AS
SELECT
  p.id,
  p.name,
  p.risk_level,
  COUNT(bp.id) AS bp_records
FROM patients p
LEFT JOIN bp_entries bp ON p.id = bp.patient_id
GROUP BY p.id;

-- Seed doctor
INSERT INTO doctors (id, name, email)
VALUES ('doctor_sarah_kimani', 'Dr. Sarah Kimani', 'sarah@amexan.com');

-- ═══════════════════════════════════════════════════════════════════
-- MEDICATION ECOSYSTEM — Extended Schema for AMEXAN v2
-- ═══════════════════════════════════════════════════════════════════

-- Treatment Plans (Therapy Lines)
CREATE TABLE treatment_plans (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  diagnosis VARCHAR(200) NOT NULL,
  journey_type VARCHAR(20) NOT NULL DEFAULT 'chronic',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  target_outcomes JSON,
  current_line INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  next_review_date DATE,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (created_by) REFERENCES doctors(id)
);

-- Therapy Lines within Treatment Plans
CREATE TABLE therapy_lines (
  id VARCHAR(50) PRIMARY KEY,
  plan_id VARCHAR(50) NOT NULL,
  line_number INT NOT NULL,
  name VARCHAR(200),
  medications JSON,
  criteria TEXT,
  duration VARCHAR(100),
  monitoring_schedule JSON,
  escalation_criteria JSON,
  deescalation_criteria JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES treatment_plans(id)
);

-- Enhanced Prescriptions (extends existing prescriptions table)
CREATE TABLE prescription_details (
  id VARCHAR(50) PRIMARY KEY,
  prescription_id VARCHAR(50) NOT NULL,
  journey_type VARCHAR(20) DEFAULT 'acute',
  origin VARCHAR(20) DEFAULT 'outpatient',
  medication_form VARCHAR(20),
  administration_site VARCHAR(20),
  encounter_id VARCHAR(50),
  clinical_alerts JSON,
  education_content JSON,
  therapeutic_class VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

-- Medication Dose Changes (Track every dose adjustment)
CREATE TABLE dose_changes (
  id VARCHAR(50) PRIMARY KEY,
  prescription_id VARCHAR(50) NOT NULL,
  previous_dose VARCHAR(50),
  new_dose VARCHAR(50),
  reason TEXT,
  changed_by VARCHAR(50),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

-- Medication Switches (Track when drugs are changed)
CREATE TABLE medication_switches (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  from_drug VARCHAR(100) NOT NULL,
  from_dose VARCHAR(50),
  to_drug VARCHAR(100) NOT NULL,
  to_dose VARCHAR(50),
  reason VARCHAR(50) NOT NULL,
  rationale TEXT,
  decision_by VARCHAR(50),
  decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  washout_period VARCHAR(100),
  cross_titration_instructions TEXT,
  patient_response VARCHAR(20) DEFAULT 'pending',
  response_notes TEXT,
  follow_up_date DATE,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Side Effect Tracking
CREATE TABLE side_effect_tracking (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  prescription_id VARCHAR(50),
  medication_name VARCHAR(100),
  side_effect VARCHAR(200) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  onset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration VARCHAR(50),
  action_taken VARCHAR(50) DEFAULT 'reported',
  resolved_at TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Home Medication Inventory (Stock tracking)
CREATE TABLE medication_inventory (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  prescription_id VARCHAR(50),
  medication_name VARCHAR(100) NOT NULL,
  dose VARCHAR(50),
  form VARCHAR(20),
  total_quantity INT NOT NULL,
  remaining_quantity INT NOT NULL,
  unit VARCHAR(20) DEFAULT 'tablets',
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATE,
  storage_instructions TEXT,
  batch_number VARCHAR(50),
  source VARCHAR(20) DEFAULT 'pharmacy',
  low_stock_threshold INT DEFAULT 3,
  auto_refill_enabled BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Medication Adherence Reasons (Why patients miss doses)
CREATE TABLE adherence_reasons (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  prescription_id VARCHAR(50),
  date DATE NOT NULL,
  reason VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Therapeutic Challenges (Gamification)
CREATE TABLE therapeutic_challenges (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL,
  goal TEXT,
  duration_days INT NOT NULL,
  reward VARCHAR(200),
  progress DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  milestones JSON,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Medication Education Content
CREATE TABLE medication_education (
  id VARCHAR(50) PRIMARY KEY,
  drug_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content_type VARCHAR(30) NOT NULL,
  content TEXT NOT NULL,
  content_format VARCHAR(20) DEFAULT 'text',
  difficulty VARCHAR(20) DEFAULT 'basic',
  estimated_read_minutes INT DEFAULT 3,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Medication Reviews
CREATE TABLE doctor_medication_reviews (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  review_type VARCHAR(20) DEFAULT 'routine',
  adherence_summary JSON,
  effectiveness_summary JSON,
  side_effect_burden JSON,
  recommendations JSON,
  medication_changes JSON,
  next_review_date DATE,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Inpatient Medication Orders
CREATE TABLE inpatient_medication_orders (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  encounter_id VARCHAR(50) NOT NULL,
  drug VARCHAR(100) NOT NULL,
  dose VARCHAR(50),
  route VARCHAR(20),
  frequency VARCHAR(30),
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ordered',
  indication TEXT,
  prescriber VARCHAR(50),
  pharmacist_review TEXT,
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Inpatient Dose Records
CREATE TABLE inpatient_dose_records (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  administered_at TIMESTAMP,
  administered_by VARCHAR(50),
  dose VARCHAR(50),
  route VARCHAR(20),
  site VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  reason_if_not_given TEXT,
  notes TEXT,
  witnessed_by VARCHAR(50),
  FOREIGN KEY (order_id) REFERENCES inpatient_medication_orders(id)
);

-- Medication Complication Alerts
CREATE TABLE medication_complication_alerts (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  prescription_id VARCHAR(50),
  complication VARCHAR(200) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trigger_value VARCHAR(100),
  recommendation TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(50),
  resolved_at TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Medication Effectiveness Scores
CREATE TABLE medication_effectiveness_scores (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  prescription_id VARCHAR(50),
  overall_score INT,
  symptom_control INT,
  biomarker_response INT,
  adherence_score INT,
  tolerance_score INT,
  quality_of_life_impact INT,
  trend VARCHAR(20) DEFAULT 'stable',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Patient Medication Notes
CREATE TABLE patient_medication_notes (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  prescription_id VARCHAR(50),
  note_type VARCHAR(30) NOT NULL,
  content TEXT NOT NULL,
  severity VARCHAR(20),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_by_doctor BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  tags JSON,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Indexes for performance
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_origin ON prescriptions(origin);
CREATE INDEX idx_prescriptions_date ON prescriptions(start_date);
CREATE INDEX idx_side_effects_patient ON side_effect_tracking(patient_id);
CREATE INDEX idx_inventory_patient ON medication_inventory(patient_id);
CREATE INDEX idx_adherence_date ON medication_adherence(recorded_at);
CREATE INDEX idx_challenges_patient ON therapeutic_challenges(patient_id);
CREATE INDEX idx_reviews_patient ON doctor_medication_reviews(patient_id);
CREATE INDEX idx_switches_patient ON medication_switches(patient_id);
CREATE INDEX idx_inpatient_orders_patient ON inpatient_medication_orders(patient_id);
CREATE INDEX idx_inpatient_orders_status ON inpatient_medication_orders(status);
CREATE INDEX idx_dose_records_order ON inpatient_dose_records(order_id);
CREATE INDEX idx_complication_alerts_patient ON medication_complication_alerts(patient_id);
CREATE INDEX idx_effectiveness_patient ON medication_effectiveness_scores(patient_id);
CREATE INDEX idx_patient_notes_patient ON patient_medication_notes(patient_id);
