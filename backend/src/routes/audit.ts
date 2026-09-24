import { Router, Response } from 'express';
import { store } from '../services/store';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs
router.get('/', authenticateToken, requirePermission('VIEW_AUDIT'), (req: AuthRequest, res: Response) => {
  const { event_type, role, search } = req.query;
  let logs = [...store.auditLogs];

  if (event_type && event_type !== 'ALL') {
    logs = logs.filter(l => l.event_type === event_type);
  }
  if (role && role !== 'ALL') {
    logs = logs.filter(l => l.user_role === role);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    logs = logs.filter(l =>
      l.details.toLowerCase().includes(q) ||
      (l.patient_name && l.patient_name.toLowerCase().includes(q)) ||
      (l.checklist_step && l.checklist_step.toLowerCase().includes(q)) ||
      l.user_name.toLowerCase().includes(q)
    );
  }

  return res.json({
    logs,
    total: logs.length,
    tamper_proof_notice: 'Audit records are append-only, cryptographically traceable, and cannot be edited or deleted.'
  });
});

// GET /api/audit-logs/export
router.get('/export', authenticateToken, requirePermission('VIEW_AUDIT'), (req: AuthRequest, res: Response) => {
  const { event_type, role, search } = req.query;
  let logs = [...store.auditLogs];

  if (event_type && event_type !== 'ALL') {
    logs = logs.filter(l => l.event_type === event_type);
  }
  if (role && role !== 'ALL') {
    logs = logs.filter(l => l.user_role === role);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    logs = logs.filter(l =>
      l.details.toLowerCase().includes(q) ||
      (l.patient_name && l.patient_name.toLowerCase().includes(q)) ||
      (l.checklist_step && l.checklist_step.toLowerCase().includes(q)) ||
      l.user_name.toLowerCase().includes(q)
    );
  }

  const escapeCsv = (str: string | undefined | null) => {
    if (!str) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headers = ['Log ID', 'Timestamp', 'Event Type', 'Patient ID', 'Patient Name', 'Checklist Step', 'User ID', 'Clinician Name', 'Role', 'Decision', 'Forensic Details'];
  const rows = logs.map(l => [
    escapeCsv(l.id),
    escapeCsv(l.timestamp),
    escapeCsv(l.event_type),
    escapeCsv(l.patient_id),
    escapeCsv(l.patient_name),
    escapeCsv(l.checklist_step),
    escapeCsv(l.user_id),
    escapeCsv(l.user_name),
    escapeCsv(l.user_role),
    escapeCsv(l.decision),
    escapeCsv(l.details)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const filename = `forensic_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(csvContent);
});

export default router;
