import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sliders,
  Scale
} from 'lucide-react';
import { api } from '../services/api';
import { ModelGovernanceInfo } from '../types';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelGovernanceInfo[]>([]);
  const [notice, setNotice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await api.models.list();
      setModels(data.models || []);
      setNotice(data.governance_notice || '');
    } catch (err) {
      console.error('Failed to load model registry', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
            AI Governance & Algorithm Transparency
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Model Registry</h1>
        <p className="text-xs text-slate-500">
          Transparent model cards, performance metrics, and feature attribution governance conforming to Responsible AI principles.
        </p>
      </div>

      {/* Decision Support Governance Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Human-in-the-Loop AI Governance Standard</p>
          <p className="text-[11px] text-amber-800 mt-0.5">{notice}</p>
        </div>
      </div>

      {/* Model Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading model registry specifications...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((m) => (
            <div key={m.model_name} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{m.model_name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Version {m.version}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      m.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div>
                    <span className="font-semibold text-slate-700">Algorithm:</span> {m.algorithm}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Task:</span> {m.task}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Training Corpus:</span> {m.training_dataset}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Trained:</span> {m.training_date}
                  </div>
                </div>

                {/* Performance Metrics Table */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Validation Benchmark Metrics
                </h4>
                <div className="grid grid-cols-5 gap-2 mb-5 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">Accuracy</div>
                    <div className="text-sm font-bold text-slate-900">{(m.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">Precision</div>
                    <div className="text-sm font-bold text-slate-900">{(m.precision * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">Recall</div>
                    <div className="text-sm font-bold text-slate-900">{(m.recall * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">F1 Score</div>
                    <div className="text-sm font-bold text-slate-900">{(m.f1_score * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">ROC-AUC</div>
                    <div className="text-sm font-bold text-purple-700">{m.roc_auc.toFixed(3)}</div>
                  </div>
                </div>

                {/* Features Analyzed */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Analyzed Clinical Features (SHAP Kernel)
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {m.features_analyzed.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Explainable Attribution Engine</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Bias Audited
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
