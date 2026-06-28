import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { getRegisteredVehicles, saveRegisteredVehicles } from '../utils/localDb';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Vehicle states
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ model: '', color: '', plate: '' });
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          university: response.data.university || '',
          address: response.data.address || '',
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
      setVehicles(getRegisteredVehicles());
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setToast({ msg: 'Profile saved!', isError: false });
    } catch (error) {
      setToast({ msg: 'Failed to save.', isError: true });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.model || !newVehicle.plate) {
      setToast({ msg: 'Model and plate are required.', isError: true });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    const updated = [
      ...vehicles,
      {
        id: 'v-' + Date.now(),
        model: newVehicle.model.trim(),
        color: newVehicle.color.trim() || 'Default',
        plate: newVehicle.plate.trim().toUpperCase()
      }
    ];
    setVehicles(updated);
    saveRegisteredVehicles(updated);
    setNewVehicle({ model: '', color: '', plate: '' });
    setShowAddVehicle(false);
    setToast({ msg: 'Vehicle added!', isError: false });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDeleteVehicle = (id) => {
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    saveRegisteredVehicles(updated);
    setToast({ msg: 'Vehicle removed.', isError: false });
    setTimeout(() => setToast(null), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast" style={toast.isError ? {
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--red)'
        } : {}}>
          {toast.isError ? '⚠ ' : '✓ '}{toast.msg}
        </div>
      )}

      {/* Page title */}
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account</p>
      </div>

      {/* Avatar card */}
      <div className="profile-header-card">
        <div className="profile-avatar">{initials}</div>
        <div>
          <div className="profile-name">{formData.name || 'Unknown User'}</div>
          <div className="profile-email">{formData.email}</div>
          {user?.role === 'admin' && (
            <div className="badge badge-amber" style={{ marginTop: 6 }}>Admin</div>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div style={{ padding: '0 16px' }}>
        <form onSubmit={handleSubmit}>
          <p className="section-label" style={{ padding: 0, marginBottom: 12 }}>Account Details</p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 14 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                id="profile-name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                id="profile-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">University</label>
              <input
                id="profile-university"
                type="text"
                placeholder="e.g. QUT"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="input"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Address</label>
              <input
                id="profile-address"
                type="text"
                placeholder="Your address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <button
            id="profile-save"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={saving}
            style={{ marginBottom: 12, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Vehicles Section */}
        <p className="section-label" style={{ padding: 0, marginBottom: 12, marginTop: 20 }}>My Vehicles</p>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 14 }}>
          {vehicles.map((v) => (
            <div key={v.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🚗</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {v.color} {v.model}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    background: '#f1f1f5',
                    color: '#0a0a0f',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em',
                    marginTop: '4px',
                    border: '1px solid #c0c0d8'
                  }}>
                    {v.plate}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteVehicle(v.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--red)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                Delete
              </button>
            </div>
          ))}

          {vehicles.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
              No vehicles registered yet.
            </p>
          )}

          {showAddVehicle ? (
            <form onSubmit={handleAddVehicle} style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div className="input-group">
                <label className="input-label">Vehicle Model</label>
                <input
                  type="text"
                  placeholder="e.g. Tesla Model 3"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="input-row" style={{ display: 'flex', gap: '8px', marginBottom: 12 }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. White"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">License Plate</label>
                  <input
                    type="text"
                    placeholder="e.g. QUT-999"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '13px', height: '36px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '13px', height: '36px' }}
                >
                  Add Car
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddVehicle(true)}
              className="btn btn-secondary btn-full"
              style={{ marginTop: '12px', fontSize: '13px', padding: '10px 0' }}
            >
              + Register New Vehicle
            </button>
          )}
        </div>

        <div className="divider"></div>

        <button
          type="button"
          className="btn btn-danger btn-full"
          onClick={handleLogout}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
