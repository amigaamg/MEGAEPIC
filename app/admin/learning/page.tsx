'use client';
import { useState, useMemo } from 'react';
import { BookOpen, Target, Award, Search, Filter, Plus, Edit3, Trash2, ChevronDown, ChevronRight, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Star, BarChart3, Calendar, Users, GraduationCap } from 'lucide-react';
import { CompetencyDomain, CompetencyLevel, type Competency, type CompetencyEvidence, type LearningModule, type AssessmentConfig } from '@/lib/amexan/constitution/learning-engine';

const DOMAINS: { value: CompetencyDomain; label: string; color: string }[] = [
  { value: 'clinical_reasoning', label: 'Clinical Reasoning', color: '#06B6D4' },
  { value: 'procedures', label: 'Procedures', color: '#10B981' },
  { value: 'communication', label: 'Communication', color: '#3B82F6' },
  { value: 'professionalism', label: 'Professionalism', color: '#8B5CF6' },
  { value: 'practice_based_learning', label: 'Practice-Based Learning', color: '#F59E0B' },
  { value: 'systems_based_practice', label: 'Systems-Based Practice', color: '#EC4899' },
  { value: 'medical_knowledge', label: 'Medical Knowledge', color: '#EF4444' },
];

const LEVELS: { value: CompetencyLevel; label: string; color: string }[] = [
  { value: 'novice', label: 'Novice', color: '#EF4444' },
  { value: 'advanced_beginner', label: 'Advanced Beginner', color: '#F59E0B' },
  { value: 'competent', label: 'Competent', color: '#3B82F6' },
  { value: 'proficient', label: 'Proficient', color: '#10B981' },
  { value: 'expert', label: 'Expert', color: '#8B5CF6' },
];

const MODULE_TYPES = ['case', 'lecture', 'simulation', 'osce', 'workshop', 'self_study', 'rotation'] as const;

const MOCK_COMPETENCIES: Competency[] = [
  { id: 'COMP-001', actorAmxUid: 'DOC-001' as any, domain: 'clinical_reasoning', level: 'proficient', score: 85, evidence: [{ id: 'EV-001', type: 'case_log', title: 'Complex Case Review', description: 'Reviewed complex diagnostic case', score: 90, maxScore: 100, date: Date.now() - 86400000 * 30, assessor: 'Dr. Kamau', link: null, tags: ['clinical_reasoning'], certified: true }], supervisor: 'Dr. Mwangi', lastAssessed: Date.now() - 86400000 * 30, nextAssessment: Date.now() + 86400000 * 180, createdAt: Date.now() - 86400000 * 365, updatedAt: Date.now() - 86400000 * 30 },
  { id: 'COMP-002', actorAmxUid: 'DOC-001' as any, domain: 'procedures', level: 'competent', score: 72, evidence: [{ id: 'EV-002', type: 'osce', title: 'OSCE Station 3', description: 'Practical skills assessment', score: 75, maxScore: 100, date: Date.now() - 86400000 * 60, assessor: 'Dr. Ochieng', link: null, tags: ['procedures'], certified: true }], supervisor: 'Dr. Mwangi', lastAssessed: Date.now() - 86400000 * 60, nextAssessment: Date.now() + 86400000 * 120, createdAt: Date.now() - 86400000 * 365, updatedAt: Date.now() - 86400000 * 60 },
  { id: 'COMP-003', actorAmxUid: 'NUR-001' as any, domain: 'communication', level: 'advanced_beginner', score: 58, evidence: [], supervisor: null, lastAssessed: Date.now() - 86400000 * 7, nextAssessment: null, createdAt: Date.now() - 86400000 * 90, updatedAt: Date.now() - 86400000 * 7 },
  { id: 'COMP-004', actorAmxUid: 'LAB-001' as any, domain: 'medical_knowledge', level: 'novice', score: 35, evidence: [{ id: 'EV-003', type: 'exam', title: 'Lab Safety Exam', description: 'Safety protocols assessment', score: 35, maxScore: 100, date: Date.now() - 86400000 * 14, assessor: 'Lab Supervisor', link: null, tags: ['medical_knowledge'], certified: false }], supervisor: 'Lab Manager', lastAssessed: Date.now() - 86400000 * 14, nextAssessment: Date.now() + 86400000 * 60, createdAt: Date.now() - 86400000 * 180, updatedAt: Date.now() - 86400000 * 14 },
  { id: 'COMP-005', actorAmxUid: 'DOC-002' as any, domain: 'professionalism', level: 'expert', score: 95, evidence: [{ id: 'EV-004', type: 'supervisor_review', title: 'Annual Review', description: 'Annual professionalism review', score: 95, maxScore: 100, date: Date.now() - 86400000 * 180, assessor: 'Chief of Medicine', link: null, tags: ['professionalism'], certified: true }], supervisor: 'Chief of Medicine', lastAssessed: Date.now() - 86400000 * 180, nextAssessment: Date.now() + 86400000 * 365, createdAt: Date.now() - 86400000 * 730, updatedAt: Date.now() - 86400000 * 180 },
];

const MOCK_MODULES: LearningModule[] = [
  { id: 'MOD-001', title: 'Advanced Diagnostic Reasoning', description: 'Build advanced clinical reasoning skills through complex case studies', domain: 'clinical_reasoning', level: 'proficient', type: 'case', duration: 120, prerequisites: [], learningObjectives: ['Apply differential diagnosis frameworks', 'Analyze complex clinical presentations', 'Develop evidence-based treatment plans'], assessment: { type: 'knowledge_check', passingScore: 70, maxAttempts: 3, timeLimit: 60, questions: [] }, tags: ['clinical_reasoning', 'diagnostics'], active: true, createdAt: Date.now() - 86400000 * 30, updatedAt: Date.now() - 86400000 * 7 },
  { id: 'MOD-002', title: 'Phlebotomy Techniques', description: 'Master venipuncture and capillary blood collection procedures', domain: 'procedures', level: 'competent', type: 'simulation', duration: 60, prerequisites: [], learningObjectives: ['Demonstrate proper venipuncture technique', 'Identify appropriate collection sites', 'Handle complications during collection'], assessment: { type: 'osce', passingScore: 80, maxAttempts: 2, timeLimit: 30, questions: [] }, tags: ['procedures', 'phlebotomy'], active: true, createdAt: Date.now() - 86400000 * 60, updatedAt: Date.now() - 86400000 * 14 },
  { id: 'MOD-003', title: 'Patient Communication Skills', description: 'Develop effective communication with patients and healthcare teams', domain: 'communication', level: 'advanced_beginner', type: 'workshop', duration: 90, prerequisites: [], learningObjectives: ['Practice active listening techniques', 'Deliver difficult news effectively', 'Document patient interactions'], assessment: { type: 'peer_assessment', passingScore: 75, maxAttempts: 3, timeLimit: 45, questions: [] }, tags: ['communication', 'soft_skills'], active: true, createdAt: Date.now() - 86400000 * 45, updatedAt: Date.now() - 86400000 * 10 },
  { id: 'MOD-004', title: 'Medical Ethics and Professionalism', description: 'Understand ethical principles and professional standards in healthcare', domain: 'professionalism', level: 'competent', type: 'lecture', duration: 45, prerequisites: [], learningObjectives: ['Apply ethical principles to clinical scenarios', 'Understand professional obligations', 'Recognize boundary violations'], assessment: { type: 'knowledge_check', passingScore: 70, maxAttempts: 3, timeLimit: 30, questions: [] }, tags: ['professionalism', 'ethics'], active: true, createdAt: Date.now() - 86400000 * 90, updatedAt: Date.now() - 86400000 * 20 },
];

function getLevelIndex(level: CompetencyLevel): number {
  const order: CompetencyLevel[] = ['novice', 'advanced_beginner', 'competent', 'proficient', 'expert'];
  return order.indexOf(level);
}

function getProgressColor(score: number): string {
  if (score >= 85) return '#10B981';
  if (score >= 70) return '#3B82F6';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export default function LearningPage() {
  const [competencies] = useState<Competency[]>(MOCK_COMPETENCIES);
  const [modules] = useState<LearningModule[]>(MOCK_MODULES);
  const [activeTab, setActiveTab] = useState<'competencies' | 'modules' | 'assignments' | 'gaps'>('competencies');
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<CompetencyDomain | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CompetencyLevel | 'all'>('all');

  const filteredCompetencies = useMemo(() => {
    return competencies.filter(c => {
      if (domainFilter !== 'all' && c.domain !== domainFilter) return false;
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.actorAmxUid.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q);
      }
      return true;
    });
  }, [competencies, search, domainFilter, levelFilter]);

  const summary = useMemo(() => {
    const avgScore = competencies.reduce((s, c) => s + c.score, 0) / (competencies.length || 1);
    const expertCount = competencies.filter(c => c.level === 'expert').length;
    const noviceCount = competencies.filter(c => c.level === 'novice').length;
    const pendingAssessment = competencies.filter(c => !c.nextAssessment).length;
    return { avgScore, expertCount, noviceCount, pendingAssessment, total: competencies.length };
  }, [competencies]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Learning & Competency</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Manage competency frameworks, learning modules, and gap analysis</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Module
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Competencies', value: summary.total, color: '#06B6D4', icon: <Target size={14} /> },
          { label: 'Avg Score', value: `${Math.round(summary.avgScore)}%`, color: '#3B82F6', icon: <BarChart3 size={14} /> },
          { label: 'Experts', value: summary.expertCount, color: '#8B5CF6', icon: <Star size={14} /> },
          { label: 'Novices', value: summary.noviceCount, color: '#EF4444', icon: <AlertCircle size={14} /> },
          { label: 'Pending Assessment', value: summary.pendingAssessment, color: '#F59E0B', icon: <Clock size={14} /> },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
        {(['competencies', 'modules', 'assignments', 'gaps'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: activeTab === tab ? 'rgba(6,182,212,0.15)' : 'transparent', color: activeTab === tab ? '#06B6D4' : '#64748B', fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'competencies' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input placeholder="Search by actor or domain..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', height: 36, padding: '0 10px 0 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
            </div>
            <select value={domainFilter} onChange={e => setDomainFilter(e.target.value as CompetencyDomain | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
              <option value="all">All Domains</option>
              {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value as CompetencyLevel | 'all')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
              <option value="all">All Levels</option>
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredCompetencies.map(comp => {
              const domain = DOMAINS.find(d => d.value === comp.domain);
              const level = LEVELS.find(l => l.value === comp.level);
              const progressColor = getProgressColor(comp.score);
              return (
                <div key={comp.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${domain?.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: domain?.color }}><BookOpen size={16} /></div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{comp.actorAmxUid} <span style={{ fontSize: 10, color: '#64748B' }}>{comp.domain}</span></div>
                        <div style={{ fontSize: 10, color: '#64748B' }}>Score: {comp.score}/{comp.evidence.reduce((s, e) => s + e.maxScore, 0) || 100}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${level?.color}22`, color: level?.color }}>{level?.label}</span>
                      {comp.nextAssessment && (
                        <span style={{ fontSize: 10, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> {new Date(comp.nextAssessment).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${comp.score}%`, height: '100%', borderRadius: 3, background: progressColor, transition: 'width 0.3s' }} />
                  </div>
                  {comp.evidence.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {comp.evidence.map(e => (
                        <span key={e.id} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: e.certified ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: e.certified ? '#10B981' : '#94A3B8' }}>
                          {e.type}: {e.title} ({e.score}/{e.maxScore})
                        </span>
                      ))}
                    </div>
                  )}
                  {comp.supervisor && (
                    <div style={{ fontSize: 10, color: '#64748B', marginTop: 6 }}>Supervisor: {comp.supervisor}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {modules.map(mod => {
            const domain = DOMAINS.find(d => d.value === mod.domain);
            const level = LEVELS.find(l => l.value === mod.level);
            return (
              <div key={mod.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${domain?.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: domain?.color }}><GraduationCap size={16} /></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{mod.title}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>{mod.id} · {mod.type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${level?.color}22`, color: level?.color }}>{level?.label}</span>
                </div>
                <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, marginBottom: 10 }}>{mod.description}</p>
                <div className="flex items-center gap-4" style={{ fontSize: 10, color: '#94A3B8', marginBottom: 10 }}>
                  <span className="flex items-center gap-1"><Clock size={10} /> {mod.duration} min</span>
                  <span className="flex items-center gap-1"><Users size={10} /> {mod.learningObjectives.length} objectives</span>
                  <span style={{ color: domain?.color }}>{domain?.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {mod.tags.map(t => (
                    <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#94A3B8' }}>{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: '#64748B' }}>Assessment: {mod.assessment.type} (pass: {mod.assessment.passingScore}%)</span>
                  <div className="flex gap-1">
                    <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}><Edit3 size={10} /></button>
                    <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}><Trash2 size={10} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Learning Assignments</div>
          {[
            { actor: 'DOC-001', name: 'Dr. Wanjiku', module: 'Advanced Diagnostic Reasoning', domain: 'clinical_reasoning', assignedAt: Date.now() - 86400000 * 7, dueAt: Date.now() + 86400000 * 14, status: 'in_progress' },
            { actor: 'NUR-001', name: 'Nurse Odera', module: 'Patient Communication Skills', domain: 'communication', assignedAt: Date.now() - 86400000 * 14, dueAt: Date.now() + 86400000 * 7, status: 'pending' },
            { actor: 'LAB-001', name: 'Lab Tech Mutua', module: 'Phlebotomy Techniques', domain: 'procedures', assignedAt: Date.now() - 86400000 * 3, dueAt: Date.now() + 86400000 * 21, status: 'in_progress' },
            { actor: 'DOC-002', name: 'Dr. Kamau', module: 'Medical Ethics and Professionalism', domain: 'professionalism', assignedAt: Date.now() - 86400000 * 30, dueAt: Date.now() - 86400000 * 1, status: 'overdue' },
          ].map((a, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#8B5CF6', fontWeight: 600 }}>{a.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9' }}>{a.name} <span style={{ fontSize: 10, color: '#64748B' }}>{a.actor}</span></div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>{a.module} · {a.domain}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 10, color: '#64748B' }}>Due: {new Date(a.dueAt).toLocaleDateString()}</span>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: a.status === 'overdue' ? 'rgba(239,68,68,0.15)' : a.status === 'in_progress' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: a.status === 'overdue' ? '#EF4444' : a.status === 'in_progress' ? '#3B82F6' : '#F59E0B' }}>{a.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="flex flex-col gap-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Competency Gap Analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {[
              { actor: 'DOC-001', name: 'Dr. Wanjiku', domain: 'procedures', currentLevel: 'competent', targetLevel: 'proficient', gap: 'Needs progression: competent → proficient', recommendation: 'Advanced procedures simulation module' },
              { actor: 'NUR-001', name: 'Nurse Odera', domain: 'clinical_reasoning', currentLevel: 'novice', targetLevel: 'competent', gap: 'Needs progression: novice → competent', recommendation: 'Clinical reasoning case studies' },
              { actor: 'LAB-001', name: 'Lab Tech Mutua', domain: 'communication', currentLevel: 'novice', targetLevel: 'competent', gap: 'Needs progression: novice → competent', recommendation: 'Communication workshop' },
              { actor: 'DOC-002', name: 'Dr. Kamau', domain: 'professionalism', currentLevel: 'expert', targetLevel: 'expert', gap: 'No gap identified', recommendation: 'Maintain current development plan' },
            ].map((gap, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 6 }}>{gap.name} <span style={{ fontSize: 10, color: '#64748B' }}>{gap.actor}</span></div>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Domain: {gap.domain}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>{gap.gap}</div>
                <div style={{ padding: '6px 10', borderRadius: 6, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', fontSize: 11, color: '#06B6D4' }}>
                  <strong>Recommendation:</strong> {gap.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}