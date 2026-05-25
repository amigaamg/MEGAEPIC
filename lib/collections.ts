import {
  collection,
  CollectionReference,
  DocumentReference,
  doc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  DocumentData,
} from "firebase/firestore";
import { db as firestore } from "./firebase";
import type {
  Patient,
  Doctor,
  PatientTool,
  BPEntry,
  Prescription,
  AdherenceEntry,
  ClinicalNote,
  FollowUp,
  LabOrder,
  ImagingOrder,
  SystemAlert,
  DoctorMessage,
  Complication,
} from "../types";
import type { ToolAssignment, ToolReading } from "./diseaseTools";

// ─────────────────────────────────────────────────────────────
// GENERIC CONVERTER FACTORY
// Strips the id field before writing (Firestore stores it as
// the document ID), and injects it back on read.
// ─────────────────────────────────────────────────────────────

function makeConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: WithFieldValue<T>): DocumentData {
      const { id: _id, ...rest } = data as Record<string, unknown>;
      return rest;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      return { id: snapshot.id, ...snapshot.data(options) } as T;
    },
  };
}

// ─────────────────────────────────────────────────────────────
// COLLECTION REFERENCES (fully typed)
// ─────────────────────────────────────────────────────────────

export const Collections = {
  PATIENTS:         "patients",
  DOCTORS:          "doctors",
  PATIENT_TOOLS:    "patientTools",
  BP_ENTRIES:       "bpEntries",
  PRESCRIPTIONS:    "prescriptions",
  ADHERENCE:        "medicationAdherence",
  CLINICAL_NOTES:   "clinicalNotes",
  FOLLOW_UPS:       "followUps",
  LAB_ORDERS:       "labOrders",
  IMAGING_ORDERS:   "imagingOrders",
  SYSTEM_ALERTS:    "systemAlerts",
  DOCTOR_MESSAGES:  "doctorMessages",
  COMPLICATIONS:    "complications",
  TOOL_ASSIGNMENTS: "toolAssignments",
  TOOL_READINGS:    "toolReadings",
} as const;

// ─────────────────────────────────────────────────────────────
// TYPED COLLECTION REFS
// ─────────────────────────────────────────────────────────────

export const patientsRef = collection(
  firestore, Collections.PATIENTS
).withConverter(makeConverter<Patient>()) as CollectionReference<Patient>;

export const doctorsRef = collection(
  firestore, Collections.DOCTORS
).withConverter(makeConverter<Doctor>()) as CollectionReference<Doctor>;

export const patientToolsRef = collection(
  firestore, Collections.PATIENT_TOOLS
).withConverter(makeConverter<PatientTool>()) as CollectionReference<PatientTool>;

export const bpEntriesRef = collection(
  firestore, Collections.BP_ENTRIES
).withConverter(makeConverter<BPEntry>()) as CollectionReference<BPEntry>;

export const prescriptionsRef = collection(
  firestore, Collections.PRESCRIPTIONS
).withConverter(makeConverter<Prescription>()) as CollectionReference<Prescription>;

export const adherenceRef = collection(
  firestore, Collections.ADHERENCE
).withConverter(makeConverter<AdherenceEntry>()) as CollectionReference<AdherenceEntry>;

export const clinicalNotesRef = collection(
  firestore, Collections.CLINICAL_NOTES
).withConverter(makeConverter<ClinicalNote>()) as CollectionReference<ClinicalNote>;

export const followUpsRef = collection(
  firestore, Collections.FOLLOW_UPS
).withConverter(makeConverter<FollowUp>()) as CollectionReference<FollowUp>;

export const labOrdersRef = collection(
  firestore, Collections.LAB_ORDERS
).withConverter(makeConverter<LabOrder>()) as CollectionReference<LabOrder>;

export const imagingOrdersRef = collection(
  firestore, Collections.IMAGING_ORDERS
).withConverter(makeConverter<ImagingOrder>()) as CollectionReference<ImagingOrder>;

export const systemAlertsRef = collection(
  firestore, Collections.SYSTEM_ALERTS
).withConverter(makeConverter<SystemAlert>()) as CollectionReference<SystemAlert>;

export const doctorMessagesRef = collection(
  firestore, Collections.DOCTOR_MESSAGES
).withConverter(makeConverter<DoctorMessage>()) as CollectionReference<DoctorMessage>;

export const complicationsRef = collection(
  firestore, Collections.COMPLICATIONS
).withConverter(makeConverter<Complication>()) as CollectionReference<Complication>;

export const toolAssignmentsRef = collection(
  firestore, Collections.TOOL_ASSIGNMENTS
).withConverter(makeConverter<ToolAssignment>()) as CollectionReference<ToolAssignment>;

export const toolReadingsRef = collection(
  firestore, Collections.TOOL_READINGS
).withConverter(makeConverter<ToolReading>()) as CollectionReference<ToolReading>;

// ─────────────────────────────────────────────────────────────
// DOCUMENT REF HELPERS
// ─────────────────────────────────────────────────────────────

export const patientDoc    = (id: string): DocumentReference<Patient>     => doc(patientsRef, id);
export const doctorDoc     = (id: string): DocumentReference<Doctor>      => doc(doctorsRef, id);
export const toolDoc       = (id: string): DocumentReference<PatientTool> => doc(patientToolsRef, id);
export const bpDoc         = (id: string): DocumentReference<BPEntry>     => doc(bpEntriesRef, id);
export const rxDoc         = (id: string): DocumentReference<Prescription>=> doc(prescriptionsRef, id);
export const noteDoc       = (id: string): DocumentReference<ClinicalNote>=> doc(clinicalNotesRef, id);
export const followUpDoc   = (id: string): DocumentReference<FollowUp>    => doc(followUpsRef, id);
export const labDoc        = (id: string): DocumentReference<LabOrder>    => doc(labOrdersRef, id);
export const imagingDoc    = (id: string): DocumentReference<ImagingOrder>=> doc(imagingOrdersRef, id);
export const alertDoc      = (id: string): DocumentReference<SystemAlert> => doc(systemAlertsRef, id);
export const msgDoc        = (id: string): DocumentReference<DoctorMessage>=> doc(doctorMessagesRef, id);
export const compDoc       = (id: string): DocumentReference<Complication>=> doc(complicationsRef, id);

export const assignmentDoc = (id: string): DocumentReference<ToolAssignment> => doc(toolAssignmentsRef, id);
export const readingDoc    = (id: string): DocumentReference<ToolReading>     => doc(toolReadingsRef, id);