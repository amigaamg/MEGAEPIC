'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/colors'
import {
  Footprints, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle,
  Clock, Activity, Heart, Thermometer, Droplets, Pill, Syringe,
  Wind, Bed, User, FileText, MessageSquare, ArrowRight, X,
  Brain, Scissors, LogOut, Calendar, Phone, Users, Stethoscope,
  Monitor, Beaker, Scan, BookOpen, Plus, Search, Flag,
} from 'lucide-react'

interface WardPatient {
  id: string
  name: string
  age: number
  sex: string
  occupation: string
  bed: string
  hospitalDay: number
  consultant: string
  diagnosis: string
  admissionReason: string
  overnightEvents: string[]
  vitals: { bp: string; hr: number; rr: number; spo2: number; temp: number; glucose?: number; painScore?: number; weight?: number }
  newsScore: number
  mewsScore: number
  inputOutput: { urine: string; drain: string; ng: string; stoma: string; ivFluids: string; totalIn: string; totalOut: string }
  investigations: { name: string; value: string; trend: 'up' | 'down' | 'stable' | 'new' | 'normal'; flagged: boolean }[]
  currentTreatment: { medications: string[]; ivFluids: string; antibiotics: string; oxygen: string; nutrition: string; devices: string[] }
  assessment: string
  plan: string
  pendingResults: string[]
  pendingImaging: string[]
  consultRequests: string[]
  alerts: string[]
  status: 'stable' | 'review' | 'critical' | 'discharge_ready'
}

type WardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

const STEP_LABELS: Record<WardStep, string> = {
  1: 'Identity',
  2: 'Chief Problem',
  3: 'Overnight Events',
  4: 'Current Status',
  5: 'Input & Output',
  6: 'Investigations',
  7: 'Current Treatment',
  8: 'Assessment',
  9: 'Decision',
  10: "Today's Plan",
  11: 'Complete',
}

const MOCK_PATIENTS: WardPatient[] = [
  {
    id: 'pat_001', name: 'John Mwangi', age: 58, sex: 'Male', occupation: 'Farmer',
    bed: 'Ward 5 - 3A-01', hospitalDay: 3, consultant: 'Dr. Kamau',
    diagnosis: 'Community-acquired pneumonia', admissionReason: 'Fever, cough, difficulty breathing for 5 days',
    overnightEvents: ['Fever 38.5°C at 02:00', 'Cough productive with yellow sputum', 'O2 sat dropped to 90% on RA, improved with 2L NC'],
    vitals: { bp: '130/85', hr: 88, rr: 18, spo2: 96, temp: 37.1, glucose: 6.2, painScore: 3, weight: 72 },
    newsScore: 2, mewsScore: 1,
    inputOutput: { urine: '1200 mL/24h', drain: 'Nil', ng: 'Nil', stoma: 'Nil', ivFluids: 'D5 1L + 0.9%NS 1L', totalIn: '2200 mL', totalOut: '1500 mL' },
    investigations: [
      { name: 'Hb', value: '13.2', trend: 'stable', flagged: false },
      { name: 'WBC', value: '11.5', trend: 'down', flagged: true },
      { name: 'CRP', value: '45', trend: 'down', flagged: true },
      { name: 'Creatinine', value: '0.9', trend: 'stable', flagged: false },
      { name: 'Potassium', value: '4.1', trend: 'stable', flagged: false },
      { name: 'Blood Culture', value: 'Pending', trend: 'new', flagged: true },
      { name: 'CXR', value: 'Lobar consolidation L lower zone - improving', trend: 'stable', flagged: false },
    ],
    currentTreatment: {
      medications: ['Amoxicillin-Clavulanate 1.2g IV q8h', 'Paracetamol 1g PO q6h PRN fever', 'Salbutamol nebulisation q6h'],
      ivFluids: '0.9% Normal Saline 1L q8h',
      antibiotics: 'Amoxicillin-Clavulanate (Day 3 of 7)',
      oxygen: '2L/min nasal cannula (weaning)',
      nutrition: 'Soft diet, tolerating well',
      devices: ['IV cannula R hand', 'Nasal cannula'],
    },
    assessment: 'Day 3 of CAP. Clinically improving. Fever resolved 48h. O2 sat improving on weaning O2. WBC and CRP trending down.',
    plan: 'Continue antibiotics. Wean O2. Repeat CXR if not improving by Day 5. Plan discharge Day 7.',
    pendingResults: ['Blood culture sensitivity'],
    pendingImaging: [],
    consultRequests: [],
    alerts: [],
    status: 'review',
  },
  {
    id: 'pat_002', name: 'Grace Kamau', age: 42, sex: 'Female', occupation: 'Teacher',
    bed: 'ICU - Bed 4', hospitalDay: 1, consultant: 'Dr. Ochieng',
    diagnosis: 'Diabetic ketoacidosis', admissionReason: 'Vomiting, abdominal pain, confusion for 2 days',
    overnightEvents: ['pH 7.1 at 22:00', 'K+ 3.1 - repleted', 'Glucose 28 mmol/L - insulin infusion', 'Nausea and vomiting persisted'],
    vitals: { bp: '100/60', hr: 112, rr: 26, spo2: 98, temp: 36.8, glucose: 12.4, painScore: 5 },
    newsScore: 6, mewsScore: 4,
    inputOutput: { urine: '800 mL/12h', drain: 'Nil', ng: 'NG output 200 mL', stoma: 'Nil', ivFluids: '0.9%NS 1L + 0.45%NS 1L', totalIn: '2100 mL', totalOut: '1200 mL' },
    investigations: [
      { name: 'pH', value: '7.28', trend: 'up', flagged: true },
      { name: 'HCO3', value: '12', trend: 'up', flagged: true },
      { name: 'K+', value: '3.8', trend: 'up', flagged: false },
      { name: 'Glucose', value: '12.4', trend: 'down', flagged: true },
      { name: 'Creatinine', value: '1.2', trend: 'stable', flagged: false },
      { name: 'BUN', value: '18', trend: 'down', flagged: false },
    ],
    currentTreatment: {
      medications: ['Insulin infusion (variable rate)', 'KCl 40 mmol in 1L NS', 'Ondansetron 4mg IV q8h'],
      ivFluids: '0.9% Normal Saline for resuscitation',
      antibiotics: 'Ceftriaxone 2g IV (suspected sepsis)',
      oxygen: 'Nil (sat 98% RA)',
      nutrition: 'NBM - awaiting resolution of DKA',
      devices: ['IV cannula ×2', 'Insulin infusion pump', 'NG tube', 'Urinary catheter'],
    },
    assessment: 'DKA improving. pH rising, glucose falling. K+ repleted. Still requires close monitoring for cerebral oedema and hypoglycaemia.',
    plan: 'Continue insulin infusion. Monitor glucose hourly. Check ABG 4hrly. Transition to SC insulin when resolved.',
    pendingResults: ['ABG 06:00', 'Blood cultures'],
    pendingImaging: ['CXR (rule out aspiration)'],
    consultRequests: ['Endocrinology - for DM management plan'],
    alerts: ['pH < 7.3 - monitor for cerebral oedema', 'K+ borderline - recheck 2hrly'],
    status: 'critical',
  },
  {
    id: 'pat_003', name: 'Peter Ochieng', age: 72, sex: 'Male', occupation: 'Retired',
    bed: 'Ward 5 - 3A-03', hospitalDay: 5, consultant: 'Dr. Kamau',
    diagnosis: 'Acute decompensated heart failure', admissionReason: 'Worsening SOB, orthopnoea, leg swelling for 1 week',
    overnightEvents: ['O2 sat 89% on 4L NC at 01:00', 'Chest pain - resolved with GTN', 'Oliguric - urine output 300 mL/8h'],
    vitals: { bp: '90/55', hr: 105, rr: 28, spo2: 89, temp: 37.0, weight: 78, painScore: 4 },
    newsScore: 8, mewsScore: 5,
    inputOutput: { urine: '900 mL/24h', drain: 'Nil', ng: 'Nil', stoma: 'Nil', ivFluids: 'Nil (IV restricted)', totalIn: '1200 mL', totalOut: '900 mL' },
    investigations: [
      { name: 'Hb', value: '11.0', trend: 'down', flagged: true },
      { name: 'Creatinine', value: '1.8', trend: 'up', flagged: true },
      { name: 'K+', value: '5.2', trend: 'up', flagged: true },
      { name: 'NT-proBNP', value: '8500', trend: 'new', flagged: true },
      { name: 'CXR', value: 'Bilateral pleural effusions, cardiomegaly', trend: 'new', flagged: true },
      { name: 'Echo', value: 'EF 30%, severe MR, RVSP 55', trend: 'new', flagged: true },
    ],
    currentTreatment: {
      medications: ['Furosemide 80mg IV q12h', 'Spironolactone 25mg PO daily', 'Enalapril 2.5mg PO daily', 'Digoxin 0.125mg PO daily'],
      ivFluids: 'Restricted to 1.5L/day',
      antibiotics: 'Nil',
      oxygen: '4L/min nasal cannula',
      nutrition: 'Low salt diet. Fluid restriction 1.5L/day.',
      devices: ['IV cannula', 'Nasal cannula', 'Urinary catheter → output monitoring'],
    },
    assessment: 'Day 5 of HF admission. Hypotensive, oliguric, rising creatinine. Echo shows severe MR with low EF. Needs urgent nephrology and cardiothoracic review.',
    plan: 'Consider inotropes if BP drops further. Nephrology review for AKI. Echo for surgical vs medical management of MR.',
    pendingResults: ['Troponin T', 'Blood cultures'],
    pendingImaging: ['CT pulmonary angiogram (rule out PE)'],
    consultRequests: ['Nephrology - AKI', 'Cardiothoracic - severe MR'],
    alerts: ['Hypotensive (MAP <65)', 'Oliguric', 'Rising K+ and creatinine'],
    status: 'critical',
  },
  {
    id: 'pat_004', name: 'Ann Wanjiku', age: 35, sex: 'Female', occupation: 'Nurse',
    bed: 'Ward 5 - 3A-04', hospitalDay: 2, consultant: 'Dr. Ochieng',
    diagnosis: 'Severe malaria', admissionReason: 'Fever, headache, body aches for 4 days',
    overnightEvents: ['Fever 39.2°C at 23:00 - given paracetamol', 'No seizures', 'One episode of vomiting'],
    vitals: { bp: '110/70', hr: 95, rr: 20, spo2: 97, temp: 38.5, glucose: 4.8 },
    newsScore: 3, mewsScore: 2,
    inputOutput: { urine: '1600 mL/24h', drain: 'Nil', ng: 'Nil', stoma: 'Nil', ivFluids: 'D5 1L + 0.9%NS 1L', totalIn: '2200 mL', totalOut: '1800 mL' },
    investigations: [
      { name: 'Hb', value: '9.5', trend: 'down', flagged: true },
      { name: 'WBC', value: '8.2', trend: 'stable', flagged: false },
      { name: 'Platelets', value: '85', trend: 'down', flagged: true },
      { name: 'Parasite Count', value: '2%', trend: 'down', flagged: true },
      { name: 'Blood Glucose', value: '4.8', trend: 'stable', flagged: false },
      { name: 'Creatinine', value: '0.8', trend: 'stable', flagged: false },
    ],
    currentTreatment: {
      medications: ['IV Artesunate (2.4mg/kg) at 0, 12, 24h', 'Paracetamol 1g IV q6h PRN fever'],
      ivFluids: 'D5 1L + 0.9% Normal Saline 1L alternating',
      antibiotics: 'Nil',
      oxygen: 'Nil',
      nutrition: 'Light diet as tolerated',
      devices: ['IV cannula'],
    },
    assessment: 'Severe malaria responding to artesunate. Parasite count dropping. Hb stable. No signs of cerebral malaria or organ dysfunction.',
    plan: 'Continue IV artesunate. Monitor parasite count q12h. Check Hb daily. Transition to oral when tolerating and parasite count <1%.',
    pendingResults: ['Parasite count today', 'Hb today'],
    pendingImaging: [],
    consultRequests: [],
    alerts: [],
    status: 'review',
  },
  {
    id: 'pat_005', name: 'David Kiprop', age: 65, sex: 'Male', occupation: 'Mechanic',
    bed: 'Ward 5 - 3A-05', hospitalDay: 7, consultant: 'Dr. Kamau',
    diagnosis: 'Ischaemic stroke (Left MCA territory)', admissionReason: 'Sudden onset right-sided weakness, slurred speech 7 days ago',
    overnightEvents: ['Slept well', 'No new neurological deficits', 'BP well controlled'],
    vitals: { bp: '135/85', hr: 78, rr: 16, spo2: 98, temp: 36.6, glucose: 5.5, painScore: 1 },
    newsScore: 0, mewsScore: 0,
    inputOutput: { urine: '1800 mL/24h', drain: 'Nil', ng: 'Nil', stoma: 'Nil', ivFluids: 'Nil - oral', totalIn: '2000 mL', totalOut: '1900 mL' },
    investigations: [
      { name: 'NIHSS', value: '4 (improved from 12)', trend: 'down', flagged: false },
      { name: 'CT Head', value: 'Infarct L MCA territory, no haemorrhage', trend: 'stable', flagged: false },
      { name: 'Carotid Doppler', value: 'R internal carotid 70% stenosis', trend: 'new', flagged: true },
      { name: 'Hb', value: '13.8', trend: 'stable', flagged: false },
      { name: 'Lipids', value: 'LDL 3.8, HDL 1.0', trend: 'stable', flagged: true },
    ],
    currentTreatment: {
      medications: ['Aspirin 75mg PO daily', 'Atorvastatin 40mg PO daily', 'Enalapril 5mg PO daily'],
      ivFluids: 'Nil - tolerating oral',
      antibiotics: 'Nil',
      oxygen: 'Nil',
      nutrition: 'Soft diet - swallowing assessed, safe',
      devices: ['Nil'],
    },
    assessment: 'Day 7 post-stroke. Significant neurological improvement (NIHSS 12→4). Mild right-sided weakness persists. Carotid stenosis identified. Swallowing safe.',
    plan: 'Continue medical management. PT/OT for rehabilitation. Consider carotid endarterectomy for 70% stenosis. Arrange follow-up in stroke clinic 2 weeks.',
    pendingResults: ['Echo (rule out cardiogenic source)'],
    pendingImaging: [],
    consultRequests: ['Vascular surgery - for carotid stenosis', 'PT/OT - rehabilitation assessment'],
    alerts: [],
    status: 'discharge_ready',
  },
  {
    id: 'pat_006', name: 'Sarah Nyambura', age: 28, sex: 'Female', occupation: 'Accountant',
    bed: 'Ward 5 - 3A-06', hospitalDay: 4, consultant: 'Dr. Ochieng',
    diagnosis: 'Severe preeclampsia', admissionReason: 'Rising BP, headache, visual disturbances at 34 weeks',
    overnightEvents: ['BP spike 170/115 at 03:00 - given IV labetalol', 'Headache persistent', 'Fetal heart rate reassuring'],
    vitals: { bp: '160/110', hr: 100, rr: 22, spo2: 97, temp: 37.2 },
    newsScore: 5, mewsScore: 3,
    inputOutput: { urine: '600 mL/24h', drain: 'Nil', ng: 'Nil', stoma: 'Nil', ivFluids: '0.9%NS 1L (restricted)', totalIn: '1500 mL', totalOut: '800 mL' },
    investigations: [
      { name: 'Urine Protein', value: '3+ (300 mg/dL)', trend: 'new', flagged: true },
      { name: 'Creatinine', value: '1.1', trend: 'up', flagged: false },
      { name: 'LFTs - AST', value: '65', trend: 'up', flagged: true },
      { name: 'Platelets', value: '120', trend: 'down', flagged: false },
      { name: 'Fetal US', value: 'Growth 10th centile, AFI normal', trend: 'stable', flagged: false },
    ],
    currentTreatment: {
      medications: ['IV Labetalol infusion (titrated to BP)', 'MgSO4 loading dose given', 'Dexamethasone 6mg IM q12h (fetal lung maturity)'],
      ivFluids: 'Restricted to 1.5L/day',
      antibiotics: 'Nil',
      oxygen: 'Nil',
      nutrition: 'Low salt diet',
      devices: ['IV cannula ×2', 'Urinary catheter', 'Fetal monitor'],
    },
    assessment: 'Severe preeclampsia with end-organ involvement (LFTs, proteinuria). BP controlled with labetalol. Fetal growth restricted. MgSO4 for seizure prophylaxis.',
    plan: 'Plan delivery at 34+5 after steroid course complete. NICU team notified. Paediatric review. Monitor for HELLP syndrome.',
    pendingResults: ['LFTs today', 'Platelets today', 'Urine protein/creatinine ratio'],
    pendingImaging: [],
    consultRequests: ['Neonatology - for NICU bed', 'Anaesthesia - for delivery planning'],
    alerts: ['HELLP monitoring', 'Seizure precautions', 'Fetal growth restriction'],
    status: 'critical',
  },
  {
    id: 'pat_007', name: 'Samuel Kioko', age: 45, sex: 'Male', occupation: 'Businessman',
    bed: 'Ward 5 - 3A-07', hospitalDay: 10, consultant: 'Dr. Kamau',
    diagnosis: 'Decompensated cirrhosis with ascites', admissionReason: 'Abdominal distension, confusion, jaundice for 2 weeks',
    overnightEvents: ['Mild confusion - asterixis noted', 'Paracentesis drained 3.5L', 'Albumin infusion given'],
    vitals: { bp: '110/70', hr: 82, rr: 18, spo2: 96, temp: 36.9, weight: 72, glucose: 5.0 },
    newsScore: 2, mewsScore: 1,
    inputOutput: { urine: '1400 mL/24h', drain: 'Ascitic drain 3500 mL', ng: 'Nil', stoma: 'Nil', ivFluids: '20% Albumin 100mL', totalIn: '1600 mL', totalOut: '5100 mL' },
    investigations: [
      { name: 'Hb', value: '10.2', trend: 'down', flagged: true },
      { name: 'INR', value: '1.8', trend: 'up', flagged: true },
      { name: 'Bilirubin', value: '85', trend: 'up', flagged: true },
      { name: 'Albumin', value: '22', trend: 'down', flagged: true },
      { name: 'Creatinine', value: '1.0', trend: 'stable', flagged: false },
      { name: 'MELD', value: '18', trend: 'up', flagged: true },
      { name: 'Ascitic Fluid', value: 'SAAG >1.1, no organisms', trend: 'new', flagged: false },
    ],
    currentTreatment: {
      medications: ['Spironolactone 100mg PO daily', 'Furosemide 40mg PO daily', 'Lactulose 20mL TID', 'Rifaximin 550mg PO BID', 'Vit K 10mg IV daily'],
      ivFluids: 'Albumin 20% 100mL post-paracentesis',
      antibiotics: 'Nil active (SBP prophylaxis - ciprofloxacin stopped)',
      oxygen: 'Nil',
      nutrition: 'Low sodium diet. Moderate protein. Fluid restriction 1.5L',
      devices: ['Ascitic drain (removed post-paracentesis)', 'IV cannula'],
    },
    assessment: 'Decompensated cirrhosis with ascites, mild HE (Grade 1-2), jaundice. Paracentesis effective. Lactulose and rifaximin for HE. MELD 18 - consider transplant eval.',
    plan: 'Continue lactulose/rifaximin. Monitor encephalopathy. Sodium restriction. Arrange OGD for varices screening. Hepatology referral for transplant evaluation.',
    pendingResults: ['Ascitic fluid culture (48h)', 'LFTs tomorrow'],
    pendingImaging: ['OGD for varices'],
    consultRequests: ['Hepatology - for transplant evaluation', 'Nutrition - dietary plan'],
    alerts: ['Hepatic encephalopathy Grade 1-2', 'Risk of SBP', 'Bleeding risk (INR 1.8)'],
    status: 'review',
  },
]

export default function WardRoundPage() {
  const router = useRouter()
  const [patients] = useState<WardPatient[]>(MOCK_PATIENTS)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentStep, setCurrentStep] = useState<WardStep>(1)
  const [showPreRound, setShowPreRound] = useState(true)
  const [editedAssessment, setEditedAssessment] = useState('')
  const [doctorDictated, setDoctorDictated] = useState('')
  const [aiStructuredPlan, setAiStructuredPlan] = useState('')
  const [completedPatients, setCompletedPatients] = useState<Set<string>>(new Set())
  const [showOrderDialog, setShowOrderDialog] = useState<string | null>(null)
  const [showConsultDialog, setShowConsultDialog] = useState(false)
  const [showFamilyDialog, setShowFamilyDialog] = useState(false)
  const [showProcedureDialog, setShowProcedureDialog] = useState(false)
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' | 'warning' } | null>(null)

  const notify = useCallback((msg: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const patient = patients[currentIdx]
  const isLast = currentIdx === patients.length - 1
  const isFirst = currentIdx === 0

  const activePatients = useMemo(() => patients.filter(p => p.status !== 'discharge_ready'), [patients])
  const criticalPatients = useMemo(() => patients.filter(p => p.status === 'critical'), [patients])
  const dischargeReady = useMemo(() => patients.filter(p => p.status === 'discharge_ready'), [patients])

  useEffect(() => {
    if (patient) setEditedAssessment(patient.assessment)
  }, [currentIdx, patient])

  const stepProgress = useMemo(() => {
    if (completedPatients.has(patient.id)) return 100
    return Math.round((currentStep / 11) * 100)
  }, [currentStep, patient, completedPatients])

  const stepDescriptions: Record<WardStep, { label: string; icon: any; content: string[] }> = {
    1: { label: 'Identity', icon: User, content: [
      `Name: ${patient?.name}`,
      `Age: ${patient?.age} years`,
      `Sex: ${patient?.sex}`,
      `Occupation: ${patient?.occupation}`,
      `Hospital Day: ${patient?.hospitalDay}`,
      `Bed: ${patient?.bed}`,
      `Consultant: ${patient?.consultant}`,
    ]},
    2: { label: 'Chief Problem', icon: Flag, content: [
      `Diagnosis: ${patient?.diagnosis}`,
      `Reason for Admission: ${patient?.admissionReason}`,
    ]},
    3: { label: 'Overnight Events', icon: Clock, content: patient?.overnightEvents || []},
    4: { label: 'Current Status', icon: Activity, content: [
      `BP: ${patient?.vitals.bp} | HR: ${patient?.vitals.hr} | RR: ${patient?.vitals.rr} | SpO2: ${patient?.vitals.spo2}% | Temp: ${patient?.vitals.temp}°C`,
      `NEWS: ${patient?.newsScore} | MEWS: ${patient?.mewsScore}`,
      `Glucose: ${patient?.vitals.glucose ?? 'N/A'} | Pain Score: ${patient?.vitals.painScore ?? 'N/A'}`,
      `Weight: ${patient?.vitals.weight ?? 'N/A'} kg`,
    ]},
    5: { label: 'Input & Output', icon: Droplets, content: [
      `Urine: ${patient?.inputOutput.urine}`,
      `Drain: ${patient?.inputOutput.drain}`,
      `NG: ${patient?.inputOutput.ng}`,
      `Stoma: ${patient?.inputOutput.stoma}`,
      `IV Fluids: ${patient?.inputOutput.ivFluids}`,
      `Total In: ${patient?.inputOutput.totalIn} | Total Out: ${patient?.inputOutput.totalOut}`,
    ]},
    6: { label: 'Investigations', icon: Beaker, content: patient?.investigations.map(i =>
      `${i.name}: ${i.value} ${i.flagged ? '⚑' : ''} (${i.trend})`
    ) || []},
    7: { label: 'Current Treatment', icon: Pill, content: [
      'Medications:', ...(patient?.currentTreatment.medications || []),
      `IV Fluids: ${patient?.currentTreatment.ivFluids}`,
      `Antibiotics: ${patient?.currentTreatment.antibiotics}`,
      `Oxygen: ${patient?.currentTreatment.oxygen}`,
      `Nutrition: ${patient?.currentTreatment.nutrition}`,
      'Devices:', ...(patient?.currentTreatment.devices || []),
    ]},
    8: { label: 'Assessment', icon: Brain, content: [editedAssessment]},
    9: { label: 'Decision', icon: ArrowRight, content: [
      'Continue current management',
      'Escalate care',
      'Discharge planning',
      'Operative intervention',
      'Refer to specialist',
      'ICU transfer',
      'Further investigations',
      'Review later today',
    ]},
    10: { label: "Today's Plan", icon: FileText, content: [
      doctorDictated || 'Dictate your plan...',
      aiStructuredPlan ? `AI Structured Plan: ${aiStructuredPlan}` : '',
    ]},
    11: { label: 'Complete', icon: CheckCircle, content: ['Patient round completed. Moving to next patient.']},
  }

  const handleQuickOrder = useCallback((order: string) => {
    if (order === 'CBC') {
      notify('CBC ordered → Lab workflow started. Specimen label printed.', 'success')
    } else if (order === 'CT Abdomen') {
      notify('CT Abdomen ordered → Radiology workflow initiated. Transport notified.', 'success')
    } else if (order === 'Discharge tomorrow') {
      notify('Discharge planning started. Pharmacy, Nursing, Billing notified.', 'warning')
    } else if (order === 'Cardiology consult') {
      setShowConsultDialog(true)
    } else {
      notify(`Order placed: ${order}`, 'info')
    }
  }, [notify])

  const handleDecision = useCallback((decision: string) => {
    if (decision === 'Discharge') {
      const outstanding: string[] = []
      if (patient.pendingResults.length) outstanding.push('Pending lab results')
      if (patient.pendingImaging.length) outstanding.push('Pending imaging')
      if (outstanding.length) {
        notify(`⚠ Cannot discharge: ${outstanding.join(', ')}`, 'warning')
        return
      }
      notify('✅ Discharge summary generated. Prescription issued. Follow-up booked. SMS sent.', 'success')
    } else if (decision === 'Operate') {
      notify('Operation workflow initiated. Anaesthesia review, consent, blood request, theatre slot requested.', 'success')
    } else if (decision === 'ICU') {
      notify('ICU transfer initiated. Bed request sent. Critical care team notified.', 'success')
    } else if (decision === 'Refer') {
      setShowConsultDialog(true)
    } else {
      notify(`Decision recorded: ${decision}`, 'info')
    }
  }, [notify, patient])

  const handleStepComplete = useCallback(() => {
    if (currentStep < 11) {
      if (currentStep === 8) {
        setEditedAssessment(editedAssessment)
      }
      if (currentStep === 10) {
        setAiStructuredPlan(`Dr. dictated: "${doctorDictated || 'No plan dictated'}" → Orders: Continue medications, review labs, review tomorrow.`)
        notify('Plan structured. Orders generated automatically. Tasks distributed.', 'success')
      }
      setCurrentStep((currentStep + 1) as WardStep)
    } else {
      setCompletedPatients(prev => new Set(prev).add(patient.id))
      notify(`✅ ${patient.name} round completed.`, 'success')
      if (!isLast) {
        setCurrentIdx(currentIdx + 1)
        setCurrentStep(1)
        setDoctorDictated('')
        setAiStructuredPlan('')
      }
    }
  }, [currentStep, currentIdx, patient, editedAssessment, doctorDictated, isLast, notify])

  if (showPreRound) {
    return (
      <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 40, maxWidth: 520, width: '90%' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Footprints size={28} color={C.sky} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Good Morning, Dr. James</div>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 24 }}>Kisii Teaching Hospital · General Surgery · Morning Shift (07:00 - 11:00)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            <div style={{ padding: 14, borderRadius: 10, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.sky }}>{patients.length}</div>
              <div style={{ fontSize: 11, color: C.textLight }}>Total Patients</div>
            </div>
            <div style={{ padding: 14, borderRadius: 10, background: '#FFF1F2', border: '1px solid #FECDD3', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.red }}>{criticalPatients.length}</div>
              <div style={{ fontSize: 11, color: C.red }}>Critical</div>
            </div>
            <div style={{ padding: 14, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>{dischargeReady.length}</div>
              <div style={{ fontSize: 11, color: C.green }}>Discharge Ready</div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>Patient Queue (ordered by bed)</div>
            {patients.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: i === currentIdx ? C.skyLight : 'transparent', marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.status === 'critical' ? C.red : p.status === 'discharge_ready' ? C.green : C.amber }} />
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{p.bed}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.text, flex: 2 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: C.textLight, flex: 2 }}>{p.diagnosis}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: p.status === 'critical' ? '#FFF1F2' : p.status === 'discharge_ready' ? '#F0FDF4' : '#FEFCE8', color: p.status === 'critical' ? C.red : p.status === 'discharge_ready' ? C.green : C.amber }}>{p.status}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowPreRound(false)} style={{ width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none', background: C.sky, color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Start Ward Round →
          </button>
        </div>
      </div>
    )
  }

  const stepInfo = stepDescriptions[currentStep]
  const StepIcon = stepInfo.icon

  return (
    <div style={{ minHeight: '100vh', background: C.panel, fontFamily: "'Inter', sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: notification.type === 'warning' ? '#FFFBEB' : notification.type === 'success' ? '#F0FDF4' : '#EFF6FF', border: `1px solid ${notification.type === 'warning' ? '#FDE68A' : notification.type === 'success' ? '#BBF7D0' : '#BFDBFE'}`, fontSize: 12, fontWeight: 500, color: notification.type === 'warning' ? '#92400E' : notification.type === 'success' ? '#166534' : '#1E40AF', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxWidth: 400 }}>
          {notification.msg}
        </div>
      )}

      {/* Top Bar */}
      <header style={{ height: 56, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Footprints size={18} color={C.sky} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: C.skyLight, color: C.sky, fontWeight: 600 }}>WARD ROUND MODE</span>
        <span style={{ fontSize: 12, color: C.textLight }}>|</span>
        <span style={{ fontSize: 12, color: C.text }}>Patient {currentIdx + 1} of {patients.length}</span>
        <span style={{ fontSize: 12, color: C.textLight }}>|</span>
        <span style={{ fontSize: 12, color: C.text }}>{patient.bed}</span>
        <div style={{ flex: 1 }} />

        {/* Quick Order Buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['CBC', 'CT Abdomen', 'Discharge tomorrow', 'Cardiology consult'].map(order => (
            <button key={order} onClick={() => handleQuickOrder(order)} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', color: C.text, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {order === 'CBC' ? '🩸' : order === 'CT Abdomen' ? '🔬' : order === 'Discharge tomorrow' ? '📋' : '🫀'} {order}
            </button>
          ))}
        </div>

        <button onClick={() => router.push('/doctor')} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer', color: C.textLight }}>
          Exit Round
        </button>
      </header>

      {/* Progress Bar */}
      <div style={{ height: 3, background: C.border }}>
        <div style={{ height: '100%', width: `${stepProgress}%`, background: C.sky, transition: 'width 0.3s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Patient Navigation Strip */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 24px', overflow: 'auto', background: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {patients.map((p, i) => (
          <button key={p.id} onClick={() => { setCurrentIdx(i); setCurrentStep(1); setDoctorDictated(''); setAiStructuredPlan('') }}
            style={{ padding: '6px 14px', borderRadius: 6, border: i === currentIdx ? `2px solid ${C.sky}` : `1px solid ${C.border}`, background: i === currentIdx ? C.skyLight : completedPatients.has(p.id) ? '#F0FDF4' : C.white, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', color: i === currentIdx ? C.sky : C.text, fontWeight: i === currentIdx ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
            {completedPatients.has(p.id) && <CheckCircle size={10} color={C.green} />}
            {!completedPatients.has(p.id) && p.status === 'critical' && <AlertTriangle size={10} color={C.red} />}
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Step Navigation */}
      <div style={{ display: 'flex', gap: 2, padding: '8px 24px', background: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflow: 'auto' }}>
        {(Object.entries(STEP_LABELS) as [string, string][]).map(([step, label]) => {
          const s = Number(step) as WardStep
          const isActive = s === currentStep
          const isDone = s < currentStep
          return (
            <button key={step} onClick={() => setCurrentStep(s)}
              style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: isActive ? C.sky : isDone ? '#F0FDF4' : 'transparent', color: isActive ? C.white : isDone ? C.green : C.textLight, fontSize: 10, fontWeight: isActive || isDone ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
              {isDone ? <CheckCircle size={10} /> : isActive ? <ChevronRight size={10} /> : null}
              {s}. {label}
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Patient Banner */}
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: patient.status === 'critical' ? C.red : C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 18, fontWeight: 600 }}>
              {patient.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 600, color: C.navy }}>{patient.name}</span>
                {patient.alerts.map((a, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: '#FFF1F2', color: C.red }}>
                    <AlertTriangle size={10} /> {a}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: C.textLight }}>
                <span>Bed: {patient.bed}</span>
                <span>Day {patient.hospitalDay}</span>
                <span>Consultant: {patient.consultant}</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: patient.status === 'critical' ? '#FFF1F2' : '#FEFCE8', color: patient.status === 'critical' ? C.red : C.amber, fontWeight: 600 }}>{patient.status.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowFamilyDialog(true)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> Family</button>
              <button onClick={() => setShowProcedureDialog(true)} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Scissors size={12} /> Procedure</button>
            </div>
          </div>

          {/* Step Content */}
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: C.skyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StepIcon size={18} color={C.sky} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Step {currentStep}: {stepInfo.label}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>Step {currentStep} of 11</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentStep === 1 && stepInfo.content.map((line, i) => (
                <div key={i} style={{ padding: '8px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, minWidth: 120 }}>{line.split(':')[0]}:</span>
                  <span>{line.split(':').slice(1).join(':')}</span>
                </div>
              ))}

              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Diagnosis</span>
                    <span style={{ color: C.text }}>{patient.diagnosis}</span>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Reason for Admission</span>
                    <span style={{ color: C.text }}>{patient.admissionReason}</span>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {patient.overnightEvents.length === 0 && (
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} /> No significant overnight events. Patient slept well.
                    </div>
                  )}
                  {patient.overnightEvents.map((evt, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: i % 2 === 0 ? C.panel : C.white, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={12} color={C.textLight} />
                      {evt}
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>BP</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{patient.vitals.bp}</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>HR</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: patient.vitals.hr > 100 ? C.red : patient.vitals.hr < 60 ? C.amber : C.navy }}>{patient.vitals.hr}</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>RR</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: patient.vitals.rr > 22 ? C.red : C.navy }}>{patient.vitals.rr}</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>SpO2</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: patient.vitals.spo2 < 94 ? C.red : C.navy }}>{patient.vitals.spo2}%</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>Temp</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: patient.vitals.temp > 38 ? C.red : C.navy }}>{patient.vitals.temp}°C</div>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: C.textLight, marginBottom: 2 }}>Glucose</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: patient.vitals.glucose && patient.vitals.glucose > 11 ? C.red : patient.vitals.glucose && patient.vitals.glucose < 3.9 ? C.amber : C.navy }}>{patient.vitals.glucose ?? '-'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: '8px 14px', borderRadius: 8, background: patient.newsScore >= 5 ? '#FFF1F2' : patient.newsScore >= 3 ? '#FFFBEB' : '#F0FDF4', border: `1px solid ${patient.newsScore >= 5 ? '#FECDD3' : patient.newsScore >= 3 ? '#FDE68A' : '#BBF7D0'}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={14} color={patient.newsScore >= 5 ? C.red : patient.newsScore >= 3 ? C.amber : C.green} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: patient.newsScore >= 5 ? C.red : patient.newsScore >= 3 ? '#92400E' : '#166534' }}>NEWS: {patient.newsScore}</span>
                    </div>
                    <div style={{ padding: '8px 14px', borderRadius: 8, background: patient.mewsScore >= 3 ? '#FFF1F2' : '#F0FDF4', border: `1px solid ${patient.mewsScore >= 3 ? '#FECDD3' : '#BBF7D0'}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={14} color={patient.mewsScore >= 3 ? C.red : C.green} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: patient.mewsScore >= 3 ? C.red : '#166534' }}>MEWS: {patient.mewsScore}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {Object.entries(patient.inputOutput).map(([key, val]) => (
                      <div key={key} style={{ padding: '10px 14px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 2, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div>
                  {patient.investigations.map((inv, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 8, background: inv.flagged ? '#FFFBEB' : C.panel, border: `1px solid ${inv.flagged ? '#FDE68A' : C.border}`, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 120, color: C.text }}>{inv.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: inv.flagged ? '#92400E' : C.text }}>{inv.value}</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: inv.trend === 'up' ? '#FFF1F2' : inv.trend === 'down' ? '#F0FDF4' : inv.trend === 'new' ? '#EFF6FF' : '#F8FAFC', color: inv.trend === 'up' ? C.red : inv.trend === 'down' ? C.green : inv.trend === 'new' ? C.sky : C.textLight, fontWeight: 600 }}>
                        {inv.trend === 'up' ? '↑ Rising' : inv.trend === 'down' ? '↓ Falling' : inv.trend === 'new' ? '● New' : '→ Stable'}
                      </span>
                      {inv.flagged && <AlertTriangle size={12} color={C.amber} />}
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 7 && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Medications</div>
                    {patient.currentTreatment.medications.map((med, i) => (
                      <div key={i} style={{ padding: '6px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 3, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Pill size={12} color={C.sky} /> {med}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>IV Fluids</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{patient.currentTreatment.ivFluids}</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FFF1F2', border: '1px solid #FECDD3' }}>
                      <div style={{ fontSize: 10, color: C.red }}>Antibiotics</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.red }}>{patient.currentTreatment.antibiotics}</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Oxygen</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{patient.currentTreatment.oxygen}</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>Nutrition</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{patient.currentTreatment.nutrition}</div>
                    </div>
                  </div>
                  {patient.currentTreatment.devices.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Devices</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {patient.currentTreatment.devices.map((dev, i) => (
                          <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: '#F0F9FF', border: `1px solid #BAE6FD`, fontSize: 11, color: '#0369A1' }}>{dev}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 8 && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4 }}>Yesterday's Plan → Today's Progress</div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 12, color: '#166534' }}>
                      <CheckCircle size={12} style={{ marginRight: 6 }} /> Auto-generated from previous day's plan and current status.
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4 }}>Assessment (editable)</div>
                  <textarea value={editedAssessment} onChange={e => setEditedAssessment(e.target.value)}
                    style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", color: C.text, background: C.white, resize: 'vertical', outline: 'none' }} />
                </div>
              )}

              {currentStep === 9 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Choose a decision:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {[
                      { label: 'Continue', desc: 'Continue current management', color: C.sky, icon: CheckCircle },
                      { label: 'Escalate', desc: 'Escalate care level', color: C.amber, icon: AlertTriangle },
                      { label: 'Discharge', desc: 'Discharge planning', color: C.green, icon: LogOut },
                      { label: 'Operate', desc: 'Operative intervention', color: C.red, icon: Scissors },
                      { label: 'Refer', desc: 'Refer to specialist', color: '#8B5CF6', icon: Users },
                      { label: 'ICU', desc: 'ICU transfer', color: C.red, icon: Monitor },
                      { label: 'Investigate', desc: 'Further investigations', color: C.sky, icon: Search },
                      { label: 'Review', desc: 'Review later today', color: C.textLight, icon: Clock },
                    ].map(d => (
                      <button key={d.label} onClick={() => handleDecision(d.label)} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.1s' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${d.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <d.icon size={18} color={d.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{d.label}</div>
                          <div style={{ fontSize: 11, color: C.textLight }}>{d.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 10 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 4 }}>Dictate today's plan</div>
                  <textarea value={doctorDictated} onChange={e => setDoctorDictated(e.target.value)}
                    placeholder='Dictate: "Continue current medications. Wean oxygen. Review blood cultures tomorrow. Plan discharge if clinically stable."'
                    style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "'Inter', sans-serif", color: C.text, background: C.white, resize: 'vertical', outline: 'none', marginBottom: 12 }} />
                  {aiStructuredPlan && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: 12, color: '#0369A1', marginBottom: 12 }}>
                      <Brain size={14} style={{ marginRight: 6 }} /> AI Structured Plan: {aiStructuredPlan}
                    </div>
                  )}
                  {doctorDictated && !aiStructuredPlan && (
                    <button onClick={() => {
                      setAiStructuredPlan('Plan structured: ' + doctorDictated.split('. ').map((s, i) => `${i + 1}. ${s.trim()}`).join('\n'))
                      notify('Plan structured into discrete orders. Tasks distributed to relevant teams.', 'success')
                    }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Brain size={14} /> Structure Plan with AI
                    </button>
                  )}
                </div>
              )}

              {currentStep === 11 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={32} color={C.green} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Patient Round Complete</div>
                  <div style={{ fontSize: 13, color: C.textLight, marginBottom: 20 }}>{patient.name} — {patient.bed}</div>
                  {!isLast && (
                    <button onClick={() => { setCurrentIdx(currentIdx + 1); setCurrentStep(1); setDoctorDictated(''); setAiStructuredPlan('') }} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      Next Patient → <span style={{ fontSize: 12, fontWeight: 400 }}>({patients[currentIdx + 1]?.name})</span>
                    </button>
                  )}
                  {isLast && (
                    <div>
                      <div style={{ padding: '10px 16px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 12, color: '#166534', marginBottom: 12, display: 'inline-block' }}>
                        ✅ All {patients.length} patients seen. Ward round complete.
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => router.push('/doctor')} style={{ padding: '10px 24px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 13, cursor: 'pointer' }}>← Back to Dashboard</button>
                        <button onClick={() => router.push('/doctor-ados')} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Open ADOS →</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            {currentStep < 11 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => currentStep > 1 && setCurrentStep((currentStep - 1) as WardStep)}
                  disabled={currentStep === 1}
                  style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: currentStep === 1 ? C.panel : C.white, color: currentStep === 1 ? C.textLight : C.text, cursor: currentStep === 1 ? 'default' : 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ChevronLeft size={14} /> Previous Step
                </button>
                <button onClick={handleStepComplete}
                  style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {currentStep === 10 ? 'Complete Plan →' : currentStep === 9 ? 'Confirm Decision →' : 'Next Step →'} <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consult Dialog */}
      {showConsultDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 420, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>New Consult Request</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <select style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Nephrology</option>
                <option>Endocrinology</option>
                <option>Gastroenterology</option>
                <option>Respiratory</option>
                <option>Vascular Surgery</option>
                <option>Cardiothoracic Surgery</option>
              </select>
              <select style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
                <option>Routine (≤24h)</option>
                <option>Urgent (≤4h)</option>
                <option>Emergency (≤1h)</option>
              </select>
              <textarea placeholder="Reason for consult..." style={{ width: '100%', minHeight: 60, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConsultDialog(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { notify('Consult request sent. Consultant notified. Response timer started.', 'success'); setShowConsultDialog(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Send Consult</button>
            </div>
          </div>
        </div>
      )}

      {/* Family Discussion Dialog */}
      {showFamilyDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 480, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Family Discussion</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Spouse', 'Parent', 'Sibling', 'Child', 'Legal guardian'].map(r => (
                  <button key={r} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: 'pointer' }}>{r}</button>
                ))}
              </div>
              <textarea placeholder="Discussion notes..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight }}>Decisions Made</div>
              <textarea placeholder="Consent obtained, decisions, future plans..." style={{ width: '100%', minHeight: 60, padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "'Inter', sans-serif", resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowFamilyDialog(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { notify('Family discussion documented. Consent recorded.', 'success'); setShowFamilyDialog(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Procedure Dialog */}
      {showProcedureDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, maxWidth: 480, width: '90%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Procedure Planning</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <select style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: C.white }}>
                <option>Lumbar Puncture</option>
                <option>Central Line Insertion</option>
                <option>Chest Tube Insertion</option>
                <option>Paracentesis</option>
                <option>Thoracentesis</option>
                <option>Bone Marrow Aspiration</option>
                <option>Joint Aspiration</option>
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 11, color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Consent</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 11, color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Equipment Ready</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 11, color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Assistant</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 11, color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Checklist</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowProcedureDialog(false)} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { notify('Procedure workflow initiated. Consent, equipment, assistant, checklist prepared.', 'success'); setShowProcedureDialog(false) }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Start Procedure Workflow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
