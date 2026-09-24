import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StageData {
  stage: string;
  completedPercent: number;
  countCompleted: number;
  countPending: number;
  exceptions: number;
}

interface WorkflowStepperProps {
  stages: StageData[];
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ stages }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Pre-Operative Workflow Progress
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end evidence gate stages from intake to operating theatre sign-off
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Review
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Exception
          </span>
        </div>
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:grid grid-cols-6 gap-3 relative">
        {stages.map((stg, idx) => {
          const isFull = stg.completedPercent === 100;
          const hasExceptions = stg.exceptions > 0;

          return (
            <div
              key={stg.stage}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                hasExceptions
                  ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-300'
                  : isFull
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    STAGE 0{idx + 1}
                  </span>
                  {hasExceptions ? (
                    <span className="p-1 rounded-full bg-rose-100 text-rose-600" title="Active Exception">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : isFull ? (
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-600" title="Stage Verified">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-amber-100 text-amber-600" title="Pending Verification">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 h-8">
                  {stg.stage}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 text-[11px]">Completion</span>
                  <span className="font-bold text-slate-800">{stg.completedPercent}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hasExceptions ? 'bg-rose-500' : isFull ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${stg.completedPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-medium">
                  <span className="text-emerald-700">✓ {stg.countCompleted}</span>
                  <span className="text-amber-700">⌛ {stg.countPending}</span>
                  {stg.exceptions > 0 && <span className="text-rose-600 font-bold">! {stg.exceptions}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile / Tablet Vertical Stepper */}
      <div className="lg:hidden space-y-3">
        {stages.map((stg, idx) => (
          <div key={stg.stage} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{stg.stage}</div>
                <div className="text-[11px] text-slate-500">
                  {stg.countCompleted} verified • {stg.countPending} pending {stg.exceptions > 0 && `• ${stg.exceptions} exceptions`}
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-800">{stg.completedPercent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};
