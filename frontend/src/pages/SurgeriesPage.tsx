import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Building,
  User,
  Plus,
  X,
  Stethoscope
} from 'lucide-react';
import { api } from '../services/api';
import { Surgery, SurgeryStatus, RiskLevel, Patient } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';

export const SurgeriesPage: React.FC = () => {
  const navigate = useNavigate();

  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Schedule Surgery Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [procedure, setProcedure] = useState('Coronary Artery Bypass Graft (CABG x 3)');
  const [department, setDepartment] = useState('Cardiothoracic Surgery');
  const [operatingRoom, setOperatingRoom] = useState('OR-02');
  const [scheduledDatetime, setScheduledDatetime] = useState('2025-05-02 10:00 AM');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('HIGH');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSurgeries();
  }, [statusFilter, riskFilter, search]);

  const loadSurgeries = async () => {
    setLoading(true);
    try {
      const data = await api.surgeries.list({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        risk: riskFilter !== 'ALL' ? riskFilter : undefined,
        search: search.trim() || undefined
      });
      setSurgeries(data.surgeries || []);
    } catch (err) {
      console.error('Failed to load surgeries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleModal = async () => {
    try {
      const ptsRes = await api.patients.list({ limit: 100 });
      setPatientsList(ptsRes.patients || []);
      if (ptsRes.patients && ptsRes.patients.length > 0) {
        setSelectedPatientId(ptsRes.patients[0].id);
      }
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch patient roster for scheduling', err);
      setModalOpen(true);
    }
  };

  const handleCreateSurgery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !procedure.trim()) return;

    setSubmitting(true);
    try {
      await api.surgeries.create({
        patient_id: selectedPatientId,
        procedure,
        department,
        operating_room: operatingRoom,
        scheduled_datetime: scheduledDatetime,
        risk_level: riskLevel,
        notes: notes.trim() || undefined
      });
      setModalOpen(false);
      setNotes('');
      await loadSurgeries();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule surgical procedure');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const total = surgeries.length;
  const readyCount = surgeries.filter(s => s.status === 'READY' || s.status === 'APPROVED').length;
  const exceptionCount = surgeries.filter(s => s.status === 'EXCEPTION').length;
  const preparingCount = surgeries.filter(s => s.status === 'PREPARING' || s.status === 'PLANNED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Operating Theatre Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Surgical Procedures</h1>
          <p className="text-xs text-slate-500">
            Monitor perioperative readiness, operating room assignments, and evidence-gated surgical statuses.
          </p>
        </div>

        <button
          onClick={handleOpenScheduleModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Surgery Case</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Cases</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled across 6 surgical theatres</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Cleared for Incision</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{readyCount}</div>
          <p className="text-[11px] text-emerald-600 mt-1">100% evidence verified & signed off</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Exceptions</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{exceptionCount}</div>
          <p className="text-[11px] text-rose-600 mt-1">Transfers blocked pending resolution</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">In Pre-Op Holding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{preparingCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Checklist items under active review</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search procedure, patient, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready for Theatre</option>
              <option value="EXCEPTION">Exception Flagged</option>
              <option value="PREPARING">Preparing</option>
              <option value="PLANNED">Planned</option>
            </select>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Surgeries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            Loading scheduled surgical cases...
          </div>
        ) : surgeries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No surgical cases match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Case Code</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Procedure</th>
                  <th className="py-3.5 px-4">Theatre</th>
                  <th className="py-3.5 px-4">Scheduled</th>
                  <th className="py-3.5 px-4">Risk Tier</th>
                  <th className="py-3.5 px-4">Checklist Progress</th>
                  <th className="py-3.5 px-4">Readiness Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surgeries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.surgery_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{s.patient_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.patient_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {s.procedure}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        <Building className="w-3 h-3 text-slate-400" />
                        {s.operating_room}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {s.scheduled_datetime}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={s.risk_level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              s.checklist_completion_pct === 100
                                ? 'bg-emerald-500'
                                : s.checklist_completion_pct >= 60
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${s.checklist_completion_pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">{s.checklist_completion_pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/patients/${s.patient_id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Checklist</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Surgery Case Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Schedule Surgical Procedure</h3>
                  <p className="text-[11px] text-slate-400">Perioperative Suite Scheduling & Evidence Gates</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSurgery} className="p-6 space-y-4 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                >
                  {patientsList.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name} ({pt.patient_id}) — {pt.surgery_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Procedure Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Procedure Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="e.g., Coronary Artery Bypass Graft (CABG)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                />
              </div>

              {/* Department & Operating Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="Cardiothoracic Surgery">Cardiothoracic Surgery</option>
                    <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                    <option value="General & Laparoscopic">General & Laparoscopic</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Vascular Surgery">Vascular Surgery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Room</label>
                  <select
                    value={operatingRoom}
                    onChange={(e) => setOperatingRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="OR-01 (Hybrid Theatre)">OR-01 (Hybrid Theatre)</option>
                    <option value="OR-02 (Cardio Suite)">OR-02 (Cardio Suite)</option>
                    <option value="OR-03 (Orthopedic Suite)">OR-03 (Orthopedic Suite)</option>
                    <option value="OR-04 (General OR)">OR-04 (General OR)</option>
                    <option value="OR-05 (Neuro Suite)">OR-05 (Neuro Suite)</option>
                    <option value="OR-06 (Day Care OR)">OR-06 (Day Care OR)</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Date/Time & Risk Tier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date & Time</label>
                  <input
                    type="text"
                    value={scheduledDatetime}
                    onChange={(e) => setScheduledDatetime(e.target.value)}
                    placeholder="e.g. 2025-05-02 10:00 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Risk Tier</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                    <option value="CRITICAL">Critical Risk</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical / Setup Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specialist team requirements, instrumentation, perfusionist standby..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium h-20 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Scheduling Case...' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurgeriesPage;
