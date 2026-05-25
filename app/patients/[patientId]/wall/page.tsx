'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams } from 'next/navigation';
import PatientInfoPanel from '@/components/PatientInfoPanel';
import DoctorMonitoringPanel from '@/components/DoctorMonitoringPanel';
import ActionTray from '@/components/ActionTray';
import { UnifiedTimeline } from '@/components/UnifiedTimeline';   // ✅ named import
import { ChatPanel } from '@/components/ChatPanel';             // ✅ named import
import { DocumentsPanel } from '@/components/DocumentsPanel';   // ✅ named import
import PrintButton from '@/components/PrintButton';
import PatientWallPage from '@/components/PatientWallPage';
export default function PatientWallRoute() {
  const params = useParams();
  const patientId = params?.patientId as string;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const doctor = { uid: 'current-doctor-id', name: 'Current Doctor' };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, 'patients', patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Patient fetch error:', err);
      }
      setLoading(false);
    };
    fetchPatient();
  }, [patientId]);

  if (loading) return <div>Loading patient data…</div>;

  const safePatient = patient ?? { id: patientId, name: 'Unknown Patient' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <div style={{ width: 320, borderRight: '1px solid #e2e9f3', overflowY: 'auto', padding: 16 }}>
        <PatientInfoPanel patient={safePatient} doctor={doctor} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <DoctorMonitoringPanel patientId={patientId} patientName={safePatient.name} patientAge={safePatient.age} patientGender={safePatient.gender} doctor={doctor} isEmbedded={true} />
        <UnifiedTimeline patientId={patientId} doctorId={doctor.uid} />
        <ChatPanel patientId={patientId} doctorId={doctor.uid} doctorName={doctor.name} />
        <DocumentsPanel patientId={patientId} />
      </div>

      <div style={{ width: 280, borderLeft: '1px solid #e2e9f3', overflowY: 'auto', padding: 16 }}>
        <ActionTray patientId={patientId} doctor={doctor} />
        <PrintButton patientId={patientId} />
      </div>
    </div>
  );
}