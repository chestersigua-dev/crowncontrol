import { useEffect, useState } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

interface LeaderboardEntry {
  candidateId: string;
  candidateNumber: number;
  candidateName: string;
  avatarUrl: string | null;
  averageScore: number;
  judgeCount: number;
  rank: number;
}

export default function LiveRankings() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sectionName, setSectionName] = useState<string>('');
  const [logo, setLogo] = useState<string>('👑');
  const [title, setTitle] = useState<string>('CrownControl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPublicLeaderboard = async () => {
    try {
      const res = await api.get('/analytics/public/leaderboard');
      setLeaderboard(res.leaderboard);
      setSectionName(res.sectionName);
      setError('');
    } catch (err: any) {
      setError(err.message || 'No active segment is being evaluated.');
    }
  };

  const fetchBranding = async () => {
    try {
      const res = await api.get('/settings/branding');
      setTitle(res.title);
      setLogo(res.logo);
    } catch (err) {
      console.error('Branding load error', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchBranding();
      await fetchPublicLeaderboard();
      setLoading(false);
    };
    init();

    // Listen for realtime score updates to refresh public rankings
    const socket = getSocket();
    socket.on('score:update', () => {
      console.log('Realtime scores updated, refreshing leaderboard...');
      fetchPublicLeaderboard();
    });

    // Listen for branding changes if any
    const handleBrandingChange = () => {
      setTitle(localStorage.getItem('app_title') || 'CrownControl');
      setLogo(localStorage.getItem('app_logo') || '👑');
    };
    window.addEventListener('brandingUpdated', handleBrandingChange);

    return () => {
      socket.off('score:update');
      window.removeEventListener('brandingUpdated', handleBrandingChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'var(--text-muted)' }}>
        <h2>Loading Live rankings...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '60px',
        alignItems: 'center',
        minHeight: '65vh'
      }}>
        {/* Left Column: Big Logo then break then title */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-glow)',
          backdropFilter: 'blur(20px)'
        }}>
          {logo.startsWith('data:image/') ? (
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '180px', 
                width: '180px', 
                objectFit: 'contain', 
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))',
                marginBottom: '20px'
              }} 
            />
          ) : (
            <span style={{ 
              fontSize: '8rem', 
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.35))',
              marginBottom: '20px',
              display: 'block'
            }}>
              {logo}
            </span>
          )}
          
          <br />
          
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, #FFF, var(--color-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0'
          }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Live Event Rankings
          </p>
        </div>

        {/* Right Column: Live Rankings Board */}
        <div className="premium-card" style={{ padding: '40px' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', margin: '0' }}>Rankings Leaderboard</h2>
            {sectionName ? (
              <span className="badge" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', marginTop: '8px', display: 'inline-block' }}>
                Active: {sectionName}
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', marginTop: '8px', display: 'inline-block' }}>
                No Active Segment
              </span>
            )}
          </div>

          {error || leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>📊</span>
              <p>{error || 'Waiting for judges to submit evaluation scores...'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {leaderboard.map((entry, index) => (
                <div key={entry.candidateId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass)',
                  transition: 'transform 0.2s',
                  boxShadow: index === 0 ? '0 0 15px rgba(255, 215, 0, 0.08)' : 'none'
                }}>
                  {/* Rank Badge */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index === 0 
                      ? 'linear-gradient(135deg, #FFD700, #DAA520)' 
                      : index === 1 
                        ? 'linear-gradient(135deg, #C0C0C0, #A9A9A9)'
                        : index === 2 
                          ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                          : 'rgba(255,255,255,0.05)',
                    color: index < 3 ? '#080c1a' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {index + 1}
                  </div>

                  {/* Candidate Avatar */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      padding: '2px',
                      background: index === 0 ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'rgba(255,255,255,0.1)'
                    }}>
                      {entry.avatarUrl ? (
                        <img 
                          src={entry.avatarUrl} 
                          alt="" 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: 'var(--bg-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          #{entry.candidateNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidate Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        Candidate {entry.candidateNumber} ({entry.candidateName})
                      </span>
                      <span style={{ fontWeight: 700, color: index === 0 ? 'var(--color-primary)' : 'var(--text-white)' }}>
                        {entry.averageScore.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ 
                        width: `${entry.averageScore}%`, 
                        height: '100%', 
                        background: index === 0 
                          ? 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' 
                          : 'rgba(255,255,255,0.15)'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
