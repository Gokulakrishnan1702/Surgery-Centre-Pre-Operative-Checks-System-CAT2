import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertTriangle, RefreshCw, Info, Sliders, Shield } from 'lucide-react';
import { api } from '../services/api';
import { FairnessEvaluation } from '../types';

export const FairnessPage: React.FC = () => {
  const [evaluation, setEvaluation] = useState<FairnessEvaluation | null>(null);
  const [threshold, setThreshold] = useState<number>(5.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    loadFairness();
  }, []);

  const loadFairness = async () => {
    setLoading(true);
    try {
      const data = await api.fairness.get(threshold);
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setRunning(true);
    try {
      const res = await api.fairness.run(threshold);
      setEvaluation(res.evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  if (loading || !evaluation) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const isPassed = evaluation.result === 'PASSED';

  const rows = [
    { label: 'Number of Patients Checked', a: `${evaluation.group_a.cases} cases`, b: `${evaluation.group_b.cases} cases`, diff: '—', status: 'BALANCED' },
    { label: 'Checklists Completed (%)', a: `${evaluation.group_a.completion_rate}%`, b: `${evaluation.group_b.completion_rate}%`, diff: `${evaluation.differences.completion_rate_diff}%`, isDisparity: evaluation.differences.completion_rate_diff > threshold },
    { label: 'Patients with Safety Alerts (%)', a: `${evaluation.group_a.exception_rate}%`, b: `${evaluation.group_b.exception_rate}%`, diff: `${evaluation.differences.exception_rate_diff}%`, isDisparity: evaluation.differences.exception_rate_diff > threshold },
    { label: 'Documents Uploaded & Verified (%)', a: `${evaluation.group_a.evidence_verification_rate}%`, b: `${evaluation.group_b.evidence_verification_rate}%`, diff: `${evaluation.differences.evidence_verification_rate_diff}%`, isDisparity: evaluation.differences.evidence_verification_rate_diff > threshold },
    { label: "Doctor's Manual Approvals (%)", a: `${evaluation.group_a.human_confirmation_rate}%`, b: `${evaluation.group_b.human_confirmation_rate}%`, diff: `${evaluation.differences.human_confirmation_rate_diff}%`, isDisparity: evaluation.differences.human_confirmation_rate_diff > threshold },
    { label: 'Missed Errors / Risk Score', a: `${evaluation.group_a.false_negative_rate}%`, b: `${evaluation.group_b.false_negative_rate}%`, diff: `${evaluation.differences.false_negative_rate_diff}%`, isDisparity: evaluation.differences.false_negative_rate_diff > threshold },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Synthetic Prototype Fairness & Bias Evaluation
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Algorithmic parity analysis across synthetic population cohorts (Cohort Alpha vs Cohort Beta)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-purple-600" />
            <span>Fairness Audit Protocol</span>
          </span>
        </div>
      </div>

      {/* Mandatory Academic Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950 uppercase tracking-wide">
            Synthetic Prototype Fairness Evaluation Disclaimer
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            This module evaluates demographic parity across synthetically generated clinical cohorts for research and demonstration purposes only. It does <strong>NOT</strong> claim real-world medical fairness or validate epidemiological outcomes. All patient records in this simulation are synthetic.
          </p>
        </div>
      </div>

      {/* Threshold Controller & Test Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isPassed ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Evaluation Verdict
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {evaluation.result}
                </span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                Maximum Demographic Disparity: {evaluation.differences.max_disparity}%{' '}
                <span className="text-xs font-normal text-slate-500">
                  (Tolerance Threshold: {threshold}%)
                </span>
              </div>
            </div>
          </div>

          {/* Configurable Threshold Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Disparity Threshold:
                </span>
                <span className="font-bold font-mono text-purple-700">{threshold}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-48 accent-purple-600 cursor-pointer"
              />
            </div>

            <button
              disabled={running}
              onClick={handleRunEvaluation}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Calculating...' : 'Re-Evaluate'}</span>
            </button>
          </div>
        </div>

        {/* Population Group Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">What we are checking</th>
                <th className="py-3 px-4 text-slate-800">Group A (City Patients)</th>
                <th className="py-3 px-4 text-slate-800">Group B (Town/Village Patients)</th>
                <th className="py-3 px-4">Difference</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {r.label}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {r.a}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {r.b}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {r.diff}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.status}
                      </span>
                    ) : r.isDisparity ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        EXCEEDS THRESHOLD
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        WITHIN TOLERANCE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Metric Definitions & Methodology */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Checklist Speed (Completion Parity)</span>
            <p>Checks if checklists are being completed at the same speed for all patients, regardless of where they are from.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Fair Rules (Exception Symmetry)</span>
            <p>Checks if safety rules and alerts are applied fairly to everyone without any bias or discrimination.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Equal Scrutiny (Confirmation Integrity)</span>
            <p>Checks if manual doctor approvals are requested equally for all patients, without doubting any specific group more.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
