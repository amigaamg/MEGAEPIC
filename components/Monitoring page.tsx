'use client';
// ─────────────────────────────────────────────────────────────────────────────
// app/dashboard/doctor/monitoring/[patientId]/page.tsx
//
// Example usage: Full AMEXAN Clinical Intelligence Wall
// Wires Firebase auth (doctor) + Firestore patient record into MonitoringWall
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams }           from 'next/navigation';
import { doc, getDoc }         from 'firebase/firestore';
import { db }                  from '@/lib/firebase';
import { useAuth }             from '@/hooks/useAuth';         // your auth hook
import { MonitoringWall }      from '@/components/amexan';

interface PatientRecord {
  uid:       string;
  name:      string;
  age:       number;
  sex:       'M' | 'F';
  weight:    number;
  allergies: string[];
  diagnoses: string[];
  vitals?: Record<string, number>;
  labs?:   Record<string, number>;
}

export default function PatientMonitoringPage() {
  const params           = useParams();
  const patientId        = params?.patientId as string;
  const { user } = useAuth();

  const [patient,  setPatient]  = useState<PatientRecord | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!patientId) return;
    getDoc(doc(db, 'patients', patientId)).then((snap) => {
      if (snap.exists()) {
        setPatient({ uid: snap.id, ...snap.data() } as PatientRecord);
      }
      setLoading(false);
    });
  }, [patientId]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#060b14',
          color: '#64748b',
          fontSize: 12,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        Loading clinical intelligence…
      </div>
    );
  }

  if (!patient || !user) return null;

  return (
    <MonitoringWall
      patientId={patient.uid}
      patientName={patient.name}
      patientAge={patient.age}
      patientSex={patient.sex}
      patientWeight={patient.weight}
      patientAllergies={patient.allergies}
      patientDiagnoses={patient.diagnoses}
      doctor={{ uid: user.uid, name: (user as any).displayName || user.email || "" }}
      vitals={patient.vitals}
      labs={patient.labs}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALTERNATIVE: Drop MonitoringWall into existing DoctorMonitoringPanel layout
// Replace the monitoring section inside DoctorMonitoringPanel.tsx with:
//
//   <MonitoringWall
//     patientId={patientId}
//     patientName={patientName}
//     patientAge={patientAge}
//     patientSex={patientGender === 'female' ? 'F' : 'M'}
//     patientWeight={/* from your patient state */}
//     patientAllergies={/* from clinical history */}
//     patientDiagnoses={/* from active conditions */}
//     doctor={doctor}
//   />
// ─────────────────────────────────────────────────────────────────────────────