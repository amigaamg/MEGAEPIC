'use client';
import { useState, useEffect, useRef } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { saveEncounter } from '@/lib/history-engine/userStorage';
import { generatePDF } from '@/lib/history-engine/pdfGenerator';

export default function DocumentEditor() {
  const store = useHistoryStore();
  const documents = store.documents;
  const biodata = store.biodata;
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(documents.fullDocumentation || '');
  }, [documents.fullDocumentation]);

  function handleSave() {
    // Update state with edited content
    const newDocs = { ...documents, fullDocumentation: content };
    useHistoryStore.setState({ documents: newDocs });
    const encounterId = saveEncounter(store);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDownloadPDF() {
    generatePDF(
      `Clinical Note - ${biodata.name || 'Unnamed'}`,
      content,
      biodata.name || 'Unnamed',
      new Date().toLocaleDateString(),
      `enc_${Date.now()}`
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--accent)]">Edit Full Documentation</h2>
          <p className="text-[10px] text-[var(--text-muted)]">Edit the clinical note freely. Changes are saved locally.</p>
        </div>
      </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            ref={textRef}
            value={content}
            onChange={e => { setContent(e.target.value); setSaved(false); }}
            className="w-full h-[55vh] p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-sm font-mono text-[var(--text-primary)] leading-relaxed resize-none outline-none focus:border-[var(--accent)]"
            spellCheck={false}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center p-4 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <button onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${saved ? 'bg-green-500/20 text-green-400' : 'bg-[var(--accent-dim)] text-[var(--accent)] hover:bg-[var(--accent)]/20'}`}>
              {saved ? '✓ Saved' : '💾 Save'}
            </button>
            <button onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
              📄 Download PDF
            </button>
            <button onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-500/10 text-[var(--text-secondary)] hover:bg-gray-500/20">
              📋 Copy
            </button>
          </div>
      </div>
    </div>
  );
}
