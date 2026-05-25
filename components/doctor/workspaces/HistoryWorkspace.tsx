'use client';

import React from 'react';
import HistoryPanel from '@/components/HistoryPanel';
import type { DoctorProfile } from '../DoctorShell';

interface Appointment {
  id: string; patientId?: string; patientName?: string;
  patientEmail?: string; specialty?: string;
  date?: any; notes?: string; prescriptions?: any[];
  patientNotes?: string; amount?: number;
  status: 'active' | 'booked' | 'completed' | 'cancelled';
}

interface Props { appointments: Appointment[]; doctor: DoctorProfile; }

export default function HistoryWorkspace({ appointments, doctor }: Props) {
  return (
    <div style={{ animation:'slideUp .25s ease' }}>
      <HistoryPanel appointments={appointments as any} doctor={doctor as any} />
    </div>
  );
}
