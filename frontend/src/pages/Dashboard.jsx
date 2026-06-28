import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getLocalSlots, saveLocalSlots, getLocalBookings, saveLocalBookings } from '../utils/localDb';

export default function Dashboard() {
  const { user, localMode } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const getSlotCategory = (location) => {
    if (!location) return { label: 'Unknown', className: 'badge-muted' };
    if (location.includes('Gardens Point')) {
      return { label: 'QUT GP', className: 'badge-violet' };
    }
    if (location.includes('Kelvin Grove')) {
      return { label: 'QUT KG', className: 'badge-blue' };
    }
    if (location.includes('Council Partner')) {
      return { label: 'BCC Partner', className: 'badge-green' };
    }
    return { label: 'Off-Campus', className: 'badge-muted' };
  };

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayString = getLocalDateString();

  const [bookingDetails, setBookingDetails] = useState({
    date: todayString,
    startTime: '09:00',
    endTime: '12:00'
  });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      if (localMode) {
        const allSlots = getLocalSlots();
        const available = allSlots.filter(s => s.isAvailable);
        setSlots(available);
        setLoading(false);
      } else {
        try {
          const res = await axiosInstance.get('/api/slots/available', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setSlots(res.data);
        } catch (err) {
          console.error('Error fetching slots:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSlots();
  }, [user, navigate, localMode]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingSlot) return;

    const startDateTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}:00`);
    const endDateTime = new Date(`${bookingDetails.date}T${bookingDetails.endTime}:00`);

    const now = new Date();
    if (startDateTime < now) {
      setToast('⚠️ Start time must be in the future!');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (endDateTime <= startDateTime) {
      setToast('⚠️ End time must be after start time!');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (localMode) {
      const allSlots = getLocalSlots();
      const updatedSlots = allSlots.map(s =>
        s._id === bookingSlot._id ? { ...s, isAvailable: false } : s
      );
      saveLocalSlots(updatedSlots);

      const allBookings = getLocalBookings();
      const newBooking = {
        _id: 'local-booking-' + Date.now(),
        user: user.id || 'student-built-in',
        parkingSlot: {
          slotNumber: bookingSlot.slotNumber,
          location: bookingSlot.location,
          pricePerHour: bookingSlot.pricePerHour
        },
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };
      saveLocalBookings([...allBookings, newBooking]);

      setBookingSlot(null);
      setSlots(slots.filter(s => s._id !== bookingSlot._id));
      setToast('🎉 Parking slot booked successfully (Local Mode)!');
      setTimeout(() => {
        setToast(null);
        navigate('/bookings');
      }, 2000);
    } else {
      try {
        await axiosInstance.post(
          '/api/bookings',
          {
            parkingSlotId: bookingSlot._id,
            startTime: startDateTime,
            endTime: endDateTime
          },
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );

        setBookingSlot(null);
        setSlots(slots.filter(s => s._id !== bookingSlot._id));

        setToast(`✓ Slot ${bookingSlot.slotNumber} reserved!`);
        setTimeout(() => {
          setToast(null);
          navigate('/bookings');
        }, 2000);
      } catch (err) {
        setToast('⚠️ ' + (err.response?.data?.message || 'Booking failed.'));
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  const filteredSlots = slots.filter(s => {
    if (activeTab === 'gp' && !s.location?.includes('Gardens Point')) return false;
    if (activeTab === 'kg' && !s.location?.includes('Kelvin Grove')) return false;
    if (activeTab === 'suburbs' && !s.location?.includes('Council Partner')) return false;

    return (
      s.slotNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Finding available spots...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast">
          <span>{toast}</span>
        </div>
      )}

      {/* Hero greeting */}
      <div className="hero-greeting">
        <p className="hero-greeting-text">Good day 👋</p>
        <h1 className="hero-user-name">{firstName}</h1>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-light)' }}>{slots.length}</span>
          <span className="stat-label">Open Spots</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--green)' }}>Live</span>
          <span className="stat-label">Availability</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-bar-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          placeholder="Search by slot or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Campus Filtering Tabs */}
      <div className="filter-tabs" style={{ display: 'flex', gap: 8, margin: '14px 0', overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'All Parks' },
          { id: 'gp', label: 'Gardens Point' },
          { id: 'kg', label: 'Kelvin Grove' },
          { id: 'suburbs', label: 'BCC Suburbs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-tab ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === tab.id ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-card)',
              color: activeTab === tab.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Slot list */}
      <p className="section-label">Available Parking</p>
      <div className="slots-grid">
        {filteredSlots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🅿️</div>
            <p className="empty-title">No Spots Available</p>
            <p className="empty-desc">All parking spaces are currently occupied. Check back soon!</p>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot._id}
              className="slot-card"
              onClick={() => setBookingSlot(slot)}
            >
              <div className="slot-icon">🚗</div>
              <div className="slot-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="slot-number">Slot {slot.slotNumber}</span>
                  <span className={`badge ${getSlotCategory(slot.location).className}`}>
                    {getSlotCategory(slot.location).label}
                  </span>
                </div>
                <div className="slot-location">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
                    <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {slot.location}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="slot-price">${slot.pricePerHour}</div>
                <div className="slot-price-label">per hour</div>
                <div className="badge badge-green" style={{ marginTop: 6 }}>Open</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Bottom Sheet */}
      {bookingSlot && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setBookingSlot(null); }}>
          <div className="bottom-sheet">
            <div className="sheet-handle"></div>
            <h2 className="sheet-title">Reserve Slot {bookingSlot.slotNumber}</h2>
            <p className="sheet-subtitle">
              📍 {bookingSlot.location} &nbsp;·&nbsp; ${bookingSlot.pricePerHour}/hr
            </p>

            <form onSubmit={handleConfirmBooking}>
              <div className="input-group">
                <label className="input-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 4 }}>
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  Date
                </label>
                <input
                  type="date"
                  required
                  min={todayString}
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  className="input"
                />
              </div>

              <div className="input-row">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingDetails.startTime}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, startTime: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">End Time</label>
                  <input
                    type="time"
                    required
                    value={bookingDetails.endTime}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {/* Duration preview */}
              {bookingDetails.startTime && bookingDetails.endTime && (
                <div style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated duration</span>
                  <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>
                    {(() => {
                      const [sh, sm] = bookingDetails.startTime.split(':').map(Number);
                      const [eh, em] = bookingDetails.endTime.split(':').map(Number);
                      const diff = (eh * 60 + em) - (sh * 60 + sm);
                      if (diff <= 0) return '—';
                      const h = Math.floor(diff / 60);
                      const m = diff % 60;
                      return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
                    })()}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
