import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, ShieldCheck, MapPin, Calendar, Layout } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 inline-flex items-center justify-center animate-bounce">
          <Car size={48} className="text-indigo-600" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
          Premium Parking <span className="text-indigo-600">Booking System</span>
        </h1>
        
        <p className="text-lg text-slate-500 max-w-xl mb-12">
          Reserve parking spaces in real-time, manage bookings, and administer parking lots through a modern, fully-integrated MERN application.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                Go to Booking Dashboard
              </Link>
              <Link to="/bookings" className="bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl shadow hover:bg-slate-50 transition transform hover:-translate-y-0.5">
                My Bookings
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                Login
              </Link>
              <Link to="/register" className="bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-8 rounded-xl shadow hover:bg-slate-50 transition transform hover:-translate-y-0.5">
                Register
              </Link>
            </>
          )}

          {/* Figma Simulator Button */}
          <Link to="/figma" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2">
            <Layout size={18} />
            Figma Prototype Simulator
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left w-full">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 font-bold border border-indigo-100">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Real-time Slots</h3>
            <p className="text-slate-500 text-sm">View and track open parking spaces instantly in our interactive grid.</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 font-bold border border-indigo-100">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Quick Reservations</h3>
            <p className="text-slate-500 text-sm">Select dates and custom times to reserve your spot instantly.</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 font-bold border border-indigo-100">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Admin Dashboard</h3>
            <p className="text-slate-500 text-sm">Authorized slots administration panel with complete database CRUD capabilities.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Parking Booking System. Powered by MERN Stack & AWS.
      </footer>
    </div>
  );
}
