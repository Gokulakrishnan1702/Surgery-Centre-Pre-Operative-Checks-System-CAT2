import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, ShieldAlert, CircleSlash } from 'lucide-react';
import { ChecklistStatus, SurgeryStatus } from '../../types';

interface StatusBadgeProps {
  status: ChecklistStatus | SurgeryStatus | 'READY' | 'IN_PROGRESS' | 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'VERIFIED':
    case 'READY':
    case 'RESOLVED':
    case 'APPROVED':
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>✓ Verified</span>
        </span>
      );

    case 'PENDING':
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
    case 'PREPARING':
    case 'APPROVAL_PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>! Pending</span>
        </span>
      );

    case 'PLANNED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Planned</span>
        </span>
      );

    case 'EXCEPTION':
    case 'OPEN':
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>! Exception</span>
        </span>
      );

    case 'OVERRIDE':
    case 'OVERRIDDEN':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>⚠ Override</span>
        </span>
      );

    case 'NOT_STARTED':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <CircleSlash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Not Started</span>
        </span>
      );
  }
};
