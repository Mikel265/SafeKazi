import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch, formatKES } from '../utils/api';
import { ShieldCheck, ArrowLeft, CheckCircle2, Copy, ExternalLink, AlertCircle, DollarSign, FileText, Phone, Sparkles } from 'lucide-react';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProject, setCreatedProject] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than KES 0.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          amount: parsedAmount,
          client_phone: clientPhone,
        }),
      });

      if (data.success) {
        setCreatedProject(data.project);
      }
    } catch (err) {
      setError(err.message || 'Failed to create project link.');
    } finally {
      setLoading(false);
    }
  };

  const shareableUrl = createdProject
    ? `${window.location.origin}/p/${createdProject.id}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {!createdProject ? (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-glow-emerald">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Create Escrow Project Link
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Generate a secure shareable M-Pesa payment link for your SME client
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Title / Deliverable Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Redesign & M-Pesa Integration"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Scope / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Scope & Deliverables Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline exact deliverables expected before client releases escrow funds (e.g. Deliverable 1: Figma prototype, Deliverable 2: Node.js API code repository)."
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all resize-y"
              />
            </div>

            {/* Amount & Client Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Escrow Amount (KES) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                    KES
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 pl-14 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="text-[11px] text-emerald-400 font-medium mt-1">
                    Formatted: {formatKES(amount)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Client M-Pesa Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">How Escrow Protection Works:</span>
                <p className="mt-0.5 text-slate-400">
                  Your client pays into SafeKazi Escrow via M-Pesa STK Push. Once funds are locked, you complete the work off-platform. The client inspects and approves the work to release funds directly to your M-Pesa.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-glow-emerald flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Payment Link...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate M-Pesa Escrow Link</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Generated Success View */
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-glow-emerald animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Escrow Payment Link Ready!</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Share this secure link with your client to lock <span className="font-bold text-emerald-400">{formatKES(createdProject.amount)}</span> in escrow.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shareable Escrow URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 rounded-lg px-3 py-2.5 outline-none select-all"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={shareableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Link in New Tab</span>
            </a>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center justify-center gap-2 transition-all shadow-glow-emerald"
            >
              <span>Go to Project Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
