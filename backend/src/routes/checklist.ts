import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// Helper to normalize route params
const getParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
};

// GET /api/checklist/roster (Multi-patient aggregated checklist items)
router.get('/roster', authenticateToken, requirePermission('VIEW_CHECKLIST'), (req: AuthRequest, res: Response) => {
  const { phase, risk, status, role, search } = req.query;
  let items = [...store.checklistItems];

  if (phase && phase !== 'ALL') {
    items = items.filter(i => i.phase === phase);
  }
  if (risk && risk !== 'ALL') {
    items = items.filter(i => i.risk_level === risk);
  }
  if (status && status !== 'ALL') {
    items = items.filter(i => i.status === status);
  }
  if (role && role !== 'ALL') {
    items = items.filter(i => i.required_role === role);
  }

  // Enrich with patient and evidence metadata
  const enriched = items.map(item => {
    const pt = store.patients.find(p => p.id === item.patient_id);
    const evCount = store.evidence.filter(e => e.checklist_item_id === item.id).length;
    return {
      ...item,
      patient_name: pt ? pt.name : 'Unknown Patient',
      patient_code: pt ? pt.patient_id : 'P00000',
      surgery_type: pt ? pt.surgery_type : 'General Surgery',
      scheduled_date: pt ? pt.scheduled_date : '',
      patient_risk_level: pt ? pt.risk_level : item.risk_level,
      evidence_count: evCount
    };
  });

  let filtered = enriched;
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.patient_name.toLowerCase().includes(q) ||
      i.patient_code.toLowerCase().includes(q) ||
      i.surgery_type.toLowerCase().includes(q) ||
      (i.required_role && i.required_role.toLowerCase().includes(q))
    );
  }

  // Calculate summary statistics
  const total = filtered.length;
  const verifiedCount = filtered.filter(i => i.status === 'VERIFIED' || i.status === 'OVERRIDE').length;
  const pendingCount = filtered.filter(i => i.status === 'PENDING').length;
  const exceptionCount = filtered.filter(i => i.status === 'EXCEPTION').length;
  const criticalCount = filtered.filter(i => i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH').length;

  return res.json({
    items: filtered,
    total,
    stats: {
      total,
      verifiedCount,
      pendingCount,
      exceptionCount,
      criticalCount,
      completionRate: total > 0 ? Math.round((verifiedCount / total) * 100) : 0
    }
  });
});

// GET /api/checklist/templates
router.get('/templates', authenticateToken, requirePermission('VIEW_CHECKLIST'), (req: AuthRequest, res: Response) => {
  return res.json(store.templates);
});

// GET /api/checklist/patient/:patientId
router.get('/patient/:patientId', authenticateToken, requirePermission('VIEW_CHECKLIST'), (req: AuthRequest, res: Response) => {
  const patientId = getParam(req.params.patientId);
  const items = store.getChecklistByPatient(patientId);
  return res.json(items);
});

// PUT /api/checklist/:id/verify
router.put('/:id/verify', authenticateToken, requirePermission('EDIT_CHECKLIST'), (req: AuthRequest, res: Response) => {
  const { evidenceId, filename, source, notes } = req.body;
  const id = getParam(req.params.id);
  try {
    const item = store.checklistItems.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Checklist item not found' });

    if (evidenceId || filename) {
      store.attachEvidence({
        patient_id: item.patient_id,
        checklist_item_id: item.id,
        evidence_type: 'DOCUMENT',
        source: source || 'EMR Integration',
        filename: filename || 'Verification_Evidence.pdf',
        notes,
        user: req.user!
      });
    }

    if (item.requires_human_confirmation && !item.human_confirmed) {
      item.status = 'PENDING';
      item.updated_at = new Date().toISOString();
      return res.json({
        message: 'Evidence attached. Mandatory specialist human confirmation required to finalize verification.',
        item,
        pendingConfirmation: true
      });
    }

    const verified = store.verifyChecklistItem(id, req.user!, notes);
    return res.json({
      message: 'Checklist item verified successfully.',
      item: verified,
      pendingConfirmation: false
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/checklist/:id/confirm
router.post('/:id/confirm', authenticateToken, requirePermission('CONFIRM_HIGH_RISK'), (req: AuthRequest, res: Response) => {
  const { comment, decision } = req.body;
  const id = getParam(req.params.id);
  try {
    const updatedItem = store.confirmHumanReview({
      checklist_item_id: id,
      decision: decision === 'REJECTED' ? 'REJECTED' : 'APPROVED',
      comment: comment || 'Specialist safety criteria confirmed.',
      user: req.user!
    });
    return res.json({
      message: 'Human confirmation recorded and checklist item verified.',
      item: updatedItem
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/checklist/:id/rule (Why is this required? rule engine)
router.get('/:id/rule', authenticateToken, requirePermission('VIEW_CHECKLIST'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const item = store.checklistItems.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Checklist item not found' });

  // Return rule details or compute structured safety rule
  const rule = item.rule_details || {
    rule: `System Safety Rule: Mandatory verification of "${item.name}" prior to proceeding to surgical timeout.`,
    risk_level: item.risk_level,
    required_evidence: item.requires_evidence ? `${item.name} supporting diagnostic record / EMR extract` : 'Not mandated for low-risk tier',
    responsible_role: item.required_role,
    human_confirmation: item.requires_human_confirmation ? 'REQUIRED: Explicit clinical sign-off required' : 'Optional / Self-verification permitted',
    override: item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH' ? 'Senior authorization required (Lead Surgeon or CMO) with dual justification' : 'Clinical justification required',
    evidence_validity: 'Document must be authentic, cryptographic SHA-256 verified, within valid validity window (<72h), and not conflicting with EMR.',
    source: 'SurgiGate Configurable Hospital Safety Rule Engine (System Safety Rule)'
  };

  return res.json({
    item_id: item.id,
    item_name: item.name,
    rule
  });
});

// POST /api/checklist/:id/validate-evidence
router.post('/:id/validate-evidence', authenticateToken, requirePermission('VIEW_CHECKLIST'), (req: AuthRequest, res: Response) => {
  const id = getParam(req.params.id);
  const { evidenceId } = req.body;
  try {
    const validation = store.validateEvidence(id, evidenceId);
    return res.json(validation);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
