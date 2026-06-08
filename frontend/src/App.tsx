import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import JudgeScoring from './pages/JudgeScoring';
import LiveRankings from './pages/LiveRankings';

// Smart redirect helper
const HomeRedirect = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const { role } = JSON.parse(user);
    if (role === 'ADMIN' || role === 'SUPERADMIN') return <Navigate to="/admin" replace />;
    if (role === 'JUDGE') return <Navigate to="/judge" replace />;
  }
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/judge" element={<JudgeScoring />} />
            <Route path="/live" element={<LiveRankings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
