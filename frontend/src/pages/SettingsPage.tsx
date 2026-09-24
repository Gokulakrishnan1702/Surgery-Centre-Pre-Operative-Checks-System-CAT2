import React, { useState, useEffect } from 'react';
import { Settings, Shield, Lock, Save, AlertCircle, CheckCircle2, Bell, CheckSquare, Users } from 'lucide-react';
import { api } from '../services/api';
import { SystemSettings, NotificationSettings, ChecklistConfiguration } from '../types';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    hospitalName: '',
    hospitalId: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    doctorApprovalRequired: true,
    highRiskEvidenceRequired: true,
    humanConfirmationRequired: true,
    overrideReasonRequired: true,
    auditLoggingEnabled: true,
    preventVerificationWithoutEvidence: true,
    fairnessThreshold: 10.0,
    auditRetentionDays: 3650
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    notifyMissingEvidence: true,
    notifyHighRiskPending: true,
    notifyExceptionCreated: true,
    notifyOverrideRequested: true,
    notifyFinalApprovalPending: true
  });

  const [checklistConfig, setChecklistConfig] = useState<ChecklistConfiguration>({
    defaultVersion: '1.0',
    highRiskEvidence: 'Required',
    criticalEvidence: 'Required',
    humanConfirmation: 'Required',
    defaultExceptionSeverity: 'HIGH'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.settings.get();
        if (res.systemSettings) setSystemSettings(res.systemSettings);
        if (res.notificationSettings) setNotificationSettings(res.notificationSettings);
        if (res.checklistConfiguration) setChecklistConfig(res.checklistConfiguration);
      } catch (err: any) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.settings.updateSystem(systemSettings);
      await api.settings.updateNotifications(notificationSettings);
      await api.settings.updateChecklist(checklistConfig);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSystem = (field: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateNotification = (field: keyof NotificationSettings, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateChecklist = (field: keyof ChecklistConfiguration, value: any) => {
    setChecklistConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Manage hospital details, verification rules, and security
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 font-semibold shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Settings updated successfully</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Hospital Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Hospital Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Hospital Name</label>
              <input type="text" value={systemSettings.hospitalName} onChange={(e) => updateSystem('hospitalName', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Hospital ID</label>
              <input type="text" value={systemSettings.hospitalId} onChange={(e) => updateSystem('hospitalId', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Location</label>
              <input type="text" value={systemSettings.location} onChange={(e) => updateSystem('location', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Contact Email</label>
              <input type="email" value={systemSettings.contactEmail} onChange={(e) => updateSystem('contactEmail', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Contact Phone</label>
              <input type="text" value={systemSettings.contactPhone} onChange={(e) => updateSystem('contactPhone', e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* 2. Verification Rules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Verification Rules</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 'doctorApprovalRequired', label: "Require Doctor's Approval for Critical Steps", desc: "Critical checklist steps require authorized doctor confirmation before verification." },
              { id: 'highRiskEvidenceRequired', label: "Require Evidence for High-Risk Steps", desc: "High-risk checklist items cannot be verified without required evidence." },
              { id: 'humanConfirmationRequired', label: "Require Human Confirmation before Final Approval", desc: "Final pre-operative approval must always be explicitly confirmed by an authorized user." },
              { id: 'overrideReasonRequired', label: "Require Override Reason", desc: "Every override must contain a mandatory reason." },
              { id: 'preventVerificationWithoutEvidence', label: "Prevent Verification without Required Evidence", desc: "The system must prevent users from marking a checklist item verified when required evidence is missing." },
              { id: 'auditLoggingEnabled', label: "Enable Audit Logging", desc: "Important actions automatically create audit events." }
            ].map((rule) => (
              <label key={rule.id} className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={systemSettings[rule.id as keyof SystemSettings] as boolean}
                  onChange={(e) => updateSystem(rule.id as keyof SystemSettings, e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{rule.label}</span>
                  <span className="text-slate-500 text-xs mt-0.5 block">{rule.desc}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* 3. Fairness & Disparity Monitoring */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base text-slate-900">Fairness & Disparity Monitoring</h3>
            <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Synthetic Prototype Fairness Evaluation</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-slate-800 text-sm">Allowed Fairness Difference (%)</label>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Show a warning when the measured difference between predefined synthetic population groups exceeds this threshold.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{systemSettings.fairnessThreshold}%</div>
                <div className="text-xs text-slate-400 font-medium">Current threshold</div>
              </div>
            </div>
            
            <div className="pt-2 pb-4">
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="0.5" 
                value={systemSettings.fairnessThreshold}
                onChange={(e) => updateSystem('fairnessThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
              <p className="font-semibold text-slate-700 mb-2">How it works:</p>
              <code className="block bg-slate-100 p-2 rounded text-slate-600 mb-2">
                difference = absolute(Group A metric - Group B metric)
              </code>
              <ul className="space-y-1 text-slate-600">
                <li>If <span className="font-mono bg-slate-100 px-1 rounded">difference &gt; {systemSettings.fairnessThreshold}%</span> : <span className="text-red-600 font-semibold">WARNING: Measured group difference exceeds the configured monitoring threshold.</span></li>
                <li>If <span className="font-mono bg-slate-100 px-1 rounded">difference &le; {systemSettings.fairnessThreshold}%</span> : <span className="text-emerald-600 font-semibold">Within configured monitoring threshold.</span></li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* 6. Checklist Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Checklist Configuration</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Default Version</label>
              <select value={checklistConfig.defaultVersion} onChange={(e) => updateChecklist('defaultVersion', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="1.0">Version 1.0</option>
                <option value="1.1">Version 1.1</option>
                <option value="2.0">Version 2.0 (Beta)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">High-Risk Evidence</label>
              <select value={checklistConfig.highRiskEvidence} onChange={(e) => updateChecklist('highRiskEvidence', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="Required">Required</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Critical Evidence</label>
              <select value={checklistConfig.criticalEvidence} onChange={(e) => updateChecklist('criticalEvidence', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="Required">Required</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Human Confirmation</label>
              <select value={checklistConfig.humanConfirmation} onChange={(e) => updateChecklist('humanConfirmation', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="Required">Required</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Default Exception Severity</label>
              <select value={checklistConfig.defaultExceptionSeverity} onChange={(e) => updateChecklist('defaultExceptionSeverity', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* 5. Notification Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-base text-slate-900">Notifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { id: 'notifyMissingEvidence', label: "Notify when evidence is missing" },
              { id: 'notifyHighRiskPending', label: "Notify when a high-risk item is pending" },
              { id: 'notifyExceptionCreated', label: "Notify when an exception is created" },
              { id: 'notifyOverrideRequested', label: "Notify when an override is requested" },
              { id: 'notifyFinalApprovalPending', label: "Notify when final approval is pending" }
            ].map((rule) => (
              <label key={rule.id} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notificationSettings[rule.id as keyof NotificationSettings] as boolean}
                  onChange={(e) => updateNotification(rule.id as keyof NotificationSettings, e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700 text-sm">{rule.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* 7. Access Control */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">Access Control</h3>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Role</th>
                  <th className="p-3">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { role: 'Administrator', access: 'Full Access' },
                  { role: 'Surgeon', access: 'Checklist + Confirmation' },
                  { role: 'Nurse', access: 'Checklist + Evidence' },
                  { role: 'Anesthetist', access: 'Anesthesia Checklist' },
                  { role: 'Radiologist', access: 'Imaging Evidence' },
                  { role: 'Pathologist', access: 'Lab Evidence' },
                  { role: 'Cardiologist', access: 'Cardiac Clearance' },
                  { role: 'Auditor', access: 'Read-only Audit + Analytics' }
                ].map((item) => (
                  <tr key={item.role}>
                    <td className="p-3 font-medium text-slate-800">{item.role}</td>
                    <td className="p-3 text-slate-600">{item.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 italic">
            Note: Ordinary users cannot change role permissions. Only Administrators can modify role configurations.
          </p>
        </div>

        {/* 4. Security & History Logging */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Lock className="w-32 h-32 text-white" />
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700 relative z-10">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base">Security & History Logging</h3>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">Audit Logging:</span>
              <span className="font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/30">
                {systemSettings.auditLoggingEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl relative z-10">
            Important system actions are recorded in the audit history. <strong>Normal users cannot edit or delete audit records.</strong> The audit log is strictly append-only.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs relative z-10 pt-2">
            {[
              "Record Login Events",
              "Record Checklist Changes",
              "Record Evidence Uploads",
              "Record Evidence Verification",
              "Record Human Confirmations",
              "Record Exceptions",
              "Record Override Actions",
              "Record Role/Permission Changes"
            ].map(setting => (
              <div key={setting} className="flex items-center gap-2 text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{setting}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 relative z-10">
            <div className="text-sm font-mono text-slate-400">
              Audit Retention: <span className="text-white font-semibold">{systemSettings.auditRetentionDays} days</span> (10 Years)
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-colors flex items-center gap-2 border border-blue-500">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
