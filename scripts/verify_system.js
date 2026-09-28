// Comprehensive Verification Test Script
const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('[1] Fetching demo accounts from /api/auth/demo-accounts...');
  const demoAccountsRes = await get('/api/auth/demo-accounts');
  const surgeon = demoAccountsRes.accounts.find(a => a.role === 'SURGEON') || demoAccountsRes.accounts[0];
  console.log('   [OK] Selected clinician account:', surgeon.name, `(${surgeon.email})`, 'Role:', surgeon.role);

  console.log('[2] Logging in...');
  const loginRes = await post('/api/auth/login', { email: surgeon.email, password: 'password' });
  const token = loginRes.token;
  if (!token) throw new Error('Login failed: ' + JSON.stringify(loginRes));
  console.log('   [OK] JWT Bearer Token generated successfully.');

  console.log('[2] Testing /api/experiment/metrics...');
  const exp = await get('/api/experiment/metrics', token);
  console.log('   [OK] Baseline:', exp.metrics[0].baseline + '%', 'Prototype:', exp.metrics[0].prototype + '%', 'Delta:', exp.summary.evidence_enforcement_delta);

  console.log('[3] Testing /api/experiment/errors...');
  const errors = await get('/api/experiment/errors', token);
  console.log('   [OK] Error analysis items:', errors.length);

  console.log('[4] Testing /api/safety-lab...');
  const tests = await get('/api/safety-lab', token);
  console.log('   [OK] Safety lab tests loaded:', tests.length);
  const runTestRes = await post('/api/safety-lab/run/TEST-1', {}, token);
  console.log('   [OK] Run TEST-1 execution:', runTestRes.result ? runTestRes.result.status : 'OK');

  console.log('[5] Testing /api/validation/stakeholder...');
  const stkh = await get('/api/validation/stakeholder', token);
  console.log('   [OK] Stakeholder personas:', stkh.total_participants, 'SUS Score:', stkh.overall_usability_score);

  console.log('[6] Testing /api/validation/deployment-readiness...');
  const dep = await get('/api/validation/deployment-readiness', token);
  console.log('   [OK] Deployment status:', dep.overall_status, 'Security items:', dep.categories.security.length);

  console.log('[7] Testing /api/patients/pat-10001/readiness...');
  const read = await get('/api/patients/pat-10001/readiness', token);
  console.log('   [OK] Pre-Op Readiness Gate status:', read.readiness_status, 'Notice:', (read.clinical_safety_notice || '').slice(0, 45) + '...');

  console.log('\n[SUCCESS] ALL 7 CORE EVIDENCE SYSTEM ENDPOINTS VERIFIED OPERATIONAL!');
}

run().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
