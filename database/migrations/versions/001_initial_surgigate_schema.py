"""Initial SurgiGate Schema Migration

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-28 08:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), server_default='ACTIVE'),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. population_groups
    op.create_table(
        'population_groups',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('code', sa.String(50), unique=True, nullable=True),
    )

    # 3. patients
    op.create_table(
        'patients',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('patient_id', sa.String(50), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.String(20), nullable=True),
        sa.Column('surgery_type', sa.String(255), nullable=True),
        sa.Column('scheduled_date', sa.DateTime(), nullable=True),
        sa.Column('risk_level', sa.String(50), server_default='LOW'),
        sa.Column('status', sa.String(50), server_default='PENDING'),
        sa.Column('assigned_team', sa.String(255), nullable=True),
        sa.Column('population_group_id', sa.String(36), sa.ForeignKey('population_groups.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_patients_patient_id', 'patients', ['patient_id'], unique=True)

    # 4. checklist_templates
    op.create_table(
        'checklist_templates',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('template_code', sa.String(50), unique=True, nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phase', sa.String(50), server_default='SIGN_IN'),
        sa.Column('risk_level', sa.String(50), nullable=False),
        sa.Column('required_role', sa.String(50), nullable=True),
        sa.Column('requires_evidence', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('requires_human_confirmation', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('rule_explanation', sa.Text(), nullable=True),
        sa.Column('max_evidence_age_hours', sa.Integer(), server_default='72'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 5. surgeries
    op.create_table(
        'surgeries',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('status', sa.String(50), server_default='SCHEDULED'),
        sa.Column('surgery_name', sa.String(255), nullable=True),
        sa.Column('or_room', sa.String(50), nullable=True),
        sa.Column('scheduled_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 6. checklist_items (Unique constraint enforces duplicate entry prevention)
    op.create_table(
        'checklist_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('surgery_id', sa.String(36), sa.ForeignKey('surgeries.id'), nullable=False),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('template_id', sa.String(36), sa.ForeignKey('checklist_templates.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phase', sa.String(50), server_default='SIGN_IN'),
        sa.Column('risk_level', sa.String(50), nullable=False),
        sa.Column('required_role', sa.String(50), nullable=True),
        sa.Column('requires_evidence', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('requires_human_confirmation', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('status', sa.String(50), server_default='NOT_STARTED'),
        sa.Column('verified_by', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('human_confirmed', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('surgery_id', 'template_id', name='uq_surgery_template_entry')
    )

    # 7. evidence
    op.create_table(
        'evidence',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('checklist_item_id', sa.String(36), sa.ForeignKey('checklist_items.id'), nullable=False),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('evidence_type', sa.String(50), server_default='DOCUMENT'),
        sa.Column('source', sa.String(255), nullable=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=True),
        sa.Column('file_size', sa.String(50), nullable=True),
        sa.Column('sha256_hash', sa.String(64), nullable=False),
        sa.Column('uploaded_by', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('verification_status', sa.String(50), server_default='PENDING'),
        sa.Column('expiry', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 8. confirmations
    op.create_table(
        'confirmations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('checklist_item_id', sa.String(36), sa.ForeignKey('checklist_items.id'), nullable=False),
        sa.Column('evidence_id', sa.String(36), sa.ForeignKey('evidence.id'), nullable=True),
        sa.Column('confirmed_by', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('decision', sa.String(50), server_default='APPROVED'),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 9. exceptions
    op.create_table(
        'exceptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('checklist_item_id', sa.String(36), sa.ForeignKey('checklist_items.id'), nullable=False),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('severity', sa.String(50), server_default='HIGH'),
        sa.Column('category', sa.String(255), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(50), server_default='OPEN'),
        sa.Column('created_by', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('assigned_role', sa.String(50), nullable=True),
        sa.Column('resolved_by', sa.String(255), nullable=True),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 10. overrides
    op.create_table(
        'overrides',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('checklist_item_id', sa.String(36), sa.ForeignKey('checklist_items.id'), nullable=False),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id'), nullable=False),
        sa.Column('requested_by', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('approved_by', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('business_reason', sa.Text(), nullable=True),
        sa.Column('impact', sa.String(50), server_default='MODERATE'),
        sa.Column('status', sa.String(50), server_default='PENDING'),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 11. audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('patient_id', sa.String(36), sa.ForeignKey('patients.id'), nullable=True),
        sa.Column('checklist_item_id', sa.String(36), sa.ForeignKey('checklist_items.id'), nullable=True),
        sa.Column('evidence_id', sa.String(36), sa.ForeignKey('evidence.id'), nullable=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('user_role', sa.String(50), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('sha256_hash', sa.String(64), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 12. system_settings
    op.create_table(
        'system_settings',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('hospital_name', sa.String(255), server_default='Metropolitan Surgical Center of Excellence'),
        sa.Column('hospital_id', sa.String(100), server_default='HOSP-001'),
        sa.Column('location', sa.String(255), server_default='Coimbatore, Tamil Nadu'),
        sa.Column('contact_email', sa.String(255), server_default='admin@hospital-demo.com'),
        sa.Column('contact_phone', sa.String(50), server_default='+91-800-555-0199'),
        sa.Column('doctor_approval_required', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('high_risk_evidence_required', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('human_confirmation_required', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('override_reason_required', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('audit_logging_enabled', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('prevent_verification_without_evidence', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('fairness_threshold', sa.Numeric(5, 2), server_default='10.0'),
        sa.Column('audit_retention_days', sa.Integer(), server_default='3650'),
        sa.Column('updated_by', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.CheckConstraint("id = 'global_config'", name='ck_system_settings_single_row')
    )

    # 13. notification_settings
    op.create_table(
        'notification_settings',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('notify_missing_evidence', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('notify_high_risk_pending', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('notify_exception_created', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('notify_override_requested', sa.Boolean(), server_default=sa.text('1')),
        sa.Column('notify_final_approval_pending', sa.Boolean(), server_default=sa.text('1')),
        sa.CheckConstraint("id = 'global_config'", name='ck_notif_settings_single_row')
    )

    # 14. checklist_configuration
    op.create_table(
        'checklist_configuration',
        sa.Column('id', sa.String(50), primary_key=True),
        sa.Column('default_version', sa.String(50), server_default='1.0'),
        sa.Column('high_risk_evidence', sa.String(50), server_default='Required'),
        sa.Column('critical_evidence', sa.String(50), server_default='Required'),
        sa.Column('human_confirmation', sa.String(50), server_default='Required'),
        sa.Column('default_exception_severity', sa.String(50), server_default='HIGH'),
        sa.CheckConstraint("id = 'global_config'", name='ck_checklist_config_single_row')
    )

    # Seed initial configuration records
    op.execute(
        "INSERT INTO system_settings (id, hospital_name, hospital_id, location, contact_email, contact_phone, fairness_threshold) "
        "VALUES ('global_config', 'Metropolitan Surgical Center of Excellence', 'HOSP-001', 'Coimbatore, Tamil Nadu', 'admin@hospital-demo.com', '+91-800-555-0199', 10.0)"
    )
    op.execute("INSERT INTO notification_settings (id) VALUES ('global_config')")
    op.execute("INSERT INTO checklist_configuration (id) VALUES ('global_config')")


def downgrade() -> None:
    op.drop_table('checklist_configuration')
    op.drop_table('notification_settings')
    op.drop_table('system_settings')
    op.drop_table('audit_logs')
    op.drop_table('overrides')
    op.drop_table('exceptions')
    op.drop_table('confirmations')
    op.drop_table('evidence')
    op.drop_table('checklist_items')
    op.drop_table('surgeries')
    op.drop_table('checklist_templates')
    op.drop_table('patients')
    op.drop_table('population_groups')
    op.drop_table('users')
