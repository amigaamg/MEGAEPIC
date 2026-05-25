'use client';

import React from 'react';
import AmexanClinicalMessaging from '@/components/AmexanClinicalMessaging';

interface Props {
  doctorId: string;
  doctorName: string;
  initialThreadId?: string | null;
}

export default function CommunicationWorkspace({ doctorId, doctorName, initialThreadId }: Props) {
  if (!doctorId || !doctorName) {
    return <div className="panel"><div className="empty-sm">Loading messaging...</div></div>;
  }

  return (
    <div style={{ animation:'slideUp .25s ease' }}>
      <AmexanClinicalMessaging
        myId={doctorId}
        myName={doctorName}
        myRole="doctor"
        initialThreadId={initialThreadId ?? undefined}
      />
    </div>
  );
}
