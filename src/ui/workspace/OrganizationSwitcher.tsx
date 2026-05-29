'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, signOutUser } from '@/lib/firebase/authService';
import { getOrganization, listUserOrgs, switchActiveOrganization } from '@/lib/firebase/organizationService';
import type { Organization } from '@/lib/firebase/organizationService';

const CSS = `
  .org-switcher{position:relative}
  .org-trigger{display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#94A3B8;font-size:.75rem;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;white-space:nowrap}
  .org-trigger:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);color:#E2E8F0}
  .org-trigger .dot{width:6px;height:6px;border-radius:50%;background:#10B981;flex-shrink:0}
  .org-trigger .arrow{font-size:.5rem;color:#475569;margin-left:2px}
  .org-dropdown{position:absolute;top:calc(100% + 6px);right:0;min-width:220px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#0F172A;box-shadow:0 20px 60px rgba(0,0,0,.4);overflow:hidden;z-index:200}
  .org-dd-header{padding:10px 14px;font-size:.625rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid rgba(255,255,255,.04)}
  .org-dd-item{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:all .1s;font-size:.8125rem;color:#94A3B8}
  .org-dd-item:hover{background:rgba(255,255,255,.03);color:#E2E8F0}
  .org-dd-item.active{background:rgba(6,182,212,.06);color:#06B6D4}
  .org-dd-item .check{visibility:hidden;margin-left:auto}
  .org-dd-item.active .check{visibility:visible}
  .org-dd-divider{height:1px;background:rgba(255,255,255,.04);margin:4px 0}
  .org-dd-footer{padding:8px 14px;border-top:1px solid rgba(255,255,255,.04)}
  .org-dd-footer-item{font-size:.6875rem;color:#475569;cursor:pointer;padding:4px 0;transition:color .15s}
  .org-dd-footer-item:hover{color:#EF4444}
`;

export function OrganizationSwitcher() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getUserProfile(user.uid).then(async (profile) => {
      if (profile && profile.organizations.length > 0) {
        const orgList: Organization[] = [];
        for (const id of profile.organizations) {
          const org = await getOrganization(id);
          if (org) orgList.push(org);
        }
        setOrgs(orgList);
        const active = orgList.find(o => o.id === profile.activeOrganizationId) || orgList[0];
        setActiveOrg(active);
      }
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSwitchOrg = async (org: Organization) => {
    if (!user) return;
    await switchActiveOrganization(user.uid, org.id);
    setActiveOrg(org);
    setOpen(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await signOutUser();
    router.replace('/clinical-auth');
  };

  if (loading || !activeOrg) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="org-switcher" ref={ref}>
        <div className="org-trigger" onClick={() => setOpen(!open)}>
          <span className="dot" />
          {activeOrg?.name || 'Select Organization'}
          <span className="arrow">▼</span>
        </div>
        {open && (
          <div className="org-dropdown">
            <div className="org-dd-header">Your Organizations</div>
            {orgs.map(org => (
              <div key={org.id} className={`org-dd-item${org.id === activeOrg?.id ? ' active' : ''}`} onClick={() => handleSwitchOrg(org)}>
                🏥 {org.name}
                <span className="check">✓</span>
              </div>
            ))}
            <div className="org-dd-divider" />
            <div className="org-dd-footer">
              <div className="org-dd-footer-item" onClick={handleLogout}>Sign Out</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
