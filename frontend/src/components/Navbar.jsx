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
    <nav className="bg-slate-900 border-b border-slate-800 text-white p-4 pt-8 flex justify-between items-center z-40 select-none">
      <Link to="/" className="text-md font-bold flex items-center gap-1.5 hover:text-indigo-400 transition">
        <Car size={18} className="text-indigo-500" />
        <span>Parking Booking</span>
      </Link>
      <div className="flex items-center gap-2 text-xs font-semibold">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-indigo-400 transition">Slots</Link>
            <Link to="/bookings" className="hover:text-indigo-400 transition">Bookings</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:text-indigo-400 transition">Admin</Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-indigo-600 px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-indigo-400 transition mr-1">Login</Link>
            <Link
              to="/register"
              className="bg-indigo-600 px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition"
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
