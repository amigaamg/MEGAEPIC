'use client';

import React, { useState } from 'react';
import AlertEscalationEngine from '../panels/AlertEscalationEngine';
import WorkflowTaskEngine from '../panels/WorkflowTaskEngine';
import PatientEducation from '../panels/PatientEducation';
import ClinicalCommunicationHub from '../panels/ClinicalCommunicationHub';

type OpsTab = 'tasks' | 'alerts' | 'education' | 'communication';

interface Props {
  doctorId: string; doctorName: string;
}

export default function ClinicalOperationsWorkspace({ doctorId, doctorName }: Props) {
  const [tab, setTab] = useState<OpsTab>('tasks');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp .25s ease' }}>
      <div className="panel">
        <div className="panel-hd">
          <div className="panel-title">⚙️ Clinical Operations</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {([
          { id: 'tasks' as OpsTab, icon: '📋', label: 'Workflow & Tasks' },
          { id: 'alerts' as OpsTab, icon: '🚨', label: 'Alerts & Escalation' },
          { id: 'education' as OpsTab, icon: '📖', label: 'Patient Education' },
          { id: 'communication' as OpsTab, icon: '💬', label: 'Clinical Communication' },
        ]).map(t => (
          <button key={t.id} className={`filter-chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {tab === 'tasks' && (
          <div>
            <div className="panel-hd" style={{ marginBottom: 10 }}>
              <div className="panel-title">📋 Workflow & Task Engine</div>
            </div>
            <WorkflowTaskEngine doctorId={doctorId} doctorName={doctorName} />
          </div>
        )}

        {tab === 'alerts' && (
          <div>
            <div className="panel-hd" style={{ marginBottom: 10 }}>
              <div className="panel-title">🚨 Alerts & Escalation System</div>
            </div>
            <AlertEscalationEngine doctorId={doctorId} doctorName={doctorName} />
          </div>
        )}

        {tab === 'education' && (
          <div>
            <div className="panel-hd" style={{ marginBottom: 10 }}>
              <div className="panel-title">📖 Patient Education Library</div>
            </div>
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>
              Select a patient from the Patient Registry to send educational materials.
            </div>
            <div style={{
              padding: 12, borderRadius: 10,
              background: 'var(--bg)', border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>📚 Available Resources</div>
              {['Understanding Your Blood Pressure', 'Diabetes Self-Management', 'Using Your Inhaler Correctly', 'HIV Treatment & Adherence', 'Healthy Eating for Kidney Health'].map((title, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>📖 {title}</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>10 templates</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'communication' && (
          <div>
            <div className="panel-hd" style={{ marginBottom: 10 }}>
              <div className="panel-title">💬 Clinical Communication Hub</div>
            </div>
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 13 }}>
              Select a patient from the Patient Registry to view or send clinical messages.
            </div>
          </div>
        )}
      </div>

      {/* Aggregate overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="panel-title" style={{ justifyContent: 'center' }}>📋</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>0</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Active Tasks</div>
        </div>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="panel-title" style={{ justifyContent: 'center' }}>🚨</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', color: '#ef4444' }}>0</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Active Alerts</div>
        </div>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="panel-title" style={{ justifyContent: 'center' }}>📖</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', color: '#8b5cf6' }}>10</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Education Resources</div>
        </div>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="panel-title" style={{ justifyContent: 'center' }}>💬</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', color: '#3b82f6' }}>0</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Active Threads</div>
        </div>
      </div>
    </div>
  );
}
