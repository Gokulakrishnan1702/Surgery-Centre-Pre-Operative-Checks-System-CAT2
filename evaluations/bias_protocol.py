"""
SurgiGate Bias Evaluation Protocol Engine
Formalized algorithmic evaluation of demographic and health equity parity across surgical patient cohorts.
Implements quantifiable fairness metrics including False-Completion Rate (FCR) and Override Disparity (OD).
"""

import enum
import math
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel, Field, ConfigDict


class EvaluationStatus(str, enum.Enum):
    PASSED = "PASSED"
    FLAGGED_DISPARITY = "FLAGGED_DISPARITY"
    CRITICAL_BIAS = "CRITICAL_BIAS"


class PopulationCohort(str, enum.Enum):
    GROUP_A = "grp-A"  # Cohort Alpha: Reference / Urban / Tertiary Referral Center
    GROUP_B = "grp-B"  # Cohort Beta: Protected / Regional / Underserved Community Center


class CohortMetrics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    code: str
    cases: int
    total_checklist_items: int
    completed_items: int
    completion_rate: float
    exception_items: int
    exception_rate: float
    evidence_required_items: int
    evidence_verified_items: int
    evidence_verification_rate: float
    human_confirmation_required_items: int
    human_confirmed_items: int
    human_confirmation_rate: float
    
    # Quantifiable Metric 1: False-Completion Rate (FCR)
    # Items marked VERIFIED or OVERRIDE where evidence was either missing, invalid, or expired
    false_completion_items: int
    false_completion_rate: float = Field(
        ...,
        description="FCR = (Completed items lacking valid evidence) / (Total items requiring evidence) * 100"
    )

    # Quantifiable Metric 2: Override Rate (OR)
    # Proportion of checklist items resolved through emergency/clinical bypass override
    override_items: int
    override_rate: float = Field(
        ...,
        description="OR = (Items resolved via override) / (Total checklist items) * 100"
    )

    # Safety Guard Metric: False Negative Rate (FNR)
    # Critical patients certified Ready when safeguards remained unfulfilled
    false_negative_cases: int
    false_negative_rate: float


class MetricDisparities(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    # Core Disparities
    completion_rate_diff: float
    exception_rate_diff: float
    evidence_verification_rate_diff: float
    human_confirmation_rate_diff: float
    
    # Formalized Quantifiable Metric 1: False-Completion Rate Disparity
    false_completion_rate_diff: float = Field(
        ...,
        description="Absolute difference in False-Completion Rate between Cohort A and Cohort B"
    )

    # Formalized Quantifiable Metric 2: Override Disparity
    override_disparity: float = Field(
        ...,
        description="Absolute difference in Override Rate between Cohort A and Cohort B"
    )

    # Formalized Quantifiable Metric 3: Relative Override Ratio (ROR)
    relative_override_ratio: float = Field(
        ...,
        description="Ratio of Override Rate (Cohort B / Cohort A)"
    )

    # Formalized Quantifiable Metric 4: Disparate Impact Ratio (DIR) (4/5ths Rule)
    disparate_impact_ratio: float = Field(
        ...,
        description="DIR = EvidenceVerificationRate(B) / EvidenceVerificationRate(A) (target: 0.80 - 1.25)"
    )

    # Formalized Quantifiable Metric 5: Statistical Parity Difference (SPD)
    statistical_parity_difference: float = Field(
        ...,
        description="SPD = CompletionRate(A) - CompletionRate(B)"
    )

    false_negative_rate_diff: float
    max_disparity: float


class BiasEvaluationReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    test_date: str
    dataset_size: int
    fairness_threshold: float
    fcr_threshold: float = 5.0
    result: EvaluationStatus
    group_a: CohortMetrics
    group_b: CohortMetrics
    differences: MetricDisparities
    flags: List[str] = Field(default_factory=list)
    remediation_recommendations: List[str] = Field(default_factory=list)


class BiasEvaluationEngine:
    """
    Formal algorithmic engine for evaluating bias, fairness, and safety parity
    across diverse demographic and regional surgical patient populations.
    """

    DEFAULT_FAIRNESS_THRESHOLD = 10.0  # General disparity threshold (%)
    DEFAULT_FCR_THRESHOLD = 5.0         # Strict safety tolerance for False-Completion Rate (%)
    FOUR_FIFTHS_MIN = 0.80              # Minimum Disparate Impact Ratio
    FOUR_FIFTHS_MAX = 1.25              # Maximum Disparate Impact Ratio

    @classmethod
    def calculate_cohort_metrics(
        cls,
        name: str,
        code: str,
        patients: List[Dict[str, Any]],
        checklist_items: List[Dict[str, Any]]
    ) -> CohortMetrics:
        """
        Calculates exact deterministic clinical checklist and safety metrics for a given patient cohort.
        """
        cases = len(patients)
        if cases == 0:
            return CohortMetrics(
                name=name,
                code=code,
                cases=0,
                total_checklist_items=0,
                completed_items=0,
                completion_rate=0.0,
                exception_items=0,
                exception_rate=0.0,
                evidence_required_items=0,
                evidence_verified_items=0,
                evidence_verification_rate=0.0,
                human_confirmation_required_items=0,
                human_confirmed_items=0,
                human_confirmation_rate=0.0,
                false_completion_items=0,
                false_completion_rate=0.0,
                override_items=0,
                override_rate=0.0,
                false_negative_cases=0,
                false_negative_rate=0.0
            )

        patient_ids = {p.get("id") or p.get("patient_id") for p in patients}
        items = [ci for ci in checklist_items if (ci.get("patient_id") in patient_ids)]
        total_items = len(items) or 1

        # Completed items: Status is VERIFIED or OVERRIDE
        completed = [ci for ci in items if ci.get("status") in ("VERIFIED", "OVERRIDE")]
        completed_count = len(completed)

        # Exception items
        exceptions = [ci for ci in items if ci.get("status") == "EXCEPTION"]
        exception_count = len(exceptions)

        # Evidence required items
        evidence_required = [ci for ci in items if ci.get("requires_evidence", False)]
        evidence_req_count = len(evidence_required) or 1
        evidence_verified = [
            ci for ci in evidence_required
            if (ci.get("evidence_id") or ci.get("has_valid_evidence", False)) and ci.get("status") in ("VERIFIED", "OVERRIDE")
        ]
        evidence_verified_count = len(evidence_verified)

        # Human confirmation items
        human_req = [ci for ci in items if ci.get("requires_human_confirmation", False)]
        human_req_count = len(human_req) or 1
        human_confirmed = [ci for ci in human_req if ci.get("human_confirmed", False)]
        human_confirmed_count = len(human_confirmed)

        # Quantifiable Metric 1: False-Completion Rate (FCR)
        # Items marked completed where required evidence was missing, expired, or invalid
        false_completed = [
            ci for ci in evidence_required
            if ci.get("status") in ("VERIFIED", "OVERRIDE")
            and not (ci.get("evidence_id") or ci.get("has_valid_evidence", False))
        ]
        false_completed_count = len(false_completed)
        fcr = round((false_completed_count / evidence_req_count) * 100.0, 2)

        # Quantifiable Metric 2: Override Rate (OR)
        overrides = [ci for ci in items if ci.get("status") == "OVERRIDE"]
        override_count = len(overrides)
        override_rate = round((override_count / total_items) * 100.0, 2)

        # False negatives: CRITICAL patients marked READY without all items verified
        false_negatives = [
            p for p in patients
            if p.get("risk_level") == "CRITICAL" and p.get("status") == "READY"
        ]
        false_neg_count = len(false_negatives)
        false_neg_rate = round((false_neg_count / cases) * 100.0, 2)

        return CohortMetrics(
            name=name,
            code=code,
            cases=cases,
            total_checklist_items=total_items,
            completed_items=completed_count,
            completion_rate=round((completed_count / total_items) * 100.0, 2),
            exception_items=exception_count,
            exception_rate=round((exception_count / total_items) * 100.0, 2),
            evidence_required_items=evidence_req_count,
            evidence_verified_items=evidence_verified_count,
            evidence_verification_rate=round((evidence_verified_count / evidence_req_count) * 100.0, 2),
            human_confirmation_required_items=human_req_count,
            human_confirmed_items=human_confirmed_count,
            human_confirmation_rate=round((human_confirmed_count / human_req_count) * 100.0, 2),
            false_completion_items=false_completed_count,
            false_completion_rate=fcr,
            override_items=override_count,
            override_rate=override_rate,
            false_negative_cases=false_neg_count,
            false_negative_rate=false_neg_rate
        )

    @classmethod
    def evaluate(
        cls,
        group_a_patients: List[Dict[str, Any]],
        group_b_patients: List[Dict[str, Any]],
        all_checklist_items: List[Dict[str, Any]],
        fairness_threshold: float = DEFAULT_FAIRNESS_THRESHOLD,
        fcr_threshold: float = DEFAULT_FCR_THRESHOLD
    ) -> BiasEvaluationReport:
        """
        Executes the formal bias evaluation protocol across Cohort A (Reference) and Cohort B (Comparison).
        Computes quantifiable metrics, disparities, threshold compliance, and remediation steps.
        """
        ga = cls.calculate_cohort_metrics(
            name="Cohort Alpha (Urban / Tier-1 Reference)",
            code=PopulationCohort.GROUP_A.value,
            patients=group_a_patients,
            checklist_items=all_checklist_items
        )

        gb = cls.calculate_cohort_metrics(
            name="Cohort Beta (Regional / Tier-2 Protected)",
            code=PopulationCohort.GROUP_B.value,
            patients=group_b_patients,
            checklist_items=all_checklist_items
        )

        # Compute metric differences
        comp_diff = round(abs(ga.completion_rate - gb.completion_rate), 2)
        exc_diff = round(abs(ga.exception_rate - gb.exception_rate), 2)
        ev_diff = round(abs(ga.evidence_verification_rate - gb.evidence_verification_rate), 2)
        hc_diff = round(abs(ga.human_confirmation_rate - gb.human_confirmation_rate), 2)
        
        # Formal Metric 1 Disparity: False-Completion Rate Disparity
        fcr_diff = round(abs(ga.false_completion_rate - gb.false_completion_rate), 2)

        # Formal Metric 2 Disparity: Override Disparity
        override_disp = round(abs(ga.override_rate - gb.override_rate), 2)
        
        # Formal Metric 3: Relative Override Ratio (avoid division by zero)
        ror = round((gb.override_rate / (ga.override_rate or 0.01)), 2) if ga.override_rate > 0 else (1.0 if gb.override_rate == 0 else 9.99)

        # Formal Metric 4: Disparate Impact Ratio (DIR) (4/5ths Rule)
        base_ev = ga.evidence_verification_rate or 0.01
        dir_val = round((gb.evidence_verification_rate / base_ev), 3)

        # Formal Metric 5: Statistical Parity Difference (SPD)
        spd = round((ga.completion_rate - gb.completion_rate), 2)

        fn_diff = round(abs(ga.false_negative_rate - gb.false_negative_rate), 2)

        # Max general disparity
        max_disp = max(comp_diff, exc_diff, ev_diff, hc_diff, override_disp, fn_diff)

        disparities = MetricDisparities(
            completion_rate_diff=comp_diff,
            exception_rate_diff=exc_diff,
            evidence_verification_rate_diff=ev_diff,
            human_confirmation_rate_diff=hc_diff,
            false_completion_rate_diff=fcr_diff,
            override_disparity=override_disp,
            relative_override_ratio=ror,
            disparate_impact_ratio=dir_val,
            statistical_parity_difference=spd,
            false_negative_rate_diff=fn_diff,
            max_disparity=max_disp
        )

        # Threshold and Flag Evaluation
        flags: List[str] = []
        recommendations: List[str] = []

        # Check 1: False-Completion Rate Safety Check
        if ga.false_completion_rate > fcr_threshold or gb.false_completion_rate > fcr_threshold:
            flags.append(
                f"SAFETY_VIOLATION: False-Completion Rate exceeds safety threshold of {fcr_threshold}% "
                f"(Cohort A: {ga.false_completion_rate}%, Cohort B: {gb.false_completion_rate}%)."
            )
            recommendations.append(
                "Enforce strict server-side cryptographic evidence gating to block verification without unexpired documents."
            )

        if fcr_diff > fcr_threshold:
            flags.append(
                f"FCR_DISPARITY_FLAG: False-Completion Rate disparity ({fcr_diff}%) exceeds threshold of {fcr_threshold}%."
            )
            recommendations.append(
                "Audit specialist sign-off workflows in Cohort B to ensure consistent adherence to evidence verification."
            )

        # Check 2: Override Disparity Check
        if override_disp > fairness_threshold:
            flags.append(
                f"OVERRIDE_DISPARITY_FLAG: Override disparity ({override_disp}%) exceeds fairness threshold of {fairness_threshold}%."
            )
            recommendations.append(
                f"Investigate elevated override reliance in {gb.name if gb.override_rate > ga.override_rate else ga.name}. "
                "Ensure diagnostic lab turnaround delays are addressed rather than bypassed via emergency overrides."
            )

        # Check 3: Four-Fifths (80%) Rule Compliance
        if dir_val < cls.FOUR_FIFTHS_MIN or dir_val > cls.FOUR_FIFTHS_MAX:
            flags.append(
                f"FOUR_FIFTHS_VIOLATION: Disparate Impact Ratio ({dir_val}) violates the 80% (0.80 - 1.25) rule."
            )
            recommendations.append(
                "Align pre-op diagnostic turnaround times and specialist availability across both hospital sites."
            )

        # Check 4: General Disparity Check
        if max_disp > fairness_threshold:
            flags.append(
                f"MAX_DISPARITY_FLAG: Peak workflow disparity ({max_disp}%) exceeds configured threshold of {fairness_threshold}%."
            )

        # Determine composite result
        if any("SAFETY_VIOLATION" in f for f in flags) or fcr_diff > (fcr_threshold * 2):
            result = EvaluationStatus.CRITICAL_BIAS
        elif len(flags) > 0:
            result = EvaluationStatus.FLAGGED_DISPARITY
        else:
            result = EvaluationStatus.PASSED
            recommendations.append("All clinical safety metrics and fairness disparities remain within permissible thresholds.")

        return BiasEvaluationReport(
            test_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            dataset_size=len(group_a_patients) + len(group_b_patients),
            fairness_threshold=fairness_threshold,
            fcr_threshold=fcr_threshold,
            result=result,
            group_a=ga,
            group_b=gb,
            differences=disparities,
            flags=flags,
            remediation_recommendations=recommendations
        )
