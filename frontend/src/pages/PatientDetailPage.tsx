import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  Eye,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileText,
  UserCheck,
  Activity,
  Calendar,
  Lock,
  Info,
  Check,
  Sparkles,
  ExternalLink,
  Printer,
  QrCode,
  Layers,
  Scale,
  Stethoscope,
  TrendingUp,
  Droplets,
  Heart,
  ClipboardCheck,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import {
  Patient,
  Surgery,
  ChecklistItem,
  EvidenceRecord,
  ExceptionRecord,
  AuditRecord,
  UserRole,
  RiskAssessmentResult,
  ChecklistPhase,
  ClinicalHistoryEntry,
  VitalRecord,
  LabResultRecord,
  RiskHistoryRecord,
  ChecklistHistoryRecord,
  PatientHistorySummary,
  PreOpReadinessGate,
  EvidenceValidationDetails
} from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { OverrideModal } from '../components/modals/OverrideModal';
import { EvidenceUploadModal } from '../components/modals/EvidenceUploadModal';
import { EvidenceViewerModal } from '../components/modals/EvidenceViewerModal';
import { ClearancePassportModal } from '../components/modals/ClearancePassportModal';
import { RuleExplanationModal } from '../components/modals/RuleExplanationModal';
import { PrivacyGovernanceModal } from '../components/modals/PrivacyGovernanceModal';
import { EvidenceValidationModal } from '../components/modals/EvidenceValidationModal';
import { PatientClinicalHistoryTab } from '../components/patient/PatientClinicalHistoryTab';
import { PatientActivityTimelineTab } from '../components/patient/PatientActivityTimelineTab';
import { PatientTrendsTab } from '../components/patient/PatientTrendsTab';
import { PatientRiskChecklistHistoryTab } from '../components/patient/PatientRiskChecklistHistoryTab';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canVerify, canOverride, canFinalApprove, switchRole } = useAuth();

  const [patient, setPatient] = useState<
    (Patient & {
      surgery?: Surgery;
      checklist: ChecklistItem[];
      evidence: EvidenceRecord[];
      exceptions: ExceptionRecord[];
      auditLogs: AuditRecord[];
      clinicalHistory?: ClinicalHistoryEntry[];
      vitals?: VitalRecord[];
      labs?: LabResultRecord[];
      riskHistory?: RiskHistoryRecord[];
      checklistHistory?: ChecklistHistoryRecord[];
      historySummary?: PatientHistorySummary;
    }) | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'medical_history' | 'surgery' | 'checklist' | 'evidence' | 'risk' | 'history' | 'trends' | 'audit' | 'exceptions'
  >('checklist');
  const [selectedPhase, setSelectedPhase] = useState<'ALL' | ChecklistPhase>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Risk and Passport State
  const [riskResult, setRiskResult] = useState<RiskAssessmentResult | null>(null);
  const [passportModalOpen, setPassportModalOpen] = useState(false);

  // Extended Safety Engine Modals State
  const [ruleModalItem, setRuleModalItem] = useState<ChecklistItem | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [validationModalItem, setValidationModalItem] = useState<ChecklistItem | null>(null);
  const [validationDetails, setValidationDetails] = useState<EvidenceValidationDetails | null>(null);
  const [readinessData, setReadinessData] = useState<PreOpReadinessGate | null>(null);

  // Modals state
  const [confirmModalItem, setConfirmModalItem] = useState<ChecklistItem | null>(null);
  const [overrideModalItem, setOverrideModalItem] = useState<ChecklistItem | null>(null);
  const [uploadModalItem, setUploadModalItem] = useState<ChecklistItem | null>(null);
  const [viewerEvidence, setViewerEvidence] = useState<EvidenceRecord | null>(null);

  // Final approval review modal
  const [finalApprovalModalOpen, setFinalApprovalModalOpen] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [finalSubmitting, setFinalSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadPatient(id);
  }, [id]);

  const loadPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.patients.getById(patientId);
      setPatient(data);
      try {
        const rData = await api.risk.getForPatient(patientId);
        setRiskResult(rData);
      } catch (rErr) {
        // Risk assessment load error non-blocking
      }
      try {
        const readData = await api.patients.getReadiness(patientId);
        setReadinessData(readData);
      } catch (readErr) {
        // Readiness load non-blocking
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectValidation = async (item: ChecklistItem) => {
    try {
      const val = await api.checklist.validateEvidence(item.id, item.evidence_id);
      setValidationDetails(val);
      setValidationModalItem(item);
    } catch (err) {
      setValidationDetails(null);
      setValidationModalItem(item);
    }
  };

  const handleOpenRule = async (item: ChecklistItem) => {
    try {
      const res = await api.checklist.getRule(item.id);
      setRuleModalItem({
        ...item,
        rule_details: res.rule
      });
    } catch {
      setRuleModalItem(item);
    }
  };

  const handleVerifyDirect = async (item: ChecklistItem) => {
    if (!patient || !user) return;
    setError(null);
    setSuccessMessage(null);

    // Rule enforcement check
    if (user.role !== 'ADMIN' && user.role !== item.required_role) {
      setError(`Role Mismatch: ${item.name} requires verification by ${item.required_role}. You are logged in as ${user.role}. (Use topbar role switcher to switch role)`);
      return;
    }

    if (item.requires_evidence && !item.evidence_id) {
      setError(`Evidence Required: You cannot verify ${item.name} without attaching verified clinical evidence first.`);
      setUploadModalItem(item);
      return;
    }

    // If requires human confirmation, open confirmation modal
    if (item.requires_human_confirmation && !item.human_confirmed) {
      setConfirmModalItem(item);
      return;
    }

    try {
      const res = await api.checklist.verify(item.id);
      setSuccessMessage(res.message);
      await loadPatient(patient.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmSubmit = async (comment: string, reviewed: boolean) => {
    if (!confirmModalItem || !patient) return;
    try {
      await api.checklist.confirm(confirmModalItem.id, comment, reviewed);
      setSuccessMessage(`${confirmModalItem.name} human confirmation verified and permanently audit logged.`);
      await loadPatient(patient.id);
    } catch (err: any) {
      throw err;
    }
  };

  const handleUploadSubmit = async (data: any) => {
    if (!patient) return;
    try {
      const newEv = await api.evidence.upload(data);
      // Automatically attempt verification step if user role matches
      if (uploadModalItem) {
        await api.checklist.verify(uploadModalItem.id, {
          evidenceId: newEv.id,
          filename: newEv.filename,
          source: newEv.source,
          notes: data.notes
        });
      }
      setSuccessMessage(`Synthetic clinical evidence '${data.filename}' attached successfully.`);
      await loadPatient(patient.id);
    } catch (err: any) {
      throw err;
    }
  };

  const handleOverrideSubmit = async (data: any) => {
    if (!overrideModalItem || !patient) return;
    try {
      await api.overrides.request({
        patient_id: patient.id,
        checklist_item_id: overrideModalItem.id,
        reason: data.reason,
        business_reason: data.business_reason,
        impact: data.impact,
      });
      setSuccessMessage(`Override request submitted for ${overrideModalItem.name}. Awaiting Lead Surgeon / CMO approval.`);
      await loadPatient(patient.id);
    } catch (err: any) {
      throw err;
    }
  };

  const handleFinalSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    if (user?.role !== 'SURGEON' && user?.role !== 'ADMIN') {
      setError(`Unauthorized: Final surgical pre-operative sign-off strictly requires Lead Surgeon or Chief Medical Officer authorization. Logged in as ${user?.role}. (Use topbar to switch to SURGEON to test authorization)`);
      setFinalApprovalModalOpen(false);
      return;
    }
    setFinalSubmitting(true);
    try {
      const res = await api.patients.finalClearance(patient.id, finalNotes);
      setFinalApprovalModalOpen(false);
      setSuccessMessage(res.message || 'Final pre-operative clearance authorized by human surgical specialist.');
      await loadPatient(patient.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFinalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-2xl"></div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Unable to load patient</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => navigate('/patients')}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          Back to Patients Roster
        </button>
      </div>
    );
  }

  if (!patient) return null;

  // Calculation of pre-op summary for final approval gate
  const totalSteps = patient.checklist.length || 10;
  const verifiedSteps = patient.checklist.filter(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE').length;
  const criticalItems = patient.checklist.filter(i => i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH');
  const criticalVerified = criticalItems.filter(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE').length;
  const evidenceRequired = patient.checklist.filter(i => i.requires_evidence).length;
  const evidenceAttached = patient.checklist.filter(i => (i.evidence_id || i.evidence_status === 'VALID') && (i.status === 'VERIFIED' || i.status === 'OVERRIDE')).length;
  const openExceptions = patient.exceptions.filter(e => e.status === 'OPEN' || e.status === 'UNDER_REVIEW').length;
  const humanRequiredCount = patient.checklist.filter(i => i.requires_human_confirmation).length;
  const humanConfirmationsCount = patient.checklist.filter(i => i.requires_human_confirmation && i.human_confirmed).length;
  const overridesCount = patient.checklist.filter(i => i.status === 'OVERRIDE').length;
  const isReadyForFinalReview = openExceptions === 0 && criticalVerified === criticalItems.length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Patients</span>
        </button>

        {patient.patient_id === 'P10001' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Core Academic Demo Patient
          </span>
        )}
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-bold">Compliance Rule Alert</div>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
              {patient.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  MRN: {patient.patient_id}
                </span>
                <RiskBadge level={patient.risk_level} />
                <StatusBadge status={patient.status} />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {patient.surgery_type} • Scheduled: <span className="font-semibold text-slate-700">{patient.scheduled_date}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics in Header */}
          <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Demographics</div>
              <div className="text-xs font-bold text-slate-800">{patient.age} yrs • {patient.gender}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Team</div>
              <div className="text-xs font-bold text-slate-800">{patient.assigned_team}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Checklist Completion</div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${patient.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${patient.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-800">{patient.progress || 0}%</span>
              </div>
            </div>

            {/* Clearance Dossier Button */}
            <button
              onClick={() => setPassportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Generate authenticated PDF Surgical Clearance Passport"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Clearance Dossier (PDF)</span>
            </button>
          </div>
        </div>

        {/* Clinical Profile Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 text-[11px]">Clinical Profile:</span>
          {patient.allergies && patient.allergies.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              Allergies: {patient.allergies.join(', ')}
            </span>
          )}
          {patient.current_medications && patient.current_medications.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
              <Activity className="w-3 h-3 text-blue-600" />
              Meds: {patient.current_medications.slice(0, 2).join(', ')}...
            </span>
          )}
          {patient.surgery?.operating_room && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono">
              Theatre: {patient.surgery.operating_room}
            </span>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs pb-1">
          {[
            { id: 'overview', label: 'Overview', icon: UserCheck },
            { id: 'medical_history', label: 'Clinical History', icon: Stethoscope },
            { id: 'surgery', label: 'Current Surgery', icon: Activity },
            { id: 'checklist', label: 'WHO Checklist', count: patient.checklist.length, icon: ClipboardCheck },
            { id: 'evidence', label: 'Evidence', count: patient.evidence.length, icon: FileText },
            { id: 'exceptions', label: 'Active Exceptions', count: patient.exceptions.length, badgeColor: 'bg-rose-100 text-rose-700' },
            { id: 'risk', label: 'Risk & Trajectory', icon: AlertTriangle },
            { id: 'history', label: 'Activity Timeline (7D)', icon: Clock, count: patient.historySummary?.totalEvents },
            { id: 'trends', label: 'Vitals & Lab Trends', icon: TrendingUp },
            { id: 'audit', label: 'Audit Trail', count: patient.auditLogs.length, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PRE-OPERATIVE READINESS GATE PANEL (Section 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
              patient.status === 'READY' ? 'bg-emerald-600' :
              (readinessData?.readiness_status === 'AWAITING_FINAL_HUMAN_CONFIRMATION' || isReadyForFinalReview) ? 'bg-indigo-600' :
              openExceptions > 0 ? 'bg-rose-600' : 'bg-amber-500'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Pre-Operative Readiness Gate</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  patient.status === 'READY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  (readinessData?.readiness_status === 'AWAITING_FINAL_HUMAN_CONFIRMATION' || isReadyForFinalReview) ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                  openExceptions > 0 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {patient.status === 'READY' ? 'Final Clearance Authorized' :
                   (readinessData?.readiness_status === 'AWAITING_FINAL_HUMAN_CONFIRMATION' || isReadyForFinalReview) ? 'Ready for Final Human Review' :
                   openExceptions > 0 ? 'Exceptions Blocking' : 'Verification In Progress'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-point safety verification required before operating room transfer.
              </p>
            </div>
          </div>

          {/* Action button */}
          <div>
            {patient.status === 'READY' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Clearance Granted by Lead Surgeon
              </span>
            ) : (
              <button
                onClick={() => setFinalApprovalModalOpen(true)}
                disabled={!isReadyForFinalReview && readinessData?.readiness_status !== 'AWAITING_FINAL_HUMAN_CONFIRMATION'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                title={user?.role !== 'SURGEON' && user?.role !== 'ADMIN' ? 'Requires Lead Surgeon or CMO role' : 'Authorize surgical clearance'}
              >
                <UserCheck className="w-4 h-4" />
                <span>Authorize Final Surgical Clearance</span>
              </button>
            )}
          </div>
        </div>

        {/* 7 Strict Readiness Gate Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Steps</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {readinessData?.critical_steps_verified ?? criticalVerified} / {readinessData?.critical_steps_total ?? (criticalItems.length || 8)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {(readinessData?.critical_steps_verified ?? criticalVerified) === (readinessData?.critical_steps_total ?? (criticalItems.length || 8)) ? '✓ VERIFIED' : 'PENDING'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valid Evidence</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {readinessData?.valid_evidence_count ?? evidenceAttached} / {readinessData?.valid_evidence_total ?? (evidenceRequired || 10)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {(readinessData?.valid_evidence_count ?? evidenceAttached) >= (readinessData?.valid_evidence_total ?? evidenceRequired) ? '✓ COMPLETE' : 'INCOMPLETE'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Human Sign-Offs</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {readinessData?.human_confirmations_count ?? humanConfirmationsCount} / {readinessData?.human_confirmations_total ?? (humanRequiredCount || 8)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {(readinessData?.human_confirmations_count ?? humanConfirmationsCount) >= (readinessData?.human_confirmations_total ?? 1) ? '✓ ATTESTED' : 'PENDING'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Exceptions</div>
            <div className={`text-base font-extrabold mt-0.5 ${openExceptions > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {readinessData?.open_exceptions_count ?? openExceptions}
            </div>
            <div className="text-[10px] font-semibold mt-0.5">
              {openExceptions === 0 ? <span className="text-emerald-600">✓ ZERO BLOCKERS</span> : <span className="text-rose-600">ACTION REQUIRED</span>}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overrides</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {readinessData?.overrides_count ?? overridesCount}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
              AUDITED
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consent</div>
            <div className="text-base font-extrabold text-emerald-600 mt-0.5">
              {readinessData?.consent_status || 'VERIFIED'}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              ✓ RECORDED
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Privacy</div>
            <div className="text-base font-extrabold text-blue-600 mt-0.5">
              PROTECTED
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
              ✓ RBAC ACTIVE
            </div>
          </div>
        </div>

        {/* Mandatory Clinical Decision Support Disclaimer Notice (Section 5 requirement) */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-start sm:items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-slate-200">
              {patient.status === 'READY' ? (
                <>Final Pre-Operative Surgical Sign-off granted by <strong>Dr. Marcus Vance (Lead Surgeon)</strong> on {patient.updated_at}. Patient cleared for OR.</>
              ) : isReadyForFinalReview || readinessData?.readiness_status === 'AWAITING_FINAL_HUMAN_CONFIRMATION' ? (
                <strong className="text-emerald-400">Checklist requirements satisfied — awaiting final authorized human confirmation.</strong>
              ) : (
                <span>Checklist verification in progress — outstanding items or exceptions prevent surgical clearance.</span>
              )}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 italic shrink-0">
            * Final surgical clearance must always require authorized human confirmation.
          </div>
        </div>
      </div>

      {/* 2. PATIENT DATA GOVERNANCE & PRIVACY PANEL (Section 10) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Patient Data Governance:</span>
          </div>
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Consent recorded
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Data Type: Synthetic / Protected
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Role-Based Access: Enabled
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Audit Logging: Enabled
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sensitive Evidence: Restricted
          </span>
        </div>

        <button
          onClick={() => setPrivacyModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-slate-600" />
          <span>View Privacy Details</span>
        </button>
      </div>

      {/* TAB 1: CORE CHECKLIST TABLE */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* EXPLAINABLE AI RISK CARD */}
          {riskResult && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                    riskResult.risk_level === 'CRITICAL' ? 'bg-rose-600' :
                    riskResult.risk_level === 'HIGH' ? 'bg-orange-500' :
                    riskResult.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Explainable AI Perioperative Risk Assessment</h4>
                      <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {riskResult.model_name} ({riskResult.model_version})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transparent SHAP-style attribution factors contributing to surgical risk index.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                    <span className={`text-xl font-black ${
                      riskResult.risk_level === 'CRITICAL' ? 'text-rose-600' :
                      riskResult.risk_level === 'HIGH' ? 'text-orange-600' :
                      riskResult.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {riskResult.total_score} <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">{riskResult.confidence_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Attribution Factors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {riskResult.factors.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 text-[11px] block">{f.factor}</span>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{f.description}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded shrink-0 ${
                      f.score > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {f.score > 0 ? `+${f.score}` : `${f.score}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Recommendation Alert */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Algorithmic Recommendation: </span>
                  <span>{riskResult.ai_recommendation}</span>
                  <p className="text-[10px] text-blue-700 mt-1 italic">{riskResult.disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          {/* WHO 3-PHASE SURGICAL STEPPER FILTER PILLS */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>WHO Surgical Safety Protocol:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Checklist Steps', count: patient.checklist.length },
                {
                  id: 'SIGN_IN',
                  label: 'Phase 1: Sign-In',
                  count: patient.checklist.filter(i => i.phase === 'SIGN_IN').length
                },
                {
                  id: 'TIME_OUT',
                  label: 'Phase 2: Time-Out',
                  count: patient.checklist.filter(i => i.phase === 'TIME_OUT').length
                },
                {
                  id: 'SIGN_OUT',
                  label: 'Phase 3: Sign-Out',
                  count: patient.checklist.filter(i => i.phase === 'SIGN_OUT').length
                }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedPhase(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                    selectedPhase === pill.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedPhase === pill.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Pre-Operative High-Risk Verification Matrix
                </h3>
                <p className="text-[11px] text-slate-500">
                  Rule 1: Checkbox alone is never sufficient. Rule 2: Evidence mandatory. Rule 3: Human confirmation required for high/critical risks.
                </p>
              </div>

              {/* Demo Helper Switcher Hint */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-xl text-[11px]">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  Current: <strong>{user?.role}</strong> (Use topbar to switch to test other roles)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-8">#</th>
                    <th className="py-3 px-4">Checklist Step</th>
                    <th className="py-3 px-3">Risk</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4">Attached Evidence</th>
                    <th className="py-3 px-3">Evidence Source</th>
                    <th className="py-3 px-3">Responsible Role</th>
                    <th className="py-3 px-4">Rule & Evidence Explanation</th>
                    <th className="py-3 px-3">Human Sign-Off</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.checklist
                    .filter(item => selectedPhase === 'ALL' || item.phase === selectedPhase)
                    .map((item, idx) => {
                    const isVerified = item.status === 'VERIFIED';
                    const isOverride = item.status === 'OVERRIDE';
                    const isException = item.status === 'EXCEPTION';
                    const isPending = item.status === 'PENDING';
                    const isUserAuthorized = user?.role === 'ADMIN' || user?.role === item.required_role;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isException
                            ? 'bg-rose-50/40'
                            : isOverride
                            ? 'bg-purple-50/30'
                            : ''
                        }`}
                      >
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{item.name}</span>
                            {item.requires_human_confirmation && (
                              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded" title="Requires explicit human confirmation">
                                Dual-Sign
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenRule(item)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition shrink-0"
                              title="Why is this required? (Explainable System Safety Rule)"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Rule</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <RiskBadge level={item.risk_level} size="sm" />
                        </td>

                        <td className="py-3.5 px-3">
                          <StatusBadge status={item.status} size="sm" />
                        </td>

                        {/* Attached Evidence */}
                        <td className="py-3.5 px-4">
                          {item.evidence_filename ? (
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  const ev = patient.evidence.find(e => e.id === item.evidence_id) || {
                                    id: item.evidence_id || 'ev-sim',
                                    patient_id: patient.id,
                                    checklist_item_id: item.id,
                                    checklist_step_name: item.name,
                                    evidence_type: 'DOCUMENT' as const,
                                    source: item.evidence_source || 'HIS Core',
                                    filename: item.evidence_filename || 'evidence_attachment.pdf',
                                    file_url: `/mock-files/${item.evidence_filename}`,
                                    uploaded_by: item.verified_by || 'usr-3',
                                    uploaded_by_name: item.verified_by_name || 'Staff Clinician',
                                    uploaded_by_role: item.verified_by_role || item.required_role,
                                    uploaded_at: item.verified_at || '2025-04-28 08:30',
                                    verification_status: 'VERIFIED' as const,
                                  };
                                  setViewerEvidence(ev);
                                }}
                                className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                                title="Click to view verified document"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{item.evidence_filename}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleInspectValidation(item)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                title="Inspect 7-Point Evidence Validation Results"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>7-Pt Validation</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-400 italic block">No evidence attached</span>
                              <button
                                type="button"
                                onClick={() => handleInspectValidation(item)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 hover:bg-slate-200"
                                title="Inspect Evidence Gate Requirements"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>Check Gates</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Evidence Source */}
                        <td className="py-3.5 px-3 text-slate-600 text-[11px] font-medium">
                          {item.evidence_source || 'Required: EMR/PACS'}
                        </td>

                        {/* Responsible Role */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                              user?.role === item.required_role
                                ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-400'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.required_role}
                          </span>
                        </td>

                        {/* Rule / Evidence Explanation */}
                        <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-[260px] leading-relaxed">
                          <div className="font-semibold text-slate-700 mb-0.5">Policy Requirement:</div>
                          <p className="line-clamp-2" title={item.rule_explanation}>
                            {item.rule_explanation}
                          </p>
                        </td>

                        {/* Human Confirmation */}
                        <td className="py-3.5 px-3">
                          {item.human_confirmed ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <Check className="w-3.5 h-3.5" /> Confirmed
                              </span>
                              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                                by {item.human_confirmed_by || item.required_role}
                              </div>
                            </div>
                          ) : item.requires_human_confirmation ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3" /> Awaiting Sign-off
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Standard Rule</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If item is already verified */}
                            {isVerified ? (
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Ready
                              </span>
                            ) : (
                              <>
                                {/* Upload Evidence Button */}
                                <button
                                  onClick={() => setUploadModalItem(item)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                                  title="Upload Synthetic Evidence"
                                >
                                  <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Attach</span>
                                </button>

                                {/* Direct Confirm / Verify Button */}
                                <button
                                  onClick={() => handleVerifyDirect(item)}
                                  className={`px-3 py-1 text-[11px] font-bold text-white rounded-lg shadow-2xs transition-all flex items-center gap-1 ${
                                    isUserAuthorized
                                      ? 'bg-blue-600 hover:bg-blue-700'
                                      : 'bg-slate-400 hover:bg-slate-500 cursor-pointer'
                                  }`}
                                  title={
                                    !isUserAuthorized
                                      ? `Logged in as ${user?.role}. Click to test unauthorized rejection or switch role above.`
                                      : 'Verify and Sign-off'
                                  }
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{item.requires_human_confirmation ? 'Confirm' : 'Verify'}</span>
                                </button>

                                {/* Request Override Button */}
                                <button
                                  onClick={() => setOverrideModalItem(item)}
                                  className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                                  title="Controlled Override Request"
                                >
                                  Override
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FINAL PRE-OP REVIEW & SIGN-OFF GATE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    Final Pre-Operative Review & Readiness Verification Gate
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  The system does NOT automatically certify patients for surgery. An authorized Lead Surgeon or Chief Medical Officer must formally review evidence completeness and certify the patient through human workflow approval.
                </p>

                {/* Scorecards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Verified</span>
                    <span className="font-bold text-slate-800 text-sm">{criticalVerified} / {criticalItems.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Complete</span>
                    <span className="font-bold text-slate-800 text-sm">{evidenceAttached} / {evidenceRequired}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Open Exceptions</span>
                    <span className={`font-bold text-sm ${openExceptions > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {openExceptions}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Human Confirmations</span>
                    <span className="font-bold text-slate-800 text-sm">{humanConfirmationsCount} / {totalSteps}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Overrides</span>
                    <span className="font-bold text-purple-700 text-sm">{overridesCount}</span>
                  </div>
                </div>
              </div>

              {/* Final Review Action Button */}
              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                {patient.final_approval?.approved ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-right space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Patient Cleared for Operating Theatre</span>
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Signed off by: {patient.final_approval.approved_by}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setFinalApprovalModalOpen(true)}
                      disabled={!canFinalApprove()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Review Complete (Authorize Final Sign-Off)</span>
                    </button>
                    {!canFinalApprove() && (
                      <span className="text-[10px] text-slate-400">
                        Requires Lead Surgeon or Admin role to approve
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 italic">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Final approval is a human workflow action. This prototype does not determine clinical readiness.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTACHED EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attached Clinical Evidence Vault</h3>
              <p className="text-xs text-slate-500">Verified electronic records and documents associated with this case</p>
            </div>
            <button
              onClick={() => setUploadModalItem(patient.checklist[0])}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Attach New Evidence</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {patient.evidence.map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 space-y-3 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {ev.verification_status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 truncate" title={ev.filename}>{ev.filename}</h4>
                  <p className="text-[11px] text-slate-500">Linked to: {ev.checklist_step_name}</p>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source:</span>
                    <span className="font-semibold text-slate-700">{ev.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded by:</span>
                    <span className="font-medium text-slate-700">{ev.uploaded_by_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-mono text-slate-700">{ev.uploaded_at}</span>
                  </div>
                </div>

                <button
                  onClick={() => setViewerEvidence(ev)}
                  className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inspect Evidence Record</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Gating Exceptions & Policy Deviations</h3>
            <p className="text-xs text-slate-500">Unresolved safety flags preventing standard OR entry</p>
          </div>

          {patient.exceptions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active safety exceptions recorded for this patient.
            </div>
          ) : (
            <div className="space-y-3">
              {patient.exceptions.map((exc) => (
                <div
                  key={exc.id}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-900 text-sm">{exc.checklist_step_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                          {exc.category}
                        </span>
                        <StatusBadge status={exc.status as any} size="sm" />
                      </div>
                      <p className="text-rose-800 leading-relaxed">{exc.reason}</p>
                      <div className="text-[10px] text-slate-500 flex gap-4 pt-1">
                        <span>Assigned Role: <strong>{exc.assigned_role}</strong></span>
                        <span>Flagged by: {exc.created_by_name}</span>
                        <span>Timestamp: {exc.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const targetItem = patient.checklist.find(i => i.name === exc.checklist_step_name) || patient.checklist[0];
                        setUploadModalItem(targetItem);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Upload Missing Evidence
                    </button>
                    <button
                      onClick={() => {
                        const targetItem = patient.checklist.find(i => i.name === exc.checklist_step_name) || patient.checklist[0];
                        setOverrideModalItem(targetItem);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Request Override
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT TIMELINE */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Patient Safety Verification Audit Timeline</h3>
              <p className="text-xs text-slate-500">Append-only chronological record of all checklist verifications, uploads & overrides</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Immutable Ledger
            </span>
          </div>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {patient.auditLogs.map((log) => (
              <div key={log.id} className="relative text-xs space-y-1">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.event_type}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                    {log.user_role} ({log.user_name})
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DEMOGRAPHICS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Patient Clinical Profile & Surgical Case Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Intake Demographics</span>
                <div><span className="text-slate-500">Full Name:</span> <strong className="text-slate-800">{patient.name}</strong></div>
                <div><span className="text-slate-500">Age:</span> <strong className="text-slate-800">{patient.age} years</strong></div>
                <div><span className="text-slate-500">Gender:</span> <strong className="text-slate-800">{patient.gender}</strong></div>
                <div><span className="text-slate-500">MRN:</span> <strong className="text-slate-800 font-mono">{patient.patient_id}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Operative Scheduling</span>
                <div><span className="text-slate-500">Procedure:</span> <strong className="text-slate-800">{patient.surgery_type}</strong></div>
                <div><span className="text-slate-500">Scheduled:</span> <strong className="text-slate-800">{patient.scheduled_date}</strong></div>
                <div><span className="text-slate-500">Assigned Team:</span> <strong className="text-slate-800">{patient.assigned_team}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Safety Governance</span>
                <div><span className="text-slate-500">Pre-Op Risk Rating:</span> <strong className="text-rose-700">{patient.risk_level}</strong></div>
                <div><span className="text-slate-500">Clinical Readiness:</span> <strong className="text-slate-800">{patient.status}</strong></div>
                <div><span className="text-slate-500">Cohort ID:</span> <strong className="text-slate-800 font-mono">{patient.population_group_id}</strong></div>
              </div>
            </div>
          </div>

          {/* Quick Links into Clinical Timeline and Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div
              onClick={() => setActiveTab('medical_history')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900">Clinical Medical History</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Prior surgeries, chronic conditions, allergy registries, active medications, and 2023–2026 medical event trajectory.
              </p>
              <div className="text-blue-600 font-bold text-[11px] flex items-center gap-1 pt-1">
                <span>View Clinical History</span> &rarr;
              </div>
            </div>

            <div
              onClick={() => setActiveTab('history')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900">7-Day System Activity Timeline</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Chronological pre-op verification events: risks, checklist checks, lab uploads, exceptions, overrides & clearance sign-offs.
              </p>
              <div className="text-blue-600 font-bold text-[11px] flex items-center gap-1 pt-1">
                <span>View 7-Day Activity</span> &rarr;
              </div>
            </div>

            <div
              onClick={() => setActiveTab('trends')}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all space-y-2"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900">Vitals & Lab Trends</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pre-operative longitudinal graphs for Hemoglobin, Blood Pressure, Heart Rate, and serial lab panels.
              </p>
              <div className="text-blue-600 font-bold text-[11px] flex items-center gap-1 pt-1">
                <span>View Trend Graphs</span> &rarr;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CLINICAL MEDICAL HISTORY */}
      {activeTab === 'medical_history' && (
        <PatientClinicalHistoryTab
          patient={patient}
          clinicalHistory={patient.clinicalHistory}
        />
      )}

      {/* TAB: CURRENT SURGERY SPECIFICATIONS */}
      {activeTab === 'surgery' && (
        <div className="space-y-6 text-xs">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Scheduled Operative Case</span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">{patient.surgery_type}</h3>
                <p className="text-slate-500 text-xs">Theatre Assignment: {patient.surgery?.operating_room || 'OR-3 (Cardiac Suite)'}</p>
              </div>
              <StatusBadge status={patient.status as any} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Scheduled Date & Slot</span>
                <span className="font-bold text-slate-900 text-xs">{patient.scheduled_date} &bull; 08:30 AM</span>
                <span className="text-[11px] text-slate-500 block">Estimated Duration: 240 mins</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Surgeon</span>
                <span className="font-bold text-slate-900 text-xs">{patient.assigned_team}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">&bull; Cardiothoracic Surgery</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Anesthesia Plan</span>
                <span className="font-bold text-slate-900 text-xs">General Endotracheal</span>
                <span className="text-[11px] text-slate-500 block">Lead: Dr. Priya Nair, MD</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Bank Allocation</span>
                <span className="font-bold text-slate-900 text-xs">2 Units PRBC Reserved</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">&bull; Type & Screen Match</span>
              </div>
            </div>

            {/* Surgical Safety Checklist Gating Status */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-blue-900 text-xs">WHO Surgical Safety Checklist Readiness</h4>
                <p className="text-[11px] text-blue-700">
                  {patient.checklist.filter(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE').length} of {patient.checklist.length} checklist items verified with evidence.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('checklist')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Go to WHO Checklist &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RISK ASSESSMENT & 7-DAY TRAJECTORY */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {riskResult && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                    riskResult.risk_level === 'CRITICAL' ? 'bg-rose-600' :
                    riskResult.risk_level === 'HIGH' ? 'bg-orange-500' :
                    riskResult.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Explainable AI Perioperative Risk Assessment</h4>
                      <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {riskResult.model_name} ({riskResult.model_version})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transparent SHAP-style attribution factors contributing to surgical risk index.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                    <span className={`text-xl font-black ${
                      riskResult.risk_level === 'CRITICAL' ? 'text-rose-600' :
                      riskResult.risk_level === 'HIGH' ? 'text-orange-600' :
                      riskResult.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {riskResult.total_score} <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">{riskResult.confidence_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Attribution Factors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {riskResult.factors.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 text-[11px] block">{f.factor}</span>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{f.description}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded shrink-0 ${
                      f.score > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {f.score > 0 ? `+${f.score}` : `${f.score}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Recommendation Alert */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Algorithmic Recommendation: </span>
                  <span>{riskResult.ai_recommendation}</span>
                  <p className="text-[10px] text-blue-700 mt-1 italic">{riskResult.disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          {/* 7-Day Trajectory & Checklist Progress */}
          <PatientRiskChecklistHistoryTab
            patient={patient}
            riskHistory={patient.riskHistory}
            checklistHistory={patient.checklistHistory}
          />
        </div>
      )}

      {/* TAB: 7-DAY PATIENT ACTIVITY TIMELINE */}
      {activeTab === 'history' && (
        <PatientActivityTimelineTab
          patient={patient}
          onOpenAudit={() => setActiveTab('audit')}
          onOpenEvidence={(id) => {
            const ev = patient.evidence.find(e => e.id === id);
            if (ev) setViewerEvidence(ev);
            else setActiveTab('evidence');
          }}
        />
      )}

      {/* TAB: VITALS & LAB TRENDS */}
      {activeTab === 'trends' && (
        <PatientTrendsTab
          patient={patient}
          vitals={patient.vitals}
          labs={patient.labs}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmModalItem}
        item={confirmModalItem}
        currentUserRole={user?.role || 'SURGEON'}
        currentUserName={user?.name || 'Lead Surgeon'}
        onClose={() => setConfirmModalItem(null)}
        onConfirm={handleConfirmSubmit}
      />

      {/* Override Modal */}
      <OverrideModal
        isOpen={!!overrideModalItem}
        item={overrideModalItem}
        patientId={patient.id}
        currentUserRole={user?.role || 'SURGEON'}
        currentUserName={user?.name || 'Lead Surgeon'}
        onClose={() => setOverrideModalItem(null)}
        onSubmit={handleOverrideSubmit}
      />

      {/* Evidence Upload Modal */}
      <EvidenceUploadModal
        isOpen={!!uploadModalItem}
        item={uploadModalItem}
        patientId={patient.id}
        onClose={() => setUploadModalItem(null)}
        onUpload={handleUploadSubmit}
      />

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        isOpen={!!viewerEvidence}
        evidence={viewerEvidence}
        onClose={() => setViewerEvidence(null)}
      />

      {/* Final Pre-Op Approval Modal */}
      {finalApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-blue-600">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Final Pre-Operative Sign-Off</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are certifying that all high-risk pre-operative safety steps, evidence documents, and human confirmations for <strong>{patient.name} ({patient.patient_id})</strong> have been reviewed per surgical safety guidelines.
            </p>

            <form onSubmit={handleFinalSignOff} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Attending Surgeon Review Comments:</label>
                <textarea
                  rows={3}
                  required
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  placeholder="e.g., Pre-operative checklist completed; cardiac clearance verified; surgical consent verified; patient cleared for OR transfer."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                <strong>Audit Notice:</strong> This action will be permanently recorded in the immutable audit log under your credentials (<strong>{user?.name} — {user?.role}</strong>).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFinalApprovalModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={finalSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {finalSubmitting ? 'Signing Off...' : 'Complete & Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Surgical Clearance Dossier Modal */}
      {patient && (
        <ClearancePassportModal
          isOpen={passportModalOpen}
          onClose={() => setPassportModalOpen(false)}
          patient={patient}
          riskResult={riskResult}
        />
      )}

      {/* Explainable Rule Engine Modal (Section 3) */}
      <RuleExplanationModal
        isOpen={ruleModalItem !== null}
        item={ruleModalItem}
        onClose={() => setRuleModalItem(null)}
      />

      {/* Patient Data Privacy Governance Modal (Section 10) */}
      <PrivacyGovernanceModal
        isOpen={privacyModalOpen}
        currentUserRole={user?.role || 'SURGEON'}
        currentUserName={user?.name || 'Clinician'}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* Multi-Point Evidence Validation Inspection Modal (Section 4) */}
      <EvidenceValidationModal
        isOpen={validationModalItem !== null}
        item={validationModalItem}
        validation={validationDetails}
        onClose={() => {
          setValidationModalItem(null);
          setValidationDetails(null);
        }}
      />
    </div>
  );
};
