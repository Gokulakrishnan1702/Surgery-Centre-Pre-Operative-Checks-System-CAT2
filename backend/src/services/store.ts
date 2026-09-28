import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  User,
  Patient,
  Surgery,
  SurgeryStatus,
  ChecklistTemplate,
  ChecklistItem,
  ChecklistPhase,
  EvidenceRecord,
  ConfirmationRecord,
  ExceptionRecord,
  OverrideRecord,
  AuditRecord,
  AuditEventType,
  ClinicalNotification,
  RiskAssessmentResult,
  FairnessEvaluation,
  ExperimentDataset,
  UserRole,
  RiskLevel,
  ChecklistStatus,
  SystemSettings,
  NotificationSettings,
  ChecklistConfiguration,
  ClinicalHistoryEntry,
  VitalRecord,
  LabResultRecord,
  RiskHistoryRecord,
  ChecklistHistoryRecord,
  PatientActivityEvent,
  PatientActivityEventType,
  HistoryRelativeDayGroup,
  PatientHistorySummary,
  PatientHistoryResponse
} from '../models/types';
import { ClinicalRiskEngine } from './riskEngine';

class DataStore {
  public users: User[] = [];
  public templates: ChecklistTemplate[] = [];
  public patients: Patient[] = [];
  public surgeries: Surgery[] = [];
  public checklistItems: ChecklistItem[] = [];
  public evidence: EvidenceRecord[] = [];
  public confirmations: ConfirmationRecord[] = [];
  public exceptions: ExceptionRecord[] = [];
  public overrides: OverrideRecord[] = [];
  public auditLogs: AuditRecord[] = [];
  public notifications: ClinicalNotification[] = [];
  public fairnessThreshold: number = 10.0;
  
  public clinicalHistories: Map<string, ClinicalHistoryEntry[]> = new Map();
  public vitalsHistory: Map<string, VitalRecord[]> = new Map();
  public labsHistory: Map<string, LabResultRecord[]> = new Map();
  public riskHistory: Map<string, RiskHistoryRecord[]> = new Map();
  public checklistHistory: Map<string, ChecklistHistoryRecord[]> = new Map();
  public patientActivityEvents: Map<string, PatientActivityEvent[]> = new Map();
  
  public systemSettings: SystemSettings = {
    hospitalName: 'Metropolitan Surgical Center of Excellence',
    hospitalId: 'HOSP-001',
    location: 'Coimbatore, Tamil Nadu',
    contactEmail: 'admin@hospital-demo.com',
    contactPhone: '+91-800-555-0199',
    doctorApprovalRequired: true,
    highRiskEvidenceRequired: true,
    humanConfirmationRequired: true,
    overrideReasonRequired: true,
    auditLoggingEnabled: true,
    preventVerificationWithoutEvidence: true,
    fairnessThreshold: 10.0,
    auditRetentionDays: 3650
  };

  public notificationSettings: NotificationSettings = {
    notifyMissingEvidence: true,
    notifyHighRiskPending: true,
    notifyExceptionCreated: true,
    notifyOverrideRequested: true,
    notifyFinalApprovalPending: true
  };

  public checklistConfiguration: ChecklistConfiguration = {
    defaultVersion: '1.0',
    highRiskEvidence: 'Required',
    criticalEvidence: 'Required',
    humanConfirmation: 'Required',
    defaultExceptionSeverity: 'HIGH'
  };

  constructor() {
    this.seed();
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private generateSha256(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private seed() {
    // 1. Synthetic Clinician Accounts with real bcrypt hashed passwords ('password')
    const demoPasswordHash = this.hashPassword('password');

    this.users = [
      {
        id: 'usr-1',
        email: 'admin@demo.com',
        password_hash: demoPasswordHash,
        name: 'Dr. Evelyn Reed (Chief Medical Officer)',
        role: 'ADMIN',
        status: 'ACTIVE',
        department: 'Chief Medical Office & Surgical Administration',
        staff_id: 'STAFF-ADM-001',
        phone: '+91-98401-11001',
        last_login: '2025-04-28 09:30'
      },
      {
        id: 'usr-2',
        email: 'surgeon@demo.com',
        password_hash: demoPasswordHash,
        name: 'Dr. Marcus Vance (Lead Surgeon)',
        role: 'SURGEON',
        status: 'ACTIVE',
        department: 'Department of General & Cardiothoracic Surgery',
        staff_id: 'STAFF-SRG-002',
        phone: '+91-98401-11002',
        last_login: '2025-04-28 08:45'
      },
      {
        id: 'usr-3',
        email: 'nurse@demo.com',
        password_hash: demoPasswordHash,
        name: 'Nurse Clara Barton (Charge Nurse)',
        role: 'NURSE',
        status: 'ACTIVE',
        department: 'Pre-Operative Holding & Surgical Nursing Unit',
        staff_id: 'STAFF-NRS-003',
        phone: '+91-98401-11003',
        last_login: '2025-04-28 07:15'
      },
      {
        id: 'usr-4',
        email: 'anesthetist@demo.com',
        password_hash: demoPasswordHash,
        name: 'Dr. Arthur Pendelton (Chief Anesthetist)',
        role: 'ANESTHETIST',
        status: 'ACTIVE',
        department: 'Department of Anesthesiology & Perioperative Medicine',
        staff_id: 'STAFF-ANE-004',
        phone: '+91-98401-11004',
        last_login: '2025-04-28 08:10'
      },
      {
        id: 'usr-5',
        email: 'radiologist@demo.com',
        password_hash: demoPasswordHash,
        name: 'Dr. Sanjay Patel (Radiologist)',
        role: 'RADIOLOGIST',
        status: 'ACTIVE',
        department: 'Department of Diagnostic Imaging & PACS',
        staff_id: 'STAFF-RAD-005',
        phone: '+91-98401-11005',
        last_login: '2025-04-28 09:05'
      },
      {
        id: 'usr-6',
        email: 'pathologist@demo.com',
        password_hash: demoPasswordHash,
        name: 'Dr. Helena Rostova (Pathologist)',
        role: 'PATHOLOGIST',
        status: 'ACTIVE',
        department: 'Division of Clinical Pathology & Transfusion Medicine',
        staff_id: 'STAFF-PAT-006',
        phone: '+91-98401-11006',
        last_login: '2025-04-28 07:50'
      },
      {
        id: 'usr-7',
        email: 'cardiologist@demo.com',
        password_hash: demoPasswordHash,
        name: 'Dr. Kenneth Chen (Cardiologist)',
        role: 'CARDIOLOGIST',
        status: 'ACTIVE',
        department: 'Division of Cardiovascular Medicine & Echo Lab',
        staff_id: 'STAFF-CRD-007',
        phone: '+91-98401-11007',
        last_login: '2025-04-28 08:35'
      },
      {
        id: 'usr-8',
        email: 'auditor@demo.com',
        password_hash: demoPasswordHash,
        name: 'Sarah Jenkins (Clinical Quality Auditor)',
        role: 'AUDITOR',
        status: 'ACTIVE',
        department: 'Clinical Governance & Forensic Audit Unit',
        staff_id: 'STAFF-AUD-008',
        phone: '+91-98401-11008',
        last_login: '2025-04-28 10:00'
      }
    ];

    // 2. WHO 3-Phase Checklist Templates (10 standard surgical checklist steps)
    this.templates = [
      {
        id: 'tmpl-1',
        name: 'Allergy Review',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        evidence_type: 'EMR',
        rule_explanation: 'Validates documented patient drug, latex, and food allergies against electronic health records within 7 days of surgery.'
      },
      {
        id: 'tmpl-2',
        name: 'ASA Classification',
        risk_level: 'HIGH',
        required_role: 'ANESTHETIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        evidence_type: 'EMR',
        rule_explanation: 'Physical status assessment (ASA I-VI). ASA >= 3 requires formal specialist clearance and documented airway risk score.'
      },
      {
        id: 'tmpl-3',
        name: 'Recent Lab Results',
        risk_level: 'HIGH',
        required_role: 'PATHOLOGIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        evidence_type: 'LAB',
        rule_explanation: 'Mandatory CBC, Renal Function (BUN/Cr), and Coagulation panel (PT/INR) required within 72 hours of invasive procedures.'
      },
      {
        id: 'tmpl-4',
        name: 'Imaging Review',
        risk_level: 'HIGH',
        required_role: 'RADIOLOGIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        evidence_type: 'PACS',
        rule_explanation: 'Pre-op diagnostic imaging (Chest X-Ray / CT / MRI) must be reviewed on PACS with formal radiological sign-off confirming anatomical landmarks.'
      },
      {
        id: 'tmpl-5',
        name: 'Medication Review',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        evidence_type: 'CLINICIAN_NOTE',
        rule_explanation: 'Pharmacological reconciliation: confirmation that antiplatelet/anticoagulant drugs have been paused per protocol.'
      },
      {
        id: 'tmpl-6',
        name: 'Cardiac Clearance',
        risk_level: 'CRITICAL',
        required_role: 'CARDIOLOGIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        evidence_type: 'DOCUMENT',
        rule_explanation: 'Mandatory echocardiogram and 12-lead ECG review with explicit functional clearance for major procedures or patients with cardiac history.'
      },
      {
        id: 'tmpl-7',
        name: 'Consent Verification',
        risk_level: 'CRITICAL',
        required_role: 'SURGEON',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        evidence_type: 'CONSENT_FORM',
        rule_explanation: 'Legally signed and witnessed informed surgical consent detailing specific site, risks, alternatives, and blood transfusion approval.'
      },
      {
        id: 'tmpl-8',
        name: 'Blood Availability',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        evidence_type: 'LAB',
        rule_explanation: 'Type and cross-match confirmed with blood bank. Dedicated PRBC units reserved and verified for high-blood-loss cases.'
      },
      {
        id: 'tmpl-9',
        name: 'Infection Screening',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        evidence_type: 'LAB',
        rule_explanation: 'MRSA nasal screening and negative acute viral symptoms check within 48h of operating theater entry.'
      },
      {
        id: 'tmpl-10',
        name: 'Final Surgical Site Confirmation',
        risk_level: 'CRITICAL',
        required_role: 'SURGEON',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        evidence_type: 'DOCUMENT',
        rule_explanation: 'Surgeon marked correct operative site with indelible ink in pre-holding area; verified jointly with the conscious patient.'
      }
    ];

    // 3. Demo Patient: R. Suresh (P10001)
    const demoPatientId = 'pat-10001';
    const suresh: Patient = {
      id: demoPatientId,
      patient_id: 'P10001',
      name: 'R. Suresh',
      age: 56,
      gender: 'Male',
      surgery_type: 'Synthetic Cardiac Surgery (CABG)',
      scheduled_date: '2025-04-28 10:00 AM',
      risk_level: 'CRITICAL',
      status: 'EXCEPTION',
      assigned_team: 'Cardiac Surgery Team Alpha',
      population_group_id: 'grp-A',
      contact_phone: '+91-98765-43210',
      allergies: ['Penicillin (Moderate maculopapular rash)', 'Latex (Mild urticaria)'],
      medical_history: ['Triple Vessel CAD (LAD 85%, RCA 90%, LCx 75%)', 'Type 2 Diabetes Mellitus (HbA1c 7.4%)', 'Essential Systemic Hypertension'],
      current_medications: ['Aspirin 81mg (held 5 days)', 'Metformin 500mg BID', 'Atorvastatin 40mg QHS', 'Metoprolol Succinate 25mg QD'],
      risk_indicators: ['LVEF 40% (Mild-to-moderate systolic dysfunction)', 'Elevated Perioperative Anesthetic Risk', 'Requires Specialist Clearance Attestation'],
      previous_surgeries: ['Elective Inguinal Hernioplasty (2024, Uneventful)', 'Diagnostic Coronary Angiogram (2026)'],
      chronic_conditions: ['Triple-Vessel Coronary Artery Disease', 'Type 2 Diabetes Mellitus', 'Essential Systemic Hypertension'],
      previous_hospitalizations: ['Short observation for exertional angina, Class III (2025)', 'Day-care hernioplasty (2024)'],
      previous_complications: ['No prior anesthetic or post-operative complications recorded'],
      family_history: ['Father: Myocardial infarction at age 62', 'Mother: Type 2 Diabetes Mellitus'],
      previous_diagnoses: ['CAD Triple-Vessel', 'Dyslipidemia', 'Moderate Left Ventricular Systolic Dysfunction (LVEF 40%)'],
      active_surgery_id: 'srg-10001'
    };
    this.patients.push(suresh);

    // Seed Suresh Surgery Record
    this.surgeries.push({
      id: 'srg-10001',
      surgery_code: 'SRG-2026-001',
      patient_id: demoPatientId,
      patient_name: 'R. Suresh',
      procedure: 'Coronary Artery Bypass Grafting (CABG x 3: LIMA-LAD, SVG-RCA, SVG-OM1)',
      surgeon_id: 'usr-2',
      surgeon_name: 'Dr. Marcus Vance (Lead Surgeon)',
      department: 'Cardiothoracic Surgery',
      operating_room: 'OR-04 (Cardiothoracic Suite)',
      scheduled_datetime: '2025-04-28 10:00 AM',
      surgery_type: 'Cardiac Surgery (CABG)',
      risk_level: 'CRITICAL',
      status: 'EXCEPTION',
      checklist_completion_pct: 70,
      anesthetist_name: 'Dr. Arthur Pendelton',
      lead_nurse_name: 'Nurse Clara Barton',
      notes: 'Priority CABG case. Requires specialist cardiology clearance attestation prior to induction.',
      created_at: '2025-04-20 09:00 AM',
      updated_at: '2025-04-28 09:15 AM'
    });

    // Initial Evidence for R. Suresh with SHA-256 Hashes
    const ev1: EvidenceRecord = {
      id: 'ev-101',
      patient_id: demoPatientId,
      checklist_item_id: 'chk-10001-1',
      checklist_step_name: 'Allergy Review',
      evidence_type: 'EMR',
      source: 'Epic EMR Allergy Ledger',
      filename: 'emr_allergy_profile_P10001.pdf',
      file_url: '/mock-files/emr_allergy_profile_P10001.pdf',
      file_size: '245 KB',
      sha256_hash: this.generateSha256('emr_allergy_profile_P10001.pdf-2025-04-28'),
      uploaded_by: 'usr-3',
      uploaded_by_name: 'Nurse Clara Barton',
      uploaded_by_role: 'NURSE',
      uploaded_at: '2025-04-28 08:12 AM',
      verification_status: 'VERIFIED',
      notes: 'Penicillin allergy documented; patient alert wristband attached.'
    };

    const ev2: EvidenceRecord = {
      id: 'ev-102',
      patient_id: demoPatientId,
      checklist_item_id: 'chk-10001-2',
      checklist_step_name: 'ASA Classification',
      evidence_type: 'EMR',
      source: 'Anesthesia Pre-Op EMR Assessment',
      filename: 'asa_evaluation_score_P10001.pdf',
      file_url: '/mock-files/asa_evaluation_score_P10001.pdf',
      file_size: '310 KB',
      sha256_hash: this.generateSha256('asa_evaluation_score_P10001.pdf-2025-04-28'),
      uploaded_by: 'usr-4',
      uploaded_by_name: 'Dr. Arthur Pendelton',
      uploaded_by_role: 'ANESTHETIST',
      uploaded_at: '2025-04-28 08:25 AM',
      verification_status: 'VERIFIED',
      notes: 'ASA Class III confirmed due to severe CAD and systemic hypertension.'
    };

    const ev3: EvidenceRecord = {
      id: 'ev-103',
      patient_id: demoPatientId,
      checklist_item_id: 'chk-10001-3',
      checklist_step_name: 'Recent Lab Results',
      evidence_type: 'LAB',
      source: 'Central Pathology Laboratory System',
      filename: 'lab_complete_blood_chem_P10001.pdf',
      file_url: '/mock-files/lab_complete_blood_chem_P10001.pdf',
      file_size: '420 KB',
      sha256_hash: this.generateSha256('lab_complete_blood_chem_P10001.pdf-2025-04-28'),
      uploaded_by: 'usr-6',
      uploaded_by_name: 'Dr. Helena Rostova',
      uploaded_by_role: 'PATHOLOGIST',
      uploaded_at: '2025-04-28 08:40 AM',
      verification_status: 'VERIFIED',
      notes: 'Hb: 13.2 g/dL, Platelets: 240k, INR: 1.05, Creatinine: 1.1 mg/dL.'
    };

    const ev5: EvidenceRecord = {
      id: 'ev-105',
      patient_id: demoPatientId,
      checklist_item_id: 'chk-10001-5',
      checklist_step_name: 'Medication Review',
      evidence_type: 'CLINICIAN_NOTE',
      source: 'Pharmacy Reconciliation Note',
      filename: 'medication_reconciliation_P10001.pdf',
      file_url: '/mock-files/medication_reconciliation_P10001.pdf',
      file_size: '180 KB',
      sha256_hash: this.generateSha256('medication_reconciliation_P10001.pdf-2025-04-28'),
      uploaded_by: 'usr-3',
      uploaded_by_name: 'Nurse Clara Barton',
      uploaded_by_role: 'NURSE',
      uploaded_at: '2025-04-28 08:48 AM',
      verification_status: 'VERIFIED',
      notes: 'Antiplatelet protocols reviewed; aspirin paused 5 days prior.'
    };

    const ev7: EvidenceRecord = {
      id: 'ev-107',
      patient_id: demoPatientId,
      checklist_item_id: 'chk-10001-7',
      checklist_step_name: 'Consent Verification',
      evidence_type: 'CONSENT_FORM',
      source: 'Surgical Consent Vault',
      filename: 'signed_surgical_consent_form_P10001.pdf',
      file_url: '/mock-files/signed_surgical_consent_form_P10001.pdf',
      file_size: '512 KB',
      sha256_hash: this.generateSha256('signed_surgical_consent_form_P10001.pdf-2025-04-28'),
      uploaded_by: 'usr-2',
      uploaded_by_name: 'Dr. Marcus Vance',
      uploaded_by_role: 'SURGEON',
      uploaded_at: '2025-04-28 09:10 AM',
      verification_status: 'VERIFIED',
      notes: 'Signed CABG informed consent witnessed by clinical staff.'
    };

    this.evidence.push(ev1, ev2, ev3, ev5, ev7);

    // Initial Checklist Items for R. Suresh
    const sureshChecklist: ChecklistItem[] = [
      {
        id: 'chk-10001-1',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-1',
        name: 'Allergy Review',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        rule_explanation: this.templates[0].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Epic EMR Allergy Ledger',
        evidence_id: 'ev-101',
        evidence_filename: 'emr_allergy_profile_P10001.pdf',
        evidence_sha256: ev1.sha256_hash,
        verified_by: 'usr-3',
        verified_by_name: 'Nurse Clara Barton',
        verified_by_role: 'NURSE',
        verified_at: '2025-04-28 08:12 AM',
        human_confirmed: true,
        human_confirmed_by: 'Nurse Clara Barton',
        human_confirmed_at: '2025-04-28 08:12 AM',
        updated_at: '2025-04-28 08:12 AM'
      },
      {
        id: 'chk-10001-2',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-2',
        name: 'ASA Classification',
        risk_level: 'HIGH',
        required_role: 'ANESTHETIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        rule_explanation: this.templates[1].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Anesthesia Pre-Op EMR Assessment',
        evidence_id: 'ev-102',
        evidence_filename: 'asa_evaluation_score_P10001.pdf',
        evidence_sha256: ev2.sha256_hash,
        verified_by: 'usr-4',
        verified_by_name: 'Dr. Arthur Pendelton',
        verified_by_role: 'ANESTHETIST',
        verified_at: '2025-04-28 08:25 AM',
        human_confirmed: true,
        human_confirmed_by: 'Dr. Arthur Pendelton',
        human_confirmed_at: '2025-04-28 08:25 AM',
        human_confirmation_comment: 'ASA III verified. Airway Mallampati II.',
        updated_at: '2025-04-28 08:25 AM'
      },
      {
        id: 'chk-10001-3',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-3',
        name: 'Recent Lab Results',
        risk_level: 'HIGH',
        required_role: 'PATHOLOGIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        rule_explanation: this.templates[2].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Central Pathology Laboratory System',
        evidence_id: 'ev-103',
        evidence_filename: 'lab_complete_blood_chem_P10001.pdf',
        evidence_sha256: ev3.sha256_hash,
        verified_by: 'usr-6',
        verified_by_name: 'Dr. Helena Rostova',
        verified_by_role: 'PATHOLOGIST',
        verified_at: '2025-04-28 08:40 AM',
        human_confirmed: true,
        human_confirmed_by: 'Dr. Helena Rostova',
        human_confirmed_at: '2025-04-28 08:40 AM',
        human_confirmation_comment: 'Electrolytes and coagulation normal. Clearance provided.',
        updated_at: '2025-04-28 08:40 AM'
      },
      {
        id: 'chk-10001-4',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-4',
        name: 'Imaging Review',
        risk_level: 'HIGH',
        required_role: 'RADIOLOGIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        rule_explanation: this.templates[3].rule_explanation,
        status: 'PENDING',
        evidence_source: 'PACS Chest Radiograph & CT Angio',
        human_confirmed: false,
        updated_at: '2025-04-28 08:00 AM'
      },
      {
        id: 'chk-10001-5',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-5',
        name: 'Medication Review',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        rule_explanation: this.templates[4].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Pharmacy Reconciliation Note',
        evidence_id: 'ev-105',
        evidence_filename: 'medication_reconciliation_P10001.pdf',
        evidence_sha256: ev5.sha256_hash,
        verified_by: 'usr-3',
        verified_by_name: 'Nurse Clara Barton',
        verified_by_role: 'NURSE',
        verified_at: '2025-04-28 08:48 AM',
        human_confirmed: true,
        human_confirmed_by: 'Nurse Clara Barton',
        human_confirmed_at: '2025-04-28 08:48 AM',
        updated_at: '2025-04-28 08:48 AM'
      },
      {
        id: 'chk-10001-6',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-6',
        name: 'Cardiac Clearance',
        risk_level: 'CRITICAL',
        required_role: 'CARDIOLOGIST',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        rule_explanation: this.templates[5].rule_explanation,
        status: 'EXCEPTION',
        evidence_source: 'Cardiology Clinic Documentation',
        exception_id: 'exc-101',
        human_confirmed: false,
        updated_at: '2025-04-28 09:15 AM'
      },
      {
        id: 'chk-10001-7',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-7',
        name: 'Consent Verification',
        risk_level: 'CRITICAL',
        required_role: 'SURGEON',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        rule_explanation: this.templates[6].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Surgical Consent Vault',
        evidence_id: 'ev-107',
        evidence_filename: 'signed_surgical_consent_form_P10001.pdf',
        evidence_sha256: ev7.sha256_hash,
        verified_by: 'usr-2',
        verified_by_name: 'Dr. Marcus Vance',
        verified_by_role: 'SURGEON',
        verified_at: '2025-04-28 09:10 AM',
        human_confirmed: true,
        human_confirmed_by: 'Dr. Marcus Vance',
        human_confirmed_at: '2025-04-28 09:10 AM',
        human_confirmation_comment: 'Reviewed risks and consent directly with Mr. Suresh.',
        updated_at: '2025-04-28 09:10 AM'
      },
      {
        id: 'chk-10001-8',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-8',
        name: 'Blood Availability',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        rule_explanation: this.templates[7].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Blood Bank Crossmatch Ledger',
        verified_by: 'usr-3',
        verified_by_name: 'Nurse Clara Barton',
        verified_by_role: 'NURSE',
        verified_at: '2025-04-28 08:30 AM',
        human_confirmed: true,
        updated_at: '2025-04-28 08:30 AM'
      },
      {
        id: 'chk-10001-9',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-9',
        name: 'Infection Screening',
        risk_level: 'MEDIUM',
        required_role: 'NURSE',
        requires_evidence: true,
        requires_human_confirmation: false,
        phase: 'SIGN_IN',
        phase_label: 'Phase 1: Sign-In (Pre-Induction)',
        rule_explanation: this.templates[8].rule_explanation,
        status: 'VERIFIED',
        evidence_source: 'Microbiology Swab System',
        verified_by: 'usr-3',
        verified_by_name: 'Nurse Clara Barton',
        verified_by_role: 'NURSE',
        verified_at: '2025-04-28 08:32 AM',
        human_confirmed: true,
        updated_at: '2025-04-28 08:32 AM'
      },
      {
        id: 'chk-10001-10',
        patient_id: demoPatientId,
        surgery_id: 'srg-10001',
        template_id: 'tmpl-10',
        name: 'Final Surgical Site Confirmation',
        risk_level: 'CRITICAL',
        required_role: 'SURGEON',
        requires_evidence: true,
        requires_human_confirmation: true,
        phase: 'TIME_OUT',
        phase_label: 'Phase 2: Time-Out (Pre-Incision)',
        rule_explanation: this.templates[9].rule_explanation,
        status: 'PENDING',
        evidence_source: 'Pre-Op Holding Physical Check',
        human_confirmed: false,
        updated_at: '2025-04-28 08:00 AM'
      }
    ];

    this.checklistItems.push(...sureshChecklist);

    // Initial Exception for R. Suresh (Cardiac Clearance)
    const exc1: ExceptionRecord = {
      id: 'exc-101',
      patient_id: demoPatientId,
      patient_name: 'R. Suresh',
      checklist_item_id: 'chk-10001-6',
      checklist_step_name: 'Cardiac Clearance',
      severity: 'CRITICAL',
      category: 'Missing Evidence',
      reason: 'Official pre-operative cardiology clearance document not found in EMR. Patient has previous stent placed in 2021; requires Cardiologist assessment note and Echo report.',
      status: 'OPEN',
      created_by: 'usr-3',
      created_by_name: 'Nurse Clara Barton',
      assigned_role: 'CARDIOLOGIST',
      created_at: '2025-04-28 09:15 AM'
    };
    this.exceptions.push(exc1);

    // Initial Audit Logs for R. Suresh
    this.auditLogs.push(
      {
        id: 'aud-1',
        timestamp: '2025-04-28 08:12 AM',
        event_type: 'EVIDENCE_VERIFIED',
        patient_id: demoPatientId,
        patient_name: 'R. Suresh',
        checklist_step: 'Allergy Review',
        user_id: 'usr-3',
        user_name: 'Nurse Clara Barton',
        user_role: 'NURSE',
        evidence_source: 'Epic EMR Allergy Ledger',
        evidence_id: 'ev-101',
        sha256_hash: ev1.sha256_hash,
        decision: 'VERIFIED',
        details: 'Allergies confirmed absent in electronic record. Verified against secondary patient interview.'
      },
      {
        id: 'aud-2',
        timestamp: '2025-04-28 08:25 AM',
        event_type: 'HUMAN_CONFIRMED',
        patient_id: demoPatientId,
        patient_name: 'R. Suresh',
        checklist_step: 'ASA Classification',
        user_id: 'usr-4',
        user_name: 'Dr. Arthur Pendelton',
        user_role: 'ANESTHETIST',
        evidence_source: 'Anesthesia Pre-Op EMR Assessment',
        evidence_id: 'ev-102',
        sha256_hash: ev2.sha256_hash,
        decision: 'CONFIRMED',
        details: 'Dr. Pendelton verified ASA 3 physical status with airway evaluation score.'
      },
      {
        id: 'aud-3',
        timestamp: '2025-04-28 08:40 AM',
        event_type: 'EVIDENCE_VERIFIED',
        patient_id: demoPatientId,
        patient_name: 'R. Suresh',
        checklist_step: 'Recent Lab Results',
        user_id: 'usr-6',
        user_name: 'Dr. Helena Rostova',
        user_role: 'PATHOLOGIST',
        evidence_source: 'Central Pathology Laboratory System',
        evidence_id: 'ev-103',
        sha256_hash: ev3.sha256_hash,
        decision: 'VERIFIED',
        details: 'CBC and Coagulation verified within normal surgical bounds (Hb 13.2 g/dL).'
      },
      {
        id: 'aud-4',
        timestamp: '2025-04-28 09:15 AM',
        event_type: 'EXCEPTION_CREATED',
        patient_id: demoPatientId,
        patient_name: 'R. Suresh',
        checklist_step: 'Cardiac Clearance',
        user_id: 'usr-3',
        user_name: 'Nurse Clara Barton',
        user_role: 'NURSE',
        decision: 'EXCEPTION_FLAGGED',
        details: 'Exception raised: Missing official cardiology clearance report for CABG candidate.'
      }
    );

    // Initial Notifications
    this.notifications = [
      {
        id: 'notif-1',
        severity: 'CRITICAL',
        title: 'Urgent: Cardiac Clearance Exception Flagged',
        message: 'Patient R. Suresh (P10001) has an active exception for CABG surgery. Official echocardiogram clearance required from Consultant Cardiologist.',
        timestamp: '2025-04-28 09:15 AM',
        role_target: 'CARDIOLOGIST',
        patient_id: 'pat-10001',
        read: false,
        link: '/patients/pat-10001'
      },
      {
        id: 'notif-2',
        severity: 'HIGH',
        title: 'Informed Surgical Consent Verification Required',
        message: 'Patient P10005 scheduled for afternoon theatre requires formal surgeon countersignature on consent form.',
        timestamp: '2025-04-28 08:30 AM',
        role_target: 'SURGEON',
        patient_id: 'pat-10005',
        read: false,
        link: '/patients/pat-10005'
      },
      {
        id: 'notif-3',
        severity: 'PENDING',
        title: 'Blood Availability Crossmatch Reservation',
        message: 'Transfusion unit crossmatched 2 PRBC units for Patient P10002. Pre-op nursing confirmation pending.',
        timestamp: '2025-04-28 08:00 AM',
        role_target: 'NURSE',
        patient_id: 'pat-10002',
        read: false,
        link: '/patients/pat-10002'
      },
      {
        id: 'notif-4',
        severity: 'INFO',
        title: 'Forensic Audit Ledger Integrity Check',
        message: 'Automated cryptographic verification confirmed 100% append-only audit ledger integrity with zero hash collisions.',
        timestamp: '2025-04-28 07:00 AM',
        role_target: 'ALL',
        read: true,
        link: '/audit-log'
      }
    ];

    // 4. Generate 52 Synthetic Patients and Surgeries (Total 53 patients)
    const surgicalTypes = [
      'Cardiac Surgery (CABG / Valve)',
      'Orthopedic (Total Knee Arthroplasty)',
      'Orthopedic (Total Hip Replacement)',
      'General Surgery (Laparoscopic Cholecystectomy)',
      'General Surgery (Hernia Repair)',
      'Neurosurgery (Lumbar Decompression)',
      'Vascular Surgery (Carotid Endarterectomy)',
      'ENT (Tympanoplasty)',
      'Urology (Robot-Assisted Prostatectomy)',
      'Ophthalmology (Phacoemulsification)'
    ];

    const firstNames = [
      'Aarav', 'Ananya', 'Rajesh', 'Pooja', 'Vikram', 'Deepa', 'Sunil', 'Meera', 'Karan', 'Sneha',
      'Amit', 'Geeta', 'Sanjay', 'Lakshmi', 'Rohan', 'Kavita', 'Manoj', 'Divya', 'Arjun', 'Swati',
      'Naveen', 'Anita', 'Harish', 'Preeti', 'Girish', 'Bhavna', 'Ashok', 'Rekha', 'Prakash', 'Shalini',
      'Venkat', 'Suma', 'Dinesh', 'Kalyani', 'Vijay', 'Sandhya', 'Kishore', 'Aparna', 'Mahesh', 'Usha',
      'Nitin', 'Rashmi', 'Pradeep', 'Padma', 'Chetan', 'Roopa', 'Suresh', 'Manjula', 'Gautam', 'Vidya',
      'Alok', 'Sarita'
    ];

    const lastNames = [
      'Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Chatterjee', 'Gupta', 'Verma', 'Kumar', 'Menon',
      'Singh', 'Deshmukh', 'Joshi', 'Bose', 'Pillai', 'Rao', 'Bhat', 'Chopra', 'Malhotra', 'Shetty'
    ];

    for (let i = 2; i <= 53; i++) {
      const pId = `pat-${10000 + i}`;
      const srgId = `srg-${10000 + i}`;
      const code = `P${10000 + i}`;
      const fName = firstNames[(i - 2) % firstNames.length];
      const lName = lastNames[(i * 3) % lastNames.length];
      const fullName = `${fName} ${lName}`;
      const age = 28 + ((i * 7) % 55);
      const gender = (i % 2 === 0) ? 'Male' : 'Female';
      const surgery = surgicalTypes[(i + 3) % surgicalTypes.length];
      const group = (i % 2 === 0) ? 'grp-A' : 'grp-B';

      let risk: RiskLevel = 'LOW';
      if (surgery.includes('Cardiac') || surgery.includes('Neurosurgery') || surgery.includes('Vascular')) {
        risk = (i % 3 === 0) ? 'CRITICAL' : 'HIGH';
      } else if (surgery.includes('Orthopedic') || surgery.includes('Urology')) {
        risk = 'MEDIUM';
      }

      const rand = (i * 17) % 100;
      let status: 'READY' | 'IN_PROGRESS' | 'EXCEPTION' | 'PENDING' = 'IN_PROGRESS';
      if (rand < 35) status = 'READY';
      else if (rand < 75) status = 'IN_PROGRESS';
      else if (rand < 90) status = 'EXCEPTION';
      else status = 'PENDING';

      const scheduledHours = 8 + (i % 8);
      const scheduledMinutes = (i % 4) * 15;
      const timeStr = `${scheduledHours.toString().padStart(2, '0')}:${scheduledMinutes.toString().padStart(2, '0')} ${scheduledHours >= 12 ? 'PM' : 'AM'}`;

      const patientObj: Patient = {
        id: pId,
        patient_id: code,
        name: fullName,
        age,
        gender,
        surgery_type: surgery,
        scheduled_date: `2025-04-${(28 + (i % 4)).toString().padStart(2, '0')} ${timeStr}`,
        risk_level: risk,
        status,
        assigned_team: `${surgery.split(' ')[0]} Care Team ${String.fromCharCode(65 + (i % 4))}`,
        population_group_id: group,
        contact_phone: `+91-98${(10000000 + i * 1739).toString().slice(0, 8)}`,
        allergies: i % 3 === 0 ? ['Penicillin'] : i % 5 === 0 ? ['Latex', 'NSAIDs'] : ['No Known Drug Allergies (NKDA)'],
        medical_history: [
          i % 2 === 0 ? 'Type 2 Diabetes Mellitus' : 'Primary Hypertension',
          i % 4 === 0 ? 'Chronic Kidney Disease Stage II' : 'No Chronic Pulmonary Disease'
        ],
        current_medications: ['Multivitamins QD', i % 2 === 0 ? 'Metformin 500mg' : 'Amlodipine 5mg'],
        risk_indicators: risk === 'CRITICAL' ? ['High procedural complexity', 'Advanced age'] : ['Standard protocol monitored'],
        active_surgery_id: srgId
      };

      this.patients.push(patientObj);

      // Seed Surgery Record
      const surgeryStatus: SurgeryStatus = 
        status === 'READY' ? 'READY' : 
        status === 'EXCEPTION' ? 'EXCEPTION' : 
        status === 'PENDING' ? 'PLANNED' : 'PREPARING';

      this.surgeries.push({
        id: srgId,
        surgery_code: `SRG-2026-${i.toString().padStart(3, '0')}`,
        patient_id: pId,
        patient_name: fullName,
        procedure: surgery,
        surgeon_id: 'usr-2',
        surgeon_name: 'Dr. Marcus Vance (Lead Surgeon)',
        department: `${surgery.split(' ')[0]} Surgery`,
        operating_room: `OR-0${1 + (i % 6)}`,
        scheduled_datetime: patientObj.scheduled_date,
        surgery_type: surgery,
        risk_level: risk,
        status: surgeryStatus,
        checklist_completion_pct: status === 'READY' ? 100 : status === 'EXCEPTION' ? 60 : 40 + (i % 50),
        anesthetist_name: 'Dr. Arthur Pendelton',
        lead_nurse_name: 'Nurse Clara Barton',
        notes: `Standard pre-operative protocol active for ${fullName}.`,
        created_at: '2025-04-20 10:00 AM',
        updated_at: '2025-04-27 14:00'
      });

      // Generate checklist items for this patient
      const itemsForPatient: ChecklistItem[] = this.templates.map((tmpl, idx) => {
        const itemId = `chk-${pId}-${idx + 1}`;
        let itemStatus: ChecklistStatus = 'PENDING';

        if (status === 'READY') {
          itemStatus = 'VERIFIED';
        } else if (status === 'IN_PROGRESS') {
          itemStatus = (idx < 6 + (i % 3)) ? 'VERIFIED' : 'PENDING';
        } else if (status === 'EXCEPTION') {
          if (idx === 5) itemStatus = 'EXCEPTION';
          else if (idx < 5) itemStatus = 'VERIFIED';
          else itemStatus = 'PENDING';
        } else {
          itemStatus = (idx < 3) ? 'VERIFIED' : 'NOT_STARTED';
        }

        const isVerified = itemStatus === 'VERIFIED';
        const evFilename = `${tmpl.name.toLowerCase().replace(/ /g, '_')}_${code}.pdf`;
        const evHash = isVerified ? this.generateSha256(`${evFilename}-${pId}`) : undefined;

        return {
          id: itemId,
          patient_id: pId,
          surgery_id: srgId,
          template_id: tmpl.id,
          name: tmpl.name,
          risk_level: tmpl.risk_level,
          required_role: tmpl.required_role,
          requires_evidence: tmpl.requires_evidence,
          requires_human_confirmation: tmpl.requires_human_confirmation,
          phase: tmpl.phase,
          phase_label: tmpl.phase_label,
          rule_explanation: tmpl.rule_explanation,
          status: itemStatus,
          evidence_source: isVerified ? `${tmpl.name} Source Document` : undefined,
          evidence_id: isVerified ? `ev-${pId}-${idx + 1}` : undefined,
          evidence_filename: isVerified ? evFilename : undefined,
          evidence_sha256: evHash,
          verified_by: isVerified ? 'usr-3' : undefined,
          verified_by_name: isVerified ? 'Nurse Clara Barton' : undefined,
          verified_by_role: isVerified ? 'NURSE' : undefined,
          verified_at: isVerified ? '2025-04-27 14:00' : undefined,
          human_confirmed: isVerified && tmpl.requires_human_confirmation,
          human_confirmed_by: (isVerified && tmpl.requires_human_confirmation) ? 'Dr. Marcus Vance' : undefined,
          human_confirmed_at: (isVerified && tmpl.requires_human_confirmation) ? '2025-04-27 14:30' : undefined,
          updated_at: '2025-04-27 14:30'
        };
      });

      this.checklistItems.push(...itemsForPatient);

      // Add exceptions for exception patients
      if (status === 'EXCEPTION') {
        this.exceptions.push({
          id: `exc-${pId}`,
          patient_id: pId,
          patient_name: fullName,
          checklist_item_id: `chk-${pId}-6`,
          checklist_step_name: 'Cardiac Clearance',
          severity: risk,
          category: (i % 2 === 0) ? 'Missing Evidence' : 'Expired Evidence',
          reason: `Automated rule flag: Pre-operative specialist clearance report incomplete or older than mandated 30-day window for ${fullName}.`,
          status: 'OPEN',
          created_by: 'usr-3',
          created_by_name: 'Nurse Clara Barton',
          assigned_role: 'CARDIOLOGIST',
          created_at: '2025-04-28 07:30 AM'
        });
      }
    }

    // Additional sample Overrides
    this.overrides.push(
      {
        id: 'ovr-1',
        patient_id: 'pat-10008',
        patient_name: 'Ananya Nair',
        checklist_item_id: 'chk-pat-10008-3',
        checklist_step_name: 'Recent Lab Results',
        reason: 'Emergency acute trauma bypass. Urgent operative intervention took precedence over routine coagulation turnaround.',
        business_reason: 'Time-critical trauma life support protocol activated by Chief Surgeon.',
        impact: 'HIGH',
        status: 'APPROVED',
        requested_by: 'usr-2',
        requested_by_name: 'Dr. Marcus Vance',
        requested_by_role: 'SURGEON',
        approved_by: 'usr-1',
        approved_by_name: 'Dr. Evelyn Reed (Chief Medical Officer)',
        approved_by_role: 'ADMIN',
        created_at: '2025-04-27 11:30 AM',
        updated_at: '2025-04-27 11:45 AM'
      },
      {
        id: 'ovr-2',
        patient_id: 'pat-10015',
        patient_name: 'Vikram Joshi',
        checklist_item_id: 'chk-pat-10015-4',
        checklist_step_name: 'Imaging Review',
        reason: 'Outside hospital MRI disc unreadable on internal PACS; film printed physical scans reviewed in person.',
        business_reason: 'Patient transferred with verified external hardcopy radiographs.',
        impact: 'MEDIUM',
        status: 'PENDING',
        requested_by: 'usr-5',
        requested_by_name: 'Dr. Sanjay Patel',
        requested_by_role: 'RADIOLOGIST',
        created_at: '2025-04-28 08:50 AM',
        updated_at: '2025-04-28 08:50 AM'
      }
    );

    // 5. Seed Patient History & Clinical Timeline
    this.seedPatientHistory(demoPatientId);
  }

  // --- SURGERY MANAGEMENT ---
  public getSurgeries(
    user?: { id: string; role: UserRole },
    filters?: { status?: string; risk?: string; search?: string }
  ) {
    let list = [...this.surgeries];

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(s => s.status === filters.status);
    }
    if (filters?.risk && filters.risk !== 'ALL') {
      list = list.filter(s => s.risk_level === filters.risk);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s =>
        s.surgery_code.toLowerCase().includes(q) ||
        s.patient_name.toLowerCase().includes(q) ||
        s.procedure.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.operating_room.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getSurgeryById(id: string) {
    return this.surgeries.find(s => s.id === id || s.surgery_code === id);
  }

  public createSurgery(
    data: Partial<Surgery>,
    user: { id: string; name: string; role: UserRole }
  ): Surgery {
    const nextIdx = this.surgeries.length + 1;
    const srgId = `srg-${Date.now()}`;
    const newSurgery: Surgery = {
      id: srgId,
      surgery_code: `SRG-2026-${nextIdx.toString().padStart(3, '0')}`,
      patient_id: data.patient_id || '',
      patient_name: data.patient_name || 'Assigned Patient',
      procedure: data.procedure || 'Standard Surgical Procedure',
      surgeon_id: user.id,
      surgeon_name: user.name,
      department: data.department || 'General Surgery',
      operating_room: data.operating_room || 'OR-01',
      scheduled_datetime: data.scheduled_datetime || new Date().toISOString(),
      surgery_type: data.surgery_type || 'General Surgery',
      risk_level: data.risk_level || 'MEDIUM',
      status: 'PLANNED',
      checklist_completion_pct: 0,
      anesthetist_name: data.anesthetist_name || 'Dr. Arthur Pendelton',
      lead_nurse_name: data.lead_nurse_name || 'Nurse Clara Barton',
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.surgeries.unshift(newSurgery);

    this.addAuditLog({
      event_type: 'SURGERY_CREATED',
      patient_id: newSurgery.patient_id,
      patient_name: newSurgery.patient_name,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      decision: 'PLANNED',
      details: `New surgery case ${newSurgery.surgery_code} (${newSurgery.procedure}) scheduled by ${user.name}.`
    });

    return newSurgery;
  }

  public updateSurgeryStatus(
    id: string,
    status: SurgeryStatus,
    user: { id: string; name: string; role: UserRole }
  ): Surgery {
    const surgery = this.surgeries.find(s => s.id === id || s.surgery_code === id);
    if (!surgery) throw new Error('Surgery record not found');

    const previousStatus = surgery.status;
    surgery.status = status;
    surgery.updated_at = new Date().toISOString();

    this.addAuditLog({
      event_type: 'SURGERY_UPDATED',
      patient_id: surgery.patient_id,
      patient_name: surgery.patient_name,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      decision: status,
      details: `Surgery ${surgery.surgery_code} status updated from ${previousStatus} to ${status} by ${user.name}.`
    });

    return surgery;
  }

  // --- NOTIFICATION MANAGEMENT ---
  public getNotifications(role?: UserRole) {
    if (!role || role === 'ADMIN' || role === 'AUDITOR') {
      return [...this.notifications];
    }
    return this.notifications.filter(n => !n.role_target || n.role_target === 'ALL' || n.role_target === role);
  }

  public addNotification(entry: Omit<ClinicalNotification, 'id' | 'timestamp' | 'read'>) {
    const notif: ClinicalNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      read: false,
      ...entry
    };
    this.notifications.unshift(notif);
    return notif;
  }

  public markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }

  public markAllNotificationsRead(role?: UserRole) {
    this.notifications.forEach(n => {
      if (!role || n.role_target === 'ALL' || n.role_target === role) {
        n.read = true;
      }
    });
  }

  // --- RISK ASSESSMENT SERVICE ---
  public assessPatientRisk(patientId: string): RiskAssessmentResult {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    if (!patient) throw new Error(`Patient ${patientId} not found`);

    const items = this.checklistItems.filter(i => i.patient_id === patient.id);
    return ClinicalRiskEngine.assessPatientRisk(patient, items);
  }

  // --- PATIENTS SERVICE ---
  public getPatients(
    user?: { id: string; role: UserRole },
    filters?: { search?: string; status?: string; risk?: string; page?: number; limit?: number }
  ) {
    let list = [...this.patients];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.patient_id.toLowerCase().includes(q) ||
        p.surgery_type.toLowerCase().includes(q) ||
        p.assigned_team.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(p => p.status === filters.status);
    }

    if (filters?.risk && filters.risk !== 'ALL') {
      list = list.filter(p => p.risk_level === filters.risk);
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 15;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    const enriched = paginated.map(p => {
      const pItems = this.checklistItems.filter(i => i.patient_id === p.id);
      const verified = pItems.filter(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE').length;
      const progress = pItems.length ? Math.round((verified / pItems.length) * 100) : 0;
      return {
        ...p,
        progress,
        totalItems: pItems.length,
        verifiedItems: verified
      };
    });

    return {
      patients: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  public getPatientById(id: string) {
    const patient = this.patients.find(p => p.id === id || p.patient_id === id);
    if (!patient) return null;

    const checklist = this.checklistItems.filter(i => i.patient_id === patient.id);
    const evidence = this.evidence.filter(e => e.patient_id === patient.id);
    const exceptions = this.exceptions.filter(e => e.patient_id === patient.id);
    const auditLogs = this.auditLogs.filter(a => a.patient_id === patient.id);
    const linkedSurgery = this.surgeries.find(s => s.patient_id === patient.id);
    const clinicalHistory = this.getPatientClinicalHistory(patient.id);
    const vitals = this.getPatientVitalsHistory(patient.id);
    const labs = this.getPatientLabsHistory(patient.id);
    const riskHistory = this.getPatientRiskHistory(patient.id);
    const checklistHistory = this.getPatientChecklistHistory(patient.id);
    const historySummary = this.getPatientHistory(patient.id).summary;

    return {
      ...patient,
      surgery: linkedSurgery,
      checklist,
      evidence,
      exceptions,
      auditLogs,
      clinicalHistory,
      vitals,
      labs,
      riskHistory,
      checklistHistory,
      historySummary
    };
  }

  // --- PATIENT HISTORY & CLINICAL TIMELINE METHODS ---
  public getPatientClinicalHistory(patientId: string): ClinicalHistoryEntry[] {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    const pId = patient ? patient.id : patientId;
    return this.clinicalHistories.get(pId) || [];
  }

  public getPatientVitalsHistory(patientId: string): VitalRecord[] {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    const pId = patient ? patient.id : patientId;
    return this.vitalsHistory.get(pId) || [];
  }

  public getPatientLabsHistory(patientId: string): LabResultRecord[] {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    const pId = patient ? patient.id : patientId;
    return this.labsHistory.get(pId) || [];
  }

  public getPatientRiskHistory(patientId: string): RiskHistoryRecord[] {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    const pId = patient ? patient.id : patientId;
    return this.riskHistory.get(pId) || [];
  }

  public getPatientChecklistHistory(patientId: string): ChecklistHistoryRecord[] {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    const pId = patient ? patient.id : patientId;
    return this.checklistHistory.get(pId) || [];
  }

  public addPatientActivityEvent(event: Omit<PatientActivityEvent, 'id'>): PatientActivityEvent {
    const pId = event.patient_id;
    if (!this.patientActivityEvents.has(pId)) {
      this.patientActivityEvents.set(pId, []);
    }
    const newEvent: PatientActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    this.patientActivityEvents.get(pId)!.unshift(newEvent);
    return newEvent;
  }

  public getPatientHistory(
    patientId: string,
    filters?: { range?: string; type?: string; role?: string; status?: string; search?: string }
  ): PatientHistoryResponse {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    const pId = patient ? patient.id : patientId;
    const patientName = patient ? patient.name : 'Unknown Patient';

    let events = [...(this.patientActivityEvents.get(pId) || [])];

    // Fallback: If no custom events were seeded for this patient, auto-generate from audit logs
    if (events.length === 0 && patient) {
      const logs = this.auditLogs.filter(a => a.patient_id === pId);
      events = logs.map((log, idx) => ({
        id: `act-auto-${idx}`,
        patient_id: pId,
        timestamp: log.timestamp,
        formatted_time: log.timestamp.includes(' ') ? log.timestamp.split(' ').slice(1).join(' ') : '09:00 AM',
        exact_datetime: log.timestamp,
        relative_day_group: (idx === 0 ? 'TODAY' : idx === 1 ? 'YESTERDAY' : '3_DAYS_AGO') as HistoryRelativeDayGroup,
        relative_day_label: idx === 0 ? 'Today' : idx === 1 ? 'Yesterday' : '3 Days Ago',
        event_type: (log.event_type.includes('CHECKLIST') ? 'CHECKLIST' : log.event_type.includes('EVIDENCE') ? 'EVIDENCE' : log.event_type.includes('EXCEPTION') ? 'EXCEPTION' : 'PATIENT') as PatientActivityEventType,
        title: log.event_type.replace(/_/g, ' '),
        short_description: log.details || 'Clinical system event recorded',
        performed_by: log.user_name,
        user_role: log.user_role,
        status: 'COMPLETED' as const,
        related_record: { type: log.event_type, id: log.id, name: log.checklist_step },
        comment: log.details,
        badge_color: 'bg-blue-100 text-blue-800 border-blue-300'
      }));
    }

    // Filter by Date Range
    if (filters?.range && filters.range !== 'ALL') {
      const r = filters.range.toLowerCase();
      if (r === 'today') {
        events = events.filter(e => e.relative_day_group === 'TODAY');
      } else if (r === '7d' || r === '7 days' || r === 'last 7 days') {
        events = events.filter(e => e.relative_day_group !== '7_PLUS_DAYS_AGO');
      }
    }

    // Filter by Event Type
    if (filters?.type && filters.type !== 'ALL') {
      events = events.filter(e => e.event_type === filters.type);
    }

    // Filter by User Role
    if (filters?.role && filters.role !== 'ALL') {
      events = events.filter(e => e.user_role === filters.role);
    }

    // Filter by Status
    if (filters?.status && filters.status !== 'ALL') {
      events = events.filter(e => e.status === filters.status);
    }

    // Filter by Search Query
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.short_description.toLowerCase().includes(q) ||
        e.performed_by.toLowerCase().includes(q) ||
        e.user_role.toLowerCase().includes(q) ||
        (e.comment && e.comment.toLowerCase().includes(q)) ||
        (e.related_record?.name && e.related_record.name.toLowerCase().includes(q))
      );
    }

    // Group timeline by relative day
    const grouped_timeline: Record<string, PatientActivityEvent[]> = {};
    for (const ev of events) {
      const groupKey = ev.relative_day_label || 'Earlier';
      if (!grouped_timeline[groupKey]) {
        grouped_timeline[groupKey] = [];
      }
      grouped_timeline[groupKey].push(ev);
    }

    // Compute Summary Stats
    const allPatientEvents = this.patientActivityEvents.get(pId) || events;
    const summary: PatientHistorySummary = {
      totalEvents: allPatientEvents.length,
      last7DaysCount: allPatientEvents.filter(e => e.relative_day_group !== '7_PLUS_DAYS_AGO').length,
      openExceptionsCount: this.exceptions.filter(e => e.patient_id === pId && (e.status === 'OPEN' || e.status === 'UNDER_REVIEW')).length,
      evidenceAddedCount: allPatientEvents.filter(e => e.event_type === 'EVIDENCE').length,
      evidenceVerifiedCount: allPatientEvents.filter(e => e.event_type === 'EVIDENCE' && e.status === 'VERIFIED').length,
      riskChangesCount: allPatientEvents.filter(e => e.event_type === 'RISK_ASSESSMENT').length,
      checklistUpdatesCount: allPatientEvents.filter(e => e.event_type === 'CHECKLIST').length,
      approvalsCount: allPatientEvents.filter(e => e.event_type === 'APPROVAL' || e.status === 'VERIFIED').length
    };

    return {
      patient_id: pId,
      patient_name: patientName,
      summary,
      timeline: events,
      grouped_timeline
    };
  }

  public exportPatientHistoryCsv(patientId: string): string {
    const history = this.getPatientHistory(patientId);
    const headers = ['Event ID', 'Relative Day', 'Exact Timestamp', 'Event Type', 'Title', 'Performer', 'Role', 'Status', 'Details', 'Comment'];
    const rows = history.timeline.map(e => [
      `"${e.id}"`,
      `"${e.relative_day_label}"`,
      `"${e.exact_datetime}"`,
      `"${e.event_type}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.performed_by.replace(/"/g, '""')}"`,
      `"${e.user_role}"`,
      `"${e.status}"`,
      `"${e.short_description.replace(/"/g, '""')}"`,
      `"${(e.comment || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private seedPatientHistory(demoPatientId: string) {
    // 1. Clinical History (Medical History by Year)
    this.clinicalHistories.set(demoPatientId, [
      {
        id: 'clh-1',
        patient_id: demoPatientId,
        year: '2023',
        date_approx: '14 August 2023',
        category: 'DIAGNOSIS',
        title: 'Essential Systemic Hypertension',
        description: 'Diagnosed during executive health screening. Resting BP: 156/94 mmHg. Baseline ECG was normal.',
        facility: 'Metropolitan Outpatient Clinic',
        status: 'CHRONIC'
      },
      {
        id: 'clh-2',
        patient_id: demoPatientId,
        year: '2023',
        date_approx: '18 August 2023',
        category: 'MEDICATION',
        title: 'Anti-Hypertensive Therapy Initiated',
        description: 'Initiated on Metoprolol Succinate 25mg QD with lifestyle counseling and salt restriction.',
        facility: 'Metropolitan Cardiology Care',
        status: 'ONGOING'
      },
      {
        id: 'clh-3',
        patient_id: demoPatientId,
        year: '2024',
        date_approx: '12 March 2024',
        category: 'SURGERY',
        title: 'Elective Right Inguinal Hernioplasty',
        description: 'Laparoscopic right mesh hernioplasty performed under general anesthesia. Extubation uneventful, zero wound complications, discharged on post-op day 1.',
        facility: 'City Central Surgical Center',
        complications: 'None',
        status: 'RESOLVED'
      },
      {
        id: 'clh-4',
        patient_id: demoPatientId,
        year: '2024',
        date_approx: '10 March 2024',
        category: 'ALLERGY',
        title: 'Penicillin Drug Reaction Documented',
        description: 'Patient developed pruritic maculopapular rash following oral Amoxicillin course; verified and flagged as drug allergy.',
        facility: 'City Central Surgical Center',
        status: 'ACTIVE'
      },
      {
        id: 'clh-5',
        patient_id: demoPatientId,
        year: '2025',
        date_approx: '05 January 2025',
        category: 'DIAGNOSIS',
        title: 'Type 2 Diabetes Mellitus',
        description: 'Fasting Blood Sugar: 168 mg/dL, HbA1c: 7.9%. Prescribed Metformin 500mg BID and dietary glycemic regulation.',
        facility: 'Endocrinology Center of Excellence',
        status: 'CHRONIC'
      },
      {
        id: 'clh-6',
        patient_id: demoPatientId,
        year: '2025',
        date_approx: '19 November 2025',
        category: 'HOSPITALIZATION',
        title: 'Exertional Angina Observation (CCS Class III)',
        description: 'Admitted for 24-hr cardiac telemetry monitoring following exertional retrosternal tightness. Troponin-I negative. Echo showed LVEF 40% with anterior hypokinesia.',
        facility: 'Metropolitan Heart Institute - Acute Care',
        complications: 'Transient exertional ischemia',
        status: 'EVALUATED'
      },
      {
        id: 'clh-7',
        patient_id: demoPatientId,
        year: '2026',
        date_approx: '15 April 2026',
        category: 'INVESTIGATION',
        title: 'Diagnostic Coronary Angiogram',
        description: 'Confirmed Triple-Vessel Coronary Artery Disease: LAD 85% proximal stenosis, RCA 90% mid stenosis, LCx 75% distal stenosis. Syntax score: 29. Recommended for surgical revascularization (CABG).',
        facility: 'Metropolitan Cath Lab Suite 2',
        status: 'CONFIRMED'
      },
      {
        id: 'clh-8',
        patient_id: demoPatientId,
        year: '2026',
        date_approx: '20 April 2026',
        category: 'SURGERY',
        title: 'Current Surgical Admission: CABG x 3',
        description: 'Admitted for Pre-Operative surgical safety clearance, anesthesia risk optimization, and elective triple vessel coronary bypass grafting.',
        facility: 'Metropolitan Surgical Center of Excellence - OR Suite 4',
        status: 'PRE_OPERATIVE'
      }
    ]);

    // 2. Vitals History (7 Days)
    this.vitalsHistory.set(demoPatientId, [
      {
        id: 'vit-1',
        patient_id: demoPatientId,
        timestamp: '6 Days Ago, 11:30 AM',
        relative_day: '6 Days Ago',
        blood_pressure_systolic: 142,
        blood_pressure_diastolic: 88,
        heart_rate: 78,
        respiratory_rate: 16,
        temperature_celsius: 36.8,
        spo2_percent: 98,
        recorded_by: 'Nurse Clara Barton',
        notes: 'Initial admission baseline vital signs in pre-op ward'
      },
      {
        id: 'vit-2',
        patient_id: demoPatientId,
        timestamp: '5 Days Ago, 09:00 AM',
        relative_day: '5 Days Ago',
        blood_pressure_systolic: 138,
        blood_pressure_diastolic: 86,
        heart_rate: 76,
        respiratory_rate: 16,
        temperature_celsius: 36.7,
        spo2_percent: 98,
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'vit-3',
        patient_id: demoPatientId,
        timestamp: '4 Days Ago, 10:00 AM',
        relative_day: '4 Days Ago',
        blood_pressure_systolic: 140,
        blood_pressure_diastolic: 84,
        heart_rate: 74,
        respiratory_rate: 18,
        temperature_celsius: 36.9,
        spo2_percent: 97,
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'vit-4',
        patient_id: demoPatientId,
        timestamp: '3 Days Ago, 08:30 AM',
        relative_day: '3 Days Ago',
        blood_pressure_systolic: 136,
        blood_pressure_diastolic: 82,
        heart_rate: 72,
        respiratory_rate: 16,
        temperature_celsius: 36.6,
        spo2_percent: 98,
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'vit-5',
        patient_id: demoPatientId,
        timestamp: '2 Days Ago, 03:00 PM',
        relative_day: '2 Days Ago',
        blood_pressure_systolic: 148,
        blood_pressure_diastolic: 92,
        heart_rate: 82,
        respiratory_rate: 20,
        temperature_celsius: 37.1,
        spo2_percent: 96,
        recorded_by: 'Nurse Clara Barton',
        notes: 'Mild hypertension during exception logging, resolved with rest'
      },
      {
        id: 'vit-6',
        patient_id: demoPatientId,
        timestamp: 'Yesterday, 09:15 AM',
        relative_day: 'Yesterday',
        blood_pressure_systolic: 134,
        blood_pressure_diastolic: 80,
        heart_rate: 70,
        respiratory_rate: 16,
        temperature_celsius: 36.6,
        spo2_percent: 98,
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'vit-7',
        patient_id: demoPatientId,
        timestamp: 'Today, 08:00 AM',
        relative_day: 'Today',
        blood_pressure_systolic: 132,
        blood_pressure_diastolic: 78,
        heart_rate: 68,
        respiratory_rate: 16,
        temperature_celsius: 36.5,
        spo2_percent: 99,
        recorded_by: 'Nurse Clara Barton',
        notes: 'Pre-operative morning baseline stable'
      }
    ]);

    // 3. Lab Results History (7 Days)
    this.labsHistory.set(demoPatientId, [
      {
        id: 'lab-1',
        patient_id: demoPatientId,
        timestamp: '6 Days Ago, 12:00 PM',
        relative_day: '6 Days Ago',
        hemoglobin_g_dl: 11.2,
        wbc_count_k_ul: 7.2,
        platelets_k_ul: 245,
        glucose_mg_dl: 142,
        creatinine_mg_dl: 1.05,
        inr_coagulation: 1.02,
        potassium_mmol_l: 4.2,
        sodium_mmol_l: 139,
        lab_technician: 'Dr. Helena Rostova (Pathologist)',
        status: 'NORMAL'
      },
      {
        id: 'lab-2',
        patient_id: demoPatientId,
        timestamp: '5 Days Ago, 02:40 PM',
        relative_day: '5 Days Ago',
        hemoglobin_g_dl: 10.8,
        wbc_count_k_ul: 7.5,
        platelets_k_ul: 238,
        glucose_mg_dl: 138,
        creatinine_mg_dl: 1.08,
        inr_coagulation: 1.04,
        potassium_mmol_l: 4.3,
        sodium_mmol_l: 140,
        lab_technician: 'Dr. Helena Rostova (Pathologist)',
        status: 'NORMAL'
      },
      {
        id: 'lab-3',
        patient_id: demoPatientId,
        timestamp: '3 Days Ago, 09:30 AM',
        relative_day: '3 Days Ago',
        hemoglobin_g_dl: 10.5,
        wbc_count_k_ul: 7.8,
        platelets_k_ul: 230,
        glucose_mg_dl: 135,
        creatinine_mg_dl: 1.10,
        inr_coagulation: 1.03,
        potassium_mmol_l: 4.1,
        sodium_mmol_l: 138,
        lab_technician: 'Dr. Helena Rostova (Pathologist)',
        status: 'NORMAL'
      },
      {
        id: 'lab-4',
        patient_id: demoPatientId,
        timestamp: 'Today, 07:30 AM',
        relative_day: 'Today',
        hemoglobin_g_dl: 10.2,
        wbc_count_k_ul: 7.4,
        platelets_k_ul: 225,
        glucose_mg_dl: 130,
        creatinine_mg_dl: 1.12,
        inr_coagulation: 1.05,
        potassium_mmol_l: 4.4,
        sodium_mmol_l: 139,
        lab_technician: 'Dr. Helena Rostova (Pathologist)',
        status: 'EVALUATION'
      }
    ]);

    // 4. Risk History Trajectory
    this.riskHistory.set(demoPatientId, [
      {
        id: 'rsk-1',
        patient_id: demoPatientId,
        timestamp: '7 Days Ago, 10:00 AM',
        relative_day: '7 Days Ago',
        previous_risk_level: 'LOW',
        new_risk_level: 'LOW',
        previous_score: 20,
        new_score: 23,
        contributing_factors: ['Age factor: 56 yrs (+14)', 'Baseline general surgical index (+9)'],
        model_version: 'v2.4.1-clinical',
        reviewer_name: 'Dr. Evelyn Reed (Chief Medical Officer)',
        reviewer_role: 'ADMIN',
        reason: 'Initial surgical registration intake assessment',
        explanation: 'Low baseline score prior to full cardiothoracic specialty evaluation.'
      },
      {
        id: 'rsk-2',
        patient_id: demoPatientId,
        timestamp: '3 Days Ago, 11:00 AM',
        relative_day: '3 Days Ago',
        previous_risk_level: 'LOW',
        new_risk_level: 'MEDIUM',
        previous_score: 23,
        new_score: 44,
        contributing_factors: ['Age factor: 56 yrs (+14)', 'Cardiac surgery procedure acuity (+25)', 'Documented drug allergy (+5)'],
        model_version: 'v2.4.1-clinical',
        reviewer_name: 'Dr. Arthur Pendelton',
        reviewer_role: 'ANESTHETIST',
        reason: 'Surgical acuity updated to CABG procedure',
        explanation: 'Transitioned from LOW to MEDIUM risk due to high procedural complexity.'
      },
      {
        id: 'rsk-3',
        patient_id: demoPatientId,
        timestamp: 'Yesterday, 04:45 PM',
        relative_day: 'Yesterday',
        previous_risk_level: 'MEDIUM',
        new_risk_level: 'MEDIUM',
        previous_score: 44,
        new_score: 48,
        contributing_factors: ['Procedural Acuity (+25)', 'Age (+14)', 'Allergies (+5)', 'LVEF 40% systolic impairment (+4)'],
        model_version: 'v2.4.1-clinical',
        reviewer_name: 'Dr. Marcus Vance',
        reviewer_role: 'SURGEON',
        reason: 'Echocardiogram LVEF finding incorporated into clinical model',
        explanation: 'Mild risk elevation as reduced left ventricular ejection fraction was quantified.'
      },
      {
        id: 'rsk-4',
        patient_id: demoPatientId,
        timestamp: 'Today, 09:45 AM',
        relative_day: 'Today',
        previous_risk_level: 'MEDIUM',
        new_risk_level: 'HIGH',
        previous_score: 48,
        new_score: 72,
        contributing_factors: ['Active Cardiac Clearance Exception (+18)', 'High Acuity CABG (+25)', 'Age (+14)', 'Drug Allergies (+5)', 'Cardiac LVEF Impairment (+10)'],
        model_version: 'v2.4.1-clinical',
        reviewer_name: 'Dr. Evelyn Reed (Chief Medical Officer)',
        reviewer_role: 'ADMIN',
        reason: 'Active Cardiac Clearance Exception gating pre-op readiness',
        explanation: 'Critical risk gate triggered: Missing formal specialist cardiologist attestation.'
      }
    ]);

    // 5. Checklist History (Progress over time)
    this.checklistHistory.set(demoPatientId, [
      {
        id: 'chkh-1',
        patient_id: demoPatientId,
        timestamp: '6 Days Ago',
        relative_day: 'Day 1 (6 Days Ago)',
        completion_percentage: 25,
        items_completed: 2,
        items_total: 10,
        changed_items: ['Patient Identity Verified', 'Informed Surgical Consent Initialized'],
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'chkh-2',
        patient_id: demoPatientId,
        timestamp: '5 Days Ago',
        relative_day: 'Day 2 (5 Days Ago)',
        completion_percentage: 40,
        items_completed: 4,
        items_total: 10,
        changed_items: ['Allergy Review Verified', 'Baseline Blood Panel Uploaded'],
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'chkh-3',
        patient_id: demoPatientId,
        timestamp: '4 Days Ago',
        relative_day: 'Day 3 (4 Days Ago)',
        completion_percentage: 60,
        items_completed: 6,
        items_total: 10,
        changed_items: ['Chest X-Ray Imaging Attached', 'ASA Classification Assessed'],
        recorded_by: 'Dr. Arthur Pendelton'
      },
      {
        id: 'chkh-4',
        patient_id: demoPatientId,
        timestamp: 'Yesterday',
        relative_day: 'Day 4 (Yesterday)',
        completion_percentage: 75,
        items_completed: 7,
        items_total: 10,
        changed_items: ['Blood Bank Crossmatch Confirmed', 'Infection Screening Cleared'],
        recorded_by: 'Nurse Clara Barton'
      },
      {
        id: 'chkh-5',
        patient_id: demoPatientId,
        timestamp: 'Today',
        relative_day: 'Today',
        completion_percentage: 87,
        items_completed: 8,
        items_total: 10,
        changed_items: ['Cardiology ECG Evidence Attached', 'Specialist Sign-off in Progress'],
        recorded_by: 'Dr. Kenneth Chen (Cardiologist)'
      }
    ]);

    // 6. 7-Day Vertical Activity Timeline Events
    this.patientActivityEvents.set(demoPatientId, [
      {
        id: 'act-1',
        patient_id: demoPatientId,
        timestamp: 'Today, 09:45 AM',
        formatted_time: '09:45 AM',
        exact_datetime: '23 September 2026, 09:45 AM',
        relative_day_group: 'TODAY',
        relative_day_label: 'Today',
        event_type: 'RISK_ASSESSMENT',
        title: 'Risk Assessment Updated',
        short_description: 'Risk score recalculated: MEDIUM (48) → HIGH (72)',
        performed_by: 'Dr. Evelyn Reed (Chief Medical Officer)',
        user_role: 'ADMIN',
        status: 'COMPLETED',
        related_record: { type: 'RISK_MODEL', id: 'risk-mod-v2' },
        comment: 'Recalculated by Clinical Decision Support Engine. Active specialist exception gating pre-op status.',
        icon_type: 'AlertTriangle',
        badge_color: 'bg-rose-100 text-rose-800 border-rose-300'
      },
      {
        id: 'act-2',
        patient_id: demoPatientId,
        timestamp: 'Today, 08:20 AM',
        formatted_time: '08:20 AM',
        exact_datetime: '23 September 2026, 08:20 AM',
        relative_day_group: 'TODAY',
        relative_day_label: 'Today',
        event_type: 'EVIDENCE',
        title: 'Cardiology Evidence Verified',
        short_description: '12-Lead ECG Report & Echo Summary verified by Cardiologist',
        performed_by: 'Dr. Kenneth Chen',
        user_role: 'CARDIOLOGIST',
        status: 'VERIFIED',
        related_record: { type: 'EVIDENCE', id: 'ev-106', name: '12_lead_ecg_cardiac_clearance_P10001.pdf' },
        comment: 'Sinus rhythm confirmed, anterior Q-waves consistent with CAD. Formal clearance note attached.',
        icon_type: 'CheckCircle2',
        badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      },
      {
        id: 'act-3',
        patient_id: demoPatientId,
        timestamp: 'Yesterday, 04:30 PM',
        formatted_time: '04:30 PM',
        exact_datetime: '22 September 2026, 04:30 PM',
        relative_day_group: 'YESTERDAY',
        relative_day_label: 'Yesterday',
        event_type: 'CHECKLIST',
        title: 'Checklist Updated',
        short_description: 'Pre-operative checklist progress reached 75%',
        performed_by: 'Nurse Clara Barton',
        user_role: 'NURSE',
        status: 'COMPLETED',
        related_record: { type: 'CHECKLIST', id: 'chk-10001-8', name: 'Blood Availability' },
        comment: 'Blood availability verified: 2 units packed RBCs reserved and cross-matched in blood bank.',
        icon_type: 'ClipboardCheck',
        badge_color: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      {
        id: 'act-4',
        patient_id: demoPatientId,
        timestamp: 'Yesterday, 11:10 AM',
        formatted_time: '11:10 AM',
        exact_datetime: '22 September 2026, 11:10 AM',
        relative_day_group: 'YESTERDAY',
        relative_day_label: 'Yesterday',
        event_type: 'EVIDENCE',
        title: 'Laboratory Result Added',
        short_description: 'Hemoglobin: 10.2 g/dL, Platelets: 225 k/uL, INR: 1.05',
        performed_by: 'Dr. Helena Rostova',
        user_role: 'PATHOLOGIST',
        status: 'VERIFIED',
        related_record: { type: 'EVIDENCE', id: 'ev-103', name: 'pre_op_coagulation_panel_P10001.pdf' },
        comment: 'Pre-operative coagulation parameters within acceptable surgical tolerance.',
        icon_type: 'FileText',
        badge_color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
      },
      {
        id: 'act-5',
        patient_id: demoPatientId,
        timestamp: '2 Days Ago, 03:15 PM',
        formatted_time: '03:15 PM',
        exact_datetime: '21 September 2026, 03:15 PM',
        relative_day_group: '2_DAYS_AGO',
        relative_day_label: '2 Days Ago',
        event_type: 'EXCEPTION',
        title: 'Exception Created',
        short_description: 'Missing specialist cardiac clearance document',
        performed_by: 'Dr. Marcus Vance (Lead Surgeon)',
        user_role: 'SURGEON',
        status: 'ESCALATED',
        related_record: { type: 'EXCEPTION', id: 'exc-101', name: 'Cardiac Clearance Missing' },
        comment: 'Assigned to Dr. Kenneth Chen (Cardiologist) for formal consultation attestation.',
        icon_type: 'AlertTriangle',
        badge_color: 'bg-amber-100 text-amber-800 border-amber-300'
      },
      {
        id: 'act-6',
        patient_id: demoPatientId,
        timestamp: '3 Days Ago, 10:30 AM',
        formatted_time: '10:30 AM',
        exact_datetime: '20 September 2026, 10:30 AM',
        relative_day_group: '3_DAYS_AGO',
        relative_day_label: '3 Days Ago',
        event_type: 'PATIENT',
        title: 'Patient Profile Reviewed',
        short_description: 'Pre-operative surgical workup reviewed by Chief Surgeon',
        performed_by: 'Dr. Marcus Vance (Lead Surgeon)',
        user_role: 'SURGEON',
        status: 'COMPLETED',
        related_record: { type: 'PATIENT', id: demoPatientId },
        comment: 'Indicated for CABG x 3. Angiogram films reviewed. Pre-op anesthesia workup requested.',
        icon_type: 'UserCheck',
        badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      },
      {
        id: 'act-7',
        patient_id: demoPatientId,
        timestamp: '4 Days Ago, 09:15 AM',
        formatted_time: '09:15 AM',
        exact_datetime: '19 September 2026, 09:15 AM',
        relative_day_group: '4_DAYS_AGO',
        relative_day_label: '4 Days Ago',
        event_type: 'SURGERY',
        title: 'Surgery Scheduled',
        short_description: 'Procedure: CABG x 3 scheduled in OR-04',
        performed_by: 'Dr. Evelyn Reed (Chief Medical Officer)',
        user_role: 'ADMIN',
        status: 'COMPLETED',
        related_record: { type: 'SURGERY', id: 'srg-10001' },
        comment: 'Theatre allocated: OR-04 (Cardiothoracic Suite). Lead Surgeon: Dr. Vance.',
        icon_type: 'Activity',
        badge_color: 'bg-cyan-100 text-cyan-800 border-cyan-300'
      },
      {
        id: 'act-8',
        patient_id: demoPatientId,
        timestamp: '5 Days Ago, 02:40 PM',
        formatted_time: '02:40 PM',
        exact_datetime: '18 September 2026, 02:40 PM',
        relative_day_group: '5_DAYS_AGO',
        relative_day_label: '5 Days Ago',
        event_type: 'EVIDENCE',
        title: 'Evidence Uploaded',
        short_description: 'Baseline blood test report uploaded to evidence repository',
        performed_by: 'Nurse Clara Barton',
        user_role: 'NURSE',
        status: 'COMPLETED',
        related_record: { type: 'EVIDENCE', id: 'ev-101', name: 'allergy_confirmation_epic_emr_P10001.pdf' },
        comment: 'SHA-256 cryptographic hash generated and locked in compliance ledger.',
        icon_type: 'UploadCloud',
        badge_color: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      {
        id: 'act-9',
        patient_id: demoPatientId,
        timestamp: '6 Days Ago, 11:00 AM',
        formatted_time: '11:00 AM',
        exact_datetime: '17 September 2026, 11:00 AM',
        relative_day_group: '6_DAYS_AGO',
        relative_day_label: '6 Days Ago',
        event_type: 'PATIENT',
        title: 'Patient Registered',
        short_description: 'Patient R. Suresh (P10001) registered into Surgical Safety OS',
        performed_by: 'Nurse Clara Barton',
        user_role: 'NURSE',
        status: 'COMPLETED',
        related_record: { type: 'PATIENT', id: demoPatientId },
        comment: 'Initial demographic intake, contact verification, and allergy screening recorded.',
        icon_type: 'UserCheck',
        badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      }
    ]);
  }

  // --- CHECKLIST & EVIDENCE ATTACHMENT ---
  public attachEvidence(data: {
    patient_id: string;
    checklist_item_id: string;
    evidence_type: EvidenceRecord['evidence_type'];
    source: string;
    filename: string;
    file_size?: string;
    notes?: string;
    user: { id: string; name: string; role: UserRole };
  }) {
    const item = this.checklistItems.find(i => i.id === data.checklist_item_id);
    if (!item) throw new Error('Checklist item not found');

    const patient = this.patients.find(p => p.id === data.patient_id);
    const sha256_hash = this.generateSha256(`${data.filename}-${Date.now()}-${data.patient_id}`);

    const newEvidence: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      patient_id: data.patient_id,
      checklist_item_id: data.checklist_item_id,
      checklist_step_name: item.name,
      evidence_type: data.evidence_type,
      source: data.source,
      filename: data.filename,
      file_url: `/mock-files/${data.filename}`,
      file_size: data.file_size || '350 KB',
      sha256_hash,
      uploaded_by: data.user.id,
      uploaded_by_name: data.user.name,
      uploaded_by_role: data.user.role,
      uploaded_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      verification_status: 'VERIFIED',
      notes: data.notes
    };

    this.evidence.unshift(newEvidence);

    // Update checklist item with evidence attachment
    item.evidence_id = newEvidence.id;
    item.evidence_filename = newEvidence.filename;
    item.evidence_source = newEvidence.source;
    item.evidence_url = newEvidence.file_url;
    item.evidence_sha256 = newEvidence.sha256_hash;
    item.updated_at = new Date().toISOString();

    // If item was blocked by missing evidence, transition it to PENDING
    if (item.status === 'EXCEPTION' && item.exception_id) {
      const exc = this.exceptions.find(e => e.id === item.exception_id);
      if (exc && exc.category === 'Missing Evidence') {
        exc.status = 'RESOLVED';
        exc.resolved_by = data.user.name;
        exc.resolution_notes = `Evidence attached: ${data.filename} (SHA-256: ${sha256_hash.substring(0, 10)}...)`;
        exc.resolved_at = new Date().toISOString();
        item.status = 'PENDING';
      }
    }

    this.addAuditLog({
      event_type: 'EVIDENCE_UPLOADED',
      patient_id: data.patient_id,
      patient_name: patient?.name,
      checklist_step: item.name,
      user_id: data.user.id,
      user_name: data.user.name,
      user_role: data.user.role,
      evidence_source: data.source,
      evidence_id: newEvidence.id,
      sha256_hash,
      decision: 'ATTACHED',
      details: `Synthetic evidence document "${data.filename}" attached. SHA-256 integrity hash: ${sha256_hash}.`
    });

    this.addPatientActivityEvent({
      patient_id: data.patient_id,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      formatted_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      exact_datetime: new Date().toLocaleString(),
      relative_day_group: 'TODAY',
      relative_day_label: 'Today',
      event_type: 'EVIDENCE',
      title: 'Evidence Uploaded',
      short_description: `Uploaded "${data.filename}" (${data.evidence_type})`,
      performed_by: data.user.name,
      user_role: data.user.role,
      status: 'COMPLETED',
      related_record: { type: 'EVIDENCE', id: newEvidence.id, name: newEvidence.filename },
      comment: data.notes || `SHA-256 cryptographic hash: ${sha256_hash.substring(0, 16)}...`,
      icon_type: 'UploadCloud',
      badge_color: 'bg-blue-100 text-blue-800 border-blue-300'
    });

    return newEvidence;
  }

  public getChecklistByPatient(patientId: string): ChecklistItem[] {
    return this.checklistItems.filter(i => i.patient_id === patientId);
  }

  // --- DIRECT VERIFICATION ---
  public verifyChecklistItem(
    itemId: string,
    user: { id: string; name: string; role: UserRole },
    notes?: string
  ) {
    const item = this.checklistItems.find(i => i.id === itemId);
    if (!item) throw new Error('Checklist item not found');

    // Rule: Role gating check
    if (user.role !== 'ADMIN' && user.role !== item.required_role) {
      throw new Error(`Role Mismatch: ${item.name} requires verification by ${item.required_role}. You are logged in as ${user.role}.`);
    }

    // Rule: Evidence requirement check
    if (this.systemSettings.preventVerificationWithoutEvidence && item.requires_evidence && !item.evidence_id) {
      throw new Error(`Evidence Required: You cannot certify ${item.name} without attaching verified clinical evidence first.`);
    }

    item.status = 'VERIFIED';
    item.verified_by = user.id;
    item.verified_by_name = user.name;
    item.verified_by_role = user.role;
    item.verified_at = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0];
    item.updated_at = new Date().toISOString();

    const patient = this.patients.find(p => p.id === item.patient_id);
    this.recalculatePatientStatus(item.patient_id);

    this.addAuditLog({
      event_type: 'EVIDENCE_VERIFIED',
      patient_id: item.patient_id,
      patient_name: patient?.name,
      checklist_step: item.name,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      evidence_source: item.evidence_source,
      evidence_id: item.evidence_id,
      sha256_hash: item.evidence_sha256,
      decision: 'VERIFIED',
      details: `Checklist step "${item.name}" certified by ${user.name} (${user.role}). Notes: ${notes || 'Standard protocol verification'}.`
    });

    this.addPatientActivityEvent({
      patient_id: item.patient_id,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      formatted_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      exact_datetime: new Date().toLocaleString(),
      relative_day_group: 'TODAY',
      relative_day_label: 'Today',
      event_type: 'CHECKLIST',
      title: 'Checklist Step Verified',
      short_description: `Certified step "${item.name}"`,
      performed_by: user.name,
      user_role: user.role,
      status: 'VERIFIED',
      related_record: { type: 'CHECKLIST', id: item.id, name: item.name },
      comment: notes || 'Verified in compliance with clinical surgical safety policy.',
      icon_type: 'CheckCircle2',
      badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    });

    return item;
  }

  // --- HUMAN CONFIRMATION SIGN-OFF ---
  public confirmHumanReview(data: {
    checklist_item_id: string;
    evidence_id?: string;
    decision: 'APPROVED' | 'REJECTED';
    comment: string;
    user: { id: string; name: string; role: UserRole };
  }) {
    const item = this.checklistItems.find(i => i.id === data.checklist_item_id);
    if (!item) throw new Error('Checklist item not found');

    if (data.user.role !== 'ADMIN' && data.user.role !== item.required_role) {
      throw new Error(`Role Mismatch: Confirmation requires ${item.required_role}. Logged in as ${data.user.role}.`);
    }

    const conf: ConfirmationRecord = {
      id: `conf-${Date.now()}`,
      checklist_item_id: data.checklist_item_id,
      evidence_id: data.evidence_id || item.evidence_id,
      confirmed_by: data.user.id,
      confirmed_by_name: data.user.name,
      confirmed_by_role: data.user.role,
      decision: data.decision,
      comment: data.comment,
      timestamp: new Date().toISOString()
    };

    this.confirmations.push(conf);

    if (data.decision === 'APPROVED') {
      item.human_confirmed = true;
      item.human_confirmed_by = data.user.name;
      item.human_confirmed_at = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0];
      item.human_confirmation_comment = data.comment;
      item.status = 'VERIFIED';
      item.verified_by = data.user.id;
      item.verified_by_name = data.user.name;
      item.verified_by_role = data.user.role;
      item.verified_at = item.human_confirmed_at;
      item.updated_at = new Date().toISOString();

      // Clear related exceptions
      if (item.exception_id) {
        const exc = this.exceptions.find(e => e.id === item.exception_id);
        if (exc) {
          exc.status = 'RESOLVED';
          exc.resolved_by = data.user.name;
          exc.resolution_notes = `Resolved via specialist human confirmation: ${data.comment}`;
          exc.resolved_at = new Date().toISOString();
        }
      }
    } else {
      item.status = 'EXCEPTION';
      item.human_confirmed = false;
      item.updated_at = new Date().toISOString();
    }

    const patient = this.patients.find(p => p.id === item.patient_id);
    this.recalculatePatientStatus(item.patient_id);

    this.addAuditLog({
      event_type: 'HUMAN_CONFIRMED',
      patient_id: item.patient_id,
      patient_name: patient?.name,
      checklist_step: item.name,
      user_id: data.user.id,
      user_name: data.user.name,
      user_role: data.user.role,
      evidence_source: item.evidence_source,
      evidence_id: item.evidence_id,
      sha256_hash: item.evidence_sha256,
      decision: data.decision,
      details: `Specialist sign-off: ${data.decision} by ${data.user.name} (${data.user.role}). Clinician attestation: "${data.comment}".`
    });

    this.addPatientActivityEvent({
      patient_id: item.patient_id,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      formatted_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      exact_datetime: new Date().toLocaleString(),
      relative_day_group: 'TODAY',
      relative_day_label: 'Today',
      event_type: 'CONFIRMATION',
      title: 'Specialist Attestation Recorded',
      short_description: `Clinician confirmation: ${data.decision} for "${item.name}"`,
      performed_by: data.user.name,
      user_role: data.user.role,
      status: data.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
      related_record: { type: 'CONFIRMATION', id: conf.id, name: item.name },
      comment: data.comment,
      icon_type: 'UserCheck',
      badge_color: data.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
    });

    return item;
  }

  // --- EXCEPTIONS ---
  public createException(data: {
    patient_id: string;
    checklist_item_id: string;
    category: ExceptionRecord['category'];
    reason: string;
    severity?: RiskLevel;
    user: { id: string; name: string; role: UserRole };
  }) {
    const item = this.checklistItems.find(i => i.id === data.checklist_item_id);
    const patient = this.patients.find(p => p.id === data.patient_id);

    const exc: ExceptionRecord = {
      id: `exc-${Date.now()}`,
      patient_id: data.patient_id,
      patient_name: patient ? patient.name : 'Unknown',
      checklist_item_id: data.checklist_item_id,
      checklist_step_name: item ? item.name : 'General Checklist Step',
      severity: data.severity || (item ? item.risk_level : 'HIGH'),
      category: data.category,
      reason: data.reason,
      status: 'OPEN',
      created_by: data.user.id,
      created_by_name: data.user.name,
      assigned_role: item ? item.required_role : 'SURGEON',
      created_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0]
    };

    this.exceptions.unshift(exc);

    if (item) {
      item.status = 'EXCEPTION';
      item.exception_id = exc.id;
      item.updated_at = new Date().toISOString();
    }

    this.recalculatePatientStatus(data.patient_id);

    // Create high-priority clinical notification
    this.addNotification({
      severity: 'CRITICAL',
      title: `Exception Raised: ${exc.checklist_step_name}`,
      message: `${data.reason} for patient ${exc.patient_name} (${data.category}).`,
      role_target: exc.assigned_role,
      patient_id: data.patient_id,
      link: `/patients/${data.patient_id}`
    });

    this.addAuditLog({
      event_type: 'EXCEPTION_CREATED',
      patient_id: data.patient_id,
      patient_name: patient?.name,
      checklist_step: item?.name,
      user_id: data.user.id,
      user_name: data.user.name,
      user_role: data.user.role,
      decision: 'EXCEPTION_OPENED',
      details: `Pre-op exception flagged by ${data.user.name}. Category: ${data.category}. Severity: ${exc.severity}. Reason: "${data.reason}".`
    });

    this.addPatientActivityEvent({
      patient_id: data.patient_id,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      formatted_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      exact_datetime: new Date().toLocaleString(),
      relative_day_group: 'TODAY',
      relative_day_label: 'Today',
      event_type: 'EXCEPTION',
      title: 'Exception Created',
      short_description: `Flagged safety anomaly: ${data.category}`,
      performed_by: data.user.name,
      user_role: data.user.role,
      status: 'ESCALATED',
      related_record: { type: 'EXCEPTION', id: exc.id, name: exc.checklist_step_name },
      comment: data.reason,
      icon_type: 'AlertTriangle',
      badge_color: 'bg-rose-100 text-rose-800 border-rose-300'
    });

    return exc;
  }

  public resolveException(
    exceptionId: string,
    resolution: string,
    user: { id: string; name: string; role: UserRole }
  ) {
    const exc = this.exceptions.find(e => e.id === exceptionId);
    if (!exc) throw new Error('Exception not found');

    exc.status = 'RESOLVED';
    exc.resolved_by = user.name;
    exc.resolution_notes = resolution;
    exc.resolved_at = new Date().toISOString();

    const item = this.checklistItems.find(ci => ci.id === exc.checklist_item_id);
    if (item) {
      item.status = item.evidence_id ? 'VERIFIED' : 'PENDING';
      item.updated_at = new Date().toISOString();
    }

    this.recalculatePatientStatus(exc.patient_id);

    this.addAuditLog({
      event_type: 'EXCEPTION_RESOLVED',
      patient_id: exc.patient_id,
      patient_name: exc.patient_name,
      checklist_step: exc.checklist_step_name,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      decision: 'RESOLVED',
      details: `Exception #${exc.id} resolved by ${user.name}: "${resolution}".`
    });

    this.addPatientActivityEvent({
      patient_id: exc.patient_id,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      formatted_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      exact_datetime: new Date().toLocaleString(),
      relative_day_group: 'TODAY',
      relative_day_label: 'Today',
      event_type: 'EXCEPTION',
      title: 'Exception Resolved',
      short_description: `Resolved: ${exc.checklist_step_name}`,
      performed_by: user.name,
      user_role: user.role,
      status: 'RESOLVED',
      related_record: { type: 'EXCEPTION', id: exc.id, name: exc.checklist_step_name },
      comment: resolution,
      icon_type: 'CheckCircle2',
      badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    });

    return exc;
  }

  // --- CONTROLLED OVERRIDES ---
  public requestOverride(data: {
    patient_id: string;
    checklist_item_id: string;
    reason: string;
    business_reason: string;
    impact: OverrideRecord['impact'];
    user: { id: string; name: string; role: UserRole };
  }) {
    const item = this.checklistItems.find(i => i.id === data.checklist_item_id);
    const patient = this.patients.find(p => p.id === data.patient_id);

    const ovr: OverrideRecord = {
      id: `ovr-${Date.now()}`,
      patient_id: data.patient_id,
      patient_name: patient ? patient.name : 'Unknown',
      checklist_item_id: data.checklist_item_id,
      checklist_step_name: item ? item.name : 'General',
      reason: data.reason,
      business_reason: data.business_reason,
      impact: data.impact,
      status: 'PENDING',
      requested_by: data.user.id,
      requested_by_name: data.user.name,
      requested_by_role: data.user.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.overrides.unshift(ovr);

    if (item) {
      item.override_id = ovr.id;
      item.updated_at = new Date().toISOString();
    }

    this.addNotification({
      severity: 'HIGH',
      title: `Override Requested: ${ovr.checklist_step_name}`,
      message: `${data.user.name} requested emergency override for patient ${ovr.patient_name}. Approval required.`,
      role_target: 'SURGEON',
      patient_id: data.patient_id,
      link: `/overrides`
    });

    this.addAuditLog({
      event_type: 'OVERRIDE_REQUESTED',
      patient_id: data.patient_id,
      patient_name: patient?.name,
      checklist_step: item?.name,
      user_id: data.user.id,
      user_name: data.user.name,
      user_role: data.user.role,
      override_reason: data.reason,
      decision: 'PENDING_APPROVAL',
      details: `Controlled override requested by ${data.user.name}. Business justification: "${data.business_reason}".`
    });

    return ovr;
  }

  public decideOverride(
    overrideId: string,
    decision: 'APPROVED' | 'REJECTED',
    user: { id: string; name: string; role: UserRole },
    notes?: string
  ) {
    const ovr = this.overrides.find(o => o.id === overrideId);
    if (!ovr) throw new Error('Override request not found');

    if (user.role !== 'ADMIN' && user.role !== 'SURGEON') {
      throw new Error('Unauthorized: Only Lead Surgeon or Administrator can authorize or reject overrides.');
    }

    ovr.status = decision;
    ovr.approved_by = user.id;
    ovr.approved_by_name = user.name;
    ovr.approved_by_role = user.role;
    ovr.updated_at = new Date().toISOString();
    if (decision === 'REJECTED' && notes) {
      ovr.rejection_reason = notes;
    }

    const item = this.checklistItems.find(ci => ci.id === ovr.checklist_item_id);
    if (item) {
      if (decision === 'APPROVED') {
        item.status = 'OVERRIDE';
        if (item.exception_id) {
          const exc = this.exceptions.find(e => e.id === item.exception_id);
          if (exc) {
            exc.status = 'OVERRIDDEN';
            exc.resolved_by = user.name;
            exc.resolution_notes = `Overridden by ${user.name}: ${ovr.reason}`;
          }
        }
      }
      item.updated_at = new Date().toISOString();
    }

    this.recalculatePatientStatus(ovr.patient_id);

    this.addAuditLog({
      event_type: decision === 'APPROVED' ? 'OVERRIDE_APPROVED' : 'OVERRIDE_REJECTED',
      patient_id: ovr.patient_id,
      patient_name: ovr.patient_name,
      checklist_step: ovr.checklist_step_name,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      override_reason: ovr.reason,
      decision,
      details: `Override ${decision.toLowerCase()} by ${user.name} (${user.role}). Impact Level: ${ovr.impact}.`
    });

    return ovr;
  }

  // --- FINAL PRE-OP APPROVAL REVIEW ---
  public submitFinalApproval(
    patientId: string,
    user: { id: string; name: string; role: UserRole },
    notes?: string
  ) {
    const patient = this.patients.find(p => p.id === patientId || p.patient_id === patientId);
    if (!patient) throw new Error('Patient not found');

    if (this.systemSettings.humanConfirmationRequired && user.role !== 'SURGEON' && user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Final surgical readiness sign-off requires Lead Surgeon or Administrator role.');
    }

    patient.final_approval = {
      approved: true,
      approved_by: `${user.name} (${user.role})`,
      approved_at: new Date().toISOString(),
      notes: notes || 'All pre-operative checks, evidence attachments, and team confirmations reviewed and approved.'
    };
    patient.status = 'READY';

    // Update linked surgery if present
    const surgery = this.surgeries.find(s => s.patient_id === patient.id);
    if (surgery) {
      surgery.status = 'APPROVED';
      surgery.checklist_completion_pct = 100;
      surgery.updated_at = new Date().toISOString();
    }

    this.addNotification({
      severity: 'INFO',
      title: `Final Surgical Clearance Issued: ${patient.name}`,
      message: `Lead Surgeon ${user.name} granted final clearance. Patient transferred to Operating Theatre schedule.`,
      role_target: 'ALL',
      patient_id: patient.id,
      link: `/patients/${patient.id}`
    });

    this.addAuditLog({
      event_type: 'FINAL_APPROVAL',
      patient_id: patient.id,
      patient_name: patient.name,
      checklist_step: 'Final Pre-Op Review & Sign-Off',
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      decision: 'APPROVED',
      details: `Final pre-operative verification completed by ${user.name}. Patient cleared for operating theatre.`
    });

    return patient;
  }

  // --- IMMUTABLE AUDIT LOGS ---
  public addAuditLog(entry: Omit<AuditRecord, 'id' | 'timestamp'>) {
    if (!this.systemSettings.auditLoggingEnabled) {
      return null;
    }

    const log: AuditRecord = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
        ', ' + new Date().toISOString().split('T')[0],
      ...entry
    };
    this.auditLogs.unshift(log);
    return log;
  }

  private recalculatePatientStatus(patientId: string) {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return;

    const items = this.checklistItems.filter(ci => ci.patient_id === patientId);
    const hasException = items.some(i => i.status === 'EXCEPTION');
    const allVerified = items.every(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE');

    if (hasException) {
      patient.status = 'EXCEPTION';
    } else if (allVerified && patient.final_approval?.approved) {
      patient.status = 'READY';
    } else if (allVerified) {
      patient.status = 'IN_PROGRESS';
    } else {
      patient.status = 'IN_PROGRESS';
    }

    // Keep linked surgery status synchronized
    const surgery = this.surgeries.find(s => s.patient_id === patientId);
    if (surgery) {
      if (hasException) surgery.status = 'EXCEPTION';
      else if (patient.status === 'READY') surgery.status = 'READY';
      else surgery.status = 'PREPARING';

      const verifiedCount = items.filter(ci => ci.status === 'VERIFIED' || ci.status === 'OVERRIDE').length;
      surgery.checklist_completion_pct = items.length ? Math.round((verifiedCount / items.length) * 100) : 0;
      surgery.updated_at = new Date().toISOString();
    }
  }

  public getDashboardKpis(user?: { id: string; name: string; role: UserRole }) {
    let allowedPatients = [...this.patients];
    if (user && user.role !== 'ADMIN' && user.role !== 'AUDITOR') {
      if (user.role === 'SURGEON' || user.role === 'NURSE') {
        allowedPatients = allowedPatients.filter(p => this.checklistItems.some(ci => ci.patient_id === p.id && ci.required_role === user.role));
      } else if (user.role === 'ANESTHETIST') {
        allowedPatients = allowedPatients.filter(p => this.checklistItems.some(ci => ci.patient_id === p.id && ci.required_role === 'ANESTHETIST'));
      } else if (user.role === 'RADIOLOGIST') {
        allowedPatients = allowedPatients.filter(p => this.checklistItems.some(ci => ci.patient_id === p.id && ci.required_role === 'RADIOLOGIST'));
      } else if (user.role === 'PATHOLOGIST') {
        allowedPatients = allowedPatients.filter(p => this.checklistItems.some(ci => ci.patient_id === p.id && ci.required_role === 'PATHOLOGIST'));
      } else if (user.role === 'CARDIOLOGIST') {
        allowedPatients = allowedPatients.filter(p => this.checklistItems.some(ci => ci.patient_id === p.id && ci.required_role === 'CARDIOLOGIST'));
      }
    }

    const patientIds = new Set(allowedPatients.map(p => p.id));
    const totalPatients = allowedPatients.length;
    
    const checklistItems = this.checklistItems.filter(ci => patientIds.has(ci.patient_id));
    const criticalItems = checklistItems.filter(ci => ci.risk_level === 'CRITICAL' || ci.risk_level === 'HIGH');
    const criticalVerified = criticalItems.filter(ci => ci.status === 'VERIFIED' || ci.status === 'OVERRIDE').length;

    const totalItems = checklistItems.length;
    const verifiedItems = checklistItems.filter(ci => ci.status === 'VERIFIED' || ci.status === 'OVERRIDE').length;
    const pendingItems = checklistItems.filter(ci => ci.status === 'PENDING').length;
    const exceptionItems = checklistItems.filter(ci => ci.status === 'EXCEPTION').length;
    const notStartedItems = checklistItems.filter(ci => ci.status === 'NOT_STARTED').length;

    const evidenceRequiredItems = checklistItems.filter(ci => ci.requires_evidence);
    const evidenceAttached = evidenceRequiredItems.filter(ci => ci.evidence_id || ci.status === 'VERIFIED').length;

    const pendingConfirmations = checklistItems.filter(
      ci => ci.requires_human_confirmation && !ci.human_confirmed && ci.status !== 'NOT_STARTED'
    ).length;

    const openExceptions = this.exceptions.filter(e => patientIds.has(e.patient_id) && (e.status === 'OPEN' || e.status === 'UNDER_REVIEW')).length;
    const fairness = this.evaluateFairness(this.fairnessThreshold);

    const activeSurgeries = this.surgeries.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
    const highRiskPatients = allowedPatients.filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length;
    const pendingApprovals = allowedPatients.filter(p => p.status === 'IN_PROGRESS' && !p.final_approval?.approved).length;
    const criticalAlerts = this.notifications.filter(n => !n.read && (n.severity === 'CRITICAL' || n.severity === 'HIGH')).length;

    const readyCount = allowedPatients.filter(p => p.status === 'READY').length;
    const inProgCount = allowedPatients.filter(p => p.status === 'IN_PROGRESS').length;
    const excCount = allowedPatients.filter(p => p.status === 'EXCEPTION').length;
    const pendCount = allowedPatients.filter(p => p.status === 'PENDING').length;

    const safeSurgeryIndex = Math.round(
      (verifiedItems / (totalItems || 1)) * 40 +
      (evidenceAttached / (evidenceRequiredItems.length || 1)) * 30 +
      ((totalPatients - openExceptions) / (totalPatients || 1)) * 30
    );

    return {
      totalPatients,
      activeSurgeries,
      checklistCompletionRate: totalItems ? Math.round((verifiedItems / totalItems) * 100) : 0,
      highRiskPatients,
      pendingEvidenceCount: evidenceRequiredItems.length - evidenceAttached,
      openExceptionsCount: openExceptions,
      pendingApprovalsCount: pendingApprovals,
      criticalAlertsCount: criticalAlerts,
      safeSurgeryIndex,
      readinessSummary: {
        ready: readyCount,
        inProgress: inProgCount,
        exception: excCount,
        pending: pendCount
      },
      criticalStepsVerified: {
        current: criticalVerified,
        total: criticalItems.length,
        percentage: criticalItems.length ? Math.round((criticalVerified / criticalItems.length) * 100) : 0,
        trend: '+4.2%'
      },
      evidenceComplete: {
        current: evidenceAttached,
        total: evidenceRequiredItems.length,
        percentage: evidenceRequiredItems.length ? Math.round((evidenceAttached / evidenceRequiredItems.length) * 100) : 0,
        trend: '+2.8%'
      },
      pendingHumanConfirmation: {
        count: pendingConfirmations,
        trend: '-3 vs yesterday',
        status: pendingConfirmations > 10 ? 'WARNING' : 'NORMAL'
      },
      exceptions: {
        count: openExceptions,
        trend: '+1 new today',
        status: openExceptions > 0 ? 'ATTENTION' : 'GOOD'
      },
      fairnessTest: {
        status: fairness.result,
        disparity: `${fairness.differences.max_disparity}%`,
        threshold: `${this.fairnessThreshold}%`,
        lastRun: fairness.test_date
      },
      completionDistribution: [
        { name: 'Completed', value: verifiedItems, color: '#10b981' },
        { name: 'Pending', value: pendingItems, color: '#f59e0b' },
        { name: 'Exception', value: exceptionItems, color: '#ef4444' },
        { name: 'Not Started', value: notStartedItems, color: '#94a3b8' }
      ],
      evidenceCoverage: [
        { category: 'EMR Review', required: 106, available: 104, verified: 98 },
        { category: 'Lab Panels', required: 106, available: 99, verified: 92 },
        { category: 'PACS Imaging', required: 53, available: 47, verified: 42 },
        { category: 'Specialist Docs', required: 53, available: 44, verified: 39 },
        { category: 'Signed Consents', required: 53, available: 52, verified: 50 }
      ],
      exceptionsByCategory: [
        { name: 'Missing Evidence', count: this.exceptions.filter(e => e.category === 'Missing Evidence').length || 4 },
        { name: 'Expired Evidence', count: this.exceptions.filter(e => e.category === 'Expired Evidence').length || 2 },
        { name: 'Role Mismatch', count: 1 },
        { name: 'Human Confirmation Pending', count: 3 },
        { name: 'Override Required', count: 2 }
      ],
      teamWorkload: [
        { role: 'Surgeon', assigned: 106, completed: 88 },
        { role: 'Nurse', assigned: 212, completed: 184 },
        { role: 'Anesthetist', assigned: 53, completed: 46 },
        { role: 'Radiologist', assigned: 53, completed: 39 },
        { role: 'Pathologist', assigned: 53, completed: 44 },
        { role: 'Cardiologist', assigned: 53, completed: 37 }
      ],
      workflowStages: [
        { stage: 'Phase 1: Sign-In', completedPercent: 92, countCompleted: Math.round(totalPatients * 0.92), countPending: 4, exceptions: 0 },
        { stage: 'Medical History & Labs', completedPercent: 88, countCompleted: Math.round(totalPatients * 0.88), countPending: 5, exceptions: 1 },
        { stage: 'Specialist Clearances', completedPercent: 78, countCompleted: Math.round(totalPatients * 0.78), countPending: 9, exceptions: openExceptions },
        { stage: 'Phase 2: Time-Out', completedPercent: 81, countCompleted: Math.round(totalPatients * 0.81), countPending: 8, exceptions: 2 },
        { stage: 'Final Surgeon Clearance', completedPercent: 62, countCompleted: Math.round(totalPatients * 0.62), countPending: 18, exceptions: 0 }
      ]
    };
  }

  // --- BIAS & FAIRNESS TESTING ---
  public evaluateFairness(threshold: number = this.systemSettings.fairnessThreshold): FairnessEvaluation {
    this.fairnessThreshold = threshold;
    this.systemSettings.fairnessThreshold = threshold;
    const groupAPatients = this.patients.filter(p => p.population_group_id === 'grp-A');
    const groupBPatients = this.patients.filter(p => p.population_group_id === 'grp-B');

    const calcGroupMetrics = (pts: Patient[]) => {
      const cases = pts.length;
      if (!cases) return {
        cases: 0,
        completion_rate: 0,
        exception_rate: 0,
        evidence_verification_rate: 0,
        human_confirmation_rate: 0,
        false_negative_rate: 0,
        false_completion_rate: 0,
        override_rate: 0
      };

      const pIds = new Set(pts.map(p => p.id));
      const items = this.checklistItems.filter(ci => pIds.has(ci.patient_id));
      const totalItems = items.length || 1;

      const verified = items.filter(ci => ci.status === 'VERIFIED' || ci.status === 'OVERRIDE').length;
      const exceptions = items.filter(ci => ci.status === 'EXCEPTION').length;
      const evidenceReq = items.filter(i => i.requires_evidence).length || 1;
      const evidenceVerified = items.filter(ci => ci.evidence_id && (ci.status === 'VERIFIED' || ci.status === 'OVERRIDE')).length;
      const humanConfirmed = items.filter(ci => ci.human_confirmed).length;
      const humanReq = items.filter(i => i.requires_human_confirmation).length || 1;
      const overrides = items.filter(ci => ci.status === 'OVERRIDE').length;
      const falseCompleted = items.filter(ci => ci.requires_evidence && (ci.status === 'VERIFIED' || ci.status === 'OVERRIDE') && !ci.evidence_id).length;
      const falseNegatives = pts.filter(p => p.risk_level === 'CRITICAL' && p.status === 'READY').length;

      const jitter = (val: number) => {
        let newVal = val + (Math.random() * 2 - 1);
        if (newVal < 0) newVal = 0;
        if (newVal > 100) newVal = 100;
        return +(newVal).toFixed(1);
      };

      return {
        cases,
        completion_rate: jitter(+((verified / totalItems) * 100)),
        exception_rate: jitter(+((exceptions / totalItems) * 100)),
        evidence_verification_rate: jitter(+((evidenceVerified / evidenceReq) * 100)),
        human_confirmation_rate: jitter(+((humanConfirmed / humanReq) * 100)),
        false_negative_rate: +((falseNegatives / cases) * 2.5).toFixed(1),
        false_completion_rate: +((falseCompleted / evidenceReq) * 100).toFixed(1),
        override_rate: +((overrides / totalItems) * 100).toFixed(1)
      };
    };

    const ga = calcGroupMetrics(groupAPatients);
    const gb = calcGroupMetrics(groupBPatients);

    const compDiff = +(Math.abs(ga.completion_rate - gb.completion_rate)).toFixed(1);
    const excDiff = +(Math.abs(ga.exception_rate - gb.exception_rate)).toFixed(1);
    const evDiff = +(Math.abs(ga.evidence_verification_rate - gb.evidence_verification_rate)).toFixed(1);
    const hcDiff = +(Math.abs(ga.human_confirmation_rate - gb.human_confirmation_rate)).toFixed(1);
    const fnDiff = +(Math.abs(ga.false_negative_rate - gb.false_negative_rate)).toFixed(1);
    const fcrDiff = +(Math.abs(ga.false_completion_rate - gb.false_completion_rate)).toFixed(1);
    const overrideDisp = +(Math.abs(ga.override_rate - gb.override_rate)).toFixed(1);
    const dirVal = +((gb.evidence_verification_rate / (ga.evidence_verification_rate || 1))).toFixed(2);
    const spd = +(ga.completion_rate - gb.completion_rate).toFixed(1);

    const maxDisp = Math.max(compDiff, excDiff, evDiff, hcDiff, fnDiff, overrideDisp);

    const flags: string[] = [];
    const recommendations: string[] = [];

    if (overrideDisp > threshold) {
      flags.push(`Override disparity (${overrideDisp}%) exceeds fairness threshold of ${threshold}%.`);
      recommendations.push('Investigate reliance on emergency bypass overrides in regional cohort.');
    }
    if (fcrDiff > 5.0) {
      flags.push(`False-completion rate disparity (${fcrDiff}%) exceeds safety tolerance (5.0%).`);
      recommendations.push('Enforce strict cryptographic evidence gating before certifying pre-op steps.');
    }
    if (dirVal < 0.80 || dirVal > 1.25) {
      flags.push(`Disparate Impact Ratio (${dirVal}) breaches the 80% (0.80-1.25) equity boundary.`);
      recommendations.push('Standardize pre-op diagnostic turnarounds and specialist coverage across clinical sites.');
    }

    return {
      test_date: new Date().toISOString().split('T')[0],
      dataset_size: this.patients.length,
      threshold_used: threshold,
      result: maxDisp <= threshold && fcrDiff <= 5.0 ? 'PASSED' : 'FLAGGED',
      group_a: { name: 'Cohort Alpha (Urban / Tier-1)', ...ga },
      group_b: { name: 'Cohort Beta (Regional / Tier-2)', ...gb },
      differences: {
        completion_rate_diff: compDiff,
        exception_rate_diff: excDiff,
        evidence_verification_rate_diff: evDiff,
        human_confirmation_rate_diff: hcDiff,
        false_negative_rate_diff: fnDiff,
        false_completion_rate_diff: fcrDiff,
        override_disparity: overrideDisp,
        disparate_impact_ratio: dirVal,
        statistical_parity_difference: spd,
        max_disparity: maxDisp
      },
      flags,
      remediation_recommendations: recommendations
    };
  }

  // --- BEFORE VS AFTER EXPERIMENT ---
  public getExperimentData(): ExperimentDataset {
    return {
      metrics: [
        {
          name: 'Evidence-Backed Critical Steps',
          baseline: 18.4,
          prototype: 94.2,
          unit: '%',
          description: 'Percentage of high/critical checklist steps verified with attached audit evidence.'
        },
        {
          name: 'Missing Evidence Rate',
          baseline: 42.1,
          prototype: 3.8,
          unit: '%',
          description: 'Steps marked completed despite lack of source documents or lab records.'
        },
        {
          name: 'Human Confirmation Rate',
          baseline: 21.0,
          prototype: 97.6,
          unit: '%',
          description: 'Critical steps explicitly signed off by authenticated responsible clinician.'
        },
        {
          name: 'Audit Completeness',
          baseline: 14.5,
          prototype: 100.0,
          unit: '%',
          description: 'Percentage of safety actions with an immutable, append-only audit trail.'
        },
        {
          name: 'Unresolved High-Risk Items',
          baseline: 36.8,
          prototype: 5.2,
          unit: '%',
          description: 'Patients entering OR holding with unaddressed pre-op safety exceptions.'
        }
      ],
      summary: {
        baseline_safety_score: 52.4,
        prototype_safety_score: 96.8,
        evidence_enforcement_delta: '+75.8%',
        audit_coverage_delta: '+85.5%'
      }
    };
  }
}

export const store = new DataStore();
