// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Universal HPI Engine
// Explores each chief complaint in chronological order using SymptomNodes.
// UCCL Rule 004: Complaints are explored in chronological order of onset.
// UCCL Rule 011: Each complaint links to its HPI exploration.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ComplaintObject, SymptomQuestion, ConstitutionalContext,
} from '../knowledge/symptom-types';
import { getSymptomNode, getApplicableQuestions } from '../knowledge/symptomKnowledge';
import { evaluateCqae, type CqaeInput } from './cqae';

export interface HpiExplorationState {
  currentComplaintIndex: number
  exploredComplaints: Set<string>      // complaint IDs that have been explored
  currentQuestions: SymptomQuestion[]
  currentQuestionIndex: number
  completed: boolean
}

export interface HpiExplorationInput {
  complaints: ComplaintObject[]
  context: ConstitutionalContext
  alreadyCapturedFacts: Set<string>
}

function getSymptomIdForComplaint(complaint: ComplaintObject): string | undefined {
  const node = getSymptomNode(complaint.standardizedConcept);
  if (node) return node.identity.id;

  const lower = complaint.patientWording.toLowerCase();
  if (lower.includes('fever') || lower.includes('homa') || lower.includes('hot')) return 'SX000001';
  if (lower.includes('headache') || lower.includes('head pain')) return 'SX000002';
  if (lower.includes('cough') || lower.includes('kikohozi')) return 'SX000005';

  return undefined;
}

export function getNextHpiQuestions(input: HpiExplorationInput, state: HpiExplorationState): {
  questions: { question: SymptomQuestion; displayText: string; displayChips?: string[] }[]
  newState: HpiExplorationState
  complaintId: string | null
} {
  const { complaints } = input;
  const sorted = [...complaints].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  let complaintId: string | null = null;
  let questions: { question: SymptomQuestion; displayText: string; displayChips?: string[] }[] = [];

  for (let i = state.currentComplaintIndex; i < sorted.length; i++) {
    const complaint = sorted[i];
    if (state.exploredComplaints.has(complaint.id)) continue;

    const symptomId = getSymptomIdForComplaint(complaint);
    if (!symptomId) {
      const newState: HpiExplorationState = {
        ...state,
        exploredComplaints: new Set([...state.exploredComplaints, complaint.id]),
        currentComplaintIndex: i + 1,
      };
      return { questions: [], newState, complaintId: null };
    }

    // Get applicable questions filtered through CQAE
    const allQs = getApplicableQuestions(symptomId, {
      age: input.context.age,
      sex: input.context.sex,
      pregnant: input.context.pregnant,
      department: input.context.department,
      module: input.context.module,
      encounterType: input.context.encounterType,
    });

    const filtered = allQs.filter(q => {
      const cqaeInput: CqaeInput = {
        question: q.question,
        context: input.context,
        alreadyCapturedFacts: input.alreadyCapturedFacts,
        patientAge: input.context.age,
      };
      const result = evaluateCqae(cqaeInput);
      return result.applicable;
    });

    if (filtered.length > 0) {
      complaintId = complaint.id;
      questions = filtered;
      return {
        questions,
        newState: {
          ...state,
          currentComplaintIndex: i,
          currentQuestions: filtered.map(f => f.question),
          currentQuestionIndex: 0,
        },
        complaintId,
      };
    }

    // No questions for this complaint — mark explored
    state.exploredComplaints.add(complaint.id);
  }

  return {
    questions: [],
    newState: { ...state, completed: true },
    complaintId: null,
  };
}

export function createHpiState(complaints: ComplaintObject[]): HpiExplorationState {
  return {
    currentComplaintIndex: 0,
    exploredComplaints: new Set(),
    currentQuestions: [],
    currentQuestionIndex: 0,
    completed: complaints.length === 0,
  };
}

export function markComplaintExplored(
  complaintId: string,
  state: HpiExplorationState
): HpiExplorationState {
  const newExplored = new Set(state.exploredComplaints);
  newExplored.add(complaintId);
  return {
    ...state,
    exploredComplaints: newExplored,
    currentComplaintIndex: state.currentComplaintIndex + 1,
    currentQuestions: [],
    currentQuestionIndex: 0,
    completed: state.currentComplaintIndex + 1 >= state.exploredComplaints.size,
  };
}
