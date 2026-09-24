import React, { useState, useEffect } from 'react';
import { History, Shield, Lock, Search, Filter, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';
import { api } from '../services/api';
import { AuditRecord } from '../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string>('Audit records are append-only and cannot be casually edited or deleted.');

  useEffect(() => {
    loadAuditLogs();
  }, [eventTypeFilter, roleFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.audit.list({
        event_type: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        search: search.trim() || undefined,
      });
      setLogs(data.logs);
      if (data.tamper_proof_notice) setNotice(data.tamper_proof_notice);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditLogs();
  };

  const handleExportCsv = async () => {
    try {
      const url = api.audit.exportUrl({
        event_type: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        search: search.trim() || undefined,
      });
      const token = localStorage.getItem('surgical_safety_token');
      const demoRole = localStorage.getItem('surgical_safety_demo_role');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (demoRole) headers['x-demo-role'] = demoRole;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to export audit ledger');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `forensic_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to export audit log CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Compliance & Audit Timeline</h2>
          <p className="text-xs text-slate-500 font-medium">
            Forensic trace of every checklist verification, evidence upload, clinician sign-off, and override
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Forensic CSV</span>
          </button>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Append-Only Ledger Active</span>
          </span>
        </div>
      </div>

      {/* Mandatory Tamper-Proof Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-blue-300 uppercase tracking-wide">
            Statutory Clinical Governance Guarantee
          </span>
          <p className="text-slate-300 leading-relaxed">
            {notice} Every entry is permanently tied to an authenticated clinician persona, server timestamp, and verified digital payload.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by patient, clinician name, event details..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="CHECKLIST_CREATED">CHECKLIST_CREATED</option>
            <option value="CHECKLIST_UPDATED">CHECKLIST_UPDATED</option>
            <option value="EVIDENCE_UPLOADED">EVIDENCE_UPLOADED</option>
            <option value="EVIDENCE_VERIFIED">EVIDENCE_VERIFIED</option>
            <option value="HUMAN_CONFIRMED">HUMAN_CONFIRMED</option>
            <option value="EXCEPTION_CREATED">EXCEPTION_CREATED</option>
            <option value="EXCEPTION_RESOLVED">EXCEPTION_RESOLVED</option>
            <option value="OVERRIDE_REQUESTED">OVERRIDE_REQUESTED</option>
            <option value="OVERRIDE_APPROVED">OVERRIDE_APPROVED</option>
            <option value="FINAL_APPROVAL">FINAL_APPROVAL</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SURGEON">SURGEON</option>
            <option value="NURSE">NURSE</option>
            <option value="CARDIOLOGIST">CARDIOLOGIST</option>
            <option value="ANESTHETIST">ANESTHETIST</option>
            <option value="RADIOLOGIST">RADIOLOGIST</option>
            <option value="PATHOLOGIST">PATHOLOGIST</option>
            <option value="ADMIN">ADMIN</option>
            <option value="AUDITOR">AUDITOR</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Checklist Step</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Evidence Source</th>
                <th className="py-3 px-3">Decision</th>
                <th className="py-3 px-4">Override Reason</th>
                <th className="py-3 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isFinal = log.event_type === 'FINAL_APPROVAL';
                  const isOverride = log.event_type.includes('OVERRIDE');
                  const isException = log.event_type.includes('EXCEPTION');

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFinal
                          ? 'bg-emerald-50/40'
                          : isOverride
                          ? 'bg-purple-50/30'
                          : isException
                          ? 'bg-rose-50/30'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wide ${
                            isFinal
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverride
                              ? 'bg-purple-100 text-purple-800'
                              : isException
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {log.event_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {log.patient_name || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {log.checklist_step || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.user_role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {log.user_name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {log.evidence_source || '—'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {log.decision || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] max-w-[150px] truncate" title={log.override_reason}>
                        {log.override_reason || '—'}
                      </td>
                      <td className="py-3 px-5 text-slate-600 text-[11px] max-w-[260px] leading-relaxed">
                        {log.details}
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
