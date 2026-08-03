CREATE CONSTRAINT IF NOT EXISTS FOR (s:Symptom) REQUIRE s.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (d:Disease) REQUIRE d.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (inv:Investigation) REQUIRE inv.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (drug:Drug) REQUIRE drug.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (bs:BodySystem) REQUIRE bs.name IS UNIQUE;

MERGE (fever:Symptom {name:'Fever'})
MERGE (cough:Symptom {name:'Cough'})
MERGE (dyspnoea:Symptom {name:'Dyspnoea'})
MERGE (chestPain:Symptom {name:'Chest Pain'})
MERGE (fatigue:Symptom {name:'Fatigue'})
MERGE (weightLoss:Symptom {name:'Weight Loss'})
MERGE (nightSweats:Symptom {name:'Night Sweats'})

MERGE (pneumonia:Disease {name:'Pneumonia'})
MERGE (tb:Disease {name:'Tuberculosis'})
MERGE (heartFailure:Disease {name:'Heart Failure'})
MERGE (copd:Disease {name:'COPD'})
MERGE (asthma:Disease {name:'Asthma'})
MERGE (pe:Disease {name:'Pulmonary Embolism'})
MERGE (lungCa:Disease {name:'Lung Cancer'})

MERGE (resp:BodySystem {name:'Respiratory'})
MERGE (cardio:BodySystem {name:'Cardiovascular'})

MERGE (cxr:Investigation {name:'Chest X-ray'})
MERGE (ctChest:Investigation {name:'CT Chest'})
MERGE (ecg:Investigation {name:'ECG'})
MERGE (echo:Investigation {name:'Echocardiogram'})
MERGE (sputumCulture:Investigation {name:'Sputum Culture'})
MERGE (bloodCulture:Investigation {name:'Blood Culture'})
MERGE (fbc:Investigation {name:'Full Blood Count'})
MERGE (crp:Investigation {name:'C-Reactive Protein'})
MERGE (bnp:Investigation {name:'BNP/NT-proBNP'})
MERGE (pfts:Investigation {name:'Pulmonary Function Tests'})
MERGE (ctpa:Investigation {name:'CT Pulmonary Angiogram'})
MERGE (bronchoscopy:Investigation {name:'Bronchoscopy'})

MERGE (amoxicillin:Drug {name:'Amoxicillin'})
MERGE (doxycycline:Drug {name:'Doxycycline'})
MERGE (rifampicin:Drug {name:'Rifampicin'})
MERGE (isoniazid:Drug {name:'Isoniazid'})
MERGE (furosemide:Drug {name:'Furosemide'})
MERGE (salbutamol:Drug {name:'Salbutamol'})
MERGE (prednisolone:Drug {name:'Prednisolone'})
MERGE (heparin:Drug {name:'Heparin'})

// Symptom -> Disease
MERGE (fever)-[:SUGGESTS]->(pneumonia)
MERGE (cough)-[:SUGGESTS]->(pneumonia)
MERGE (dyspnoea)-[:SUGGESTS]->(pneumonia)
MERGE (cough)-[:SUGGESTS]->(tb)
MERGE (fever)-[:SUGGESTS]->(tb)
MERGE (nightSweats)-[:SUGGESTS]->(tb)
MERGE (weightLoss)-[:SUGGESTS]->(tb)
MERGE (dyspnoea)-[:SUGGESTS]->(heartFailure)
MERGE (fatigue)-[:SUGGESTS]->(heartFailure)
MERGE (chestPain)-[:SUGGESTS]->(heartFailure)
MERGE (cough)-[:SUGGESTS]->(copd)
MERGE (dyspnoea)-[:SUGGESTS]->(copd)
MERGE (cough)-[:SUGGESTS]->(asthma)
MERGE (dyspnoea)-[:SUGGESTS]->(asthma)
MERGE (dyspnoea)-[:SUGGESTS]->(pe)
MERGE (chestPain)-[:SUGGESTS]->(pe)
MERGE (cough)-[:SUGGESTS]->(lungCa)
MERGE (dyspnoea)-[:SUGGESTS]->(lungCa)
MERGE (chestPain)-[:SUGGESTS]->(lungCa)
MERGE (weightLoss)-[:SUGGESTS]->(lungCa)

// Disease -> BodySystem
MERGE (pneumonia)-[:PART_OF]->(resp)
MERGE (tb)-[:PART_OF]->(resp)
MERGE (copd)-[:PART_OF]->(resp)
MERGE (asthma)-[:PART_OF]->(resp)
MERGE (lungCa)-[:PART_OF]->(resp)
MERGE (heartFailure)-[:PART_OF]->(cardio)

// Disease -> Investigation
MERGE (pneumonia)-[:INVESTIGATE_WITH]->(cxr)
MERGE (pneumonia)-[:INVESTIGATE_WITH]->(fbc)
MERGE (pneumonia)-[:INVESTIGATE_WITH]->(crp)
MERGE (pneumonia)-[:INVESTIGATE_WITH]->(bloodCulture)
MERGE (pneumonia)-[:INVESTIGATE_WITH]->(sputumCulture)
MERGE (tb)-[:INVESTIGATE_WITH]->(cxr)
MERGE (tb)-[:INVESTIGATE_WITH]->(sputumCulture)
MERGE (tb)-[:INVESTIGATE_WITH]->(ctChest)
MERGE (heartFailure)-[:INVESTIGATE_WITH]->(ecg)
MERGE (heartFailure)-[:INVESTIGATE_WITH]->(echo)
MERGE (heartFailure)-[:INVESTIGATE_WITH]->(bnp)
MERGE (heartFailure)-[:INVESTIGATE_WITH]->(cxr)
MERGE (copd)-[:INVESTIGATE_WITH]->(pfts)
MERGE (copd)-[:INVESTIGATE_WITH]->(cxr)
MERGE (asthma)-[:INVESTIGATE_WITH]->(pfts)
MERGE (pe)-[:INVESTIGATE_WITH]->(ctpa)
MERGE (pe)-[:INVESTIGATE_WITH]->(ecg)
MERGE (lungCa)-[:INVESTIGATE_WITH]->(cxr)
MERGE (lungCa)-[:INVESTIGATE_WITH]->(ctChest)
MERGE (lungCa)-[:INVESTIGATE_WITH]->(bronchoscopy)

// Disease -> Drug (Treatment)
MERGE (pneumonia)-[:TREATED_BY]->(amoxicillin)
MERGE (pneumonia)-[:TREATED_BY]->(doxycycline)
MERGE (tb)-[:TREATED_BY]->(rifampicin)
MERGE (tb)-[:TREATED_BY]->(isoniazid)
MERGE (heartFailure)-[:TREATED_BY]->(furosemide)
MERGE (copd)-[:TREATED_BY]->(salbutamol)
MERGE (copd)-[:TREATED_BY]->(prednisolone)
MERGE (asthma)-[:TREATED_BY]->(salbutamol)
MERGE (asthma)-[:TREATED_BY]->(prednisolone)
MERGE (pe)-[:TREATED_BY]->(heparin)

// Differential diagnoses (Disease mimics another)
MERGE (pneumonia)-[:MIMICS]->(tb)
MERGE (tb)-[:MIMICS]->(pneumonia)
MERGE (pneumonia)-[:MIMICS]->(heartFailure)
MERGE (heartFailure)-[:MIMICS]->(pneumonia)
MERGE (asthma)-[:MIMICS]->(copd)
MERGE (copd)-[:MIMICS]->(asthma)
MERGE (pneumonia)-[:MIMICS]->(lungCa)
MERGE (lungCa)-[:MIMICS]->(pneumonia)

RETURN 'Knowledge graph seeded' AS result;

// ============================================================================
// ORGANIZATIONAL HIERARCHY SEED DATA
// ============================================================================
// Aligns with PostgreSQL org_hierarchy schema (004_org_hierarchy.sql)
// Hierarchy: Country → Region → Network → Hospital → Department → Ward → Team → Actor

CREATE CONSTRAINT IF NOT EXISTS FOR (c:Country) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (r:Region) REQUIRE r.code IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (n:Network) REQUIRE n.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (h:Hospital) REQUIRE h.amxUid IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (d:Department) REQUIRE d.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (w:Ward) REQUIRE w.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (t:Team) REQUIRE t.name IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (a:Actor) REQUIRE a.amxUid IS UNIQUE;

// ============================================================================
// COUNTRIES (Level 1)
// ============================================================================
MERGE (ke:Country {code:'KE', name:'Kenya', region:'East Africa', continent:'Africa', currency:'KES', language:'en', timezone:'Africa/Nairobi'})
MERGE (tz:Country {code:'TZ', name:'Tanzania', region:'East Africa', continent:'Africa', currency:'TZS', language:'en', timezone:'Africa/Dar_es_Salaam'})
MERGE (ug:Country {code:'UG', name:'Uganda', region:'East Africa', continent:'Africa', currency:'UGX', language:'en', timezone:'Africa/Kampala'})

// ============================================================================
// REGIONS (Level 2)
// ============================================================================
MERGE (nairobi:Region {code:'01', name:'Nairobi', type:'county', countryCode:'KE', population:4700000})
MERGE (kisumu:Region {code:'02', name:'Kisumu', type:'county', countryCode:'KE', population:1150000})
MERGE (mombasa:Region {code:'03', name:'Mombasa', type:'county', countryCode:'KE', population:1200000})
MERGE (kisii:Region {code:'04', name:'Kisii', type:'county', countryCode:'KE', population:1260000})
MERGE (dar:Region {code:'01', name:'Dar es Salaam', type:'region', countryCode:'TZ', population:6000000})

// ============================================================================
// NETWORKS (Level 3 — optional multi-facility groups)
// ============================================================================
MERGE (khsn:Network {name:'Kenya Health Systems Network', type:'hospital_network', countryCode:'KE'})
MERGE (tanet:Network {name:'Tanzania Health Network', type:'hospital_network', countryCode:'TZ'})
MERGE (eastern:Network {name:'Eastern Africa Referral Network', type:'referral_network', countryCode:'KE'})

// ============================================================================
// HOSPITALS / ORGANIZATIONS (Level 4)
// ============================================================================
MERGE (ktrh:Hospital {amxUid:'AMX-HOS-00000001', name:'Kisii Teaching and Referral Hospital', type:'hospital', countryCode:'KE', regionCode:'04', networkName:'Kenya Health Systems Network', subscriptionTier:'enterprise', maxUsers:500, maxStorageGB:500, status:'active'})
MERGE (kmc:Hospital {amxUid:'AMX-HOS-00000002', name:'Kenyatta National Hospital', type:'hospital', countryCode:'KE', regionCode:'01', networkName:'Kenya Health Systems Network', subscriptionTier:'enterprise', maxUsers:1200, maxStorageGB:1000, status:'active'})
MERGE (mh:Hospital {amxUid:'AMX-HOS-00000003', name:'Mombasa Hospital', type:'hospital', countryCode:'KE', regionCode:'03', networkName:'Kenya Health Systems Network', subscriptionTier:'professional', maxUsers:200, maxStorageGB:200, status:'active'})
MERGE (kch:Hospital {amxUid:'AMX-HOS-00000004', name:'Kisumu Central Hospital', type:'hospital', countryCode:'KE', regionCode:'02', networkName:'Eastern Africa Referral Network', subscriptionTier:'professional', maxUsers:350, maxStorageGB:400, status:'active'})
MERGE (muhimbili:Hospital {amxUid:'AMX-HOS-00000005', name:'Muhimbili National Hospital', type:'hospital', countryCode:'TZ', regionCode:'01', networkName:'Tanzania Health Network', subscriptionTier:'enterprise', maxUsers:800, maxStorageGB:800, status:'active'})

// ============================================================================
// DEPARTMENTS (Level 5)
// ============================================================================
MERGE (med:Department {name:'Medicine', type:'medical', specialty:'Internal Medicine', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (surg:Department {name:'Surgery', type:'surgical', specialty:'General Surgery', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (ped:Department {name:'Pediatrics', type:'medical', specialty:'Pediatrics', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (obg:Department {name:'Obstetrics & Gynecology', type:'medical', specialty:'OBG', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (emerg:Department {name:'Emergency', type:'medical', specialty:'Emergency Medicine', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (icu:Department {name:'ICU', type:'medical', specialty:'Critical Care', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (rad:Department {name:'Radiology', type:'diagnostic', specialty:'Radiology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (lab:Department {name:'Laboratory', type:'diagnostic', specialty:'Clinical Pathology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (pharm:Department {name:'Pharmacy', type:'support', specialty:'Pharmacy', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (theatre:Department {name:'Theatre', type:'surgical', specialty:'Operating Theatre', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (admin:Department {name:'Administration', type:'administration', specialty:'Hospital Administration', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (ict:Department {name:'ICT', type:'administration', specialty:'Information Technology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (research:Department {name:'Research', type:'research', specialty:'Clinical Research', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (outpatient:Department {name:'Outpatient', type:'medical', specialty:'Outpatient Department', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (ent:Department {name:'ENT', type:'medical', specialty:'Otolaryngology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (ortho:Department {name:'Orthopedics', type:'surgical', specialty:'Orthopedic Surgery', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (cardio:Department {name:'Cardiology', type:'medical', specialty:'Cardiology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (onco:Department {name:'Oncology', type:'medical', specialty:'Oncology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (derm:Department {name:'Dermatology', type:'medical', specialty:'Dermatology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (ophth:Department {name:'Ophthalmology', type:'medical', specialty:'Ophthalmology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (neuro:Department {name:'Neurology', type:'medical', specialty:'Neurology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (neph:Department {name:'Nephrology', type:'medical', specialty:'Nephrology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (endo:Department {name:'Endocrinology', type:'medical', specialty:'Endocrinology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (gi:Department {name:'Gastroenterology', type:'medical', specialty:'Gastroenterology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (infect:Department {name:'Infectious Diseases', type:'medical', specialty:'Infectious Diseases', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (neo:Department {name:'Neonatology', type:'medical', specialty:'Neonatology', hospitalAmxUid:'AMX-HOS-00000001'})
MERGE (anes:Department {name:'Anesthesia', type:'surgical', specialty:'Anesthesiology', hospitalAmxUid:'AMX-HOS-00000001'})

// ============================================================================
// WARDS / UNITS (Level 6)
// ============================================================================
MERGE (mw1:Ward {name:'Medical Ward I', type:'ward', capacity:30, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Medicine'})
MERGE (mw2:Ward {name:'Medical Ward II', type:'ward', capacity:25, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Medicine'})
MERGE (sw:Ward {name:'Surgical Ward', type:'ward', capacity:20, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Surgery'})
MERGE (pw:Ward {name:'Pediatric Ward', type:'ward', capacity:15, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Pediatrics'})
MERGE (ow:Ward {name:'OBG Ward', type:'ward', capacity:12, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Obstetrics & Gynecology'})
MERGE (icuW:Ward {name:'ICU', type:'icu', capacity:10, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'ICU'})
MERGE (hduW:Ward {name:'HDU', type:'hdu', capacity:8, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'ICU'})
MERGE (nicuW:Ward {name:'NICU', type:'nicu', capacity:6, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Pediatrics'})
MERGE (eb:Ward {name:'Emergency Bay', type:'emergency', capacity:5, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Emergency'})
MERGE (oc:Ward {name:'Outpatient Clinic', type:'outpatient', capacity:20, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Outpatient'})
MERGE (ds:Ward {name:'Day Surgery', type:'day_surgery', capacity:4, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Surgery'})
MERGE (rr:Ward {name:'Recovery Room', type:'recovery', capacity:6, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Surgery'})
MERGE (mt:Ward {name:'Main Theatre', type:'theatre', capacity:3, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Theatre'})
MERGE (lu:Ward {name:'Lab Unit', type:'lab_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})
MERGE (pu:Ward {name:'Pharmacy Unit', type:'pharmacy_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Pharmacy'})
MERGE (ru:Ward {name:'Radiology Unit', type:'radiology_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Radiology'})
MERGE (ct:Ward {name:'CT Scan', type:'radiology_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Radiology'})
MERGE (mri:Ward {name:'MRI', type:'radiology_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Radiology'})
MERGE (bb:Ward {name:'Blood Bank', type:'lab_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})
MERGE (hem:Ward {name:'Hematology', type:'lab_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})
MERGE (micro:Ward {name:'Microbiology', type:'lab_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})
MERGE (chem:Ward {name:'Chemistry', type:'lab_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})
MERGE (pharm:Ward {name:'Pharmacy', type:'pharmacy_unit', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Pharmacy'})
MERGE (ptu:Ward {name:'Physiotherapy Unit', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Theatre'})
MERGE (nu:Ward {name:'Nutrition Unit', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Theatre'})
MERGE (swu:Ward {name:'Social Work Unit', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (rec:Ward {name:'Records', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (mort:Ward {name:'Mortuary', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (ito:Ward {name:'IT Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'ICT'})
MERGE (so:Ward {name:'Security Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (po:Ward {name:'Procurement', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (sto:Ward {name:'Stores', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (maint:Ward {name:'Maintenance', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (trans:Ward {name:'Transport', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (recv:Ward {name:'Reception', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (ro:Ward {name:'Research Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Research'})
MERGE (eo:Ward {name:'Education Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (qa:Ward {name:'Quality Assurance', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (ip:Ward {name:'Infection Prevention', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (fo:Ward {name:'Finance Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Finance'})
MERGE (hro:Ward {name:'HR Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'HR'})
MERGE (icto:Ward {name:'ICT Office', type:'clinic', capacity:0, hospitalAmxUid:'AMX-HOS-00000001', departmentName:'ICT'})

// ============================================================================
// TEAMS (Level 7)
// ============================================================================
MERGE (mrt:Team {name:'Morning Round Team', type:'ward_round', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Medicine'})
MERGE (nst:Team {name:'Night Shift Team', type:'night_shift', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Emergency'})
MERGE (et:Team {name:'Emergency Team', type:'emergency_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Emergency'})
MERGE (sta:Team {name:'Surgical Team A', type:'ward_round', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Surgery'})
MERGE (stb:Team {name:'Surgical Team B', type:'ward_round', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Surgery'})
MERGE (rt:Team {name:'Research Team', type:'research_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Research'})
MERGE (tt:Team {name:'Teaching Team', type:'teaching_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Medicine'})
MERGE (qt:Team {name:'Quality Team', type:'quality_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Administration'})
MERGE (its:Team {name:'IT Support Team', type:'it_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'ICT'})
MERGE (pt:Team {name:'Pharmacy Team', type:'it_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Pharmacy'})
MERGE (lt:Team {name:'Lab Team', type:'it_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})
MERGE (rt2:Team {name:'Radiology Team', type:'it_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Radiology'})
MERGE (bbt:Team {name:'Blood Bank Team', type:'it_team', hospitalAmxUid:'AMX-HOS-00000001', departmentName:'Laboratory'})

// ============================================================================
// ACTORS (Level 8 — the people)
// ============================================================================
MERGE (a1:Actor {amxUid:'AMX-ACT-00000001', name:'Dr. Wanjiku', role:'physician', title:'Senior Consultant', departmentName:'Medicine', unitName:'Medical Ward I', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-001'})
MERGE (a2:Actor {amxUid:'AMX-ACT-00000002', name:'Dr. Odera', role:'physician', title:'Surgeon', departmentName:'Surgery', unitName:'Surgical Ward', teamName:'Surgical Team A', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-002'})
MERGE (a3:Actor {amxUid:'AMX-ACT-00000003', name:'Nurse Achieng', role:'nurse', title:'Ward Nurse', departmentName:'Medicine', unitName:'Medical Ward I', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'NUR-KE-001'})
MERGE (a4:Actor {amxUid:'AMX-ACT-00000004', name:'Dr. Mutua', role:'physician', title:'Intensivist', departmentName:'ICU', unitName:'ICU', teamName:'Night Shift Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-003'})
MERGE (a5:Actor {amxUid:'AMX-ACT-00000005', name:'Dr. Atieno', role:'physician', title:'Radiologist', departmentName:'Radiology', unitName:'Radiology Unit', teamName:'Radiology Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-004'})
MERGE (a6:Actor {amxUid:'AMX-ACT-00000006', name:'Pharmacist Wanjala', role:'pharmacist', title:'Chief Pharmacist', departmentName:'Pharmacy', unitName:'Pharmacy Unit', teamName:'Pharmacy Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'PHAR-KE-001'})
MERGE (a7:Actor {amxUid:'AMX-ACT-00000007', name:'Lab Tech Kipchoge', role:'technologist', title:'Lead Technologist', departmentName:'Laboratory', unitName:'Lab Unit', teamName:'Lab Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'LAB-KE-001'})
MERGE (a8:Actor {amxUid:'AMX-ACT-00000008', name:'Admin Kibet', role:'administrator', title:'Hospital Administrator', departmentName:'Administration', unitName:'Records', teamName:'Quality Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:''})
MERGE (a9:Actor {amxUid:'AMX-ACT-00000009', name:'Dr. Mwangi', role:'physician', title:'Emergency Physician', departmentName:'Emergency', unitName:'Emergency Bay', teamName:'Emergency Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'contract', status:'active', licenseNo:'MED-KE-005'})
MERGE (a10:Actor {amxUid:'AMX-ACT-00000010', name:'Nurse Nyambura', role:'nurse', title:'ICU Nurse', departmentName:'ICU', unitName:'ICU', teamName:'Night Shift Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'NUR-KE-002'})
MERGE (a11:Actor {amxUid:'AMX-ACT-00000011', name:'Dr. Otieno', role:'physician', title:'Pediatrician', departmentName:'Pediatrics', unitName:'Pediatric Ward', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-006'})
MERGE (a12:Actor {amxUid:'AMX-ACT-00000012', name:'Dr. Akinyi', role:'physician', title:'OBG Consultant', departmentName:'Obstetrics & Gynecology', unitName:'OBG Ward', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-007'})
MERGE (a13:Actor {amxUid:'AMX-ACT-00000013', name:'Dr. Ouma', role:'physician', title:'Cardiologist', departmentName:'Cardiology', unitName:'Medical Ward I', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-008'})
MERGE (a14:Actor {amxUid:'AMX-ACT-00000014', name:'Dr. Sitati', role:'physician', title:'Oncologist', departmentName:'Oncology', unitName:'Medical Ward II', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-009'})
MERGE (a15:Actor {amxUid:'AMX-ACT-00000015', name:'Dr. Njeri', role:'physician', title:'Dermatologist', departmentName:'Dermatology', unitName:'Outpatient Clinic', teamName:'Morning Round Team', hospitalAmxUid:'AMX-HOS-00000001', employmentType:'permanent', status:'active', licenseNo:'MED-KE-010'})

// ============================================================================
// RELATIONSHIPS: Country → Region
// ============================================================================
MATCH (ke:Country {code:'KE'}), (nairobi:Region {code:'01', countryCode:'KE'}) MERGE (ke)-[:HAS_REGION]->(nairobi)
MATCH (ke:Country {code:'KE'}), (kisumu:Region {code:'02', countryCode:'KE'}) MERGE (ke)-[:HAS_REGION]->(kisumu)
MATCH (ke:Country {code:'KE'}), (mombasa:Region {code:'03', countryCode:'KE'}) MERGE (ke)-[:HAS_REGION]->(mombasa)
MATCH (ke:Country {code:'KE'}), (kisii:Region {code:'04', countryCode:'KE'}) MERGE (ke)-[:HAS_REGION]->(kisii)
MATCH (tz:Country {code:'TZ'}), (dar:Region {code:'01', countryCode:'TZ'}) MERGE (tz)-[:HAS_REGION]->(dar)

// ============================================================================
// RELATIONSHIPS: Region → Network
// ============================================================================
MATCH (nairobi:Region {code:'01', countryCode:'KE'}), (khsn:Network {name:'Kenya Health Systems Network'}) MERGE (nairobi)-[:BELONGS_TO]->(khsn)
MATCH (kisumu:Region {code:'02', countryCode:'KE'}), (eastern:Network {name:'Eastern Africa Referral Network'}) MERGE (kisumu)-[:BELONGS_TO]->(eastern)
MATCH (mombasa:Region {code:'03', countryCode:'KE'}), (khsn:Network {name:'Kenya Health Systems Network'}) MERGE (mombasa)-[:BELONGS_TO]->(khsn)
MATCH (kisii:Region {code:'04', countryCode:'KE'}), (khsn:Network {name:'Kenya Health Systems Network'}) MERGE (kisii)-[:BELONGS_TO]->(khsn)
MATCH (dar:Region {code:'01', countryCode:'TZ'}), (tanet:Network {name:'Tanzania Health Network'}) MERGE (dar)-[:BELONGS_TO]->(tanet)

// ============================================================================
// RELATIONSHIPS: Network → Hospital
// ============================================================================
MATCH (khsn:Network {name:'Kenya Health Systems Network'}), (ktrh:Hospital {amxUid:'AMX-HOS-00000001'}) MERGE (khsn)-[:MEMBER]->(ktrh)
MATCH (khsn:Network {name:'Kenya Health Systems Network'}), (kmc:Hospital {amxUid:'AMX-HOS-00000002'}) MERGE (khsn)-[:MEMBER]->(kmc)
MATCH (khsn:Network {name:'Kenya Health Systems Network'}), (mh:Hospital {amxUid:'AMX-HOS-00000003'}) MERGE (khsn)-[:MEMBER]->(mh)
MATCH (eastern:Network {name:'Eastern Africa Referral Network'}), (kch:Hospital {amxUid:'AMX-HOS-00000004'}) MERGE (eastern)-[:MEMBER]->(kch)
MATCH (tanet:Network {name:'Tanzania Health Network'}), (muhimbili:Hospital {amxUid:'AMX-HOS-00000005'}) MERGE (tanet)-[:MEMBER]->(muhimbili)

// ============================================================================
// RELATIONSHIPS: Hospital → Department
// ============================================================================
MATCH (h:Hospital {amxUid:'AMX-HOS-00000001'}), (d:Department) WHERE d.hospitalAmxUid = h.amxUid MERGE (h)-[:HAS_DEPARTMENT]->(d)

// ============================================================================
// RELATIONSHIPS: Department → Ward
// ============================================================================
MATCH (d:Department), (w:Ward) WHERE w.departmentName = d.name AND d.hospitalAmxUid = 'AMX-HOS-00000001' MERGE (d)-[:CONTAINS_WARD]->(w)

// ============================================================================
// RELATIONSHIPS: Ward → Team
// ============================================================================
MATCH (w:Ward {name:'Medical Ward I'}), (t:Team {name:'Morning Round Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Medical Ward II'}), (t:Team {name:'Morning Round Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Surgical Ward'}), (t:Team {name:'Surgical Team A'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Surgical Ward'}), (t:Team {name:'Surgical Team B'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Emergency Bay'}), (t:Team {name:'Emergency Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'ICU'}), (t:Team {name:'Night Shift Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Laboratory'}), (t:Team {name:'Lab Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Pharmacy Unit'}), (t:Team {name:'Pharmacy Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Radiology Unit'}), (t:Team {name:'Radiology Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Blood Bank'}), (t:Team {name:'Blood Bank Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Research Office'}), (t:Team {name:'Research Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Education Office'}), (t:Team {name:'Teaching Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'Quality Assurance'}), (t:Team {name:'Quality Team'}) MERGE (w)-[:HAS_TEAM]->(t)
MATCH (w:Ward {name:'IT Office'}), (t:Team {name:'IT Support Team'}) MERGE (w)-[:HAS_TEAM]->(t)

// ============================================================================
// RELATIONSHIPS: Team → Actor
// ============================================================================
MATCH (t:Team {name:'Morning Round Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Night Shift Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Emergency Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Surgical Team A'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Surgical Team B'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Research Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Teaching Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Quality Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'IT Support Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Pharmacy Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Lab Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Radiology Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)
MATCH (t:Team {name:'Blood Bank Team'}), (a:Actor) WHERE a.teamName = t.name MERGE (t)-[:HAS_MEMBER]->(a)

// ============================================================================
// RELATIONSHIPS: Actor → Department (via works_in)
// ============================================================================
MATCH (a:Actor), (d:Department) WHERE a.departmentName = d.name AND d.hospitalAmxUid = 'AMX-HOS-00000001' MERGE (a)-[:WORKS_IN]->(d)

// ============================================================================
// RELATIONSHIPS: Actor → Ward (via assigned_to)
// ============================================================================
MATCH (a:Actor), (w:Ward) WHERE a.unitName = w.name AND w.hospitalAmxUid = 'AMX-HOS-00000001' MERGE (a)-[:ASSIGNED_TO]->(w)

// ============================================================================
// RELATIONSHIPS: Clinical Knowledge Graph → Org Hierarchy
// ============================================================================
// Link departments to clinical specialties for cross-referencing
MATCH (med:Department {name:'Medicine'}), (fever:Symptom {name:'Fever'}) MERGE (med)-[:TREATS]->(fever)
MATCH (med:Department {name:'Medicine'}), (cough:Symptom {name:'Cough'}) MERGE (med)-[:TREATS]->(cough)
MATCH (med:Department {name:'Medicine'}), (dyspnoea:Symptom {name:'Dyspnoea'}) MERGE (med)-[:TREATS]->(dyspnoea)
MATCH (surg:Department {name:'Surgery'}), (chestPain:Symptom {name:'Chest Pain'}) MERGE (surg)-[:TREATS]->(chestPain)
MATCH (emerg:Department {name:'Emergency'}), (chestPain:Symptom {name:'Chest Pain'}) MERGE (emerg)-[:TREATS]->(chestPain)
MATCH (emerg:Department {name:'Emergency'}), (dyspnoea:Symptom {name:'Dyspnoea'}) MERGE (emerg)-[:TREATS]->(dyspnoea)
MATCH (rad:Department {name:'Radiology'}), (cxr:Investigation {name:'Chest X-ray'}) MERGE (rad)-[:USES]->(cxr)
MATCH (rad:Department {name:'Radiology'}), (ctChest:Investigation {name:'CT Chest'}) MERGE (rad)-[:USES]->(ctChest)
MATCH (lab:Department {name:'Laboratory'}), (fbc:Investigation {name:'Full Blood Count'}) MERGE (lab)-[:USES]->(fbc)
MATCH (lab:Department {name:'Laboratory'}), (crp:Investigation {name:'C-Reactive Protein'}) MERGE (lab)-[:USES]->(crp)
MATCH (lab:Department {name:'Laboratory'}), (bloodCulture:Investigation {name:'Blood Culture'}) MERGE (lab)-[:USES]->(bloodCulture)
MATCH (pharm:Department {name:'Pharmacy'}), (amoxicillin:Drug {name:'Amoxicillin'}) MERGE (pharm)-[:STOCKS]->(amoxicillin)
MATCH (pharm:Department {name:'Pharmacy'}), (doxycycline:Drug {name:'Doxycycline'}) MERGE (pharm)-[:STOCKS]->(doxycycline)
MATCH (pharm:Department {name:'Pharmacy'}), (rifampicin:Drug {name:'Rifampicin'}) MERGE (pharm)-[:STOCKS]->(rifampicin)
MATCH (pharm:Department {name:'Pharmacy'}), (isoniazid:Drug {name:'Isoniazid'}) MERGE (pharm)-[:STOCKS]->(isoniazid)
MATCH (pharm:Department {name:'Pharmacy'}), (furosemide:Drug {name:'Furosemide'}) MERGE (pharm)-[:STOCKS]->(furosemide)
MATCH (pharm:Department {name:'Pharmacy'}), (salbutamol:Drug {name:'Salbutamol'}) MERGE (pharm)-[:STOCKS]->(salbutamol)
MATCH (pharm:Department {name:'Pharmacy'}), (prednisolone:Drug {name:'Prednisolone'}) MERGE (pharm)-[:STOCKS]->(prednisolone)
MATCH (pharm:Department {name:'Pharmacy'}), (heparin:Drug {name:'Heparin'}) MERGE (pharm)-[:STOCKS]->(heparin)

// ============================================================================
// RETURN summary
// ============================================================================
RETURN 'Organizational knowledge graph seeded' AS result;
