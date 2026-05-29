'use client';

import React, { useState } from 'react';
import DoctorToolsPanel from '@/components/DoctorToolsPanel';
import ClinicalToolsHub from '../panels/ClinicalToolsHub';
import ClinicalToolLauncher from '@/components/clinical-monitoring/ClinicalToolLauncher';

interface Appointment { id: string; patientId: string; patientName?: string; specialty?: string; }

interface Props { doctorId: string; appointments: Appointment[]; doctorSpecialty?: string; doctorName?: string; }

export default function ToolsWorkspace({ doctorId, appointments, doctorSpecialty = 'General Practice', doctorName }: Props) {
  const [showDoctorTools, setShowDoctorTools] = useState(false);
  const [launchedTool, setLaunchedTool] = useState<string | null>(null);

  if (!doctorId) {
    return <div className="panel"><div className="empty-sm">Loading doctor information...</div></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">🛠️ Clinical Tools & Resources</div>
          <button className="btn-secondary" onClick={() => setShowDoctorTools(!showDoctorTools)} style={{ fontSize: 11, padding: '6px 12px' }}>
            {showDoctorTools ? '📚 Tool Library' : '🤖 AI Tools'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          {showDoctorTools
            ? 'AI-powered clinical decision support, drug interaction checks, and smart recommendations.'
            : 'Specialty-specific clinical calculators, scoring systems, guidelines, and protocols.'}
        </p>

        {!showDoctorTools ? (
          <ClinicalToolsHub
            doctorSpecialty={doctorSpecialty}
            onLaunchTool={setLaunchedTool}
          />
        ) : (
          <DoctorToolsPanel
            doctorId={doctorId}
            appointments={appointments.map(a => ({
              id: a.id, patientId: a.patientId,
              patientName: a.patientName, specialty: a.specialty,
            }))}
          />
        )}
      </div>

      {launchedTool && (
        <div style={{ marginTop: 8 }}>
          <ClinicalToolLauncher
            toolId={launchedTool}
            patientName="Demo Patient"
            doctorId={doctorId}
            doctorName={doctorName}
            onClose={() => setLaunchedTool(null)}
          />
        </div>
      )}
    </div>
  );
}
