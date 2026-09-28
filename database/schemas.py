"""
SurgiGate: Evidence-Gated Pre-Operative Checklist & Surgical Safety Management System
Pydantic v2 Data Validation & Serialization Schemas
"""

from datetime import datetime, timezone
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator, model_validator
from .models import (
    UserRole,
    UserStatus,
    RiskLevel,
    PatientStatus,
    SurgeryStatus,
    ChecklistStatus,
    ChecklistPhase,
    EvidenceType,
    VerificationStatus,
    ConfirmationDecision,
    ExceptionSeverity,
    ExceptionStatus,
    OverrideStatus,
    ImpactClassification,
    AuditEventType
)


# ---------------------------------------------------------------------------
# Base Schema Configuration
# ---------------------------------------------------------------------------

class SurgiGateBaseModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        use_enum_values=True
    )


# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------

class UserBase(SurgiGateBaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Plain text password to be hashed")


class UserRead(UserBase):
    id: str
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class UserLogin(SurgiGateBaseModel):
    email: EmailStr
    password: str


# ---------------------------------------------------------------------------
# Population Group Schemas
# ---------------------------------------------------------------------------

class PopulationGroupBase(SurgiGateBaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None


class PopulationGroupCreate(PopulationGroupBase):
    pass


class PopulationGroupRead(PopulationGroupBase):
    id: str


# ---------------------------------------------------------------------------
# Patient Schemas
# ---------------------------------------------------------------------------

class PatientBase(SurgiGateBaseModel):
    patient_id: str = Field(..., min_length=3, max_length=50, description="Hospital Patient ID e.g. P10001")
    name: str = Field(..., min_length=2, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=130)
    gender: Optional[str] = Field(None, max_length=20)
    surgery_type: Optional[str] = Field(None, max_length=255)
    scheduled_date: Optional[datetime] = None
    risk_level: RiskLevel = RiskLevel.LOW
    status: PatientStatus = PatientStatus.PENDING
    assigned_team: Optional[str] = None
    population_group_id: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientRead(PatientBase):
    id: str
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Checklist Template Schemas
# ---------------------------------------------------------------------------

class ChecklistTemplateBase(SurgiGateBaseModel):
    template_code: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=255)
    phase: ChecklistPhase = ChecklistPhase.SIGN_IN
    risk_level: RiskLevel = RiskLevel.LOW
    required_role: Optional[UserRole] = None
    requires_evidence: bool = False
    requires_human_confirmation: bool = False
    rule_explanation: Optional[str] = None
    max_evidence_age_hours: int = Field(72, ge=1, le=8760, description="Maximum evidence validity window in hours")


class ChecklistTemplateCreate(ChecklistTemplateBase):
    pass


class ChecklistTemplateRead(ChecklistTemplateBase):
    id: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Surgery Schemas
# ---------------------------------------------------------------------------

class SurgeryBase(SurgiGateBaseModel):
    patient_id: str
    status: SurgeryStatus = SurgeryStatus.SCHEDULED
    surgery_name: Optional[str] = None
    or_room: Optional[str] = None
    scheduled_date: Optional[datetime] = None


class SurgeryCreate(SurgeryBase):
    pass


class SurgeryRead(SurgeryBase):
    id: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Evidence Schemas & Safety Guard 1: Expiry Validation
# ---------------------------------------------------------------------------

class EvidenceBase(SurgiGateBaseModel):
    checklist_item_id: str
    patient_id: str
    evidence_type: EvidenceType = EvidenceType.DOCUMENT
    source: Optional[str] = "Integrated Hospital Information System"
    filename: str = Field(..., min_length=1, max_length=255)
    file_url: Optional[str] = None
    file_size: Optional[str] = "350 KB"
    sha256_hash: str = Field(..., min_length=64, max_length=64, description="Cryptographic SHA-256 integrity hash")
    verification_status: VerificationStatus = VerificationStatus.VERIFIED
    expiry: Optional[datetime] = None
    notes: Optional[str] = None


class EvidenceCreate(EvidenceBase):
    @field_validator("expiry")
    @classmethod
    def validate_expiry_not_in_past(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Safety Guard 1: Active evidence cannot be uploaded with an expiration timestamp in the past."""
        if v is not None:
            # Normalize to UTC comparison
            now = datetime.now(timezone.utc)
            if v.tzinfo is None:
                v_aware = v.replace(tzinfo=timezone.utc)
            else:
                v_aware = v
            if v_aware <= now:
                raise ValueError("ExpiredEvidenceError: Attached clinical evidence has an expiration timestamp in the past.")
        return v


class EvidenceRead(EvidenceBase):
    id: str
    uploaded_by: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Checklist Item Schemas
# ---------------------------------------------------------------------------

class ChecklistItemBase(SurgiGateBaseModel):
    surgery_id: str
    patient_id: str
    template_id: str
    name: str = Field(..., min_length=1, max_length=255)
    phase: ChecklistPhase = ChecklistPhase.SIGN_IN
    risk_level: RiskLevel = RiskLevel.LOW
    required_role: Optional[UserRole] = None
    requires_evidence: bool = False
    requires_human_confirmation: bool = False
    status: ChecklistStatus = ChecklistStatus.NOT_STARTED
    notes: Optional[str] = None


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemRead(ChecklistItemBase):
    id: str
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    human_confirmed: bool = False
    created_at: datetime
    updated_at: datetime


class ChecklistVerifyRequest(SurgiGateBaseModel):
    notes: Optional[str] = "Standard clinical safety protocol verification"
    evidence_id: Optional[str] = None
    filename: Optional[str] = None
    source: Optional[str] = None


# ---------------------------------------------------------------------------
# Confirmation Schemas
# ---------------------------------------------------------------------------

class ConfirmationCreate(SurgiGateBaseModel):
    checklist_item_id: str
    evidence_id: Optional[str] = None
    decision: ConfirmationDecision = ConfirmationDecision.APPROVED
    comment: str = Field(..., min_length=5, description="Clinician attestation and inspection notes")


class ConfirmationRead(ConfirmationCreate):
    id: str
    confirmed_by: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Exception Schemas
# ---------------------------------------------------------------------------

class ExceptionCreate(SurgiGateBaseModel):
    checklist_item_id: str
    patient_id: str
    severity: ExceptionSeverity = ExceptionSeverity.HIGH
    category: str = Field(..., min_length=3, description="e.g. Missing Evidence, Expired Evidence")
    reason: str = Field(..., min_length=5)
    assigned_role: Optional[UserRole] = None


class ExceptionRead(ExceptionCreate):
    id: str
    status: ExceptionStatus
    created_by: str
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ExceptionResolve(SurgiGateBaseModel):
    resolution_notes: str = Field(..., min_length=5)


# ---------------------------------------------------------------------------
# Override Schemas & Safety Guard 5: Rationale & Impact Verification
# ---------------------------------------------------------------------------

class OverrideRequest(SurgiGateBaseModel):
    checklist_item_id: str
    patient_id: str
    reason: str = Field(..., min_length=10, description="Mandatory clinical justification for bypass")
    business_reason: str = Field(..., min_length=5, description="Mandatory operational / business justification")
    impact: ImpactClassification = ImpactClassification.MODERATE

    @model_validator(mode="after")
    def validate_dual_justification(self) -> "OverrideRequest":
        """Safety Guard 5: Controlled override requires both clinical and business rationale."""
        if not self.reason or len(self.reason.strip()) < 10:
            raise ValueError("InvalidOverrideError: Clinical justification must be provided (minimum 10 characters).")
        if not self.business_reason or len(self.business_reason.strip()) < 5:
            raise ValueError("InvalidOverrideError: Operational/business justification must be provided (minimum 5 characters).")
        return self


class OverrideApprovalRequest(SurgiGateBaseModel):
    decision: OverrideStatus = Field(..., description="APPROVED or REJECTED")
    rejection_reason: Optional[str] = None

    @model_validator(mode="after")
    def validate_rejection_reason(self) -> "OverrideApprovalRequest":
        if self.decision == OverrideStatus.REJECTED and not self.rejection_reason:
            raise ValueError("Rejection reason must be provided if override is rejected.")
        return self


class OverrideRead(SurgiGateBaseModel):
    id: str
    checklist_item_id: str
    patient_id: str
    requested_by: str
    approved_by: Optional[str] = None
    reason: str
    business_reason: Optional[str] = None
    impact: ImpactClassification
    status: OverrideStatus
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Audit Log Schemas
# ---------------------------------------------------------------------------

class AuditRecordRead(SurgiGateBaseModel):
    id: str
    event_type: AuditEventType
    patient_id: Optional[str] = None
    checklist_item_id: Optional[str] = None
    evidence_id: Optional[str] = None
    user_id: Optional[str] = None
    user_role: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    sha256_hash: Optional[str] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# System Settings Schemas
# ---------------------------------------------------------------------------

class SystemSettingsRead(SurgiGateBaseModel):
    id: str
    hospital_name: str
    hospital_id: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    doctor_approval_required: bool
    high_risk_evidence_required: bool
    human_confirmation_required: bool
    override_reason_required: bool
    audit_logging_enabled: bool
    prevent_verification_without_evidence: bool
    fairness_threshold: float = Field(10.0, ge=0.1, le=50.0)
    audit_retention_days: int = 3650
    updated_at: datetime


class SystemSettingsUpdate(SurgiGateBaseModel):
    hospital_name: Optional[str] = None
    doctor_approval_required: Optional[bool] = None
    high_risk_evidence_required: Optional[bool] = None
    human_confirmation_required: Optional[bool] = None
    override_reason_required: Optional[bool] = None
    audit_logging_enabled: Optional[bool] = None
    prevent_verification_without_evidence: Optional[bool] = None
    fairness_threshold: Optional[float] = Field(None, ge=0.1, le=50.0)
    audit_retention_days: Optional[int] = Field(None, ge=30, le=7300)


# ---------------------------------------------------------------------------
# Formal Bias Evaluation Schemas
# ---------------------------------------------------------------------------

class CohortMetrics(SurgiGateBaseModel):
    name: str
    code: str
    cases: int
    completion_rate: float
    exception_rate: float
    evidence_verification_rate: float
    human_confirmation_rate: float
    false_completion_rate: float = Field(..., description="Proportion of verified items completed without valid evidence")
    override_rate: float = Field(..., description="Proportion of checklist items resolved via override")
    false_negative_rate: float


class MetricDisparities(SurgiGateBaseModel):
    completion_rate_diff: float
    exception_rate_diff: float
    evidence_verification_rate_diff: float
    human_confirmation_rate_diff: float
    false_completion_rate_diff: float = Field(..., description="Absolute False-Completion Rate Disparity")
    override_disparity: float = Field(..., description="Absolute Override Disparity between cohorts")
    disparate_impact_ratio: float = Field(..., description="Disparate Impact Ratio (80% rule metric)")
    statistical_parity_difference: float = Field(..., description="Statistical Parity Difference in verification probability")
    false_negative_rate_diff: float
    max_disparity: float


class BiasEvaluationReport(SurgiGateBaseModel):
    test_date: str
    dataset_size: int
    threshold_used: float
    result: str = Field(..., description="PASSED, FLAGGED_DISPARITY, or CRITICAL_BIAS")
    group_a: CohortMetrics
    group_b: CohortMetrics
    differences: MetricDisparities
    flags: List[str] = Field(default_factory=list)
    remediation_recommendations: List[str] = Field(default_factory=list)
