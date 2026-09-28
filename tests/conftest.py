"""
Pytest configuration and database test fixtures for SurgiGate
"""

import pytest
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from database.models import (
    Base,
    User,
    UserRole,
    UserStatus,
    PopulationGroup,
    Patient,
    RiskLevel,
    PatientStatus,
    ChecklistTemplate,
    ChecklistPhase,
    Surgery,
    SurgeryStatus,
    ChecklistItem,
    ChecklistStatus,
    EvidenceRecord,
    EvidenceType,
    VerificationStatus,
    SystemSettings,
    NotificationSettings,
    ChecklistConfiguration
)


@pytest.fixture(scope="session")
def engine():
    """In-memory SQLite database engine for fast, isolated test execution."""
    test_engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(test_engine)
    yield test_engine
    Base.metadata.drop_all(test_engine)


@pytest.fixture(scope="function")
def session(engine):
    """Provides a transactional database session per test function."""
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = sessionmaker(bind=connection, expire_on_commit=False)
    db_session: Session = SessionLocal()

    yield db_session

    db_session.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()


@pytest.fixture
def seed_data(session: Session):
    """
    Seeds standard baseline users, templates, and clinical entities for test cases.
    """
    # 1. Population Groups
    grp_a = PopulationGroup(
        id="grp-A",
        name="Cohort Alpha (Urban / Tier-1)",
        code="grp-A",
        description="Urban Academic Medical Center reference cohort"
    )
    grp_b = PopulationGroup(
        id="grp-B",
        name="Cohort Beta (Regional / Tier-2)",
        code="grp-B",
        description="Regional Community Hospital comparison cohort"
    )
    session.add_all([grp_a, grp_b])

    # 2. Clinicians
    admin_user = User(
        id="usr-admin",
        email="admin@hospital-demo.com",
        name="Dr. Evelyn Reed",
        role=UserRole.ADMIN.value,
        password_hash="hashed_pw_admin"
    )
    surgeon_user = User(
        id="usr-surgeon",
        email="surgeon@demo.com",
        name="Dr. Marcus Vance",
        role=UserRole.SURGEON.value,
        password_hash="hashed_pw_surgeon"
    )
    nurse_user = User(
        id="usr-nurse",
        email="nurse@demo.com",
        name="Nurse Clara Barton",
        role=UserRole.NURSE.value,
        password_hash="hashed_pw_nurse"
    )
    cardiologist_user = User(
        id="usr-cardio",
        email="cardiologist@demo.com",
        name="Dr. Kenneth Chen",
        role=UserRole.CARDIOLOGIST.value,
        password_hash="hashed_pw_cardio"
    )
    anesthetist_user = User(
        id="usr-anes",
        email="anesthetist@demo.com",
        name="Dr. Arthur Pendelton",
        role=UserRole.ANESTHETIST.value,
        password_hash="hashed_pw_anes"
    )
    session.add_all([admin_user, surgeon_user, nurse_user, cardiologist_user, anesthetist_user])

    # 3. Checklist Templates
    allergy_tmpl = ChecklistTemplate(
        id="tmpl-allergy",
        template_code="ALLERGY_CHECK",
        name="Allergy & Anaphylaxis Verification",
        phase=ChecklistPhase.SIGN_IN.value,
        risk_level=RiskLevel.MEDIUM.value,
        required_role=UserRole.NURSE.value,
        requires_evidence=True,
        requires_human_confirmation=False,
        max_evidence_age_hours=72
    )
    cardiac_tmpl = ChecklistTemplate(
        id="tmpl-cardiac",
        template_code="CARDIAC_CLEARANCE",
        name="Pre-Operative Cardiac Clearance",
        phase=ChecklistPhase.SIGN_IN.value,
        risk_level=RiskLevel.CRITICAL.value,
        required_role=UserRole.CARDIOLOGIST.value,
        requires_evidence=True,
        requires_human_confirmation=True,
        max_evidence_age_hours=48
    )
    consent_tmpl = ChecklistTemplate(
        id="tmpl-consent",
        template_code="INFORMED_CONSENT",
        name="Informed Surgical Consent Form",
        phase=ChecklistPhase.SIGN_IN.value,
        risk_level=RiskLevel.HIGH.value,
        required_role=UserRole.SURGEON.value,
        requires_evidence=True,
        requires_human_confirmation=True,
        max_evidence_age_hours=168
    )
    session.add_all([allergy_tmpl, cardiac_tmpl, consent_tmpl])

    # 4. Patients
    patient_a = Patient(
        id="pat-101",
        patient_id="P10001",
        name="R. Suresh",
        age=56,
        gender="Male",
        surgery_type="CABG x 3 (Cardiothoracic)",
        risk_level=RiskLevel.CRITICAL.value,
        status=PatientStatus.PENDING.value,
        population_group_id=grp_a.id
    )
    patient_b = Patient(
        id="pat-102",
        patient_id="P10002",
        name="M. Fathima",
        age=48,
        gender="Female",
        surgery_type="Total Knee Arthroplasty",
        risk_level=RiskLevel.MEDIUM.value,
        status=PatientStatus.PENDING.value,
        population_group_id=grp_b.id
    )
    session.add_all([patient_a, patient_b])

    # 5. Surgery Instances
    surgery_a = Surgery(
        id="surg-101",
        patient_id=patient_a.id,
        status=SurgeryStatus.SCHEDULED.value,
        surgery_name="Coronary Artery Bypass Graft",
        or_room="OR-3"
    )
    surgery_b = Surgery(
        id="surg-102",
        patient_id=patient_b.id,
        status=SurgeryStatus.SCHEDULED.value,
        surgery_name="Total Knee Replacement",
        or_room="OR-1"
    )
    session.add_all([surgery_a, surgery_b])

    session.flush()

    return {
        "groups": {"grp_a": grp_a, "grp_b": grp_b},
        "users": {
            "admin": admin_user,
            "surgeon": surgeon_user,
            "nurse": nurse_user,
            "cardiologist": cardiologist_user,
            "anesthetist": anesthetist_user
        },
        "templates": {
            "allergy": allergy_tmpl,
            "cardiac": cardiac_tmpl,
            "consent": consent_tmpl
        },
        "patients": {"patient_a": patient_a, "patient_b": patient_b},
        "surgeries": {"surgery_a": surgery_a, "surgery_b": surgery_b}
    }
