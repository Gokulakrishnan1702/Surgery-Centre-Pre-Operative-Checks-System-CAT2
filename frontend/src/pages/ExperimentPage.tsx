import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  FileCheck,
  RefreshCw,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { ExperimentDataset, ErrorAnalysisItem } from '../types';

export const ExperimentPage: React.FC = () => {
  const [experimentData, setExperimentData] = useState<ExperimentDataset | null>(null);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiment' | 'error_analysis'>('experiment');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expRes, errRes] = await Promise.all([
        api.experiment.getMetrics(),
        api.experiment.getErrors()
      ]);
      setExperimentData(expRes);
      setErrorAnalysis(errRes);
    } catch (err) {
      console.error('Failed to load experiment data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const primaryMetric = experimentData?.metrics[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
              Comparative Clinical Evaluation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Info className="w-3 h-3" /> Live Event DB Derived
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Baseline vs. Prototype Safety Experiment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quantitative evaluation comparing legacy checkbox-only ticking against the SurgiGate evidence-backed safety protocol.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Recalculate Metrics
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('experiment')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'experiment'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Metrics & Primary Target
        </button>
        <button
          onClick={() => setActiveTab('error_analysis')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'error_analysis'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Error Analysis & Root Causes ({errorAnalysis.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        </div>
      ) : activeTab === 'experiment' ? (
        <>
          {/* Primary Target Highlight Hero Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              <div className="lg:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" /> PRIMARY CLINICAL SAFETY TARGET
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  ≥ 90% Critical Steps Evidence-Verified
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  In surgical safety, ticking a box without documentary proof is a primary driver of preventable sentinel events. The primary outcome metric mandates that every critical checklist step must be accompanied by cryptographic evidence and specialist confirmation before OR incision.
                </p>

                {/* Mathematical Formula Card */}
                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 font-mono text-xs sm:text-sm text-indigo-200">
                  <div className="text-[11px] text-slate-400 uppercase font-sans font-semibold mb-1">
                    Formal Metric Evaluation Formula:
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">Verification Rate (%) =</span>
                    <div className="inline-flex flex-col items-center">
                      <span className="border-b border-indigo-400/80 px-2 pb-0.5 text-emerald-300">
                        Evidence-Verified Critical Steps
                      </span>
                      <span className="pt-0.5 text-slate-300">Total Critical Steps</span>
                    </div>
                    <span className="font-bold text-white">× 100</span>
                  </div>
                </div>
              </div>

              {/* Metric Card Stats */}
              <div className="flex flex-col justify-between bg-slate-800/60 rounded-xl p-6 border border-slate-700/80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>BASELINE METHOD</span>
                    <span className="text-rose-400 font-bold">{primaryMetric?.baseline}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${primaryMetric?.baseline || 18.4}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2">
                    <span>SURGIGATE PROTOTYPE</span>
                    <span className="text-emerald-400 font-bold text-lg">{primaryMetric?.prototype}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${primaryMetric?.prototype || 95}%` }} />
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target Threshold:</span>
                    <span className="font-semibold text-white">≥ 90.0%</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
                  <div className="text-xs text-slate-400">Net Improvement</div>
                  <div className="text-emerald-400 font-extrabold text-xl flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" />
                    +{((primaryMetric?.prototype || 0) - (primaryMetric?.baseline || 0)).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experiment Setup Specifications Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Experiment Design & Evaluation Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Experiment Name</div>
                <div className="font-bold text-slate-800 mt-1">WHO Evidence-Backed Enforcement</div>
                <div className="text-xs text-slate-500 mt-0.5">Trial Ref: EXP-2026-WHO-SPS</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Baseline Method</div>
                <div className="font-bold text-slate-800 mt-1">Checkbox-Only Workflow</div>
                <div className="text-xs text-slate-500 mt-0.5">Zero mandatory evidence attachments</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Sample Size</div>
                <div className="font-bold text-slate-800 mt-1">120 Baseline + Live Cohort</div>
                <div className="text-xs text-slate-500 mt-0.5">Powered by ChecklistEvent Ledger</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase">Population Groups</div>
                <div className="font-bold text-slate-800 mt-1">Group A vs Group B</div>
                <div className="text-xs text-slate-500 mt-0.5">Fairness disparity threshold: ≤ 10%</div>
              </div>
            </div>
          </div>

          {/* Comprehensive Comparative Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Key Performance & Safety Indicators</h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculated dynamically from real checklist event logs in the PostgreSQL/store database</p>
              </div>
              <span className="text-xs text-slate-400">Total metrics evaluated: {experimentData?.metrics.length || 0}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3.5 px-6">Metric Name & Rationale</th>
                    <th className="py-3.5 px-4 text-center">Baseline (Checkbox)</th>
                    <th className="py-3.5 px-4 text-center">Target Threshold</th>
                    <th className="py-3.5 px-4 text-center">Prototype (Measured)</th>
                    <th className="py-3.5 px-6 text-right">Clinical Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {experimentData?.metrics.map((m, idx) => {
                    const isPositive = m.name.includes('Rate') && (m.name.includes('Missing') || m.name.includes('Override'))
                      ? m.prototype < m.baseline
                      : m.prototype > m.baseline;
                    const delta = (m.prototype - m.baseline).toFixed(1);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800">{m.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{m.description}</div>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-medium text-slate-600">
                          {m.baseline}{m.unit}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {idx === 0 ? '≥ 90.0%' : idx === 1 ? '< 5.0%' : idx === 2 ? '≥ 95.0%' : '100%'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">
                          <span className={`px-2.5 py-1 rounded-md ${
                            isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {m.prototype}{m.unit}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold">
                          <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {delta.startsWith('-') ? delta : `+${delta}`}{m.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Error Analysis Section (Section 14) */
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Systematic Failure Mode & Error Reduction Breakdown</div>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                Comparison of safety failures prevented by SurgiGate. Baseline errors represent undetected vulnerabilities in standard checkbox systems, whereas Prototype errors trigger immediate server-side exceptions and halt OR clearance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {errorAnalysis.map((err) => (
              <div key={err.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      err.category === 'EVIDENCE' ? 'bg-blue-100 text-blue-800' :
                      err.category === 'ROLE' ? 'bg-purple-100 text-purple-800' :
                      err.category === 'EXCEPTION' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {err.category}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {err.reduction_percentage} Reduction
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{err.error_type}</h4>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Baseline</div>
                      <div className="text-base font-bold text-rose-600">{err.baseline_count}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Prototype</div>
                      <div className="text-base font-bold text-emerald-600">{err.prototype_count}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700">Root Cause: </span>
                      <span className="text-slate-600">{err.root_cause}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-700">Corrective Action: </span>
                      <span className="text-slate-600">{err.corrective_action}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Delta: {err.difference} incidents</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enforced by Safety Guard
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
