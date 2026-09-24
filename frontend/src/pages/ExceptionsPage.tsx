import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, CheckCircle2, Search, ArrowRight, Clock } from 'lucide-react';
import { api } from '../services/api';
import { ExceptionRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';

export const ExceptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadExceptions();
  }, [statusFilter, severityFilter]);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const data = await api.exceptions.list({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
      });
      setExceptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await api.exceptions.resolve(id, 'Clinician conducted secondary verification and satisfied checklist rule.');
      await loadExceptions();
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Safety Exceptions</h2>
          <p className="text-xs text-slate-500 font-medium">
            Pre-operative gating discrepancies: missing evidence, expirations, or role sign-off deviations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Strict Gating Active</span>
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="OVERRIDDEN">Overridden</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Exceptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Exception ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Checklist Step</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">Reason & Clinical Impact</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No active pre-operative exceptions.
                  </td>
                </tr>
              ) : (
                exceptions.map((exc) => {
                  const isOpen = exc.status === 'OPEN';
                  return (
                    <tr
                      key={exc.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOpen ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px]">
                        {exc.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {exc.patient_name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {exc.checklist_step_name}
                      </td>
                      <td className="py-3.5 px-3">
                        <RiskBadge level={exc.severity} size="sm" />
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {exc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-[280px] leading-relaxed">
                        {exc.reason}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-blue-700">
                        {exc.assigned_role}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={exc.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/patients/${exc.patient_id}`)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <span>Open Case</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {isOpen && (
                            <button
                              disabled={resolvingId === exc.id}
                              onClick={() => handleResolve(exc.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                            >
                              {resolvingId === exc.id ? 'Resolving...' : 'Resolve'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
