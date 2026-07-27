'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { DocumentationEngine } from '@/lib/amexan/documentation/engine';
import { AtomicFactStore } from '@/lib/amexan/storage/engine';
import { DOCUMENT_TEMPLATES } from '@/lib/amexan/documentation/types';
import type { ClinicalDocument, DocumentType } from '@/lib/amexan/documentation/types';

const DOCUMENT_ICONS: Record<string, string> = {
  soap_note: '📋',
  admission_summary: '🏥',
  discharge_summary: '🚪',
  referral_letter: '📨',
  consultation_note: '👨‍⚕️',
  ward_round_note: '🛏️',
  operation_note: '🔪',
  death_summary: '⚰️',
  clinic_note: '💊',
  handover_note: '🤝',
  progress_note: '📈',
  investigation_request: '🔬',
  prescription_chart: '💊',
  nursing_note: '👩‍⚕️',
  insurance_form: '📄',
  death_certificate: '📜',
  immunization_record: '💉',
  antenatal_record: '🤰',
  research_form: '📊',
};

interface DocumentationViewerProps {
  store: AtomicFactStore;
}

export function DocumentationViewer({ store }: DocumentationViewerProps) {
  const engine = useMemo(() => new DocumentationEngine(store), [store]);
  const [docs, setDocs] = useState<ClinicalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ClinicalDocument | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [patientId, setPatientId] = useState('pat_demo_001');
  const [showTemplateList, setShowTemplateList] = useState(false);

  const refresh = useCallback(() => {
    if (typeFilter !== 'all') {
      setDocs(engine.getDocumentsByType(typeFilter as DocumentType));
    } else {
      setDocs(engine.getDocumentsByPatient(patientId));
    }
  }, [engine, typeFilter, patientId]);

  useEffect(() => { refresh() }, [refresh]);

  const stats = useMemo(() => engine.getStats(), [engine]);

  const generateDoc = (type: DocumentType) => {
    engine.generateDocument(patientId, type, { encounterId: 'enc_demo_001', authoredBy: 'Dr. Demo' });
    refresh();
    setShowTemplateList(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Documents</div>
          <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{stats.total}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Types</div>
          <div className="text-xl font-bold" style={{ color: 'var(--purple)' }}>{Object.keys(stats.byType).length}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Finalized</div>
          <div className="text-xl font-bold" style={{ color: 'var(--green)' }}>{stats.byStatus.final || 0}</div>
        </div>
        <div className="card p-3 flex items-end justify-end gap-1">
          <button onClick={() => setShowTemplateList(!showTemplateList)} className="btn-primary text-xs px-3 py-1.5">
            + Generate
          </button>
        </div>
      </div>

      {showTemplateList && (
        <div className="card p-3">
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Select Document Type</div>
          <input
            className="input mb-2"
            placeholder="Patient ID"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            style={{ fontSize: 11 }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {(Object.entries(DOCUMENT_TEMPLATES) as [DocumentType, typeof DOCUMENT_TEMPLATES[DocumentType]][]).map(([type, tmpl]) => (
              <button
                key={type}
                onClick={() => generateDoc(type)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-left text-[10px] transition-colors"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
              >
                <span>{DOCUMENT_ICONS[type] || '📄'}</span>
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        <select className="input w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {(Object.entries(DOCUMENT_TEMPLATES) as [DocumentType, typeof DOCUMENT_TEMPLATES[DocumentType]][]).map(([type, tmpl]) => (
            <option key={type} value={type}>{tmpl.name}</option>
          ))}
        </select>
        <input
          className="input flex-1 min-w-[150px]"
          placeholder="Patient ID"
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
        />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{docs.length} documents</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
          {docs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
              className="flex items-start gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-colors"
              style={{
                background: selectedDoc?.id === doc.id ? 'var(--sky-50)' : 'transparent',
                border: selectedDoc?.id === doc.id ? '1px solid var(--sky-200)' : '1px solid transparent',
              }}
            >
              <span className="text-base">{DOCUMENT_ICONS[doc.documentType] || '📄'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {doc.title}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {doc.documentType.replace(/_/g, ' ')} · v{doc.version} · {doc.status}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(doc.generatedAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
          {docs.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No documents yet. Click "+ Generate" to create one from stored facts.
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="card p-4 flex flex-col gap-3" style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedDoc.title}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {selectedDoc.id} · v{selectedDoc.version} · {selectedDoc.documentType.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadgeDoc status={selectedDoc.status} />
                  {selectedDoc.status === 'draft' && (
                    <button
                      onClick={() => { engine.signDocument(selectedDoc.id, 'Dr. Demo'); refresh(); }}
                      className="text-[10px] px-2 py-1 rounded"
                      style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}
                    >
                      Sign
                    </button>
                  )}
                </div>
              </div>

              {selectedDoc.sections.map(section => (
                <div key={section.id}>
                  <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {section.title}
                  </div>
                  <div
                    className="text-[10px] leading-relaxed whitespace-pre-wrap p-2 rounded"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                </div>
              ))}

              <div className="flex gap-2 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>{selectedDoc.sections.length} sections</span>
                <span>·</span>
                <span>{selectedDoc.sourceFactIds.length} source facts</span>
                {selectedDoc.authoredBy && <><span>·</span><span>Authored by {selectedDoc.authoredBy}</span></>}
                {selectedDoc.signedBy && <><span>·</span><span>Signed by {selectedDoc.signedBy}</span></>}
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center h-48 gap-2">
              <div className="text-2xl">📄</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Select a document
              </div>
              <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                Documents are generated automatically from atomic facts. Click "+ Generate" to create a new clinical document.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadgeDoc({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    draft: { bg: 'var(--surface-elevated)', color: 'var(--text-muted)' },
    final: { bg: 'var(--green-bg)', color: 'var(--green)' },
    amended: { bg: 'var(--sky-50)', color: 'var(--sky-600)' },
    superseded: { bg: 'var(--surface-elevated)', color: 'var(--amber)' },
  };
  const c = colors[status] || colors.draft;
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: c.bg, color: c.color }}>
      {status.toUpperCase()}
    </span>
  );
}
