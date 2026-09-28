# SurgiGate: Evidence-Gated Pre-Operative Checklist & Surgical Safety Management System

> **SurgiGate** is an evidence-gated surgical safety platform that replaces passive checklist ticking with cryptographic verification. High-risk perioperative milestones mandate authenticated clinical evidence, specialist dual-attestation, controlled overrides, and an immutable audit ledger to guarantee absolute pre-incision readiness and patient safety.

> **ACADEMIC & DEMO PROTOTYPE NOTICE:**  
> This software is an engineering demonstration prototype utilizing **SYNTHETIC CLINICAL DATA ONLY**.  
> It must **NOT** be presented or used as a real clinical decision-making system. Do not enter real patient health information. It does not provide medical treatment advice or diagnostic conclusions.

---

## 1. Project Overview & Problem Statement

In hospital surgical suites, traditional pre-operative checklists often suffer from passive compliance: a staff member simply checks a box (e.g., `[✓] Allergy checked` or `[✓] Cardiac clearance`) without verifiable proof that:
- The underlying clinical evidence actually exists and was inspected
- Where the source information originated (EMR, PACS, Central Lab, or Specialist note)
- Which authenticated clinician verified it and at what exact timestamp
- Whether an exception occurred or whether a high-risk bypass override was authorized
- Complete auditability across surgical, nursing, anesthesia, and diagnostic teams

### The Solution: Evidence-Gated Safety Architecture
This platform implements an evidence-backed verification engine where high-risk and critical pre-operative steps cannot be certified by simply checking a box:
1. **Low Risk**: Basic role verification.
2. **Medium Risk**: Requires authenticated evidence attachment + responsible role verification.
3. **High Risk**: Requires evidence attachment + responsible role verification + explicit human confirmation modal sign-off.
4. **Critical Risk**: Strict dual-attestation: evidence attachment + specialist role confirmation + Lead Surgeon / CMO final pre-op review.
5. **Controlled Overrides**: Controlled exception bypass requiring both clinical and business reasons, impact classification, explicit acknowledgment, and senior surgeon/admin authorization.
6. **Immutable Audit Trail**: Append-only forensic ledger recording every verification, upload, and override with tamper guarantees.
7. **Bias & Fairness Evaluation**: Continuous monitoring of demographic parity across synthetic patient cohorts with configurable thresholds.

---

## 2. Technology Stack

- **Frontend**:
  - React 19 + TypeScript + Vite 8
  - Tailwind CSS v4 (with `@tailwindcss/vite`)
  - React Router DOM v7
  - Recharts (Donut, Grouped Bar, Area, and Workload charts)
  - Lucide React icons
- **Backend**:
  - Node.js (v20+ / v24+) + Express.js 5 + TypeScript
  - Active synthetic clinical data store with PostgreSQL / Supabase adapter
  - JWT Authentication + Role-Based Access Control (RBAC) middleware
- **Database**:
  - PostgreSQL / Supabase schema (`database/schema/schema.sql`)
  - Automated synthetic database seeder (`database/seed/` & `backend/src/scripts/seed.ts`)

---

## 3. Application Architecture

```
project-root/
├── frontend/                     # React + Vite + Tailwind UI
│   ├── src/
│   │   ├── components/           # KpiCard, StatusBadge, RiskBadge, WorkflowStepper
│   │   ├── context/              # AuthContext (Role switching, permissions, JWT session)
│   │   ├── pages/                # Dashboard, Patients, PatientDetail, Evidence, Exceptions, Overrides, Audit, Analytics, Fairness
│   │   └── services/             # api.ts (Centralized REST API client)
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── middleware/           # auth.ts (JWT authentication & RBAC guards)
│   │   ├── models/               # types.ts (Data contracts)
│   │   ├── routes/               # auth, patients, checklist, evidence, exceptions, overrides, audit, analytics, fairness
│   │   ├── services/             # store.ts (Master synthetic clinical data engine & analytics)
│   │   └── index.ts              # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── database/                     # Executable Database Layer & Migrations
│   ├── models.py                 # Executable SQLAlchemy 2.0 ORM domain models
│   ├── schemas.py                # Executable Pydantic v2 validation contracts
│   ├── migrate.py                # Migration CLI runner (up, down, test-cycle)
│   ├── migrations/               # Alembic versioned migration environment
│   │   ├── env.py                # Dynamic DB configuration and metadata binding
│   │   └── versions/             # Versioned migration revisions (001_initial_schema.py)
│   └── schema/schema.sql         # PostgreSQL DDL reference
├── evaluations/                  # Formal Algorithmic Bias Evaluation Engine
│   └── bias_protocol.py          # Quantifiable metrics (FCR, Override Disparity, DIR, SPD)
├── docs/
│   └── BIAS_EVALUATION_PROTOCOL.md # Formal Health Equity & Parity Specification
├── tests/                        # Automated Pytest Suite (Safety Guards & Protocol)
│   ├── conftest.py               # In-memory SQLite fixtures & clinical seed datasets
│   ├── test_safety_guards.py     # Safety guards 1-5 (Expired evidence, duplicate entries, role gating)
│   ├── test_bias_evaluation.py   # Mathematical and threshold tests for FCR, OD, DIR
│   └── test_models_and_schemas.py# Pydantic v2 and SQLAlchemy ORM relationship tests
├── alembic.ini                   # Alembic database configuration
├── pytest.ini                    # Pytest test configuration
├── requirements.txt              # Python dependencies
└── README.md
```

---

## 4. Demo Login Personas & Roles

For immediate demonstration and testing, 8 pre-seeded synthetic clinician accounts are available. All accounts share the demo password: `password`.

| Role | Synthetic Persona | Primary Clinical Permissions |
| :--- | :--- | :--- |
| **SURGEON** | Dr. Marcus Vance (`surgeon@demo.com`) | View assigned patients, confirm critical steps, request/approve overrides, final surgical sign-off |
| **NURSE** | Nurse Clara Barton (`nurse@demo.com`) | Update checklist items, attach evidence, verify nursing items |
| **CARDIOLOGIST** | Dr. Kenneth Chen (`cardiologist@demo.com`) | Verify cardiac clearance, echocardiogram reports & ECG attestation |
| **ANESTHETIST** | Dr. Arthur Pendelton (`anesthetist@demo.com`) | Verify ASA classification (I-VI) & airway assessment score |
| **RADIOLOGIST** | Dr. Sanjay Patel (`radiologist@demo.com`) | Review PACS diagnostic images & verify radiological landmarks |
| **PATHOLOGIST** | Dr. Helena Rostova (`pathologist@demo.com`) | Verify hematology (CBC), renal function, and coagulation panels (PT/INR) |
| **AUDITOR** | Sarah Jenkins (`auditor@demo.com`) | Read-only access to immutable audit logs, safety metrics & fairness reports |
| **ADMIN** | Dr. Evelyn Reed (`admin@demo.com`) | Chief Medical Officer: full system access, user management & global overrides |

> **Interactive Role Switcher:** In the application topbar, click the **ACTIVE ROLE** button to instantly switch between any of the 8 clinician personas to test server-side role gating in real-time.

---

## 5. Running the Application Locally

### Prerequisites
- Node.js (v18 or higher; v20+ recommended)
- npm (v9+)

### Step 1: Start the Backend API Server
```bash
cd backend
npm install
npm run dev
```
- Server starts at `http://localhost:5000`
- Provides all REST API endpoints under `/api/*`
- Automatically loads the synthetic clinical dataset (53 patients, 10 checklist templates, audit trail, exceptions, overrides, and fairness cohorts).

### Step 2: Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Client starts at `http://localhost:3000`
- Proxies `/api` calls directly to `http://localhost:5000`.

### Step 3: Run Database Migrations (Alembic)
Executable SQLAlchemy 2.0 ORM domain models and versioned Alembic migration scripts back up the system architecture:
```bash
# Apply migrations to HEAD
python database/migrate.py up

# Check migration revision history
python database/migrate.py history

# Run automated upgrade/downgrade lifecycle test
python database/migrate.py test-cycle
```

### Step 4: Run Automated Test Suite (pytest)
An automated test suite validates the core safety guards, formal bias protocol, and domain schemas:
```bash
pytest
```
- Covers **Expired Evidence Rejection** (schema and runtime guards)
- Covers **Duplicate Checklist Entry Prevention** (database uniqueness constraints & service deduplication)
- Covers **Role-Gated Specialist Attestation** (RBAC enforcement & unauthorized rejection)
- Covers **Missing Evidence Rejection** on high-risk milestones
- Covers **Controlled Override Enforcement** (clinical + business dual-justification)
- Covers **Formal Bias Protocol Metrics** (False-Completion Rate, Override Disparity, 4/5ths Rule)

---

## 6. End-to-End Demo Scenario Walkthrough

### The Scenario: Patient R. Suresh (P10001)
- **Age/Gender**: 56 Male
- **Surgery**: Synthetic Cardiac Surgery (CABG x 3)
- **Scheduled**: 28 Apr 2025, 10:00 AM
- **Initial Checklist Status**:
  - Allergy Review: `VERIFIED` (Nurse Clara Barton, EMR attached)
  - ASA Classification: `VERIFIED` (Dr. Pendelton, ASA III)
  - Recent Lab Results: `VERIFIED` (Dr. Rostova, CBC & INR within bounds)
  - Imaging Review: `PENDING` (Awaiting PACS chest radiograph)
  - Medication Review: `VERIFIED` (Antiplatelet protocol reviewed)
  - **Cardiac Clearance**: `EXCEPTION` (Missing official cardiologist clearance documentation)
  - Consent Verification: `VERIFIED` (Witnessed surgical consent form)

### Step-by-Step Flow:
1. Open `http://localhost:3000/`.
2. Click on the **Lead Surgeon** demo persona or enter `surgeon@demo.com` / `password`.
3. On the Dashboard, click **Open Demo Patient Checklist** on the top banner (or go to **Patients** -> select **R. Suresh**).
4. Inspect the **High-Risk Pre-Operative Checklist Matrix**. Notice that **Cardiac Clearance** is in `EXCEPTION` status due to missing specialist clearance.
5. In the Cardiac Clearance row, click **Attach** to open the Evidence Upload modal. Click **Attach & Upload Evidence** to attach synthetic record `cardiology_clearance_dr_chen_demo.pdf`.
6. Switch your persona to **CARDIOLOGIST** via the topbar role dropdown (or test clicking "Confirm" as Surgeon to observe the server-side role mismatch rejection).
7. As Cardiologist, click **Confirm**. The **Human Confirmation Required** modal appears with attached evidence details and attestation text.
8. Check `[✓] I attest that I have directly inspected the evidence document...`, enter a clinical review note, and click **Confirm Verification**.
9. Observe the status dynamically change to **✓ Verified** with an explicit confirmation badge.
10. Navigate to the **Audit Log** page from the sidebar to inspect the newly recorded immutable audit entry with timestamp, clinician name, and cryptographic details.
11. Navigate to the **Analytics** page to inspect the measurable before-vs-after comparison, and the **Bias & Fairness** page to test synthetic cohort parity.

---

## 7. PostgreSQL & Supabase Setup (Optional)

If connecting to an external Supabase or PostgreSQL instance:
1. Create a PostgreSQL database or Supabase project.
2. In the Supabase SQL Editor, execute the schema located in:
   `database/schema/schema.sql`
3. Add your connection string to a root `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
   JWT_SECRET=your-secure-jwt-secret-key-2025
   PORT=5000
   ```
4. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```

---

## 8. Measurable Before vs. After Experiment Results

Calculated directly from the synthetic experiment simulation dataset comparing a traditional checkbox checklist against this evidence-backed system:

| Metric | Baseline (Checkbox Only) | Evidence-Backed Prototype | Measured Delta |
| :--- | :---: | :---: | :---: |
| **Evidence-Backed Critical Steps** | 18.4% | **94.2%** | **+75.8%** |
| **Missing Evidence Rate** | 42.1% | **3.8%** | **-38.3%** |
| **Human Confirmation Rate** | 21.0% | **97.6%** | **+76.6%** |
| **Audit Completeness** | 14.5% | **100.0%** | **+85.5%** |
| **Unresolved High-Risk Items Entering OR** | 36.8% | **5.2%** | **-31.6%** |

---

## 9. Known Prototype Limitations

- **Synthetic Records Only**: All patient records, diagnoses, and medical reports are synthetically generated for software demonstration purposes and do not represent real human subjects.
- **Mock File Storage**: Simulated attachments generate secure synthetic preview cards. In a production cloud deployment, Supabase Storage buckets or AWS S3 with signed URLs would host binary DICOM/PDF objects.
- **Workflow Simulation**: Final pre-operative approval is an administrative workflow demonstration and does not determine real clinical readiness.
