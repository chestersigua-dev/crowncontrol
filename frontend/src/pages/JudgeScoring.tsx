import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { saveScoreOffline, getOfflineQueue } from '../services/offline';

interface Candidate {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface Criteria {
  id: string;
  name: string;
  maxPoints: number;
  weight: number;
}

interface PageantSection {
  id: string;
  name: string;
  description: string | null;
  criteria: Criteria[];
}

export default function JudgeScoring() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeSection, setActiveSection] = useState<PageantSection | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Scoring values map: criteriaId -> points
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(getOfflineQueue().length);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Keep track of which candidate numbers have already been scored by this judge (in this session)
  const [scoredCandidates, setScoredCandidates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login');
      return;
    }
    const { role } = JSON.parse(user);
    if (role !== 'JUDGE' && role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    // Network status listeners
    const handleNetworkChange = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // Queue update listener
    const handleQueueChange = () => {
      setOfflineCount(getOfflineQueue().length);
    };
    window.addEventListener('scoreQueueUpdated', handleQueueChange);

    // Load initial data
    loadPageantData();

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('scoreQueueUpdated', handleQueueChange);
    };
  }, [navigate]);

  const loadPageantData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch Candidates (with offline fallback)
      let candidatesList: Candidate[] = [];
      if (navigator.onLine) {
        candidatesList = await api.get('/candidates');
        localStorage.setItem('cached_candidates', JSON.stringify(candidatesList));
      } else {
        const cached = localStorage.getItem('cached_candidates');
        if (cached) candidatesList = JSON.parse(cached);
      }
      setCandidates(candidatesList);

      // 2. Fetch Active Section (with offline fallback)
      let sectionData: PageantSection | null = null;
      if (navigator.onLine) {
        sectionData = await api.get('/settings/active');
        localStorage.setItem('cached_active_section', JSON.stringify(sectionData));
      } else {
        const cached = localStorage.getItem('cached_active_section');
        if (cached) sectionData = JSON.parse(cached);
      }

      if (sectionData) {
        setActiveSection(sectionData);
        // Initialize scores with default midpoints
        const initialScores: Record<string, number> = {};
        for (const crit of sectionData.criteria) {
          initialScores[crit.id] = Math.round(crit.maxPoints / 2);
        }
        setScores(initialScores);
      } else {
        setError('No pageant section is currently active.');
      }

      // 3. Fetch judge progress if online
      if (navigator.onLine) {
        const progress = await api.get('/judges/progress');
        // progress is map of candidateId -> sectionId -> score
        const scoredMap: Record<string, boolean> = {};
        if (sectionData) {
          const secId = sectionData.id;
          Object.keys(progress).forEach(candId => {
            if (progress[candId][secId] !== undefined) {
              scoredMap[candId] = true;
            }
          });
        }
        setScoredCandidates(scoredMap);
        localStorage.setItem('cached_scored_candidates', JSON.stringify(scoredMap));
      } else {
        const cachedScored = localStorage.getItem('cached_scored_candidates');
        if (cachedScored) {
          setScoredCandidates(JSON.parse(cachedScored));
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load pageant details');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setSuccess('');
    setError('');

    if (!activeSection) return;

    // 1. Check local offline queue first
    const offlineQueue = getOfflineQueue();
    const queuedScore = offlineQueue.find(
      item => item.candidateId === candidate.id && item.pageantSectionId === activeSection.id
    );

    if (queuedScore) {
      const loadedScores: Record<string, number> = {};
      queuedScore.scores.forEach(s => {
        loadedScores[s.criteriaId] = s.points;
      });
      setScores(loadedScores);
      return;
    }

    // 2. If online, fetch existing score details from server
    if (navigator.onLine) {
      try {
        const existingScore = await api.get(`/scoring/candidate/${candidate.id}/section/${activeSection.id}`);
        if (existingScore && existingScore.details && existingScore.details.length > 0) {
          const loadedScores: Record<string, number> = {};
          existingScore.details.forEach((d: any) => {
            loadedScores[d.criteriaId] = d.points;
          });
          setScores(loadedScores);
          return;
        }
      } catch (err) {
        console.warn('Could not load existing score details from server, falling back to defaults:', err);
      }
    }

    // 3. Fallback: Pre-populate with default midpoints
    const initialScores: Record<string, number> = {};
    for (const crit of activeSection.criteria) {
      initialScores[crit.id] = Math.round(crit.maxPoints / 2);
    }
    setScores(initialScores);
  };

  const handleSliderChange = (criteriaId: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !activeSection) return;

    setError('');
    setSuccess('');

    // Create payload
    const scoreDetails = Object.keys(scores).map(critId => ({
      criteriaId: critId,
      points: scores[critId]
    }));

    const payload = {
      candidateId: selectedCandidate.id,
      pageantSectionId: activeSection.id,
      scores: scoreDetails
    };

    if (navigator.onLine) {
      try {
        await api.post('/scoring/submit', payload);
        
        // Mark as scored locally
        setScoredCandidates(prev => ({ ...prev, [selectedCandidate.id]: true }));
        setSuccess(`Score submitted successfully for Candidate #${selectedCandidate.number}!`);
        
        // Auto-select next candidate
        autoSelectNextCandidate(selectedCandidate.id);
      } catch (err: any) {
        setError(err.message || 'Failed to submit score');
      }
    } else {
      // Offline mode
      saveScoreOffline(payload);
      
      // Mark as scored locally
      setScoredCandidates(prev => ({ ...prev, [selectedCandidate.id]: true }));
      setSuccess(`[Offline Mode] Score queued locally for Candidate #${selectedCandidate.number}.`);
      
      // Auto-select next candidate
      autoSelectNextCandidate(selectedCandidate.id);
    }
  };

  const autoSelectNextCandidate = (currentId: string) => {
    const currentIndex = candidates.findIndex(c => c.id === currentId);
    if (currentIndex !== -1 && currentIndex < candidates.length - 1) {
      // Pick next
      const nextCandidate = candidates[currentIndex + 1];
      setTimeout(() => {
        handleSelectCandidate(nextCandidate);
      }, 1200); // Small delay so they see success message
    } else {
      // Last candidate finished
      setTimeout(() => {
        setSelectedCandidate(null);
        setSuccess('Awesome! You have evaluated all candidates in this section.');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2>Loading Scoring Interface...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      
      {/* Offline Alert Box */}
      {!isOnline && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid var(--color-danger)', 
          borderRadius: 'var(--radius-md)', 
          padding: '16px 24px', 
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ color: 'var(--color-danger)', marginBottom: '4px' }}>Working Offline</h4>
            <p style={{ color: 'var(--text-normal)', fontSize: '0.9rem' }}>
              Your network connection was lost. You can continue scoring. Scores will be stored locally and synced automatically when online.
            </p>
          </div>
          <span className="badge badge-offline" style={{ padding: '8px 16px' }}>
            Queue: {offlineCount} Scores
          </span>
        </div>
      )}

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

      {success && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.15)', 
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-success)',
          padding: '12px 20px',
          marginBottom: '24px'
        }}>
          ✨ {success}
        </div>
      )}

      {activeSection ? (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', border: '1px solid rgba(255, 215, 0, 0.2)', marginBottom: '8px' }}>
            Active Event Category
          </span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{activeSection.name}</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            {activeSection.description || 'Evaluate candidates based on the official guidelines below.'}
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
          <h2>No category is currently active. Wait for the administrator.</h2>
        </div>
      )}

      {activeSection && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '320px 1fr', 
          gap: '30px', 
          alignItems: 'start' 
        }}>
          
          {/* Candidates List Column */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
              Candidates
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
              {candidates.map(candidate => {
                const isSelected = selectedCandidate?.id === candidate.id;
                const isScored = scoredCandidates[candidate.id];

                return (
                  <div 
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(candidate)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: isSelected 
                        ? '1px solid var(--color-primary)' 
                        : '1px solid transparent',
                      background: isSelected 
                        ? 'rgba(255, 215, 0, 0.08)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      transition: 'var(--transition-smooth)'
                    }}
                    className="candidate-row-hover"
                  >
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-surface)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-white)'
                    }}>
                      {candidate.number}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                        {candidate.firstName} {candidate.lastName}
                      </div>
                    </div>

                    {isScored && (
                      <span className="badge" style={{ 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        color: 'var(--color-success)',
                        fontSize: '0.65rem'
                      }}>
                        Scored ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring panel */}
          <div>
            {selectedCandidate ? (
              <div className="premium-card" style={{ padding: '30px 40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '30px' }}>
                  {selectedCandidate.avatarUrl ? (
                    <img 
                      src={selectedCandidate.avatarUrl} 
                      alt={selectedCandidate.firstName} 
                      style={{ 
                        width: '256px', 
                        height: '256px', 
                        borderRadius: 'var(--radius-md)', 
                        objectFit: 'cover', 
                        border: '3px solid var(--color-primary)',
                        boxShadow: 'var(--shadow-glow)',
                        marginBottom: '20px'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: '256px', 
                      height: '256px', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'rgba(255,255,255,0.05)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '4rem',
                      border: '1px dashed var(--border-glass)',
                      marginBottom: '20px'
                    }}>
                      👤
                    </div>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      CANDIDATE #{selectedCandidate.number}
                    </span>
                    <h2 style={{ fontSize: '1.8rem', marginTop: '4px' }}>
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </h2>
                    {selectedCandidate.bio && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '480px' }}>
                        {selectedCandidate.bio}
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmitScore}>
                  {activeSection.criteria.map(crit => {
                    const currentPoints = scores[crit.id] || 0;
                    return (
                      <div key={crit.id} style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{crit.name}</span>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                            {currentPoints} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>/ {crit.maxPoints} pts</span>
                          </span>
                        </div>
                        <input 
                          type="range"
                          className="score-slider"
                          min="0"
                          max={crit.maxPoints}
                          value={currentPoints}
                          onChange={(e) => handleSliderChange(crit.id, parseInt(e.target.value))}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>0 pts</span>
                          <span>Weight: {crit.weight * 100}%</span>
                          <span>{crit.maxPoints} pts</span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '16px' }}
                    >
                      {navigator.onLine ? 'Submit Score' : 'Save Score (Offline)'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setSelectedCandidate(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-panel" style={{ 
                height: '400px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '40px'
              }}>
                <span style={{ fontSize: '3.5rem', marginBottom: '15px' }}>👑</span>
                <h3>Select a Candidate</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '340px', marginTop: '6px' }}>
                  Choose a candidate from the left panel to begin evaluating and submitting scores.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
