import { useEffect, useState } from 'react';

export default function Footer() {
  const [title, setTitle] = useState(localStorage.getItem('app_title') || 'CrownControl');

  useEffect(() => {
    const handleBrandingChange = () => {
      setTitle(localStorage.getItem('app_title') || 'CrownControl');
    };
    window.addEventListener('brandingUpdated', handleBrandingChange);
    return () => window.removeEventListener('brandingUpdated', handleBrandingChange);
  }, []);

  return (
    <footer style={{
      background: 'rgba(8, 12, 26, 0.85)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--border-glass)',
      padding: '20px 40px',
      fontSize: '0.82rem',
      color: 'var(--text-muted)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px',
      marginTop: 'auto',
      zIndex: 50
    }}>
      {/* Left Aligned Section */}
      <div>
        {title} v1.0b by Chester Sigua. Copyright &copy; 2026. All rights reserved &reg;
      </div>

      {/* Right Aligned Section */}
      <div>
        for Crown Control Inquiries, call <strong>0939 299 8228</strong>
      </div>
    </footer>
  );
}
