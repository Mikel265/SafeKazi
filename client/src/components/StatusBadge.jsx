import React from 'react';
import { Clock, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status, showIcon = true }) {
  const norm = (status || 'pending').toLowerCase();

  const configs = {
    pending: {
      label: 'Awaiting Deposit',
      style: 'badge-pending',
      icon: Clock
    },
    locked: {
      label: 'Funds Locked',
      style: 'badge-locked',
      icon: Lock
    },
    released: {
      label: 'Funds Released',
      style: 'badge-released',
      icon: CheckCircle2
    },
    disputed: {
      label: 'Disputed',
      style: 'badge-disputed',
      icon: AlertTriangle
    }
  };

  const config = configs[norm] || configs.pending;
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${config.style}`}>
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
