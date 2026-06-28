import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminPanel from './pages/AdminPanel';
import { useAuth } from './context/AuthContext';

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function AppContent() {
  const { user } = useAuth();
  const [deviceFormat, setDeviceFormat] = useState('mobile');

  return (
    <div className="app-shell" style={{ paddingTop: '80px' }}>
      {/* Device Format Selector (Fixed at the top of the screen) */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-bright)',
        borderRadius: '20px',
        padding: '4px',
        display: 'flex',
        gap: '4px',
        width: '180px',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)'
      }}>
        <button
          onClick={() => setDeviceFormat('mobile')}
          style={{
            flex: 1,
            background: deviceFormat === 'mobile' ? 'rgba(124,58,237,0.2)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            color: deviceFormat === 'mobile' ? 'var(--accent-light)' : 'var(--text-muted)',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
        >
          📱 Mobile
        </button>
        <button
          onClick={() => setDeviceFormat('tablet')}
          style={{
            flex: 1,
            background: deviceFormat === 'tablet' ? 'rgba(124,58,237,0.2)' : 'transparent',
            border: 'none',
            borderRadius: '16px',
            color: deviceFormat === 'tablet' ? 'var(--accent-light)' : 'var(--text-muted)',
            padding: '6px 0',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
        >
          📟 Tablet
        </button>
      </div>

      <div 
        className="phone-frame"
        style={{
          maxWidth: deviceFormat === 'tablet' ? '768px' : '390px',
          borderRadius: deviceFormat === 'tablet' ? '28px' : '44px'
        }}
      >
        {/* Dynamic Island */}
        <div className="phone-island">
          <div className="phone-island-camera"></div>
          <div className="phone-island-light"></div>
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <span className="status-bar-time">{getCurrentTime()}</span>
          <div className="status-bar-icons">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
              <rect x="0" y="4" width="3" height="7" rx="1" opacity="0.4"/>
              <rect x="4" y="2.5" width="3" height="8.5" rx="1" opacity="0.6"/>
              <rect x="8" y="1" width="3" height="10" rx="1" opacity="0.8"/>
              <rect x="12" y="0" width="3" height="11" rx="1"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.1 1.2 4.9 0 8 0s5.9 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4z" opacity="0.4"/>
              <path d="M8 5.6c-1.5 0-2.9.6-3.9 1.6L2.5 5.6C3.9 4.2 5.8 3.2 8 3.2s4.1 1 5.5 2.4L11.9 7.2C10.9 6.2 9.5 5.6 8 5.6z" opacity="0.7"/>
              <path d="M8 8.8c-.8 0-1.5.3-2 .8L8 12l2-2.4c-.5-.5-1.2-.8-2-.8z"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
              <rect x="0" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
              <rect x="1" y="2" width="18" height="8" rx="2" fill="currentColor"/>
              <path d="M22 4v4c1.1-.5 1.1-3.5 0-4z" opacity="0.5"/>
            </svg>
          </div>
        </div>



        {/* Main scrollable content */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        {/* Bottom Navigation */}
        {user && <Navbar />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
