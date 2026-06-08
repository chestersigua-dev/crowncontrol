import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Branding States
  const [title, setTitle] = useState(localStorage.getItem('app_title') || 'CrownControl');
  const [logo, setLogo] = useState(localStorage.getItem('app_logo') || '👑');

  useEffect(() => {
    // Redirect if already logged in
    const user = localStorage.getItem('user');
    if (user) {
      const { role } = JSON.parse(user);
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'JUDGE') navigate('/judge');
    }

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
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      if (res.user.role === 'ADMIN' || res.user.role === 'SUPERADMIN') {
        navigate('/admin');
      } else {
        navigate('/judge');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 80px)',
      padding: '20px'
    }}>
      <div className="premium-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '40px 30px',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {logo.startsWith('data:image/') ? (
            <img src={logo} alt="Logo" style={{ height: '64px', width: 'auto', objectFit: 'contain', marginBottom: '12px' }} />
          ) : (
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>{logo}</span>
          )}
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--color-primary)' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pageant Live Scoring & Judging Portal</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)',
            padding: '12px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or judge1"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '25px', 
          textAlign: 'center', 
          fontSize: '0.8rem', 
          color: 'var(--text-muted)' 
        }}>
          Authorized Personnel Only. Core connections are audited.
        </div>
      </div>
    </div>
  );
}
