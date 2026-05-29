'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/firebase/authService';

export default function WorkspaceRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/clinical-auth');
      return;
    }
    getUserProfile(user.uid).then(profile => {
      if (!profile || profile.onboardingStatus !== 'complete') {
        router.replace('/clinical-auth');
        return;
      }
      if (profile.accountType === 'clinician') {
        router.replace('/workspace/clinician');
      } else {
        router.replace('/workspace/facility');
      }
    });
  }, [user, loading, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070B14', color: '#64748B', fontSize: '.875rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 16px', borderRadius: '50%', border: '3px solid rgba(255,255,255,.04)', borderTopColor: '#06B6D4', animation: 'spin .8s linear infinite' }} />
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        Loading your workspace...
      </div>
    </div>
  );
}
