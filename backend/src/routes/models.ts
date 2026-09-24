import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { ModelGovernanceInfo } from '../models/types';

const router = Router();

// GET /api/models
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const models: ModelGovernanceInfo[] = [
    {
      model_name: 'SurgicalRisk-XAI-Ensemble',
      version: 'v2.4-ClinicalExplain',
      algorithm: 'Gradient Boosted Decision Forest with SHAP Attribution Kernel',
      task: 'Pre-Operative Perioperative Complication & Evidence Gating Risk Assessment',
      training_dataset: 'MIMIC-IV Perioperative & Synthetic Multi-Institutional Clinical Cohort (N=12,450)',
      training_date: '2025-11-15',
      accuracy: 0.942,
      precision: 0.928,
      recall: 0.956,
      f1_score: 0.941,
      roc_auc: 0.974,
      status: 'ACTIVE',
      features_analyzed: [
        'Patient Age & Preserved Physiological Reserve',
        'Surgical Acuity & Procedure Invasiveness Index',
        'Specialist Attestation & Pre-Op Evidence Completeness',
        'Coagulation & Hematological Abnormalities (INR, Platelets, Hb)',
        'Echocardiogram Ejection Fraction & Cardiovascular Comorbidities',
        'Documented Pharmacological Allergies & Cross-Reactivity Risk',
        'Unresolved Pre-Op Checklist Exceptions Count'
      ]
    },
    {
      model_name: 'SurgicalDelay-Predictor',
      version: 'v1.2-Staging',
      algorithm: 'Random Survival Forest',
      task: 'Operating Room Start-Time Delay & Case Turnover Prediction',
      training_dataset: 'Internal Hospital Information System (HIS) Log (N=4,800)',
      training_date: '2026-01-20',
      accuracy: 0.884,
      precision: 0.862,
      recall: 0.895,
      f1_score: 0.878,
      roc_auc: 0.912,
      status: 'EVALUATION',
      features_analyzed: [
        'Missing Pre-Op Evidence Hours Before Slotted Start',
        'Anesthesia Pre-Induction Readiness Delay',
        'Blood Bank Cross-Match Turnaround Time',
        'Specialist Attestation Turnaround Time'
      ]
    }
  ];

  return res.json({
    models,
    governance_notice: 'All models operate strictly in a Decision-Support mode under human-in-the-loop oversight. Autonomous medical decisions are strictly prohibited.'
  });
});

export default router;
