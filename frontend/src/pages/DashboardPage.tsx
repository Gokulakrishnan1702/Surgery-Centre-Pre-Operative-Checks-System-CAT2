import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck2,
  Clock,
  AlertTriangle,
  Scale,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../services/api';
import { DashboardKPIs } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { WorkflowStepper } from '../components/common/WorkflowStepper';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analytics.getOverview();
      setKpis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-48 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Unable to load dashboard data</h3>
        <p className="text-xs text-slate-500">{error || 'Server connection failed.'}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Pre-operative progress timeline mock data
  const progressTimeline = [
    { date: 'Apr 22', verified: 34, pending: 18, exceptions: 1 },
    { date: 'Apr 23', verified: 37, pending: 16, exceptions: 2 },
    { date: 'Apr 24', verified: 40, pending: 14, exceptions: 1 },
    { date: 'Apr 25', verified: 43, pending: 11, exceptions: 3 },
    { date: 'Apr 26', verified: 46, pending: 9, exceptions: 2 },
    { date: 'Apr 27', verified: 48, pending: 7, exceptions: 2 },
    { date: 'Apr 28', verified: 51, pending: 5, exceptions: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Demo Banner for Quick Flow Demonstration */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide uppercase">
              Demonstration Scenario
            </span>
            <span className="text-blue-100 text-xs font-medium">Ready to inspect</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">
            Patient: R. Suresh (P10001) — Cardiac Surgery (CABG)
          </h2>
          <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
            Currently flagged with an <strong>Exception</strong> on "Cardiac Clearance" requiring Cardiologist clearance evidence and human confirmation sign-off.
          </p>
        </div>

        <button
          onClick={() => navigate('/patients/pat-10001')}
          className="px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shrink-0 shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <span>Open Demo Patient Checklist</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Critical Steps Verified"
          value={kpis.criticalStepsVerified?.current ?? 38}
          total={kpis.criticalStepsVerified?.total ?? 40}
          percentage={kpis.criticalStepsVerified?.percentage ?? 95}
          trend={kpis.criticalStepsVerified?.trend ?? '+4.2%'}
          statusText="ON TRACK"
          statusType="success"
          icon={ShieldCheck}
        />

        <KpiCard
          title="Evidence Complete"
          value={kpis.evidenceComplete?.current ?? 48}
          total={kpis.evidenceComplete?.total ?? 50}
          percentage={kpis.evidenceComplete?.percentage ?? 96}
          trend={kpis.evidenceComplete?.trend ?? '+2.1%'}
          statusText="ACTIVE"
          statusType="info"
          icon={FileCheck2}
        />

        <KpiCard
          title="Pending Confirmation"
          value={kpis.pendingHumanConfirmation.count}
          subtitle="Awaiting clinician modal sign-off"
          statusText={kpis.pendingHumanConfirmation.status}
          statusType="warning"
          icon={Clock}
        />

        <KpiCard
          title="Active Exceptions"
          value={kpis.exceptions.count}
          subtitle="Open safety policy flags"
          statusText={kpis.exceptions.status}
          statusType="danger"
          icon={AlertTriangle}
        />

        <KpiCard
          title="Fairness Evaluation"
          value={kpis.fairnessTest.status}
          subtitle={`Disparity: ${kpis.fairnessTest.disparity} (<= ${kpis.fairnessTest.threshold})`}
          statusText="SYNTHETIC COHORT"
          statusType="purple"
          icon={Scale}
        />
      </div>

      {/* Workflow Stepper */}
      <WorkflowStepper stages={kpis.workflowStages} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Donut Chart: Checklist Completion Rate */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Checklist Completion Rate</h3>
              <span className="text-[10px] text-slate-400 font-mono">Real-time DB</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Distribution across all synthetic surgery checklists</p>
          </div>

          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpis.completionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {kpis.completionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} steps`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{kpis.criticalStepsVerified?.percentage ?? 95}%</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            {kpis.completionDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* B. Bar Chart: Evidence Coverage */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Evidence Coverage by Clinical Category</h3>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                Required vs Available vs Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enforcing attached evidence documentation before steps can be certified
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis.evidenceCoverage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="required" fill="#94a3b8" name="Required Policy" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" fill="#3b82f6" name="Available Evidence" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" fill="#10b981" name="Clinician Verified" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* C. Pre-operative Progress Trend */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-sm">Pre-Operative Verification Trend (7 Days)</h3>
            <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Daily verified vs pending pre-operative checks</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVerified)" name="Verified Steps" />
                <Area type="monotone" dataKey="pending" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" name="Pending Reviews" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* D. Exceptions by Category & E. Team Workload */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exceptions by Category */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Exceptions Breakdown</h3>
              <p className="text-xs text-slate-500 mb-3">Safety gating anomalies</p>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.exceptionsByCategory} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Active Exceptions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Workload */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Role Task Load</h3>
              <p className="text-xs text-slate-500 mb-3">Assigned vs completed steps</p>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.teamWorkload} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="role" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="assigned" fill="#cbd5e1" name="Assigned" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
