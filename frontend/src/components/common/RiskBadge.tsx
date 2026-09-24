import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  switch (level) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center font-bold tracking-wide rounded-md bg-rose-100 text-rose-800 border border-rose-300 ${sizeClasses}`}
        >
          ● CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center font-bold tracking-wide rounded-md bg-orange-100 text-orange-800 border border-orange-300 ${sizeClasses}`}
        >
          ● HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center font-semibold tracking-wide rounded-md bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center font-semibold tracking-wide rounded-md bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          LOW
        </span>
      );
  }
};
