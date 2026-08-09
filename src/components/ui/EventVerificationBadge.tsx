import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { EventStatus, EventVerificationStatus } from '@/types/database';

interface EventVerificationBadgeProps {
  status: EventStatus;
  verificationStatus?: EventVerificationStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function EventVerificationBadge({
  status,
  verificationStatus = 'unverified',
  className = '',
  size = 'md',
}: EventVerificationBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  if (status === 'cancelled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-950/70 text-red-400 border border-red-800/60 ${sizeClasses} ${className}`}
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Cancelled</span>
      </span>
    );
  }

  if (status === 'postponed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/60 ${sizeClasses} ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Postponed</span>
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses} ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (verificationStatus === 'admin_verified') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm ${sizeClasses} ${className}`}
        title="Reviewed and verified by platform administration"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>✓ Admin Verified</span>
      </span>
    );
  }

  if (verificationStatus === 'organization_verified') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm ${sizeClasses} ${className}`}
        title="Published directly by a verified organization"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
        <span>✓ Verified Organization</span>
      </span>
    );
  }

  // Published but unverified
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/50 ${sizeClasses} ${className}`}
      title="Publicly published event"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
      <span>Published</span>
    </span>
  );
}
