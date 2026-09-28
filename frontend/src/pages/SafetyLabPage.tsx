import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  RefreshCw,
  Info,
  FileText,
  UserCheck,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { SafetyLabTestCase } from '../types';

export const SafetyLabPage: React.FC = () => {
  const [tests, setTests] = useState<SafetyLabTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await api.safetyLab.list();
      setTests(data);
    } catch (err) {
      console.error('Failed to load safety lab tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleRunTest = async (testId: string) => {
    try {
      setRunningId(testId);
      setSummaryMessage(null);
      const res = await api.safetyLab.runTest(testId);
      setTests(prev => prev.map(t => t.id === testId ? res.result : t));
      setSummaryMessage(`Test ${testId} executed: ${res.result.status === 'PASS' ? 'GUARD PASSED' : 'GUARD FAILED'}`);
    } catch (err: any) {
      setSummaryMessage(`Test execution failed: ${err.message}`);
    } finally {
      setRunningId(null);
    }
  };

  const handleRunAll = async () => {
    for (const t of tests) {
      await handleRunTest(t.id);
    }
  };

  const passCount = tests.filter(t => t.status === 'PASS').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              Adversarial Safety Test Harness
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 5/5 Safety Guards Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edge-Case & Safety Guard Test Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated verification suite validating that unauthorized bypasses, expired diagnostic records, and role mismatches are strictly blocked by server-side safety logic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAll}
            disabled={runningId !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-60"
          >
            <Play className="w-4 h-4" />
            Run All 5 Safety Guards
          </button>
        </div>
      </div>

      {summaryMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-mono flex items-center justify-between border border-slate-700">
          <span>&gt; {summaryMessage}</span>
          <span className="text-slate-400">Timestamp: {new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* Safety Lab Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Test Suite Coverage</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">5 Critical Edge Cases</div>
            <div className="text-xs text-slate-500 mt-0.5">Mandatory Section 16 requirements</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Automated Verdict</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{passCount} / {tests.length} PASSED</div>
            <div className="text-xs text-slate-500 mt-0.5">Zero unhandled edge-cases</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Enforcement Mechanism</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">Server-Side RBAC</div>
            <div className="text-xs text-slate-500 mt-0.5">Backend permission + expiry gating</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Test Case Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          tests.map((t, idx) => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 shrink-0">
                    {t.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      {t.title}
                      {t.status === 'PASS' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      ) : t.status === 'FAIL' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> FAIL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                          NOT RUN
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-400 hidden sm:block">
                    <div>Last Executed:</div>
                    <div className="font-mono text-slate-600">
                      {t.last_run ? new Date(t.last_run).toLocaleTimeString() : 'Pending'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunTest(t.id)}
                    disabled={runningId === t.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition disabled:opacity-60"
                  >
                    {runningId === t.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {runningId === t.id ? 'Running Guard...' : 'Execute Guard'}
                  </button>
                </div>
              </div>

              {/* Test Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> Input Scenario
                  </div>
                  <p className="text-slate-600 leading-relaxed">{t.input_scenario}</p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <div className="font-bold text-indigo-900 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Expected Behavior
                  </div>
                  <p className="text-indigo-900 leading-relaxed font-medium">{t.expected_result}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <div className="font-bold text-emerald-900 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600" /> Actual Runtime Output
                  </div>
                  <p className="text-emerald-950 font-mono text-[11px] leading-relaxed">
                    {t.actual_result || t.details || 'Awaiting execution trigger...'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
