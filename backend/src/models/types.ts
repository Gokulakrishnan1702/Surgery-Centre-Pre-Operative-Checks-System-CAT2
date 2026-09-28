export type UserRole =
  | 'ADMIN'
  | 'SURGEON'
  | 'NURSE'
  | 'ANESTHETIST'
  | 'RADIOLOGIST'
  | 'PATHOLOGIST'
  | 'CARDIOLOGIST'
  | 'AUDITOR';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChecklistStatus = 'VERIFIED' | 'PENDING' | 'EXCEPTION' | 'NOT_STARTED' | 'OVERRIDE';

export type ChecklistPhase = 'SIGN_IN' | 'TIME_OUT' | 'SIGN_OUT';

export type EvidenceType =
  | 'EMR'
  | 'LAB'
  | 'PACS'
  | 'DOCUMENT'
  | 'CLINICIAN_NOTE'
  | 'CONSENT_FORM'
  | 'OTHER';

export type ExceptionStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'OVERRIDDEN';

export type OverrideStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SurgeryStatus =
  | 'PLANNED'
  | 'PREPARING'
  | 'READY'
  | 'EXCEPTION'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type AuditEventType =
  | 'CHECKLIST_CREATED'
  | 'CHECKLIST_UPDATED'
  | 'EVIDENCE_UPLOADED'
  | 'EVIDENCE_VERIFIED'
  | 'EVIDENCE_REJECTED'
  | 'HUMAN_CONFIRMED'
  | 'EXCEPTION_CREATED'
  | 'EXCEPTION_RESOLVED'
  | 'OVERRIDE_REQUESTED'
  | 'OVERRIDE_APPROVED'
  | 'OVERRIDE_REJECTED'
  | 'FINAL_APPROVAL'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PATIENT_CREATED'
  | 'PATIENT_UPDATED'
  | 'SURGERY_CREATED'
  | 'SURGERY_UPDATED'
  | 'ROLE_CHANGED';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  department?: string;
  staff_id?: string;
  phone?: string;
  last_login?: string;
  failed_login_attempts?: number;
  lockout_until?: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  surgery_type: string;
  scheduled_date: string;
  risk_level: RiskLevel;
  status: 'READY' | 'IN_PROGRESS' | 'EXCEPTION' | 'PENDING';
  assigned_team: string;
  population_group_id: string;
  contact_phone?: string;
  allergies?: string[];
  medical_history?: string[];
  current_medications?: string[];
  risk_indicators?: string[];
  previous_surgeries?: string[];
  chronic_conditions?: string[];
  previous_hospitalizations?: string[];
  previous_complications?: string[];
  family_history?: string[];
  previous_diagnoses?: string[];
  active_surgery_id?: string;
  final_approval?: {
    approved: boolean;
    approved_by?: string;
    approved_at?: string;
    notes?: string;
  };
}

export interface Surgery {
  id: string;
  surgery_code: string;
  patient_id: string;
  patient_name: string;
  procedure: string;
  surgeon_id?: string;
  surgeon_name: string;
  department: string;
  operating_room: string;
  scheduled_datetime: string;
  surgery_type: string;
  risk_level: RiskLevel;
  status: SurgeryStatus;
  checklist_completion_pct: number;
  anesthetist_name?: string;
  lead_nurse_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  risk_level: RiskLevel;
  required_role: UserRole;
  requires_evidence: boolean;
  requires_human_confirmation: boolean;
  phase: ChecklistPhase;
  phase_label: string;
  evidence_type?: EvidenceType;
  rule_explanation: string;
}

export interface ChecklistItem {
  id: string;
  patient_id: string;
  surgery_id?: string;
  template_id: string;
  name: string;
  risk_level: RiskLevel;
  required_role: UserRole;
  requires_evidence: boolean;
  requires_human_confirmation: boolean;
  phase: ChecklistPhase;
  phase_label: string;
  rule_explanation: string;
  status: ChecklistStatus;
  evidence_source?: string;
  evidence_id?: string;
  evidence_filename?: string;
  evidence_url?: string;
  evidence_sha256?: string;
  verified_by?: string;
  verified_by_name?: string;
  verified_by_role?: UserRole;
  verified_at?: string;
  human_confirmed: boolean;
  human_confirmed_by?: string;
  human_confirmed_at?: string;
  human_confirmation_comment?: string;
  override_id?: string;
  exception_id?: string;
  updated_at: string;
}

export interface EvidenceRecord {
  id: string;
  patient_id: string;
  checklist_item_id: string;
  checklist_step_name: string;
  evidence_type: EvidenceType;
  source: string;
  filename: string;
  file_url: string;
  file_size?: string;
  sha256_hash?: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_by_role: UserRole;
  uploaded_at: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'CONFLICTING';
  expiry?: string;
  notes?: string;
  rejection_reason?: string;
}

export interface ConfirmationRecord {
  id: string;
  checklist_item_id: string;
  evidence_id?: string;
  confirmed_by: string;
  confirmed_by_name: string;
  confirmed_by_role: UserRole;
  decision: 'APPROVED' | 'REJECTED';
  comment: string;
  timestamp: string;
}

export interface ExceptionRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  checklist_item_id: string;
  checklist_step_name: string;
  severity: RiskLevel;
  category:
    | 'Missing Evidence'
    | 'Expired Evidence'
    | 'Invalid Evidence'
    | 'Role Mismatch'
    | 'Human Confirmation Missing'
    | 'Conflicting Evidence'
    | 'Override Required';
  reason: string;
  status: ExceptionStatus;
  created_by: string;
  created_by_name: string;
  assigned_role: UserRole;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface OverrideRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  checklist_item_id: string;
  checklist_step_name: string;
  reason: string;
  business_reason: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: OverrideStatus;
  requested_by: string;
  requested_by_name: string;
  requested_by_role: UserRole;
  approved_by?: string;
  approved_by_name?: string;
  approved_by_role?: UserRole;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  event_type: AuditEventType;
  patient_id?: string;
  patient_name?: string;
  checklist_step?: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  evidence_source?: string;
  evidence_id?: string;
  sha256_hash?: string;
  decision?: string;
  override_reason?: string;
  details: string;
  ip_address?: string;
  before_value?: string;
  after_value?: string;
}

export interface ClinicalNotification {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'PENDING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  role_target?: UserRole | 'ALL';
  patient_id?: string;
  read: boolean;
  link?: string;
}

export interface RiskFactor {
  factor: string;
  score: number;
  category: 'CLINICAL' | 'SURGICAL' | 'EVIDENCE' | 'DEMOGRAPHIC';
  description: string;
  is_mitigating?: boolean;
}

export interface RiskAssessmentResult {
  patient_id: string;
  total_score: number;
  risk_level: RiskLevel;
  confidence_pct: number;
  factors: RiskFactor[];
  ai_recommendation: string;
  model_name: string;
  model_version: string;
  assessed_at: string;
  disclaimer: string;
}

export interface ModelGovernanceInfo {
  model_name: string;
  version: string;
  algorithm: string;
  task: string;
  training_dataset: string;
  training_date: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  status: 'ACTIVE' | 'EVALUATION' | 'STAGING';
  features_analyzed: string[];
}

export interface FairnessEvaluation {
  test_date: string;
  dataset_size: number;
  threshold_used: number;
  result: 'PASSED' | 'FLAGGED';
  group_a: {
    name: string;
    cases: number;
    completion_rate: number;
    exception_rate: number;
    evidence_verification_rate: number;
    human_confirmation_rate: number;
    false_negative_rate: number;
    false_completion_rate?: number;
    override_rate?: number;
  };
  group_b: {
    name: string;
    cases: number;
    completion_rate: number;
    exception_rate: number;
    evidence_verification_rate: number;
    human_confirmation_rate: number;
    false_negative_rate: number;
    false_completion_rate?: number;
    override_rate?: number;
  };
  differences: {
    completion_rate_diff: number;
    exception_rate_diff: number;
    evidence_verification_rate_diff: number;
    human_confirmation_rate_diff: number;
    false_negative_rate_diff: number;
    false_completion_rate_diff?: number;
    override_disparity?: number;
    disparate_impact_ratio?: number;
    statistical_parity_difference?: number;
    max_disparity: number;
  };
  flags?: string[];
  remediation_recommendations?: string[];
}

export interface ExperimentDataset {
  metrics: Array<{
    name: string;
    baseline: number;
    prototype: number;
    unit: string;
    description: string;
  }>;
  summary: {
    baseline_safety_score: number;
    prototype_safety_score: number;
    evidence_enforcement_delta: string;
    audit_coverage_delta: string;
  };
}

export interface SystemSettings {
  hospitalName: string;
  hospitalId: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  doctorApprovalRequired: boolean;
  highRiskEvidenceRequired: boolean;
  humanConfirmationRequired: boolean;
  overrideReasonRequired: boolean;
  auditLoggingEnabled: boolean;
  preventVerificationWithoutEvidence: boolean;
  fairnessThreshold: number;
  auditRetentionDays: number;
}

export interface NotificationSettings {
  notifyMissingEvidence: boolean;
  notifyHighRiskPending: boolean;
  notifyExceptionCreated: boolean;
  notifyOverrideRequested: boolean;
  notifyFinalApprovalPending: boolean;
}

export interface ChecklistConfiguration {
  defaultVersion: string;
  highRiskEvidence: string;
  criticalEvidence: string;
  humanConfirmation: string;
  defaultExceptionSeverity: string;
}

export interface DashboardKPIs {
  totalPatients: number;
  activeSurgeries: number;
  checklistCompletionRate: number;
  highRiskPatients: number;
  pendingEvidenceCount: number;
  openExceptionsCount: number;
  pendingApprovalsCount: number;
  criticalAlertsCount: number;
  safeSurgeryIndex: number;
  readinessSummary?: {
    ready: number;
    inProgress: number;
    exception: number;
    pending: number;
  };
  criticalStepsVerified: {
    current: number;
    total: number;
    percentage: number;
    trend: string;
  };
  evidenceComplete: {
    current: number;
    total: number;
    percentage: number;
    trend: string;
  };
  pendingHumanConfirmation: {
    count: number;
    trend: string;
    status: 'NORMAL' | 'WARNING';
  };
  exceptions: {
    count: number;
    trend: string;
    status: 'GOOD' | 'ATTENTION';
  };
  fairnessTest: {
    status: 'PASSED' | 'FLAGGED';
    disparity: string;
    threshold: string;
    lastRun: string;
  };
  completionDistribution: Array<{ name: string; value: number; color: string }>;
  evidenceCoverage: Array<{ category: string; required: number; available: number; verified: number }>;
  exceptionsByCategory: Array<{ name: string; count: number }>;
  teamWorkload: Array<{ role: string; assigned: number; completed: number }>;
  workflowStages: Array<{
    stage: string;
    completedPercent: number;
    countCompleted: number;
    countPending: number;
    exceptions: number;
  }>;
}

export type HistoryRelativeDayGroup =
  | 'TODAY'
  | 'YESTERDAY'
  | '2_DAYS_AGO'
  | '3_DAYS_AGO'
  | '4_DAYS_AGO'
  | '5_DAYS_AGO'
  | '6_DAYS_AGO'
  | '7_PLUS_DAYS_AGO';

export type PatientActivityEventType =
  | 'PATIENT'
  | 'SURGERY'
  | 'CHECKLIST'
  | 'EVIDENCE'
  | 'RISK_ASSESSMENT'
  | 'CONFIRMATION'
  | 'EXCEPTION'
  | 'OVERRIDE'
  | 'APPROVAL'
  | 'LOGIN_ACCESS'
  | 'OTHER';

export interface ClinicalHistoryEntry {
  id: string;
  patient_id: string;
  year: string;
  date_approx?: string;
  category: 'SURGERY' | 'DIAGNOSIS' | 'HOSPITALIZATION' | 'MEDICATION' | 'ALLERGY' | 'FAMILY_HISTORY' | 'INVESTIGATION';
  title: string;
  description: string;
  facility?: string;
  complications?: string;
  status?: string;
}

export interface VitalRecord {
  id: string;
  patient_id: string;
  timestamp: string;
  relative_day: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  respiratory_rate: number;
  temperature_celsius: number;
  spo2_percent: number;
  recorded_by: string;
  notes?: string;
}

export interface LabResultRecord {
  id: string;
  patient_id: string;
  timestamp: string;
  relative_day: string;
  hemoglobin_g_dl: number;
  wbc_count_k_ul: number;
  platelets_k_ul: number;
  glucose_mg_dl: number;
  creatinine_mg_dl: number;
  inr_coagulation?: number;
  potassium_mmol_l?: number;
  sodium_mmol_l?: number;
  lab_technician: string;
  status: 'NORMAL' | 'EVALUATION' | 'CRITICAL';
}

export interface RiskHistoryRecord {
  id: string;
  patient_id: string;
  timestamp: string;
  relative_day: string;
  previous_risk_level: RiskLevel;
  new_risk_level: RiskLevel;
  previous_score: number;
  new_score: number;
  contributing_factors: string[];
  model_version: string;
  reviewer_name: string;
  reviewer_role: UserRole;
  reason: string;
  explanation?: string;
}

export interface ChecklistHistoryRecord {
  id: string;
  patient_id: string;
  timestamp: string;
  relative_day: string;
  completion_percentage: number;
  items_completed: number;
  items_total: number;
  changed_items: string[];
  recorded_by: string;
}

export interface PatientActivityEvent {
  id: string;
  patient_id: string;
  timestamp: string;
  formatted_time: string;
  exact_datetime: string;
  relative_day_group: HistoryRelativeDayGroup;
  relative_day_label: string;
  event_type: PatientActivityEventType;
  title: string;
  short_description: string;
  performed_by: string;
  user_role: UserRole;
  status: 'COMPLETED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ESCALATED' | 'RESOLVED';
  related_record?: {
    type: string;
    id: string;
    name?: string;
  };
  comment?: string;
  icon_type?: string;
  badge_color?: string;
}

export interface PatientHistorySummary {
  totalEvents: number;
  last7DaysCount: number;
  openExceptionsCount: number;
  evidenceAddedCount: number;
  evidenceVerifiedCount: number;
  riskChangesCount: number;
  checklistUpdatesCount: number;
  approvalsCount: number;
}

export interface PatientHistoryResponse {
  patient_id: string;
  patient_name: string;
  summary: PatientHistorySummary;
  timeline: PatientActivityEvent[];
  grouped_timeline: Record<string, PatientActivityEvent[]>;
}
