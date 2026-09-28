import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  History,
  BarChart3,
  Cpu,
  Scale,
  UserCog,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Info,
  FlaskConical,
  Terminal,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Surgeries (OT)', path: '/surgeries', icon: Activity },
    { label: 'Pre-Op Checklists', path: '/checklists', icon: ClipboardCheck },
    { label: 'Evidence', path: '/evidence', icon: FileText },
    { label: 'Exceptions', path: '/exceptions', icon: AlertTriangle, badge: '2' },
    { label: 'Overrides', path: '/overrides', icon: ShieldAlert },
    { label: 'Audit Log', path: '/audit-log', icon: History },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Experiment & Errors', path: '/experiment', icon: FlaskConical },
    { label: 'Safety Test Lab', path: '/safety-lab', icon: Terminal },
    { label: 'User Validation', path: '/stakeholder-validation', icon: UserCheck },
    { label: 'Deployment Checklist', path: '/deployment-readiness', icon: CheckCircle2 },
    { label: 'AI Models & Governance', path: '/models', icon: Cpu },
    { label: 'Bias & Fairness', path: '/fairness', icon: Scale },
    { label: 'Users & Roles', path: '/users', icon: UserCog },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-18 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-white text-base tracking-tight leading-tight">
            SurgicalSafety<span className="text-blue-400">OS</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium tracking-wide">
            Evidence-Backed Pre-Op
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Clinical Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role & Synthetic Data Disclaimer Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
            {user?.role.slice(0, 2) || 'MD'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate" title={user?.name}>
              {user?.name || 'Clinician'}
            </div>
            <div className="text-[10px] font-mono text-blue-400 tracking-wider font-semibold">
              ROLE: {user?.role || 'SURGEON'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 leading-tight">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>Academic demo prototype. Synthetic records only. Not clinical advice.</span>
        </div>
      </div>
    </aside>
  );
};
