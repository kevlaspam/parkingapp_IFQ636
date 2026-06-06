import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:text-indigo-400 transition">
        <Car size={24} className="text-indigo-500" />
        <span>Parking Booking</span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-indigo-400 transition">Dashboard</Link>
            <Link to="/bookings" className="hover:text-indigo-400 transition">My Bookings</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:text-indigo-400 transition">Admin</Link>
            )}
            <Link to="/figma" className="text-amber-400 hover:text-amber-300 transition font-bold">Figma Simulator</Link>
            <Link to="/profile" className="hover:text-indigo-400 transition">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 px-4 py-1.5 rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/figma" className="text-amber-400 hover:text-amber-300 transition font-bold mr-2">Figma Simulator</Link>
            <Link to="/login" className="hover:text-indigo-400 transition mr-2">Login</Link>
            <Link
              to="/register"
              className="bg-indigo-600 px-4 py-1.5 rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
