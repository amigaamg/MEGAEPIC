'use client';
// ═══════════════════════════════════════════════════════════════════════════════
// components/PatientHealthDashboard.tsx
// Lifelong Chronic Disease Management · Real-time · Doctor + Patient
// Firebase queries all include patientId/doctorId filters for rule compliance
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, getDocs,
  serverTimestamp, orderBy, limit, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend, ReferenceArea, Dot,
  PieChart, Pie, Cell,
} from 'recharts';
import { TOOL_CONFIGS, ToolAssignment, ToolReading } from '@/lib/diseaseTools';
import { evaluateReading } from '@/lib/triageRules';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AlertDoc {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: any;
  urgency?: string;
}
interface Appt {
  id: string;
  doctorId: string;
  doctorName?: string;
  status: string;
  prescriptions?: any[];
  notes?: string;
  date: any;
  specialty?: string;
}
interface DocService {
  id: string;
  doctorId: string;
  doctorName: string;
  specialties: string[];
  title: string;
}

// ─── All tool type IDs (shown even when unassigned) ────────────────────────────
const ALL_TOOL_IDS = [
  'bp_monitor', 'glucose_tracker', 'hba1c_tracker', 'peak_flow',
  'spo2_monitor', 'weight_tracker', 'pain_scale', 'mood_tracker',
  'medication_adherence', 'ecg_monitor',
];

// ─── Colours ───────────────────────────────────────────────────────────────────
const LC: Record<string, string> = { normal: '#10b981', watch: '#f59e0b', video: '#6366f1', clinic: '#f97316', hospital: '#ef4444' };
const LB: Record<string, string> = { normal: '#f0fdf4', watch: '#fffbeb', video: '#eef2ff', clinic: '#fff7ed', hospital: '#fef2f2' };

// ─── Formatters ────────────────────────────────────────────────────────────────
const fmtDate = (ts: any) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }); };
const fmtShort = (ts: any) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }); };
const fmtTime = (ts: any) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); };
const fmtAgo = (ts: any) => {
  if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'Just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return fmtDate(ts);
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE NOTIFICATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

/** Map urgency level → notification options */
const urgencyNotifMap: Record<string, { icon: string; badge: string; vibrate: number[]; requireInteraction: boolean; tag: string }> = {
  emergency: { icon: '/icons/alert-emergency.png', badge: '/icons/badge.png', vibrate: [200, 100, 200, 100, 400], requireInteraction: true, tag: 'amexan-emergency' },
  urgent:    { icon: '/icons/alert-urgent.png',    badge: '/icons/badge.png', vibrate: [200, 100, 200],             requireInteraction: true, tag: 'amexan-urgent' },
  routine:   { icon: '/icons/amexan-logo.png',     badge: '/icons/badge.png', vibrate: [100],                        requireInteraction: false, tag: 'amexan-routine' },
};

async function requestNotificationPermission(): Promise<NotifPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result as NotifPermission;
}

/**
 * Fire a native device notification.
 * Prefers Service Worker showNotification (shows in background + mobile);
 * falls back to new Notification() if SW is unavailable.
 */
async function fireDeviceNotification(title: string, body: string, urgency: string = 'routine') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const opts = urgencyNotifMap[urgency] ?? urgencyNotifMap.routine;

  const payload: NotificationOptions = {
    body,
    icon: opts.icon,
    badge: opts.badge,
    requireInteraction: opts.requireInteraction,
    tag: opts.tag,
    data: { urgency, url: window.location.href },
    silent: false,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, payload);
    } else {
      new Notification(title, payload);
    }
  } catch {
    // Graceful fallback — SW might be unavailable in some contexts
    try { new Notification(title, payload); } catch { /* silently ignore */ }
  }
}

// ─── Hook: manages permission state + fires notifications on new alerts ────────
function useDeviceAlerts(alerts: AlertDoc[]) {
  const [permission, setPermission] = useState<NotifPermission>('default');
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Check current permission on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported'); return;
    }
    setPermission(Notification.permission as NotifPermission);
  }, []);

  // Fire device notification for each genuinely new alert
  useEffect(() => {
    if (!alerts.length) return;

    // On the first snapshot load, just seed seenIds without notifying
    if (isFirstLoad.current) {
      alerts.forEach(a => seenIds.current.add(a.id));
      isFirstLoad.current = false;
      return;
    }

    alerts.forEach(alert => {
      if (seenIds.current.has(alert.id)) return;  // already seen
      seenIds.current.add(alert.id);
      if (!alert.read) {
        // Only notify for unread incoming alerts
        fireDeviceNotification(alert.title, alert.message, alert.urgency ?? 'routine');
      }
    });
  }, [alerts]);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, requestPermission };
}

// ─── Clinical guidance library ─────────────────────────────────────────────────
const GUIDANCE: Record<string, {
  targets: { label: string; ideal: string; acceptable: string; danger: string }[];
  chartRef: { low?: number; high?: number; target?: number; dangerHigh?: number; dangerLow?: number; unit: string; fields: string[] };
  complications: { name: string; icon: string; signs: string; prevent: string; action: string }[];
  education: { tip: string; icon: string; cat: 'lifestyle' | 'medication' | 'monitoring' | 'warning' | 'diet' | 'exercise' }[];
  complianceFields?: string[];
}> = {
  bp_monitor: {
    targets: [
      { label: 'Systolic',  ideal: '< 120 mmHg',    acceptable: '120–139 mmHg', danger: '≥ 160 mmHg' },
      { label: 'Diastolic', ideal: '< 80 mmHg',     acceptable: '80–89 mmHg',  danger: '≥ 100 mmHg' },
      { label: 'Pulse',     ideal: '60–100 bpm',    acceptable: '50–110 bpm',  danger: '> 120 or < 50 bpm' },
    ],
    chartRef: { low: 90, high: 140, target: 120, dangerHigh: 160, dangerLow: 80, unit: 'mmHg', fields: ['systolic', 'diastolic'] },
    complications: [
      { name: 'Stroke',                   icon: '🧠', signs: 'Sudden severe headache, facial drooping, arm weakness, slurred speech, vision loss', prevent: 'Maintain BP < 130/80. Take antihypertensives daily. Low-sodium diet. No smoking.', action: 'EMERGENCY — Call 999 immediately. Do not drive yourself.' },
      { name: 'Heart Attack',             icon: '❤️', signs: 'Crushing chest pain, left arm/jaw pain, breathlessness, sweating, nausea', prevent: 'Statins if prescribed. Exercise 150 min/week. Stop smoking. Control cholesterol.', action: 'EMERGENCY — Chew aspirin 300mg if not allergic. Call 999.' },
      { name: 'Heart Failure',            icon: '💔', signs: 'Breathlessness lying flat, bilateral ankle swelling, rapid weight gain (>2kg/day)', prevent: 'Daily weight monitoring. Fluid restriction if advised. ACE inhibitor compliance.', action: 'URGENT — If weight up >2kg overnight, contact doctor same day.' },
      { name: 'Kidney Damage',            icon: '🫘', signs: 'Reduced urine output, leg swelling, fatigue, frothy urine', prevent: 'Annual creatinine/eGFR test. BP <130/80. Avoid NSAIDs (ibuprofen).', action: 'Book clinic — request urine ACR and creatinine.' },
      { name: 'Eye Damage (Retinopathy)', icon: '👁️', signs: 'Blurred vision, floaters, sudden vision loss', prevent: 'Annual fundoscopy. BP control. Stop smoking.', action: 'URGENT eye clinic referral within 24h for sudden vision loss.' },
      { name: 'Hypertensive Crisis',      icon: '🚨', signs: 'BP ≥ 180/120 with headache, chest pain, or confusion', prevent: 'Never miss medications. Avoid excessive salt or alcohol.', action: 'EMERGENCY — Go to A&E immediately.' },
    ],
    education: [
      { tip: 'Measure at the same time every day — morning before medications, after 5 minutes rest', icon: '⏰', cat: 'monitoring' },
      { tip: 'Sit quietly for 5 minutes, back supported, feet flat on floor, arm at heart level', icon: '🪑', cat: 'monitoring' },
      { tip: 'Average 3 readings taken 1 minute apart for the most accurate result', icon: '📊', cat: 'monitoring' },
      { tip: 'DASH diet: reduce sodium to <2g/day. Avoid processed foods, canned soups, table salt', icon: '🧂', cat: 'diet' },
      { tip: 'DASH diet increases: fruits, vegetables, whole grains, low-fat dairy, lean proteins', icon: '🥗', cat: 'diet' },
      { tip: '30 minutes moderate exercise (brisk walk) 5 days/week reduces BP by 5–8 mmHg', icon: '🚶', cat: 'exercise' },
      { tip: 'Limit alcohol: max 1 unit/day women, 2 units/day men. Alcohol directly raises BP', icon: '🍷', cat: 'lifestyle' },
      { tip: 'Stop smoking — nicotine raises BP for 30 minutes per cigarette. Cessation reduces CV risk 50%', icon: '🚭', cat: 'lifestyle' },
      { tip: 'NEVER stop antihypertensives suddenly — rebound hypertension can cause stroke', icon: '💊', cat: 'medication' },
      { tip: 'Take medications at the same time each day. Set a phone reminder', icon: '📱', cat: 'medication' },
    ],
    complianceFields: ['systolic', 'diastolic'],
  },
  glucose_tracker: {
    targets: [
      { label: 'Fasting (before breakfast)',  ideal: '4.0–5.5 mmol/L', acceptable: '5.6–7.0 mmol/L',  danger: '> 10.0 or < 3.5 mmol/L' },
      { label: 'Post-meal (2h after eating)', ideal: '< 7.8 mmol/L',   acceptable: '7.8–11.0 mmol/L', danger: '> 13.9 mmol/L' },
      { label: 'Bedtime',                     ideal: '6.0–8.0 mmol/L', acceptable: '5.0–10.0 mmol/L', danger: '< 4.0 or > 12.0 mmol/L' },
    ],
    chartRef: { low: 3.9, high: 10.0, target: 6.5, dangerHigh: 13.9, dangerLow: 3.0, unit: 'mmol/L', fields: ['value'] },
    complications: [
      { name: 'Diabetic Ketoacidosis (DKA)', icon: '🚨', signs: 'Vomiting, severe thirst, fruity breath, deep breathing, confusion (Type 1)', prevent: 'Never stop insulin when sick. Check ketones when glucose >14.', action: 'EMERGENCY — Call 999. Do not delay.' },
      { name: 'Hypoglycaemia (Hypo)',        icon: '⬇️', signs: 'Shaking, sweating, confusion, palpitations, loss of consciousness (BG <3.9)', prevent: 'Never skip meals. Reduce insulin if exercising. Carry glucose tablets.', action: 'IMMEDIATE — 15g fast sugar (3 glucose tabs / 150ml juice). Recheck in 15 min.' },
      { name: 'Diabetic Kidney Disease',     icon: '🫘', signs: 'Frothy urine, ankle swelling, reduced urine, fatigue', prevent: 'HbA1c <7%. BP <130/80. Annual urine ACR. ACE inhibitor if microalbuminuria.', action: 'Book clinic — request urine ACR, creatinine, eGFR.' },
      { name: 'Diabetic Retinopathy',        icon: '👁️', signs: 'Blurred vision, floaters, dark spots, sudden vision loss', prevent: 'Annual dilated fundoscopy. Strict glucose AND BP control.', action: 'URGENT eye referral for sudden changes. Annual screening even if asymptomatic.' },
      { name: 'Diabetic Neuropathy',         icon: '🦶', signs: 'Numbness, tingling, burning in feet/hands, loss of sensation', prevent: 'HbA1c <7%. Daily foot inspection. Avoid bare feet. Moisturise feet daily.', action: 'Book clinic for monofilament test and neurological foot examination.' },
      { name: 'Diabetic Foot Ulcer',         icon: '⚠️', signs: 'Non-healing wounds, discolouration, warmth, odour from foot', prevent: 'Daily foot check with mirror. Appropriate footwear. Podiatry review every 6 months.', action: 'URGENT clinic — do not walk on infected foot. Urgent podiatry/wound care.' },
      { name: 'Cardiovascular Disease',      icon: '❤️', signs: 'Chest pain, breathlessness on exertion, calf pain walking', prevent: 'Statins for all diabetics >40. BP control. Aspirin if prescribed. No smoking.', action: 'URGENT if chest pain — go to A&E. Cardiac review if exertional symptoms.' },
    ],
    education: [
      { tip: 'Fasting glucose: before eating or drinking (except water). Best done on waking', icon: '🌅', cat: 'monitoring' },
      { tip: 'Post-meal glucose: exactly 2 hours after first bite of your meal', icon: '🍽️', cat: 'monitoring' },
      { tip: 'Log every reading with time and meal context — patterns help your doctor adjust treatment', icon: '📊', cat: 'monitoring' },
      { tip: 'HbA1c target <7% for most — reflects your 3-month average glucose. Test every 3 months', icon: '📉', cat: 'monitoring' },
      { tip: 'Consistent carbohydrate at each meal. Avoid skipping meals, especially on medication', icon: '🍽️', cat: 'diet' },
      { tip: 'Low glycaemic index foods: oats, lentils, most vegetables, berries, nuts', icon: '🥗', cat: 'diet' },
      { tip: 'Exercise lowers glucose for up to 24 hours. 30 min walk after meals is highly effective', icon: '🏃', cat: 'exercise' },
      { tip: 'Resistance training 2×/week improves insulin sensitivity significantly', icon: '🏋️', cat: 'exercise' },
      { tip: 'ALWAYS carry glucose tablets or 150ml fruit juice for emergencies', icon: '🍬', cat: 'medication' },
      { tip: 'Sick day rules: NEVER stop insulin when ill. Glucose may rise 50% even without eating', icon: '🤒', cat: 'medication' },
      { tip: 'Metformin: take with food to reduce GI side effects. Never take if vomiting or dehydrated', icon: '💊', cat: 'medication' },
      { tip: 'SGLT2 inhibitors (empagliflozin etc): increase fluids, monitor for UTI/genital infections', icon: '💊', cat: 'medication' },
    ],
    complianceFields: ['value'],
  },
  hba1c_tracker: {
    targets: [
      { label: 'HbA1c (most diabetics)',  ideal: '< 48 mmol/mol (< 6.5%)',  acceptable: '48–58 mmol/mol (6.5–7.5%)', danger: '> 75 mmol/mol (> 10%)' },
      { label: 'HbA1c (elderly/fragile)', ideal: '< 58 mmol/mol (< 7.5%)',  acceptable: '58–69 mmol/mol (7.5–8.5%)', danger: '> 75 mmol/mol' },
    ],
    chartRef: { low: 4, high: 12, target: 6.5, dangerHigh: 10, unit: '%', fields: ['value'] },
    complications: [
      { name: 'Progressive Microvascular Disease', icon: '🩸', signs: 'Eyes, kidneys, nerves progressively affected with each year of poor control', prevent: 'Every 1% HbA1c reduction = 25-35% reduction in microvascular complications', action: 'Annual eye, kidney, and nerve screening even if feeling well' },
      { name: 'Accelerated Macrovascular Disease',  icon: '❤️', signs: 'Heart attack risk 2-4x higher. Stroke. Peripheral arterial disease (leg pain walking)', prevent: 'Statins, BP control <130/80, smoking cessation, aspirin if prescribed', action: 'Cardiac risk scoring annually. Book cardiology if chest pain or poor exercise tolerance' },
    ],
    education: [
      { tip: 'HbA1c reflects average blood glucose over 3 months — a single day\'s reading does not reflect this', icon: '📅', cat: 'monitoring' },
      { tip: 'Test HbA1c every 3 months until stable, then every 6 months. Never skip this test', icon: '🔬', cat: 'monitoring' },
      { tip: 'A 1% reduction in HbA1c is clinically meaningful and reduces all complications', icon: '📉', cat: 'monitoring' },
      { tip: 'HbA1c can be falsely low in haemolytic anaemia or haemoglobin variants — tell your doctor', icon: '⚠️', cat: 'monitoring' },
      { tip: 'Consistent daily glucose logging is the best way to identify what drives your HbA1c up', icon: '📊', cat: 'monitoring' },
    ],
    complianceFields: ['value'],
  },
  peak_flow: {
    targets: [
      { label: '% Predicted (Green Zone)', ideal: '≥ 80% of personal best', acceptable: '60–79% of personal best', danger: '< 60% (Red Zone — emergency)' },
      { label: 'Morning Dip',              ideal: '< 15% variability AM vs PM', acceptable: '15–20% variability', danger: '> 20% variability' },
    ],
    chartRef: { low: 150, high: 700, target: 500, dangerLow: 300, unit: 'L/min', fields: ['value'] },
    complications: [
      { name: 'Acute Severe Asthma',            icon: '🚨', signs: 'PEF <50%, unable to complete sentences, respiratory rate >25, silent chest, cyanosis', prevent: 'Strict preventer inhaler compliance. Written asthma action plan. Avoid all triggers.', action: 'EMERGENCY — 999. Give 10 puffs salbutamol via spacer while waiting for ambulance.' },
      { name: 'Near-Fatal Asthma',              icon: '☠️', signs: 'PEF <33%, exhaustion, confusion, silent chest on auscultation', prevent: 'Steroid preventer every day. Avoid NSAIDs. Flu vaccination annually.', action: 'EMERGENCY — 999 immediately. High-flow oxygen. IV bronchodilators.' },
      { name: 'Brittle Asthma',                 icon: '⚡', signs: 'Chaotic PEF with extreme variability despite treatment', prevent: 'Specialist review. Possible biologics (mepolizumab, omalizumab). Remove allergens from home.', action: 'Urgent specialist (respiratory) referral. Consider allergen testing.' },
      { name: 'Fixed Airway Obstruction (COPD overlap)', icon: '🫁', signs: 'Persistent PEF decline over months/years, reduced bronchodilator response', prevent: 'ABSOLUTE smoking cessation. Annual spirometry. Pulmonary rehabilitation.', action: 'Spirometry with reversibility testing. Respiratory specialist referral.' },
    ],
    education: [
      { tip: 'Always blow 3 times and record the BEST of the 3 readings', icon: '🌬️', cat: 'monitoring' },
      { tip: 'Test every morning BEFORE your preventer inhaler, and again in the evening', icon: '⏰', cat: 'monitoring' },
      { tip: 'GREEN (>80%): well controlled. AMBER (60-80%): increase preventer or see doctor. RED (<60%): emergency', icon: '🚦', cat: 'monitoring' },
      { tip: 'Know and avoid your triggers: house dust mite, pet dander, pollen, cold air, exercise, aspirin, stress', icon: '🔍', cat: 'lifestyle' },
      { tip: 'Preventer (corticosteroid) inhaler: MUST use every day even when feeling completely well', icon: '💊', cat: 'medication' },
      { tip: 'Always use a spacer with MDI inhalers — increases lung deposition from 15% to 60%', icon: '🫁', cat: 'medication' },
      { tip: 'Rinse mouth after every ICS dose to prevent oral candidiasis (thrush)', icon: '💧', cat: 'medication' },
      { tip: 'Reliever (salbutamol): if using >3x/week, your asthma is NOT controlled — see doctor', icon: '⚠️', cat: 'medication' },
    ],
    complianceFields: ['value'],
  },
  spo2_monitor: {
    targets: [
      { label: 'SpO₂ (most patients)',  ideal: '95–100%', acceptable: '94%', danger: '< 92% — emergency' },
      { label: 'SpO₂ (COPD patients)', ideal: '88–92%',   acceptable: '88%', danger: '< 85% — emergency' },
    ],
    chartRef: { low: 85, high: 100, target: 96, dangerLow: 92, unit: '%', fields: ['spo2'] },
    complications: [
      { name: 'Respiratory Failure',     icon: '🫁', signs: 'SpO₂ <88%, severe breathlessness at rest, cyanosis, confusion', prevent: 'Oxygen therapy compliance. CPAP if prescribed. Smoking cessation.', action: 'EMERGENCY — 999. Sit upright. Administer rescue medication if prescribed.' },
      { name: 'COVID/Post-Viral Hypoxia', icon: '🦠', signs: 'SpO₂ dropping silently without severe breathlessness (happy hypoxia)', prevent: 'Daily SpO₂ monitoring during illness. Early medical review if declining.', action: 'URGENT — if <94% seek same-day assessment.' },
    ],
    education: [
      { tip: 'Measure after resting for 5 minutes. Cold or poor circulation gives false low readings — warm hands first', icon: '🤲', cat: 'monitoring' },
      { tip: 'Nail polish and dark nail colours interfere with the probe — remove before measuring', icon: '💅', cat: 'monitoring' },
      { tip: 'COPD patients: target is 88-92%, NOT higher — excessive oxygen can suppress drive to breathe', icon: '⚠️', cat: 'medication' },
      { tip: 'If SpO₂ drops >3% with activity, discuss pulmonary rehabilitation with your doctor', icon: '🏃', cat: 'exercise' },
    ],
    complianceFields: ['spo2'],
  },
  weight_tracker: {
    targets: [
      { label: 'BMI',                     ideal: '18.5–24.9 kg/m²', acceptable: '25.0–29.9 kg/m²', danger: '≥ 35 kg/m² or ≤ 17' },
      { label: 'Waist (Men)',             ideal: '< 94 cm',          acceptable: '94–102 cm',        danger: '> 102 cm' },
      { label: 'Waist (Women)',           ideal: '< 80 cm',          acceptable: '80–88 cm',         danger: '> 88 cm' },
      { label: 'Daily change (Heart Failure)', ideal: '< 1 kg/day', acceptable: '1–2 kg/day',       danger: '> 2 kg in 24h — call doctor' },
    ],
    chartRef: { unit: 'kg', fields: ['weight'] },
    complications: [
      { name: 'Acute Decompensated Heart Failure', icon: '💧', signs: 'Weight gain >2kg in 24h, worsening breathlessness, ankle oedema, orthopnoea', prevent: 'Daily morning weight. Fluid restriction (often 1.5L/day). Salt restriction.', action: 'URGENT — call doctor or go to A&E if breathless at rest. Do not delay.' },
      { name: 'Obesity-related Hypertension',      icon: '❤️', signs: 'Worsening BP control, headaches, reduced exercise tolerance', prevent: '5% weight loss reduces BP by 3-5 mmHg and may allow medication reduction', action: 'Book GP review if weight rising despite intervention.' },
      { name: 'Obesity-related Diabetes (T2DM)',   icon: '🩸', signs: 'Increasing thirst, polyuria, fatigue, blurred vision', prevent: '5-10% weight loss can reverse pre-diabetes and early T2DM', action: 'HbA1c and fasting glucose annually if BMI >30.' },
      { name: 'Sarcopenic Obesity (muscle loss)',   icon: '💪', signs: 'Weakness despite adequate weight, falls, reduced grip strength', prevent: 'Protein intake 1.2g/kg/day. Resistance exercise 2x/week. Avoid crash diets.', action: 'Dietitian and physiotherapy referral.' },
    ],
    education: [
      { tip: 'Weigh at the same time every day — ideally morning after toilet, before eating, in same clothing', icon: '⏰', cat: 'monitoring' },
      { tip: 'Heart failure patients: record EVERY day without fail. A 2kg overnight gain = fluid retention', icon: '🚨', cat: 'monitoring' },
      { tip: 'Use a quality digital scale on a hard floor. Log the reading immediately', icon: '📊', cat: 'monitoring' },
      { tip: 'Calorie deficit of 500 kcal/day = ~0.5kg/week loss. Sustainable and safe', icon: '🥗', cat: 'diet' },
      { tip: 'Mediterranean diet: olive oil, fish, vegetables, legumes, nuts. Proven to reduce CV risk', icon: '🫒', cat: 'diet' },
      { tip: '150-300 minutes moderate aerobic exercise per week for weight maintenance', icon: '🚶', cat: 'exercise' },
      { tip: 'Fluid restriction in heart failure: typically 1.5L/day total (including soup, ice cream)', icon: '💧', cat: 'medication' },
    ],
    complianceFields: ['weight'],
  },
  pain_scale: {
    targets: [
      { label: 'Pain Score', ideal: '0–3 (mild/manageable)', acceptable: '4–6 (moderate)', danger: '7–10 (severe — same-day review)' },
    ],
    chartRef: { low: 0, high: 10, target: 3, dangerHigh: 7, unit: '/10', fields: ['score'] },
    complications: [
      { name: 'Opioid Dependency',           icon: '⚠️', signs: 'Needing increasing doses, withdrawal symptoms, behaviour changes around medication', prevent: 'Regular pain review. Use lowest effective dose. Combination with physio/psychology.', action: 'Book pain clinic review. Never stop opioids abruptly — taper under supervision.' },
      { name: 'Untreated Neuropathic Pain',  icon: '⚡', signs: 'Burning, shooting, electric shock-like pain, allodynia (pain from light touch)', prevent: 'Early recognition. Specific agents: pregabalin, amitriptyline, duloxetine.', action: 'Book GP or pain specialist. Standard analgesics are ineffective for neuropathic pain.' },
      { name: 'Psychological Impact',        icon: '🧠', signs: 'Depression, anxiety, social withdrawal, sleep disturbance all worsen chronic pain', prevent: 'Pain psychology, CBT, mindfulness alongside medical management.', action: 'Referral to pain psychology or CBT programme.' },
    ],
    education: [
      { tip: 'Rate your USUAL pain for the past 24 hours, not the worst moment', icon: '📊', cat: 'monitoring' },
      { tip: 'Note what makes it better or worse — this helps identify treatable triggers', icon: '🔍', cat: 'monitoring' },
      { tip: 'Pain journal: include sleep quality, activity level, and mood alongside score', icon: '📓', cat: 'monitoring' },
      { tip: 'Heat therapy for muscle/joint pain. Ice for acute inflammatory pain', icon: '🌡️', cat: 'lifestyle' },
      { tip: 'Pacing: alternating activity and rest prevents boom-bust cycles that worsen pain', icon: '⚖️', cat: 'lifestyle' },
      { tip: 'Take regular analgesics as prescribed — do not wait for pain to become severe', icon: '💊', cat: 'medication' },
    ],
    complianceFields: ['score'],
  },
  mood_tracker: {
    targets: [
      { label: 'PHQ-9 Score',   ideal: '0–4 (minimal depression)', acceptable: '5–9 (mild)', danger: '≥ 15 (moderately severe — review needed)' },
      { label: 'Wellbeing Score', ideal: '7–10 (good)',            acceptable: '5–6 (moderate)', danger: '1–4 (poor — early review)' },
    ],
    chartRef: { low: 0, high: 27, target: 5, dangerHigh: 15, unit: 'PHQ-9', fields: ['phq9'] },
    complications: [
      { name: 'Suicidal Crisis',             icon: '🆘', signs: 'Thoughts of self-harm or ending life, giving away possessions, saying goodbyes', prevent: 'Regular monitoring. Safety planning. Remove means. Build support network.', action: 'EMERGENCY — if immediate risk: 999. Befrienders Kenya: 0800 723 253. A&E.' },
      { name: 'Manic Episode (Bipolar)',     icon: '⚡', signs: 'Decreased sleep without fatigue, grandiosity, rapid speech, risky behaviour, impulsivity', prevent: 'Mood stabiliser compliance. Regular sleep schedule. Avoid alcohol and cannabis.', action: 'URGENT psychiatric review. Do NOT increase antidepressant dose in bipolar.' },
      { name: 'Psychotic Decompensation',   icon: '🧠', signs: 'Hallucinations, paranoid beliefs, disorganised thought, social withdrawal', prevent: 'Antipsychotic compliance. Avoid cannabis. Regular psychiatric follow-up.', action: 'URGENT — call psychiatrist or go to psychiatric emergency. Safety first.' },
      { name: 'Discontinuation Syndrome',   icon: '💊', signs: 'Electric shock sensations, flu-like symptoms, dizziness after stopping antidepressant', prevent: 'NEVER stop SSRIs/SNRIs abruptly. Taper over weeks under supervision.', action: 'Restart medication and taper slowly. Discuss with psychiatrist.' },
    ],
    education: [
      { tip: 'PHQ-9 scoring: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 mod-severe, 20-27 severe', icon: '📊', cat: 'monitoring' },
      { tip: 'Complete PHQ-9 weekly at the same time. Track trends, not just single scores', icon: '📅', cat: 'monitoring' },
      { tip: 'Exercise is clinically proven as effective as antidepressants for mild-moderate depression', icon: '🏃', cat: 'exercise' },
      { tip: 'Sleep: consistent wake time (even weekends) is the single most powerful sleep intervention', icon: '😴', cat: 'lifestyle' },
      { tip: 'Social connection protects mental health. Isolation significantly worsens depression', icon: '🤝', cat: 'lifestyle' },
      { tip: 'Antidepressants take 4-6 weeks for full effect. Many patients stop too early — do not', icon: '💊', cat: 'medication' },
      { tip: 'Alcohol is a depressant — it worsens mood 24-48 hours after drinking', icon: '🍷', cat: 'lifestyle' },
      { tip: 'Mindfulness-Based Cognitive Therapy (MBCT) reduces relapse risk by 43% in recurrent depression', icon: '🧘', cat: 'lifestyle' },
    ],
    complianceFields: ['phq9'],
  },
  medication_adherence: {
    targets: [
      { label: 'Adherence Rate', ideal: '≥ 95% of doses taken', acceptable: '80–94%', danger: '< 80% — significant clinical risk' },
    ],
    chartRef: { unit: 'compliance', fields: ['taken'] },
    complications: [
      { name: 'Uncontrolled Disease', icon: '⚠️', signs: 'Parameters worsening (BP rising, glucose rising, etc) despite prescriptions', prevent: 'Use pill organiser, phone alarms, blister packs. Simplify regimen with doctor.', action: 'Tell your doctor honestly. They can simplify or change timing/formulation.' },
      { name: 'Rebound Effects',      icon: '🔄', signs: 'Sudden worsening after stopping (rebound hypertension, rebound tachycardia with beta-blockers)', prevent: 'Never stop cardiovascular medications abruptly. Always discuss first.', action: 'Restart medication. If symptoms severe, go to A&E.' },
    ],
    education: [
      { tip: 'Use a weekly pill organiser — fill it every Sunday. Visual confirmation prevents double-dosing', icon: '💊', cat: 'medication' },
      { tip: 'Attach medication to existing habits: meals, toothbrushing, morning coffee', icon: '☕', cat: 'medication' },
      { tip: 'Set phone alarm for every dose. Use medication reminder apps', icon: '📱', cat: 'medication' },
      { tip: 'If you miss a dose: take it as soon as you remember UNLESS it\'s almost time for the next dose', icon: '⏰', cat: 'medication' },
      { tip: 'Never stop medications because you feel better — that IS the medication working', icon: '✅', cat: 'medication' },
      { tip: 'Tell your doctor about side effects — there are almost always alternatives', icon: '🗣️', cat: 'medication' },
      { tip: 'Keep 2 weeks\' supply spare — never run out. Order repeat prescriptions a week early', icon: '📦', cat: 'medication' },
    ],
    complianceFields: ['taken'],
  },
  ecg_monitor: {
    targets: [
      { label: 'Resting Heart Rate', ideal: '60–100 bpm', acceptable: '50–110 bpm', danger: '> 120 or < 45 bpm' },
      { label: 'Rhythm',             ideal: 'Regular',    acceptable: 'Occasional ectopics', danger: 'Irregular / palpitations' },
    ],
    chartRef: { low: 40, high: 140, target: 75, dangerHigh: 120, dangerLow: 45, unit: 'bpm', fields: ['heartRate'] },
    complications: [
      { name: 'Atrial Fibrillation',      icon: '〰️', signs: 'Irregular pulse, palpitations, breathlessness, fatigue, dizziness', prevent: 'Rate control medication compliance. Anticoagulation (warfarin/NOAC) as prescribed.', action: 'URGENT — if new AF with fast rate or haemodynamic compromise: 999.' },
      { name: 'Ventricular Tachycardia',  icon: '⚡', signs: 'Racing heart, lightheadedness, near-syncope, pulseless in worst case', prevent: 'Antiarrhythmic compliance. Avoid triggers (caffeine, stimulants, electrolyte imbalance).', action: 'EMERGENCY if sustained — 999. ICD if implanted: do not attempt to manually cardiovert.' },
      { name: 'Heart Block',              icon: '⬇️', signs: 'Slow pulse, dizziness, syncope, fatigue, breathlessness', prevent: 'Regular cardiac review. Avoid drugs that slow conduction if prescribed.', action: 'URGENT if symptomatic bradycardia (<40 bpm with symptoms). Pacemaker may be indicated.' },
    ],
    education: [
      { tip: 'Measure resting HR after 5 minutes sitting quietly — not after activity or caffeine', icon: '⏰', cat: 'monitoring' },
      { tip: 'Check for regularity: are beats evenly spaced or skipping/irregular?', icon: '👂', cat: 'monitoring' },
      { tip: 'Caffeine, alcohol, sleep deprivation, and stress all increase heart rate and ectopics', icon: '☕', cat: 'lifestyle' },
      { tip: 'If prescribed anticoagulants (warfarin, apixaban): never miss a dose — stroke risk', icon: '💊', cat: 'medication' },
      { tip: 'Warfarin patients: consistent vitamin K intake. INR checks as scheduled. No missed doses.', icon: '🥗', cat: 'medication' },
    ],
    complianceFields: ['heartRate'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tooltip
// ═══════════════════════════════════════════════════════════════════════════════
function CTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1b2a', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 11, boxShadow: '0 8px 24px rgba(0,0,0,.35)', minWidth: 140 }}>
      <div style={{ fontWeight: 700, color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.stroke || p.color || p.fill }} />
          <span style={{ color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Book Clinic Modal
// ═══════════════════════════════════════════════════════════════════════════════
function BookClinicModal({ patientId, toolType, reason, onClose }: { patientId: string; toolType: string; reason: string; onClose: () => void }) {
  const [services, setServices] = useState<DocService[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [note, setNote]         = useState(reason);
  const [booking, setBooking]   = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'services')).then(snap =>
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as DocService)))
    );
  }, []);

  const book = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      const svc = services.find(s => s.id === selected);
      await addDoc(collection(db, 'appointments'), {
        patientId, doctorId: svc?.doctorId || '', doctorName: svc?.doctorName || '',
        specialty: svc?.title || '', status: 'pending',
        reason: note, toolType,
        date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 3)),
        patientNotes: note, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'alerts'), {
        patientId, doctorId: svc?.doctorId || '', type: 'appointment',
        title: '📅 Appointment Request',
        message: `${patientId} has requested a consultation regarding ${toolType.replace(/_/g, ' ')}. Reason: ${note}`,
        read: false, createdAt: serverTimestamp(), urgency: 'routine',
      });
      setDone(true);
    } catch (e) { console.error(e); }
    setBooking(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg,#0d1b2a,#0f3d2e)', padding: '20px 24px', color: '#fff' }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>📅</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{done ? 'Appointment Requested!' : 'Book a Clinic Appointment'}</div>
          <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>Connect with a specialist for your condition</div>
        </div>
        {done ? (
          <div style={{ padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>Request sent successfully</div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>Your appointment request has been sent to the doctor. You will receive a confirmation notification shortly.</div>
            <button onClick={onClose} style={{ padding: '11px 28px', background: '#0aaa76', border: 'none', color: '#fff', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Done</button>
          </div>
        ) : (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 6 }}>Reason for Visit</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 8 }}>Select Provider</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {services.length === 0 && <div style={{ fontSize: 12, color: '#8fa3bd' }}>Loading providers…</div>}
                {services.map(s => (
                  <div key={s.id} onClick={() => setSelected(s.id)}
                    style={{ padding: '12px 14px', border: `2px solid ${selected === s.id ? '#0aaa76' : '#e2e9f3'}`, borderRadius: 12, cursor: 'pointer', background: selected === s.id ? '#f0fdf4' : '#fff', transition: 'all .12s' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1b2a' }}>{s.doctorName}</div>
                    <div style={{ fontSize: 11, color: '#8fa3bd', marginTop: 2 }}>{s.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1.5px solid #e2e9f3', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>Cancel</button>
              <button onClick={book} disabled={!selected || booking} style={{ flex: 2, padding: '12px', background: '#0aaa76', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: !selected ? .5 : 1 }}>
                {booking ? 'Sending…' : '📅 Request Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Doctor Log Modal
// ═══════════════════════════════════════════════════════════════════════════════
function DoctorLogModal({ assignment, patientId, doctor, onClose }: { assignment: ToolAssignment; patientId: string; doctor: { uid: string; name: string }; onClose: () => void }) {
  const config = TOOL_CONFIGS[assignment.toolType];
  const [form, setForm]   = useState<Record<string, any>>({});
  const [note, setNote]   = useState('');
  const [saving, setSave] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSave(true);
    try {
      const tr = evaluateReading(config.id, form);
      const payload = {
        toolType: config.id, patientId, doctorId: doctor.uid,
        assignmentId: assignment.id, enteredBy: 'doctor', doctorName: doctor.name,
        data: { ...form }, recordedAt: serverTimestamp(), doctorNote: note,
        triage: { level: tr.level, label: tr.label, message: tr.message, urgency: tr.urgency, alertDoctor: tr.alertDoctor, alertPatient: tr.alertPatient },
        doctorReviewed: true,
      };
      await addDoc(collection(db, 'toolReadings'), payload);
      await addDoc(collection(db, 'alerts'), {
        patientId, doctorId: doctor.uid, type: 'reading',
        title: `📋 Dr. ${doctor.name} recorded your ${config.name}`,
        message: note ? `${tr.message} — Note: ${note}` : tr.message,
        read: false, createdAt: serverTimestamp(), urgency: tr.urgency || 'routine',
      });
      onClose();
    } catch (e) { console.error(e); }
    setSave(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.22)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${config.color},${config.color}bb)`, padding: '18px 22px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{config.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Log {config.name}</div>
            <div style={{ fontSize: 11, opacity: .8 }}>Recording on behalf of patient</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
          {config.fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span>{f.label}{f.required ? ' *' : ''}</span>
                {f.unit && <span style={{ color: config.color }}>{f.unit}</span>}
              </label>
              {f.type === 'number' && <input type="number" min={f.min} max={f.max} step={f.step} value={form[f.key] ?? ''} placeholder={`${f.min ?? 0}–${f.max ?? 999}`} onChange={e => set(f.key, e.target.value === '' ? undefined : Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: `1.5px solid ${config.color}40`, borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />}
              {f.type === 'select' && <select value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}><option value="">Select…</option>{f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
              {f.type === 'text' && <input type="text" value={form[f.key] ?? ''} placeholder={f.placeholder} onChange={e => set(f.key, e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />}
            </div>
          ))}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .6, display: 'block', marginBottom: 5 }}>Clinical Note (visible to patient)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Add instructions or interpretation for patient…" style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1.5px solid #e2e9f3', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1.5px solid #e2e9f3', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex: 2, padding: '12px', background: `linear-gradient(135deg,${config.color},#06b6d4)`, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Logging…' : '📋 Log & Notify Patient'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tool Section (assigned)
// ═══════════════════════════════════════════════════════════════════════════════
function ToolSection({ assignment, readings, prescriptions, isDoctor, doctor, patientId }: {
  assignment: ToolAssignment; readings: ToolReading[]; prescriptions: any[];
  isDoctor?: boolean; doctor?: { uid: string; name: string }; patientId: string;
}) {
  const config   = TOOL_CONFIGS[assignment.toolType];
  const guide    = GUIDANCE[assignment.toolType];
  const [tab, setTab]         = useState<'chart' | 'history' | 'complications' | 'guide' | 'stats'>('chart');
  const [showDrLog, setShowDrLog] = useState(false);
  const [showBook, setShowBook]   = useState(false);
  const [bookReason, setBookReason] = useState('');

  if (!config) return null;

  const latest = readings[0];
  const tc     = latest?.triage;
  const lc     = LC[tc?.level || 'normal'];
  const lb     = LB[tc?.level || 'normal'];

  // ── Build chart data ──
  const chartData = readings.slice(0, 90).reverse().map(r => {
    const base: Record<string, any> = {
      date: fmtShort(r.recordedAt), level: r.triage?.level || 'normal', enteredBy: (r as any).enteredBy || 'patient',
    };
    if (assignment.toolType === 'bp_monitor') { base.Systolic = r.data.systolic; base.Diastolic = r.data.diastolic; base.Pulse = r.data.pulse; }
    else if (assignment.toolType === 'mood_tracker') { base['PHQ-9'] = r.data.phq9; base.Wellbeing = r.data.wellbeing; }
    else if (config.chartFields?.[0]) base[config.name.split(' ')[0]] = r.data[config.chartFields[0]];
    const rd = r.recordedAt?.toDate ? r.recordedAt.toDate() : new Date(r.recordedAt);
    const rxOnDay = prescriptions.find(rx => {
      const rxd = rx.addedAt ? new Date(rx.addedAt) : null;
      return rxd && Math.abs(rxd.getTime() - rd.getTime()) < 86400000 * 3;
    });
    if (rxOnDay) base._rxEvent = 1;
    return base;
  });

  const LINES = assignment.toolType === 'bp_monitor'
    ? [{ key: 'Systolic', color: '#ef4444' }, { key: 'Diastolic', color: '#f97316' }, { key: 'Pulse', color: '#8b5cf6', dashed: true }]
    : assignment.toolType === 'mood_tracker'
    ? [{ key: 'PHQ-9', color: '#6366f1' }, { key: 'Wellbeing', color: '#10b981' }]
    : [{ key: config.name.split(' ')[0], color: config.color }];

  const ref = guide?.chartRef;

  const dispVal = assignment.toolType === 'bp_monitor'
    ? `${latest?.data.systolic || '—'}/${latest?.data.diastolic || '—'}`
    : config.chartFields?.[0] ? (latest?.data[config.chartFields[0]] ?? '—') : '—';

  const compRate = (() => {
    if (!readings.length) return null;
    const expected = 7; const got = Math.min(readings.length, expected);
    return Math.round((got / expected) * 100);
  })();

  const triggerBook = (reason: string) => { setBookReason(reason); setShowBook(true); };

  const TABS = [
    { id: 'chart',         label: '📈 Trends' },
    { id: 'history',       label: '📋 History' },
    { id: 'complications', label: '⚠️ Complications' },
    { id: 'guide',         label: '📚 Guide' },
    { id: 'stats',         label: '📊 Stats' },
  ] as const;

  return (
    <section style={{ background: '#fff', border: `1.5px solid ${tc?.level && tc.level !== 'normal' ? lc + '55' : '#e8eef5'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>

      {/* ── Tool header ── */}
      <div style={{ background: `linear-gradient(135deg,${config.color}12,${config.color}04)`, borderBottom: `1px solid ${config.color}22`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `${config.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{config.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1b2a' }}>{config.name}</div>
              <div style={{ fontSize: 11, color: '#8fa3bd', marginTop: 1, fontWeight: 600 }}>{assignment.frequency || config.frequency}</div>
              {(latest as any)?.enteredBy === 'doctor' && (
                <div style={{ fontSize: 10, color: config.color, fontWeight: 700, marginTop: 2 }}>📋 Last logged by Dr. {(latest as any).doctorName}</div>
              )}
              {compRate !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 60, height: 4, background: '#e2e9f3', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${compRate}%`, height: '100%', background: compRate >= 80 ? '#10b981' : compRate >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: compRate >= 80 ? '#10b981' : compRate >= 60 ? '#f59e0b' : '#ef4444' }}>{compRate}% compliance (7 days)</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {latest && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', color: lc, lineHeight: 1 }}>{dispVal}</div>
                <div style={{ fontSize: 10, color: '#8fa3bd', fontWeight: 600 }}>{ref?.unit}</div>
                <div style={{ fontSize: 10, color: '#8fa3bd', marginTop: 1 }}>{fmtAgo(latest.recordedAt)}</div>
              </div>
            )}
            {tc && (
              <div style={{ background: lb, border: `2px solid ${lc}40`, borderRadius: 10, padding: '7px 11px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: lc }}>{tc.label}</div>
                <div style={{ fontSize: 9, color: '#8fa3bd', marginTop: 1, fontWeight: 600 }}>{readings.length} total</div>
              </div>
            )}
            {isDoctor && doctor && (
              <button onClick={() => setShowDrLog(true)} style={{ padding: '8px 14px', background: config.color, color: '#fff', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                📋 Log Reading
              </button>
            )}
          </div>
        </div>

        {/* Triage alert bar */}
        {tc && tc.level !== 'normal' && (
          <div style={{ marginTop: 12, background: `${lc}12`, border: `1px solid ${lc}30`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{tc.level === 'hospital' ? '🚨' : tc.level === 'clinic' ? '⚠️' : tc.level === 'video' ? '📹' : '👀'}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: lc }}>{tc.actionLabel}</div>
                <div style={{ fontSize: 11, color: '#4a5568', marginTop: 1 }}>{tc.message}</div>
              </div>
            </div>
            {!isDoctor && (
              <button onClick={() => triggerBook(tc.message)} style={{ padding: '7px 14px', background: lc, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {tc.level === 'hospital' ? '🚨 Emergency' : tc.level === 'clinic' ? '📅 Book Clinic' : '📹 Book Video'}
              </button>
            )}
          </div>
        )}

        {/* Doctor instruction */}
        {assignment.instructions && (
          <div style={{ marginTop: 10, padding: '9px 13px', background: '#eff6ff', borderRadius: 9, border: '1px solid rgba(99,102,241,.2)', fontSize: 12, color: '#1e293b' }}>
            <span style={{ fontWeight: 700, color: '#6366f1' }}>👨‍⚕️ Doctor's Instructions: </span>{assignment.instructions}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8eef5', background: '#fafbfd' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '11px 6px', border: 'none', borderBottom: `2.5px solid ${tab === t.id ? config.color : 'transparent'}`, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: tab === t.id ? config.color : '#94a3b8', transition: 'all .12s', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '18px 20px' }}>

        {/* CHART */}
        {tab === 'chart' && (
          <div>
            {guide?.targets && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {guide.targets.map((t, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 9, padding: '8px 12px', border: '1px solid #e2e9f3', fontSize: 11, flex: '1 1 200px' }}>
                    <div style={{ fontWeight: 800, color: '#0d1b2a', marginBottom: 4, fontSize: 11 }}>{t.label}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✅ {t.ideal}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>⚠️ {t.acceptable}</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>🚨 {t.danger}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {latest?.doctorNote ? (
              <div style={{ marginBottom: 12, padding: '10px 13px', background: '#f0fdf4', borderRadius: 9, border: '1px solid rgba(16,185,129,.2)', fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: '#0aaa76' }}>👨‍⚕️ Latest Doctor Note ({fmtDate(latest.recordedAt)}): </span>
                <span style={{ color: '#1e293b' }}>{latest.doctorNote}</span>
              </div>
            ) : (
              <div style={{ marginBottom: 12, padding: '9px 13px', background: '#fffbeb', borderRadius: 9, border: '1px solid rgba(245,158,11,.2)', fontSize: 11, color: '#92400e' }}>
                ⚠️ No doctor note on latest reading — review pending
              </div>
            )}

            {prescriptions.length > 0 && (
              <div style={{ marginBottom: 14, padding: '10px 13px', background: '#eff6ff', borderRadius: 9, border: '1px solid rgba(99,102,241,.2)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Current Medications</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {prescriptions.map((rx, i) => (
                    <span key={i} style={{ background: '#fff', border: '1px solid rgba(99,102,241,.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
                      💊 {rx.medication} <span style={{ color: '#8fa3bd' }}>{rx.dosage}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {chartData.length < 2 ? (
              <div style={{ textAlign: 'center', color: '#8fa3bd', padding: '36px 0', fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Awaiting data</div>
                <div>Log at least 2 readings to see your trend chart</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  {ref?.dangerHigh && <ReferenceArea y1={ref.dangerHigh} y2={ref.dangerHigh * 1.5} fill="#ef444408" />}
                  {ref?.target && <ReferenceLine y={ref.target} stroke="#10b98155" strokeDasharray="4 3" label={{ value: 'Target', fill: '#10b981', fontSize: 9 }} />}
                  {ref?.dangerHigh && <ReferenceLine y={ref.dangerHigh} stroke="#ef444455" strokeDasharray="4 3" label={{ value: 'Alert', fill: '#ef4444', fontSize: 9 }} />}
                  {ref?.dangerLow && <ReferenceLine y={ref.dangerLow} stroke="#f59e0b55" strokeDasharray="4 3" label={{ value: 'Low', fill: '#f59e0b', fontSize: 9 }} />}
                  <Bar dataKey="_rxEvent" fill="#6366f120" radius={[3, 3, 0, 0]} barSize={4} name="Rx Change" />
                  {LINES.map(l => l.key ? (
                    <Area key={l.key} type="monotone" dataKey={l.key} stroke={(l as any).color} strokeWidth={2.5}
                      fill={`${(l as any).color}10`}
                      strokeDasharray={(l as any).dashed ? '5 4' : undefined}
                      dot={(props: any) => {
                        const lvl = props.payload?.level;
                        if (!lvl || lvl === 'normal') return <Dot {...props} r={2.5} fill={(l as any).color} strokeWidth={0} />;
                        return <Dot {...props} r={5} fill={LC[lvl]} stroke="#fff" strokeWidth={1.5} />;
                      }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  ) : null)}
                </ComposedChart>
              </ResponsiveContainer>
            )}
            <div style={{ fontSize: 10, color: '#8fa3bd', marginTop: 6, textAlign: 'center' }}>🟣 Coloured dots indicate triage alerts at that reading · Purple bars mark prescription changes</div>
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {readings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#8fa3bd', padding: '32px 0', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>No readings logged yet
              </div>
            ) : readings.map((r, i) => {
              const rl  = LC[r.triage?.level || 'normal'];
              const val = assignment.toolType === 'bp_monitor'
                ? `${r.data.systolic}/${r.data.diastolic} mmHg`
                : config.chartFields?.[0] ? `${r.data[config.chartFields[0]]} ${ref?.unit || ''}` : '—';
              return (
                <div key={r.id || i} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e8eef5', marginBottom: 6, background: i % 2 === 0 ? '#fafbfd' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 17, fontWeight: 900, fontFamily: 'monospace', color: rl }}>{val}</span>
                        {(r as any).enteredBy === 'doctor' && <span style={{ fontSize: 9, background: '#eff6ff', color: '#6366f1', borderRadius: 99, padding: '2px 7px', fontWeight: 700 }}>Dr. logged</span>}
                        {!r.doctorReviewed && <span style={{ fontSize: 9, background: '#fffbeb', color: '#f59e0b', borderRadius: 99, padding: '2px 7px', fontWeight: 700 }}>Awaiting review</span>}
                      </div>
                      <div style={{ fontSize: 10, color: '#8fa3bd', marginTop: 3 }}>{fmtDate(r.recordedAt)} at {fmtTime(r.recordedAt)}</div>
                      {r.data.note && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>Patient note: "{r.data.note}"</div>}
                      {r.doctorNote && <div style={{ fontSize: 11, color: '#0aaa76', marginTop: 3, fontWeight: 600 }}>👨‍⚕️ {r.doctorNote}</div>}
                      {!r.doctorNote && r.doctorReviewed && <div style={{ fontSize: 10, color: '#10b981', marginTop: 2 }}>✅ Reviewed by doctor — no note added</div>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: `${rl}15`, color: rl, whiteSpace: 'nowrap' }}>
                      {r.triage?.label || 'Normal'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* COMPLICATIONS */}
        {tab === 'complications' && (
          <div>
            <div style={{ background: '#fffbeb', borderRadius: 10, padding: '11px 14px', border: '1px solid rgba(245,158,11,.25)', fontSize: 12, color: '#78350f', marginBottom: 14, lineHeight: 1.6 }}>
              ⚠️ <strong>These are potential complications</strong> of your condition. Early recognition of warning signs allows prompt intervention and can prevent serious or permanent harm.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {guide?.complications.map((c, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 13, border: '1px solid #e2e9f3', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{c.icon}</span>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a' }}>{c.name}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #e2e9f3' }}>
                    <div style={{ padding: '10px 13px', borderRight: '1px solid #e2e9f3', background: '#fef2f2' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 5 }}>⚠️ Warning Signs</div>
                      <div style={{ fontSize: 11, color: '#4a5568', lineHeight: 1.6 }}>{c.signs}</div>
                    </div>
                    <div style={{ padding: '10px 13px', background: '#f0fdf4' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 5 }}>✅ Prevention</div>
                      <div style={{ fontSize: 11, color: '#4a5568', lineHeight: 1.6 }}>{c.prevent}</div>
                    </div>
                  </div>
                  <div style={{ padding: '9px 13px', background: '#eff6ff', borderTop: '1px solid #e2e9f3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>📍 {c.action}</div>
                    {!isDoctor && (
                      <button onClick={() => triggerBook(`Concern: ${c.name} — ${c.action}`)} style={{ padding: '5px 11px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        📅 Book
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GUIDE */}
        {tab === 'guide' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {guide?.education.map((e, i) => {
                const cc: Record<string, string> = { lifestyle: '#8b5cf6', medication: '#6366f1', monitoring: '#0aaa76', warning: '#ef4444', diet: '#f59e0b', exercise: '#10b981' };
                const cb: Record<string, string> = { lifestyle: '#f5f3ff', medication: '#eef2ff', monitoring: '#f0fdf4', warning: '#fef2f2', diet: '#fffbeb', exercise: '#f0fdf4' };
                return (
                  <div key={i} style={{ background: cb[e.cat] || '#f8fafc', borderRadius: 11, padding: '11px 14px', border: `1px solid ${cc[e.cat] || '#e2e9f3'}22`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{e.icon}</span>
                    <div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: cc[e.cat], textTransform: 'uppercase', letterSpacing: .6, marginRight: 8 }}>{e.cat}</span>
                      <span style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6 }}>{e.tip}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {!isDoctor && (
              <button onClick={() => triggerBook('Routine chronic disease follow-up')} style={{ width: '100%', marginTop: 14, padding: '12px', background: 'linear-gradient(135deg,#0d1b2a,#0f3d2e)', color: '#fff', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                📅 Book Routine Follow-Up Appointment
              </button>
            )}
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div>
            {(() => {
              const triageCounts: Record<string, number> = {};
              readings.forEach(r => {
                const level = r.triage?.level || 'normal';
                triageCounts[level] = (triageCounts[level] || 0) + 1;
              });
              const pieData = Object.entries(triageCounts)
                .filter(([, count]) => count > 0)
                .map(([level, count]) => ({
                  name: level.charAt(0).toUpperCase() + level.slice(1),
                  value: count,
                  color: LC[level] || '#64748b',
                }));
              const total = pieData.reduce((s, d) => s + d.value, 0);
              if (pieData.length === 0) {
                return (
                  <div style={{ textAlign: 'center', color: '#8fa3bd', padding: '32px 0', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                    No data available
                  </div>
                );
              }
              return (
                <div style={{ background: '#0d1b2a', borderRadius: 12, padding: '16px' }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 24;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={600}>
                              {name} {(percent * 100).toFixed(0)}%
                            </text>
                          );
                        }}
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                        <span style={{ fontWeight: 700, color: '#fff' }}>{d.name}</span>
                        <span>{d.value} ({((d.value / total) * 100).toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {showDrLog && doctor && <DoctorLogModal assignment={assignment} patientId={patientId} doctor={doctor} onClose={() => setShowDrLog(false)} />}
      {showBook && <BookClinicModal patientId={patientId} toolType={assignment.toolType} reason={bookReason} onClose={() => setShowBook(false)} />}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Unassigned tool placeholder
// ═══════════════════════════════════════════════════════════════════════════════
function UnassignedTool({ toolId }: { toolId: string }) {
  const config = TOOL_CONFIGS[toolId];
  if (!config) return null;
  return (
    <section style={{ background: '#fff', border: '1.5px dashed #e2e9f3', borderRadius: 16, padding: '18px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, opacity: .7 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{config.icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#4a5568' }}>{config.name}</div>
        <div style={{ fontSize: 11, color: '#8fa3bd', marginTop: 2 }}>Not yet assigned by your doctor · {config.frequency}</div>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 10, background: '#f1f5f9', color: '#8fa3bd', borderRadius: 99, padding: '4px 11px', fontWeight: 700 }}>NOT ASSIGNED</div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Notification Permission Banner
// ═══════════════════════════════════════════════════════════════════════════════
function NotifPermissionBanner({ permission, onRequest }: { permission: NotifPermission; onRequest: () => Promise<NotifPermission> }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || permission === 'granted' || permission === 'unsupported') return null;
  if (permission === 'denied') return (
    <div style={{ margin: '0 0 14px', padding: '11px 16px', background: '#fef2f2', border: '1.5px solid #ef444433', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>🔕</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>Device notifications blocked</div>
        <div style={{ fontSize: 11, color: '#7f1d1d', marginTop: 1 }}>Enable them in your browser/OS settings to receive real-time health alerts even when the app is in the background.</div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
    </div>
  );

  return (
    <div style={{ margin: '0 0 14px', padding: '12px 16px', background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', border: '1.5px solid #10b98133', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 22 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0d1b2a' }}>Enable real-time health alerts</div>
        <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2, lineHeight: 1.5 }}>
          Get instant device notifications for urgent readings, doctor notes, and appointment updates — even when the app is in the background.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => setDismissed(true)} style={{ padding: '7px 13px', background: 'transparent', border: '1.5px solid #cbd5e1', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>
          Not now
        </button>
        <button
          onClick={async () => { const r = await onRequest(); if (r === 'denied') setDismissed(false); }}
          style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#0aaa76,#06b6d4)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(10,170,118,.3)' }}>
          🔔 Enable Notifications
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Alerts Panel (with real-time device notifications)
// ═══════════════════════════════════════════════════════════════════════════════
function AlertsPanel({ patientId }: { patientId: string }) {
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);
  const [show, setShow]     = useState(false);

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'alerts'), where('patientId', '==', patientId), orderBy('createdAt', 'desc'), limit(30)),
      snap => setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertDoc)))
    );
    return () => unsub();
  }, [patientId]);

  // Device notifications hook — fires push notif for every genuinely new unread alert
  const { permission, requestPermission } = useDeviceAlerts(alerts);

  const unread   = alerts.filter(a => !a.read).length;
  const markRead = (id: string) => updateDoc(doc(db, 'alerts', id), { read: true });
  const markAll  = () => alerts.filter(a => !a.read).forEach(a => markRead(a.id));

  const uc: Record<string, string> = { emergency: '#ef4444', urgent: '#f97316', routine: '#10b981' };
  const ub: Record<string, string> = { emergency: '#fef2f2', urgent: '#fff7ed', routine: '#f0fdf4' };

  return (
    <>
      {/* Permission banner sits above the alert panel */}
      <NotifPermissionBanner permission={permission} onRequest={requestPermission} />

      <section style={{ background: '#fff', border: `1.5px solid ${unread > 0 ? '#f59e0b55' : '#e8eef5'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>
        <div
          style={{ padding: '14px 20px', borderBottom: '1px solid #e8eef5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShow(s => !s)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={{ fontSize: 22 }}>🔔</span>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  background: '#ef4444', color: '#fff', borderRadius: 99,
                  fontSize: 9, fontWeight: 800, padding: '1px 5px',
                  border: '1.5px solid #fff', lineHeight: 1.4,
                  animation: 'pulse 2s ease-in-out infinite',
                }}>
                  {unread}
                </span>
              )}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0d1b2a' }}>
                Alerts &amp; Notifications
              </div>
              <div style={{ fontSize: 10, color: '#8fa3bd', marginTop: 1 }}>
                {alerts.length} total · {unread} unread
                {permission === 'granted' && (
                  <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 700 }}>✅ Device alerts on</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unread > 0 && (
              <button onClick={e => { e.stopPropagation(); markAll(); }} style={{ fontSize: 10, color: '#0aaa76', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Mark all read
              </button>
            )}
            <span style={{ fontSize: 12, color: '#8fa3bd' }}>{show ? '▲' : '▼'}</span>
          </div>
        </div>

        {show && (
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {alerts.length === 0
              ? <div style={{ textAlign: 'center', color: '#8fa3bd', fontSize: 12, padding: '24px 0' }}>No alerts yet</div>
              : alerts.map(a => (
                <div key={a.id} onClick={() => !a.read && markRead(a.id)} style={{ padding: '12px 18px', borderBottom: '1px solid #e8eef5', cursor: !a.read ? 'pointer' : 'default', background: !a.read ? (ub[a.urgency || 'routine'] || '#fffbeb') : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: uc[a.urgency || 'routine'] || '#0d1b2a' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3, lineHeight: 1.5 }}>{a.message}</div>
                      <div style={{ fontSize: 9, color: '#8fa3bd', marginTop: 3 }}>{fmtAgo(a.createdAt)}</div>
                    </div>
                    {!a.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: uc[a.urgency || 'routine'], flexShrink: 0, marginTop: 3, marginLeft: 10 }} />}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }`}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  isDoctor?: boolean;
  doctor?: { uid: string; name: string };
  appointments?: Appt[];
}

export default function PatientHealthDashboard({
  patientId, patientName, patientAge, patientGender,
  isDoctor = false, doctor, appointments = [],
}: Props) {
  const [assignments, setAssignments] = useState<ToolAssignment[]>([]);
  const [allReadings, setAllReadings] = useState<Record<string, ToolReading[]>>({});
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const allRx = appointments.flatMap(a => a.prescriptions || []);

  // ✅ toolAssignments: patientId filter matches security rule
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'toolAssignments'), where('patientId', '==', patientId), where('active', '==', true)),
      snap => { setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() } as ToolAssignment))); setLoading(false); }
    );
    return () => unsub();
  }, [patientId]);

  // ✅ toolReadings: BOTH patientId AND assignmentId filters
  useEffect(() => {
    if (!assignments.length) return;
    const unsubs = assignments.map(a =>
      onSnapshot(
        query(collection(db, 'toolReadings'),
          where('patientId', '==', patientId),
          where('assignmentId', '==', a.id),
          orderBy('recordedAt', 'desc'), limit(90)
        ),
        snap => {
          setAllReadings(prev => ({ ...prev, [a.id]: snap.docs.map(d => ({ id: d.id, ...d.data() } as ToolReading)) }));
          setLastUpdated(new Date());
        }
      )
    );
    return () => unsubs.forEach(u => u());
  }, [assignments, patientId]);

  // Overall status (unchanged)
  const overall = (() => {
    const lvls = assignments.map(a => allReadings[a.id]?.[0]?.triage?.level || 'normal');
    if (lvls.some(l => l === 'hospital')) return { label: 'Critical',  color: '#ef4444', icon: '🚨', bg: '#fef2f2' };
    if (lvls.some(l => l === 'clinic'))   return { label: 'Urgent',    color: '#f97316', icon: '⚠️', bg: '#fff7ed' };
    if (lvls.some(l => l === 'video'))    return { label: 'Attention', color: '#6366f1', icon: '📹', bg: '#eef2ff' };
    if (lvls.some(l => l === 'watch'))    return { label: 'Monitor',   color: '#f59e0b', icon: '👀', bg: '#fffbeb' };
    return { label: 'Good', color: '#10b981', icon: '✅', bg: '#f0fdf4' };
  })();

  const assignedIds = assignments.map(a => a.toolType);
  const unassigned  = ALL_TOOL_IDS.filter(id => !assignedIds.includes(id));

  // ─── NEW: BP & Medication Timeline component ─────────────────────────────────
  const BpMedicationTimeline = () => {
    // Get BP assignment and readings
    const bpAssignment = assignments.find(a => a.toolType === 'bp_monitor');
    const bpReadings = bpAssignment ? (allReadings[bpAssignment.id] || []) : [];

    // Group BP readings by month (latest per month)
    const bpByMonth = new Map<string, { systolic: number; diastolic: number; timestamp: number }>();
    bpReadings.forEach(r => {
      const d = r.recordedAt?.toDate ? r.recordedAt.toDate() : new Date(r.recordedAt);
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = bpByMonth.get(monthKey);
      if (!existing || d.getTime() > existing.timestamp) {
        bpByMonth.set(monthKey, {
          systolic: r.data.systolic,
          diastolic: r.data.diastolic,
          timestamp: d.getTime()
        });
      }
    });
    const sortedBp = Array.from(bpByMonth.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Build medication timeline from prescriptions (allRx)
    const medMap = new Map<string, { events: Array<{ date: Date; type: string; dosage?: string; note?: string }> }>();
    allRx.forEach(rx => {
      const med = rx.medication;
      if (!med) return;
      const d = rx.createdAt?.toDate ? rx.createdAt.toDate() : new Date(rx.createdAt);
      if (!medMap.has(med)) medMap.set(med, { events: [] });
      medMap.get(med)!.events.push({
        date: d,
        type: rx.active === false ? 'stop' : 'start',
        dosage: rx.dosage,
        note: rx.instructions
      });
    });

    // Sort events by date and detect dose changes
    const medicationTimeline: Array<{
      medication: string;
      events: Array<{ date: Date; type: string; dosage?: string; note?: string }>;
    }> = [];
    for (const [med, { events }] of medMap.entries()) {
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      // Detect dose changes by comparing consecutive start events
      const processedEvents: typeof events = [];
      let lastDosage: string | undefined;
      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        if (ev.type === 'start') {
          if (!lastDosage) {
            // First start
            processedEvents.push(ev);
            lastDosage = ev.dosage;
          } else if (ev.dosage !== lastDosage) {
            // Dose change
            processedEvents.push({
              ...ev,
              type: 'dose_change',
              note: `Dose increased from ${lastDosage} to ${ev.dosage}`
            });
            lastDosage = ev.dosage;
          } else {
            // Duplicate start with same dosage – ignore
          }
        } else if (ev.type === 'stop') {
          processedEvents.push(ev);
        }
      }
      medicationTimeline.push({ medication: med, events: processedEvents });
    }

    // If no data, don't render anything
    if (sortedBp.length === 0 && medicationTimeline.length === 0) return null;

    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e8eef5', overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8eef5', background: '#fafbfd' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1b2a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>❤️</span> Blood Pressure & Medication Timeline
          </div>
        </div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {/* Left column: BP Readings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>BP (mmHg)</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>Target &lt;130/80</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedBp.map(([month, bp]) => (
                <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{month}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#0d1b2a' }}>{bp.systolic}/{bp.diastolic}</span>
                </div>
              ))}
              {sortedBp.length === 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No BP readings yet</div>
              )}
            </div>
          </div>

          {/* Right column: Medication Timeline */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Medication Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {medicationTimeline.map(({ medication, events }) => (
                <div key={medication} style={{ borderLeft: '2px solid #93c5fd', paddingLeft: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0d1b2a', marginBottom: 6 }}>{medication}</div>
                  {events.map((ev, idx) => {
                    const dateStr = ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    if (ev.type === 'start') {
                      return (
                        <div key={idx} style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
                          Started {dateStr}
                          {ev.dosage && <span style={{ color: '#64748b', marginLeft: 6 }}>({ev.dosage})</span>}
                        </div>
                      );
                    } else if (ev.type === 'dose_change') {
                      return (
                        <div key={idx} style={{ fontSize: 12, color: '#f59e0b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>⬆</span> Dose increased: {ev.dosage}
                          {ev.note && <span style={{ fontSize: 10, color: '#94a3b8' }}>({ev.note})</span>}
                        </div>
                      );
                    } else if (ev.type === 'stop') {
                      return (
                        <div key={idx} style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                          Stopped {dateStr}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
              {medicationTimeline.length === 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No medications prescribed</div>
              )}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #e8eef5', padding: '10px 20px', textAlign: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }} onClick={() => console.log('View all history')}>
            View All History →
          </button>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <div style={{ textAlign: 'center', color: '#8fa3bd' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e9f3', borderTopColor: '#0aaa76', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 12, fontWeight: 600 }}>Loading health dashboard…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", color: '#0d1b2a', background: '#f8fafc', minHeight: '100vh', padding: '0 0 40px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{transform:scale(1)} 50%{transform:scale(1.18)}}`}</style>

      {/* ── Page header ── */}
      <div style={{ background: 'linear-gradient(135deg,#0d1b2a 0%,#0f3d2e 55%,#0a5741 100%)', padding: '24px 24px 20px', color: '#fff', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.4, opacity: .55, marginBottom: 4 }}>Lifelong Health Record</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -.3 }}>{patientName}</div>
            {(patientAge || patientGender) && (
              <div style={{ fontSize: 12, opacity: .7, marginTop: 3 }}>{[patientAge && `${patientAge} yrs`, patientGender].filter(Boolean).join(' · ')}</div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: overall.bg, color: overall.color, borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 800 }}>
                {overall.icon} {overall.label}
              </span>
              <span style={{ background: 'rgba(255,255,255,.12)', borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>
                🩺 {assignments.length} active tool{assignments.length !== 1 ? 's' : ''}
              </span>
              <span style={{ background: 'rgba(255,255,255,.08)', borderRadius: 99, padding: '4px 12px', fontSize: 10, fontWeight: 600, opacity: .8 }}>
                🕐 Updated {fmtAgo(lastUpdated)}
              </span>
            </div>
          </div>
          {/* Live summary tiles */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {assignments.slice(0, 5).map(a => {
              const cfg = TOOL_CONFIGS[a.toolType];
              const lat = allReadings[a.id]?.[0];
              const lv  = LC[lat?.triage?.level || 'normal'];
              const v   = a.toolType === 'bp_monitor'
                ? `${lat?.data.systolic || '—'}/${lat?.data.diastolic || '—'}`
                : cfg?.chartFields?.[0] ? (lat?.data[cfg.chartFields[0]] || '—') : '—';
              return (
                <div key={a.id} style={{ background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '11px 14px', textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{cfg?.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, fontFamily: 'monospace', color: lv, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 8, opacity: .6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, marginTop: 2 }}>{cfg?.name.split(' ')[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Prescriptions summary */}
        {allRx.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.12)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, opacity: .6, textTransform: 'uppercase', letterSpacing: .8 }}>Current Rx:</span>
            {allRx.map((rx, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 700 }}>
                💊 {rx.medication} {rx.dosage}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px', maxWidth: 900, margin: '0 auto' }}>

        {/* ── BP & Medication Timeline ── */}
        <BpMedicationTimeline />

        {/* ── Alerts (with device notifications) ── */}
        <AlertsPanel patientId={patientId} />

        {/* ── Overall Health Analytics ── */}
        {assignments.length > 0 && (
          <section style={{ background: '#0d1b2a', borderRadius: 16, border: '1.5px solid #1e3a5f', overflow: 'hidden', marginBottom: 16, padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📊 Overall Health Analytics
            </div>
            {(() => {
              const triageCounts: Record<string, number> = {};
              Object.values(allReadings).forEach(rs => {
                rs.forEach(r => {
                  const level = r.triage?.level || 'normal';
                  triageCounts[level] = (triageCounts[level] || 0) + 1;
                });
              });
              const pieData = Object.entries(triageCounts)
                .filter(([, count]) => count > 0)
                .map(([level, count]) => ({
                  name: level.charAt(0).toUpperCase() + level.slice(1),
                  value: count,
                  color: LC[level] || '#64748b',
                }));
              const total = pieData.reduce((s, d) => s + d.value, 0);
              if (pieData.length === 0) {
                return <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0', fontSize: 13 }}>No readings available</div>;
              }
              return (
                <div>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 24;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
                              {name} {(percent * 100).toFixed(0)}%
                            </text>
                          );
                        }}
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                        <span style={{ fontWeight: 700, color: '#fff' }}>{d.name}</span>
                        <span>{d.value} ({((d.value / total) * 100).toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* ── Assigned tools ── */}
        {assignments.length === 0 ? (
          <section style={{ background: '#fff', borderRadius: 16, border: '2px dashed #e2e9f3', padding: '44px 24px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🩺</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#4a5568', marginBottom: 6 }}>No monitoring tools assigned yet</div>
            <div style={{ fontSize: 13, color: '#8fa3bd', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              Your doctor will assign health monitoring tools during or after your consultation. Each tool provides real-time charting, clinical targets, complication guidance, and direct communication.
            </div>
          </section>
        ) : (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#8fa3bd', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 10 }}>Active Monitoring Tools</div>
            {assignments.map(a => (
              <ToolSection key={a.id} assignment={a} readings={allReadings[a.id] || []} prescriptions={allRx} isDoctor={isDoctor} doctor={doctor} patientId={patientId} />
            ))}
          </div>
        )}

        {/* ── Unassigned tools ── */}
        {unassigned.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#c4cdd6', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 10, marginTop: 8 }}>
              Other Available Tools (Not Yet Assigned)
            </div>
            {unassigned.map(id => <UnassignedTool key={id} toolId={id} />)}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 28, padding: '16px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e8eef5', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#8fa3bd', lineHeight: 1.8 }}>
            🏥 <strong style={{ color: '#0d1b2a' }}>Amexan Health</strong> — Lifelong Chronic Disease Management Platform<br />
            All data is encrypted and stored securely · Updates in real-time · {fmtDate(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
}