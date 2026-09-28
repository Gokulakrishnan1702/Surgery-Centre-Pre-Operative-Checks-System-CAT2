import React from 'react';
import { Eye, ShieldCheck, Lock, X, Info, FileText, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

interface PrivacyGovernanceModalProps {
  isOpen: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
}

export const PrivacyGovernanceModal: React.FC<PrivacyGovernanceModalProps> = ({
  isOpen,
  currentUserRole,
  currentUserName,
  onClose,
}) => {
  if (!isOpen) return null;

  const roleAccessMap: Record<UserRole, { allowed: string[]; restricted: string[]; rationale: string }> = {
    NURSE: {
      allowed: ['General pre-op checklist milestones', 'Vital signs data', 'Nursing notes & allergy attachments', 'Patient demographics'],
      restricted: ['Cardiology ECG interpretations', 'Final surgical clearance sign-off', 'System administrator configuration'],
      rationale: 'Pre-incision preparation and physical verification duties in pre-op ward.'
    },
    CARDIOLOGIST: {
      allowed: ['Cardiac clearance milestone', '12-lead ECG records & echocardiograms', 'Cardiovascular risk scores', 'Cardiac clinical exceptions'],
      restricted: ['Surgical tray count', 'Final pre-operative surgical sign-off', 'User role management'],
      rationale: 'Specialist clinical attestation for cardiovascular stability and fitness for anesthesia.'
    },
    SURGEON: {
      allowed: ['All checklist phases (Sign-In, Time-Out, Sign-Out)', 'Pre-Operative Readiness Gate', 'Final Pre-Op Clearance Authorization', 'Full clinical dossier'],
      restricted: ['System role administration', 'Raw audit ledger deletion (immutable)'],
      rationale: 'Overall clinical and legal responsibility for surgical intervention and patient safety.'
    },
    ANESTHETIST: {
      allowed: ['Airway assessment', 'ASA physical status', 'Pre-op fasting verification', 'Coagulation & lab panels'],
      restricted: ['Surgical implant batch numbers', 'Final surgical incision sign-off'],
      rationale: 'Anesthetic risk mitigation and patient physiological stability in the OR.'
    },
    AUDITOR: {
      allowed: ['Append-only audit logs', 'Fairness & algorithmic bias evaluations', 'Override records & justifications', 'System KPI telemetry'],
      restricted: ['Direct checklist verification', 'Executing clinical overrides'],
      rationale: 'Independent clinical safety governance, regulatory compliance, and retrospective forensic audit.'
    },
    ADMIN: {
      allowed: ['Full system governance', 'User roles & permissions', 'Clinical safety rules configuration', 'Final override emergency approvals'],
      restricted: ['Deleting or mutating immutable cryptographic audit events'],
      rationale: 'Chief Medical Officer / Clinical Informatics system administration.'
    },
    RADIOLOGIST: {
      allowed: ['PACS imaging studies', 'Chest X-ray verification', 'Diagnostic radiology reports'],
      restricted: ['Final surgical sign-off', 'Anesthesia logs'],
      rationale: 'Radiological imaging verification and report attestation.'
    },
    PATHOLOGIST: {
      allowed: ['Laboratory blood panels', 'Blood bank cross-matching', 'Biopsy records'],
      restricted: ['OR sign-in verification', 'Direct clinical sign-off'],
      rationale: 'Laboratory safety and transfusion medicine clearance.'
    }
  };

  const currentAccess = roleAccessMap[currentUserRole] || roleAccessMap['NURSE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Patient Data Privacy & Access Governance</h3>
              <p className="text-[11px] text-slate-400">HIPAA & Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Prominent Demonstration Environment Label */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
                Demonstration environment — synthetic patient data.
              </div>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                All clinical records, diagnostic files, and patient identifiers shown in this system are procedurally generated for research and educational purposes. No Protected Health Information (PHI) is exposed.
              </p>
            </div>
          </div>

          {/* Current Role Access Rationale */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Your Current Session Role:</span>
              <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded text-xs">
                {currentUserRole}
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Clinical Scope of Access:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{currentAccess.rationale}</p>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <div className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authorized Data Elements:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                {currentAccess.allowed.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <div className="font-semibold text-rose-800 flex items-center gap-1 mb-1">
                <Lock className="w-3.5 h-3.5 text-rose-600" /> Restricted Data Elements:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                {currentAccess.restricted.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
            >
              Close Privacy View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
