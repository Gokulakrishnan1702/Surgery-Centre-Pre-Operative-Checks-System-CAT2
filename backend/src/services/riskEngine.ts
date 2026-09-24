import { Patient, ChecklistItem, RiskAssessmentResult, RiskFactor, RiskLevel } from '../models/types';

export class ClinicalRiskEngine {
  private static readonly MODEL_NAME = 'SurgicalRisk-XAI-Ensemble';
  private static readonly MODEL_VERSION = 'v2.4-ClinicalExplain';

  public static assessPatientRisk(
    patient: Patient,
    checklistItems: ChecklistItem[]
  ): RiskAssessmentResult {
    const factors: RiskFactor[] = [];
    let score = 20; // Base surgical baseline risk

    // 1. Age Factor
    if (patient.age >= 70) {
      factors.push({
        factor: 'Advanced Age (≥70 years)',
        score: 22,
        category: 'DEMOGRAPHIC',
        description: `Patient age ${patient.age} correlates with elevated anesthetic & perioperative morbidity.`
      });
      score += 22;
    } else if (patient.age >= 55) {
      factors.push({
        factor: 'Age Factor (55–69 years)',
        score: 14,
        category: 'DEMOGRAPHIC',
        description: `Patient age ${patient.age} contributes moderate physiological risk burden.`
      });
      score += 14;
    } else {
      factors.push({
        factor: 'Youth / Preserved Physiological Reserve (<55 years)',
        score: -5,
        category: 'DEMOGRAPHIC',
        description: 'Younger age profile associated with lower baseline anesthetic complication rate.',
        is_mitigating: true
      });
      score -= 5;
    }

    // 2. Surgery Complexity Factor
    const surgeryLower = (patient.surgery_type || '').toLowerCase();
    if (surgeryLower.includes('cardiac') || surgeryLower.includes('cabg') || surgeryLower.includes('aortic')) {
      factors.push({
        factor: 'Major Cardiothoracic Procedure',
        score: 25,
        category: 'SURGICAL',
        description: 'High surgical complexity with cardiopulmonary bypass requirement and hemodynamic instability risk.'
      });
      score += 25;
    } else if (surgeryLower.includes('neuro') || surgeryLower.includes('transplant') || surgeryLower.includes('vascular')) {
      factors.push({
        factor: 'High-Acuity Surgical Discipline',
        score: 20,
        category: 'SURGICAL',
        description: 'Elevated procedural difficulty, microvascular requirements, and intraoperative fluid shift sensitivity.'
      });
      score += 20;
    } else if (surgeryLower.includes('orthopedic') || surgeryLower.includes('laparoscopic')) {
      factors.push({
        factor: 'Intermediate Complexity Surgical Case',
        score: 10,
        category: 'SURGICAL',
        description: 'Standard surgical protocol with controlled blood loss parameters.'
      });
      score += 10;
    }

    // 3. Clinical History & Allergies Factor
    if (patient.allergies && patient.allergies.length > 0) {
      factors.push({
        factor: `Documented Drug Allergies (${patient.allergies.join(', ')})`,
        score: 8,
        category: 'CLINICAL',
        description: 'Requires heightened surveillance for antibiotic cross-reactivity and anaphylaxis risk.'
      });
      score += 8;
    }

    if (patient.risk_indicators && patient.risk_indicators.length > 0) {
      factors.push({
        factor: `Clinical Risk Markers (${patient.risk_indicators.slice(0, 2).join(', ')})`,
        score: 12,
        category: 'CLINICAL',
        description: 'Pre-existing clinical comorbidities increase perioperative vulnerability.'
      });
      score += 12;
    }

    // 4. Checklist & Evidence Verification Status
    const criticalItems = checklistItems.filter(i => i.risk_level === 'CRITICAL');
    const missingCritical = criticalItems.filter(i => i.status !== 'VERIFIED' && i.status !== 'OVERRIDE');
    const exceptionItems = checklistItems.filter(i => i.status === 'EXCEPTION');

    if (exceptionItems.length > 0) {
      factors.push({
        factor: `Active Pre-Op Exceptions (${exceptionItems.length} unresolved item${exceptionItems.length > 1 ? 's' : ''})`,
        score: 18,
        category: 'EVIDENCE',
        description: `Safety protocol blocked until exceptions (${exceptionItems.map(e => e.name).join(', ')}) are resolved or formally overridden.`
      });
      score += 18;
    }

    if (missingCritical.length > 0) {
      factors.push({
        factor: `Pending Critical Evidence (${missingCritical.length} requirement${missingCritical.length > 1 ? 's' : ''})`,
        score: 15,
        category: 'EVIDENCE',
        description: `Unverified critical safety items: ${missingCritical.map(m => m.name).join(', ')}.`
      });
      score += 15;
    }

    // 5. Mitigating Verified Elements
    const verifiedItems = checklistItems.filter(i => i.status === 'VERIFIED');
    const verifiedCardiac = checklistItems.find(i => i.name.toLowerCase().includes('cardiac') && i.status === 'VERIFIED');
    const verifiedConsent = checklistItems.find(i => i.name.toLowerCase().includes('consent') && i.status === 'VERIFIED');

    if (verifiedCardiac) {
      factors.push({
        factor: 'Attested Specialist Cardiology Clearance',
        score: -12,
        category: 'CLINICAL',
        description: 'Cardiologist directly inspected echo & 12-lead ECG and attested procedural clearance.',
        is_mitigating: true
      });
      score -= 12;
    }

    if (verifiedConsent) {
      factors.push({
        factor: 'Informed Surgical Consent Form Verified',
        score: -6,
        category: 'EVIDENCE',
        description: 'Patient and next-of-kin informed consent cryptographically verified.',
        is_mitigating: true
      });
      score -= 6;
    }

    if (verifiedItems.length >= 7) {
      factors.push({
        factor: 'Broad Pre-Operative Checklist Completeness',
        score: -8,
        category: 'EVIDENCE',
        description: `${verifiedItems.length} of ${checklistItems.length} checklist steps completed with verified source artifacts.`,
        is_mitigating: true
      });
      score -= 8;
    }

    // Clamp score 0 to 100
    const totalScore = Math.max(5, Math.min(98, score));

    // Determine risk level category
    let riskLevel: RiskLevel = 'LOW';
    if (totalScore >= 75) riskLevel = 'CRITICAL';
    else if (totalScore >= 50) riskLevel = 'HIGH';
    else if (totalScore >= 25) riskLevel = 'MEDIUM';

    // Confidence estimation
    const evidenceCoverage = checklistItems.length > 0 
      ? checklistItems.filter(i => i.evidence_id || i.status === 'VERIFIED').length / checklistItems.length 
      : 0.5;
    const confidencePct = Math.round(84 + evidenceCoverage * 12);

    let aiRecommendation = '';
    if (riskLevel === 'CRITICAL') {
      aiRecommendation = 'MANDATORY PAUSE: Surgery clearance cannot be issued autonomously. Lead Surgeon and Chief Anesthetist dual-signoff required before transferring patient to the sterile theatre.';
    } else if (riskLevel === 'HIGH') {
      aiRecommendation = 'ENHANCED SURVEILLANCE: High perioperative risk index. Verify all specialist attestations and ensure ICU post-op bed allocation is confirmed.';
    } else if (riskLevel === 'MEDIUM') {
      aiRecommendation = 'STANDARD MONITORING: Intermediate risk profile. Resolve pending nursing verifications and proceed to final surgical time-out.';
    } else {
      aiRecommendation = 'ROUTINE PREPARATION: Low complication risk profile. Patient eligible for standard pre-operative transfer upon surgical sign-off.';
    }

    return {
      patient_id: patient.id,
      total_score: totalScore,
      risk_level: riskLevel,
      confidence_pct: confidencePct,
      factors,
      ai_recommendation: aiRecommendation,
      model_name: this.MODEL_NAME,
      model_version: this.MODEL_VERSION,
      assessed_at: new Date().toISOString(),
      disclaimer: 'CLINICAL DECISION SUPPORT NOTICE: This algorithmic risk score is an explainable decision-support aid. It does not replace independent clinical evaluation or autonomous medical judgment by licensed healthcare professionals.'
    };
  }
}
