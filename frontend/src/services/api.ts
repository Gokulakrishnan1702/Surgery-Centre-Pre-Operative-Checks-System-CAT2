import {
  User,
  Patient,
  Surgery,
  SurgeryStatus,
  ChecklistItem,
  EvidenceRecord,
  ExceptionRecord,
  OverrideRecord,
  AuditRecord,
  DashboardKPIs,
  FairnessEvaluation,
  ExperimentDataset,
  ClinicalNotification,
  RiskAssessmentResult,
  ModelGovernanceInfo,
  ClinicalHistoryEntry,
  VitalRecord,
  LabResultRecord,
  RiskHistoryRecord,
  ChecklistHistoryRecord,
  PatientHistoryResponse
} from '../types';

const API_BASE = '/api';

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('surgical_safety_token');
  const demoRole = localStorage.getItem('surgical_safety_demo_role');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (demoRole) {
    headers['x-demo-role'] = demoRole;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password?: string) =>
      fetchWithAuth<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: password || 'password' }),
      }),
    signup: (data: {
      name: string;
      email: string;
      password: string;
      role: string;
      department?: string;
      staff_id?: string;
      phone?: string;
    }) =>
      fetchWithAuth<{ token: string; user: User; message: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      fetchWithAuth<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      fetchWithAuth<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
    getMe: () => fetchWithAuth<{ user: User }>('/auth/me'),
    getDemoAccounts: () =>
      fetchWithAuth<{
        accounts: Array<{
          email: string;
          name: string;
          role: string;
          department: string;
          staff_id: string;
          description: string;
        }>;
      }>('/auth/demo-accounts'),
  },

  patients: {
    list: (params?: { search?: string; status?: string; risk?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status) query.append('status', params.status);
      if (params?.risk) query.append('risk', params.risk);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return fetchWithAuth<{ patients: Patient[]; total: number; page: number; totalPages: number }>(
        `/patients?${query.toString()}`
      );
    },
    getById: (id: string) =>
      fetchWithAuth<
        Patient & {
          surgery?: Surgery;
          checklist: ChecklistItem[];
          evidence: EvidenceRecord[];
          exceptions: ExceptionRecord[];
          auditLogs: AuditRecord[];
        }
      >(`/patients/${id}`),
    create: (data: Partial<Patient>) =>
      fetchWithAuth<Patient>('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    finalApproval: (id: string, notes?: string) =>
      fetchWithAuth<{ message: string; patient: Patient }>(`/patients/${id}/final-approval`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),
    getHistory: (
      id: string,
      filters?: { range?: string; type?: string; role?: string; status?: string; search?: string }
    ) => {
      const query = new URLSearchParams();
      if (filters?.range) query.append('range', filters.range);
      if (filters?.type) query.append('type', filters.type);
      if (filters?.role) query.append('role', filters.role);
      if (filters?.status) query.append('status', filters.status);
      if (filters?.search) query.append('search', filters.search);
      return fetchWithAuth<PatientHistoryResponse>(`/patients/${id}/history?${query.toString()}`);
    },
    getClinicalHistory: (id: string) => fetchWithAuth<ClinicalHistoryEntry[]>(`/patients/${id}/clinical-history`),
    getVitalsHistory: (id: string) => fetchWithAuth<VitalRecord[]>(`/patients/${id}/vitals/history`),
    getLabsHistory: (id: string) => fetchWithAuth<LabResultRecord[]>(`/patients/${id}/labs/history`),
    getRiskHistory: (id: string) => fetchWithAuth<RiskHistoryRecord[]>(`/patients/${id}/risk-history`),
    getChecklistHistory: (id: string) => fetchWithAuth<ChecklistHistoryRecord[]>(`/patients/${id}/checklist-history`),
    exportHistoryUrl: (id: string, format: string = 'csv') =>
      `/api/patients/${id}/history/export?format=${format}`,
  },

  checklist: {
    getByPatient: (patientId: string) =>
      fetchWithAuth<ChecklistItem[]>(`/checklist/patient/${patientId}`),
    getRoster: (params?: { phase?: string; risk?: string; status?: string; role?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.phase) query.append('phase', params.phase);
      if (params?.risk) query.append('risk', params.risk);
      if (params?.status) query.append('status', params.status);
      if (params?.role) query.append('role', params.role);
      if (params?.search) query.append('search', params.search);
      return fetchWithAuth<{
        items: ChecklistItem[];
        total: number;
        stats: {
          total: number;
          verifiedCount: number;
          pendingCount: number;
          exceptionCount: number;
          criticalCount: number;
          completionRate: number;
        };
      }>(`/checklist/roster?${query.toString()}`);
    },
    verify: (
      itemId: string,
      data?: { evidenceId?: string; filename?: string; source?: string; notes?: string }
    ) =>
      fetchWithAuth<{ message: string; item: ChecklistItem; pendingConfirmation: boolean }>(
        `/checklist/${itemId}/verify`,
        {
          method: 'PUT',
          body: JSON.stringify(data || {}),
        }
      ),
    confirm: (itemId: string, comment: string, _reviewed?: boolean) =>
      fetchWithAuth<{ message: string; item: ChecklistItem }>(`/checklist/${itemId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ comment, decision: 'APPROVED' }),
      }),
  },

  evidence: {
    list: (params?: { patient_id?: string; checklist_item_id?: string; evidence_type?: string }) => {
      const query = new URLSearchParams();
      if (params?.patient_id) query.append('patient_id', params.patient_id);
      if (params?.checklist_item_id) query.append('checklist_item_id', params.checklist_item_id);
      if (params?.evidence_type) query.append('evidence_type', params.evidence_type);
      return fetchWithAuth<EvidenceRecord[]>(`/evidence?${query.toString()}`);
    },
    getById: (id: string) => fetchWithAuth<EvidenceRecord>(`/evidence/${id}`),
    upload: (data: {
      patient_id: string;
      checklist_item_id: string;
      evidence_type: string;
      source: string;
      filename: string;
      file_size?: string;
      notes?: string;
    }) =>
      fetchWithAuth<EvidenceRecord>('/evidence', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verify: (id: string) =>
      fetchWithAuth<{ message: string; evidence: EvidenceRecord }>(`/evidence/${id}/verify`, {
        method: 'POST',
      }),
    reject: (id: string, reason: string) =>
      fetchWithAuth<{ message: string; evidence: EvidenceRecord }>(`/evidence/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  risk: {
    getForPatient: (patientId: string) =>
      fetchWithAuth<RiskAssessmentResult>(`/risk/patient/${patientId}`),
  },

  exceptions: {
    list: (params?: { patient_id?: string; status?: string; severity?: string; assigned_role?: string }) => {
      const query = new URLSearchParams();
      if (params?.patient_id) query.append('patient_id', params.patient_id);
      if (params?.status) query.append('status', params.status);
      if (params?.severity) query.append('severity', params.severity);
      if (params?.assigned_role) query.append('assigned_role', params.assigned_role);
      return fetchWithAuth<ExceptionRecord[]>(`/exceptions?${query.toString()}`);
    },
    create: (data: {
      patient_id: string;
      checklist_item_id: string;
      category: string;
      reason: string;
      severity?: string;
    }) =>
      fetchWithAuth<ExceptionRecord>('/exceptions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    resolve: (id: string, resolution: string) =>
      fetchWithAuth<{ message: string; exception: ExceptionRecord }>(`/exceptions/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution }),
      }),
  },

  overrides: {
    list: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      return fetchWithAuth<OverrideRecord[]>(`/overrides?${query.toString()}`);
    },
    request: (data: {
      patient_id: string;
      checklist_item_id: string;
      reason: string;
      business_reason: string;
      impact: string;
    }) =>
      fetchWithAuth<OverrideRecord>('/overrides', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    decide: (id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) =>
      fetchWithAuth<OverrideRecord>(`/overrides/${id}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision, notes }),
      }),
    approve: (id: string, notes?: string) =>
      fetchWithAuth<{ message: string; override: OverrideRecord }>(`/overrides/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),
    reject: (id: string, notes?: string) =>
      fetchWithAuth<{ message: string; override: OverrideRecord }>(`/overrides/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),
  },

  audit: {
    list: (params?: { event_type?: string; role?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.event_type) query.append('event_type', params.event_type);
      if (params?.role) query.append('role', params.role);
      if (params?.search) query.append('search', params.search);
      return fetchWithAuth<{ logs: AuditRecord[]; total: number; tamper_proof_notice: string }>(
        `/audit-logs?${query.toString()}`
      );
    },
    exportUrl: (params?: { event_type?: string; role?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.event_type) query.append('event_type', params.event_type);
      if (params?.role) query.append('role', params.role);
      if (params?.search) query.append('search', params.search);
      return `/api/audit-logs/export?${query.toString()}`;
    },
  },

  surgeries: {
    list: (params?: { status?: string; risk?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.risk) query.append('risk', params.risk);
      if (params?.search) query.append('search', params.search);
      return fetchWithAuth<{ surgeries: Surgery[]; total: number }>(`/surgeries?${query.toString()}`);
    },
    getById: (id: string) => fetchWithAuth<Surgery>(`/surgeries/${id}`),
    create: (data: Partial<Surgery>) =>
      fetchWithAuth<Surgery>('/surgeries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: SurgeryStatus, notes?: string) =>
      fetchWithAuth<{ message: string; surgery: Surgery }>(`/surgeries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      }),
  },

  analytics: {
    getOverview: () => fetchWithAuth<DashboardKPIs>('/analytics/overview'),
    getDashboardKpis: () => fetchWithAuth<DashboardKPIs>('/analytics/overview'),
    getExperimentData: () => fetchWithAuth<ExperimentDataset>('/analytics/experiment'),
    getExperiment: () => fetchWithAuth<ExperimentDataset>('/analytics/experiment'),
  },

  fairness: {
    evaluate: (threshold?: number) => {
      const query = threshold !== undefined ? `?threshold=${threshold}` : '';
      return fetchWithAuth<FairnessEvaluation>(`/fairness${query}`);
    },
    get: (threshold?: number) => {
      const query = threshold !== undefined ? `?threshold=${threshold}` : '';
      return fetchWithAuth<FairnessEvaluation>(`/fairness${query}`);
    },
    run: async (threshold?: number) => {
      const query = threshold !== undefined ? `?threshold=${threshold}` : '';
      const evaluation = await fetchWithAuth<FairnessEvaluation>(`/fairness${query}`);
      return { evaluation };
    },
  },

  notifications: {
    list: () =>
      fetchWithAuth<{ notifications: ClinicalNotification[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) =>
      fetchWithAuth<ClinicalNotification>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () =>
      fetchWithAuth<{ message: string }>('/notifications/read-all', { method: 'POST' }),
  },

  models: {
    list: () =>
      fetchWithAuth<{ models: ModelGovernanceInfo[]; governance_notice: string }>('/models'),
  },

  settings: {
    get: () => fetchWithAuth<any>('/settings'),
    update: (data: any) =>
      fetchWithAuth<any>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateSystem: (data: any) =>
      fetchWithAuth<any>('/settings/system', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateNotifications: (data: any) =>
      fetchWithAuth<any>('/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateChecklist: (data: any) =>
      fetchWithAuth<any>('/settings/checklist', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  users: {
    list: () => fetchWithAuth<{ users: User[] }>('/users'),
    updateRole: (id: string, role: string) =>
      fetchWithAuth<{ message: string; user: User }>(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
  }
};
