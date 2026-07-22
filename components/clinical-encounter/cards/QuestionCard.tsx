'use client';
import React, { useState } from 'react';
import { QuestionCard as QuestionCardType } from '@/lib/amexan/encounter-engine/types/ces';

interface Props {
  card: QuestionCardType;
  onAnswer: (value: string | number | boolean | string[]) => void;
  currentValue?: string | number | boolean | string[];
}

export function QuestionCardComponent({ card, onAnswer, currentValue }: Props) {
  const [textInput, setTextInput] = useState(typeof currentValue === 'string' ? currentValue : '');

  const handleChip = (val: string) => {
    onAnswer(val);
  };

  const handleMultiChip = (val: string) => {
    const current = Array.isArray(currentValue) ? currentValue : [];
    const next = current.includes(val)
      ? current.filter((v: string) => v !== val)
      : [...current, val];
    onAnswer(next);
  };

  const handleScale = (val: number) => {
    onAnswer(val);
  };

  const handleBoolean = (val: boolean) => {
    onAnswer(val);
  };

  const handleTextBlur = () => {
    if (textInput.trim()) onAnswer(textInput.trim());
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && textInput.trim()) {
      onAnswer(textInput.trim());
    }
  };

  const renderContent = () => {
    if (card.type === 'group') {
      // Group cards just show their sub-questions
      return (
        <div className="cq-group">
          {card.options?.map(opt => (
            <button
              key={opt.value}
              className={`cq-chip ${currentValue === opt.value ? 'cq-chip-selected' : ''}`}
              onClick={() => handleChip(opt.value)}
            >
              {opt.icon && <span className="cq-chip-icon">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (card.type === 'single') {
      return (
        <div className="cq-group">
          {card.options?.map(opt => (
            <button
              key={opt.value}
              className={`cq-chip ${currentValue === opt.value ? 'cq-chip-selected' : ''}`}
              onClick={() => handleChip(opt.value)}
            >
              {opt.icon && <span className="cq-chip-icon">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (card.type === 'multiple' || card.type === 'chips') {
      const chips = card.chips || card.options?.map(o => o.label) || [];
      return (
        <div className="cq-group cq-group-multi">
          {chips.map(chip => {
            const val = typeof chip === 'string' ? chip : chip;
            const selected = Array.isArray(currentValue) && currentValue.includes(val);
            return (
              <button
                key={val}
                className={`cq-chip cq-chip-multi ${selected ? 'cq-chip-selected' : ''}`}
                onClick={() => handleMultiChip(val)}
              >
                {selected ? '✓ ' : ''}{val}
              </button>
            );
          })}
        </div>
      );
    }

    if (card.type === 'scale') {
      const labels = card.options?.reduce((acc: Record<string, string>, o) => {
        acc[o.value] = o.label;
        return acc;
      }, {}) || {};
      return (
        <div className="cq-scale">
          <div className="cq-scale-buttons">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                className={`cq-scale-btn ${currentValue === i ? 'cq-scale-btn-active' : ''}`}
                onClick={() => handleScale(i)}
              >
                {i}
              </button>
            ))}
          </div>
          {currentValue !== undefined && labels[String(currentValue)] && (
            <div className="cq-scale-label">{labels[String(currentValue)]}</div>
          )}
        </div>
      );
    }

    if (card.type === 'boolean') {
      return (
        <div className="cq-boolean">
          <button
            className={`cq-bool-btn ${currentValue === true ? 'cq-bool-yes' : ''}`}
            onClick={() => handleBoolean(true)}
          >
            Yes
          </button>
          <button
            className={`cq-bool-btn ${currentValue === false ? 'cq-bool-no' : ''}`}
            onClick={() => handleBoolean(false)}
          >
            No
          </button>
        </div>
      );
    }

    if (card.type === 'text') {
      return (
        <input
          className="cq-text-input"
          type="text"
          placeholder="Type your response…"
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          autoFocus
        />
      );
    }

    return null;
  };

  return (
    <div className="cq-card ce-card-enter">
      {card.groupLabel && (
        <div className="cq-subgroup-label">{card.groupLabel}</div>
      )}
      <div className="cq-question">{card.question}</div>
      {renderContent()}

      <style>{`
        .cq-card {
          background: var(--ce-card-bg);
          border: 1px solid var(--ce-card-border);
          border-radius: var(--ce-radius-lg);
          padding: var(--ce-space-lg) var(--ce-space-xl);
          box-shadow: var(--ce-card-shadow);
        }
        .cq-subgroup-label {
          font-size: 11px; font-weight: 600; color: var(--ce-sky-600);
          text-transform: uppercase; letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .cq-question {
          font-size: 14px; font-weight: 500; color: var(--ce-text);
          margin-bottom: var(--ce-space-md);
          line-height: 1.5;
        }
        .cq-group {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .cq-group-multi {
          gap: 4px;
        }
        .cq-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 7px 14px;
          border: 1px solid var(--ce-chip-border);
          border-radius: 20px;
          background: var(--ce-chip-bg);
          color: var(--ce-chip-text);
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all var(--ce-transition);
          white-space: nowrap; line-height: 1.3;
        }
        .cq-chip:hover {
          background: var(--ce-sky-100);
          border-color: var(--ce-sky-300);
        }
        .cq-chip-selected {
          background: var(--ce-chip-selected-bg) !important;
          color: var(--ce-chip-selected-text) !important;
          border-color: var(--ce-chip-selected-bg) !important;
        }
        .cq-chip-icon { font-size: 14px; }
        .cq-scale-buttons {
          display: flex; gap: 4px; flex-wrap: wrap;
        }
        .cq-scale-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--ce-border);
          border-radius: var(--ce-radius-sm);
          background: var(--ce-card-bg);
          color: var(--ce-text);
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all var(--ce-transition);
        }
        .cq-scale-btn:hover { background: var(--ce-sky-50); border-color: var(--ce-sky-300); }
        .cq-scale-btn-active { background: var(--ce-chip-selected-bg); color: white; border-color: var(--ce-chip-selected-bg); }
        .cq-scale-label { font-size: 12px; color: var(--ce-text-secondary); margin-top: 6px; }
        .cq-boolean { display: flex; gap: 8px; }
        .cq-bool-btn {
          flex: 1; padding: 10px 16px;
          border: 1px solid var(--ce-border);
          border-radius: var(--ce-radius-md);
          background: var(--ce-card-bg);
          color: var(--ce-text);
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all var(--ce-transition);
        }
        .cq-bool-btn:hover { border-color: var(--ce-sky-300); }
        .cq-bool-yes { background: #E8F5E9; color: #1E8E3E; border-color: #A5D6A7; }
        .cq-bool-no { background: #FFEBEE; color: #D93025; border-color: #EF9A9A; }
        .cq-text-input {
          width: 100%; padding: 10px 14px;
          border: 1px solid var(--ce-border);
          border-radius: var(--ce-radius-md);
          background: var(--ce-surface);
          color: var(--ce-text);
          font-size: 14px; font-family: var(--ce-font);
          outline: none; box-sizing: border-box;
          transition: border-color var(--ce-transition);
        }
        .cq-text-input:focus {
          border-color: var(--ce-sky-400);
          box-shadow: 0 0 0 2px var(--ce-sky-50);
        }
        .cq-text-input::placeholder { color: var(--ce-text-muted); }
      `}</style>
    </div>
  );
}
