import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Loader2, X, ShieldCheck, Lock } from 'lucide-react';
import { formatKES } from '../utils/api';

export default function MpesaSimulatorModal({ isOpen, onClose, project, phone, onConfirmPayment }) {
  const [pin, setPin] = useState('1234');
  const [stage, setStage] = useState('prompt'); // 'prompt' | 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('1234');
      setStage('prompt');
      setErrorMsg('');
      setReceipt('');
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmitPin = async (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMsg('Please enter a 4-digit M-Pesa PIN');
      return;
    }

    setStage('processing');
    setErrorMsg('');

    try {
      // Simulate 2.5s M-Pesa Daraja network push delay
      const res = await onConfirmPayment(phone, pin);
      setReceipt(res.data?.mpesaReceipt || 'QK99X2M1PL');
      setStage('success');
    } catch (err) {
      setStage('error');
      setErrorMsg(err.message || 'M-Pesa payment failed or timed out.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Phone Notch / Speaker Mock */}
        <div className="bg-slate-950 py-2 flex justify-center items-center border-b border-slate-800">
          <div className="w-16 h-1.5 bg-slate-800 rounded-full" />
        </div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/50 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* M-PESA STK Push Banner */}
        <div className="bg-[#00C300] text-slate-950 p-4 text-center">
          <div className="flex items-center justify-center gap-2 font-black text-lg uppercase tracking-wider">
            <Smartphone className="w-5 h-5 fill-current" />
            LIPA NA M-PESA
          </div>
          <p className="text-xs font-bold opacity-90 tracking-wide mt-0.5">
            STK Push Simulation (Daraja API)
          </p>
        </div>

        {/* Content based on Stage */}
        <div className="p-6">
          {stage === 'prompt' && (
            <form onSubmit={handleSubmitPin} className="space-y-4">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant:</span>
                  <span className="font-semibold text-white">SAFEKAZI ESCROW</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Item Scope:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[160px]">{project.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phone Number:</span>
                  <span className="font-mono text-emerald-400 font-bold">{phone}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Amount:</span>
                  <span className="font-extrabold text-base text-emerald-400">{formatKES(project.amount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter M-Pesa PIN (Demo PIN: 1234)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center tracking-[1em] text-2xl font-bold bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 text-white"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 bg-red-950/50 border border-red-800 text-red-300 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-[#00C300] hover:bg-[#00a300] active:scale-[0.98] transition-all shadow-glow-mpesa flex items-center justify-center gap-2"
              >
                <span>SEND PIN & PAY {formatKES(project.amount)}</span>
              </button>
            </form>
          )}

          {stage === 'processing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center" />
                <Smartphone className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Processing STK Push...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                  Communicating with Safaricom Daraja Gateway. Encrypting escrow lock transaction.
                </p>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-lg">M-Pesa Payment Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  M-Pesa Receipt: <span className="font-mono font-bold text-emerald-400">{receipt}</span>
                </p>
                <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Funds are safely locked in SafeKazi Escrow.</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
              >
                Return to Escrow Status
              </button>
            </div>
          )}

          {stage === 'error' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Transaction Failed</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">{errorMsg}</p>
              </div>
              <button
                onClick={() => setStage('prompt')}
                className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
