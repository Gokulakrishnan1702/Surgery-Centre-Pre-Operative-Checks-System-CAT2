import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/evidence
router.get('/', authenticateToken, requirePermission('VIEW_EVIDENCE'), (req: AuthRequest, res: Response) => {
  const { patient_id, checklist_item_id, evidence_type } = req.query;
  let list = [...store.evidence];

  if (patient_id) {
    list = list.filter(e => e.patient_id === patient_id);
  }
  if (checklist_item_id) {
    list = list.filter(e => e.checklist_item_id === checklist_item_id);
  }
  if (evidence_type && evidence_type !== 'ALL') {
    list = list.filter(e => e.evidence_type === evidence_type);
  }

  const enriched = list.map(e => {
    const pt = store.patients.find(p => p.id === e.patient_id);
    return {
      ...e,
      patient_name: pt ? pt.name : 'Unknown Patient',
      patient_code: pt ? pt.patient_id : 'P00000'
    };
  });

  return res.json(enriched);
});

// GET /api/evidence/:id
router.get('/:id', authenticateToken, requirePermission('VIEW_EVIDENCE'), (req: AuthRequest, res: Response) => {
  const record = store.evidence.find(e => e.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Evidence record not found' });
  }
  const pt = store.patients.find(p => p.id === record.patient_id);
  return res.json({
    ...record,
    patient_name: pt ? pt.name : 'Unknown Patient',
    patient_code: pt ? pt.patient_id : 'P00000'
  });
});

// POST /api/evidence (Synthetic upload with SHA-256 hash generation)
router.post('/', authenticateToken, requirePermission('UPLOAD_EVIDENCE'), (req: AuthRequest, res: Response) => {
  const { patient_id, checklist_item_id, evidence_type, source, filename, file_size, notes } = req.body;

  if (!patient_id || !checklist_item_id || !source || !filename) {
    return res.status(400).json({ error: 'Patient ID, checklist item ID, source, and filename are required.' });
  }

  try {
    const ev = store.attachEvidence({
      patient_id,
      checklist_item_id,
      evidence_type: evidence_type || 'DOCUMENT',
      source,
      filename,
      file_size: file_size || '320 KB',
      user: req.user!,
      notes
    });

    return res.status(201).json(ev);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/evidence/:id/verify
router.post('/:id/verify', authenticateToken, requirePermission('VERIFY_EVIDENCE'), (req: AuthRequest, res: Response) => {
  const ev = store.evidence.find(e => e.id === req.params.id);
  if (!ev) {
    return res.status(404).json({ error: 'Evidence not found' });
  }

  ev.verification_status = 'VERIFIED';

  store.addAuditLog({
    event_type: 'EVIDENCE_VERIFIED',
    patient_id: ev.patient_id,
    checklist_step: ev.checklist_step_name,
    user_id: req.user!.id,
    user_name: req.user!.name,
    user_role: req.user!.role,
    evidence_source: ev.source,
    evidence_id: ev.id,
    sha256_hash: ev.sha256_hash,
    decision: 'EVIDENCE_VERIFIED',
    details: `Evidence ${ev.filename} (SHA-256: ${ev.sha256_hash?.slice(0, 10)}...) verified by ${req.user!.name} (${req.user!.role}).`
  });

  return res.json({ message: 'Evidence marked as verified', evidence: ev });
});

// POST /api/evidence/:id/reject
router.post('/:id/reject', authenticateToken, requirePermission('VERIFY_EVIDENCE'), (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const ev = store.evidence.find(e => e.id === req.params.id);
  if (!ev) {
    return res.status(404).json({ error: 'Evidence not found' });
  }

  ev.verification_status = 'REJECTED';
  ev.rejection_reason = reason || 'Evidence failed quality or clinical verification threshold.';

  store.addAuditLog({
    event_type: 'EVIDENCE_REJECTED',
    patient_id: ev.patient_id,
    checklist_step: ev.checklist_step_name,
    user_id: req.user!.id,
    user_name: req.user!.name,
    user_role: req.user!.role,
    evidence_source: ev.source,
    evidence_id: ev.id,
    sha256_hash: ev.sha256_hash,
    decision: 'EVIDENCE_REJECTED',
    details: `Evidence ${ev.filename} rejected by ${req.user!.name}: "${ev.rejection_reason}".`
  });

  return res.json({ message: 'Evidence marked as rejected', evidence: ev });
});

export default router;
