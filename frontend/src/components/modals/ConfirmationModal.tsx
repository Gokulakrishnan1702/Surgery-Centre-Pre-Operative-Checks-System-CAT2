import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, X } from 'lucide-react';
import { ChecklistItem, UserRole } from '../../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  currentUserRole: UserRole;
  currentUserName: string;
  onClose: () => void;
  onConfirm: (comment: string, reviewed: boolean) => Promise<void>;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  item,
  currentUserRole,
  currentUserName,
  onClose,
  onConfirm,
}) => {
  const [reviewed, setReviewed] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const isAuthorized = currentUserRole === 'ADMIN' || currentUserRole === item.required_role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewed) {
      setError('You must confirm that you reviewed the attached clinical evidence.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(comment, reviewed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Human Confirmation Required</h3>
              <p className="text-[11px] text-slate-400">High-Impact Pre-Operative Safety Gate</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isAuthorized && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Role Warning:</strong> This step requires confirmation by{' '}
                <strong>{item.required_role}</strong>. You are currently logged in as{' '}
                <strong>{currentUserRole}</strong>.
              </span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Checklist Step:</span>
              <span className="font-bold text-slate-800">{item.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Risk Level:</span>
              <span className="font-bold text-rose-700">{item.risk_level}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Attached Evidence:</span>
              <span className="font-medium text-blue-600 font-mono text-[11px] truncate max-w-[240px]">
                {item.evidence_filename || 'Evidence File Attached'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Evidence Source:</span>
              <span className="font-medium text-slate-700">{item.evidence_source || 'EMR / PACS'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Responsible Role:</span>
              <span className="font-bold text-blue-700">{item.required_role}</span>
            </div>
          </div>

          {/* Attestation Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-blue-50/40 hover:bg-blue-50/80 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs text-slate-800 font-medium leading-relaxed">
                I attest that I have directly inspected the evidence document, confirmed the clinical facts, and take responsibility for verifying this surgical safety requirement.
              </span>
            </label>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Clinical Sign-off Comment / Notes:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Reviewed 12-lead ECG and 2D-Echo report; patient is clinically stable for general anesthesia."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Footer Actions */}
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
              disabled={submitting || !reviewed || !isAuthorized}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {submitting ? 'Recording Audit...' : 'Confirm Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
