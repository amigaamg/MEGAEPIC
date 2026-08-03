"use client";
import { useState } from "react";
import { BarChart3, Clock, Target, BookOpen, Search, FlaskConical, Link, Brain, ClipboardList, PenSquare, Pill, Radio, DoorOpen, Calendar, Dna, FileText, TrendingUp, Thermometer, User, Stethoscope, Home, Bug, Apple, Droplets, Scan, RefreshCw, Building2, CheckCircle, Bed, Bell, AlertTriangle, Users, Database, Star, Lightbulb, Inbox, Heart } from 'lucide-react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --s50:#f0f9ff;--s100:#e0f2fe;--s200:#bae6fd;--s300:#7dd3fc;
  --s400:#38bdf8;--s500:#0ea5e9;--s600:#0284c7;--s700:#0369a1;
  --s800:#075985;--s900:#0c4a6e;
  --w:#fff;--f50:#fafafa;--f100:#f5f5f5;--f200:#e5e5e5;
  --f300:#d4d4d4;--f400:#a3a3a3;--f500:#737373;
  --green:#10b981;--green-bg:#d1fae5;--green-t:#065f46;
  --amber:#f59e0b;--amber-bg:#fef3c7;--amber-t:#92400e;
  --red:#ef4444;--red-bg:#fee2e2;--red-t:#991b1b;
  --blue:#3b82f6;--blue-bg:#dbeafe;--blue-t:#1e40af;
  --purple:#8b5cf6;--purple-bg:#ede9fe;--purple-t:#5b21b6;
  --font:'Inter',sans-serif;
  --r:12px;--r-sm:8px;--r-lg:20px;
  --sh:0 1px 3px rgba(0,0,0,.04);--sh-md:0 4px 16px rgba(0,0,0,.06);--sh-lg:0 12px 48px rgba(0,0,0,.08);
}
body{font-family:var(--font);background:var(--f50);color:#0f172a;-webkit-font-smoothing:antialiased}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* TOP BAR */
.pp-top{position:sticky;top:0;z-index:100;background:var(--w);border-bottom:1px solid var(--f200);padding:12px 24px;display:flex;justify-content:space-between;align-items:center}
.pp-left{display:flex;align-items:center;gap:14px}
.pp-back{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--f200);background:var(--w);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;text-decoration:none;color:#0f172a;transition:all .15s}
.pp-back:hover{border-color:var(--s300);background:var(--s50)}
.pp-brand{font-size:17px;font-weight:800;color:var(--s700);display:flex;align-items:center;gap:6px}
.pp-brand span{background:var(--s100);color:var(--s600);font-size:9px;padding:2px 5px;border-radius:4px;font-weight:700}
.pp-right{display:flex;align-items:center;gap:10px}
.pp-btn{font-size:11px;font-weight:700;padding:7px 14px;border-radius:7px;border:none;cursor:pointer;font-family:var(--font);transition:all .15s}
.pp-btn.primary{background:var(--s500);color:var(--w)}
.pp-btn.primary:hover{background:var(--s600)}
.pp-btn.outline{background:var(--w);border:1.5px solid var(--f200);color:var(--f500)}
.pp-btn.outline:hover{border-color:var(--s300);color:var(--s600)}

/* PATIENT BANNER */
.pp-banner{background:var(--w);border-bottom:1px solid var(--f200);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.pp-banner-left{display:flex;align-items:center;gap:16px}
.pp-avatar{width:48px;height:48px;border-radius:12px;background:var(--s500);color:var(--w);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;flex-shrink:0}
.pp-patient-name{font-size:18px;font-weight:800;color:var(--s900)}
.pp-patient-meta{font-size:11px;color:var(--f500);margin-top:2px;display:flex;gap:12px;flex-wrap:wrap}
.pp-patient-meta span{display:flex;align-items:center;gap:4px}
.pp-banner-right{display:flex;align-items:center;gap:8px}
.pp-status-pill{font-size:10px;font-weight:700;padding:4px 10px;border-radius:5px}
.pp-status-pill.inpatient{background:var(--purple-bg);color:var(--purple-t)}
.pp-status-pill.critical{background:var(--red-bg);color:var(--red-t)}
.pp-status-pill.stable{background:var(--green-bg);color:var(--green-t)}
.pp-status-pill.improving{background:var(--s100);color:var(--s700)}
.pp-encounter-id{font-size:10px;color:var(--f400);font-family:monospace}

/* LAYOUT */
.pp-body{display:flex;min-height:calc(100vh - 140px)}
.pp-sidebar{width:200px;background:var(--w);border-right:1px solid var(--f200);padding:12px 0;flex-shrink:0}
.pp-nav-section{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--f400);padding:10px 14px 4px}
.pp-nav-item{display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:11px;font-weight:600;color:var(--f500);cursor:pointer;border:none;background:none;width:100%;text-align:left;font-family:var(--font);transition:all .1s;border-right:2px solid transparent}
.pp-nav-item:hover{background:var(--s50);color:var(--s700)}
.pp-nav-item.active{background:var(--s50);color:var(--s700);border-right-color:var(--s500);font-weight:700}
.pp-nav-item .icon{font-size:12px;width:16px;text-align:center;opacity:.7}
.pp-nav-item.active .icon{opacity:1}
.pp-nav-item .badge{font-size:8px;background:var(--red-bg);color:var(--red-t);padding:1px 4px;border-radius:99px;margin-left:auto}

.pp-main{flex:1;padding:20px 24px;overflow-y:auto;animation:fadeIn .3s}
.pp-content{max-width:1000px;width:100%;animation:slideUp .3s}
.pp-section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--s600);margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid var(--s200);display:flex;align-items:center;gap:6px}

/* SUMMARY CARDS */
.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
@media(max-width:800px){.summary-grid{grid-template-columns:1fr}}
.summary-card{border:1px solid var(--f200);border-radius:var(--r);padding:14px;background:var(--w)}
.summary-card.full{grid-column:1/-1}
.summary-card.highlight{background:var(--s50);border-color:var(--s200)}
.summary-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f500);margin-bottom:6px;display:flex;align-items:center;gap:6px}
.summary-text{font-size:12px;line-height:1.7;color:#0f172a}
.summary-value{font-size:22px;font-weight:800;color:var(--s700)}
.summary-value.warn{color:var(--amber)}
.summary-value.danger{color:var(--red)}
.summary-value.good{color:var(--green)}

/* DATA TABLE */
.data-table{width:100%;border-collapse:collapse;font-size:11px}
.data-table th{text-align:left;padding:6px 10px;font-weight:700;color:var(--f500);border-bottom:1px solid var(--f200);font-size:10px;text-transform:uppercase;letter-spacing:.3px}
.data-table td{padding:6px 10px;border-bottom:1px solid var(--f100)}
.data-table tr:hover td{background:var(--s50)}
.data-table .abnormal{color:var(--red);font-weight:700}
.data-table .normal{color:var(--green)}
.data-table .flag{font-size:8px;padding:1px 4px;border-radius:3px;font-weight:700}
.data-table .flag.high{background:var(--red-bg);color:var(--red-t)}
.data-table .flag.low{background:var(--amber-bg);color:var(--amber-t)}

/* TIMELINE */
.timeline-view{position:relative;padding-left:20px}
.timeline-view::before{content:'';position:absolute;left:7px;top:4px;bottom:4px;width:2px;background:var(--s200);border-radius:99px}
.tl-item{position:relative;padding:0 0 14px 16px}
.tl-item::before{content:'';position:absolute;left:-18px;top:4px;width:8px;height:8px;border-radius:50%;background:var(--w);border:2px solid var(--s400);z-index:2}
.tl-item.data::before{border-color:var(--s400);background:var(--s100)}
.tl-item.intel::before{border-color:var(--s600);background:var(--s200)}
.tl-item.med::before{border-color:var(--purple);background:var(--purple-bg)}
.tl-item.critical::before{border-color:var(--red);background:var(--red-bg)}
.tl-time{font-size:9px;font-weight:700;color:var(--f400);font-family:monospace}
.tl-event{font-size:12px;font-weight:600;margin-top:1px}
.tl-detail{font-size:10px;color:var(--f500);margin-top:1px}

/* PROBLEM LIST */
.problem-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--f200);border-radius:var(--r-sm);margin-bottom:5px;transition:all .1s}
.problem-item:hover{border-color:var(--s300)}
.problem-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.problem-dot.active{background:var(--amber)}
.problem-dot.resolved{background:var(--green)}
.problem-dot.critical{background:var(--red)}
.problem-info{flex:1}
.problem-name{font-size:12px;font-weight:700}
.problem-meta{font-size:10px;color:var(--f500);margin-top:1px}
.problem-goals{font-size:9px;color:var(--s600);margin-top:2px}

/* EXAMINATION */
.exam-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:800px){.exam-grid{grid-template-columns:1fr}}
.exam-card{border:1px solid var(--f200);border-radius:var(--r);padding:12px}
.exam-card-title{font-size:10px;font-weight:700;text-transform:uppercase;color:var(--f500);margin-bottom:6px;letter-spacing:.3px}
.exam-finding{font-size:11px;padding:3px 0;display:flex;justify-content:space-between;border-bottom:1px solid var(--f100)}
.exam-finding:last-child{border-bottom:none}
.exam-finding .finding{font-weight:600}
.exam-finding .value{color:var(--f500)}
.exam-finding .abnormal{color:var(--red);font-weight:700}

/* MONITORING */
.monitor-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.monitor-card{border:1px solid var(--f200);border-radius:var(--r);padding:14px;background:var(--w)}
.monitor-title{font-size:11px;font-weight:700;color:var(--s700);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.monitor-param{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;border-bottom:1px solid var(--f100)}
.monitor-param:last-child{border-bottom:none}
.monitor-label{color:var(--f500)}
.monitor-value{font-weight:700}
.monitor-value.good{color:var(--green)}
.monitor-value.warn{color:var(--amber)}
.monitor-value.bad{color:var(--red)}

/* ORDERS */
.orders-group{margin-bottom:14px}
.orders-group-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f500);margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid var(--f200)}
.order-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--f200);border-radius:var(--r-sm);margin-bottom:4px;transition:all .1s}
.order-row:hover{border-color:var(--s300);background:var(--s50)}
.order-row .icon{font-size:13px;width:18px;text-align:center}
.order-row .info{flex:1;min-width:0}
.order-row .name{font-size:11px;font-weight:600}
.order-row .detail{font-size:9px;color:var(--f500);margin-top:1px}
.order-row .status{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px}
.order-row .status.pending{background:var(--amber-bg);color:var(--amber-t)}
.order-row .status.active{background:var(--blue-bg);color:var(--blue-t)}
.order-row .status.done{background:var(--green-bg);color:var(--green-t)}

/* DOCUMENTS */
.doc-list{display:flex;flex-direction:column;gap:6px}
.doc-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--f200);border-radius:var(--r);cursor:pointer;transition:all .15s}
.doc-item:hover{border-color:var(--s300);box-shadow:var(--sh)}
.doc-icon{font-size:20px}
.doc-info{flex:1}
.doc-name{font-size:12px;font-weight:600}
.doc-date{font-size:10px;color:var(--f500);margin-top:1px}
.doc-status{font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px}
.doc-status.signed{background:var(--green-bg);color:var(--green-t)}
.doc-status.draft{background:var(--amber-bg);color:var(--amber-t)}

/* ASSESSMENT */
.assessment-grid{display:flex;flex-direction:column;gap:16px}
.assessment-card{background:var(--w);border:1.5px solid var(--f200);border-radius:var(--r-lg);overflow:hidden}
.assessment-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--f200);background:var(--s50)}
.assessment-title{font-size:14px;font-weight:700;color:var(--s800);display:flex;align-items:center;gap:6px}
.assessment-body{padding:16px 18px}
.assessment-section{margin-bottom:14px}
.assessment-section:last-child{margin-bottom:0}
.assessment-section-label{font-size:10px;font-weight:700;color:var(--f500);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.assessment-text{font-size:12px;line-height:1.7;color:#0f172a}
.assessment-plan-item{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--f100);font-size:12px}
.assessment-plan-item:last-child{border-bottom:none}
.assessment-plan-item .num{width:18px;height:18px;border-radius:50%;background:var(--s100);color:var(--s700);font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}

/* LEARNING */
.learning-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:900px){.learning-grid{grid-template-columns:1fr}}
.learning-card{background:var(--w);border:1.5px solid var(--f200);border-radius:var(--r-lg);overflow:hidden}
.learning-header{padding:14px 18px;border-bottom:1px solid var(--f200);font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;background:var(--s50)}
.learning-body{padding:16px 18px}
.learning-stat{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--f100)}
.learning-stat:last-child{border-bottom:none}
.learning-stat-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.learning-stat-icon.green{background:var(--green-bg)}
.learning-stat-icon.blue{background:var(--blue-bg)}
.learning-stat-icon.purple{background:var(--purple-bg)}
.learning-stat-icon.amber{background:var(--amber-bg)}
.learning-stat-label{font-size:11px;font-weight:600;flex:1}
.learning-stat-value{font-size:14px;font-weight:800}
.learning-insight{background:var(--s50);border:1px solid var(--s200);border-radius:var(--r-sm);padding:12px;margin-bottom:8px}
.learning-insight:last-child{margin-bottom:0}
.learning-insight-title{font-size:11px;font-weight:700;color:var(--s700);margin-bottom:4px}
.learning-insight-text{font-size:11px;color:var(--f500);line-height:1.6}
.learning-insight-meta{font-size:9px;color:var(--f400);margin-top:4px}

/* ENHANCED EVIDENCE */
.evidence-canvas{position:relative;background:var(--w);border:1.5px solid var(--f200);border-radius:var(--r);padding:24px;margin-bottom:16px;min-height:300px}
.evidence-node{position:absolute;padding:8px 14px;border-radius:var(--r-sm);font-size:10px;font-weight:600;text-align:center;min-width:80px;cursor:pointer;transition:all .15s;box-shadow:var(--sh)}
.evidence-node:hover{transform:scale(1.08);z-index:10}
.evidence-node.symptom{background:var(--amber-bg);color:var(--amber-t);border:2px solid var(--amber)}
.evidence-node.sign{background:var(--s50);color:var(--s700);border:2px solid var(--s300)}
.evidence-node.lab{background:var(--purple-bg);color:var(--purple-t);border:2px solid var(--purple)}
.evidence-node.diagnosis{background:var(--green-bg);color:var(--green-t);border:2px solid var(--green)}
.evidence-line{position:absolute;height:2px;background:var(--f200);transform-origin:0 50%}
.evidence-line.support{background:var(--green)}
.evidence-line.against{background:var(--red);border-top:2px dashed var(--red)}
.evidence-legend{display:flex;gap:16px;padding:12px 18px;flex-wrap:wrap}
.evidence-legend-item{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--f500)}
.evidence-legend-dot{width:12px;height:12px;border-radius:4px}
.evidence-legend-dot.symptom{background:var(--amber)}
.evidence-legend-dot.sign{background:var(--s300)}
.evidence-legend-dot.lab{background:var(--purple)}
.evidence-legend-dot.diagnosis{background:var(--green)}

/* ANALYTICS GRID */
.analytics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.analytic-card{border:1px solid var(--f200);border-radius:var(--r);padding:16px;text-align:center;background:var(--w)}
.analytic-num{font-size:28px;font-weight:800;color:var(--s700)}
.analytic-label{font-size:10px;color:var(--f500);margin-top:4px;text-transform:uppercase;letter-spacing:.3px;font-weight:600}
`;

const encounterTimeline = [
  { time: "08:01", event: "Patient Arrived", detail: "Walked into A&E, triaged immediately", type: "data" },
  { time: "08:05", event: "Vitals Recorded", detail: "BP 90/60, HR 110, Temp 39.2°C, RR 24, SpO₂ 96%", type: "data" },
  { time: "08:08", event: "History Captured", detail: "3 days fever, chills, headache, vomiting. No convulsions.", type: "data" },
  { time: "08:25", event: "Examination Complete", detail: "Pallor ++, tender epigastrium, delayed capillary refill >3s", type: "data" },
  { time: "08:40", event: "Investigations Ordered", detail: "CBC, mRDT, Blood Culture, LFT, U&E", type: "data" },
  { time: "09:30", event: "Evidence Graph Updated", detail: "Hb 6.8 g/dL → Severe anemia flagged", type: "intel" },
  { time: "09:45", event: "Clinical Reasoning", detail: "Fever + Anemia + Malaria RDT+ → Severe Malaria (confidence 94%)", type: "intel" },
  { time: "09:47", event: "Diagnosis Established", detail: "Severe Malaria (P. falciparum) with Severe Anemia", type: "intel" },
  { time: "09:49", event: "Artesunate 2.4mg/kg IV", detail: "Stat dose administered per WHO Severe Malaria guideline", type: "med" },
  { time: "10:15", event: "Blood Transfusion Started", detail: "1 unit PRBC, crossmatch compatible", type: "med" },
  { time: "14:00", event: "Fever Resolved", detail: "Temperature 37.1°C, HR 88", type: "data" },
  { time: "Day 2", event: "Oral Intake Resumed", detail: "Tolerating sips, then full oral diet", type: "data" },
  { time: "Day 3", event: "Hb Improving", detail: "8.2 → 9.1 g/dL", type: "intel" },
  { time: "Day 4", event: "Discharge Criteria Met", detail: "Afebrile 48h, eating, Hb 9.8, malaria smear negative", type: "intel" },
];

const activeProblems = [
  { name: "Severe Malaria", status: "active", detail: "P. falciparum, Day 2 of Artesunate", goals: "Complete 7-day course, clear parasitemia" },
  { name: "Severe Anemia", status: "active", detail: "Hb 6.8 → 8.2, transfusion ongoing", goals: "Hb >10 g/dL before discharge" },
  { name: "Poor Feeding", status: "active", detail: "Tolerating sips", goals: "Full oral diet" },
  { name: "Dehydration", status: "resolved", detail: "Resolved Day 2 after rehydration", goals: "—" },
];

const examFindings = [
  { system: "General", findings: [
    { finding: "Appearance", value: "Ill-looking, lethargic" },
    { finding: "Pallor", value: "Conjunctival pallor ++", abnormal: true },
    { finding: "Jaundice", value: "Scleral icterus +" },
    { finding: "Hydration", value: "Dry mucous membranes, slow CRT" },
  ]},
  { system: "Vital Signs", findings: [
    { finding: "Temperature", value: "39.2°C" },
    { finding: "Heart Rate", value: "110 bpm" },
    { finding: "Blood Pressure", value: "90/60 mmHg", abnormal: true },
    { finding: "Respiratory Rate", value: "24/min" },
    { finding: "SpO₂", value: "96% room air" },
  ]},
  { system: "Abdomen", findings: [
    { finding: "Tenderness", value: "Mild epigastric tenderness" },
    { finding: "Liver", value: "Palpable 2cm below costal margin" },
    { finding: "Spleen", value: "Not palpable" },
    { finding: "Bowel Sounds", value: "Normal" },
  ]},
  { system: "CNS", findings: [
    { finding: "GCS", value: "15/15" },
    { finding: "Pupils", value: "Equal and reactive" },
    { finding: "Motor", value: "Normal tone and power" },
  ]},
];

const labResults = [
  { test: "Hemoglobin", value: "8.2", unit: "g/dL", ref: "12.0-16.0", flag: "low", trend: "↑ 6.8→8.2" },
  { test: "WBC", value: "11.2", unit: "×10⁹/L", ref: "4.0-11.0", flag: "high" },
  { test: "Platelets", value: "98", unit: "×10⁹/L", ref: "150-400", flag: "low" },
  { test: "mRDT", value: "Positive", unit: "", ref: "Negative", flag: "high", trend: "P. falciparum" },
  { test: "Blood Culture", value: "No growth", unit: "", ref: "—", flag: "", trend: "48h pending" },
  { test: "Creatinine", value: "0.9", unit: "mg/dL", ref: "0.6-1.2", flag: "" },
  { test: "ALT", value: "45", unit: "U/L", ref: "10-40", flag: "high" },
  { test: "Glucose", value: "4.8", unit: "mmol/L", ref: "3.5-6.0", flag: "" },
];

const medsData = [
  { name: "IV Artesunate 2.4mg/kg", route: "IV", freq: "Stat, then 12 hourly", start: "Day 1", status: "active" },
  { name: "IV Ceftriaxone 1g", route: "IV", freq: "BD", start: "Day 1", status: "active" },
  { name: "IV Normal Saline", route: "IV", freq: "125 mL/hr", start: "Day 1", status: "active" },
  { name: "Paracetamol 500mg", route: "PO", freq: "PRN if temp >38.5°C", start: "Day 1", status: "pending" },
  { name: "Oral Amoxicillin", route: "PO", freq: "TDS", start: "Day 4 (planned)", status: "pending" },
];

const monitoringData = [
  { problem: "Severe Malaria", params: [
    { label: "Parasitemia", value: "Clearing" },
    { label: "Temperature 6hrly", value: "37.1°C" },
    { label: "Hb Trend", value: "6.8 → 8.2 → 9.1" },
    { label: "Artusenate doses given", value: "3 of 7" },
  ]},
  { problem: "Anemia", params: [
    { label: "Hb Level", value: "8.2 g/dL" },
    { label: "Bleeding Obs", value: "None detected" },
    { label: "Transfusion Status", value: "In progress" },
    { label: "Pallor Assessment", value: "Improving" },
  ]},
  { problem: "Fluid Balance", params: [
    { label: "Urine Output", value: "1.2 mL/kg/hr" },
    { label: "Total Intake 24h", value: "1800 mL" },
    { label: "Total Output 24h", value: "1420 mL" },
    { label: "CRT", value: "<2 seconds" },
  ]},
];

const documentsData = [
  { name: "Admission Note", date: "Day 1, 08:30", status: "signed", icon: <FileText size={20} /> },
  { name: "Ward Round Note 1", date: "Day 1, 10:00", status: "signed", icon: <PenSquare size={20} /> },
  { name: "Ward Round Note 2", date: "Day 2, 09:00", status: "signed", icon: <PenSquare size={20} /> },
  { name: "Blood Transfusion Record", date: "Day 1, 10:15", status: "signed", icon: <Droplets size={20} /> },
  { name: "Progress Note", date: "Day 3, 08:00", status: "signed", icon: <ClipboardList size={20} /> },
  { name: "Nursing Handover", date: "Day 3, 07:00", status: "signed", icon: <Stethoscope size={20} /> },
  { name: "Discharge Summary", date: "In progress", status: "draft", icon: <FileText size={20} /> },
];

const assessmentData = [
  { problem: "Severe Malaria (P. falciparum)", subjective: "Patient reports feeling better today. No new fever since yesterday. Headache resolved. Appetite returning.", objective: "Temp 37.1°C, HR 88, BP 110/70. Pallor improving. No jaundice. Liver span 12cm, spleen tip palpable. No petechiae.", assessment: "Responding to IV Artesunate. Parasite clearance ongoing. Hemodynamic status stable. No signs of severe disease complications.", plan: "Continue IV Artesunate (dose 3/7 due 10:30). Monitor parasitemia. Step-down to oral when tolerating full diet." },
  { problem: "Severe Anemia (Hb 6.8)", subjective: "Patient less fatigued today. No shortness of breath at rest. Feeling stronger.", objective: "Hb 8.2 (post-transfusion). Conjunctival pallor improved. CRT <2s. Pulse 88, normotensive.", assessment: "Transfusion effective. Hb rising appropriately. No transfusion reaction. Continue monitoring.", plan: "Complete PRBC transfusion (ongoing). Repeat Hb in 24h. Start oral ferrous sulfate once tolerating full feeds." },
  { problem: "Dehydration", subjective: "Patient tolerating oral fluids well. No further vomiting.", objective: "Urine output 1.2 mL/kg/hr. Mucous membranes moist. Skin turgor normal. CRT <2s.", assessment: "Resolved. IV fluids can be stepped down.", plan: "Discontinue IV fluids once tolerating >50% oral needs. Continue strict I/O chart 24h." },
];

const learningData = {
  encounter: { id: "ENC-2026-0715-0342", age: 28, sex: "F", los_days: 4, outcome: "Improving" },
  diagnoses: [
    { name: "Severe Malaria", icd: "B50.8", certainty: 94, evidence_count: 7 },
    { name: "Severe Anemia", icd: "D64.8", certainty: 100, evidence_count: 4 },
    { name: "Dehydration", icd: "E86.0", certainty: 90, evidence_count: 3 },
  ],
  key_findings: [
    { finding: "Fever >39°C + mRDT+ → Severe Malaria", strength: "strong", type: "diagnostic" },
    { finding: "Hb 6.8 + Pallor + Tachycardia → Severe Anemia", strength: "strong", type: "diagnostic" },
    { finding: "Vomiting + Reduced intake + Slow CRT → Dehydration", strength: "moderate", type: "diagnostic" },
    { finding: "IV Artesunate → Fever resolution within 24h", strength: "strong", type: "treatment" },
    { finding: "PRBC Transfusion → Hb rise 1.4 g/dL in 4h", strength: "moderate", type: "treatment" },
  ],
  summary: "A 28F from endemic area presented with severe malaria + severe anemia. Treated with IV Artesunate + PRBC transfusion. Responding well. Key learning: Early transfusion in malaria with Hb <7 improves outcomes. IV Artesunate rapidly controls parasitemia.",
  patterns: [
    { pattern: "Fever + Anemia in endemic zone → Rule out malaria with mRDT + Blood film", frequency: "High", evidence: "WHO Malaria Guidelines 2023" },
    { pattern: "Hb <7 in malaria → Transfuse regardless of clinical status", frequency: "Moderate", evidence: "WHO Severe Malaria Criteria" },
  ],
};

const evidenceNodes = [
  { id: "fever", label: "Fever 39.2°C", type: "symptom", x: 5, y: 35 },
  { id: "chills", label: "Chills & Rigors", type: "symptom", x: 22, y: 10 },
  { id: "headache", label: "Headache", type: "symptom", x: 38, y: 5 },
  { id: "vomiting", label: "Vomiting", type: "symptom", x: 5, y: 65 },
  { id: "pallor", label: "Pallor ++", type: "sign", x: 35, y: 80 },
  { id: "slow_crt", label: "Slow CRT >3s", type: "sign", x: 55, y: 75 },
  { id: "hypotension", label: "Hypotension 90/60", type: "sign", x: 68, y: 50 },
  { id: "hb68", label: "Hb 6.8 g/dL", type: "lab", x: 48, y: 30 },
  { id: "rdt", label: "mRDT Positive", type: "lab", x: 25, y: 48 },
  { id: "thrombo", label: "Thrombocytopenia", type: "lab", x: 62, y: 12 },
  { id: "severe_malaria", label: "Severe Malaria", type: "diagnosis", x: 80, y: 25 },
  { id: "severe_anemia", label: "Severe Anemia", type: "diagnosis", x: 78, y: 65 },
];

const evidenceConnections = [
  { from: "fever", to: "rdt", style: "support" },
  { from: "chills", to: "rdt", style: "support" },
  { from: "headache", to: "rdt", style: "support" },
  { from: "vomiting", to: "rdt", style: "support" },
  { from: "fever", to: "severe_malaria", style: "support" },
  { from: "chills", to: "severe_malaria", style: "support" },
  { from: "rdt", to: "severe_malaria", style: "support" },
  { from: "hb68", to: "severe_anemia", style: "support" },
  { from: "pallor", to: "severe_anemia", style: "support" },
  { from: "slow_crt", to: "severe_anemia", style: "support" },
  { from: "pallor", to: "severe_malaria", style: "support" },
  { from: "hb68", to: "severe_malaria", style: "support" },
  { from: "thrombo", to: "severe_malaria", style: "support" },
  { from: "hypotension", to: "severe_malaria", style: "support" },
];

export default function CosPatientPortal() {
  const [section, setSection] = useState("summary");

  const navSections = [
    { group: "ENCOUNTER", items: [
      { id: "summary", label: "Summary", icon: <BarChart3 size={12} /> },
      { id: "timeline", label: "Timeline", icon: <Clock size={12} /> },
      { id: "problems", label: "Problems", icon: <Target size={12} /> },
    ]},
    { group: "DATA CAPTURE", items: [
      { id: "history", label: "History", icon: <BookOpen size={12} /> },
      { id: "examination", label: "Examination", icon: <Search size={12} /> },
      { id: "investigations", label: "Investigations", icon: <FlaskConical size={12} /> },
    ]},
    { group: "INTELLIGENCE", items: [
      { id: "evidence", label: "Evidence Graph", icon: <Link size={12} /> },
      { id: "reasoning", label: "Clinical Reasoning", icon: <Brain size={12} /> },
      { id: "diagnosis", label: "Diagnosis", icon: <Target size={12} /> },
      { id: "assessment", label: "Assessment", icon: <ClipboardList size={12} /> },
    ]},
    { group: "MANAGEMENT", items: [
      { id: "orders", label: "Orders", icon: <PenSquare size={12} /> },
      { id: "medications", label: "Medications", icon: <Pill size={12} /> },
      { id: "monitoring", label: "Monitoring", icon: <Radio size={12} /> },
    ]},
    { group: "OUTPUT", items: [
      { id: "disposition", label: "Disposition", icon: <DoorOpen size={12} /> },
      { id: "followup", label: "Follow-Up", icon: <Calendar size={12} /> },
      { id: "learning", label: "Learning", icon: <Dna size={12} /> },
      { id: "documents", label: "Documents", icon: <FileText size={12} /> },
      { id: "analytics", label: "Analytics", icon: <TrendingUp size={12} /> },
    ]},
  ];

  const renderSection = () => {
    switch (section) {
      case "summary":
        return (
          <div className="summary-grid">
            <div className="summary-card highlight full">
              <div className="summary-label"><ClipboardList size={13} className="inline-block" /> Today's Clinical Summary</div>
              <div className="summary-text">
                Grace M., 28F, admitted Day 1 with Severe Malaria (P. falciparum) and Severe Anemia (Hb 6.8).
                Overnight improvement — fever resolved (37.1°C), eating tolerated. Transfusion ongoing (1 unit PRBC).
                Plan: complete Artesunate course, repeat Hb in AM, discharge likely Day 4 if afebrile.
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><Target size={13} className="inline-block" /> Active Problems</div>
              {activeProblems.filter(p => p.status === "active").map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 11 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: "var(--f500)", fontSize: 10, marginLeft: "auto" }}>{p.detail}</span>
                </div>
              ))}
            </div>
            <div className="summary-card">
              <div className="summary-label"><Thermometer size={13} className="inline-block" /> Latest Vitals</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[["Temp", "37.1°C", "var(--green)"], ["HR", "88 bpm", "var(--green)"], ["BP", "110/70", "var(--green)"], ["RR", "18/min", "var(--green)"], ["SpO₂", "97%", "var(--green)"], ["Hb", "8.2 g/dL", "var(--amber)"]].map((v, i) => (
                  <div key={i} style={{ padding: 8, border: "1px solid var(--f200)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "var(--f500)", textTransform: "uppercase" }}>{v[0]}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: v[2] }}>{v[1]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-card full" style={{ background: "var(--s50)", borderColor: "var(--s200)" }}>
              <div className="summary-label" style={{ color: "var(--s600)" }}><ClipboardList size={13} className="inline-block" /> Current Plan</div>
              <div className="summary-text" style={{ fontSize: 11 }}>
                ✓ Continue IV Artesunate 2.4mg/kg 12hrly (7 doses)<br />
                ✓ Complete blood transfusion (1 unit PRBC)<br />
                ✓ Strict I/O chart — monitor urine output<br />
                ✓ Vital signs 4hrly<br />
                ✓ Repeat Hb at 24h post-transfusion<br />
                ✓ Monitor for bleeding, transfusion reaction<br />
                <Clock size={11} className="inline-block" /> Step-down to oral when tolerating full diet<br />
                <Clock size={11} className="inline-block" /> Consider discharge Day 4 if afebrile 48h
              </div>
            </div>
          </div>
        );

      case "timeline":
        return (
          <div className="timeline-view">
            {encounterTimeline.map((t, i) => (
              <div key={i} className={`tl-item ${t.type}`}>
                <div className="tl-time">{t.time}</div>
                <div className="tl-event">{t.event}</div>
                <div className="tl-detail">{t.detail}</div>
              </div>
            ))}
          </div>
        );

      case "problems":
        return (
          <div>
            <div className="pp-section-title"><Target size={13} className="inline-block" /> Problem-Oriented Medical Record</div>
            {activeProblems.map((p, i) => (
              <div key={i} className="problem-item">
                <span className={`problem-dot ${p.status}`} />
                <div className="problem-info">
                  <div className="problem-name">{p.name}</div>
                  <div className="problem-meta">{p.detail}</div>
                  {p.goals !== "—" && <div className="problem-goals">Goal: {p.goals}</div>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: p.status === "active" ? "var(--amber-bg)" : "var(--green-bg)", color: p.status === "active" ? "var(--amber-t)" : "var(--green-t)" }}>
                  {p.status === "active" ? "Active" : "Resolved ✓"}
                </span>
              </div>
            ))}
          </div>
        );

      case "history":
        return (
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label"><User size={11} /> Chief Complaint</div>
              <div className="summary-text">Fever for 3 days, chills, headache, vomiting</div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><Clock size={13} className="inline-block" /> History of Presenting Illness</div>
              <div className="summary-text">Previously well. 3 days ago developed high-grade fever (39.2°C), associated with chills and rigors. Headache generalized, non-throbbing. Vomiting ×3 episodes, non-projectile. No convulsions. No cough, no diarrhea. No urinary symptoms. Had taken paracetamol with minimal relief.</div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><Stethoscope size={13} className="inline-block" /> Past Medical History</div>
              <div className="summary-text">No known chronic illnesses. No previous hospitalizations. No surgeries. No known drug allergies. Immunizations up to date.</div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><Home size={11} /> Social History</div>
              <div className="summary-text">Lives in malaria-endemic area. Works as teacher. No smoking, no alcohol. Lives with husband and 2 children.</div>
            </div>
          </div>
        );

      case "examination":
        return (
          <div className="exam-grid">
            {examFindings.map((sys, i) => (
              <div key={i} className="exam-card">
                <div className="exam-card-title">{sys.system}</div>
                {sys.findings.map((f, j) => (
                  <div key={j} className="exam-finding">
                    <span className="finding">{f.finding}</span>
                    <span className={f.abnormal ? "abnormal" : "value"}>{f.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case "investigations":
        return (
          <div>
            <div className="pp-section-title"><FlaskConical size={13} className="inline-block" /> Laboratory Results</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Reference</th>
                  <th>Flag</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.test}</td>
                    <td className={r.flag === "low" ? "abnormal" : r.flag === "high" ? "abnormal" : ""}>{r.value}</td>
                    <td style={{ color: "var(--f500)" }}>{r.unit}</td>
                    <td style={{ color: "var(--f500)" }}>{r.ref}</td>
                    <td>{r.flag && <span className={`flag ${r.flag}`}>{r.flag}</span>}</td>
                    <td style={{ color: "var(--s600)", fontSize: 10 }}>{r.trend || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "evidence":
        return (
          <div className="summary-grid">
            <div className="summary-card full highlight">
              <div className="summary-label"><Link size={13} className="inline-block" /> Evidence Graph — Finding → Diagnosis Connections</div>
              <div className="evidence-canvas">
                {evidenceNodes.map(n => (
                  <div key={n.id} className={`evidence-node ${n.type}`}
                    style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)' }}>
                    {n.label}
                  </div>
                ))}
              </div>
              <div className="evidence-legend" style={{borderTop:'1px solid var(--f200)',marginTop:8,paddingTop:8}}>
                <div className="evidence-legend-item"><div className="evidence-legend-dot symptom" /> Finding (Symptom)</div>
                <div className="evidence-legend-item"><div className="evidence-legend-dot sign" /> Finding (Sign)</div>
                <div className="evidence-legend-item"><div className="evidence-legend-dot lab" /> Finding (Lab)</div>
                <div className="evidence-legend-item"><div className="evidence-legend-dot diagnosis" /> Diagnosis</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><BarChart3 size={13} className="inline-block" /> Evidence Summary by Diagnosis</div>
              {[
                { diag: "Severe Malaria", count: 7, findings: ["Fever 39.2°C", "Chills & Rigors", "Headache", "Vomiting", "mRDT+", "Hb 6.8", "Thrombocytopenia"] },
                { diag: "Severe Anemia", count: 4, findings: ["Hb 6.8", "Pallor ++", "Slow CRT >3s", "Hypotension"] },
                { diag: "Dehydration", count: 3, findings: ["Vomiting", "Slow CRT >3s", "Reduced intake"] },
              ].map((d,i)=>(
                <div key={i} style={{padding:'10px 0',borderBottom:i<2?'1px solid var(--f100)':'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:12}}>{d.diag}</span>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:4,background:'var(--s50)',color:'var(--s600)'}}>{d.count} findings</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {d.findings.map((f,fi)=>(
                      <span key={fi} style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:'var(--f100)',color:'var(--f500)'}}>{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "reasoning":
        return (
          <div className="summary-grid">
            <div className="summary-card full highlight">
              <div className="summary-label"><Brain size={13} className="inline-block" /> Clinical Reasoning — Diagnostic Trace</div>
              <div style={{marginTop:8}}>
                {[
                  { step: 1, icon: <Inbox size={12} />, title: "Data Acquisition", detail: "History (fever 3d, chills, headache, vomiting) + Exam (pallor, CRT>3s, hypotension 90/60)" },
                  { step: 2, icon: <FlaskConical size={12} />, title: "Test Ordering", detail: "mRDT → Positive (P. falciparum). CBC → Hb 6.8, Platelets 82. Blood culture → Pending." },
                  { step: 3, icon: <Link size={12} />, title: "Evidence Linking", detail: "Fever + mRDT+ → Malaria. Hb 6.8 + Pallor → Severe Anemia. Criteria check: Hb <7, prostration → Severe Malaria" },
                  { step: 4, icon: <BarChart3 size={12} />, title: "Differential Weighting", detail: "Severe Malaria (94%) >> Bacterial Sepsis (15%) >> Leukemia (2%). Key discriminator: mRDT+ in endemic zone." },
                  { step: 5, icon: <ClipboardList size={12} />, title: "Guideline Application", detail: "WHO Severe Malaria 2023: IV Artesunate + Transfuse Hb<7 + Monitor parasitemia" },
                ].map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:i<4?'1px solid var(--f100)':'none'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:'var(--s100)',color:'var(--s600)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:12}}>Step {s.step}: {s.title}</div>
                      <div style={{fontSize:11,color:'var(--f500)',marginTop:2}}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><BarChart3 size={13} className="inline-block" /> Differential Diagnosis — Weighted</div>
              <div style={{ marginTop: 8 }}>
                {[
                  { name: "Severe Malaria", pct: 94, color: "var(--green)" },
                  { name: "Bacterial Sepsis", pct: 15, color: "var(--amber)" },
                  { name: "Acute Leukemia", pct: 2, color: "var(--f400)" },
                ].map((d,i)=>(
                  <div key={i}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4,marginTop:i>0?8:0}}>
                      <span>{d.name}</span>
                      <span style={{fontWeight:800,color:d.color}}>{d.pct}%</span>
                    </div>
                    <div style={{height:8,background:'var(--f100)',borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${d.pct}%`,height:'100%',background:d.color,borderRadius:99}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><ClipboardList size={13} className="inline-block" /> Guideline Applied: WHO Severe Malaria 2023</div>
              <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6}}>
                {[
                  {rec:"IV Artesunate 2.4mg/kg IV at 0, 12, 24h then daily",status:"\u2713 Applied"},
                  {rec:"Transfuse if Hb <7 g/dL",status:"\u2713 Applied"},
                  {rec:"Monitor GCS, vitals, parasitemia q4h",status:"\u2713 Active"},
                  {rec:"Step-down to oral Artemether-Lumefantrine when tolerating",status:"Pending"},
                ].map((g,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:11,borderBottom:i<3?'1px solid var(--f100)':'none'}}>
                    <span style={{width:16,fontSize:10,color:g.status.includes('\u2713')?'var(--green)':'var(--amber)'}}>{g.status.includes('\u2713')?'\u2713':'\u23F3'}</span>
                    <span style={{flex:1}}>{g.rec}</span>
                    <span style={{fontSize:9,fontWeight:600,padding:'1px 6px',borderRadius:3,background:g.status.includes('\u2713')?'var(--green-bg)':'var(--amber-bg)',color:g.status.includes('\u2713')?'var(--green-t)':'var(--amber-t)'}}>{g.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "diagnosis":
        return (
          <div className="summary-grid">
            <div className="summary-card full highlight">
              <div className="summary-label"><Target size={13} className="inline-block" /> Primary Diagnosis</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 24 }}><Bug size={24} /></span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--s800)" }}>Severe Malaria (P. falciparum)</div>
                  <div style={{ fontSize: 11, color: "var(--f500)" }}>ICD-10: B50.8 · WHO Severe Malaria Criteria Met · Confirmed by mRDT+</div>
                </div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><ClipboardList size={13} className="inline-block" /> Associated Diagnoses</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {[
                  { name: "Severe Anemia", code: "D64.8", status: "Active" },
                  { name: "Thrombocytopenia", code: "D69.6", status: "Active" },
                  { name: "Acute Febrile Illness", code: "R50.9", status: "Resolved" },
                  { name: "Dehydration", code: "E86.0", status: "Resolved" },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", border: "1px solid var(--f200)", borderRadius: "var(--r-sm)", fontSize: 11 }}>
                    <span style={{ fontWeight: 600, flex: 1 }}>{d.name}</span>
                    <span style={{ color: "var(--f400)", fontSize: 9, fontFamily: "monospace" }}>{d.code}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: d.status === "Active" ? "var(--amber-bg)" : "var(--green-bg)", color: d.status === "Active" ? "var(--amber-t)" : "var(--green-t)" }}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "assessment":
        return (
          <div className="assessment-grid">
            <div className="summary-card full highlight" style={{marginBottom:4}}>
              <div className="summary-label"><ClipboardList size={13} className="inline-block" /> Problem-Oriented Assessment (SOAP)</div>
              <div style={{fontSize:11,color:'var(--f500)',marginTop:2}}>Each active problem has a Subjective, Objective, Assessment, and Plan entry</div>
            </div>
            {assessmentData.map((a, i) => (
              <div key={i} className="assessment-card">
                <div className="assessment-header">
                  <div className="assessment-title">{i+1}. {a.problem}</div>
                  <span style={{fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:4,background:'var(--green-bg)',color:'var(--green-t)'}}>Active</span>
                </div>
                <div className="assessment-body">
                  <div className="assessment-section">
                    <div className="assessment-section-label">S — Subjective</div>
                    <div className="assessment-text">{a.subjective}</div>
                  </div>
                  <div className="assessment-section">
                    <div className="assessment-section-label">O — Objective</div>
                    <div className="assessment-text">{a.objective}</div>
                  </div>
                  <div className="assessment-section">
                    <div className="assessment-section-label">A — Assessment</div>
                    <div className="assessment-text">{a.assessment}</div>
                  </div>
                  <div className="assessment-section">
                    <div className="assessment-section-label">P — Plan</div>
                    <div className="assessment-text">{a.plan}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "orders":
        return (
          <div>
            <div className="pp-section-title"><PenSquare size={13} className="inline-block" /> Universal Orders Engine — All Order Types</div>
            {[
              { category: "Medications", icon: <Pill size={13} />, items: medsData.filter(m => m.status === "active").map(m => ({ name: m.name, detail: `${m.route} · ${m.freq}`, status: m.status })) },
              { category: "Investigations", icon: <FlaskConical size={13} />, items: [
                { name: "Repeat Hb", detail: "24h post-transfusion", status: "pending" },
                { name: "Blood Culture (final)", detail: "48h incubation", status: "active" },
                { name: "Malaria Smear", detail: "Day 3 clearance check", status: "pending" },
              ]},
              { category: "Blood Products", icon: <Droplets size={13} />, items: [
                { name: "PRBC 1 unit", detail: "Crossmatch compatible, transfusing", status: "active" },
              ]},
              { category: "Imaging", icon: <Scan size={13} />, items: [
                { name: "Chest X-ray", detail: "Rule out pneumonia", status: "pending" },
              ]},
              { category: "Diet & Nursing", icon: <Apple size={13} />, items: [
                { name: "High-protein diet", detail: "As tolerated", status: "active" },
                { name: "Bed rest", detail: "Until Hb stable", status: "active" },
                { name: "Pressure area care", detail: "2hrly turns", status: "active" },
              ]},
              { category: "Monitoring", icon: <Radio size={13} />, items: [
                { name: "Hourly Vitals", detail: "BP/HR/Temp/RR", status: "active" },
                { name: "Strict I/O Chart", detail: "Urine output q4h", status: "active" },
                { name: "Bleeding Observations", detail: "4hrly", status: "active" },
              ]},
              { category: "Therapy & Review", icon: <RefreshCw size={13} />, items: [
                { name: "Physiotherapy review", detail: "Mobilise when stable", status: "pending" },
                { name: "Infectious Disease review", detail: "If no improvement 48h", status: "pending" },
              ]},
            ].map((group, gi) => (
              <div key={gi} className="orders-group">
                <div className="orders-group-title">{group.icon} {group.category}</div>
                {group.items.map((item, ii) => (
                  <div key={ii} className="order-row">
                    <span className="icon">{group.icon}</span>
                    <div className="info">
                      <div className="name">{item.name}</div>
                      <div className="detail">{"detail" in item ? item.detail : (item as any).route ? `${(item as any).route} · ${(item as any).freq}` : ""}</div>
                    </div>
                    <span className={`status ${item.status}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case "medications":
        return (
          <div>
            <div className="pp-section-title"><Pill size={13} className="inline-block" /> Medication Administration Record</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th>Started</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medsData.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.route}</td>
                    <td>{m.freq}</td>
                    <td style={{ color: "var(--f500)" }}>{m.start}</td>
                    <td>
                      <span className={`status ${m.status}`}
                        style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                          background: m.status === "active" ? "var(--blue-bg)" : m.status === "pending" ? "var(--amber-bg)" : "var(--green-bg)",
                          color: m.status === "active" ? "var(--blue-t)" : m.status === "pending" ? "var(--amber-t)" : "var(--green-t)" }}
                      >{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "monitoring":
        return (
          <div>
            <div className="pp-section-title"><Radio size={13} className="inline-block" /> Monitoring Engine — Problem-Based</div>
            <div className="monitor-grid">
              {monitoringData.map((m, i) => (
                <div key={i} className="monitor-card">
                  <div className="monitor-title"><Target size={13} className="inline-block" /> {m.problem}</div>
                  {m.params.map((p, j) => (
                    <div key={j} className="monitor-param">
                      <span className="monitor-label">{p.label}</span>
                      <span className="monitor-value good">{p.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case "learning":
        return (
          <div>
            <div className="pp-section-title"><Dna size={13} className="inline-block" /> Learning Engine — Knowledge Extraction</div>
            <div className="learning-grid" style={{marginTop:0}}>
              <div className="learning-card">
                <div className="learning-header"><BarChart3 size={13} /> Encounter as Knowledge</div>
                <div className="learning-body">
                  <div className="learning-stat">
                    <div className="learning-stat-icon blue"><Database size={16} /></div>
                    <div className="learning-stat-label">Encounter ID</div>
                    <div className="learning-stat-value" style={{fontFamily:'monospace',fontSize:11}}>{learningData.encounter.id}</div>
                  </div>
                  <div className="learning-stat">
                    <div className="learning-stat-icon blue"><Users size={16} /></div>
                    <div className="learning-stat-label">Patient Profile</div>
                    <div className="learning-stat-value">{learningData.encounter.age}{learningData.encounter.sex}</div>
                  </div>
                  <div className="learning-stat">
                    <div className="learning-stat-icon green"><DoorOpen size={16} /></div>
                    <div className="learning-stat-label">Length of Stay</div>
                    <div className="learning-stat-value">{learningData.encounter.los_days} days</div>
                  </div>
                  <div className="learning-stat">
                    <div className="learning-stat-icon amber"><Star size={16} /></div>
                    <div className="learning-stat-label">Outcome</div>
                    <div className="learning-stat-value" style={{color:'var(--green)'}}>{learningData.encounter.outcome}</div>
                  </div>
                </div>
              </div>
              <div className="learning-card">
                <div className="learning-header"><Search size={13} /> Key Diagnostic Patterns</div>
                <div className="learning-body">
                  {learningData.key_findings.map((kf, i) => (
                    <div key={i} className="learning-insight">
                      <div className="learning-insight-title">{kf.finding}</div>
                      <div className="learning-insight-text">Strength: <strong>{kf.strength}</strong> \u00B7 Type: {kf.type}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="learning-card">
                <div className="learning-header"><Brain size={13} /> Reusable Clinical Patterns</div>
                <div className="learning-body">
                  {learningData.patterns.map((p, i) => (
                    <div key={i} className="learning-insight" style={{background:'var(--w)',borderColor:'var(--f200)'}}>
                      <div className="learning-insight-title"><Lightbulb size={13} /> {p.pattern}</div>
                      <div className="learning-insight-text">Frequency: <strong>{p.frequency}</strong> \u00B7 Source: {p.evidence}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="learning-card">
                <div className="learning-header"><PenSquare size={13} /> Clinical Summary for Knowledge Base</div>
                <div className="learning-body">
                  <div className="learning-insight" style={{background:'var(--s50)',borderColor:'var(--s200)'}}>
                    <div className="learning-insight-text">{learningData.summary}</div>
                    <div className="learning-insight-meta">This encounter contributes to the AMEXAN Knowledge Graph. All PII is stripped. Patterns are extracted for future clinical decision support.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "documents":
        return (
          <div>
            <div className="pp-section-title"><FileText size={13} className="inline-block" /> Documentation Engine</div>
            <div className="doc-list">
              {documentsData.map((d, i) => (
                <div key={i} className="doc-item">
                  <span className="doc-icon">{d.icon}</span>
                  <div className="doc-info">
                    <div className="doc-name">{d.name}</div>
                    <div className="doc-date">{d.date}</div>
                  </div>
                  <span className={`doc-status ${d.status}`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "disposition":
        return (
          <div className="summary-grid">
            <div className="summary-card full highlight">
              <div className="summary-label"><DoorOpen size={13} className="inline-block" /> Disposition Planning</div>
              <div style={{marginTop:4}}>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--f100)'}}>
                  <span style={{fontSize:20}}><Building2 size={20} /></span>
                  <div><div style={{fontWeight:700}}>Current Status: Inpatient — Male Medical Ward</div><div style={{fontSize:11,color:'var(--f500)'}}>Bed 3 · Day 4 of planned 4-day stay</div></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--f100)'}}>
                  <span style={{fontSize:20}}><CheckCircle size={20} /></span>
                  <div><div style={{fontWeight:700}}>Discharge Criteria</div>
                    <div style={{fontSize:11,color:'var(--f500)',marginTop:2}}>
                      ✓ Afebrile 48h · ✓ Eating well · ✓ Hb stable (9.8) · ✓ Malaria smear negative<br />
                      ✓ Completed Artesunate course · ✓ Oral antibiotics tolerated
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0'}}>
                  <span style={{fontSize:20}}><ClipboardList size={20} /></span>
                  <div><div style={{fontWeight:700}}>Discharge Plan</div>
                    <div style={{fontSize:11,color:'var(--f500)',marginTop:2}}>
                      <strong>Destination:</strong> Home · <strong>Mode:</strong> Self-discharge · <strong>Timing:</strong> Tomorrow AM (Day 4)<br />
                      <strong>Medications on Discharge:</strong> Oral Amoxicillin 500mg TDS × 5 days, Oral Artesunate if indicated<br />
                      <strong>Instructions:</strong> Return if fever recurs, complete antibiotics, follow-up in 1 week
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><FileText size={13} className="inline-block" /> Documents for Discharge</div>
              <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:6}}>
                {[
                  {name:'Discharge Summary',status:'Draft'},
                  {name:'Medication Sheet',status:'Ready'},
                  {name:'Follow-Up Appointment',status:'Pending'},
                  {name:'Sick Leave Certificate',status:'Not started'},
                ].map((d,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',border:'1px solid var(--f200)',borderRadius:'var(--r-sm)',fontSize:11}}>
                    <span style={{fontWeight:600,flex:1}}>{d.name}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:3,
                      background:d.status==='Ready'?'var(--green-bg)':d.status==='Draft'?'var(--amber-bg)':'var(--f100)',
                      color:d.status==='Ready'?'var(--green-t)':d.status==='Draft'?'var(--amber-t)':'var(--f500)'}}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label">🔄 Transfer Options</div>
              <div style={{marginTop:6,fontSize:11}}>
                <div style={{padding:'6px 0',borderBottom:'1px solid var(--f100)'}}>◉ <strong>Home</strong> — Discharge planning in progress</div>
                <div style={{padding:'6px 0',borderBottom:'1px solid var(--f100)'}}>○ Step-down ward — Not indicated</div>
                <div style={{padding:'6px 0',borderBottom:'1px solid var(--f100)'}}>○ ICU — Not indicated</div>
                <div style={{padding:'6px 0'}}>○ Referral — Not indicated</div>
              </div>
            </div>
          </div>
        );

      case "followup":
        return (
          <div className="summary-grid">
            <div className="summary-card full highlight">
              <div className="summary-label"><Calendar size={13} className="inline-block" /> Follow-Up Plan</div>
              <div style={{marginTop:8}}>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--f100)'}}>
                  <span style={{fontSize:20}}><Calendar size={20} /></span>
                  <div><div style={{fontWeight:700}}>Review Appointment</div>
                    <div style={{fontSize:11,color:'var(--f500)'}}>Date: Day 11 (7 days post-discharge) · Clinic: Medical Outpatient · Provider: Dr. Kamau</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--f100)'}}>
                  <span style={{fontSize:20}}><FlaskConical size={20} /></span>
                  <div><div style={{fontWeight:700}}>Pending Investigations at Follow-Up</div>
                    <div style={{fontSize:11,color:'var(--f500)'}}>Repeat Hb · Malaria smear · Blood culture (final result)</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--f100)'}}>
                  <span style={{fontSize:20}}><Pill size={20} /></span>
                  <div><div style={{fontWeight:700}}>Medication Adherence Monitoring</div>
                    <div style={{fontSize:11,color:'var(--f500)'}}>Oral Amoxicillin 500mg TDS × 5 days — Complete course</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0'}}>
                  <span style={{fontSize:20}}><AlertTriangle size={20} /></span>
                  <div><div style={{fontWeight:700}}>Red Flags — Return Immediately If</div>
                    <div style={{fontSize:11,color:'var(--red)',marginTop:2}}>Fever recurs · Bleeding · Severe headache · Pallor · Difficulty breathing</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-label"><ClipboardList size={13} className="inline-block" /> Post-Discharge Checklist</div>
              <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:6,fontSize:11}}>
                {[
                  {label:'Complete antibiotics course',done:false},
                  {label:'Attend follow-up appointment Day 11',done:false},
                  {label:'Monitor for fever with thermometer',done:false},
                  {label:'High-protein diet for Hb recovery',done:false},
                  {label:'Rest for 1 week before returning to work',done:false},
                  {label:'Bring discharge summary to follow-up',done:false},
                ].map((c,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--f100)'}}>
                    <span style={{width:16,height:16,borderRadius:4,border:'2px solid var(--s300)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:c.done?'var(--green)':'transparent',cursor:'pointer'}}>{c.done ? '✓' : ''}</span>
                    <span style={{color:c.done?'var(--f400)':'#0f172a',textDecoration:c.done?'line-through':'none'}}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div>
            <div className="pp-section-title"><TrendingUp size={13} className="inline-block" /> Analytics Engine — Encounter & Population Intelligence</div>
            <div className="analytics-grid">
              {[
                { num: "4", label: "Length of Stay (days)", icon: <Calendar size={24} />, color: "blue" },
                { num: "2", label: "Active Diagnoses", icon: <Target size={24} />, color: "green" },
                { num: "3", label: "Active Orders", icon: <PenSquare size={24} />, color: "purple" },
                { num: "8", label: "Labs Collected", icon: <FlaskConical size={24} />, color: "amber" },
                { num: "7", label: "Documents Generated", icon: <FileText size={24} />, color: "blue" },
                { num: "8", label: "Vital Signs Sets", icon: <Thermometer size={24} />, color: "green" },
              ].map((a, i) => (
                <div key={i} className="analytic-card" style={a.color==='amber'?{background:'var(--s50)'}:{}}>
                  <div style={{fontSize:24,marginBottom:4}}>{a.icon}</div>
                  <div className="analytic-num">{a.num}</div>
                  <div className="analytic-label">{a.label}</div>
                </div>
              ))}
            </div>
            <div className="learning-grid" style={{marginTop:16}}>
              <div className="summary-card full">
                <div className="summary-label"><TrendingUp size={11} /> Cost & Resource Utilization</div>
                <div className="assessment-section">
                  <div className="assessment-section-label">Estimated Cost Breakdown</div>
                  <div style={{fontSize:12,lineHeight:2}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span>Accommodation (4 days)</span><span style={{fontWeight:700}}>$240</span></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span>IV Artesunate (7 doses)</span><span style={{fontWeight:700}}>$84</span></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span>PRBC 1 unit</span><span style={{fontWeight:700}}>$120</span></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span>Laboratory (CBC, mRDT, Culture, Smear)</span><span style={{fontWeight:700}}>$65</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid var(--f200)',paddingTop:4,color:'var(--s700)'}}><span style={{fontWeight:800}}>Total Estimated Cost</span><span style={{fontWeight:800}}>$509</span></div>
                  </div>
                </div>
              </div>
              <div className="summary-card full">
                <div className="summary-label"><BarChart3 size={11} /> Outcome Metrics</div>
                <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:4}}>
                  {[
                    { label: "Time to Diagnosis", value: "2h 15m", detail: "From triage to definitive diagnosis", trend: "\u25BC faster than avg" },
                    { label: "Time to Treatment", value: "45m", detail: "From diagnosis to first Artesunate dose", trend: "\u25BC faster than avg" },
                    { label: "Transfusion Response", value: "+1.4 g/dL", detail: "Hb rise 4h post-transfusion", trend: "\u25B2 within expected" },
                    { label: "Fever Clearance", value: "14h", detail: "Time to defervescence <37.5°C", trend: "\u25BC faster than avg" },
                  ].map((om,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:i<3?'1px solid var(--f100)':'none'}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600}}>{om.label}</div>
                        <div style={{fontSize:10,color:'var(--f500)'}}>{om.detail}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:16,fontWeight:800,color:'var(--s700)'}}>{om.value}</div>
                        <div style={{fontSize:9,color:om.trend.includes('\u25BC')?'var(--green)':'var(--amber)'}}>{om.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Top Bar */}
      <header className="pp-top">
        <div className="pp-left">
          <a href="/dashboard/cos-doctor" className="pp-back">←</a>
          <div className="pp-brand">AMEXAN <span>Portal</span></div>
        </div>
        <div className="pp-right">
          <button className="pp-btn outline"><Bell size={12} /> Alerts</button>
          <button className="pp-btn primary"><PenSquare size={13} className="inline-block" /> Write Note</button>
          <button className="pp-btn outline" onClick={() => window.history.back()}>Close</button>
        </div>
      </header>

      {/* Patient Banner */}
      <div className="pp-banner">
        <div className="pp-banner-left">
          <div className="pp-avatar">G</div>
          <div>
            <div className="pp-patient-name">Grace M.</div>
            <div className="pp-patient-meta">
              <span><User size={11} /> 28F</span>
              <span><Bed size={11} /> Bed 3 · Male Medical Ward</span>
              <span><Calendar size={13} className="inline-block" /> Admitted Day 1 (3 days ago)</span>
              <span className="pp-encounter-id">ENC-2026-0715-0342</span>
            </div>
          </div>
        </div>
        <div className="pp-banner-right">
          <span className="pp-status-pill inpatient">Inpatient</span>
          <span className="pp-status-pill improving">Improving</span>
        </div>
      </div>

      {/* Body */}
      <div className="pp-body">
        {/* Sidebar Navigation — Constitutional */}
        <nav className="pp-sidebar">
          {navSections.map((group, gi) => (
            <div key={gi}>
              <div className="pp-nav-section">{group.group}</div>
              {group.items.map(item => (
                <button key={item.id}
                  className={`pp-nav-item ${section === item.id ? "active" : ""}`}
                  onClick={() => setSection(item.id)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Main Content */}
        <main className="pp-main">
          <div className="pp-content">
            <div className="pp-section-title" style={{ borderBottom: "none", marginBottom: 16 }}>
              {navSections.flatMap(g => g.items).find(i => i.id === section)?.icon}{" "}
              {navSections.flatMap(g => g.items).find(i => i.id === section)?.label}
            </div>
            {renderSection()}
          </div>
        </main>
      </div>
    </>
  );
}
