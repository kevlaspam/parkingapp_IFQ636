import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, forceLocalMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailVal = formData.email.trim();
    const passwordVal = formData.password.trim();

    // Check for hardcoded admin/admin login
    if (emailVal.toLowerCase() === 'admin' && passwordVal === 'admin') {
      setTimeout(() => {
        forceLocalMode();
        login({
          id: 'admin-built-in',
          name: 'System Admin',
          email: 'admin@parkease.com',
          role: 'admin',
          token: 'mock-jwt-token-for-admin'
        });
        navigate('/admin');
        setLoading(false);
      }, 500);
      return;
    }

    // Check for hardcoded student/student login
    if (emailVal.toLowerCase() === 'student' && passwordVal === 'student') {
      setTimeout(() => {
        forceLocalMode();
        login({
          id: 'student-built-in',
          name: 'Student User',
          email: 'student@parkease.com',
          role: 'user',
          token: 'mock-jwt-token-for-student'
        });
        navigate('/dashboard');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-area">
        <div className="auth-logo-icon">🅿️</div>
        <div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your parking account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-form-card">
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#ef4444',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email or Username</label>
            <input
              id="login-email"
              type="text"
              required
              placeholder="you@university.edu, 'admin' or 'student'"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Password</label>
            <input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <button
          id="login-submit"
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
          style={{ marginBottom: '16px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
              Signing in...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </>
          )}
        </button>

        <div className="auth-divider">
          <span>New to ParkEase?</span>
        </div>

        <p className="auth-link" style={{ marginTop: '12px' }}>
          <Link to="/register">
            <button type="button" className="btn btn-secondary btn-full">
              Create Account
            </button>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
