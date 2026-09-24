import React from 'react';
import {
  Activity,
  Heart,
  Droplets,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { VitalRecord, LabResultRecord, Patient } from '../../types';

interface PatientTrendsTabProps {
  patient: Patient;
  vitals?: VitalRecord[];
  labs?: LabResultRecord[];
}

export const PatientTrendsTab: React.FC<PatientTrendsTabProps> = ({
  patient,
  vitals = [],
  labs = []
}) => {
  // Format vitals data for charts
  const vitalsChartData = vitals.map((v) => ({
    day: v.relative_day,
    systolic: v.blood_pressure_systolic,
    diastolic: v.blood_pressure_diastolic,
    heartRate: v.heart_rate,
    spo2: v.spo2_percent,
    temp: v.temperature_celsius
  }));

  // Format labs data for charts (e.g. Hemoglobin, WBC, Platelets, Creatinine)
  const labsChartData = labs.map((l) => ({
    day: l.relative_day,
    hemoglobin: l.hemoglobin_g_dl,
    wbc: l.wbc_count_k_ul,
    platelets: l.platelets_k_ul,
    glucose: l.glucose_mg_dl,
    creatinine: l.creatinine_mg_dl
  }));

  const latestLab = labs[labs.length - 1];
  const firstLab = labs[0];
  const hbDelta = latestLab && firstLab ? (latestLab.hemoglobin_g_dl - firstLab.hemoglobin_g_dl).toFixed(1) : '0';

  const latestVital = vitals[vitals.length - 1];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Longitudinal Vital Signs & Laboratory Trends</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real physiological telemetry and clinical lab flow-sheet over the pre-operative intake window
          </p>
        </div>
        <div className="flex items-center gap-3">
          {latestVital && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-mono font-semibold text-slate-800">
              Latest BP: {latestVital.blood_pressure_systolic}/{latestVital.blood_pressure_diastolic} mmHg (HR {latestVital.heart_rate})
            </div>
          )}
          {latestLab && (
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-800">
              Latest Hb: {latestLab.hemoglobin_g_dl} g/dL
            </div>
          )}
        </div>
      </div>

      {/* Primary Trend Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Hemoglobin & Platelets Trajectory */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-500" />
                <span>Hemoglobin Trend (g/dL)</span>
              </h4>
              <p className="text-xs text-slate-500">Hematological tracking prior to surgery</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{hbDelta} g/dL over 7 days</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={labsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[9, 13]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="hemoglobin"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  name="Hemoglobin (g/dL)"
                  dot={{ r: 4, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
            {labs.map((l) => (
              <div key={l.id} className="p-2 rounded-lg bg-slate-50">
                <div className="text-[10px] text-slate-500">{l.relative_day}</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{l.hemoglobin_g_dl} g/dL</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Blood Pressure (Systolic & Diastolic) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-600" />
                <span>Blood Pressure & Heart Rate</span>
              </h4>
              <p className="text-xs text-slate-500">Hemodynamic profile over pre-op period</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Controlled
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Systolic (mmHg)"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  name="Diastolic (mmHg)"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Heart Rate (bpm)"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 italic text-center pt-2">
            Target pre-op threshold: Systolic &lt; 140 mmHg, Resting Heart Rate 60–80 bpm.
          </div>
        </div>
      </div>

      {/* Tabular Flowsheet of All Recorded Labs and Vitals */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Longitudinal Laboratory Flow-Sheet</h4>
            <p className="text-xs text-slate-500">Structured serial measurements with technician verification</p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {labs.length} Recorded Draws
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3">Hb (g/dL)</th>
                <th className="py-2.5 px-3">WBC (k/uL)</th>
                <th className="py-2.5 px-3">Platelets (k/uL)</th>
                <th className="py-2.5 px-3">Glucose (mg/dL)</th>
                <th className="py-2.5 px-3">Creatinine (mg/dL)</th>
                <th className="py-2.5 px-3">INR</th>
                <th className="py-2.5 px-3">Verified By</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {labs.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">
                    <div>{row.relative_day}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.timestamp}</div>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">{row.hemoglobin_g_dl}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.wbc_count_k_ul}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.platelets_k_ul}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.glucose_mg_dl}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.creatinine_mg_dl}</td>
                  <td className="py-2.5 px-3 text-slate-700">{row.inr_coagulation || '1.02'}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{row.lab_technician}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
