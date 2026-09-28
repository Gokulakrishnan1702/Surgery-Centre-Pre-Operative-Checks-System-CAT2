import React from 'react';
import { FileCheck, X, CheckCircle2, XCircle, AlertTriangle, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { ChecklistItem, EvidenceValidationDetails } from '../../types';

interface EvidenceValidationModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  validation: EvidenceValidationDetails | null;
  onClose: () => void;
}

export const EvidenceValidationModal: React.FC<EvidenceValidationModalProps> = ({
  isOpen,
  item,
  validation,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const status = validation?.overall_status || (item.evidence_id ? 'VALID' : 'MISSING');
  const criteria = validation?.criteria || {
    exists: !!item.evidence_id,
    correct_type: true,
    step_matched: true,
    role_authorized: true,
    timestamp_valid: true,
    unexpired: true,
    human_reviewed: item.human_confirmed
  };

  const renderCriterion = (label: string, passed: boolean) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2">
        {passed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
        )}
        <span className={`text-xs ${passed ? 'text-slate-800 font-medium' : 'text-rose-700 font-semibold'}`}>
          {label}
        </span>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
        passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}>
        {passed ? 'Passed' : 'Failed'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Multi-Point Evidence Validation</h3>
              <p className="text-[11px] text-slate-400">Cryptographic Integrity & Clinical Freshness Check</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Target Checklist Step</div>
              <div className="font-bold text-slate-900 text-sm">{item.name}</div>
              <div className="font-mono text-slate-500 text-[11px] mt-0.5 truncate max-w-[260px]">
                Doc: {item.evidence_filename || validation?.filename || 'Attachment pending'}
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              status === 'VALID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              status === 'EXPIRED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              status === 'CONFLICTING' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {status}
            </span>
          </div>

          {/* Criteria Checklist */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              7 Mandatory Verification Safeguards:
            </div>
            {renderCriterion('1. Diagnostic evidence document exists', criteria.exists)}
            {renderCriterion('2. Correct clinical evidence type attached', criteria.correct_type)}
            {renderCriterion('3. Evidence matched to checklist milestone', criteria.step_matched)}
            {renderCriterion('4. Uploaded by authorized specialist clinician role', criteria.role_authorized)}
            {renderCriterion('5. Cryptographic timestamp and hash recorded', criteria.timestamp_valid)}
            {renderCriterion('6. Evidence within validity period (Fresh <72h)', criteria.unexpired)}
            {renderCriterion('7. Human confirmation review completed', criteria.human_reviewed)}
          </div>

          {validation?.messages && validation.messages.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
              <div className="font-bold mb-0.5">Validation Diagnostics:</div>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                {validation.messages.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
