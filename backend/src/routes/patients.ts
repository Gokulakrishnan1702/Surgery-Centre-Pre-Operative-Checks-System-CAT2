import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
};

// GET /api/patients
router.get('/', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const { search, status, risk, page, limit } = req.query;
  const result = store.getPatients(req.user, {
    search: search as string,
    status: status as string,
    risk: risk as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 15
  });
  return res.json(result);
});

// GET /api/patients/:id
router.get('/:id', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const patient = store.getPatientById(id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  return res.json(patient);
});

// POST /api/patients
router.post('/', authenticateToken, requirePermission('EDIT_PATIENTS'), (req: AuthRequest, res: Response) => {
  const { name, age, gender, surgery_type, scheduled_date, risk_level, assigned_team } = req.body;

  if (!name || !surgery_type) {
    return res.status(400).json({ error: 'Name and surgery type are required' });
  }

  const nextCode = `P${10000 + store.patients.length + 1}`;
  const newPatient = {
    id: `pat-${Date.now()}`,
    patient_id: nextCode,
    name,
    age: age || 45,
    gender: gender || 'Male',
    surgery_type,
    scheduled_date: scheduled_date || '2025-04-30 09:00 AM',
    risk_level: risk_level || 'LOW',
    status: 'IN_PROGRESS' as const,
    assigned_team: assigned_team || 'General Surgery Care Team',
    population_group_id: (store.patients.length % 2 === 0) ? 'grp-A' : 'grp-B'
  };

  store.patients.unshift(newPatient);

  // Initialize checklist items for this patient
  const newItems = store.templates.map((tmpl, idx) => ({
    id: `chk-${newPatient.id}-${idx + 1}`,
    patient_id: newPatient.id,
    template_id: tmpl.id,
    name: tmpl.name,
    risk_level: tmpl.risk_level,
    required_role: tmpl.required_role,
    requires_evidence: tmpl.requires_evidence,
    requires_human_confirmation: tmpl.requires_human_confirmation,
    phase: tmpl.phase,
    phase_label: tmpl.phase_label,
    rule_explanation: tmpl.rule_explanation,
    status: 'NOT_STARTED' as const,
    human_confirmed: false,
    updated_at: new Date().toISOString()
  }));

  store.checklistItems.push(...newItems);

  store.addAuditLog({
    event_type: 'CHECKLIST_CREATED',
    patient_id: newPatient.id,
    patient_name: newPatient.name,
    checklist_step: 'Pre-Operative Checklist Initialized',
    user_id: req.user!.id,
    user_name: req.user!.name,
    user_role: req.user!.role,
    decision: 'CREATED',
    details: `Patient ${newPatient.name} (${newPatient.patient_id}) created with 10 standard checklist items.`
  });

  return res.status(201).json(newPatient);
});

// POST /api/patients/:id/final-approval
router.post('/:id/final-approval', authenticateToken, requirePermission('FINAL_APPROVAL'), (req: AuthRequest, res: Response) => {
  const { notes } = req.body;
  const id = getParam(req.params.id);
  try {
    const updated = store.submitFinalApproval(id, req.user!, notes);
    return res.json({
      message: 'Final pre-operative review successfully approved.',
      patient: updated
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/patients/:id/history
router.get('/:id/history', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const { range, type, role, status, search } = req.query;
  const history = store.getPatientHistory(id, {
    range: range as string,
    type: type as string,
    role: role as string,
    status: status as string,
    search: search as string
  });
  return res.json(history);
});

// GET /api/patients/:id/clinical-history
router.get('/:id/clinical-history', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const clinicalHistory = store.getPatientClinicalHistory(id);
  return res.json(clinicalHistory);
});

// GET /api/patients/:id/vitals/history
router.get('/:id/vitals/history', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const vitals = store.getPatientVitalsHistory(id);
  return res.json(vitals);
});

// GET /api/patients/:id/labs/history
router.get('/:id/labs/history', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const labs = store.getPatientLabsHistory(id);
  return res.json(labs);
});

// GET /api/patients/:id/risk-history
router.get('/:id/risk-history', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const riskHistory = store.getPatientRiskHistory(id);
  return res.json(riskHistory);
});

// GET /api/patients/:id/checklist-history
router.get('/:id/checklist-history', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const checklistHistory = store.getPatientChecklistHistory(id);
  return res.json(checklistHistory);
});

// GET /api/patients/:id/history/export
router.get('/:id/history/export', authenticateToken, requirePermission('VIEW_PATIENTS'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const format = (req.query.format as string) || 'csv';

  if (format === 'csv') {
    const csvData = store.exportPatientHistoryCsv(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="patient_history_${id}.csv"`);
    return res.send(csvData);
  }

  const history = store.getPatientHistory(id);
  return res.json(history);
});

export default router;
