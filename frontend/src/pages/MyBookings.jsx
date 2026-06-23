import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editTimes, setEditTimes] = useState({ startTime: '', endTime: '' });
  const [toast, setToast] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axiosInstance.get('/api/bookings', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axiosInstance.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(bookings.filter(b => b._id !== bookingId));
      showToast('Booking cancelled');
    } catch (err) {
      showToast('Failed to cancel booking', true);
    }
  };

  const handleOpenEdit = (booking) => {
    const formatTime = (iso) => {
      if (!iso) return '12:00';
      return iso.includes('T') ? iso.split('T')[1].substring(0, 5) : '12:00';
    };
    setEditTimes({
      startTime: formatTime(booking.startTime),
      endTime: formatTime(booking.endTime),
    });
    setEditingBooking(booking);
  };

  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      const dateStr = editingBooking.startTime
        ? editingBooking.startTime.split('T')[0]
        : new Date().toISOString().split('T')[0];
      const startDateTime = new Date(`${dateStr}T${editTimes.startTime}:00`);
      const endDateTime = new Date(`${dateStr}T${editTimes.endTime}:00`);

      const now = new Date();
      if (startDateTime < now) {
        showToast('Start time must be in the future', true);
        return;
      }
      if (endDateTime <= startDateTime) {
        showToast('End time must be after start time', true);
        return;
      }

      const res = await axiosInstance.put(
        `/api/bookings/${editingBooking._id}`,
        { startTime: startDateTime, endTime: endDateTime },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setBookings(bookings.map(b =>
        b._id === editingBooking._id
          ? { ...b, startTime: res.data.startTime, endTime: res.data.endTime }
          : b
      ));
      setEditingBooking(null);
      showToast('Booking updated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', true);
    }
  };

  const displayTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading your bookings...</p>
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

      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <h1 className="page-title">My Trips</h1>
          <div className="badge badge-violet">{bookings.length} active</div>
        </div>
        <p className="page-subtitle">Your parking reservations</p>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗓️</div>
            <p className="empty-title">No Reservations Yet</p>
            <p className="empty-desc">You haven't booked any parking spots. Head over to the Park tab to get started.</p>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('/dashboard')}>
              Find a Spot
            </button>
          </div>
        ) : (
          bookings.map((booking) => {
            const slot = booking.parkingSlot || {};
            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      background: 'rgba(124,58,237,0.2)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16
                    }}>🚗</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Slot {slot.slotNumber || '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {slot.location || 'Unknown location'}
                      </div>
                    </div>
                  </div>
                  <div className="badge badge-green">Active</div>
                </div>

                <div className="booking-card-body">
                  <div className="info-row">
                    <div className="info-row-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                      </svg>
                    </div>
                    <span className="info-row-text">Date</span>
                    <span className="info-row-value">{displayDate(booking.startTime)}</span>
                  </div>
                  <div className="info-row">
                    <div className="info-row-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <span className="info-row-text">Time</span>
                    <span className="info-row-value">{displayTime(booking.startTime)} → {displayTime(booking.endTime)}</span>
                  </div>
                  {slot.pricePerHour && (
                    <div className="info-row">
                      <div className="info-row-icon">💰</div>
                      <span className="info-row-text">Rate</span>
                      <span className="info-row-value" style={{ color: 'var(--accent-light)' }}>${slot.pricePerHour}/hr</span>
                    </div>
                  )}
                </div>

                <div className="booking-card-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleOpenEdit(booking)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                    Reschedule
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setCancellingBooking(booking)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Bottom Sheet */}
      {editingBooking && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingBooking(null); }}>
          <div className="bottom-sheet">
            <div className="sheet-handle"></div>
            <h2 className="sheet-title">Reschedule Booking</h2>
            <p className="sheet-subtitle">
              Slot {editingBooking.parkingSlot?.slotNumber} · {displayDate(editingBooking.startTime)}
            </p>

            <form onSubmit={handleConfirmEdit}>
              <div className="input-row">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">New Start</label>
                  <input
                    type="time"
                    required
                    value={editTimes.startTime}
                    onChange={(e) => setEditTimes({ ...editTimes, startTime: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">New End</label>
                  <input
                    type="time"
                    required
                    value={editTimes.endTime}
                    onChange={(e) => setEditTimes({ ...editTimes, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Bottom Sheet */}
      {cancellingBooking && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setCancellingBooking(null); }}>
          <div className="bottom-sheet">
            <div className="sheet-handle"></div>
            <h2 className="sheet-title" style={{ color: 'var(--red)' }}>Cancel Trip?</h2>
            <p className="sheet-subtitle">
              Are you sure you want to cancel your booking for <strong>Slot {cancellingBooking.parkingSlot?.slotNumber}</strong>? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setCancellingBooking(null)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  handleCancelBooking(cancellingBooking._id);
                  setCancellingBooking(null);
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
