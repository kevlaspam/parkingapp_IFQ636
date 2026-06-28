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
  const { user, localMode, toggleLocalMode } = useAuth();

  return (
    <div className="app-shell">
      <div className="phone-frame">
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

        {/* Local Test Mode Toggle Banner */}
        {user && (
          <div style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 10
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span>Connection Status</span>
              <span style={{
                color: localMode ? 'var(--amber)' : 'var(--green)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: localMode ? 'var(--amber)' : 'var(--green)',
                  display: 'inline-block',
                  boxShadow: localMode ? '0 0 8px var(--amber)' : '0 0 8px var(--green)'
                }} />
                {localMode ? 'Offline Demo Mode' : 'Connected to MongoDB'}
              </span>
            </div>

            {/* Segmented Switch Bar */}
            <div style={{
              background: 'var(--bg-input)',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              position: 'relative',
              border: '1px solid var(--border)'
            }}>
              <button
                type="button"
                onClick={() => { if (localMode) toggleLocalMode(); }}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 0',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: !localMode ? 'var(--accent)' : 'transparent',
                  color: !localMode ? 'var(--text-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: !localMode ? '0 4px 12px var(--accent-glow)' : 'none',
                  outline: 'none'
                }}
              >
                <span>☁️</span> Live MongoDB
              </button>
              <button
                type="button"
                onClick={() => { if (!localMode) toggleLocalMode(); }}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 0',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: localMode ? 'var(--amber)' : 'transparent',
                  color: localMode ? '#0a0a0f' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: localMode ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none',
                  outline: 'none'
                }}
              >
                <span>🔌</span> Local Demo
              </button>
            </div>
          </div>
        )}

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
