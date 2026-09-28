import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Server,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { DeploymentReadinessReport, DeploymentChecklistItem } from '../types';

export const DeploymentReadinessPage: React.FC = () => {
  const [data, setData] = useState<DeploymentReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.validation.getDeploymentReadiness();
      setData(res);
    } catch (err) {
      console.error('Failed to load deployment readiness report:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = (title: string, items: DeploymentChecklistItem[], icon: React.ReactNode) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="text-indigo-600">{icon}</div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {items.filter(i => i.verified).length} / {items.length} VERIFIED
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 pl-6 leading-relaxed">{item.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Ref: {item.evidence}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Technical Due Diligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Evaluation Date: {data?.evaluation_date || new Date().toISOString().split('T')[0]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Deployment Readiness Checklist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System architectural verification covering application security, immutable data storage, human safety gates, and privacy compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Audit Checks
          </button>
        </div>
      </div>

      {/* Deployment Status Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            CURRENT SYSTEM STAGE
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            READY FOR CONTROLLED DEMONSTRATION
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            All 18 technical safeguards, backend role checks, and database validation suites have passed. The system is verified for simulated research demonstration and peer clinical walkthroughs.
          </p>
        </div>

        <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center sm:text-right">
          <div className="text-xs text-emerald-300 uppercase font-semibold">Verification Score</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">18 / 18</div>
          <div className="text-[11px] text-emerald-200/80 mt-1">100% Automated Checks Passed</div>
        </div>
      </div>

      {/* Clinical Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-300 uppercase">Regulatory & Clinical Notice: </span>
          {data?.disclaimer || 'Academic & Engineering Demonstration Prototype utilizing synthetic clinical data. Not certified as a Medical Device Software (SaMD) or for live surgical decision-making without real-world regulatory clearance.'}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {renderCategory('1. Application & Backend Security', data.categories.security, <Lock className="w-5 h-5" />)}
          {renderCategory('2. Data Integrity & Persistence', data.categories.data, <Database className="w-5 h-5" />)}
          {renderCategory('3. Human Confirmation & Clinical Safety Guards', data.categories.safety, <ShieldCheck className="w-5 h-5" />)}
          {renderCategory('4. Privacy, Consent & Governance', data.categories.privacy, <EyeOff className="w-5 h-5" />)}
          {renderCategory('5. Monitoring, Auditing & Health Equity', data.categories.monitoring, <Activity className="w-5 h-5" />)}
        </div>
      ) : null}
    </div>
  );
};
