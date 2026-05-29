"use client";

interface PrescriptionReceiptItem {
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
}

interface Props {
  receiptId: string;
  date: Date;
  patientName: string;
  patientId: string;
  diagnosis: string;
  doctorName: string;
  doctorLicense: string;
  facility: string;
  items: PrescriptionReceiptItem[];
  expectedOutcomes: string[];
  warnings: string[];
  signatureUrl?: string;
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function PrescriptionReceipt({
  receiptId, date, patientName, patientId, diagnosis, doctorName, doctorLicense, facility,
  items, expectedOutcomes, warnings, signatureUrl,
}: Props) {
  return null;
}
