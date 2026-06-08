import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOfflineQueue, syncScores } from '../services/offline';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(getOfflineQueue().length);
  const [syncing, setSyncing] = useState(false);

  // Branding States
  const [title, setTitle] = useState(localStorage.getItem('app_title') || 'CrownControl');
  const [logo, setLogo] = useState(localStorage.getItem('app_logo') || '👑');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/branding');
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setLogo(data.logo);
          localStorage.setItem('app_title', data.title);
          localStorage.setItem('app_logo', data.logo);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchBranding();

    const handleBrandingChange = () => {
      setTitle(localStorage.getItem('app_title') || 'CrownControl');
      setLogo(localStorage.getItem('app_logo') || '👑');
    };
    window.addEventListener('brandingUpdated', handleBrandingChange);

    // Read user
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Queue update listener
    const handleQueueChange = () => {
      setQueueCount(getOfflineQueue().length);
    };
    window.addEventListener('scoreQueueUpdated', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('scoreQueueUpdated', handleQueueChange);
      window.removeEventListener('brandingUpdated', handleBrandingChange);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleManualSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncScores();
      alert('Offline scores successfully synced with server!');
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {logo.startsWith('data:image/') ? (
          <img src={logo} alt="Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        ) : (
          <span>{logo}</span>
        )}
        <span>{title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Network Badge */}
        {isOnline ? (
          <span className="badge badge-online">● Online</span>
        ) : (
          <span className="badge badge-offline">○ Offline Mode</span>
        )}

        {/* Sync Trigger for Judges */}
        {queueCount > 0 && (
          <button 
            className="btn btn-outline" 
            style={{ 
              borderColor: 'var(--color-warning)', 
              color: 'var(--color-warning)', 
              padding: '6px 12px', 
              fontSize: '0.8rem' 
            }}
            onClick={handleManualSync}
            disabled={!isOnline || syncing}
          >
            {syncing ? 'Syncing...' : `Sync Queue (${queueCount})`}
          </button>
        )}

        {location.pathname !== '/live' && (
          <button 
            className="btn btn-outline" 
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem' 
            }}
            onClick={() => navigate('/live')}
          >
            📊 Live Rankings
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-normal)' }}>
              Hello, <strong style={{ color: 'var(--text-white)' }}>{user.isChairman && '👑 '}{user.name}</strong> ({user.role})
            </span>
            {(user.role === 'SUPERADMIN' || user.role === 'ADMIN') && location.pathname !== '/admin' && (
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/admin')}>
                Admin Console
              </button>
            )}
            {user.role === 'JUDGE' && location.pathname !== '/judge' && (
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/judge')}>
                Judging
              </button>
            )}
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          location.pathname !== '/login' && (
            <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
              Login
            </button>
          )
        )}
      </div>
    </nav>
  );
}
