-- schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (Roles: ADMIN, SURGEON, NURSE, ANESTHETIST, RADIOLOGIST, PATHOLOGIST, CARDIOLOGIST, AUDITOR)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., P10001
    name VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(20),
    surgery_type VARCHAR(255),
    scheduled_date TIMESTAMP,
    risk_level VARCHAR(50) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, READY, EXCEPTION
    assigned_team VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Templates
CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    required_role VARCHAR(50),
    requires_evidence BOOLEAN DEFAULT FALSE,
    requires_human_confirmation BOOLEAN DEFAULT FALSE,
    rule_explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surgeries (Links patients to a specific surgery instance)
CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Items (Instantiated from templates for a surgery)
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surgery_id UUID REFERENCES surgeries(id),
    template_id UUID REFERENCES checklist_templates(id),
    status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, PENDING, VERIFIED, EXCEPTION, OVERRIDE
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evidence
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_item_id UUID REFERENCES checklist_items(id),
    patient_id UUID REFERENCES patients(id),
    evidence_type VARCHAR(50), -- EMR, LAB, PACS, DOCUMENT, etc.
    source VARCHAR(255),
    file_url TEXT,
    uploaded_by UUID REFERENCES users(id),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Human Confirmations
CREATE TABLE confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_item_id UUID REFERENCES checklist_items(id),
    evidence_id UUID REFERENCES evidence(id),
    confirmed_by UUID REFERENCES users(id),
    decision VARCHAR(50),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exceptions
CREATE TABLE exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_item_id UUID REFERENCES checklist_items(id),
    patient_id UUID REFERENCES patients(id),
    severity VARCHAR(50), -- LOW, MEDIUM, HIGH, CRITICAL
    category VARCHAR(255), -- Missing Evidence, Expired Evidence, etc.
    reason TEXT,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, UNDER_REVIEW, RESOLVED, OVERRIDDEN
    created_by UUID REFERENCES users(id),
    assigned_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Overrides
CREATE TABLE overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_item_id UUID REFERENCES checklist_items(id),
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    reason TEXT,
    business_reason TEXT,
    impact VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- CHECKLIST_CREATED, EVIDENCE_UPLOADED, etc.
    patient_id UUID REFERENCES patients(id),
    checklist_item_id UUID REFERENCES checklist_items(id),
    evidence_id UUID REFERENCES evidence(id),
    user_id UUID REFERENCES users(id),
    user_role VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- population_groups setup
CREATE TABLE population_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    description TEXT
);

-- Assign patients to population groups (for testing purposes)
ALTER TABLE patients ADD COLUMN population_group_id UUID REFERENCES population_groups(id);

-- System Settings
CREATE TABLE system_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global_config',
    hospital_name VARCHAR(255) NOT NULL,
    hospital_id VARCHAR(100),
    location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    doctor_approval_required BOOLEAN DEFAULT TRUE,
    high_risk_evidence_required BOOLEAN DEFAULT TRUE,
    human_confirmation_required BOOLEAN DEFAULT TRUE,
    override_reason_required BOOLEAN DEFAULT TRUE,
    audit_logging_enabled BOOLEAN DEFAULT TRUE,
    prevent_verification_without_evidence BOOLEAN DEFAULT TRUE,
    fairness_threshold NUMERIC(5, 2) DEFAULT 10.0,
    audit_retention_days INT DEFAULT 3650,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 'global_config')
);

-- Notification Settings
CREATE TABLE notification_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global_config',
    notify_missing_evidence BOOLEAN DEFAULT TRUE,
    notify_high_risk_pending BOOLEAN DEFAULT TRUE,
    notify_exception_created BOOLEAN DEFAULT TRUE,
    notify_override_requested BOOLEAN DEFAULT TRUE,
    notify_final_approval_pending BOOLEAN DEFAULT TRUE,
    CONSTRAINT single_row CHECK (id = 'global_config')
);

-- Checklist Configuration
CREATE TABLE checklist_configuration (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global_config',
    default_version VARCHAR(50) DEFAULT '1.0',
    high_risk_evidence VARCHAR(50) DEFAULT 'Required',
    critical_evidence VARCHAR(50) DEFAULT 'Required',
    human_confirmation VARCHAR(50) DEFAULT 'Required',
    default_exception_severity VARCHAR(50) DEFAULT 'HIGH',
    CONSTRAINT single_row CHECK (id = 'global_config')
);

-- Insert Default Settings
INSERT INTO system_settings (id, hospital_name, hospital_id, location, contact_email, contact_phone, fairness_threshold)
VALUES ('global_config', 'Metropolitan Surgical Center of Excellence', 'HOSP-001', 'Coimbatore, Tamil Nadu', 'admin@hospital-demo.com', '+91-800-555-0199', 10.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO notification_settings (id) VALUES ('global_config') ON CONFLICT (id) DO NOTHING;
INSERT INTO checklist_configuration (id) VALUES ('global_config') ON CONFLICT (id) DO NOTHING;

