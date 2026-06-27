import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    {
      to: '/dashboard',
      label: 'Park',
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
        </svg>
      )
    },
    {
      to: '/bookings',
      label: 'My Trips',
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      )
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      )
    },
  ];

  if (user?.role === 'admin') {
    tabs.splice(2, 0, {
      to: '/admin',
      label: 'Admin',
      className: 'admin-tab',
      icon: (active) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      )
    });
  }

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = location.pathname === tab.to;
        return (
          <Link key={tab.to} to={tab.to} className={`nav-tab${active ? ' active' : ''}${tab.className ? ' ' + tab.className : ''}`}>
            <div className="nav-icon">{tab.icon(active)}</div>
            {tab.label}
          </Link>
        );
      })}
      <button onClick={handleLogout} className="nav-tab" style={{ cursor: 'pointer' }}>
        <div className="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        Out
      </button>
    </nav>
  );
};

export default Navbar;
