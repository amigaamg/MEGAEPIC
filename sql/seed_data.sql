-- AMEXAN Clinical OS - Seed Test Data

-- Facilities
INSERT INTO facilities (id, name, type, region) VALUES
('a0000000-0000-0000-0000-000000000001', 'AMEXAN Teaching Hospital', 'teaching', 'Nairobi');

-- Departments
INSERT INTO departments (id, facility_id, name, specialty) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Emergency Department', 'emergency'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Cardiology Clinic', 'cardiology');

-- Clinicians
INSERT INTO clinicians (id, employee_number, given_name, family_name, title, specialization, department_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'DOC001', 'Jane', 'Muthoni', 'Dr.', 'Internal Medicine', 'b0000000-0000-0000-0000-000000000001');

-- Patients
INSERT INTO entities (id, entity_type) VALUES
('d0000000-0000-0000-0000-000000000001', 'patient'),
('d0000000-0000-0000-0000-000000000002', 'patient');

INSERT INTO patients (id, hospital_number, given_name, family_name, date_of_birth, sex_at_birth, phone) VALUES
('d0000000-0000-0000-0000-000000000001', 'HN-2024-0001', 'John', 'Kamau', '1985-03-15', 'male', '+254712345678'),
('d0000000-0000-0000-0000-000000000002', 'HN-2024-0002', 'Mary', 'Wanjiku', '1990-07-22', 'female', '+254798765432');

-- Encounters
INSERT INTO encounters (id, patient_id, provider_id, department_id, facility_id, visit_type, priority, clinical_state, reason_for_visit) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'emergency', 'urgent', 'examination', 'Chest pain and shortness of breath for 2 hours');

-- Observations (clinical findings)
INSERT INTO observations (encounter_id, entity_id, concept_id, value, unit, source, time_observed) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'bp_systolic', '{"value": 160}', 'mmHg', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'bp_diastolic', '{"value": 95}', 'mmHg', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'heart_rate', '{"value": 105}', 'bpm', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'spo2', '{"value": 94}', '%', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'respiratory_rate', '{"value": 22}', '/min', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'temperature', '{"value": 37.2}', '°C', 'clinician', NOW());

-- State transitions
INSERT INTO state_transitions (from_state, to_state) VALUES
('registered', 'triage'), ('triage', 'history'), ('history', 'examination');

-- Clinical Rules (sample)
INSERT INTO rules (code, name, description, category, priority, conditions, actions, status) VALUES
('EXM-001', 'Chest Pain - ECG Required', 'Any patient with chest pain must have ECG within 10 minutes', 'EXM', 90, 
 '[{"field":"complaint","operator":"contains","value":"chest pain"}]'::jsonb,
 '[{"action_type":"require_field","target":"ecg"}]'::jsonb, 'active'),
('EXM-002', 'Hypoxia - Oxygen Protocol', 'SpO2 < 92% triggers oxygen therapy', 'EXM', 85,
 '[{"field":"spo2","operator":"lt","value":"92"}]'::jsonb,
 '[{"action_type":"trigger_alert","target":"oxygen_therapy"}]'::jsonb, 'active'),
('SYS-001', 'Hypertension Alert', 'BP > 140/90 triggers hypertension protocol', 'SYS', 80,
 '[{"field":"bp_systolic","operator":"gt","value":"140"}]'::jsonb,
 '[{"action_type":"trigger_alert","target":"hypertension_protocol"}]'::jsonb, 'active');

SELECT 'Seed data loaded successfully!' AS result;
