import React, { useState } from 'react';
import { FileText, ShieldCheck, CheckCircle2, Clock, X, ExternalLink, Hash } from 'lucide-react';
import { EvidenceRecord } from '../../types';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  evidence: EvidenceRecord | null;
  onClose: () => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  isOpen,
  evidence,
  onClose,
}) => {
  const [showViewer, setShowViewer] = useState(false);

  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">{evidence.filename}</h3>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  {evidence.evidence_type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Linked to: {evidence.checklist_step_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-emerald-900">Cryptographically Verified Document</span>
                <p className="text-[11px] text-emerald-700">Audit trail hash confirmed against system ledger</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              STATUS: {evidence.verification_status}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Source HIS System</span>
              <span className="font-medium text-slate-800">{evidence.source}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">File Size</span>
              <span className="font-medium text-slate-800">{evidence.file_size || '348 KB'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Uploaded By</span>
              <span className="font-medium text-slate-800">
                {evidence.uploaded_by_name} ({evidence.uploaded_by_role})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Upload Timestamp</span>
              <span className="font-medium text-slate-800 font-mono text-[11px]">{evidence.uploaded_at}</span>
            </div>
          </div>

          {/* Clinical Attestation Content */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Clinical Reviewer Note
              </span>
              <span className="text-[10px] text-slate-400">Authenticated Sign-Off</span>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "{evidence.notes || 'Clinical parameters verified per pre-operative standard operating procedure. All safety markers within accepted surgical risk tolerance.'}"
            </p>
          </div>

          {/* Synthetic Document Record Preview Box */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center space-y-2">
            <div className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Hash className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate">
              SHA-256: 8f4a7c2b9e11504f7c2299b801a2f643e9d8c01b...
            </div>
            <p className="text-[11px] text-slate-500">
              Synthetic preview document generated for demonstration.
            </p>
            {showViewer ? (
              <div className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] h-48 overflow-hidden relative text-left border border-slate-800">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => alert("File downloaded successfully to your local system!")} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Download File">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  </button>
                  <button onClick={() => setShowViewer(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-blue-400 mb-2 font-bold flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>--- SECURE DOCUMENT STREAM ---</span>
                </div>
                <div className="space-y-1 opacity-80">
                  <p><span className="text-slate-500">FILE:</span> {evidence.filename}</p>
                  <p><span className="text-slate-500">TYPE:</span> {evidence.evidence_type}</p>
                  <p><span className="text-slate-500">HASH:</span> 8f4a7c2b9e11504f7c2299b801a2f643e9d8c01b...</p>
                  <div className="pt-2 mt-2 border-t border-slate-800 text-emerald-500/70">
                    <p>01001010 01101111 01101000 01101110 00100000 01000100 01101111 01100101</p>
                    <p>01010011 01110101 01110010 01100111 01100101 01110010 01111001</p>
                    <p>[DOCUMENT CONTENT REDACTED IN DEMO MODE]</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowViewer(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <span>Open Synthetic Document Viewer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alert("File downloaded successfully to your local system!")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  title="Download File"
                >
                  <span>Download</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
