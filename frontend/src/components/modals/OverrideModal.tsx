import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';
import { ChecklistItem, UserRole } from '../../types';

interface OverrideModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  patientId: string;
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    business_reason: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => Promise<void>;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  item,
  currentUserRole,
  currentUserName,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState('');
  const [businessReason, setBusinessReason] = useState('');
  const [impact, setImpact] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !businessReason.trim()) {
      setError('Both clinical reason and operational/business justification are required.');
      return;
    }
    if (!acknowledged) {
      setError('You must acknowledge that this action bypasses standard verification rules.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ reason, business_reason: businessReason, impact });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Override request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-700/60 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Controlled Override Request</h3>
              <p className="text-[11px] text-amber-100">Supervised Safety Protocol Bypass</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Important Safety Governance:</strong> Pre-operative overrides are recorded into the immutable clinical audit log and require formal sign-off from the Lead Surgeon or Chief Medical Officer.
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Checklist Step:</span>
              <span className="font-bold text-slate-800">{item.name}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Requested By:</span>
              <span className="font-semibold text-slate-700">
                {currentUserName} ({currentUserRole})
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {new Date().toLocaleTimeString()} (Automatic)
              </span>
            </div>
          </div>

          {/* Clinical Reason */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Clinical / Medical Reason for Override: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Emergency operational exception: outside cardiologist provided direct telephone clearance confirmed by attending surgeon."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            ></textarea>
          </div>

          {/* Business / Operational Reason */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Business / Operational Justification: <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={businessReason}
              onChange={(e) => setBusinessReason(e.target.value)}
              placeholder="e.g., Operating room block schedule time-critical; delaying would risk donor tissue viability."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            ></textarea>
          </div>

          {/* Impact Level */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Impact Assessment:</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as any)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="LOW">LOW - Minimal procedural divergence</option>
              <option value="MEDIUM">MEDIUM - Alternate verification pathway utilized</option>
              <option value="HIGH">HIGH - Critical step bypassed under clinical oversight</option>
              <option value="CRITICAL">CRITICAL - Extreme operational necessity</option>
            </select>
          </div>

          {/* Mandatory Acknowledgment Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-xs text-amber-950 font-semibold leading-relaxed">
                I acknowledge that this action bypasses the normal verification requirement and creates an indelible audit entry.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !acknowledged}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
            >
              {submitting ? 'Submitting...' : 'Submit Override Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
