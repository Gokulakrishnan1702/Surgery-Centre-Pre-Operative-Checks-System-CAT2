import React from 'react';
import {
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  Cpu,
  UserCheck,
  ShieldAlert,
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
  LineChart,
  Line
} from 'recharts';
import { RiskHistoryRecord, ChecklistHistoryRecord, Patient } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface PatientRiskChecklistHistoryTabProps {
  patient: Patient;
  riskHistory?: RiskHistoryRecord[];
  checklistHistory?: ChecklistHistoryRecord[];
}

export const PatientRiskChecklistHistoryTab: React.FC<PatientRiskChecklistHistoryTabProps> = ({
  patient,
  riskHistory = [],
  checklistHistory = []
}) => {
  const checklistChartData = checklistHistory.map((c) => ({
    name: c.relative_day,
    percentage: c.completion_percentage,
    completed: c.items_completed,
    total: c.items_total
  }));

  const riskChartData = riskHistory.map((r) => ({
    name: r.relative_day,
    score: r.new_score,
    level: r.new_risk_level
  }));

  return (
    <div className="space-y-6">
      {/* 1. Risk Trajectory Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Clinical Risk Trajectory & Scoring History</span>
            </h4>
            <p className="text-xs text-slate-500">
              Explainable AI (XAI) risk score updates triggered by procedural updates and specialty exceptions
            </p>
          </div>
          <span className="text-xs font-mono bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg font-bold">
            Current Risk: {patient.risk_level}
          </span>
        </div>

        {/* Risk Score Progress Line Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`${value} / 100`, 'Risk Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#e11d48"
                strokeWidth={3}
                name="XAI Risk Score"
                dot={{ r: 5, fill: '#e11d48' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sequential Risk Transition Cards */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Risk Assessment Milestones
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {riskHistory.map((rh, idx) => (
              <div
                key={rh.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{rh.relative_day}</span>
                  <span className="text-[11px] font-mono text-slate-400">{rh.timestamp}</span>
                </div>

                {/* Transition Pill */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
                  <RiskBadge level={rh.previous_risk_level} />
                  <span className="text-xs font-mono text-slate-400">({rh.previous_score})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <RiskBadge level={rh.new_risk_level} />
                  <span className="text-xs font-mono font-bold text-rose-600">Score: {rh.new_score}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-900">{rh.reason}</div>
                  {rh.explanation && (
                    <p className="text-xs text-slate-600 leading-relaxed">{rh.explanation}</p>
                  )}
                </div>

                {/* Contributing factors */}
                {rh.contributing_factors && rh.contributing_factors.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Attributed Factors:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {rh.contributing_factors.map((fac, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Reviewed By: {rh.reviewer_name}</span>
                  <span>Model: {rh.model_version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Checklist History Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <span>Pre-Operative Checklist Progression History</span>
            </h4>
            <p className="text-xs text-slate-500">
              Tracking verified surgical safety criteria milestones from intake to operative readiness
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
            Latest Progress: {checklistHistory[checklistHistory.length - 1]?.completion_percentage || 87}%
          </span>
        </div>

        {/* Checklist Completion Bar Chart */}
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={checklistChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}% completed`, 'Checklist Readiness']}
              />
              <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {checklistHistory.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-200 hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>{c.relative_day}</span>
                <span className="text-emerald-700 font-extrabold text-sm">{c.completion_percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${c.completion_percentage}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500">
                {c.items_completed} of {c.items_total} steps verified
              </div>
              <div className="pt-2 border-t border-slate-200/60 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Updated Steps:</div>
                {c.changed_items.map((it, itIdx) => (
                  <div key={itIdx} className="text-[11px] text-slate-700 truncate" title={it}>
                    • {it}
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate pt-1">
                By: {c.recorded_by}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
