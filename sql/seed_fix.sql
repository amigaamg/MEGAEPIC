-- Seed test data and fix triggers
ALTER TABLE patients DISABLE TRIGGER trg_patient_context;
ALTER TABLE encounters DISABLE TRIGGER trg_encounter_event;
ALTER TABLE encounters DISABLE TRIGGER trg_create_clinical_context;
ALTER TABLE encounters DISABLE TRIGGER trg_create_workflow_state;

INSERT INTO entities (id, entity_type) VALUES
('d0000000-0000-0000-0000-000000000001', 'patient'),
('d0000000-0000-0000-0000-000000000002', 'patient')
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, hospital_number, given_name, family_name, date_of_birth, age, sex_at_birth, phone) VALUES
('d0000000-0000-0000-0000-000000000001', 'HN-2024-0001', 'John', 'Kamau', '1985-03-15', 39, 'male', '+254712345678'),
('d0000000-0000-0000-0000-000000000002', 'HN-2024-0002', 'Mary', 'Wanjiku', '1990-07-22', 34, 'female', '+254798765432')
ON CONFLICT (id) DO NOTHING;

INSERT INTO encounters (id, patient_id, provider_id, department_id, facility_id, visit_type, priority, clinical_state, reason_for_visit) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'emergency', 'urgent', 'examination', 'Chest pain and shortness of breath for 2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO observations (encounter_id, entity_id, concept_id, value, unit, source, time_observed) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'bp_systolic', '{"value": 160}'::jsonb, 'mmHg', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'bp_diastolic', '{"value": 95}'::jsonb, 'mmHg', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'heart_rate', '{"value": 105}'::jsonb, 'bpm', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'spo2', '{"value": 94}'::jsonb, '%', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'respiratory_rate', '{"value": 22}'::jsonb, '/min', 'clinician', NOW()),
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'temperature', '{"value": 37.2}'::jsonb, 'C', 'clinician', NOW());

ALTER TABLE patients ENABLE TRIGGER trg_patient_context;
ALTER TABLE encounters ENABLE TRIGGER trg_encounter_event;
ALTER TABLE encounters ENABLE TRIGGER trg_create_clinical_context;
ALTER TABLE encounters ENABLE TRIGGER trg_create_workflow_state;

SELECT 'Patients:', COUNT(*) FROM patients
UNION ALL SELECT 'Encounters:', COUNT(*) FROM encounters
UNION ALL SELECT 'Observations:', COUNT(*) FROM observations
UNION ALL SELECT 'Rules:', COUNT(*) FROM rules;
