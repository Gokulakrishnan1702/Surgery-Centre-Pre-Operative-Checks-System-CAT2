import React, { useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { ChecklistItem, EvidenceType } from '../../types';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  item: ChecklistItem | null;
  patientId: string;
  onClose: () => void;
  onUpload: (data: {
    patient_id: string;
    checklist_item_id: string;
    evidence_type: EvidenceType;
    source: string;
    filename: string;
    file_size?: string;
    notes?: string;
  }) => Promise<void>;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  item,
  patientId,
  onClose,
  onUpload,
}) => {
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('DOCUMENT');
  const [source, setSource] = useState('Hospital EMR PACS Integration');
  const [filename, setFilename] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const defaultFilename = `${item.name.toLowerCase().replace(/ /g, '_')}_document_demo.pdf`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalFilename = filename.trim() || defaultFilename;
    setError(null);
    setSubmitting(true);
    try {
      await onUpload({
        patient_id: patientId,
        checklist_item_id: item.id,
        evidence_type: evidenceType,
        source: source.trim() || 'Internal Clinical System',
        filename: finalFilename,
        file_size: '348 KB',
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Evidence upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Upload Synthetic Clinical Evidence</h3>
              <p className="text-[11px] text-blue-100">Attach Verified Source Artifact</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
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

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Checklist Step:</span>
              <span className="font-bold text-slate-800">{item.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Required Role:</span>
              <span className="font-bold text-blue-700">{item.required_role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rule Policy:</span>
              <span className="text-slate-600 truncate max-w-[280px]" title={item.rule_explanation}>
                {item.rule_explanation}
              </span>
            </div>
          </div>

          {/* Evidence Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Evidence Classification:</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="DOCUMENT">DOCUMENT - Formal Signed Clinical Report</option>
              <option value="EMR">EMR - Electronic Medical Record Extract</option>
              <option value="LAB">LAB - Pathology Laboratory Result Slip</option>
              <option value="PACS">PACS - Picture Archiving & Radiology Sign-off</option>
              <option value="CLINICIAN_NOTE">CLINICIAN_NOTE - Attending Specialist Assessment</option>
              <option value="CONSENT_FORM">CONSENT_FORM - Witnessed Informed Consent Document</option>
            </select>
          </div>

          {/* Source System */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Evidence Source System:</label>
            <input
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Epic Systems EMR / GE Healthcare PACS / Central Lab"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* File Upload (Conditional) */}
          {evidenceType && source.trim() !== '' ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Attach Local Document:</label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFilename(file.name);
                      // Store file size or logic if needed, for demo we just set filename
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Accepted formats: PDF, PNG, JPG, DOCX
              </span>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
              Please fill Classification and Source System to unlock file upload.
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Clinical Attestation Note:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Echo indicates LVEF 55%, normal valve function, clearance granted."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-md shadow-blue-500/20 transition-all"
            >
              {submitting ? 'Attaching Evidence...' : 'Attach & Upload Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
