import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft, Shield, X } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [slotNumber, setSlotNumber] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  
  const [isEditing, setIsEditing] = useState(null); // Slot object being edited
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Access Denied. Admins only.');
      navigate('/dashboard');
      return;
    }

    const fetchAllSlots = async () => {
      try {
        const res = await axiosInstance.get('/api/slots', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSlots(res.data);
      } catch (err) {
        console.error('Error fetching admin slots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSlots();
  }, [user, navigate]);

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

    const slotData = {
      slotNumber,
      location,
      pricePerHour: Number(pricePerHour)
    };

    try {
      if (isEditing) {
        // Update slot
        const res = await axiosInstance.put(
          `/api/slots/${isEditing._id}`,
          slotData,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        setSlots(slots.map(s => s._id === isEditing._id ? res.data : s));
        alert('Slot updated successfully.');
      } else {
        // Create slot
        const res = await axiosInstance.post(
          '/api/slots',
          slotData,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        setSlots([...slots, res.data]);
        alert('Slot created successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this parking slot? All associated bookings will be removed.')) return;

    try {
      await axiosInstance.delete(`/api/slots/${slotId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSlots(slots.filter(s => s._id !== slotId));
      alert('Slot removed successfully.');
    } catch (err) {
      alert('Failed to remove slot.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg font-semibold text-slate-600 animate-pulse">Loading administration console...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Shield size={28} className="text-indigo-600" />
                Admin Slot Management
              </h1>
              <p className="text-slate-500 mt-1">Add, update, or remove parking slots in the MongoDB registry.</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition shadow-md flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Slot
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Slot Number</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price / Hour</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {slots.map((slot) => (
                <tr key={slot._id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded text-sm border border-slate-200">
                      {slot.slotNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                    {slot.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                    ${slot.pricePerHour}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${slot.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {slot.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenEdit(slot)}
                      className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 rounded-lg text-slate-600 hover:text-slate-800 transition"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 p-1.5 rounded-lg text-rose-600 hover:text-rose-700 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500 font-medium">
                    No slots registered. Click "Add New Slot" to populate database registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Shield className="text-indigo-600" size={24} />
                {isEditing ? 'Modify Slot' : 'Add Parking Slot'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slot Number (e.g. Slot A-101)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slot A-101"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location (e.g. Ground Floor)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floor 1 - North Wing"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price Per Hour ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 5"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-md"
                >
                  {isEditing ? 'Save Changes' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
