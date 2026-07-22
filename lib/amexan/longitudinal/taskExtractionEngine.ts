// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN To-Do Extraction Engine
// ═══════════════════════════════════════════════════════════════════════════════
// Reads the clinical plan and automatically creates cross-disciplinary tasks.
// Nobody manually creates tasks.
// ═══════════════════════════════════════════════════════════════════════════════

import type { ToDoTask, TaskCategory, TaskPriority } from './types';
import type { ManagementItem, MedicationCard } from '../encounter/encounterState';

// ── Keyword-based task extraction rules ───────────────────────────────────────

interface ExtractionRule {
  keywords: RegExp[];
  category: TaskCategory;
  priority: TaskPriority;
  defaultDescription: string;
  assignTo?: string;
}

const EXTRACTION_RULES: ExtractionRule[] = [
  // Lab
  { keywords: [/cbc/i, /full blood count/i, /fbc/i, /complete blood/i], category: 'lab', priority: 'today', defaultDescription: 'Complete blood count', assignTo: 'lab' },
  { keywords: [/chem/i, /ue/i, /e&c/i, /electrolyte/i, /creatinine/i, /renal/i], category: 'lab', priority: 'today', defaultDescription: 'Chemistry panel', assignTo: 'lab' },
  { keywords: [/lft/i, /liver/i, /hepatic/i], category: 'lab', priority: 'today', defaultDescription: 'Liver function tests', assignTo: 'lab' },
  { keywords: [/blood culture/i, /cultures?/i], category: 'lab', priority: 'urgent', defaultDescription: 'Blood cultures', assignTo: 'lab' },
  { keywords: [/blood gas/i, /abg/i, /vbg/i], category: 'lab', priority: 'urgent', defaultDescription: 'Blood gas analysis', assignTo: 'lab' },
  { keywords: [/trop/i, /troponin/i, /ck\-mb/i], category: 'lab', priority: 'urgent', defaultDescription: 'Cardiac enzymes', assignTo: 'lab' },
  { keywords: [/coag/i, /pt/i, /ptt/i, /inr/i], category: 'lab', priority: 'today', defaultDescription: 'Coagulation profile', assignTo: 'lab' },
  { keywords: [/crp/i, /esr/i, /inflammatory/i], category: 'lab', priority: 'today', defaultDescription: 'Inflammatory markers', assignTo: 'lab' },
  // Radiology
  { keywords: [/cxr/i, /chest x/i, /chest ray/i, /x.?ray chest/i], category: 'radiology', priority: 'today', defaultDescription: 'Chest X-ray', assignTo: 'radiology' },
  { keywords: [/ct/i, /cat scan/i, /ct scan/i], category: 'radiology', priority: 'today', defaultDescription: 'CT scan', assignTo: 'radiology' },
  { keywords: [/ultrasound/i, /usg/i, /echo/i, /echocardiogram/i], category: 'radiology', priority: 'today', defaultDescription: 'Ultrasound', assignTo: 'radiology' },
  { keywords: [/mri/i, /magnetic/i], category: 'radiology', priority: 'routine', defaultDescription: 'MRI', assignTo: 'radiology' },
  // Nursing
  { keywords: [/remove catheter/i, /remove foley/i, /remove line/i, /remove drain/i], category: 'nursing', priority: 'today', defaultDescription: 'Remove catheter/line', assignTo: 'nurse' },
  { keywords: [/catheter/i, /foley/i], category: 'nursing', priority: 'routine', defaultDescription: 'Catheter care', assignTo: 'nurse' },
  { keywords: [/vitals/i, /monitor/i, /observation/i, /chart/i], category: 'nursing', priority: 'routine', defaultDescription: 'Monitoring and observations', assignTo: 'nurse' },
  { keywords: [/fluid/i, /iv fluid/i, /hydration/i], category: 'nursing', priority: 'today', defaultDescription: 'IV fluids and monitoring', assignTo: 'nurse' },
  { keywords: [/turn/i, /pressure/i, /position/i, /mobilize/i], category: 'nursing', priority: 'today', defaultDescription: 'Positioning and pressure care', assignTo: 'nurse' },
  { keywords: [/wound/i, /dressing/i, /drain/i], category: 'nursing', priority: 'today', defaultDescription: 'Wound care and dressing', assignTo: 'nurse' },
  // Pharmacy
  { keywords: [/switch to oral/i, /iv to oral/i, /transition to oral/i], category: 'pharmacy', priority: 'urgent', defaultDescription: 'Prepare oral medication transition', assignTo: 'pharmacy' },
  { keywords: [/antibiotic/i, /abx/i, /antimicrobial/i], category: 'pharmacy', priority: 'today', defaultDescription: 'Prepare antibiotics', assignTo: 'pharmacy' },
  { keywords: [/review medication/i, /medication review/i, /reconcile/i], category: 'pharmacy', priority: 'today', defaultDescription: 'Medication review', assignTo: 'pharmacy' },
  // Physiotherapy
  { keywords: [/physio/i, /physiotherapy/i, /chest physio/i, /mobilize/i, /exercise/i], category: 'physiotherapy', priority: 'today', defaultDescription: 'Physiotherapy assessment', assignTo: 'physio' },
  // Doctor
  { keywords: [/review/i, /interpret/i, /read/i, /check/i], category: 'doctor', priority: 'today', defaultDescription: 'Review results', assignTo: 'doctor' },
  { keywords: [/ecg/i, /electrocardiogram/i], category: 'doctor', priority: 'urgent', defaultDescription: 'Review ECG', assignTo: 'doctor' },
  // Consult
  { keywords: [/consult/i, /refer/i, /referral/i, /opinion/i], category: 'consult', priority: 'today', defaultDescription: 'Consult/Referral', assignTo: 'consultant' },
  { keywords: [/surgery/i, /surgeon/i, /surgical review/i], category: 'consult', priority: 'today', defaultDescription: 'Surgical review', assignTo: 'surgery' },
  // Admin
  { keywords: [/discharge/i, /discharge plan/i, /discharge summary/i], category: 'admin', priority: 'routine', defaultDescription: 'Discharge planning', assignTo: 'admin' },
  { keywords: [/counselling/i, /counsel/i, /educat/i], category: 'admin', priority: 'routine', defaultDescription: 'Patient education', assignTo: 'doctor' },
];

// ── Extract tasks from a plan text / management items ─────────────────────────

export function extractTasks(
  planItems: ManagementItem[],
  planText?: string,
  existingTasks: ToDoTask[] = [],
): ToDoTask[] {
  const extracted: ToDoTask[] = [];
  const now = Date.now();
  const existingSet = new Set(existingTasks.map(t => t.description.toLowerCase()));

  // Extract from structured management items
  for (const item of planItems) {
    const textToMatch = `${item.description} ${item.detail}`;
    const alreadyExists = existingSet.has(item.description.toLowerCase());

    if (!alreadyExists) {
      const matched = matchRule(textToMatch);
      extracted.push({
        id: `task_${now}_${extracted.length}`,
        category: matched.category,
        description: item.description,
        detail: item.detail || matched.defaultDescription,
        priority: item.priority === 'stat' ? 'stat' : item.priority === 'urgent' ? 'urgent' : matched.priority,
        source: item.description,
        assignedRole: matched.assignTo,
        status: 'pending',
        createdAt: now,
        sourcePhase: item.category,
      });
    }
  }

  // Extract from free-text plan
  if (planText) {
    const sentences = planText.split(/[.\n]+/).map(s => s.trim()).filter(Boolean);
    for (const sentence of sentences) {
      const alreadyExists = extracted.some(e => sentence.toLowerCase().includes(e.description.toLowerCase()))
        || existingSet.has(sentence.toLowerCase());
      if (!alreadyExists) {
        const matched = matchRule(sentence);
        if (matched.category !== 'doctor' || sentence.toLowerCase().includes('review') || sentence.toLowerCase().includes('check')) {
          extracted.push({
            id: `task_${now}_${extracted.length}`,
            category: matched.category,
            description: sentence.length > 80 ? sentence.slice(0, 77) + '...' : sentence,
            detail: matched.defaultDescription,
            priority: matched.priority,
            source: 'Plan',
            assignedRole: matched.assignTo,
            status: 'pending',
            createdAt: now,
          });
        }
      }
    }
  }

  return extracted;
}

// ── Extract medication administration tasks ──────────────────────────────────

export function extractMedicationTasks(
  medications: MedicationCard[],
  existingTasks: ToDoTask[] = [],
): ToDoTask[] {
  const now = Date.now();
  const tasks: ToDoTask[] = [];
  const existingMeds = new Set(existingTasks.map(t => t.description.toLowerCase()));

  for (const med of medications) {
    if (med.status === 'draft' || med.status === 'discontinued' || med.status === 'completed') continue;

    const medKey = med.genericName.toLowerCase();
    if (existingMeds.has(medKey)) continue;

    tasks.push({
      id: `medtask_${now}_${tasks.length}`,
      category: 'nursing',
      description: `Administer ${med.genericName} ${med.dose.value}${med.dose.unit} ${med.route} ${med.frequency}`,
      detail: med.indication || med.genericName,
      priority: med.frequency === 'stat' ? 'stat' : 'today',
      source: 'Medication',
      assignedRole: 'nurse',
      status: 'pending',
      createdAt: now,
    });
  }

  return tasks;
}

// ── Match a rule ─────────────────────────────────────────────────────────────

function matchRule(text: string): { category: TaskCategory; priority: TaskPriority; defaultDescription: string; assignTo?: string } {
  for (const rule of EXTRACTION_RULES) {
    for (const pattern of rule.keywords) {
      if (pattern.test(text)) {
        return {
          category: rule.category,
          priority: rule.priority,
          defaultDescription: rule.defaultDescription,
          assignTo: rule.assignTo,
        };
      }
    }
  }
  return { category: 'doctor', priority: 'routine', defaultDescription: text, assignTo: 'doctor' };
}

// ── Group tasks by category ───────────────────────────────────────────────────

export function groupTasksByCategory(tasks: ToDoTask[]): Record<TaskCategory, ToDoTask[]> {
  const grouped: Record<string, ToDoTask[]> = {};
  for (const task of tasks) {
    if (!grouped[task.category]) grouped[task.category] = [];
    grouped[task.category].push(task);
  }
  return grouped as Record<TaskCategory, ToDoTask[]>;
}

// ── Get tasks by priority ────────────────────────────────────────────────────

export function getUrgentTasks(tasks: ToDoTask[]): ToDoTask[] {
  return tasks
    .filter(t => t.status === 'pending' && (t.priority === 'stat' || t.priority === 'urgent'))
    .sort((a, b) => a.priority === 'stat' ? -1 : b.priority === 'stat' ? 1 : a.createdAt - b.createdAt);
}

export function getTodayTasks(tasks: ToDoTask[]): ToDoTask[] {
  return tasks
    .filter(t => t.status === 'pending' || t.status === 'in_progress')
    .sort((a, b) => {
      const prioOrder: Record<string, number> = { stat: 0, urgent: 1, today: 2, routine: 3 };
      return (prioOrder[a.priority] ?? 4) - (prioOrder[b.priority] ?? 4);
    });
}
