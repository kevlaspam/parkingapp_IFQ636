import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Car, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00'
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSlots = async () => {
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
    };

    fetchSlots();
  }, [user, navigate]);

  const handleBookClick = (slot) => {
    setBookingSlot(slot);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingSlot) return;

    try {
      const startDateTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}:00`);
      const endDateTime = new Date(`${bookingDetails.date}T${bookingDetails.endTime}:00`);

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
      // Remove slot from available list
      setSlots(slots.filter(s => s._id !== bookingSlot._id));

      setToast(`Successfully reserved Slot ${bookingSlot.slotNumber}!`);
      setTimeout(() => {
        setToast(null);
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg font-semibold text-slate-600 animate-pulse">Loading available slots...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed top-24 right-6 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Car className="text-indigo-600" size={32} />
              Book a Parking Slot
            </h1>
            <p className="text-slate-500 mt-2">Choose from our list of available real-time slots.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/bookings" className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 shadow-sm transition">
              My Reservations
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition">
                Admin Settings
              </Link>
            )}
          </div>
        </header>

        {slots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <Car className="mx-auto text-slate-300 mb-4 animate-bounce" size={48} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Slots Available</h2>
            <p className="text-slate-500">All parking spaces are currently occupied. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div key={slot._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm border border-indigo-100">
                      {slot.slotNumber}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded-md text-xs border border-emerald-100">
                      Available
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    {slot.location}
                  </h3>
                </div>

                <div className="mt-6">
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-4 border border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Price per hour</span>
                    <span className="text-lg font-extrabold text-slate-800">${slot.pricePerHour}/hr</span>
                  </div>

                  <button
                    onClick={() => handleBookClick(slot)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={24} />
              Book Slot {bookingSlot.slotNumber}
            </h2>
            <p className="text-sm text-slate-500 mb-6">{bookingSlot.location} • ${bookingSlot.pricePerHour}/hr</p>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingDetails.startTime}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, startTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookingDetails.endTime}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, endTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-md"
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
