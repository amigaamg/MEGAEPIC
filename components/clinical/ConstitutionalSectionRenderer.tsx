'use client';
import React from 'react';
import { SectionType } from '@/lib/clinical/constitutional/types';

interface SectionRendererProps {
  sectionId: string;
  sectionType: SectionType;
  label: string;
  description: string;
}

export function ConstitutionalSectionRenderer({ sectionId, sectionType, label, description }: SectionRendererProps) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#e6edf3', fontFamily: "'Inter', system-ui, sans-serif" }}>
          {label}
        </h2>
        <p style={{ fontSize: 13, color: '#8b949e', margin: '6px 0 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
