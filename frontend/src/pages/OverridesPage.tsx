import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { OverrideRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/common/RiskBadge';

export const OverridesPage: React.FC = () => {
  const { user, canOverride } = useAuth();
  const [overrides, setOverrides] = useState<OverrideRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    setLoading(true);
    try {
      const data = await api.overrides.list();
      setOverrides(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecide = async (id: string, decision: 'approve' | 'reject') => {
    setActioningId(id);
    setMessage(null);
    try {
      if (decision === 'approve') {
        const res = await api.overrides.approve(id, 'Approved per emergency clinical protocol by attending surgeon.');
        setMessage(res.message);
      } else {
        const res = await api.overrides.reject(id, 'Insufficient justification for bypass; required evidence must be obtained.');
        setMessage(res.message);
      }
      await loadOverrides();
    } catch (err: any) {
      setMessage(err.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Controlled Safety Overrides</h2>
          <p className="text-xs text-slate-500 font-medium">
            Authorized procedural overrides bypassing evidence requirements under strict governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Surgeon / CMO Authorization Required</span>
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold animate-in fade-in flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-blue-600 font-bold">✕</button>
        </div>
      )}

      {/* Overrides Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Override ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Checklist Step</th>
                <th className="py-3 px-3">Impact</th>
                <th className="py-3 px-4">Clinical Justification</th>
                <th className="py-3 px-4">Operational Reason</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : overrides.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No override requests recorded.
                  </td>
                </tr>
              ) : (
                overrides.map((ovr) => {
                  const isPending = ovr.status === 'PENDING';
                  const isApproved = ovr.status === 'APPROVED';

                  return (
                    <tr
                      key={ovr.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px]">
                        {ovr.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {ovr.patient_name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {ovr.checklist_step_name}
                      </td>
                      <td className="py-3.5 px-3">
                        <RiskBadge level={ovr.impact} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 text-[11px] max-w-[200px] leading-relaxed">
                        {ovr.reason}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-[180px] leading-relaxed">
                        {ovr.business_reason}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div className="font-semibold text-slate-800">{ovr.requested_by_name}</div>
                        <div className="text-[10px] text-slate-400">{ovr.requested_by_role}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {ovr.approved_by_name ? (
                          <div>
                            <div className="font-semibold text-slate-800">{ovr.approved_by_name}</div>
                            <div className="text-[10px] text-slate-400">{ovr.approved_by_role}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending review</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={actioningId === ovr.id || !canOverride()}
                              onClick={() => handleDecide(ovr.id, 'approve')}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-40 transition-colors shadow-2xs"
                              title={!canOverride() ? 'Requires Lead Surgeon or Admin' : 'Approve override'}
                            >
                              Approve
                            </button>
                            <button
                              disabled={actioningId === ovr.id || !canOverride()}
                              onClick={() => handleDecide(ovr.id, 'reject')}
                              className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg disabled:opacity-40 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
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
