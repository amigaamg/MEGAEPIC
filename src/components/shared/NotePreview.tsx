'use client';
import React, { useState } from 'react';

interface NotePreviewProps {
  title: string;
  content: string;
  onCopy?: () => void;
  onPrint?: () => void;
}

export function NotePreview({ title, content, onCopy, onPrint }: NotePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    onCopy?.();
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${content}</pre>`);
      win.document.close();
      win.print();
    }
    onPrint?.();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border rounded hover:bg-gray-50"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border rounded hover:bg-gray-50"
          >
            Print
          </button>
        </div>
      </div>
      <div className="p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
      </div>
    </div>
  );
}
