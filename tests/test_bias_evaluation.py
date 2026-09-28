"""
SurgiGate Bias Evaluation Protocol Automated Test Suite
Validates quantifiable fairness metrics:
1. False-Completion Rate (FCR)
2. Override Disparity (OD)
3. Disparate Impact Ratio (DIR) (4/5ths Rule)
4. Statistical Parity Difference (SPD)
5. Decision Thresholds and Remediation Triggering
"""

import pytest
from evaluations.bias_protocol import (
    BiasEvaluationEngine,
    EvaluationStatus,
    PopulationCohort,
    CohortMetrics
)


class TestBiasEvaluationProtocol:
    """
    Validates mathematical and algorithmic correctness of the SurgiGate
    health equity and algorithmic parity evaluation protocol.
    """

    @pytest.fixture
    def synthetic_balanced_cohorts(self):
        """Generates two balanced synthetic cohorts with equitable safety metrics."""
        pts_a = [{"id": f"pt-a-{i}", "patient_id": f"PA{i}", "risk_level": "LOW", "status": "READY"} for i in range(20)]
        pts_b = [{"id": f"pt-b-{i}", "patient_id": f"PB{i}", "risk_level": "LOW", "status": "READY"} for i in range(20)]

        # 5 checklist items per patient, 3 require evidence
        items = []
        for p in pts_a:
            for j in range(5):
                req_ev = j < 3
                items.append({
                    "id": f"ci-{p['id']}-{j}",
                    "patient_id": p["id"],
                    "status": "VERIFIED",
                    "requires_evidence": req_ev,
                    "evidence_id": f"ev-{p['id']}-{j}" if req_ev else None,
                    "has_valid_evidence": req_ev,
                    "requires_human_confirmation": j == 0,
                    "human_confirmed": j == 0
                })

        for p in pts_b:
            for j in range(5):
                req_ev = j < 3
                items.append({
                    "id": f"ci-{p['id']}-{j}",
                    "patient_id": p["id"],
                    "status": "VERIFIED",
                    "requires_evidence": req_ev,
                    "evidence_id": f"ev-{p['id']}-{j}" if req_ev else None,
                    "has_valid_evidence": req_ev,
                    "requires_human_confirmation": j == 0,
                    "human_confirmed": j == 0
                })

        return pts_a, pts_b, items

    def test_balanced_cohort_passes_evaluation(self, synthetic_balanced_cohorts):
        """Equitable cohorts with low overrides and full evidence verification achieve PASSED status."""
        pts_a, pts_b, items = synthetic_balanced_cohorts

        report = BiasEvaluationEngine.evaluate(
            group_a_patients=pts_a,
            group_b_patients=pts_b,
            all_checklist_items=items,
            fairness_threshold=10.0
        )

        assert report.result == EvaluationStatus.PASSED
        assert report.differences.false_completion_rate_diff == 0.0
        assert report.differences.override_disparity == 0.0
        assert 0.95 <= report.differences.disparate_impact_ratio <= 1.05
        assert len(report.flags) == 0

    def test_false_completion_rate_calculation_and_critical_flag(self):
        """Checks calculation of FCR and verifies that FCR > 5.0% triggers CRITICAL_BIAS."""
        pts_a = [{"id": "pa1", "risk_level": "LOW", "status": "READY"}]
        pts_b = [{"id": "pb1", "risk_level": "LOW", "status": "READY"}]

        # In Cohort B, 2 out of 10 evidence-required items are marked VERIFIED without valid evidence (FCR = 20.0%)
        items = []
        for i in range(10):
            items.append({
                "patient_id": "pa1",
                "status": "VERIFIED",
                "requires_evidence": True,
                "evidence_id": f"ev-a-{i}",
                "has_valid_evidence": True
            })
            # 2 false completions in Cohort B
            has_ev = i >= 2
            items.append({
                "patient_id": "pb1",
                "status": "VERIFIED",
                "requires_evidence": True,
                "evidence_id": f"ev-b-{i}" if has_ev else None,
                "has_valid_evidence": has_ev
            })

        report = BiasEvaluationEngine.evaluate(
            group_a_patients=pts_a,
            group_b_patients=pts_b,
            all_checklist_items=items,
            fairness_threshold=10.0,
            fcr_threshold=5.0
        )

        assert report.group_a.false_completion_rate == 0.0
        assert report.group_b.false_completion_rate == 20.0
        assert report.differences.false_completion_rate_diff == 20.0
        assert report.result == EvaluationStatus.CRITICAL_BIAS
        assert any("SAFETY_VIOLATION" in flag for flag in report.flags)

    def test_override_disparity_calculation_and_flagging(self):
        """Elevated override reliance in Cohort B produces OVERRIDE_DISPARITY_FLAG."""
        pts_a = [{"id": "pa1", "risk_level": "MEDIUM", "status": "READY"}]
        pts_b = [{"id": "pb1", "risk_level": "MEDIUM", "status": "READY"}]

        # Cohort A: 1 out of 20 items overridden (5.0%)
        # Cohort B: 5 out of 20 items overridden (25.0%) -> Disparity = 20.0%
        items = []
        for i in range(20):
            items.append({
                "patient_id": "pa1",
                "status": "OVERRIDE" if i == 0 else "VERIFIED",
                "requires_evidence": False
            })
            items.append({
                "patient_id": "pb1",
                "status": "OVERRIDE" if i < 5 else "VERIFIED",
                "requires_evidence": False
            })

        report = BiasEvaluationEngine.evaluate(
            group_a_patients=pts_a,
            group_b_patients=pts_b,
            all_checklist_items=items,
            fairness_threshold=10.0
        )

        assert report.group_a.override_rate == 5.0
        assert report.group_b.override_rate == 25.0
        assert report.differences.override_disparity == 20.0
        assert report.result == EvaluationStatus.FLAGGED_DISPARITY
        assert any("OVERRIDE_DISPARITY_FLAG" in flag for flag in report.flags)

    def test_disparate_impact_ratio_breach_detection(self):
        """Detects breach of the Four-Fifths (80%) Rule when evidence verification drops in Cohort B."""
        pts_a = [{"id": "pa1", "risk_level": "LOW", "status": "READY"}]
        pts_b = [{"id": "pb1", "risk_level": "LOW", "status": "READY"}]

        # Cohort A: 100% evidence verified
        # Cohort B: 50% evidence verified -> DIR = 0.50 (< 0.80)
        items = []
        for i in range(10):
            items.append({
                "patient_id": "pa1",
                "status": "VERIFIED",
                "requires_evidence": True,
                "evidence_id": f"ev-{i}",
                "has_valid_evidence": True
            })
            items.append({
                "patient_id": "pb1",
                "status": "VERIFIED" if i < 5 else "EXCEPTION",
                "requires_evidence": True,
                "evidence_id": f"ev-{i}" if i < 5 else None,
                "has_valid_evidence": i < 5
            })

        report = BiasEvaluationEngine.evaluate(
            group_a_patients=pts_a,
            group_b_patients=pts_b,
            all_checklist_items=items,
            fairness_threshold=10.0
        )

        assert report.group_a.evidence_verification_rate == 100.0
        assert report.group_b.evidence_verification_rate == 50.0
        assert report.differences.disparate_impact_ratio == 0.50
        assert any("FOUR_FIFTHS_VIOLATION" in flag for flag in report.flags)

    def test_empty_cohort_handling_graceful(self):
        """Engine handles empty patient cohorts safely without ZeroDivisionError."""
        report = BiasEvaluationEngine.evaluate(
            group_a_patients=[],
            group_b_patients=[],
            all_checklist_items=[]
        )
        assert report.dataset_size == 0
        assert report.group_a.cases == 0
        assert report.group_b.cases == 0
        assert report.differences.max_disparity == 0.0
