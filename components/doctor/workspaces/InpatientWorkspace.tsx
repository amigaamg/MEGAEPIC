'use client';

import React, { useState } from 'react';
import InpatientPanel from '../panels/InpatientPanel';

interface Ward {
  id: string; name: string; type: string; totalBeds: number; occupiedBeds: number;
  patients: InpatientPatient[];
}

interface InpatientPatient {
  id: string; name: string; age?: number; gender?: string; condition: string;
  admissionDate: string; doctorId: string; bedNumber: string; status: 'stable' | 'guarded' | 'critical' | 'discharging';
  diagnosis: string; notes?: string;
}

interface Props {
  doctorId: string;
  doctorName: string;
}

const SAMPLE_WARDS: Ward[] = [
  { id: 'gw1', name: 'General Ward A', type: 'General Ward', totalBeds: 30, occupiedBeds: 24,
    patients: [
      { id: 'p1', name: 'John Kamau', age: 45, gender: 'Male', condition: 'Stable', admissionDate: '18 May', doctorId: 'dr1', bedNumber: '12A', status: 'stable', diagnosis: 'Community Acquired Pneumonia', notes: 'Responding well to IV antibiotics. Oxygen saturations stable on room air.' },
      { id: 'p2', name: 'Mary Wanjiku', age: 62, gender: 'Female', condition: 'Guarded', admissionDate: '15 May', doctorId: 'dr1', bedNumber: '08B', status: 'guarded', diagnosis: 'CKD Stage 4 with CHF', notes: 'Fluid restricted. Monitoring I/O. Diuretic response adequate.' },
    ] },
  { id: 'icu1', name: 'Intensive Care Unit', type: 'ICU', totalBeds: 10, occupiedBeds: 8,
    patients: [
      { id: 'p3', name: 'Peter Otieno', age: 55, gender: 'Male', condition: 'Critical', admissionDate: '19 May', doctorId: 'dr1', bedNumber: 'ICU-3', status: 'critical', diagnosis: 'Septic Shock (UTI source)', notes: 'On vasopressors. Microbiology pending. Renal function improving.' },
    ] },
  { id: 'mat1', name: 'Maternity Ward', type: 'Maternity', totalBeds: 20, occupiedBeds: 14,
    patients: [
      { id: 'p4', name: 'Grace Akinyi', age: 28, gender: 'Female', condition: 'Stable', admissionDate: '20 May', doctorId: 'dr1', bedNumber: 'M-06', status: 'stable', diagnosis: 'Term pregnancy – latent labour', notes: 'G2P1, 39 weeks. Contractions irregular. Fetal heart rate reassuring.' },
    ] },
  { id: 'ped1', name: 'Pediatrics Ward', type: 'Pediatrics', totalBeds: 25, occupiedBeds: 18,
    patients: [] },
  { id: 'hdu1', name: 'High Dependency Unit', type: 'HDU', totalBeds: 8, occupiedBeds: 5,
    patients: [
      { id: 'p5', name: 'Samuel Kiprop', age: 35, gender: 'Male', condition: 'Guarded', admissionDate: '21 May', doctorId: 'dr1', bedNumber: 'HDU-2', status: 'guarded', diagnosis: 'Diabetic Ketoacidosis', notes: 'IV fluids + insulin infusion. Monitoring hourly glucose and electrolytes.' },
    ] },
  { id: 'psych1', name: 'Psychiatry Ward', type: 'Psychiatry', totalBeds: 15, occupiedBeds: 10,
    patients: [] },
  { id: 'iso1', name: 'Isolation Ward', type: 'Isolation', totalBeds: 6, occupiedBeds: 2,
    patients: [] },
];

export default function InpatientWorkspace({ doctorId, doctorName }: Props) {
  const [wards, setWards] = useState<Ward[]>(SAMPLE_WARDS);

  const handleAdmit = (data: { patientId: string; wardId: string; diagnosis: string; condition: string }) => {
    setWards(prev => prev.map(w => {
      if (w.id !== data.wardId) return w;
      const newPatient: InpatientPatient = {
        id: `p-${Date.now()}`,
        name: data.patientId,
        diagnosis: data.diagnosis,
        condition: data.condition,
        status: data.condition as InpatientPatient['status'],
        admissionDate: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
        doctorId, bedNumber: `${w.type.slice(0, 3)}-${w.occupiedBeds + 1}`,
      };
      return { ...w, occupiedBeds: w.occupiedBeds + 1, patients: [...w.patients, newPatient] };
    }));
  };

  const handleDischarge = (patientId: string) => {
    setWards(prev => prev.map(w => ({
      ...w,
      occupiedBeds: w.occupiedBeds - w.patients.filter(p => p.id === patientId).length,
      patients: w.patients.filter(p => p.id !== patientId),
    })));
  };

  const handleTransfer = (patientId: string, targetWardId: string) => {
    let movingPatient: InpatientPatient | null = null;
    setWards(prev => {
      const sourcePatient = prev.flatMap(w => w.patients).find(p => p.id === patientId);
      if (!sourcePatient) return prev;
      movingPatient = sourcePatient;
      return prev.map(w => {
        if (w.patients.some(p => p.id === patientId)) {
          return { ...w, occupiedBeds: w.occupiedBeds - 1, patients: w.patients.filter(p => p.id !== patientId) };
        }
        if (w.id === targetWardId && movingPatient) {
          return { ...w, occupiedBeds: w.occupiedBeds + 1, patients: [...w.patients, { ...movingPatient, bedNumber: `${w.type.slice(0, 3)}-${w.occupiedBeds + 1}` }] };
        }
        return w;
      });
    });
  };

  const handleUpdateNotes = (patientId: string, notes: string) => {
    setWards(prev => prev.map(w => ({
      ...w,
      patients: w.patients.map(p => p.id === patientId ? { ...p, notes } : p),
    })));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">🏥 Inpatient Management</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
            {wards.reduce((s, w) => s + w.occupiedBeds, 0)}/{wards.reduce((s, w) => s + w.totalBeds, 0)} beds occupied
          </div>
        </div>
        <InpatientPanel
          wards={wards}
          doctorId={doctorId}
          onAdmit={handleAdmit}
          onDischarge={handleDischarge}
          onTransfer={handleTransfer}
          onUpdateNotes={handleUpdateNotes}
        />
      </div>
    </div>
  );
}
