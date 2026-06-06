import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trash2, Edit2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axiosInstance.delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(bookings.filter(b => b._id !== bookingId));
    } catch (err) {
      alert('Failed to cancel booking.');
    }
  };

  const handleEditTime = async (booking) => {
    const formatTime = (isoString) => {
      if (!isoString) return '12:00';
      return isoString.includes('T') ? isoString.split('T')[1].substring(0, 5) : '12:00';
    };

    const newStart = prompt('Enter new Start Time (HH:MM):', formatTime(booking.startTime));
    const newEnd = prompt('Enter new End Time (HH:MM):', formatTime(booking.endTime));

    if (!newStart || !newEnd) return;

    try {
      const dateStr = booking.startTime ? booking.startTime.split('T')[0] : new Date().toISOString().split('T')[0];
      const startDateTime = new Date(`${dateStr}T${newStart}:00`);
      const endDateTime = new Date(`${dateStr}T${newEnd}:00`);

      const res = await axiosInstance.put(
        `/api/bookings/${booking._id}`,
        {
          startTime: startDateTime,
          endTime: endDateTime
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      // Reload bookings list
      setBookings(bookings.map(b => b._id === booking._id ? { ...b, startTime: res.data.startTime, endTime: res.data.endTime } : b));
      alert('Booking updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update time.');
    }
  };

  const displayTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg font-semibold text-slate-600 animate-pulse">Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                My Reservations
              </h1>
              <p className="text-slate-500 mt-1">Manage your active parking reservations here.</p>
            </div>
          </div>
        </header>

        {bookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Reservations Found</h2>
            <p className="text-slate-500 mb-6">You don't have any active bookings at the moment.</p>
            <Link to="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-md">
              Book a Slot Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const slot = booking.parkingSlot || {};
              return (
                <div key={booking._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm border border-indigo-100">
                        {slot.slotNumber || 'Slot'}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-xs border border-emerald-100">
                        Active Booking
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-700 font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <MapPin size={16} className="text-slate-400" />
                        {slot.location || 'Unknown location'}
                      </p>
                      <p className="text-slate-600 font-medium flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        {displayDate(booking.startTime)}
                      </p>
                      <p className="text-slate-600 font-medium flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-slate-400" />
                        {displayTime(booking.startTime)} - {displayTime(booking.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleEditTime(booking)}
                      className="flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 py-2 px-4 rounded-xl font-medium transition text-sm shadow-sm"
                    >
                      <Edit2 size={14} />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 py-2 px-4 rounded-xl font-medium transition text-sm shadow-sm"
                    >
                      <Trash2 size={14} />
                      Cancel Booking
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
