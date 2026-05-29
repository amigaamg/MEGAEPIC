'use client';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 24, text, fullPage }: LoadingSpinnerProps) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '2.5px solid rgba(255,255,255,0.08)',
        borderTopColor: '#06B6D4',
        animation: 'amx-spin 0.7s linear infinite',
      }} />
      {text && <span style={{ fontSize: 13, color: '#64748B' }}>{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#070B14' }}>
        {content}
      </div>
    );
  }

  return content;
}
