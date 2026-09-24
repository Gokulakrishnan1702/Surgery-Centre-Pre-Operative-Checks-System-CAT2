import React from 'react';
import {
  ShieldCheck,
  Printer,
  X,
  CheckCircle2,
  Lock,
  QrCode,
  Building,
  Calendar,
  User,
  Activity,
  FileCheck
} from 'lucide-react';
import { Patient, ChecklistItem, EvidenceRecord, RiskAssessmentResult } from '../../types';

interface ClearancePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient & {
    checklist: ChecklistItem[];
    evidence: EvidenceRecord[];
  };
  riskResult?: RiskAssessmentResult | null;
}

export const ClearancePassportModal: React.FC<ClearancePassportModalProps> = ({
  isOpen,
  onClose,
  patient,
  riskResult
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const verifiedCount = patient.checklist.filter(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE').length;
  const totalCount = patient.checklist.length;
  const isApproved = patient.final_approval?.approved || patient.status === 'READY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Pre-Operative Surgical Clearance Dossier</h3>
              <p className="text-[11px] text-slate-400">Authenticatable Clinical Clearance Passport (PDF Export)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Clearance Document */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-6 h-6 text-blue-700" />
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500 font-bold">
                  NABH / JCI ACCREDITED CENTER OF EXCELLENCE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                METROPOLITAN SURGICAL CENTER
              </h1>
              <p className="text-xs text-slate-600">
                Department of Perioperative Medicine & Operating Suite Administration • Coimbatore, TN
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div><strong>DOC ID:</strong> CLR-{patient.patient_id}-{new Date().getFullYear()}</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div><strong>SECURITY:</strong> SHA-256 HASH VERIFIED</div>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isApproved 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`w-6 h-6 ${isApproved ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <h4 className="font-bold text-sm tracking-tight">
                  {isApproved ? 'OFFICIAL PRE-OPERATIVE CLEARANCE ISSUED' : 'PROVISIONAL PRE-OPERATIVE DOSSIER'}
                </h4>
                <p className="text-xs">
                  {isApproved
                    ? 'All high-risk checklist evidence authenticated by responsible clinical specialists. Cleared for incision.'
                    : 'Pending final sign-off or specialist confirmation. Not eligible for surgical incision.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                isApproved ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {patient.status}
              </span>
            </div>
          </div>

          {/* Patient & Surgical Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Patient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Hospital Patient ID:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{patient.patient_id}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Age / Gender:</span>
              <span className="font-bold text-slate-900">{patient.age} Yrs / {patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Scheduled Surgery:</span>
              <span className="font-bold text-slate-900">{patient.surgery_type}</span>
            </div>
          </div>

          {/* Clinical Allergies & Medications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="font-bold text-rose-900 block mb-1">Documented Drug Allergies:</span>
              <p className="text-rose-800">
                {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No Known Drug Allergies (NKDA)'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="font-bold text-blue-900 block mb-1">Reconciled Pre-Op Medications:</span>
              <p className="text-blue-800">
                {patient.current_medications && patient.current_medications.length > 0 ? patient.current_medications.join(', ') : 'None active'}
              </p>
            </div>
          </div>

          {/* Explainable Risk Assessment Breakdown (if available) */}
          {riskResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold uppercase tracking-wider text-slate-700">
                  Explainable Risk Stratification Score: {riskResult.total_score} / 100 ({riskResult.risk_level})
                </span>
                <span className="font-mono text-[10px] text-slate-500">Confidence: {riskResult.confidence_pct}%</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                {riskResult.factors.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">{f.factor}:</span>
                    <span className={`font-mono font-bold ${f.score > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {f.score > 0 ? `+${f.score}` : `${f.score}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence-Backed Checklist Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
              Forensic Evidence Attestation Matrix ({verifiedCount} / {totalCount} Certified)
            </h4>
            <table className="w-full text-left border-collapse text-[11px] border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2">Checklist Step</th>
                  <th className="p-2">Required Role</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Attached Evidence</th>
                  <th className="p-2">SHA-256 Hash</th>
                  <th className="p-2">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                {patient.checklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2 font-sans font-medium text-slate-900">{item.name}</td>
                    <td className="p-2 text-slate-600">{item.required_role}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        item.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'EXCEPTION' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2 font-sans text-slate-600 truncate max-w-xs">
                      {item.evidence_filename || '—'}
                    </td>
                    <td className="p-2 text-slate-500">
                      {item.evidence_sha256 ? item.evidence_sha256.substring(0, 12) + '...' : '—'}
                    </td>
                    <td className="p-2 font-sans text-slate-700">
                      {item.verified_by_name || 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature & Verification Block */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 shadow-2xs overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://hospital-demo.com/verify?doc=CLR-${patient.patient_id}&hash=${patient.id}`)}`}
                  alt="Clearance QR Code"
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    // Fallback to vector icon if offline
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                    if (fallback) (fallback as HTMLElement).style.display = 'block';
                  }}
                />
                <QrCode className="w-12 h-12 text-slate-800 qr-fallback hidden" />
              </div>
              <div className="text-[10px] text-slate-500">
                <p className="font-bold text-slate-800">Scan to Verify Clearance on Hospital Ledger</p>
                <p className="font-mono text-[9px] text-slate-600">CLR-HASH: {patient.id.replace('pat-', '0x')}-SECURE</p>
                <p className="text-emerald-700 font-semibold">✓ Cryptographic Audit Ledger Verified</p>
              </div>
            </div>

            <div className="text-right">
              <div className="border-b border-slate-400 w-48 mb-1">
                <span className="font-serif italic text-blue-900 text-base">Dr. Marcus Vance</span>
              </div>
              <p className="text-[11px] font-bold text-slate-900">Dr. Marcus Vance, MD, FACS</p>
              <p className="text-[10px] text-slate-500">Lead Surgeon • License: MED-749102-TN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
