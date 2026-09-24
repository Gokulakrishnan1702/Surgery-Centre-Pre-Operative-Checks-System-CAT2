import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log('Starting seed process...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data (in a real app, be careful with this)
    await client.query('TRUNCATE population_groups, audit_logs, overrides, exceptions, confirmations, evidence, checklist_items, surgeries, checklist_templates, patients, users CASCADE');

    console.log('Cleared existing data.');

    // 1. Insert Users
    const users = [
      { email: 'admin@demo.com', name: 'Admin User', role: 'ADMIN' },
      { email: 'surgeon@demo.com', name: 'Dr. Surgeon', role: 'SURGEON' },
      { email: 'nurse@demo.com', name: 'Nurse Nancy', role: 'NURSE' },
      { email: 'anesthetist@demo.com', name: 'Dr. Sleep', role: 'ANESTHETIST' },
      { email: 'radiologist@demo.com', name: 'Dr. Ray', role: 'RADIOLOGIST' },
      { email: 'pathologist@demo.com', name: 'Dr. Lab', role: 'PATHOLOGIST' },
      { email: 'cardiologist@demo.com', name: 'Dr. Heart', role: 'CARDIOLOGIST' },
      { email: 'auditor@demo.com', name: 'Audit Officer', role: 'AUDITOR' }
    ];

    const insertedUsers: Record<string, string> = {};
    for (const user of users) {
      const res = await client.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, 'hashed_password_demo', user.name, user.role]
      );
      insertedUsers[user.role] = res.rows[0].id;
    }
    console.log('Inserted Users');

    // 2. Insert Population Groups
    const groupA = await client.query("INSERT INTO population_groups (name) VALUES ('Group A') RETURNING id");
    const groupB = await client.query("INSERT INTO population_groups (name) VALUES ('Group B') RETURNING id");
    const groupAId = groupA.rows[0].id;
    const groupBId = groupB.rows[0].id;

    // 3. Insert Checklist Templates
    const templates = [
      { name: 'Allergy Review', risk: 'MEDIUM', role: 'NURSE', evidence: true, human: false },
      { name: 'ASA Classification', risk: 'HIGH', role: 'ANESTHETIST', evidence: true, human: true },
      { name: 'Recent Lab Results', risk: 'HIGH', role: 'PATHOLOGIST', evidence: true, human: true },
      { name: 'Imaging Review', risk: 'HIGH', role: 'RADIOLOGIST', evidence: true, human: true },
      { name: 'Medication Review', risk: 'MEDIUM', role: 'NURSE', evidence: true, human: false },
      { name: 'Cardiac Clearance', risk: 'CRITICAL', role: 'CARDIOLOGIST', evidence: true, human: true },
      { name: 'Consent Verification', risk: 'CRITICAL', role: 'SURGEON', evidence: true, human: true },
      { name: 'Blood Availability', risk: 'MEDIUM', role: 'NURSE', evidence: true, human: false },
      { name: 'Infection Screening', risk: 'MEDIUM', role: 'NURSE', evidence: true, human: false },
      { name: 'Final Surgical Site Confirmation', risk: 'CRITICAL', role: 'SURGEON', evidence: true, human: true }
    ];

    const insertedTemplates = [];
    for (const t of templates) {
      const res = await client.query(
        'INSERT INTO checklist_templates (name, risk_level, required_role, requires_evidence, requires_human_confirmation) VALUES ($1, $2, $3, $4, $5) RETURNING id, name',
        [t.name, t.risk, t.role, t.evidence, t.human]
      );
      insertedTemplates.push(res.rows[0]);
    }
    console.log('Inserted Templates');

    // 4. Insert Patients and specific Demo Patient R. Suresh
    const demoPatientRes = await client.query(
      `INSERT INTO patients (patient_id, name, age, gender, surgery_type, scheduled_date, status, assigned_team, population_group_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      ['P10001', 'R. Suresh', 56, 'Male', 'Cardiac Surgery', new Date('2025-04-28T10:00:00Z'), 'PENDING', 'Cardiac Team', groupAId]
    );
    const demoPatientId = demoPatientRes.rows[0].id;

    const demoSurgeryRes = await client.query('INSERT INTO surgeries (patient_id, status) VALUES ($1, $2) RETURNING id', [demoPatientId, 'SCHEDULED']);
    const demoSurgeryId = demoSurgeryRes.rows[0].id;

    // Add checklist items for demo patient
    for (const t of insertedTemplates) {
       await client.query(
        'INSERT INTO checklist_items (surgery_id, template_id, status) VALUES ($1, $2, $3)',
        [demoSurgeryId, t.id, 'PENDING'] // Leave pending so the demo flow can be completed
      );
    }
    console.log('Inserted Demo Patient R. Suresh');

    // Insert 49 more synthetic patients
    for (let i = 2; i <= 50; i++) {
        const pGroup = i % 2 === 0 ? groupAId : groupBId;
        const res = await client.query(
            `INSERT INTO patients (patient_id, name, age, gender, surgery_type, scheduled_date, status, assigned_team, population_group_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            ['P100' + i.toString().padStart(2, '0'), 'Patient ' + i, 30 + (i % 40), i % 2 === 0 ? 'Male' : 'Female', 'General Surgery', new Date(), 'PENDING', 'General Team', pGroup]
        );
        const pId = res.rows[0].id;
        const sRes = await client.query('INSERT INTO surgeries (patient_id) VALUES ($1) RETURNING id', [pId]);
        
        // Add items
        for (const t of insertedTemplates) {
            // randomly complete some
            const status = Math.random() > 0.5 ? 'VERIFIED' : 'PENDING';
            await client.query(
                'INSERT INTO checklist_items (surgery_id, template_id, status) VALUES ($1, $2, $3)',
                [sRes.rows[0].id, t.id, status]
            );
        }
    }
    console.log('Inserted 49 Synthetic Patients');

    await client.query('COMMIT');
    console.log('Seed completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
