import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { ExperimentDataset, DashboardKPIs } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [experiment, setExperiment] = useState<ExperimentDataset | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [expData, kpiData] = await Promise.all([
        api.analytics.getExperiment(),
        api.analytics.getOverview(),
      ]);
      setExperiment(expData);
      setKpis(kpiData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !experiment || !kpis) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  // Format data for Before vs After chart
  const experimentChartData = experiment.metrics.map((m) => ({
    name: m.name,
    Baseline: m.baseline,
    'Evidence-Backed Prototype': m.prototype,
  }));

  const evidenceSourceDistribution = [
    { name: 'Electronic Medical Record (EMR)', count: 48, fill: '#3b82f6' },
    { name: 'Central Pathology Laboratory', count: 36, fill: '#10b981' },
    { name: 'PACS Radiology Imaging', count: 22, fill: '#f59e0b' },
    { name: 'Specialist Clinical Note', count: 18, fill: '#8b5cf6' },
    { name: 'Signed Legal Consent Form', count: 14, fill: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Safety Analytics & Scientific Evaluation</h2>
        <p className="text-xs text-slate-500 font-medium">
          Quantified comparative experiment: Traditional Checkbox Checklist vs Evidence-Backed Pre-Op Verification Protocol
        </p>
      </div>

      {/* Top 6 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Completion</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">87.5%</span>
          <span className="text-[10px] font-semibold text-emerald-600">+12% vs prior</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Evidence Coverage</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">95.8%</span>
          <span className="text-[10px] font-semibold text-blue-600">Attached files</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Critical Verified</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{kpis.criticalStepsVerified?.percentage ?? 94}%</span>
          <span className="text-[10px] font-semibold text-emerald-600">Dual-attested</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Resolution Time</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">18 min</span>
          <span className="text-[10px] font-semibold text-slate-500">Per exception</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Open Exceptions</span>
          <span className="text-xl font-bold text-rose-600 mt-1 block">{kpis.exceptions.count}</span>
          <span className="text-[10px] font-semibold text-rose-600">Active gating</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Override Count</span>
          <span className="text-xl font-bold text-purple-700 mt-1 block">2</span>
          <span className="text-[10px] font-semibold text-purple-600">CMO supervised</span>
        </div>
      </div>

      {/* CORE EXPERIMENT: BEFORE VS AFTER COMPARISON */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold tracking-wider uppercase">
                Measurable Experiment
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                Baseline (Checkbox Checklist) vs Prototype (Evidence-Backed Safety OS)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical metrics derived directly from simulated cohort tracking (Baseline: passive completion without proof, Prototype: hard evidence gating)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Safety Delta</span>
              <span className="font-bold text-emerald-600">
                {experiment.summary.evidence_enforcement_delta}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Audit Trail Delta</span>
              <span className="font-bold text-blue-600">
                {experiment.summary.audit_coverage_delta}
              </span>
            </div>
          </div>
        </div>

        {/* Experiment Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={experimentChartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis unit="%" tick={{ fontSize: 11, fill: '#475569' }} domain={[0, 100]} />
              <Tooltip
                formatter={(val: any) => [`${val}%`, '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
              <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Baseline (Checkbox Only)" />
              <Bar dataKey="Evidence-Backed Prototype" fill="#2563eb" radius={[4, 4, 0, 0]} name="Evidence-Backed Prototype" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Comparison Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4">Baseline (Checkbox Only)</th>
                <th className="py-3 px-4">Evidence-Backed Prototype</th>
                <th className="py-3 px-4">Net Measured Improvement</th>
                <th className="py-3 px-5">Safety Impact Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {experiment.metrics.map((m) => {
                const diff = (m.prototype - m.baseline).toFixed(1);
                const isPositive = m.name.includes('Missing') || m.name.includes('Unresolved')
                  ? m.prototype < m.baseline
                  : m.prototype > m.baseline;

                return (
                  <tr key={m.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {m.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      {m.baseline}{m.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {m.prototype}{m.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPositive ? '✓' : '▲'} {diff > '0' ? `+${diff}` : diff}{m.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-[11px] leading-relaxed">
                      {m.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution of Evidence Sources & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Evidence Source System Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of validated data feeds</p>

          <div className="space-y-3 text-xs">
            {evidenceSourceDistribution.map((src) => (
              <div key={src.name} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">{src.name}</span>
                  <span className="font-bold text-slate-900">{src.count} records</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: src.fill, width: `${(src.count / 48) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Checklist Step Velocity</h3>
          <p className="text-xs text-slate-500 mb-4">Time from surgical booking to step verification</p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600">Allergy & Medication Review:</span>
              <span className="font-bold text-slate-800">42 min avg</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600">Laboratory & Coagulation Panels:</span>
              <span className="font-bold text-slate-800">2.4 hours avg</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600">PACS Radiological Landmark Check:</span>
              <span className="font-bold text-slate-800">3.8 hours avg</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <span className="text-slate-600">Specialist Cardiac Clearance:</span>
              <span className="font-bold text-slate-800">6.1 hours avg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
