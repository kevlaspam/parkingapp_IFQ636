import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { getRegisteredVehicles, saveRegisteredVehicles, getSavedPaymentMethod, savePaymentMethod } from '../utils/localDb';

const Profile = () => {
  const { user, logout, localMode, toggleLocalMode } = useAuth();
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

  // Card states
  const [card, setCard] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [showEditCard, setShowEditCard] = useState(false);
  const [savingCard, setSavingCard] = useState(false);

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
      setCard(getSavedPaymentMethod());
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

  const handleSaveCard = (e) => {
    e.preventDefault();
    setSavingCard(true);
    setTimeout(() => {
      savePaymentMethod(card);
      setSavingCard(false);
      setShowEditCard(false);
      setToast({ msg: 'Payment card updated!', isError: false });
      setTimeout(() => setToast(null), 2500);
    }, 1200);
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
        {/* Connection Switch Card */}
        <p className="section-label" style={{ padding: 0, marginBottom: 12 }}>Environment Connection</p>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
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
            <span>Server Status</span>
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

        {/* Payment Methods Section */}
        <p className="section-label" style={{ padding: 0, marginBottom: 12, marginTop: 20 }}>Payment Methods</p>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 14 }}>
          {/* Glassmorphic Credit Card Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4c1d95 100%)',
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '16px',
            aspectRatio: '1.58/1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white'
          }}>
            {/* Card Glow Effect */}
            <div style={{
              position: 'absolute',
              top: '-30%',
              left: '-20%',
              width: '80%',
              height: '80%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none'
            }} />
            
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7, fontWeight: 700 }}>
                  Credit/Debit Card
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.02em' }}>
                  Visa Card
                </div>
              </div>
              {/* Chip Icon */}
              <div style={{
                width: '32px',
                height: '22px',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                borderRadius: '4px',
                position: 'relative',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)'
              }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '20px', height: '12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
              </div>
            </div>

            {/* Card Number */}
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'Courier New, monospace', margin: '14px 0', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {card.cardNumber ? card.cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
            </div>

            {/* Card Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, fontWeight: 700 }}>Cardholder</div>
                <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em', marginTop: '2px', textTransform: 'uppercase' }}>
                  {card.cardholderName || 'John Doe'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, fontWeight: 700 }}>Expires</div>
                <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em', marginTop: '2px' }}>
                  {card.expiryDate || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>

          {showEditCard ? (
            <form onSubmit={handleSaveCard} style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div className="input-group">
                <label className="input-label">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={card.cardholderName}
                  onChange={(e) => setCard({ ...card, cardholderName: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Card Number</label>
                <input
                  type="text"
                  maxLength="19"
                  placeholder="e.g. 4242 4242 4242 4242"
                  value={card.cardNumber}
                  onChange={(e) => setCard({ ...card, cardNumber: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                  className="input"
                  required
                />
              </div>
              <div className="input-row" style={{ display: 'flex', gap: '8px', marginBottom: 12 }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Expiry Date</label>
                  <input
                    type="text"
                    maxLength="5"
                    placeholder="MM/YY"
                    value={card.expiryDate}
                    onChange={(e) => setCard({ ...card, expiryDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">CVV</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="123"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditCard(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '13px', height: '36px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingCard}
                  style={{ flex: 1, padding: '8px 0', fontSize: '13px', height: '36px', opacity: savingCard ? 0.7 : 1 }}
                >
                  {savingCard ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowEditCard(true)}
              className="btn btn-secondary btn-full"
              style={{ fontSize: '13px', padding: '10px 0' }}
            >
              Update Payment Card
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
