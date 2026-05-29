'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DEPARTMENTS } from '@/lib/clinicalProtocols';
import { WORKSPACE_DATA, type DepartmentInfo } from '@/lib/workspaceData';

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#070B14;color:#E2E8F0;overflow-x:hidden}
  .bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at 50% 20%,black 30%,transparent 70%)}
  .page{position:relative;z-index:1;padding:32px 5%;max-width:1200px;margin:0 auto}
  .page-head{font-size:1.25rem;font-weight:700;color:#F1F5F9;margin-bottom:4px}
  .page-sub{font-size:.8125rem;color:#64748B;margin-bottom:24px}
  .search-input{width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#E2E8F0;font-size:.8125rem;outline:none;font-family:'Inter',sans-serif;margin-bottom:20px}
  .search-input::placeholder{color:#475569}
  .search-input:focus{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.04)}
  .dept-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
  .dept-card{display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);cursor:pointer;transition:all .2s;text-decoration:none}
  .dept-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);transform:translateY(-2px)}
  .dept-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0}
  .dept-info{flex:1;min-width:0}
  .dept-name{font-size:.875rem;font-weight:600;color:#F1F5F9}
  .dept-desc{font-size:.6875rem;color:#64748B;margin-top:2px;line-height:1.5}
  .dept-meta{display:flex;gap:8px;margin-top:6px}
  .dept-meta-item{font-size:.625rem;color:#475569;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04)}
  .back-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.4rem .9rem;border-radius:6px;border:1px solid rgba(255,255,255,.06);background:transparent;color:#94A3B8;font-size:.75rem;text-decoration:none;cursor:pointer;margin-bottom:20px;font-family:'Inter',sans-serif}
  .back-btn:hover{background:rgba(255,255,255,.04);color:#E2E8F0}
  .empty{text-align:center;padding:60px 20px;color:#475569;font-size:.8125rem;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.02)}
`;

export default function DepartmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');

  useEffect(() => { if (!loading && !user) router.replace('/clinical-auth'); }, [user, loading, router]);

  if (loading || !user) return null;

  const allDepts: (DepartmentInfo & { key: string })[] = WORKSPACE_DATA.map(d => ({ ...d, key: d.key }));
  const filtered = allDepts.filter(d => {
    const reg = DEPARTMENTS[d.key];
    const label = reg?.label || d.label;
    return label.toLowerCase().includes(search.toLowerCase()) || d.key.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-grid" />
      <div className="page">
        <div className="back-btn" onClick={() => router.push('/workspace')}>← Back to Hub</div>
        <div className="page-head">All Departments</div>
        <div className="page-sub">{WORKSPACE_DATA.length} departments · Select a department to view clinical units</div>

        <input className="search-input" type="text" placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} />

        {filtered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: '1.25rem', marginBottom: 8 }}>🔍</div>
            <div>No departments match &ldquo;{search}&rdquo;</div>
          </div>
        ) : (
          <div className="dept-grid">
            {filtered.map(dept => {
              const reg = DEPARTMENTS[dept.key];
              const color = reg?.color || dept.color;
              return (
                <div key={dept.key} className="dept-card" onClick={() => router.push(`/workspace/${dept.key}`)}>
                  <div className="dept-icon" style={{ background: `${color}18`, color }}>{reg?.icon || dept.icon}</div>
                  <div className="dept-info">
                    <div className="dept-name">{reg?.label || dept.label}</div>
                    <div className="dept-desc">{dept.description}</div>
                    <div className="dept-meta">
                      <span className="dept-meta-item">{dept.units.length} units</span>
                      <span className="dept-meta-item" style={{ color: '#00D68F' }}>{dept.activeCases} active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
