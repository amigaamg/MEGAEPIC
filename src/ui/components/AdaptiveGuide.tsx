'use client';
import React from 'react';
import { usePatientStore } from '../../state/patientStore';
import { useTheme } from '../themes/ThemeProvider';
import { getAdaptiveGuidance, AdaptiveGuideData } from '../../engine/inference/adaptive';

export const AdaptiveGuide: React.FC<{ phaseIdx: number }> = ({ phaseIdx }) => {
  const form = usePatientStore(s => s.form);
  const t = useTheme();
  const guide: AdaptiveGuideData | null = getAdaptiveGuidance(phaseIdx, form);

  if (!guide || guide.items.length === 0) return null;

  return (
    <div style={{
      background: t.colors.surface,
      border: `1px solid ${t.colors.border}`,
      borderRadius: 12,
      padding: '14px 18px',
      marginBottom: 20,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, fontWeight: 700, color: t.colors.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10, paddingBottom: 8,
        borderBottom: `1px solid ${t.colors.border}`,
      }}>
        <span style={{ fontSize: 13 }}>🔍</span> Adaptive Guidance
      </div>

      {guide.topDisease && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: t.colors.accentBg, color: t.colors.accentText,
          }}>
            Top: {guide.topDisease.name} ({guide.topDisease.prob}%)
          </span>
          {guide.secondaryDiseases.map(d => (
            <span key={d.name} style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: t.colors.surfaceAlt, color: t.colors.textSub,
            }}>
              {d.name} ({d.prob}%)
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {guide.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: t.colors.text, lineHeight: 1.4,
          }}>
            <span style={{
              flexShrink: 0, width: 16, height: 16, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
              background: item.present ? t.colors.successBg : t.colors.surfaceAlt,
              color: item.present ? t.colors.success : t.colors.textMuted,
              border: `1px solid ${item.present ? t.colors.success : t.colors.border}`,
            }}>
              {item.present ? '✓' : ''}
            </span>
            <span>{item.label}</span>
            <span style={{
              fontSize: 10, color: t.colors.textMuted, marginLeft: 'auto', flexShrink: 0,
            }}>
              {item.diseaseName}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        fontSize: 10, color: t.colors.textMuted, marginTop: 10,
        paddingTop: 8, borderTop: `1px solid ${t.colors.border}`,
      }}>
        Suggestions based on scored differentials — fill in missing fields to improve diagnostic accuracy.
      </div>
    </div>
  );
};
