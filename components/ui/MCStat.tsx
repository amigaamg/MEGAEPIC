interface MCStatProps {
  label: string;
  value: string;
  color: string;
}

export function MCStat({ label, value, color }: MCStatProps) {
  return (
    <div style={{ padding: '14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
