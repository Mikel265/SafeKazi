import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, PlusCircle, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <img
            src="/safekazi-logo.png"
            alt="SafeKazi Logo"
            className="h-10 w-auto object-contain hover:scale-105 transition-transform"
          />
        </Link>

        {/* Action Links */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/project/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Project</span>
              </Link>

              <div className="h-6 w-px bg-slate-800 mx-1" />

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-slate-200">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-glow-emerald transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
