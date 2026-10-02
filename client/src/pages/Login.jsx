import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('brian@safekazi.co.ke');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-glow-emerald">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Freelancer Login
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your M-Pesa escrow projects & payouts
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-xl">
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="brian@example.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Quick Demo Hint */}
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">Demo Account Credentials:</span>
              <div className="mt-1 font-mono text-[11px] text-slate-300">
                Email: brian@safekazi.co.ke <br />
                Password: password123
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-glow-emerald flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have a freelancer account?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
