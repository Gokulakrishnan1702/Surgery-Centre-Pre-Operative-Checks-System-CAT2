"""
SurgiGate: Evidence-Gated Pre-Operative Checklist & Surgical Safety Management System
SQLAlchemy 2.0 Executable ORM Domain Models
"""

import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    Numeric,
    Text,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    JSON
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship
)


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SURGEON = "SURGEON"
    NURSE = "NURSE"
    ANESTHETIST = "ANESTHETIST"
    RADIOLOGIST = "RADIOLOGIST"
    PATHOLOGIST = "PATHOLOGIST"
    CARDIOLOGIST = "CARDIOLOGIST"
    AUDITOR = "AUDITOR"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PatientStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    READY = "READY"
    EXCEPTION = "EXCEPTION"


class SurgeryStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ChecklistStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    EXCEPTION = "EXCEPTION"
    OVERRIDE = "OVERRIDE"


class ChecklistPhase(str, enum.Enum):
    SIGN_IN = "SIGN_IN"
    TIME_OUT = "TIME_OUT"
    SIGN_OUT = "SIGN_OUT"


class EvidenceType(str, enum.Enum):
    EMR = "EMR"
    LAB = "LAB"
    PACS = "PACS"
    DOCUMENT = "DOCUMENT"
    CONSENT = "CONSENT"


class VerificationStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    PENDING = "PENDING"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    CONFLICTING = "CONFLICTING"


class ConfirmationDecision(str, enum.Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ExceptionSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ExceptionStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    OVERRIDDEN = "OVERRIDDEN"


class OverrideStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ImpactClassification(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    SIGNIFICANT = "SIGNIFICANT"
    CRITICAL = "CRITICAL"


class AuditEventType(str, enum.Enum):
    CHECKLIST_CREATED = "CHECKLIST_CREATED"
    EVIDENCE_UPLOADED = "EVIDENCE_UPLOADED"
    EVIDENCE_VERIFIED = "EVIDENCE_VERIFIED"
    EVIDENCE_EXPIRED_REJECTED = "EVIDENCE_EXPIRED_REJECTED"
    HUMAN_CONFIRMATION = "HUMAN_CONFIRMATION"
    EXCEPTION_RAISED = "EXCEPTION_RAISED"
    EXCEPTION_RESOLVED = "EXCEPTION_RESOLVED"
    OVERRIDE_REQUESTED = "OVERRIDE_REQUESTED"
    OVERRIDE_APPROVED = "OVERRIDE_APPROVED"
    OVERRIDE_REJECTED = "OVERRIDE_REJECTED"
    SYSTEM_SETTING_UPDATED = "SYSTEM_SETTING_UPDATED"
    DUPLICATE_ENTRY_PREVENTED = "DUPLICATE_ENTRY_PREVENTED"
    ROLE_MISMATCH_PREVENTED = "ROLE_MISMATCH_PREVENTED"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # UserRole
    status: Mapped[str] = mapped_column(String(50), default=UserStatus.ACTIVE.value)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    verified_checklist_items: Mapped[List["ChecklistItem"]] = relationship("ChecklistItem", back_populates="verifier", foreign_keys="ChecklistItem.verified_by")
    uploaded_evidences: Mapped[List["EvidenceRecord"]] = relationship("EvidenceRecord", back_populates="uploader")
    confirmations: Mapped[List["ConfirmationRecord"]] = relationship("ConfirmationRecord", back_populates="confirmer")
    requested_overrides: Mapped[List["OverrideRecord"]] = relationship("OverrideRecord", back_populates="requester", foreign_keys="OverrideRecord.requested_by")
    approved_overrides: Mapped[List["OverrideRecord"]] = relationship("OverrideRecord", back_populates="approver", foreign_keys="OverrideRecord.approved_by")


class PopulationGroup(Base):
    __tablename__ = "population_groups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, unique=True)  # e.g., 'grp-A', 'grp-B'

    patients: Mapped[List["Patient"]] = relationship("Patient", back_populates="population_group")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # e.g., P10001
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    surgery_type: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scheduled_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(50), default=RiskLevel.LOW.value)
    status: Mapped[str] = mapped_column(String(50), default=PatientStatus.PENDING.value)
    assigned_team: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    population_group_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("population_groups.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    population_group: Mapped[Optional["PopulationGroup"]] = relationship("PopulationGroup", back_populates="patients")
    surgeries: Mapped[List["Surgery"]] = relationship("Surgery", back_populates="patient", cascade="all, delete-orphan")
    checklist_items: Mapped[List["ChecklistItem"]] = relationship("ChecklistItem", back_populates="patient", cascade="all, delete-orphan")
    evidences: Mapped[List["EvidenceRecord"]] = relationship("EvidenceRecord", back_populates="patient")


class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_code: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)  # e.g., 'CARDIAC_CLEARANCE'
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phase: Mapped[str] = mapped_column(String(50), default=ChecklistPhase.SIGN_IN.value)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False)  # RiskLevel
    required_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # UserRole
    requires_evidence: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_human_confirmation: Mapped[bool] = mapped_column(Boolean, default=False)
    rule_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    max_evidence_age_hours: Mapped[Optional[int]] = mapped_column(Integer, default=72)  # Clinical validity window
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    checklist_items: Mapped[List["ChecklistItem"]] = relationship("ChecklistItem", back_populates="template")


class Surgery(Base):
    __tablename__ = "surgeries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=SurgeryStatus.SCHEDULED.value)
    surgery_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    or_room: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    scheduled_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    patient: Mapped["Patient"] = relationship("Patient", back_populates="surgeries")
    checklist_items: Mapped[List["ChecklistItem"]] = relationship("ChecklistItem", back_populates="surgery", cascade="all, delete-orphan")


class ChecklistItem(Base):
    """
    Checklist Item represents a discrete pre-operative safety check.
    Enforces uniqueness per surgery and template to prevent duplicate checklist entries (Safety Guard 2).
    """
    __tablename__ = "checklist_items"
    __table_args__ = (
        UniqueConstraint("surgery_id", "template_id", name="uq_surgery_template_entry"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    surgery_id: Mapped[str] = mapped_column(String(36), ForeignKey("surgeries.id"), nullable=False)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False)
    template_id: Mapped[str] = mapped_column(String(36), ForeignKey("checklist_templates.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phase: Mapped[str] = mapped_column(String(50), default=ChecklistPhase.SIGN_IN.value)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False)
    required_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    requires_evidence: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_human_confirmation: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(50), default=ChecklistStatus.NOT_STARTED.value)
    verified_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    human_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    surgery: Mapped["Surgery"] = relationship("Surgery", back_populates="checklist_items")
    patient: Mapped["Patient"] = relationship("Patient", back_populates="checklist_items")
    template: Mapped["ChecklistTemplate"] = relationship("ChecklistTemplate", back_populates="checklist_items")
    verifier: Mapped[Optional["User"]] = relationship("User", back_populates="verified_checklist_items", foreign_keys=[verified_by])
    evidences: Mapped[List["EvidenceRecord"]] = relationship("EvidenceRecord", back_populates="checklist_item", cascade="all, delete-orphan")
    confirmations: Mapped[List["ConfirmationRecord"]] = relationship("ConfirmationRecord", back_populates="checklist_item", cascade="all, delete-orphan")
    exceptions: Mapped[List["ExceptionRecord"]] = relationship("ExceptionRecord", back_populates="checklist_item", cascade="all, delete-orphan")
    overrides: Mapped[List["OverrideRecord"]] = relationship("OverrideRecord", back_populates="checklist_item", cascade="all, delete-orphan")


class EvidenceRecord(Base):
    """
    Evidence record attached to a checklist item.
    Enforces cryptographic SHA-256 hash tracking and explicit expiration timestamp (Safety Guard 1).
    """
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    checklist_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("checklist_items.id"), nullable=False)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(50), default=EvidenceType.DOCUMENT.value)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    uploaded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(50), default=VerificationStatus.PENDING.value)
    expiry: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    checklist_item: Mapped["ChecklistItem"] = relationship("ChecklistItem", back_populates="evidences")
    patient: Mapped["Patient"] = relationship("Patient", back_populates="evidences")
    uploader: Mapped["User"] = relationship("User", back_populates="uploaded_evidences")
    confirmations: Mapped[List["ConfirmationRecord"]] = relationship("ConfirmationRecord", back_populates="evidence")


class ConfirmationRecord(Base):
    __tablename__ = "confirmations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    checklist_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("checklist_items.id"), nullable=False)
    evidence_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("evidence.id"), nullable=True)
    confirmed_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(50), default=ConfirmationDecision.APPROVED.value)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    checklist_item: Mapped["ChecklistItem"] = relationship("ChecklistItem", back_populates="confirmations")
    evidence: Mapped[Optional["EvidenceRecord"]] = relationship("EvidenceRecord", back_populates="confirmations")
    confirmer: Mapped["User"] = relationship("User", back_populates="confirmations")


class ExceptionRecord(Base):
    __tablename__ = "exceptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    checklist_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("checklist_items.id"), nullable=False)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default=ExceptionSeverity.HIGH.value)
    category: Mapped[str] = mapped_column(String(255), nullable=False)  # e.g., 'Missing Evidence', 'Expired Evidence'
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=ExceptionStatus.OPEN.value)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    resolved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    checklist_item: Mapped["ChecklistItem"] = relationship("ChecklistItem", back_populates="exceptions")


class OverrideRecord(Base):
    __tablename__ = "overrides"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    checklist_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("checklist_items.id"), nullable=False)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False)
    requested_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    approved_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)  # Clinical rationale
    business_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Business/Operational justification
    impact: Mapped[str] = mapped_column(String(50), default=ImpactClassification.MODERATE.value)
    status: Mapped[str] = mapped_column(String(50), default=OverrideStatus.PENDING.value)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    checklist_item: Mapped["ChecklistItem"] = relationship("ChecklistItem", back_populates="overrides")
    requester: Mapped["User"] = relationship("User", back_populates="requested_overrides", foreign_keys=[requested_by])
    approver: Mapped[Optional["User"]] = relationship("User", back_populates="approved_overrides", foreign_keys=[approved_by])


class AuditRecord(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    patient_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("patients.id"), nullable=True)
    checklist_item_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("checklist_items.id"), nullable=True)
    evidence_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("evidence.id"), nullable=True)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    user_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    details: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class SystemSettings(Base):
    __tablename__ = "system_settings"
    __table_args__ = (
        CheckConstraint("id = 'global_config'", name="ck_system_settings_single_row"),
    )

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="global_config")
    hospital_name: Mapped[str] = mapped_column(String(255), default="Metropolitan Surgical Center of Excellence")
    hospital_id: Mapped[Optional[str]] = mapped_column(String(100), default="HOSP-001")
    location: Mapped[Optional[str]] = mapped_column(String(255), default="Coimbatore, Tamil Nadu")
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), default="admin@hospital-demo.com")
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), default="+91-800-555-0199")
    doctor_approval_required: Mapped[bool] = mapped_column(Boolean, default=True)
    high_risk_evidence_required: Mapped[bool] = mapped_column(Boolean, default=True)
    human_confirmation_required: Mapped[bool] = mapped_column(Boolean, default=True)
    override_reason_required: Mapped[bool] = mapped_column(Boolean, default=True)
    audit_logging_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    prevent_verification_without_evidence: Mapped[bool] = mapped_column(Boolean, default=True)
    fairness_threshold: Mapped[float] = mapped_column(Numeric(5, 2), default=10.0)
    audit_retention_days: Mapped[int] = mapped_column(Integer, default=3650)
    updated_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class NotificationSettings(Base):
    __tablename__ = "notification_settings"
    __table_args__ = (
        CheckConstraint("id = 'global_config'", name="ck_notif_settings_single_row"),
    )

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="global_config")
    notify_missing_evidence: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_high_risk_pending: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_exception_created: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_override_requested: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_final_approval_pending: Mapped[bool] = mapped_column(Boolean, default=True)


class ChecklistConfiguration(Base):
    __tablename__ = "checklist_configuration"
    __table_args__ = (
        CheckConstraint("id = 'global_config'", name="ck_checklist_config_single_row"),
    )

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="global_config")
    default_version: Mapped[str] = mapped_column(String(50), default="1.0")
    high_risk_evidence: Mapped[str] = mapped_column(String(50), default="Required")
    critical_evidence: Mapped[str] = mapped_column(String(50), default="Required")
    human_confirmation: Mapped[str] = mapped_column(String(50), default="Required")
    default_exception_severity: Mapped[str] = mapped_column(String(50), default="HIGH")
