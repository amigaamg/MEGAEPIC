'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { jsPDF } from "jspdf";

interface Referral {
  id: string;
  patientId: string;
  referredTo?: string;
  referredToName?: string;
  specialty: string;
  reason: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  urgency?: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  referringDoctorName?: string;
  referringDoctorSpecialty?: string;
  referringFacility?: string;
  notes?: string;
  createdAt: any;
}

interface Patient {
  uid: string;
  name?: string;
  email?: string;
  displayName?: string;
  phone?: string;
}

interface Props {
  patientId: string;
  patientName: string;
  patient: Patient;
  onOpenChat: (doctorId: string, doctorName: string) => void;
}

const fmtDate = (ts: any) => {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const urgencyCfg: Record<string, { color: string; bg: string }> = {
  routine:   { color: '#10b981', bg: '#ecfdf5' },
  urgent:    { color: '#f59e0b', bg: '#fffbeb' },
  emergency: { color: '#ef4444', bg: '#fef2f2' },
};

const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: '#f59e0b', bg: '#fffbeb' },
  accepted:   { label: 'Accepted',   color: '#3b82f6', bg: '#eff6ff' },
  completed:  { label: 'Completed',  color: '#10b981', bg: '#ecfdf5' },
  declined:   { label: 'Declined',   color: '#ef4444', bg: '#fef2f2' },
};

function downloadReferralLetter(r: Referral, patientName: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const urgency = r.priority || r.urgency || 'routine';

  const TEAL  = [0, 118, 110] as [number, number, number];
  const GOLD  = [180, 140, 60] as [number, number, number];
  const GREY  = [100, 110, 120] as [number, number, number];

  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PAGE_W, 38, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, PAGE_W, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("REFERRAL LETTER", PAGE_W / 2, 18, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Amexan Health — Referral Portal", PAGE_W / 2, 28, { align: "center" });

  let y = 55;
  const left = 20;
  const right = PAGE_W - 20;
  const lineH = 7;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);

  // Patient info
  doc.setFont("helvetica", "bold");
  doc.text("Patient:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(patientName || '—', left + 30, y);
  y += lineH;

  doc.setFont("helvetica", "bold");
  doc.text("Referred To:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(r.referredToName || r.referredTo || r.specialty || '—', left + 30, y);
  y += lineH;

  doc.setFont("helvetica", "bold");
  doc.text("Specialty:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(r.specialty || '—', left + 30, y);
  y += lineH;

  doc.setFont("helvetica", "bold");
  doc.text("Priority:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(urgency.charAt(0).toUpperCase() + urgency.slice(1), left + 30, y);
  y += lineH;

  doc.setFont("helvetica", "bold");
  doc.text("Referring Doctor:", left, y);
  doc.setFont("helvetica", "normal");
  doc.text(r.referringDoctorName || '—', left + 30, y);
  y += lineH;

  if (r.referringFacility) {
    doc.setFont("helvetica", "bold");
    doc.text("Facility:", left, y);
    doc.setFont("helvetica", "normal");
    doc.text(r.referringFacility, left + 30, y);
    y += lineH;
  }

  y += lineH;

  // Reason header
  doc.setFillColor(240, 249, 247);
  doc.rect(left, y - 4, PAGE_W - 40, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 118, 110);
  doc.text("REASON FOR REFERRAL", left + 2, y + 1);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  const reasonLines = doc.splitTextToSize(r.reason || 'No reason provided.', PAGE_W - 50);
  reasonLines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, left + 2, y);
    y += 5;
  });

  if (r.notes) {
    y += lineH;
    doc.setFillColor(248, 250, 252);
    doc.rect(left, y - 4, PAGE_W - 40, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 120);
    doc.text("ADDITIONAL NOTES", left + 2, y + 1);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const noteLines = doc.splitTextToSize(r.notes, PAGE_W - 50);
    noteLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
      doc.text(line, left + 2, y);
      y += 5;
    });
  }

  // Date
  y = Math.max(y + 15, 250);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}`, left, y);
  doc.text(`Referral ID: ${r.id}`, right - 50, y, { align: "right" });

  // Footer
  doc.setFillColor(240, 249, 247);
  doc.rect(0, 285, PAGE_W, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 120);
  doc.text("Amexan Health System — Referral Document", PAGE_W / 2, 292, { align: "center" });

  doc.save(`referral-${r.id.slice(0, 8)}.pdf`);
}

export default function PatientReferralPortal({ patientId, patientName, patient, onOpenChat }: Props) {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'referrals'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral)));
    }, err => {
      console.error('ReferralPortal listen error:', err);
    });
    return () => unsub();
  }, [patientId]);

  if (referrals.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <p style={{ fontSize: 14, fontWeight: 600 }}>No referrals yet</p>
        <p style={{ fontSize: 12 }}>When your doctor refers you to a specialist, it will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {referrals.map(r => {
        const urgency = r.priority || r.urgency || 'routine';
        const uc = urgencyCfg[urgency] || urgencyCfg.routine;
        const sc = statusCfg[r.status] || statusCfg.pending;
        return (
          <div key={r.id} style={{
            padding: 16, background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                  Referral to {r.referredToName || r.referredTo || r.specialty}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {r.referredTo && r.referredTo !== r.specialty && (
                    <span style={{ marginRight: 8, display: 'inline-block', padding: '1px 6px', background: '#f0f9ff', borderRadius: 4, color: '#0369a1', fontSize: 11 }}>
                      {r.specialty}
                    </span>
                  )}
                  By {r.referringDoctorName || 'Your doctor'}{r.referringFacility ? ` · ${r.referringFacility}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: uc.bg, color: uc.color }}>
                  {urgency}
                </span>
                <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 8, lineHeight: 1.5 }}>
              {r.reason}
            </div>
            {r.notes && (
              <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 8, padding: 8, background: '#f8fafc', borderRadius: 8 }}>
                📝 {r.notes}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(r.createdAt)}</span>
              <button
                onClick={() => downloadReferralLetter(r, patientName || patient.name || patient.displayName || 'Patient')}
                style={{
                  padding: '4px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#f8fafc', color: '#475569', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                📄 Download Letter
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
