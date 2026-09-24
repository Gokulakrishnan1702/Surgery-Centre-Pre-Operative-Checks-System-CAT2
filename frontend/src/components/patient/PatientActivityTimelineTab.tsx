import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserCheck,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Printer,
  Sparkles,
  ClipboardCheck,
  UploadCloud,
  FileCode,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  Patient,
  PatientActivityEvent,
  PatientHistoryResponse,
  PatientHistorySummary,
  UserRole
} from '../../types';
import { api } from '../../services/api';

interface PatientActivityTimelineTabProps {
  patient: Patient;
  onOpenEvidence?: (evidenceId?: string) => void;
  onOpenChecklist?: () => void;
  onOpenExceptions?: () => void;
  onOpenAudit?: () => void;
}

export const PatientActivityTimelineTab: React.FC<PatientActivityTimelineTabProps> = ({
  patient,
  onOpenEvidence,
  onOpenChecklist,
  onOpenExceptions,
  onOpenAudit
}) => {
  const [historyData, setHistoryData] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [rangeFilter, setRangeFilter] = useState<string>('7d');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, [patient.id, rangeFilter, typeFilter, roleFilter, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.patients.getHistory(patient.id, {
        range: rangeFilter !== 'ALL' ? rangeFilter : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined
      });
      setHistoryData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient history timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory();
  };

  const handleExportCsv = () => {
    const url = api.patients.exportHistoryUrl(patient.id, 'csv');
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getEventIcon = (type: string, iconType?: string) => {
    switch (type) {
      case 'RISK_ASSESSMENT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'EVIDENCE':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'CHECKLIST':
        return <ClipboardCheck className="w-4 h-4 text-emerald-600" />;
      case 'CONFIRMATION':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'EXCEPTION':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'SURGERY':
        return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'PATIENT':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'COMPLETED':
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ESCALATED':
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const summary = historyData?.summary;

  return (
    <div className="space-y-6">
      {/* Top History Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Events</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{summary.totalEvents}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recorded</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
            <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Last 7 Days</div>
            <div className="text-xl font-extrabold text-blue-700 mt-1">{summary.last7DaysCount}</div>
            <div className="text-[10px] text-blue-500 mt-0.5">Active window</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Exceptions</div>
            <div className="text-xl font-extrabold text-rose-700 mt-1">{summary.openExceptionsCount}</div>
            <div className="text-[10px] text-rose-500 mt-0.5">Open flags</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Evidence Added</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{summary.evidenceAddedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Uploaded</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Evidence Verified</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">{summary.evidenceVerifiedCount}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Certified</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
            <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Risk Changes</div>
            <div className="text-xl font-extrabold text-purple-700 mt-1">{summary.riskChangesCount}</div>
            <div className="text-[10px] text-purple-500 mt-0.5">XAI triggers</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Checklist Updates</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{summary.checklistUpdatesCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Step actions</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
            <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Approvals</div>
            <div className="text-xl font-extrabold text-indigo-700 mt-1">{summary.approvalsCount}</div>
            <div className="text-[10px] text-indigo-500 mt-0.5">Attestations</div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient history... (e.g. ECG, blood test, exception, risk)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title="Download CSV activity log"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title="Print timeline report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Timeline</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Date Range */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Range:</span>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'ALL', label: 'All History' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setRangeFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    rangeFilter === btn.id
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Event Types</option>
              <option value="RISK_ASSESSMENT">Risk Assessment</option>
              <option value="EVIDENCE">Evidence Upload/Verify</option>
              <option value="CHECKLIST">Checklist Verification</option>
              <option value="CONFIRMATION">Human Confirmation</option>
              <option value="EXCEPTION">Exceptions</option>
              <option value="SURGERY">Surgery Scheduling</option>
              <option value="PATIENT">Patient Registration</option>
            </select>
          </div>

          {/* Performer Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Clinical Roles</option>
              <option value="SURGEON">Surgeon</option>
              <option value="NURSE">Nurse</option>
              <option value="ANESTHETIST">Anesthetist</option>
              <option value="CARDIOLOGIST">Cardiologist</option>
              <option value="PATHOLOGIST">Pathologist</option>
              <option value="RADIOLOGIST">Radiologist</option>
              <option value="ADMIN">Admin / CMO</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">7-Day Patient Activity Timeline</h4>
            <p className="text-xs text-slate-500">
              Chronological ledger of checklist certifications, evidence attachments, and specialist sign-offs
            </p>
          </div>
          {onOpenAudit && (
            <button
              onClick={onOpenAudit}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Full Audit Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse text-xs">
            Loading patient history timeline...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs text-center">
            {error}
          </div>
        ) : !historyData || historyData.timeline.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity events found matching the specified filters.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(historyData.grouped_timeline).map((dayGroup) => (
              <div key={dayGroup} className="space-y-4">
                {/* Day Header Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                    {dayGroup}
                  </span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Timeline Items under this Day */}
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-3">
                  {historyData.grouped_timeline[dayGroup].map((event) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline Bullet Node */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      </div>

                      {/* Event Card */}
                      <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all space-y-2">
                        {/* Top Line: Time + Type + Status */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {event.formatted_time}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                              {event.exact_datetime}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-200">
                              {event.event_type.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                        </div>

                        {/* Title & Short Description */}
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-white border border-slate-200 shrink-0">
                              {getEventIcon(event.event_type, event.icon_type)}
                            </div>
                            <h5 className="text-xs font-bold text-slate-900">{event.title}</h5>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed pl-7">
                            {event.short_description}
                          </p>
                        </div>

                        {/* Comment or Clinical Rationale */}
                        {event.comment && (
                          <div className="ml-7 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px] text-blue-900 leading-relaxed font-mono">
                            {event.comment}
                          </div>
                        )}

                        {/* Footer: Performed By + Role + Related Records */}
                        <div className="ml-7 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>
                              By: <strong className="text-slate-800">{event.performed_by}</strong>
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[10px] font-mono font-semibold">
                              {event.user_role}
                            </span>
                          </div>

                          {event.related_record && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Record:</span>
                              <span
                                className="font-mono text-blue-600 font-semibold truncate max-w-[200px]"
                                title={event.related_record.name || event.related_record.id}
                              >
                                {event.related_record.name || event.related_record.id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
