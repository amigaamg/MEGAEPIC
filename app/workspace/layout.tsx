'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OrganizationSwitcher } from '@/src/ui/workspace/OrganizationSwitcher';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Auth guard for all workspace routes
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/clinical-auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070B14', color: '#64748B', fontSize: '.875rem' }}>
        Loading workspace...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', color: '#E2E8F0' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        background: 'rgba(7,11,20,.92)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OrganizationSwitcher />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '.6875rem', color: '#475569' }}>{user.email}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
