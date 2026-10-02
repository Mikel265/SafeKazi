import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatKES } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Copy, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight,
  Wallet,
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    lockedAmount: 0,
    releasedAmount: 0,
    pendingAmount: 0,
    disputedAmount: 0,
    totalProjects: 0
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/projects');
      if (data.success) {
        setMetrics(data.metrics);
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const copyPaymentLink = (projectId) => {
    const link = `${window.location.origin}/p/${projectId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(projectId);
    showToast('Payment link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this pending project?')) return;
    setActionLoading(projectId);
    try {
      await apiFetch(`/projects/${projectId}`, { method: 'DELETE' });
      showToast('Project deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateApprove = async (projectId) => {
    setActionLoading(projectId);
    try {
      const data = await apiFetch(`/public/projects/${projectId}/approve`, { method: 'POST' });
      if (data.success) {
        showToast(`Escrow Released! M-Pesa Receipt: ${data.data.mpesaReceipt}`);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-glow-emerald border border-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Freelancer Escrow Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track active milestone escrows, client payments, and M-Pesa payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/project/new"
            className="px-4 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Project Link</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Escrow Volume */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Escrow Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatKES(metrics.totalVolume)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Across {metrics.totalProjects} generated projects
            </p>
          </div>
        </div>

        {/* Funds Locked in Escrow */}
        <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Funds Locked (Escrow Active)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-300 tracking-tight">
              {formatKES(metrics.lockedAmount)}
            </div>
            <p className="text-[11px] text-blue-400/80 mt-1">
              Paid by clients • Work in progress
            </p>
          </div>
        </div>

        {/* Released Payouts */}
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Released to M-Pesa
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-300 tracking-tight">
              {formatKES(metrics.releasedAmount)}
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-1">
              Completed B2C payouts
            </p>
          </div>
        </div>

        {/* Pending Deposit */}
        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Awaiting Client Payment
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {formatKES(metrics.pendingAmount)}
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1">
              Payment links shared with clients
            </p>
          </div>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-extrabold text-lg text-white">Escrow Projects</h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', 'pending', 'locked', 'released', 'disputed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-emerald-600 text-white shadow-glow-emerald'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Project Items */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading project escrows...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No projects found in '{filter}' filter.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a project link to request an upfront M-Pesa milestone escrow deposit from your client.
            </p>
            <Link
              to="/project/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-glow-emerald transition-all mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Project</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredProjects.map((p) => (
              <div key={p.id} className="p-4 sm:p-6 hover:bg-slate-900/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white">{p.title}</h3>
                      <StatusBadge status={p.status} />
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span>ID: {p.id}</span>
                      <span>•</span>
                      <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                      {p.client_phone && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">Client: {p.client_phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-extrabold text-emerald-400">
                        {formatKES(p.amount)}
                      </div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                        Escrow Amount
                      </span>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => copyPaymentLink(p.id)}
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Copy Public Link"
                      >
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">
                          {copiedId === p.id ? 'Copied!' : 'Copy Link'}
                        </span>
                      </button>

                      <Link
                        to={`/p/${p.id}`}
                        target="_blank"
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Open Client Public View"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Client Page</span>
                      </Link>

                      {/* Demo Action: If locked, allow simulate client approval from dashboard */}
                      {p.status === 'locked' && (
                        <button
                          onClick={() => handleSimulateApprove(p.id)}
                          disabled={actionLoading === p.id}
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Simulate Client Approval & Release Escrow Payout"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Release Payout</span>
                        </button>
                      )}

                      {/* Delete pending */}
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={actionLoading === p.id}
                          className="p-2.5 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-400 rounded-xl text-xs transition-colors"
                          title="Delete Pending Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
