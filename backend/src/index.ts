import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import authRoutes from './routes/auth';
import patientsRoutes from './routes/patients';
import surgeriesRoutes from './routes/surgeries';
import checklistRoutes from './routes/checklist';
import evidenceRoutes from './routes/evidence';
import riskRoutes from './routes/risk';
import exceptionsRoutes from './routes/exceptions';
import overridesRoutes from './routes/overrides';
import auditRoutes from './routes/audit';
import analyticsRoutes from './routes/analytics';
import fairnessRoutes from './routes/fairness';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import notificationsRoutes from './routes/notifications';
import modelsRoutes from './routes/models';
import experimentRoutes from './routes/experiment';
import safetylabRoutes from './routes/safetylab';
import validationRoutes from './routes/validation';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/surgeries', surgeriesRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/exceptions', exceptionsRoutes);
app.use('/api/overrides', overridesRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fairness', fairnessRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/experiment', experimentRoutes);
app.use('/api/safety-lab', safetylabRoutes);
app.use('/api/validation', validationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Evidence-Backed Pre-Operative Checklist & Surgical Safety Management System',
    environment: 'Production-Style Clinical Decision Support System',
    timestamp: new Date().toISOString()
  });
});

// Mock file view endpoint for synthetic evidence preview
app.get('/mock-files/:filename', (req, res) => {
  const { filename } = req.params;
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Evidence Document Preview - ${filename}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; display: flex; justify-content: center; }
          .card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; max-width: 600px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #2563eb; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          h2 { margin: 0 0 8px 0; color: #fff; font-size: 20px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .meta { margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; font-size: 13px; color: #cbd5e1; }
          .disclaimer { margin-top: 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; font-size: 12px; color: #fbbf24; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">SYNTHETIC CLINICAL EVIDENCE RECORD</span>
          <h2>Document: ${filename}</h2>
          <p>This synthetic document record was verified under the surgical safety checklist protocol. It represents an authenticated attachment (EMR Extract / PACS Image Verification / Laboratory Certificate / Signed Informed Consent).</p>
          <div class="meta">
            <div><strong>Verified Status:</strong> <span style="color:#10b981">✓ Cryptographically Hashed (SHA-256) & Audit Logged</span></div>
            <div><strong>Access Classification:</strong> Restricted Clinical Care Team</div>
            <div><strong>Source System:</strong> Enterprise Integrated Hospital Information System (HIS)</div>
          </div>
          <div class="disclaimer">
            <strong>Decision Support Notice:</strong> Synthetic clinical demo record. All final patient transfers require human-in-the-loop attestation.
          </div>
        </div>
      </body>
    </html>
  `);
});

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`[Surgical Safety API] running on http://localhost:${port}`);
  console.log(`[Mode] Production-grade clinical safety engine with dual-mode store`);
});
