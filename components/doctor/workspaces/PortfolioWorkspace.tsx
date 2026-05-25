'use client';

import React from 'react';
import DoctorDashboardEditor from '@/components/DoctorDashboardEditor';

interface Props { doctorId?: string; }

export default function PortfolioWorkspace({ doctorId }: Props) {
  return (
    <div style={{ animation:'slideUp .25s ease' }}>
      <DoctorDashboardEditor doctorId={doctorId} />
    </div>
  );
}
