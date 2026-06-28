import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getLocalSlots, saveLocalSlots, getLocalBookings, saveLocalBookings, getRegisteredVehicles, getSavedPaymentMethod } from '../utils/localDb';

export default function Dashboard() {
  const { user, localMode } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [savedCard, setSavedCard] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });

  useEffect(() => {
    if (bookingSlot) {
      const list = getRegisteredVehicles();
      setVehicles(list);
      if (list.length > 0) {
        setSelectedVehicle(list[0].plate);
      } else {
        setSelectedVehicle('');
      }
    }
  }, [bookingSlot]);

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

  const [searchDate, setSearchDate] = useState(todayString);
  const [searchStartTime, setSearchStartTime] = useState('09:00');
  const [searchEndTime, setSearchEndTime] = useState('12:00');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      if (localMode) {
        const allSlots = getLocalSlots();
        const startFilter = new Date(`${searchDate}T${searchStartTime}:00`);
        const endFilter = new Date(`${searchDate}T${searchEndTime}:00`);
        const allBookings = getLocalBookings();

        const available = allSlots.filter(slot => {
          const hasOverlap = allBookings.some(b => {
            if (b.parkingSlot.slotNumber !== slot.slotNumber) return false;
            const bStart = new Date(b.startTime);
            const bEnd = new Date(b.endTime);
            return bStart < endFilter && startFilter < bEnd;
          });
          return !hasOverlap;
        });

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
  }, [user, navigate, localMode, searchDate, searchStartTime, searchEndTime]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingSlot) return;

    const startDateTime = new Date(`${searchDate}T${searchStartTime}:00`);
    const endDateTime = new Date(`${searchDate}T${searchEndTime}:00`);

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

    setSavedCard(getSavedPaymentMethod());
    setPaymentStatus('idle');
    setShowPayment(true);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        setShowPayment(false);
        setPaymentStatus('idle');
        handleExecuteBooking();
      }, 1800);
    }, 1500);
  };

  const handleExecuteBooking = async () => {
    const startDateTime = new Date(`${searchDate}T${searchStartTime}:00`);
    const endDateTime = new Date(`${searchDate}T${searchEndTime}:00`);

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
        endTime: endDateTime.toISOString(),
        licensePlate: selectedVehicle
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
            endTime: endDateTime,
            licensePlate: selectedVehicle
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

      {/* Schedule filter bar */}
      {!isEditingSchedule ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '10px 16px',
          margin: '0 16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📅</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {new Date(searchDate).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {searchStartTime} to {searchEndTime}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditingSchedule(true)}
            style={{
              background: 'rgba(124,58,237,0.15)',
              color: 'var(--accent-light)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '16px',
          margin: '0 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              📅 Select Booking Schedule
            </p>
            <button
              onClick={() => setIsEditingSchedule(false)}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              Done
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '10px', marginBottom: '4px' }}>Date</label>
              <input
                type="date"
                min={todayString}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="input"
                style={{ height: '36px', background: 'var(--bg-input)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '10px', marginBottom: '4px' }}>Start Time</label>
                <input
                  type="time"
                  value={searchStartTime}
                  onChange={(e) => setSearchStartTime(e.target.value)}
                  className="input"
                  style={{ height: '36px', background: 'var(--bg-input)' }}
                />
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '10px', marginBottom: '4px' }}>End Time</label>
                <input
                  type="time"
                  value={searchEndTime}
                  onChange={(e) => setSearchEndTime(e.target.value)}
                  className="input"
                  style={{ height: '36px', background: 'var(--bg-input)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="input"
                />
              </div>

              <div className="input-row">
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Start Time</label>
                  <input
                    type="time"
                    required
                    value={searchStartTime}
                    onChange={(e) => setSearchStartTime(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">End Time</label>
                  <input
                    type="time"
                    required
                    value={searchEndTime}
                    onChange={(e) => setSearchEndTime(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">Select Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="input"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plate} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      🚗 {v.color} {v.model} ({v.plate})
                    </option>
                  ))}
                  {vehicles.length === 0 && (
                    <option value="" disabled>No vehicles registered. Go to Profile.</option>
                  )}
                </select>
              </div>

              {/* Duration preview */}
              {searchStartTime && searchEndTime && (
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
                      const [sh, sm] = searchStartTime.split(':').map(Number);
                      const [eh, em] = searchEndTime.split(':').map(Number);
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

      {/* Payment Overlay Sheet */}
      {showPayment && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget && paymentStatus === 'idle') setShowPayment(false); }}>
          <div className="bottom-sheet" style={{ animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)' }}>
            <div className="sheet-handle"></div>
            
            {paymentStatus === 'success' ? (
              /* Payment Success Animation Screen */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                height: '260px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)',
                  border: '4px solid var(--green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{
                    strokeDasharray: 50,
                    strokeDashoffset: 0,
                    transition: 'all 0.5s ease'
                  }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: '50%',
                    border: '2px solid var(--green)',
                    animation: 'pulseRipple 1.2s cubic-bezier(0.24, 0, 0.38, 1) infinite'
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Payment Successful!
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Your booking is being finalized...
                  </p>
                </div>
              </div>
            ) : (
              /* Payment Processing/Form Screen */
              <form onSubmit={handleProcessPayment}>
                <h2 className="sheet-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔒 Secure Checkout
                </h2>
                <p className="sheet-subtitle">
                  Review card details below to authorize reservation payment
                </p>

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
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                    <div>
                      <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.7, fontWeight: 700 }}>
                        Mock Payment
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px', letterSpacing: '0.02em' }}>
                        Visa Card
                      </div>
                    </div>
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

                  <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'Courier New, monospace', margin: '12px 0', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {savedCard.cardNumber ? savedCard.cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                    <div>
                      <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, fontWeight: 700 }}>Cardholder</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em', marginTop: '2px', textTransform: 'uppercase' }}>
                        {savedCard.cardholderName || 'John Doe'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, fontWeight: 700 }}>Expires</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em', marginTop: '2px' }}>
                        {savedCard.expiryDate || 'MM/YY'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setShowPayment(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={paymentStatus === 'processing'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'white' }}></div>
                        Authorizing...
                      </div>
                    ) : (
                      'Authorize Payment'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
