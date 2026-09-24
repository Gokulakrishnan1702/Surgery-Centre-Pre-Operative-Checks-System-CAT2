import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { ChecklistItem, ChecklistPhase, RiskLevel, ChecklistStatus, UserRole } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { useAuth } from '../context/AuthContext';

export const ChecklistsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [stats, setStats] = useState({
    total: 0,
    verifiedCount: 0,
    pendingCount: 0,
    exceptionCount: 0,
    criticalCount: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadChecklistRoster();
  }, [phaseFilter, riskFilter, statusFilter, roleFilter, search]);

  const loadChecklistRoster = async () => {
    setLoading(true);
    try {
      const res = await api.checklist.getRoster({
        phase: phaseFilter !== 'ALL' ? phaseFilter : undefined,
        risk: riskFilter !== 'ALL' ? riskFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        search: search.trim() || undefined,
      });
      setItems(res.items || []);
      setStats(res.stats || {
        total: 0,
        verifiedCount: 0,
        pendingCount: 0,
        exceptionCount: 0,
        criticalCount: 0,
        completionRate: 0,
      });
    } catch (err) {
      console.error('Failed to load checklist roster', err);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: ChecklistPhase) => {
    switch (phase) {
      case 'SIGN_IN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TIME_OUT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SIGN_OUT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Perioperative Safety Standards
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pre-Operative Checklists Roster</h1>
          <p className="text-xs text-slate-500 font-medium">
            Cross-case tracking of WHO surgical safety checklist items, required clinical evidence & role sign-offs.
          </p>
        </div>

        <button
          onClick={loadChecklistRoster}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Checklists</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Active Steps</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across active patient cohort</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Verified & Cleared</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.verifiedCount}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {stats.completionRate}% completion rate
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pendingCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Awaiting specialist sign-off</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Clinical Exceptions</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.exceptionCount}</div>
          <p className="text-[11px] text-rose-700 mt-0.5">Safety clearance blocked</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">High & Critical Risk</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{stats.criticalCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Mandatory dual attestation</p>
        </div>
      </div>

      {/* Phase Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Surgical Phases', count: stats.total },
          { id: 'SIGN_IN', label: 'Phase 1: Sign-In (Pre-Induction)', count: items.filter(i => i.phase === 'SIGN_IN').length },
          { id: 'TIME_OUT', label: 'Phase 2: Time-Out (Pre-Incision)', count: items.filter(i => i.phase === 'TIME_OUT').length },
          { id: 'SIGN_OUT', label: 'Phase 3: Sign-Out (Post-Op Debrief)', count: items.filter(i => i.phase === 'SIGN_OUT').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPhaseFilter(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              phaseFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search checklist step, patient, MRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending Review</option>
            <option value="EXCEPTION">Exception</option>
            <option value="OVERRIDE">Authorized Override</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Specialty Roles</option>
            <option value="SURGEON">Surgeon</option>
            <option value="NURSE">Nurse</option>
            <option value="CARDIOLOGIST">Cardiologist</option>
            <option value="ANESTHETIST">Anesthetist</option>
            <option value="RADIOLOGIST">Radiologist</option>
            <option value="PATHOLOGIST">Pathologist</option>
            <option value="ADMIN">CMO / Admin</option>
          </select>
        </div>
      </div>

      {/* Main Checklists Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading pre-op checklist matrix...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Checklist Items Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No pre-operative checklist items match your current filter and search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Safety Checklist Step</th>
                  <th className="py-3.5 px-4">Patient & MRN</th>
                  <th className="py-3.5 px-4">Procedure Line</th>
                  <th className="py-3.5 px-3">Risk Tier</th>
                  <th className="py-3.5 px-3">Required Specialty</th>
                  <th className="py-3.5 px-3">Evidence Attached</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Step name & phase */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {item.name}
                        {item.requires_human_confirmation && (
                          <span
                            title="Dual-attestation mandatory: requires explicit human specialist sign-off modal"
                            className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"
                          ></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getPhaseColor(item.phase)}`}>
                          {item.phase_label || item.phase}
                        </span>
                        {item.requires_human_confirmation && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1 rounded font-medium">
                            Dual-Attestation
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient & MRN */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.patient_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.patient_code}</div>
                    </td>

                    {/* Procedure */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium max-w-xs truncate" title={item.surgery_type}>
                        {item.surgery_type}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.scheduled_date || 'Scheduled'}</span>
                      </div>
                    </td>

                    {/* Risk Tier */}
                    <td className="py-3.5 px-3">
                      <RiskBadge level={item.risk_level} />
                    </td>

                    {/* Required Specialty */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        <span>{item.required_role}</span>
                      </span>
                    </td>

                    {/* Evidence Attachment */}
                    <td className="py-3.5 px-3">
                      {item.evidence_count && item.evidence_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <FileCheck className="w-3 h-3 text-emerald-600" />
                          <span>{item.evidence_count} attached</span>
                        </span>
                      ) : item.requires_evidence ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Required</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">Optional</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Action button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/patients/${item.patient_id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        title="Open Patient Pre-Op Dossier"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChecklistsPage;
