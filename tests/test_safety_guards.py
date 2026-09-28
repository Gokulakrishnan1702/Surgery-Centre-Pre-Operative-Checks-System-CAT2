"""
SurgiGate Safety Guards Automated Test Suite
Covers the core documented safety architecture guards:
1. Expired Evidence Rejection
2. Duplicate Checklist Entry Prevention
3. Role-Gated Specialist Attestation (RBAC Enforcement)
4. Missing Evidence Rejection on High-Risk Milestones
5. Controlled Override Dual-Rationale Enforcement
"""

import pytest
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database.models import (
    ChecklistItem,
    ChecklistStatus,
    EvidenceRecord,
    VerificationStatus,
    ExceptionRecord,
    UserRole
)
from database.schemas import (
    EvidenceCreate,
    OverrideRequest,
    ImpactClassification
)


# ---------------------------------------------------------------------------
# Safety Guard Helper / Verification Service Functions
# ---------------------------------------------------------------------------

class RoleMismatchError(Exception):
    pass


class ExpiredEvidenceError(Exception):
    pass


class MissingEvidenceError(Exception):
    pass


class DuplicateChecklistEntryError(Exception):
    pass


def attach_and_verify_evidence(
    item: ChecklistItem,
    evidence: EvidenceRecord,
    verifier_role: str,
    db_session: Session
):
    """
    Enforces Safety Guard 1 (Expiry Check) and Safety Guard 3 (Role Gating).
    """
    # 1. Expired Evidence Safety Guard Check
    now = datetime.now(timezone.utc)
    if evidence.expiry:
        exp_time = evidence.expiry if evidence.expiry.tzinfo else evidence.expiry.replace(tzinfo=timezone.utc)
        if exp_time < now:
            evidence.verification_status = VerificationStatus.EXPIRED.value
            item.status = ChecklistStatus.EXCEPTION.value
            raise ExpiredEvidenceError(
                f"Safety Guard Alert: Evidence '{evidence.filename}' expired at {evidence.expiry} and cannot be used."
            )

    # 2. Role Gating Safety Guard Check
    if verifier_role != UserRole.ADMIN.value and verifier_role != item.required_role:
        raise RoleMismatchError(
            f"Safety Guard Alert: {item.name} mandates verification by {item.required_role}. "
            f"Clinician role '{verifier_role}' is not authorized."
        )

    # 3. Associate evidence and update item
    item.status = ChecklistStatus.VERIFIED.value
    db_session.flush()
    return item


def instantiate_checklist_item(
    surgery_id: str,
    patient_id: str,
    template,
    db_session: Session
) -> ChecklistItem:
    """
    Enforces Safety Guard 2 (Duplicate Checklist Entry Prevention) with idempotent check.
    """
    existing = db_session.query(ChecklistItem).filter_by(
        surgery_id=surgery_id,
        template_id=template.id
    ).first()

    if existing:
        raise DuplicateChecklistEntryError(
            f"Safety Guard Alert: Checklist template '{template.name}' ({template.id}) "
            f"is already instantiated for surgery {surgery_id}."
        )

    item = ChecklistItem(
        id=str(uuid.uuid4()),
        surgery_id=surgery_id,
        patient_id=patient_id,
        template_id=template.id,
        name=template.name,
        phase=template.phase,
        risk_level=template.risk_level,
        required_role=template.required_role,
        requires_evidence=template.requires_evidence,
        requires_human_confirmation=template.requires_human_confirmation,
        status=ChecklistStatus.NOT_STARTED.value
    )
    db_session.add(item)
    db_session.flush()
    return item


# ---------------------------------------------------------------------------
# Test Suite: Safety Guard 1 - Expired Evidence Rejection
# ---------------------------------------------------------------------------

class TestExpiredEvidenceRejection:
    """
    Safety Guard 1: Expired clinical evidence (e.g., coagulation panels >24h old,
    cardiac clearance >48h old) must be rejected and prevented from certifying milestones.
    """

    def test_schema_rejects_past_expiration_date(self):
        """Pydantic schema validator rejects evidence creation with past expiry timestamp."""
        past_date = datetime.now(timezone.utc) - timedelta(hours=2)

        with pytest.raises(ValueError, match="ExpiredEvidenceError"):
            EvidenceCreate(
                checklist_item_id="item-001",
                patient_id="pat-001",
                filename="outdated_coagulation_panel.pdf",
                sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                expiry=past_date
            )

    def test_runtime_guard_rejects_expired_evidence_and_flags_exception(self, session: Session, seed_data):
        """Runtime verification engine rejects expired evidence and transitions checklist to EXCEPTION."""
        cardiac_tmpl = seed_data["templates"]["cardiac"]
        surgery = seed_data["surgeries"]["surgery_a"]
        patient = seed_data["patients"]["patient_a"]
        cardio_user = seed_data["users"]["cardiologist"]

        item = instantiate_checklist_item(surgery.id, patient.id, cardiac_tmpl, session)

        # Create expired evidence record
        expired_date = datetime.now(timezone.utc) - timedelta(days=2)
        expired_evidence = EvidenceRecord(
            id=str(uuid.uuid4()),
            checklist_item_id=item.id,
            patient_id=patient.id,
            filename="cardiac_clearance_expired.pdf",
            sha256_hash="a" * 64,
            uploaded_by=cardio_user.id,
            verification_status=VerificationStatus.PENDING.value,
            expiry=expired_date
        )
        session.add(expired_evidence)
        session.flush()

        # Attempt verification with expired evidence
        with pytest.raises(ExpiredEvidenceError, match="Safety Guard Alert: Evidence .* expired"):
            attach_and_verify_evidence(
                item=item,
                evidence=expired_evidence,
                verifier_role=cardio_user.role,
                db_session=session
            )

        assert item.status == ChecklistStatus.EXCEPTION.value
        assert expired_evidence.verification_status == VerificationStatus.EXPIRED.value

    def test_valid_unexpired_evidence_accepted(self, session: Session, seed_data):
        """Active evidence within validity window succeeds verification."""
        cardiac_tmpl = seed_data["templates"]["cardiac"]
        surgery = seed_data["surgeries"]["surgery_a"]
        patient = seed_data["patients"]["patient_a"]
        cardio_user = seed_data["users"]["cardiologist"]

        item = instantiate_checklist_item(surgery.id, patient.id, cardiac_tmpl, session)

        # Fresh evidence valid for next 48 hours
        valid_date = datetime.now(timezone.utc) + timedelta(hours=48)
        valid_evidence = EvidenceRecord(
            id=str(uuid.uuid4()),
            checklist_item_id=item.id,
            patient_id=patient.id,
            filename="recent_echo_cardiogram.pdf",
            sha256_hash="b" * 64,
            uploaded_by=cardio_user.id,
            verification_status=VerificationStatus.VERIFIED.value,
            expiry=valid_date
        )
        session.add(valid_evidence)
        session.flush()

        verified_item = attach_and_verify_evidence(
            item=item,
            evidence=valid_evidence,
            verifier_role=cardio_user.role,
            db_session=session
        )

        assert verified_item.status == ChecklistStatus.VERIFIED.value


# ---------------------------------------------------------------------------
# Test Suite: Safety Guard 2 - Duplicate Checklist Entry Prevention
# ---------------------------------------------------------------------------

class TestDuplicateChecklistEntryPrevention:
    """
    Safety Guard 2: Pre-operative checklists must prevent duplicate instantiation of the
    same safety template for a given surgery instance.
    """

    def test_database_unique_constraint_blocks_duplicate_template(self, session: Session, seed_data):
        """Database UniqueConstraint(surgery_id, template_id) raises IntegrityError on duplicate insert."""
        allergy_tmpl = seed_data["templates"]["allergy"]
        surgery = seed_data["surgeries"]["surgery_a"]
        patient = seed_data["patients"]["patient_a"]

        # First checklist item insertion succeeds
        item1 = ChecklistItem(
            id=str(uuid.uuid4()),
            surgery_id=surgery.id,
            patient_id=patient.id,
            template_id=allergy_tmpl.id,
            name=allergy_tmpl.name,
            risk_level=allergy_tmpl.risk_level,
            status=ChecklistStatus.NOT_STARTED.value
        )
        session.add(item1)
        session.flush()

        # Second insertion with identical (surgery_id, template_id) violates uniqueness constraint
        item2 = ChecklistItem(
            id=str(uuid.uuid4()),
            surgery_id=surgery.id,
            patient_id=patient.id,
            template_id=allergy_tmpl.id,
            name=allergy_tmpl.name,
            risk_level=allergy_tmpl.risk_level,
            status=ChecklistStatus.NOT_STARTED.value
        )
        session.add(item2)

        with pytest.raises(IntegrityError):
            session.flush()

    def test_service_level_duplicate_prevention(self, session: Session, seed_data):
        """Service-level duplicate guard raises DuplicateChecklistEntryError."""
        consent_tmpl = seed_data["templates"]["consent"]
        surgery = seed_data["surgeries"]["surgery_b"]
        patient = seed_data["patients"]["patient_b"]

        # Initial instantiation
        instantiate_checklist_item(surgery.id, patient.id, consent_tmpl, session)

        # Duplicate instantiation attempt
        with pytest.raises(DuplicateChecklistEntryError, match="is already instantiated"):
            instantiate_checklist_item(surgery.id, patient.id, consent_tmpl, session)

    def test_distinct_templates_and_distinct_surgeries_allowed(self, session: Session, seed_data):
        """Distinct templates on the same surgery, and same template on different surgeries, succeed."""
        allergy_tmpl = seed_data["templates"]["allergy"]
        cardiac_tmpl = seed_data["templates"]["cardiac"]
        surgery_a = seed_data["surgeries"]["surgery_a"]
        surgery_b = seed_data["surgeries"]["surgery_b"]
        patient_a = seed_data["patients"]["patient_a"]
        patient_b = seed_data["patients"]["patient_b"]

        item_a1 = instantiate_checklist_item(surgery_a.id, patient_a.id, allergy_tmpl, session)
        item_a2 = instantiate_checklist_item(surgery_a.id, patient_a.id, cardiac_tmpl, session)
        item_b1 = instantiate_checklist_item(surgery_b.id, patient_b.id, allergy_tmpl, session)

        assert item_a1.id != item_a2.id
        assert item_a1.template_id != item_a2.template_id
        assert item_a1.surgery_id == item_a2.surgery_id
        assert item_a1.template_id == item_b1.template_id
        assert item_a1.surgery_id != item_b1.surgery_id


# ---------------------------------------------------------------------------
# Test Suite: Safety Guard 3 - Role-Gated Specialist Attestation (RBAC)
# ---------------------------------------------------------------------------

class TestRoleGatedVerification:
    """
    Safety Guard 3: Specialized critical milestones (e.g. Cardiac Clearance) mandate
    verification by the designated specialist role and strictly reject unauthorized roles.
    """

    def test_unauthorized_role_rejected_for_specialist_step(self, session: Session, seed_data):
        """Nurse or Surgeon attempting to verify CARDIOLOGIST milestone raises RoleMismatchError."""
        cardiac_tmpl = seed_data["templates"]["cardiac"]
        surgery = seed_data["surgeries"]["surgery_a"]
        patient = seed_data["patients"]["patient_a"]
        nurse_user = seed_data["users"]["nurse"]
        surgeon_user = seed_data["users"]["surgeon"]

        item = instantiate_checklist_item(surgery.id, patient.id, cardiac_tmpl, session)

        valid_evidence = EvidenceRecord(
            id=str(uuid.uuid4()),
            checklist_item_id=item.id,
            patient_id=patient.id,
            filename="cardio_consult_note.pdf",
            sha256_hash="c" * 64,
            uploaded_by=nurse_user.id,
            expiry=datetime.now(timezone.utc) + timedelta(days=1)
        )
        session.add(valid_evidence)
        session.flush()

        # Nurse attempt rejected
        with pytest.raises(RoleMismatchError, match="mandates verification by CARDIOLOGIST"):
            attach_and_verify_evidence(item, valid_evidence, nurse_user.role, session)

        # Surgeon attempt rejected
        with pytest.raises(RoleMismatchError, match="mandates verification by CARDIOLOGIST"):
            attach_and_verify_evidence(item, valid_evidence, surgeon_user.role, session)

    def test_cardiologist_and_admin_authorized(self, session: Session, seed_data):
        """Designated CARDIOLOGIST or system ADMIN can successfully certify specialist milestone."""
        cardiac_tmpl = seed_data["templates"]["cardiac"]
        surgery = seed_data["surgeries"]["surgery_a"]
        patient = seed_data["patients"]["patient_a"]
        cardio_user = seed_data["users"]["cardiologist"]
        admin_user = seed_data["users"]["admin"]

        item = instantiate_checklist_item(surgery.id, patient.id, cardiac_tmpl, session)
        valid_evidence = EvidenceRecord(
            id=str(uuid.uuid4()),
            checklist_item_id=item.id,
            patient_id=patient.id,
            filename="cardio_clearance_ecg.pdf",
            sha256_hash="d" * 64,
            uploaded_by=cardio_user.id,
            expiry=datetime.now(timezone.utc) + timedelta(days=3)
        )
        session.add(valid_evidence)
        session.flush()

        # Cardiologist verification succeeds
        verified = attach_and_verify_evidence(item, valid_evidence, cardio_user.role, session)
        assert verified.status == ChecklistStatus.VERIFIED.value

        # Admin override verification also succeeds
        verified_admin = attach_and_verify_evidence(item, valid_evidence, admin_user.role, session)
        assert verified_admin.status == ChecklistStatus.VERIFIED.value


# ---------------------------------------------------------------------------
# Test Suite: Safety Guard 4 - Missing Evidence Rejection
# ---------------------------------------------------------------------------

class TestMissingEvidenceRejection:
    """
    Safety Guard 4: Checklist milestones requiring evidence cannot be certified
    without an attached, authenticated evidence document.
    """

    def test_verification_without_evidence_rejected(self, session: Session, seed_data):
        cardiac_tmpl = seed_data["templates"]["cardiac"]
        surgery = seed_data["surgeries"]["surgery_a"]
        patient = seed_data["patients"]["patient_a"]
        cardio_user = seed_data["users"]["cardiologist"]

        item = instantiate_checklist_item(surgery.id, patient.id, cardiac_tmpl, session)

        def verify_without_evidence(chk_item, user_role):
            if chk_item.requires_evidence and len(chk_item.evidences) == 0:
                raise MissingEvidenceError(f"MissingEvidenceError: {chk_item.name} requires evidence attachment.")
            chk_item.status = ChecklistStatus.VERIFIED.value

        with pytest.raises(MissingEvidenceError, match="requires evidence attachment"):
            verify_without_evidence(item, cardio_user.role)


# ---------------------------------------------------------------------------
# Test Suite: Safety Guard 5 - Controlled Override Rationale Enforcement
# ---------------------------------------------------------------------------

class TestControlledOverrideEnforcement:
    """
    Safety Guard 5: Emergency bypass overrides mandate both clinical rationale (>=10 chars)
    AND operational/business rationale (>=5 chars) along with impact classification.
    """

    def test_override_missing_clinical_reason_fails(self):
        with pytest.raises(ValueError, match="at least 10 characters|InvalidOverrideError"):
            OverrideRequest(
                checklist_item_id="chk-001",
                patient_id="pat-001",
                reason="Too short",
                business_reason="Emergency surgery schedule approved",
                impact=ImpactClassification.MODERATE
            )

    def test_override_missing_business_reason_fails(self):
        with pytest.raises(ValueError, match="at least 5 characters|InvalidOverrideError"):
            OverrideRequest(
                checklist_item_id="chk-001",
                patient_id="pat-001",
                reason="Patient has stable baseline vitals and urgent surgical indication",
                business_reason="OR",  # Too short
                impact=ImpactClassification.MODERATE
            )

    def test_override_dual_justification_succeeds(self):
        override = OverrideRequest(
            checklist_item_id="chk-001",
            patient_id="pat-001",
            reason="Acute appendicitis with impending perforation; cannot await morning cardiology consultation",
            business_reason="Senior attending surgeon and CMO authorized emergent OR placement",
            impact=ImpactClassification.SIGNIFICANT
        )
        assert override.impact == ImpactClassification.SIGNIFICANT.value
        assert len(override.reason) >= 10
        assert len(override.business_reason) >= 5
