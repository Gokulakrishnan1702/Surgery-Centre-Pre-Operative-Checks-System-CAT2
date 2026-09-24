import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  total?: string | number;
  percentage?: number;
  trend?: string;
  statusText?: string;
  statusType?: 'success' | 'warning' | 'danger' | 'purple' | 'info';
  icon: LucideIcon;
  subtitle?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  total,
  percentage,
  trend,
  statusText,
  statusType = 'info',
  icon: Icon,
  subtitle,
}) => {
  const statusStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const iconColors = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    purple: 'bg-purple-100 text-purple-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
            {total !== undefined && (
              <span className="text-sm font-semibold text-slate-400">/ {total}</span>
            )}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColors[statusType]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {percentage !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">{percentage}%</span>
            {trend && <span className="text-emerald-600 font-semibold text-[11px]">{trend}</span>}
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 font-medium">{subtitle}</span>
        ) : (
          <span className="text-slate-400">Current active cohort</span>
        )}

        {statusText && (
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${statusStyles[statusType]}`}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
};
