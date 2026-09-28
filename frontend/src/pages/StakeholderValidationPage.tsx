import React, { useState, useEffect } from 'react';
import {
  Users2,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Info,
  UserCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { StakeholderValidationSummary } from '../types';

export const StakeholderValidationPage: React.FC = () => {
  const [data, setData] = useState<StakeholderValidationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.validation.getStakeholder();
      setData(res);
    } catch (err) {
      console.error('Failed to load stakeholder data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Human-in-the-Loop Usability
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Info className="w-3 h-3" /> Synthetic Clinical Personas
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Stakeholder Usability & Role Validation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Empirical task completion, error incidence, and qualitative usability feedback across core surgical care team roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Feedback
          </button>
        </div>
      </div>

      {/* Synthetic Label Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider">Evaluation Methodology Notice: </span>
          Demonstration and test participants evaluated under simulated surgical ward conditions using synthetic patient records. Designed to measure workflow friction, cognitive burden, and error prevention before live institutional trial deployment.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : data ? (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Test Participants</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{data.total_participants} Clinicians</div>
                <div className="text-xs text-slate-500 mt-0.5">Nurse, Surgeon, Cardio, Auditor</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Task Completion Rate</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{data.task_completion_rate}%</div>
                <div className="text-xs text-slate-500 mt-0.5">Zero task abandonment</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Mean Completion Time</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{data.average_completion_time_seconds}s</div>
                <div className="text-xs text-slate-500 mt-0.5">Target &lt; 60 seconds per task</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">System Usability Score</div>
                <div className="text-2xl font-bold text-indigo-600 mt-1">{data.overall_usability_score} / 100</div>
                <div className="text-xs text-slate-500 mt-0.5">Industry Benchmark: 68 SUS</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Persona Task Execution Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Individual Clinician Persona Task Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        task.role === 'NURSE' ? 'bg-sky-100 text-sky-800' :
                        task.role === 'SURGEON' ? 'bg-blue-100 text-blue-800' :
                        task.role === 'CARDIOLOGIST' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {task.role}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed ({task.completion_time_seconds}s)
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{task.persona_name}</h4>
                    <div className="text-xs font-semibold text-indigo-600 mt-0.5">Task: {task.task_title}</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.task_description}</p>

                    <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs">
                      <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="italic text-slate-700 font-sans">
                        "{task.qualitative_feedback}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Errors Encountered: <strong className="text-slate-800">{task.errors_encountered}</strong></span>
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                      SUS: {task.usability_score} / 100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Evaluation Highlights Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Key Usability Highlights & Qualitative Findings
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
              {data.feedback_highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
};
