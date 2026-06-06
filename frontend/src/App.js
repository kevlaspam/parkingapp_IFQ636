import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminPanel from './pages/AdminPanel';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6">
      {/* Sleek Mobile Phone Mockup Bezel */}
      <div className="w-full max-w-[400px] h-[820px] bg-slate-50 shadow-2xl rounded-[48px] border-[12px] border-slate-800 overflow-hidden flex flex-col relative">
        {/* Speaker / Camera Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-700 rounded-full mb-1"></div>
        </div>
        
        {/* Navbar inside the mobile container */}
        <Navbar />
        
        {/* Main scrollable viewport */}
        <div className="flex-1 overflow-y-auto pt-2 pb-6">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
