import React from 'react';
import { HelpCircle, X, ShieldAlert, FileText, UserCheck, Lock, Clock, CheckCircle2 } from 'lucide-react';
import { ChecklistItem } from '../../types';

interface RuleExplanationModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  onClose: () => void;
}

export const RuleExplanationModal: React.FC<RuleExplanationModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const rule = item.rule_details || {
    rule: `System Safety Rule: Mandatory documentary verification of "${item.name}" prior to proceeding to surgical timeout.`,
    risk_level: item.risk_level,
    required_evidence: item.requires_evidence ? `${item.name} supporting diagnostic record / EMR extract` : 'Not mandated for low-risk tier',
    responsible_role: item.required_role,
    human_confirmation: item.requires_human_confirmation ? 'REQUIRED: Explicit clinical sign-off required' : 'Optional / Self-verification permitted',
    override: item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH' ? 'Senior authorization required (Lead Surgeon or CMO) with dual justification' : 'Clinical justification required',
    evidence_validity: 'Document must be authentic, cryptographic SHA-256 verified, within valid validity window (<72h), and not conflicting with EMR.',
    source: 'SurgiGate Configurable Hospital Safety Rule Engine (System Safety Rule)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Why is this required?</h3>
              <p className="text-[11px] text-slate-400">Explainable Safety Rule & Clinical Policy</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Checklist Step</div>
            <div className="font-extrabold text-slate-900 text-sm">{item.name}</div>
            <div className="text-slate-600 text-xs mt-1 leading-relaxed">{rule.rule}</div>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100">
            <div className="flex items-start justify-between pt-2">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Risk Level
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                item.risk_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                item.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {rule.risk_level}
              </span>
            </div>

            <div className="flex items-start justify-between pt-2.5">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> Required Evidence
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-[260px]">
                {rule.required_evidence}
              </span>
            </div>

            <div className="flex items-start justify-between pt-2.5">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-500" /> Responsible Role
              </span>
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {rule.responsible_role}
              </span>
            </div>

            <div className="flex items-start justify-between pt-2.5">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Human Confirmation
              </span>
              <span className="font-semibold text-emerald-800 text-right max-w-[260px]">
                {rule.human_confirmation}
              </span>
            </div>

            <div className="flex items-start justify-between pt-2.5">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" /> Override Policy
              </span>
              <span className="font-semibold text-slate-700 text-right max-w-[260px]">
                {rule.override}
              </span>
            </div>

            <div className="flex items-start justify-between pt-2.5">
              <span className="font-medium text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" /> Evidence Validity Condition
              </span>
              <span className="font-medium text-slate-600 text-right max-w-[260px] text-[11px]">
                {rule.evidence_validity || 'Valid and not expired (<72 hours freshness window)'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500">
            <strong className="text-slate-700">Governance Attribution: </strong>
            {rule.source || 'Configurable hospital safety rule. Clearly labeled as system safety rules.'}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
