import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, formatKES } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import MpesaSimulatorModal from '../components/MpesaSimulatorModal';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Smartphone, 
  AlertCircle, 
  User, 
  Clock, 
  ArrowRight, 
  FileText, 
  ShieldAlert, 
  Receipt, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';

export default function PublicPaymentPage() {
  const { project_id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Client input states
  const [phone, setPhone] = useState('0712345678');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);

  const fetchPublicProject = async () => {
    try {
      const data = await apiFetch(`/public/projects/${project_id}`);
      if (data.success) {
        setProject(data.project);
      }
    } catch (err) {
      setError(err.message || 'Escrow link not found or expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProject();
  }, [project_id]);

  // STK Push submission trigger
  const handleStartPayment = (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9) {
      alert('Please enter a valid M-Pesa phone number.');
      return;
    }
    setIsSimulatorOpen(true);
  };

  // Callback executed by simulator or direct pay
  const handleConfirmPayment = async (inputPhone) => {
    const data = await apiFetch(`/public/projects/${project_id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ phone: inputPhone, amount: project.amount }),
    });

    if (data.success) {
      await fetchPublicProject();
    }
    return data;
  };

  // Client approves work & releases escrow payout
  const handleApproveWork = async () => {
    if (!window.confirm(`Are you sure you want to approve this work and release ${formatKES(project.amount)} from escrow to ${project.freelancer.name}?`)) {
      return;
    }

    setActionLoading(true);
    setActionMsg('');

    try {
      const data = await apiFetch(`/public/projects/${project_id}/approve`, {
        method: 'POST',
      });

      if (data.success) {
        setActionMsg(`Success! M-Pesa payout triggered. Receipt: ${data.data.mpesaReceipt}`);
        await fetchPublicProject();
      }
    } catch (err) {
      alert(err.message || 'Work approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Raise dispute
  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setActionLoading(true);
    try {
      const data = await apiFetch(`/public/projects/${project_id}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason: disputeReason }),
      });
      if (data.success) {
        setShowDisputeInput(false);
        await fetchPublicProject();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading secure escrow details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-red-900/50 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Escrow Payment Link Error</h2>
          <p className="text-xs text-slate-400">{error || 'The requested project could not be found.'}</p>
          <Link to="/" className="inline-block py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] pb-12 pt-4 px-4 sm:px-6">
      {/* Top Escrow Branding Bar */}
      <div className="max-w-md mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/safekazi-logo.png"
            alt="SafeKazi Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="text-[11px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Financial-Grade Protection</span>
        </div>
      </div>

      {/* Main Container - Mobile Optimized */}
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Freelancer Trust Badge Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-extrabold text-white text-base shadow-glow-emerald shrink-0">
            {project.freelancer?.name ? project.freelancer.name.charAt(0) : 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Project Freelancer
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-white truncate">
              {project.freelancer?.name || 'Verified Freelancer'}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Phone: {project.freelancer?.masked_phone}
            </p>
          </div>
        </div>

        {/* Project Scope Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Project Scope
              </span>
              <h1 className="text-lg font-extrabold text-white leading-snug">
                {project.title}
              </h1>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Deliverables & Description:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Amount Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Total Escrow Amount</span>
              <span className="text-xs text-emerald-400 font-mono">M-Pesa STK / B2C Milestone</span>
            </div>
            <div className="text-xl font-black text-emerald-400 tracking-tight">
              {formatKES(project.amount)}
            </div>
          </div>
        </div>

        {/* Dynamic Escrow Action Card */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-4">
          {actionMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionMsg}</span>
            </div>
          )}

          {/* 1. STATE: PENDING (Client Pays M-Pesa STK Push) */}
          {project.status === 'pending' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Step 1: Deposit Funds to Lock Escrow</span>
              </div>

              <p className="text-xs text-slate-300">
                Your payment will be locked safely in SafeKazi escrow. Funds are ONLY released to the freelancer after you inspect and approve their final work.
              </p>

              <form onSubmit={handleStartPayment} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 pl-10 text-sm font-bold text-white placeholder-slate-500 outline-none"
                    />
                    <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-slate-950 bg-[#00C300] hover:bg-[#00a300] active:scale-[0.98] transition-all shadow-glow-mpesa flex items-center justify-center gap-2 text-sm"
                >
                  <Smartphone className="w-5 h-5 fill-current" />
                  <span>PAY {formatKES(project.amount)} VIA M-PESA</span>
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(true)}
                  className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open STK Push Phone Simulator</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. STATE: LOCKED (Funds Locked in Escrow & Client Approval Button) */}
          {project.status === 'locked' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-950/60 border border-blue-800/80 rounded-xl text-xs text-blue-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-sm text-blue-300 block">Funds Locked in Escrow 🔒</span>
                  <p className="mt-1 text-blue-300/80 leading-relaxed">
                    Client deposit of <span className="font-bold text-white">{formatKES(project.amount)}</span> is safely locked. The freelancer is executing deliverables off-platform.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Has the freelancer delivered the agreed work?
                </span>

                <button
                  onClick={handleApproveWork}
                  disabled={actionLoading}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-glow-emerald flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {actionLoading ? (
                    <span>Releasing M-Pesa Payout...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>APPROVE WORK & RELEASE ESCROW</span>
                    </>
                  )}
                </button>

                {!showDisputeInput ? (
                  <button
                    onClick={() => setShowDisputeInput(true)}
                    className="w-full text-center text-xs text-slate-400 hover:text-red-400 transition-colors py-1 font-semibold"
                  >
                    Issue with work? Raise a Dispute
                  </button>
                ) : (
                  <form onSubmit={handleFileDispute} className="space-y-2 pt-2 border-t border-slate-800">
                    <textarea
                      required
                      rows={2}
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Describe the issue with deliverables..."
                      className="w-full bg-slate-950 border border-red-900/60 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-1/2 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                      >
                        Submit Dispute
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDisputeInput(false)}
                        className="w-1/2 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 3. STATE: RELEASED */}
          {project.status === 'released' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">Escrow Released & Paid Out 🚀</h4>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  The client has approved deliverables. M-Pesa B2C payout sent to freelancer.
                </p>
              </div>
            </div>
          )}

          {/* 4. STATE: DISPUTED */}
          {project.status === 'disputed' && (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Escrow Under Dispute Review ⚠️</h4>
              <p className="text-xs text-slate-300">
                SafeKazi arbitration team is reviewing the project deliverables and dispute claim.
              </p>
            </div>
          )}
        </div>

        {/* Audit & Transaction Timeline */}
        {project.transactions && project.transactions.length > 0 && (
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Escrow Audit Log
            </h4>
            <div className="space-y-2">
              {project.transactions.map((t) => (
                <div key={t.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white capitalize">{t.type} Transaction</span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      M-Pesa Receipt: <span className="text-emerald-400 font-bold">{t.mpesa_receipt}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">{formatKES(t.amount)}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(t.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Interactive M-Pesa STK Push Phone Simulator Modal */}
      <MpesaSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        project={project}
        phone={phone}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
