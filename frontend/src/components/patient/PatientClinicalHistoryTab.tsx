import React from 'react';
import {
  Calendar,
  AlertCircle,
  Stethoscope,
  Heart,
  Pill,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { Patient, ClinicalHistoryEntry } from '../../types';

interface PatientClinicalHistoryTabProps {
  patient: Patient;
  clinicalHistory?: ClinicalHistoryEntry[];
}

export const PatientClinicalHistoryTab: React.FC<PatientClinicalHistoryTabProps> = ({
  patient,
  clinicalHistory = []
}) => {
  // Group clinical events by year
  const eventsByYear: Record<string, ClinicalHistoryEntry[]> = {};
  clinicalHistory.forEach((entry) => {
    const yr = entry.year || 'Earlier';
    if (!eventsByYear[yr]) eventsByYear[yr] = [];
    eventsByYear[yr].push(entry);
  });

  const sortedYears = Object.keys(eventsByYear).sort((a, b) => b.localeCompare(a));

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SURGERY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DIAGNOSIS':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HOSPITALIZATION':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDICATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ALLERGY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INVESTIGATION':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Distinction Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 border border-blue-800/40 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Patient Medical & Clinical Health History</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold uppercase">
                Clinical Context
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Medical records, prior surgeries, chronic illnesses, and multi-year longitudinal assessments.
              <strong className="text-white ml-1">Separated from system activity audit logs.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Structured Medical Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Chronic Conditions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Chronic Conditions & Diagnoses</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
              patient.chronic_conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium"
                >
                  {cond}
                </span>
              ))
            ) : patient.medical_history && patient.medical_history.length > 0 ? (
              patient.medical_history.map((h, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium"
                >
                  {h}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">None reported</span>
            )}
          </div>
        </div>

        {/* 2. Previous Surgeries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Previous Surgeries & Procedures</span>
          </div>
          <div className="space-y-1.5">
            {patient.previous_surgeries && patient.previous_surgeries.length > 0 ? (
              patient.previous_surgeries.map((surg, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-xs font-medium flex items-center justify-between"
                >
                  <span>{surg}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400">No prior surgeries recorded</span>
            )}
          </div>
        </div>

        {/* 3. Documented Drug Allergies */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Documented Allergies</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((all, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {all}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No known allergies (NKDA)</span>
            )}
          </div>
        </div>

        {/* 4. Current Medications */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Pill className="w-4 h-4 text-blue-600" />
            <span>Current Medications</span>
          </div>
          <div className="space-y-1.5">
            {patient.current_medications && patient.current_medications.length > 0 ? (
              patient.current_medications.map((med, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium"
                >
                  {med}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400">None documented</span>
            )}
          </div>
        </div>

        {/* 5. Previous Hospitalizations & Complications */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Hospitalizations & Complications</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            {patient.previous_hospitalizations && patient.previous_hospitalizations.length > 0 ? (
              patient.previous_hospitalizations.map((hosp, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-800">Stay:</span> {hosp}
                </div>
              ))
            ) : (
              <div className="text-slate-400">No prior inpatient hospitalizations</div>
            )}
            {patient.previous_complications && (
              <div className="text-[11px] text-slate-500 italic">
                {patient.previous_complications.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 6. Family History */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Family Medical History</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {patient.family_history && patient.family_history.length > 0 ? (
              patient.family_history.map((fam, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 font-medium">
                  • {fam}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400">Non-contributory</span>
            )}
          </div>
        </div>
      </div>

      {/* Annual Chronological Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Longitudinal Medical History Timeline</h4>
            <p className="text-xs text-slate-500">Chronological history of major diagnoses, surgeries, and clinical milestones</p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {clinicalHistory.length} Milestones
          </span>
        </div>

        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year} className="relative pl-6 border-l-2 border-blue-500/30 space-y-3">
              {/* Year Header Marker */}
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-md shadow-blue-500/30">
                {year.slice(-2)}
              </div>
              <div className="text-sm font-extrabold text-blue-600 tracking-tight pl-2">
                Calendar Year {year}
              </div>

              {/* Events in this Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                {eventsByYear[year].map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                      {entry.date_approx && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {entry.date_approx}
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {entry.title}
                    </h5>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {entry.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      {entry.facility && (
                        <span className="truncate max-w-[200px]" title={entry.facility}>
                          📍 {entry.facility}
                        </span>
                      )}
                      {entry.status && (
                        <span className="font-semibold text-slate-700">
                          Status: {entry.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
