import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getLocalSlots, saveLocalSlots } from '../utils/localDb';

export default function AdminPanel() {
  const { user, localMode } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [slotNumber, setSlotNumber] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchSlots();
  }, [user, navigate, localMode]);

  const fetchSlots = async () => {
    setLoading(true);
    if (localMode) {
      setSlots(getLocalSlots());
      setLoading(false);
    } else {
      try {
        const res = await axiosInstance.get('/api/slots', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSlots(res.data);
      } catch (err) {
        showToast('Failed to load slots.', true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(null);
    setSlotNumber('');
    setLocation('');
    setPricePerHour('');
    setModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setIsEditing(slot);
    setSlotNumber(slot.slotNumber);
    setLocation(slot.location);
    setPricePerHour(slot.pricePerHour);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slotData = { slotNumber, location, pricePerHour: Number(pricePerHour) };

    if (localMode) {
      const allSlots = getLocalSlots();
      if (isEditing) {
        const updated = allSlots.map(s => s._id === isEditing._id ? { ...s, ...slotData } : s);
        saveLocalSlots(updated);
        setSlots(updated);
        showToast('✓ Slot updated (Local Mode)');
      } else {
        const newSlot = { _id: 'local-slot-' + Date.now(), ...slotData, isAvailable: true };
        const updated = [...allSlots, newSlot];
        saveLocalSlots(updated);
        setSlots(updated);
        showToast('✓ Slot created (Local Mode)');
      }
      setModalOpen(false);
    } else {
      try {
        if (isEditing) {
          const res = await axiosInstance.put(`/api/slots/${isEditing._id}`, slotData, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSlots(slots.map(s => s._id === isEditing._id ? res.data : s));
          showToast('✓ Slot updated successfully');
        } else {
          const res = await axiosInstance.post('/api/slots', slotData, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSlots([...slots, res.data]);
          showToast('✓ Slot created successfully');
        }
        setModalOpen(false);
      } catch (err) {
        showToast(err.response?.data?.message || 'Operation failed.', true);
      }
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (localMode) {
      const updated = getLocalSlots().filter(s => s._id !== slotId);
      saveLocalSlots(updated);
      setSlots(updated);
      setConfirmDelete(null);
      showToast('✓ Slot removed (Local Mode)');
    } else {
      try {
        await axiosInstance.delete(`/api/slots/${slotId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSlots(slots.filter(s => s._id !== slotId));
        setConfirmDelete(null);
        showToast('✓ Slot removed successfully');
      } catch (err) {
        showToast('Failed to remove slot.', true);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading admin console...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Toast */}
      {toast && (
        <div className="toast" style={toast.isError ? {
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)'
        } : {}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', textDecoration: 'none', fontSize: 16,
            flexShrink: 0
          }}>←</Link>
          <div>
            <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--amber)', fontSize: 20 }}>🛡️</span> Admin
            </h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Manage parking slots</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            background: 'var(--amber)',
            color: '#0a0a0f',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          + Add Slot
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-row" style={{ margin: '0 16px 16px' }}>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--amber)' }}>{slots.length}</span>
          <span className="stat-label">Total Slots</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--green)' }}>{slots.filter(s => s.isAvailable).length}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--red)' }}>{slots.filter(s => !s.isAvailable).length}</span>
          <span className="stat-label">Occupied</span>
        </div>
      </div>

      {/* Slot Cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="section-label">All Parking Slots</p>

        {slots.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🅿️</div>
            <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--text-secondary)' }}>No slots registered</p>
            <p style={{ fontSize: 12, margin: 0 }}>Tap "+ Add Slot" to create the first parking slot</p>
          </div>
        ) : (
          slots.map((slot) => (
            <div key={slot._id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'border-color 0.2s'
            }}>
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: slot.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0
              }}>
                🚗
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                    {slot.slotNumber}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: slot.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: slot.isAvailable ? 'var(--green)' : 'var(--red)'
                  }}>
                    {slot.isAvailable ? 'OPEN' : 'OCCUPIED'}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📍 {slot.location}
                </p>
                <p style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 700, margin: '2px 0 0' }}>
                  ${slot.pricePerHour}/hr
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleOpenEdit(slot)}
                  style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-md)',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    color: 'var(--amber)', cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >✏️</button>
                <button
                  onClick={() => setConfirmDelete(slot)}
                  style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-md)',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: 'var(--red)', cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Bottom Sheet */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="bottom-sheet" style={{ animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)' }}>
            <div className="sheet-handle" />
            <h2 className="sheet-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--amber)' }}>🛡️</span>
              {isEditing ? 'Edit Slot' : 'Add Parking Slot'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Slot Number</label>
                <input
                  className="input"
                  type="text"
                  required
                  placeholder="e.g. GP-A101"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input
                  className="input"
                  type="text"
                  required
                  placeholder="e.g. QUT Gardens Point - Block A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Price Per Hour ($)</label>
                <input
                  className="input"
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  placeholder="e.g. 5"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, background: 'var(--amber)', color: '#0a0a0f', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
                  {isEditing ? 'Save Changes' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Sheet */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="bottom-sheet" style={{ animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)' }}>
            <div className="sheet-handle" />
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Delete Slot?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Remove <strong style={{ color: 'var(--text-primary)' }}>{confirmDelete.slotNumber}</strong>? This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSlot(confirmDelete._id)}
                className="btn"
                style={{ flex: 2, background: 'var(--red)', color: 'white', border: 'none', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
              >
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
