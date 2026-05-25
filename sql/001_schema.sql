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
