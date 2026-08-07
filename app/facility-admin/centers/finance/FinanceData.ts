'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// FIROC — Financial Intelligence & Revenue Operations Center · seed intelligence
// (KES). Executive figures intentionally align so the command wall reads in real
// currency. Everything here is display/seed; live constitutional metrics (today
// revenue, claims, payroll, drug costs, department costs) still come from the
// persisted facility model — see FinanceCenter.
// ═══════════════════════════════════════════════════════════════════════════════

export const FIN_HEALTH = 94;

export const exec = {
  todayRevenue: 8420000,
  expToday: 5800000,
  netPos: 2620000,
  claimsSubmitted: 4600000,
  claimsApproved: 3900000,
  claimsRejected: 112000,
  drugConsumption: 1100000,
  payrollAccrued: 2400000,
};

export const projected = {
  monthRevenue: 241000000,
  monthExpenses: 193000000,
  marginPct: 19.9,
  cash: 'Healthy',
  outstandingClaims: 112000000,
  outstandingBills: 46000000,
};

export const revenueSources = [
  { name: 'Insurance', value: 3100000, color: '#0ea5e9' },
  { name: 'Cash', value: 2200000, color: '#10b981' },
  { name: 'Corporate', value: 1100000, color: '#6366f1' },
  { name: 'Government', value: 850000, color: '#f59e0b' },
  { name: 'Donors', value: 500000, color: '#ec4899' },
  { name: 'Research', value: 300000, color: '#8b5cf6' },
  { name: 'Telemedicine', value: 220000, color: '#14b8a6' },
  { name: 'Outreach', value: 150000, color: '#94a3b8' },
];

export const deptRevenue = [
  { name: 'Surgery', value: 58000000 }, { name: 'Medicine', value: 42000000 },
  { name: 'Emergency', value: 21000000 }, { name: 'OB-GYN', value: 19000000 },
  { name: 'Radiology', value: 18000000 }, { name: 'ICU', value: 31000000 },
  { name: 'Laboratory', value: 14000000 }, { name: 'Pharmacy', value: 26000000 },
];

export const consultants = [
  { name: 'Dr. A. Okello', dept: 'Surgery', patients: 214, revenue: 12400000, collections: 10800000, outstanding: 1600000, avgBill: 57900, caseMix: 'General' },
  { name: 'Dr. B. Mwangi', dept: 'Medicine', patients: 268, revenue: 9800000, collections: 9100000, outstanding: 700000, avgBill: 36500, caseMix: 'Cardio' },
  { name: 'Dr. C. Ndungu', dept: 'OB-GYN', patients: 312, revenue: 13400000, collections: 12900000, outstanding: 500000, avgBill: 42900, caseMix: 'Maternity' },
  { name: 'Dr. D. Ochieng', dept: 'Radiology', patients: 198, revenue: 8100000, outstanding: 2100000, avgBill: 40900, caseMix: 'Imaging' },
  { name: 'Dr. E. Achieng', dept: 'Emergency', patients: 240, revenue: 7200000, outstanding: 1200000, avgBill: 30000, caseMix: 'Acute' },
  { name: 'Dr. F. Kiptoo', dept: 'Orthopedics', patients: 156, revenue: 11900000, outstanding: 3800000, avgBill: 76300, caseMix: 'Trauma' },
];

export const clinics = [
  { name: 'Cardiology', revenue: 13400000, patients: 1820, cancelRate: 3.2 },
  { name: 'Orthopedics', revenue: 11900000, patients: 1470, cancelRate: 4.8 },
  { name: 'ANC', revenue: 9800000, patients: 2140, cancelRate: 2.1 },
  { name: 'Pediatrics', revenue: 8100000, patients: 2660, cancelRate: 5.5 },
  { name: 'Dialysis', revenue: 14200000, patients: 640, cancelRate: 1.2 },
  { name: 'Dental', revenue: 6400000, patients: 1220, cancelRate: 6.4 },
  { name: 'Oncology', revenue: 19600000, patients: 380, cancelRate: 4.0 },
];

export const wardEconomics = [
  { name: 'Medicine Ward', admissions: 321, avgStay: 5.4, avgCost: 41221, drug: 9100000, consumables: 3700000, labour: 12400000, revenue: 28000000, margin: 11 },
  { name: 'Surgical Ward', admissions: 276, avgStay: 4.8, avgCost: 48890, drug: 7800000, consumables: 5200000, labour: 9600000, revenue: 41000000, margin: 18 },
  { name: 'Pediatric Ward', admissions: 184, avgStay: 3.6, avgCost: 25400, drug: 3100000, consumables: 1300000, labour: 4800000, revenue: 9100000, margin: 6 },
  { name: 'ICU', admissions: 89, avgStay: 5.8, avgCost: 118000, drug: 7400000, consumables: 6100000, labour: 11300000, revenue: 31000000, margin: 12 },
];

export const theatreEconomics = {
  scheduled: 42, completed: 40, cancelled: 2, revenue: 18000000,
  avgTime: 92, avgCost: 112000, profit: 7000000,
};

export const labEconomics = [
  { name: 'CBC', performed: 3814, revenue: 2100000, cost: 821000, margin: 61 },
  { name: 'Chemistry', performed: 2950, revenue: 3400000, cost: 1450000, margin: 57 },
  { name: 'Urinalysis', performed: 4200, revenue: 1180000, cost: 470000, margin: 60 },
  { name: 'Microbiology', performed: 1260, revenue: 2800000, cost: 1690000, margin: 40 },
  { name: 'Histopathology', performed: 840, revenue: 3500000, cost: 1800000, margin: 49 },
];

export const radiology = [
  { name: 'CT Brain', performed: 214, revenue: 4800000, extra: 411000, maint: 172000 },
  { name: 'X-Ray Chest', performed: 1860, revenue: 3400000, extra: 0, maint: 90000 },
  { name: 'Ultrasound', performed: 2400, revenue: 2900000, extra: 130000, maint: 70000 },
  { name: 'MRI', performed: 410, revenue: 8900000, extra: 620000, maint: 340000 },
];

export const drugs = [
  { name: 'Ceftriaxone', dispensed: 4822, cost: 3800000, revenue: 6900000, stock: 'LOW', projection: 17, margin: 45 },
  { name: 'Paracetamol', dispensed: 12400, cost: 900000, revenue: 1800000, stock: 'OK', projection: 6, margin: 50 },
  { name: 'Amoxicillin', dispensed: 6200, cost: 1400000, revenue: 3100000, stock: 'OK', projection: 3, margin: 55 },
  { name: 'Insulin', dispensed: 890, cost: 2600000, revenue: 4100000, stock: 'CRITICAL', projection: 9, margin: 37 },
  { name: 'Morphine', dispensed: 340, cost: 1200000, revenue: 2200000, stock: 'OK', projection: 2, margin: 45 },
  { name: 'Metformin', dispensed: 15300, cost: 640000, revenue: 1290000, stock: 'OK', projection: 5, margin: 50 },
];

export const diseases = [
  { disease: 'Sepsis', patients: 214, avgStay: 8.2, avgICU: 2.4, drug: 28000, imaging: 14000, lab: 11000, totalCost: 118000, mortality: 11, revenue: 22000000, loss: 4000000 },
  { disease: 'Stroke', patients: 128, avgStay: 9.6, avgICU: 1.8, drug: 18000, imaging: 31000, lab: 8000, totalCost: 132000, mortality: 14, revenue: 15600000, loss: 2600000 },
  { disease: 'Pneumonia', patients: 342, avgStay: 6.4, avgICU: 0.6, drug: 12000, imaging: 9000, lab: 6000, totalCost: 64000, mortality: 6, revenue: 21900000, margin: 9 },
];

export const insurers = [
  { name: 'SHA', pending: 18000000, avgDays: 12, rejected: 2 },
  { name: 'Jubilee', pending: 8000000, avgDays: 18, rejected: 3 },
  { name: 'AAR', pending: 5200000, avgDays: 9, rejected: 1 },
  { name: 'CIC', pending: 6400000, avgDays: 15, rejected: 4 },
  { name: 'Madison', pending: 3100000, avgDays: 22, rejected: 6 },
];

export const claimsPipeline = [
  { stage: 'Submitted', count: 412, amount: 4600000, color: '#0ea5e9' },
  { stage: 'Verified', count: 388, amount: 4290000, color: '#6366f1' },
  { stage: 'Approved', count: 362, amount: 3930000, color: '#10b981' },
  { stage: 'Paid', count: 321, amount: 3510000, color: '#14b8a6' },
  { stage: 'Rejected', count: 18, amount: 112000, color: '#ef4444' },
  { stage: 'Appealed', count: 9, amount: 68000, color: '#f59e0b' },
];

export const outstanding = [
  { patient: 'P-10231 · J. Otieno', dept: 'Surgery', ward: 'Surgical 3', amount: 482000, days: 42, status: 'Escalate' },
  { patient: 'P-09112 · M. Achola', dept: 'ICU', ward: 'ICU A', amount: 1264000, days: 61, status: 'Collector' },
  { patient: 'P-11044 · S. Njoroge', dept: 'Radiology', ward: 'OPD', amount: 261000, days: 18, status: 'Remind' },
  { patient: 'P-10821 · K. Atieno', dept: 'Medicine', ward: 'Med B', amount: 172000, days: 9, status: 'Remind' },
  { patient: 'P-10398 · D. Chebet', dept: 'OB-GYN', ward: 'Maternity', amount: 802000, days: 74, status: 'Collector' },
];

export const suppliers = [
  { name: 'MedSpec Pharma', type: 'Pharmaceuticals', payable: 9400000, dueDays: 34 },
  { name: 'Nairobi Surgical Supply', type: 'Sutures & Implants', payable: 6200000, dueDays: 47 },
  { name: 'Labs Imaging Corp', type: 'Imaging consumables', payable: 3800000, dueDays: 21 },
  { name: 'Kernel Commodities', type: 'Food', payable: 1100000, dueDays: 12 },
  { name: 'UtilityGrid', type: 'Power & water', payable: 890000, dueDays: 9 },
];

export const payrollCats = [
  { name: 'Doctors', value: 62000000 }, { name: 'Nurses', value: 89000000 },
  { name: 'Residents', value: 28000000 }, { name: 'Students', value: 4200000 },
  { name: 'Stipends', value: 5600000 }, { name: 'Overtime', value: 12400000 },
  { name: 'Allowances', value: 9800000 }, { name: 'On-call', value: 7900000 },
  { name: 'Leave', value: 6100000 }, { name: 'Taxes', value: 23800000 },
];

export const procurement = [
  { item: 'Ceftriaxone 1g', requester: 'Pharmacy', qty: 20000, value: 9600000, status: 'Delivered' },
  { item: 'Surgical mesh', requester: 'Surgery', qty: 120, value: 4800000, status: 'Approved' },
  { item: 'Dialysis consumables', requester: 'Nephrology', qty: 3000, value: 3200000, status: 'Requested' },
  { item: 'Ventilator filter', requester: 'ICU', qty: 4000, value: 1200000, status: 'Delivered' },
  { item: 'MRI contrast', requester: 'Radiology', qty: 240, value: 6200000, status: 'Approved' },
];

export const inventory = [
  { name: 'Ceftriaxone', value: 2400000, turn: 4.2 },
  { name: 'Surgical sutures', value: 1800000, turn: 3.1 },
  { name: 'Contrast media', value: 2200000, turn: 2.5 },
  { name: 'Oxygen', value: 3400000, turn: 5.8 },
  { name: 'Blood packs', value: 4100000, turn: 6.2 },
];

export const assets = [
  { name: 'MRI', purchase: 280000000, maintenance: 14000000, revenue: 480000000, roi: 'Excellent' },
  { name: 'CT Scanner', purchase: 168000000, maintenance: 9200000, revenue: 210000000, roi: 'Strong' },
  { name: 'Dialysis Unit', purchase: 42000000, maintenance: 4100000, revenue: 98000000, roi: 'Good' },
  { name: 'Operating Suite', purchase: 96000000, maintenance: 12000000, revenue: 240000000, roi: 'Excellent' },
];

export const budgets = [
  { dept: 'General', budget: 42000000, actual: 38500000 }, { dept: 'Surgery', budget: 38000000, actual: 42800000 },
  { dept: 'ICU', budget: 31000000, actual: 29600000 }, { dept: 'Emergency', budget: 24000000, actual: 21800000 },
  { dept: 'Pharmacy', budget: 26000000, actual: 24700000 }, { dept: 'Radiology', budget: 22000000, actual: 23400000 },
];

export const forecast = {
  months: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
  revenue: [201, 214, 226, 238, 231, 241, 248, 255, 261, 268, 274, 281],
  expenses: [168, 174, 179, 183, 187, 190, 194, 198, 202, 206, 210, 214],
};

export const donors = [
  { name: 'Global Health Fund', budget: 180000000, utilized: 64000000, remaining: 116000000, outputs: 78, due: 'Q3' },
  { name: 'Rotary International', budget: 42000000, utilized: 39000000, remaining: 3000000, outputs: 92, due: 'Q2' },
  { name: 'UNICEF Maternal', budget: 96000000, utilized: 51000000, remaining: 45000000, outputs: 61, due: 'Q4' },
];

export const audit = [
  { date: '08:04 AM', who: 'Finance Director', action: 'Approved', subject: 'PO-2045 Imaging', signature: '0x7f9a…c21' },
  { date: '07:58 AM', who: 'ICU Charge', action: 'Changed', subject: 'Bed charges ICU-A', signature: '0x1b8…f91' },
  { date: '07:44 AM', who: 'Reception', action: 'Paid', subject: 'Cash deposit KES 42K', signature: '0xf7c…842' },
  { date: '07:31 AM', who: 'Cashier', action: 'Refunded', subject: 'Dialysis deposit', signature: '0x0aa…19f' },
  { date: '07:12 AM', who: 'Claims Officer', action: 'Cancelled', subject: 'Claim CL-2214', signature: '0xd20…77e' },
];

export const compliance = [
  { name: 'KEPH Level 6 Licensing', status: 'LIVE', by: 'MOH National' },
  { name: 'NHIF Contract Renewal', status: 'DUE', by: 'SHA' },
  { name: 'Data Protection (DPA)', status: 'COMPLIANT', by: 'ODPC' },
  { name: 'PPE / Waste Handling', status: 'INSPECTED', by: 'NEMA' },
];

export const taxes = {
  vat: { rate: '16% VAT', payable: 4200000, deductible: 2600000, net: 1600000 },
  withholding: 980000,
  corporate: 1900000,
};