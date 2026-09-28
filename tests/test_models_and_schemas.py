"""
SurgiGate Models and Schemas Automated Test Suite
Validates:
1. Pydantic v2 schema validations and serializations
2. SQLAlchemy 2.0 ORM model constraints and relationship mappings
"""

import pytest
import uuid
from datetime import datetime, timezone
from pydantic import ValidationError
from sqlalchemy.orm import Session

from database.models import (
    User,
    UserRole,
    Patient,
    ChecklistTemplate,
    Surgery,
    ChecklistItem,
    EvidenceRecord,
    SystemSettings
)
from database.schemas import (
    UserCreate,
    PatientCreate,
    ChecklistTemplateCreate,
    EvidenceCreate,
    OverrideRequest,
    ImpactClassification
)


class TestSchemas:
    """Validates Pydantic v2 domain schemas and input constraints."""

    def test_user_create_valid(self):
        user = UserCreate(
            email="dr.chen@hospital.org",
            name="Dr. Kenneth Chen",
            role=UserRole.CARDIOLOGIST,
            password="securePassword123!"
        )
        assert user.email == "dr.chen@hospital.org"
        assert user.role == UserRole.CARDIOLOGIST.value

    def test_user_create_invalid_email(self):
        with pytest.raises(ValidationError):
            UserCreate(
                email="not-an-email",
                name="Dr. Invalid",
                role=UserRole.SURGEON,
                password="pass"
            )

    def test_patient_create_age_bounds(self):
        with pytest.raises(ValidationError):
            PatientCreate(
                patient_id="P99999",
                name="Invalid Age",
                age=150  # Exceeds max 130
            )

    def test_checklist_template_create_default_hours(self):
        tmpl = ChecklistTemplateCreate(
            name="Airway Assessment (Mallampati Score)",
            risk_level="HIGH",
            required_role=UserRole.ANESTHETIST,
            requires_evidence=True
        )
        assert tmpl.max_evidence_age_hours == 72
        assert tmpl.requires_evidence is True


class TestOrmModels:
    """Validates SQLAlchemy ORM model relationships and database constraints."""

    def test_patient_surgery_checklist_relationship(self, session: Session, seed_data):
        patient = seed_data["patients"]["patient_a"]
        surgery = seed_data["surgeries"]["surgery_a"]
        allergy_tmpl = seed_data["templates"]["allergy"]

        item = ChecklistItem(
            id=str(uuid.uuid4()),
            surgery_id=surgery.id,
            patient_id=patient.id,
            template_id=allergy_tmpl.id,
            name=allergy_tmpl.name,
            risk_level=allergy_tmpl.risk_level
        )
        session.add(item)
        session.flush()

        # Check navigation across relationships
        assert item.surgery.id == surgery.id
        assert item.patient.id == patient.id
        assert item in surgery.checklist_items
        assert item in patient.checklist_items

    def test_system_settings_defaults(self, session: Session):
        settings = SystemSettings(
            id="global_config",
            hospital_name="Regional Surgical Center",
            fairness_threshold=10.0
        )
        session.add(settings)
        session.flush()

        retrieved = session.query(SystemSettings).filter_by(id="global_config").first()
        assert retrieved is not None
        assert retrieved.hospital_name == "Regional Surgical Center"
        assert retrieved.fairness_threshold == 10.0
        assert retrieved.doctor_approval_required is True
