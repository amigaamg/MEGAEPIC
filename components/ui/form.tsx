// AMEXAN Universal Form Component
// Constitutional Principle: Forms are workflows, not widgets.
// Spec: validation, autosave, offline, undo, error, hints, accessibility. React = presentation only.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface FormField {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface FormProps extends UniversalComponentProps {
  sections: FormSection[];
  onSubmit?: () => void;
  submitLabel?: string;
  onCancel?: () => void;
  autoSave?: boolean;
  saveState?: 'idle' | 'saving' | 'saved' | 'synced' | 'error';
  columns?: 1 | 2 | 3;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ sections, onSubmit, submitLabel = 'Save', onCancel, autoSave = false, saveState = 'idle', columns = 1, className = '', testId, id, telemetry, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      emitTelemetry({ telemetry, testId }, 'form', 'submit');
      onSubmit?.();
    };

    const saveStateLabel = {
      idle: '',
      saving: 'Saving…',
      saved: 'Saved',
      synced: 'Synced',
      error: 'Save failed',
    }[saveState];

    return (
      <form ref={ref} data-testid={testId} noValidate onSubmit={handleSubmit} {...componentDataAttr({ testId, id }, 'form')} {...props}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacingTokens[5] }}>
          {sections.map((section) => (
            <fieldset key={section.id} style={{ border: 'none', margin: 0, padding: 0 }}>
              {section.title ? (
                <legend style={{ fontSize: typographyTokens.h5.fontSize, fontWeight: 600, color: colorTokens.neutral[800], marginBottom: spacingTokens[2], padding: 0 }}>
                  {section.title}
                </legend>
              ) : null}
              {section.description ? (
                <p style={{ margin: `0 0 ${spacingTokens[3]}`, fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[500] }}>{section.description}</p>
              ) : null}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: spacingTokens[4] }}>
                {section.fields.map((field) => (
                  <div key={field.id} style={{ gridColumn: columns === 1 ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', gap: spacingTokens[1] }}>
                    {field.label ? (
                      <span style={{ fontSize: typographyTokens.label.fontSize, fontWeight: 500, color: colorTokens.neutral[700] }}>
                        {field.label}
                        {field.required ? <span style={{ color: colorTokens.danger.DEFAULT }}> *</span> : null}
                      </span>
                    ) : null}
                    {field.children}
                    {field.error ? (
                      <span role="alert" style={{ fontSize: typographyTokens.caption.fontSize, color: colorTokens.danger.DEFAULT }}>{field.error}</span>
                    ) : field.hint ? (
                      <span style={{ fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400] }}>{field.hint}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacingTokens[2], marginTop: spacingTokens[6], paddingTop: spacingTokens[4], borderTop: `1px solid ${colorTokens.neutral[200]}` }}>
          {autoSave && saveStateLabel ? (
            <span
              aria-live="polite"
              style={{
                marginRight: 'auto',
                fontSize: typographyTokens.caption.fontSize,
                color: saveState === 'error' ? colorTokens.danger.DEFAULT : colorTokens.neutral[500],
                borderRadius: getRadius(999),
                background: saveState === 'error' ? colorTokens.danger.surface : colorTokens.neutral[100],
                padding: `4px ${spacingTokens[3]}`,
              }}
            >
              {saveStateLabel}
            </span>
          ) : null}
          {onCancel ? (
            <button type="button" onClick={onCancel} style={{ minHeight: 48, padding: `0 ${spacingTokens[4]}`, borderRadius: getRadius(8), border: `1px solid ${colorTokens.neutral[300]}`, background: 'transparent', cursor: 'pointer', fontSize: typographyTokens.label.fontSize, color: colorTokens.neutral[600] }}>
              Cancel
            </button>
          ) : null}
          <button type="submit" style={{ minHeight: 48, padding: `0 ${spacingTokens[5]}`, borderRadius: getRadius(8), border: 'none', background: colorTokens.primary.DEFAULT, color: '#ffffff', cursor: 'pointer', fontSize: typographyTokens.label.fontSize, fontWeight: 600 }}>
            {submitLabel}
          </button>
        </div>
      </form>
    );
  },
);

Form.displayName = 'Form';
export default Form;
