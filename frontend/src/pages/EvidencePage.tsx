import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle2, Search, Filter, ShieldCheck, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { EvidenceRecord, EvidenceType } from '../types';
import { EvidenceViewerModal } from '../components/modals/EvidenceViewerModal';

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewerItem, setViewerItem] = useState<EvidenceRecord | null>(null);

  useEffect(() => {
    loadEvidence();
  }, [selectedType]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const data = await api.evidence.list({
        evidence_type: selectedType !== 'ALL' ? selectedType : undefined,
      });
      setEvidenceList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = evidenceList.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.filename.toLowerCase().includes(q) ||
      (e.patient_name && e.patient_name.toLowerCase().includes(q)) ||
      e.checklist_step_name.toLowerCase().includes(q) ||
      e.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Evidence Vault</h2>
          <p className="text-xs text-slate-500 font-medium">
            Attached electronic medical records, lab panels, radiology sign-offs & signed consents
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Hashing Active</span>
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename, patient, checklist step, or source HIS..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="ALL">All Evidence Types</option>
            <option value="EMR">EMR Extract</option>
            <option value="LAB">Laboratory Results</option>
            <option value="PACS">PACS Imaging</option>
            <option value="DOCUMENT">Specialist Document</option>
            <option value="CLINICIAN_NOTE">Clinician Note</option>
            <option value="CONSENT_FORM">Consent Form</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Evidence ID</th>
                <th className="py-3 px-4">Document File</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Checklist Item</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Source System</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Upload Timestamp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No evidence records matching current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">
                      {ev.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate max-w-[180px]" title={ev.filename}>
                          {ev.filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {ev.patient_name || 'Patient'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ev.checklist_step_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {ev.evidence_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {ev.source}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{ev.uploaded_by_name}</div>
                      <div className="text-[10px] text-slate-400">{ev.uploaded_by_role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {ev.uploaded_at}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewerItem(ev)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EvidenceViewerModal
        isOpen={!!viewerItem}
        evidence={viewerItem}
        onClose={() => setViewerItem(null)}
      />
    </div>
  );
};
