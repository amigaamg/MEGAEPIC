'use client';
import AMEXANSidebar from './AMEXANSidebar';
import AMEXANCommandBar from './AMEXANCommandBar';

interface Props {
  children: React.ReactNode;
  title?: string;
  patientName?: string;
  activeItem?: string;
  alertCount?: number;
}

export default function AMEXANLayout({ children, title, patientName, activeItem, alertCount }: Props) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--midnight-900), var(--midnight-800), var(--midnight-700))' }}>
      <AMEXANSidebar activeItem={activeItem} />
      <AMEXANCommandBar title={title} patientName={patientName} alertCount={alertCount} />
      <main style={{ marginLeft: 64, paddingTop: 48 }}>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
