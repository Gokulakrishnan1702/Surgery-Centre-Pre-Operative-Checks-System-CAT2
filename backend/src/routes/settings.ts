import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requirePermission } from '../middleware/auth';
import { store } from '../services/store';
import pool from '../config/db';

const router = Router();

// GET /api/settings
router.get('/', authenticateToken, requirePermission('MANAGE_SETTINGS'), async (req: AuthRequest, res: Response) => {
  try {
    // Try to get from database first
    try {
      const result = await pool.query('SELECT * FROM system_settings WHERE id = $1', ['global_config']);
      if (result.rows.length > 0) {
        const dbSettings = result.rows[0];
        
        // Update in-memory cache
        store.systemSettings = {
          hospitalName: dbSettings.hospital_name,
          hospitalId: dbSettings.hospital_id,
          location: dbSettings.location,
          contactEmail: dbSettings.contact_email,
          contactPhone: dbSettings.contact_phone,
          doctorApprovalRequired: dbSettings.doctor_approval_required,
          highRiskEvidenceRequired: dbSettings.high_risk_evidence_required,
          humanConfirmationRequired: dbSettings.human_confirmation_required,
          overrideReasonRequired: dbSettings.override_reason_required,
          auditLoggingEnabled: dbSettings.audit_logging_enabled,
          preventVerificationWithoutEvidence: dbSettings.prevent_verification_without_evidence,
          fairnessThreshold: parseFloat(dbSettings.fairness_threshold),
          auditRetentionDays: dbSettings.audit_retention_days
        };
        store.fairnessThreshold = parseFloat(dbSettings.fairness_threshold);
      }
    } catch (dbErr) {
      console.warn('Could not fetch settings from DB, falling back to memory store.');
    }

    return res.json({
      systemSettings: store.systemSettings,
      notificationSettings: store.notificationSettings,
      checklistConfiguration: store.checklistConfiguration
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// PUT /api/settings/system
router.put('/system', authenticateToken, requirePermission('MANAGE_SETTINGS'), async (req: AuthRequest, res: Response) => {
  try {

    const {
      hospitalName, hospitalId, location, contactEmail, contactPhone,
      doctorApprovalRequired, highRiskEvidenceRequired, humanConfirmationRequired,
      overrideReasonRequired, auditLoggingEnabled, preventVerificationWithoutEvidence,
      fairnessThreshold, auditRetentionDays
    } = req.body;

    // Validate
    if (!hospitalName || typeof hospitalName !== 'string') {
      return res.status(400).json({ error: 'Hospital Name is required' });
    }
    
    // Save to Database
    try {
      await pool.query(
        `INSERT INTO system_settings (
          id, hospital_name, hospital_id, location, contact_email, contact_phone,
          doctor_approval_required, high_risk_evidence_required, human_confirmation_required,
          override_reason_required, audit_logging_enabled, prevent_verification_without_evidence,
          fairness_threshold, audit_retention_days, updated_by, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          hospital_name = EXCLUDED.hospital_name,
          hospital_id = EXCLUDED.hospital_id,
          location = EXCLUDED.location,
          contact_email = EXCLUDED.contact_email,
          contact_phone = EXCLUDED.contact_phone,
          doctor_approval_required = EXCLUDED.doctor_approval_required,
          high_risk_evidence_required = EXCLUDED.high_risk_evidence_required,
          human_confirmation_required = EXCLUDED.human_confirmation_required,
          override_reason_required = EXCLUDED.override_reason_required,
          audit_logging_enabled = EXCLUDED.audit_logging_enabled,
          prevent_verification_without_evidence = EXCLUDED.prevent_verification_without_evidence,
          fairness_threshold = EXCLUDED.fairness_threshold,
          audit_retention_days = EXCLUDED.audit_retention_days,
          updated_by = EXCLUDED.updated_by,
          updated_at = CURRENT_TIMESTAMP`,
        [
          'global_config', hospitalName, hospitalId, location, contactEmail, contactPhone,
          doctorApprovalRequired, highRiskEvidenceRequired, humanConfirmationRequired,
          overrideReasonRequired, auditLoggingEnabled, preventVerificationWithoutEvidence,
          fairnessThreshold, auditRetentionDays, req.user!.id
        ]
      );
    } catch (dbErr) {
      console.warn('Could not save settings to DB, saving to memory store only.');
    }

    // Capture old state for audit
    const oldSettings = { ...store.systemSettings };

    // Update Memory Store
    store.systemSettings = {
      hospitalName, hospitalId, location, contactEmail, contactPhone,
      doctorApprovalRequired, highRiskEvidenceRequired, humanConfirmationRequired,
      overrideReasonRequired, auditLoggingEnabled, preventVerificationWithoutEvidence,
      fairnessThreshold, auditRetentionDays
    };
    store.fairnessThreshold = fairnessThreshold;

    // Create audit event
    const oldAuditLogging = oldSettings.auditLoggingEnabled;
    // Temporarily ensure audit logging is enabled if they just turned it off, 
    // so we can record that it was turned off.
    store.systemSettings.auditLoggingEnabled = true;
    
    store.addAuditLog({
      event_type: 'CHECKLIST_UPDATED', // using existing type for simplicity
      user_id: req.user!.id,
      user_name: req.user!.name,
      user_role: req.user!.role as any,
      decision: 'SETTINGS_UPDATED',
      details: JSON.stringify({
        changed_setting: 'system_settings',
        old_value: oldSettings,
        new_value: store.systemSettings
      })
    });
    
    // Restore actual audit logging setting
    store.systemSettings.auditLoggingEnabled = auditLoggingEnabled;

    return res.json({ message: 'System settings updated successfully', settings: store.systemSettings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// PUT /api/settings/notifications
router.put('/notifications', authenticateToken, requirePermission('MANAGE_SETTINGS'), async (req: AuthRequest, res: Response) => {
  try {
    store.notificationSettings = { ...store.notificationSettings, ...req.body };
    return res.json({ message: 'Notification settings updated', settings: store.notificationSettings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// PUT /api/settings/checklist
router.put('/checklist', authenticateToken, requirePermission('MANAGE_SETTINGS'), async (req: AuthRequest, res: Response) => {
  try {
    store.checklistConfiguration = { ...store.checklistConfiguration, ...req.body };
    return res.json({ message: 'Checklist configuration updated', settings: store.checklistConfiguration });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update checklist configuration' });
  }
});

export default router;
