'use client';

import React from 'react';
import HTNDashboard from '@/components/bp-monitor/HTNDashboard';

interface Props {
  doctorId?: string;
  onOpenConversation: (threadId: string) => void;
  onOpenReferrals: (patientId: string, patientName: string) => void;
}

export default function HTNWorkspace({ doctorId, onOpenConversation, onOpenReferrals }: Props) {
  return (
    <div style={{ animation:'slideUp .25s ease' }}>
      <HTNDashboard
        doctorId={doctorId}
        onOpenConversation={onOpenConversation}
        onOpenReferrals={onOpenReferrals}
      />
    </div>
  );
}
