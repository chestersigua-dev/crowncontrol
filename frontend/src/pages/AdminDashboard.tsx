import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';

interface PageantSection {
  id: string;
  name: string;
  weight: number;
  isActive: boolean;
  criteria: Criteria[];
}

interface Criteria {
  id: string;
  name: string;
  maxPoints: number;
  weight: number;
}

interface LeaderboardEntry {
  candidateId: string;
  candidateNumber: number;
  candidateName: string;
  avatarUrl: string | null;
  averageScore: number;
  judgeCount: number;
  rank: number;
}

interface JudgeBehavior {
  judgeId: string;
  judgeName: string;
  isChairman?: boolean;
  averageScoreGiven: number;
  totalCandidatesScored: number;
}



interface Candidate {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
}

interface JudgeListItem {
  id: string;
  username: string;
  name: string;
  isChairman: boolean;
  createdAt: string;
  _count: {
    scores: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'candidates' | 'judges' | 'categories' | 'settings'>('analytics');
  const [sections, setSections] = useState<PageantSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  
  // Analytics State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [judgeStats, setJudgeStats] = useState<JudgeBehavior[]>([]);

  // Candidates CRUD State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candNumber, setCandNumber] = useState<number>(1);
  const [candFirstName, setCandFirstName] = useState('');
  const [candLastName, setCandLastName] = useState('');
  const [candBio, setCandBio] = useState('');
  const [candAvatarUrl, setCandAvatarUrl] = useState('');
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);

  // Judges CRUD State
  const [judges, setJudges] = useState<JudgeListItem[]>([]);
  const [judgeUsername, setJudgeUsername] = useState('');
  const [judgePassword, setJudgePassword] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [judgeIsChairman, setJudgeIsChairman] = useState(false);

  // Sections CRUD State
  const [secName, setSecName] = useState('');
  const [secWeight, setSecWeight] = useState<number>(0.1);
  const [secDescription, setSecDescription] = useState('');

  // Criteria CRUD State
  const [critName, setCritName] = useState('');
  const [critMaxPoints, setCritMaxPoints] = useState<number>(50);
  const [critWeight, setCritWeight] = useState<number>(0.5);
  const [critSectionId, setCritSectionId] = useState('');

  // Branding States
  const [brandingTitle, setBrandingTitle] = useState(localStorage.getItem('app_title') || 'CrownControl');
  const [brandingLogo, setBrandingLogo] = useState(localStorage.getItem('app_logo') || '👑');
  const [publicRankingsEnabled, setPublicRankingsEnabled] = useState(true);

  // Admin Management State
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState<'SUPERADMIN' | 'ADMIN'>('ADMIN');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    const { role } = JSON.parse(user);
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    setCurrentUserRole(role);

    loadInitialData();

    // Socket connections
    const socket = getSocket();
    
    socket.on('score:update', (data: any) => {
      console.log('Realtime score update received:', data);
      if (activeSectionId === data.sectionId || !activeSectionId) {
        refreshLeaderboard(activeSectionId || data.sectionId);
      }
    });

    return () => {
      socket.off('score:update');
    };
  }, [navigate, activeSectionId]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get current role from local storage first to know if we are superadmin
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const role = userObj.role || 'ADMIN';
      setCurrentUserRole(role);

      // Load everything sequentially
      await loadBranding();
      await refreshSections();
      await refreshCandidates();
      await refreshJudges();
      await refreshJudgeStats();

      if (role === 'SUPERADMIN') {
        await refreshAdmins();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize administrator dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAdmins = async () => {
    try {
      const list = await api.get('/auth/admins');
      setAdmins(list);
    } catch (e) {
      console.error('Admins refresh error:', e);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!adminUsername || !adminPassword || !adminName || !adminRole) {
      setError('Please fill in all administrator registration fields.');
      return;
    }
    try {
      await api.post('/auth/admins', {
        username: adminUsername,
        password: adminPassword,
        name: adminName,
        role: adminRole
      });
      setAdminUsername('');
      setAdminPassword('');
      setAdminName('');
      setAdminRole('ADMIN');
      alert('Administrator registered successfully!');
      await refreshAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to register new administrator');
    }
  };

  const handleUpdateAdminRole = async (id: string, newRole: string) => {
    setError('');
    try {
      await api.put(`/auth/admins/${id}`, { role: newRole });
      alert('Administrator role updated successfully!');
      await refreshAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator role');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this administrator account?')) return;
    setError('');
    try {
      await api.delete(`/auth/admins/${id}`);
      alert('Administrator account deleted successfully!');
      await refreshAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to delete administrator');
    }
  };

  const loadBranding = async () => {
    try {
      const branding = await api.get('/settings/branding');
      setBrandingTitle(branding.title);
      setBrandingLogo(branding.logo);
      setPublicRankingsEnabled(branding.publicRankingsEnabled !== false);
      localStorage.setItem('app_title', branding.title);
      localStorage.setItem('app_logo', branding.logo);
    } catch (e) {
      console.error('Branding query error:', e);
    }
  };

  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/settings/branding', {
        title: brandingTitle,
        logo: brandingLogo,
        publicRankingsEnabled
      });
      setBrandingTitle(res.title);
      setBrandingLogo(res.logo);
      setPublicRankingsEnabled(res.publicRankingsEnabled !== false);
      localStorage.setItem('app_title', res.title);
      localStorage.setItem('app_logo', res.logo);
      window.dispatchEvent(new Event('brandingUpdated'));
      alert('System branding settings updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update branding config');
    }
  };

  // --- REFRESH UTILITIES ---
  const refreshSections = async () => {
    const sectList: PageantSection[] = await api.get('/settings');
    setSections(sectList);
    const active = sectList.find(s => s.isActive);
    const activeId = active ? active.id : (sectList[0]?.id || '');
    setActiveSectionId(activeId);
    if (activeId) {
      await refreshLeaderboard(activeId);
    }
  };

  const refreshLeaderboard = async (sectionId: string) => {
    if (!sectionId) return;
    try {
      const data = await api.get(`/analytics/leaderboard/${sectionId}`);
      setLeaderboard(data);
    } catch (e) {
      console.error('Leaderboard refresh error:', e);
    }
  };

  const refreshCandidates = async () => {
    const cands: Candidate[] = await api.get('/candidates');
    setCandidates(cands);
    
    // Auto-compute next candidate number suggestion
    if (cands.length > 0) {
      const maxNum = Math.max(...cands.map(c => c.number));
      setCandNumber(maxNum + 1);
    } else {
      setCandNumber(1);
    }
  };

  const refreshJudges = async () => {
    const list = await api.get('/judges');
    setJudges(list);
  };

  const refreshJudgeStats = async () => {
    try {
      const stats = await api.get('/analytics/judge-behavior');
      setJudgeStats(stats);
    } catch (e) {
      console.error('Judge statistics query error:', e);
    }
  };

  // --- CANDIDATE CRUD ACTIONS ---
  const handleAddEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      number: candNumber,
      firstName: candFirstName,
      lastName: candLastName,
      bio: candBio || undefined,
      avatarUrl: candAvatarUrl || undefined,
    };

    try {
      if (editingCandidateId) {
        await api.put(`/candidates/${editingCandidateId}`, payload);
        alert('Candidate details updated successfully!');
      } else {
        await api.post('/candidates', payload);
        alert('New candidate registered successfully!');
      }
      
      // Reset Form State
      setCandFirstName('');
      setCandLastName('');
      setCandBio('');
      setCandAvatarUrl('');
      setEditingCandidateId(null);
      await refreshCandidates();
    } catch (err: any) {
      setError(err.message || 'Candidate operation failed');
    }
  };

  const startEditCandidate = (candidate: Candidate) => {
    setEditingCandidateId(candidate.id);
    setCandNumber(candidate.number);
    setCandFirstName(candidate.firstName);
    setCandLastName(candidate.lastName);
    setCandBio(candidate.bio || '');
    setCandAvatarUrl(candidate.avatarUrl || '');
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate? This will delete their scores as well.')) return;
    setError('');
    try {
      await api.delete(`/candidates/${id}`);
      await refreshCandidates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete candidate');
    }
  };

  // --- JUDGE CRUD ACTIONS ---
  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!judgeUsername || !judgePassword || !judgeName) {
      setError('Please fill in all judge registration fields.');
      return;
    }

    try {
      await api.post('/auth/register', {
        username: judgeUsername,
        password: judgePassword,
        name: judgeName,
        role: 'JUDGE',
        isChairman: judgeIsChairman
      });

      setJudgeUsername('');
      setJudgePassword('');
      setJudgeName('');
      setJudgeIsChairman(false);
      alert('Judge registered successfully!');
      await refreshJudges();
      await refreshJudgeStats();
    } catch (err: any) {
      setError(err.message || 'Failed to register new judge');
    }
  };

  const handleDeleteJudge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this judge account?')) return;
    setError('');
    try {
      await api.delete(`/judges/${id}`);
      await refreshJudges();
      await refreshJudgeStats();
    } catch (err: any) {
      setError(err.message || 'Failed to delete judge');
    }
  };

  // --- CATEGORIES & CRITERIA CRUD ACTIONS ---
  const handleSectionSwitch = async (sectionId: string) => {
    try {
      await api.post(`/settings/sections/${sectionId}/activate`, {});
      setSections(prev => prev.map(s => ({ ...s, isActive: s.id === sectionId })));
      setActiveSectionId(sectionId);
      await refreshLeaderboard(sectionId);
    } catch (err: any) {
      alert(`Failed to activate section: ${err.message}`);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!secName) return;

    try {
      await api.post('/settings/sections', {
        name: secName,
        weight: Number(secWeight),
        description: secDescription || undefined
      });

      setSecName('');
      setSecDescription('');
      alert('Event category created successfully!');
      await refreshSections();
    } catch (err: any) {
      setError(err.message || 'Failed to create section');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pageant section? All criteria and scores in this section will be lost.')) return;
    setError('');
    try {
      await api.delete(`/settings/sections/${id}`);
      await refreshSections();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!critName || !critSectionId) {
      setError('Please fill in all criteria inputs and select a target category.');
      return;
    }

    try {
      await api.post('/settings/criteria', {
        name: critName,
        maxPoints: Number(critMaxPoints),
        weight: Number(critWeight),
        pageantSectionId: critSectionId
      });

      setCritName('');
      alert('Criteria added successfully!');
      await refreshSections();
    } catch (err: any) {
      setError(err.message || 'Failed to add criteria');
    }
  };

  const handleDeleteCriteria = async (id: string) => {
    if (!confirm('Are you sure you want to remove this criteria?')) return;
    setError('');
    try {
      await api.delete(`/settings/criteria/${id}`);
      await refreshSections();
    } catch (err: any) {
      setError(err.message || 'Failed to remove criteria');
    }
  };

  // --- ANALYTICS TRIGGERS ---


  const handleSaveSnapshot = async () => {
    if (!activeSectionId) return;
    try {
      await api.post('/analytics/snapshots', { sectionId: activeSectionId });
      alert('Historical snapshot of rankings captured.');
    } catch (err: any) {
      alert(`Snapshot error: ${err.message}`);
    }
  };

  const handleSystemReset = async () => {
    const confirmFirst = prompt("WARNING: You are about to wipe the database. This will delete all candidates, judges, categories, criteria, scores, and votes, and regenerate all IDs.\n\nType 'RESET' to confirm this action:");
    if (confirmFirst !== 'RESET') {
      alert('Reset cancelled.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/settings/reset', {});
      alert('System reset successful! All data and IDs have been regenerated. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to wipe system data');
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2>Loading Administrator Control Panel...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '30px', paddingBottom: '60px' }}>
      
      {/* Dashboard Top Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-white)' }}>CrownControl console</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Management & analytics control center</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
          <button 
            className={`btn ${activeTab === 'candidates' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('candidates')}
          >
            👸 Candidates
          </button>
          <button 
            className={`btn ${activeTab === 'judges' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('judges')}
          >
            👨‍⚖️ Judges
          </button>
          <button 
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('categories')}
          >
            📋 Categories
          </button>
          {currentUserRole === 'SUPERADMIN' && (
            <button 
              className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none' }}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-danger)',
          padding: '12px 20px',
          marginBottom: '24px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* TAB CONTENT: 1. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in">
          
          {/* Active section selector banner */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Current Active Pageant Segment
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSwitch(section.id)}
                  className="btn"
                  style={{
                    background: section.isActive 
                      ? 'linear-gradient(135deg, var(--color-secondary), hsl(263, 70%, 55%))' 
                      : 'rgba(255,255,255,0.03)',
                    border: section.isActive 
                      ? '1px solid rgba(139, 92, 246, 0.3)' 
                      : '1px solid var(--border-glass)',
                    color: 'var(--text-white)',
                    padding: '8px 16px',
                    fontSize: '0.9rem'
                  }}
                >
                  {section.name} {section.isActive && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard + Judge Scoring Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '30px', marginBottom: '30px' }}>
            
            <div className="premium-card" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}>Live Rankings Board</h2>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleSaveSnapshot}>
                  Save Snapshot
                </button>
              </div>

              {leaderboard.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No scores recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {leaderboard.map((entry, index) => (
                    <div key={entry.candidateId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          #{index + 1} Candidate {entry.candidateNumber} ({entry.candidateName})
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {entry.averageScore.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({entry.judgeCount} jd)</span>
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${entry.averageScore}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Judge Scoring Stats</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {judgeStats.map(judge => (
                  <div key={judge.judgeId} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div>
                      <div>{judge.isChairman && '👑 '}{judge.judgeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evaluated: {judge.totalCandidatesScored} Candidates</div>
                    </div>
                    <span className="badge" style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--color-primary)' }}>{judge.averageScoreGiven.toFixed(1)} Avg pt</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: 2. CANDIDATES CRUD */}
      {activeTab === 'candidates' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          {/* Candidates List Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Registered Candidates ({candidates.length})</h2>
            
            {candidates.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No candidates registered. Use the side panel to add candidates.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {candidates.map(cand => (
                  <div 
                    key={cand.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        background: 'var(--color-primary-glow)',
                        border: '1px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 700
                      }}>
                        {cand.number}
                      </div>
                      
                      {cand.avatarUrl && <img src={cand.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                      
                      <div>
                        <h4 style={{ fontSize: '1.05rem' }}>{cand.firstName} {cand.lastName}</h4>
                        {cand.bio && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cand.bio.substring(0, 50)}...</p>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => startEditCandidate(cand)}>
                        Edit
                      </button>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => handleDeleteCandidate(cand.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Candidate Form Panel */}
          <div className="premium-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
              {editingCandidateId ? 'Edit Candidate Details' : 'Register Candidate'}
            </h3>
            
            <form onSubmit={handleAddEditCandidate}>
              <div className="form-group">
                <label className="form-label">Candidate Number</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={candNumber} 
                  onChange={(e) => setCandNumber(Number(e.target.value))} 
                  min="1" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={candFirstName} 
                  onChange={(e) => setCandFirstName(e.target.value)} 
                  placeholder="e.g. Scarlett" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={candLastName} 
                  onChange={(e) => setCandLastName(e.target.value)} 
                  placeholder="e.g. Johansson" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biography / Description</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={candBio} 
                  onChange={(e) => setCandBio(e.target.value)} 
                  placeholder="e.g. Aspiring fashion model and philanthropist..." 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label">Upload Profile Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="form-input" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCandAvatarUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>

              {candAvatarUrl && (
                <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                  <label className="form-label" style={{ textAlign: 'left' }}>Preview (256x256 px)</label>
                  <img 
                    src={candAvatarUrl} 
                    alt="Candidate Preview" 
                    style={{ 
                      width: '256px', 
                      height: '256px', 
                      objectFit: 'cover', 
                      borderRadius: 'var(--radius-md)', 
                      border: '2px solid var(--color-primary)',
                      boxShadow: 'var(--shadow-glow)',
                      display: 'block',
                      margin: '8px auto 0 auto'
                    }} 
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingCandidateId ? 'Save Candidate' : 'Add Candidate'}
              </button>

              {editingCandidateId && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ width: '100%', marginTop: '10px' }} 
                  onClick={() => {
                    setEditingCandidateId(null);
                    setCandFirstName('');
                    setCandLastName('');
                    setCandBio('');
                    setCandAvatarUrl('');
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 3. JUDGES CRUD */}
      {activeTab === 'judges' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          {/* Judges List Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Registered Judges ({judges.length})</h2>
            
            {judges.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No judges registered. Create a judge account in the side panel.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {judges.map(judge => (
                  <div 
                    key={judge.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-white)' }}>{judge.isChairman && '👑 '}{judge.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Username: <code>{judge.username}</code> | Evaluated scores: {judge._count.scores}
                      </p>
                    </div>

                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteJudge(judge.id)}
                    >
                      Delete Account
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Register Judge Account Form */}
          <div className="premium-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
              Register Judge Account
            </h3>
            
            <form onSubmit={handleCreateJudge}>
              <div className="form-group">
                <label className="form-label">Judge Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={judgeName} 
                  onChange={(e) => setJudgeName(e.target.value)} 
                  placeholder="e.g. Hon. Arthur Pendragon" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Access Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={judgeUsername} 
                  onChange={(e) => setJudgeUsername(e.target.value)} 
                  placeholder="e.g. judge_arthur" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Access Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={judgePassword} 
                  onChange={(e) => setJudgePassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="judgeIsChairman"
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  checked={judgeIsChairman} 
                  onChange={(e) => setJudgeIsChairman(e.target.checked)} 
                />
                <label htmlFor="judgeIsChairman" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                  Chairman of the Board
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Account
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB CONTENT: 4. CATEGORIES & CRITERIA SETUP */}
      {activeTab === 'categories' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          {/* Categories Overview Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Event Categories & Scoring Criteria</h2>

            {sections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No pageant categories defined. Create one in the side panel.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sections.map(section => (
                  <div 
                    key={section.id} 
                    style={{ 
                      background: 'rgba(255,255,255,0.02)',
                      padding: '20px',
                      borderRadius: 'var(--radius-sm)',
                      border: section.isActive ? '1px solid var(--color-secondary)' : '1px solid var(--border-glass)',
                      boxShadow: section.isActive ? 'var(--shadow-secondary-glow)' : 'none'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.15rem' }}>{section.name}</h3>
                          {section.isActive && <span className="badge" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', fontSize: '0.65rem' }}>Active</span>}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Section Weight: <strong>{section.weight * 100}%</strong> of overall score
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!section.isActive && (
                          <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleSectionSwitch(section.id)}>
                            Activate
                          </button>
                        )}
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => handleDeleteSection(section.id)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Criteria Sublist */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Criteria Breakdown</h4>
                      {section.criteria.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No criteria added yet. Add one in the side panel.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {section.criteria.map(crit => (
                            <div key={crit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                              <span>
                                {crit.name} (Max: {crit.maxPoints} pts | Weight: {crit.weight * 100}%)
                              </span>
                              <button 
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                                onClick={() => handleDeleteCriteria(crit.id)}
                              >
                                Remove ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* CRUD Sideforms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Create Category (Section) Form */}
            <div className="premium-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
                Add Category
              </h3>
              
              <form onSubmit={handleCreateSection}>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={secName} 
                    onChange={(e) => setSecName(e.target.value)} 
                    placeholder="e.g. Evening Gown Segment" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Weight (decimal: 0 - 1)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    step="0.01" 
                    min="0" 
                    max="1"
                    value={secWeight} 
                    onChange={(e) => setSecWeight(Number(e.target.value))} 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label">Description</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={secDescription} 
                    onChange={(e) => setSecDescription(e.target.value)} 
                    placeholder="e.g. Elegance and grace on stage..." 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Create Category
                </button>
              </form>
            </div>

            {/* Create Criteria Form */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                Add Criteria
              </h3>
              
              <form onSubmit={handleCreateCriteria}>
                <div className="form-group">
                  <label className="form-label">Criteria Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={critName} 
                    onChange={(e) => setCritName(e.target.value)} 
                    placeholder="e.g. Stage Presence & Grace" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Category</label>
                  <select 
                    className="form-input" 
                    style={{ background: 'rgba(10, 15, 30, 0.9)', color: 'var(--text-white)' }}
                    value={critSectionId} 
                    onChange={(e) => setCritSectionId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Evaluation Points</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    value={critMaxPoints} 
                    onChange={(e) => setCritMaxPoints(Number(e.target.value))} 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label">Weight ratio (0 - 1)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    step="0.01" 
                    min="0" 
                    max="1"
                    value={critWeight} 
                    onChange={(e) => setCritWeight(Number(e.target.value))} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                  Add Criteria
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: 5. SYSTEM SETTINGS */}
      {activeTab === 'settings' && currentUserRole === 'SUPERADMIN' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px', alignItems: 'start' }}>
            
            {/* System Branding Settings Form */}
            <div className="premium-card" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
                System Branding Settings
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Customize the name, logo and icons displayed across all portals (Admin Console, Judge Scoring, and Public Voting).
              </p>
              
              <form onSubmit={handleUpdateBranding}>
                <div className="form-group">
                  <label className="form-label">Pageant / Application Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={brandingTitle} 
                    onChange={(e) => setBrandingTitle(e.target.value)} 
                    placeholder="e.g. Miss Universe 2026" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Logo Emoji / Symbol Fallback</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={brandingLogo.startsWith('data:image/') ? '' : brandingLogo} 
                    onChange={(e) => setBrandingLogo(e.target.value)} 
                    placeholder="e.g. 👑 or ⭐" 
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Used if no custom image logo is uploaded.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label">Upload Custom Image Logo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-input" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBrandingLogo(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="publicRankingsEnabled"
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    checked={publicRankingsEnabled} 
                    onChange={(e) => setPublicRankingsEnabled(e.target.checked)} 
                  />
                  <label htmlFor="publicRankingsEnabled" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                    Enable Public Live Rankings Page
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Save Branding Settings
                </button>
              </form>
            </div>

            {/* Interactive Live Mock Preview */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Live Header & Footer Preview</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                See how your branding modifications will appear in real time before saving.
              </p>

              {/* Header Preview */}
              <div style={{ marginBottom: '30px' }}>
                <label className="form-label">Mock Navigation Bar</label>
                <div style={{
                  background: 'rgba(8, 12, 26, 0.95)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    {brandingLogo.startsWith('data:image/') ? (
                      <img src={brandingLogo} alt="Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '1.2rem' }}>{brandingLogo || '👑'}</span>
                    )}
                    <span>{brandingTitle || 'CrownControl'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-online" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>● Online</span>
                    <span className="btn" style={{ fontSize: '0.65rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: 'none' }}>Logout</span>
                  </div>
                </div>
              </div>

              {/* Footer Preview */}
              <div>
                <label className="form-label">Mock Global Footer</label>
                <div style={{
                  background: 'rgba(8, 12, 26, 0.95)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    {brandingTitle || 'CrownControl'} v1.0b by Chester Sigua. Copyright &copy; 2026. All rights reserved &reg;
                  </div>
                  <div>
                    for Crown Control Inquiries, call 0939 299 8228
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Manage Admins Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start', marginTop: '30px', borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
            {/* Admin list */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
                Manage Admin Accounts
              </h3>
              {admins.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No administrators loaded.</p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {admins.map(adm => {
                    const selfUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const isSelf = selfUser.id === adm.id || selfUser.username === adm.username;
                    return (
                      <div 
                        key={adm.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '16px 20px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-glass)'
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-white)' }}>
                            {adm.name} {isSelf && <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>(You)</span>}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Username: <code>{adm.username}</code>
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Role selector dropdown */}
                          <select 
                            value={adm.role} 
                            disabled={isSelf}
                            style={{ 
                              background: 'rgba(10, 15, 30, 0.9)', 
                              color: 'var(--text-white)',
                              border: '1px solid var(--border-glass)',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.85rem',
                              cursor: isSelf ? 'not-allowed' : 'pointer'
                            }}
                            onChange={(e) => handleUpdateAdminRole(adm.id, e.target.value)}
                          >
                            <option value="ADMIN">Regular Admin</option>
                            <option value="SUPERADMIN">Superadmin</option>
                          </select>

                          <button 
                            className="btn btn-outline" 
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem', 
                              borderColor: 'var(--color-danger)', 
                              color: 'var(--color-danger)',
                              cursor: isSelf ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => handleDeleteAdmin(adm.id)}
                            disabled={isSelf}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Register new admin form */}
            <div className="premium-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: 'var(--color-primary)' }}>
                Register Admin Account
              </h3>
              <form onSubmit={handleCreateAdmin}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={adminName} 
                    onChange={(e) => setAdminName(e.target.value)} 
                    placeholder="e.g. Admin Assistant" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={adminUsername} 
                    onChange={(e) => setAdminUsername(e.target.value)} 
                    placeholder="e.g. assistant_admin" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label">Role / Permission Level</label>
                  <select 
                    className="form-input" 
                    style={{ background: 'rgba(10, 15, 30, 0.9)', color: 'var(--text-white)' }}
                    value={adminRole} 
                    onChange={(e) => setAdminRole(e.target.value as any)}
                    required
                  >
                    <option value="ADMIN">Regular Admin (Restricted Settings)</option>
                    <option value="SUPERADMIN">Superadmin (Full Access)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Register Admin
                </button>
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ 
            padding: '24px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            background: 'rgba(239, 68, 68, 0.03)' 
          }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-danger)', marginBottom: '10px' }}>⚠️ Danger Zone</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px', lineHeight: '1.4' }}>
              Resetting the system will permanently delete all candidates, judges, category structures, criteria configurations, evaluation scores, and audience votes. 
              <strong> This action is irreversible.</strong>
            </p>
            <button 
              type="button" 
              className="btn" 
              style={{ 
                background: 'linear-gradient(135deg, var(--color-danger), hsl(0, 72%, 40%))',
                color: 'var(--text-white)', 
                border: 'none',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={handleSystemReset}
            >
              Clear All Data & Fresh Start
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
