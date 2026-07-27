'use client';
import { useRegistration } from './RegistrationProvider';
import { REGISTRATION_FIELDS, REGISTRATION_STAGES } from '@/lib/clinical/constitutional/registration-engine';
import type { FieldDefinition } from '@/lib/clinical/constitutional/registration-engine';

const ANSWER_STATES: { key: string; label: string; color: string }[] = [
  { key: 'captured', label: 'Captured', color: '#27AE60' },
  { key: 'unknown', label: 'Unknown', color: '#F39C12' },
  { key: 'unable', label: 'Unable', color: '#E74C3C' },
  { key: 'declined', label: 'Declined', color: '#8E44AD' },
  { key: 'not_applicable', label: 'N/A', color: '#6B7280' },
];

function FieldRenderer({
  fieldDef, value, onChange, onStateChange, answerState,
}: {
  fieldDef: FieldDefinition;
  value: unknown;
  onChange: (val: unknown) => void;
  onStateChange: (state: string) => void;
  answerState: string;
}) {
  const inputId = `field-${fieldDef.id}`;

  const baseStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #D1D5DB', fontSize: 14, color: '#1A1A2E',
    background: answerState === 'not_applicable' ? '#F9FAFB' : '#FFFFFF',
    outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  const renderInput = () => {
    switch (fieldDef.type) {
      case 'text':
      case 'tel':
        return (
          <input
            id={inputId} type={fieldDef.type === 'tel' ? 'tel' : 'text'}
            style={baseStyle} placeholder={fieldDef.placeholder}
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            disabled={answerState !== 'captured'}
          />
        );

      case 'number':
        return (
          <input
            id={inputId} type="number"
            style={baseStyle} placeholder={fieldDef.placeholder}
            value={value !== null && value !== undefined ? String(value) : ''}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
            min={fieldDef.validation?.min} max={fieldDef.validation?.max}
            disabled={answerState !== 'captured'}
          />
        );

      case 'date':
        return (
          <input
            id={inputId} type="date"
            style={baseStyle}
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            disabled={answerState !== 'captured'}
          />
        );

      case 'boolean':
      case 'radio':
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(fieldDef.options || []).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                disabled={answerState !== 'captured'}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13,
                  border: value === opt.value ? '2px solid #2F80ED' : '1px solid #D1D5DB',
                  background: value === opt.value ? '#EBF5FB' : '#FFFFFF',
                  color: value === opt.value ? '#2F80ED' : '#4B5563',
                  fontWeight: value === opt.value ? 600 : 400,
                  cursor: answerState === 'captured' ? 'pointer' : 'default',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            id={inputId}
            style={baseStyle}
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value || null)}
            disabled={answerState !== 'captured'}
          >
            <option value="">Select...</option>
            {(fieldDef.options || []).map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'multi_select':
        const selected = (value as string[]) || [];
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(fieldDef.options || []).map(opt => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (opt.value === 'none') { onChange(['none']); return; }
                    const next = isSelected
                      ? selected.filter(v => v !== opt.value)
                      : [...selected.filter(v => v !== 'none'), opt.value];
                    onChange(next.length ? next : null);
                  }}
                  disabled={answerState !== 'captured'}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12,
                    border: isSelected ? '2px solid #2F80ED' : '1px solid #D1D5DB',
                    background: isSelected ? '#EBF5FB' : '#FFFFFF',
                    color: isSelected ? '#2F80ED' : '#4B5563',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: answerState === 'captured' ? 'pointer' : 'default',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case 'calculated':
        return (
          <div style={{
            ...baseStyle, background: '#F3F4F6', color: '#6B7280',
            border: '1px dashed #D1D5DB', cursor: 'default',
          }}>
            {value !== null && value !== undefined ? String(value) : 'Auto-calculated from entered data'}
          </div>
        );

      default:
        return (
          <input
            id={inputId} type="text" style={baseStyle}
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            disabled={answerState !== 'captured'}
          />
        );
    }
  };

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor={inputId}
            style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: '#1F2937', marginBottom: 6,
            }}
          >
            {fieldDef.label}
            {fieldDef.required.length > 0 && (
              <span style={{ color: '#E74C3C', marginLeft: 4 }}>*</span>
            )}
          </label>
          {fieldDef.description && (
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>
              {fieldDef.description}
            </div>
          )}
          {renderInput()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
        {ANSWER_STATES.map(btn => (
          <button
            key={btn.key}
            type="button"
            onClick={() => onStateChange(btn.key)}
            style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 10,
              border: answerState === btn.key ? `1px solid ${btn.color}` : '1px solid #E5E7EB',
              background: answerState === btn.key ? `${btn.color}15` : '#FFFFFF',
              color: answerState === btn.key ? btn.color : '#9CA3AF',
              fontWeight: answerState === btn.key ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RegistrationForm() {
  const { state, setField, setAnswerState, nextStage, previousStage, progress } = useRegistration();

  const stageDef = REGISTRATION_STAGES.find(s => s.id === state.stage);
  const stageFields = Object.entries(REGISTRATION_FIELDS)
    .filter(([, def]) => def.stage === state.stage);

  const isLastStage = state.stage === 'registration_complete';
  const isFirstStage = state.stage === 'identity';

  if (isLastStage) {
    const summary = state.contextSummary;
    return (
      <div style={{ flex: 1, padding: 40, maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1ABC9C', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Stage 5 of 5
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>Clinical Context Summary</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
          Review the derived clinical context before entering the clinical workspace.
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #EBF5FB, #E8F8F5)',
          borderRadius: 16, padding: 28, border: '1px solid #B2D8F7',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', marginBottom: 16 }}>
            {summary[0] || 'Patient'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {summary.map((line, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', background: 'rgba(255,255,255,0.7)',
                borderRadius: 8, fontSize: 14, color: '#2C3E50',
              }}>
                <span style={{ color: '#27AE60', fontWeight: 700 }}>✓</span>
                {line}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>
              Active Clinical Modules
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Adult', 'Female', 'Emergency', 'Medicine'].map(mod => (
                <span key={mod} style={{
                  padding: '4px 10px', borderRadius: 12, fontSize: 11,
                  background: '#2F80ED', color: '#FFFFFF', fontWeight: 500,
                }}>
                  {mod}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button
            onClick={previousStage}
            style={{
              padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#4B5563',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => {}}
            style={{
              padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              border: 'none', background: '#2F80ED', color: '#FFFFFF', cursor: 'pointer',
              flex: 1,
            }}
          >
            Enter Clinical Workspace →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '32px 40px', maxWidth: 720, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#2F80ED', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Stage {REGISTRATION_STAGES.findIndex(s => s.id === state.stage) + 1} of 6
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>
        {stageDef?.label}
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
        {stageDef?.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {stageFields.map(([fieldId, fieldDef]) => {
          const isActive = state.activeFields.includes(fieldId);
          if (!isActive) return null;

          const answer = state.data[fieldId];

          return (
            <FieldRenderer
              key={fieldId}
              fieldDef={fieldDef}
              value={answer?.value}
              answerState={answer?.state || 'unknown'}
              onChange={(val) => setField(fieldId, val)}
              onStateChange={(s) => setAnswerState(fieldId, s as any)}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={previousStage}
          disabled={isFirstStage}
          style={{
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            border: '1px solid #D1D5DB', background: '#FFFFFF', color: isFirstStage ? '#D1D5DB' : '#4B5563',
            cursor: isFirstStage ? 'not-allowed' : 'pointer', opacity: isFirstStage ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={nextStage}
          style={{
            padding: '10px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: 'none', background: '#2F80ED', color: '#FFFFFF', cursor: 'pointer',
          }}
        >
          {state.stage === 'administrative_context' ? 'Review & Confirm →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
