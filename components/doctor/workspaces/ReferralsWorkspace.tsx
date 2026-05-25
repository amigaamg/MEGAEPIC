'use client';

import React from 'react';
import ReferralSystem from '@/components/ReferralSystem';

interface Props {
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorFacility?: string;
  doctorPhone?: string;
  patientId?: string | null;
  patientName?: string | null;
}

export default function ReferralsWorkspace({
  doctorId, doctorName, doctorSpecialty, doctorFacility, doctorPhone,
  patientId, patientName,
}: Props) {
  return (
    <div style={{ animation:'slideUp .25s ease' }}>
      <ReferralSystem
        doctorId={doctorId}
        doctorName={doctorName}
        doctorSpecialty={doctorSpecialty || ''}
        doctorFacility={doctorFacility || ''}
        doctorPhone={doctorPhone || ''}
        patientId={patientId || undefined}
        patientName={patientName || undefined}
        mode="dashboard"
      />
    </div>
  );
}
