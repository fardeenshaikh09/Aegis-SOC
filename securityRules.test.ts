import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCvssScore,
  cvssToSeverity,
  auditHttpHeaders,
  detectLeakedSecrets,
  calculateSecurityHealthScore,
  matchDefensiveRule,
} from './securityRules';

test('calculateCvssScore computes standard scores accurately', () => {
  // Test critical vulnerability (Log4Shell-like: Network, Low Complexity, None Privileges, None User Interaction, Changed Scope, High CIA)
  const log4jScore = calculateCvssScore({
    av: 'N',
    ac: 'L',
    pr: 'N',
    ui: 'N',
    s: 'C',
    c: 'H',
    i: 'H',
    a: 'H',
  });
  assert.equal(log4jScore, 10.0);
  assert.equal(cvssToSeverity(log4jScore), 'critical');

  // Test local low-privilege moderate issue
  const medScore = calculateCvssScore({
    av: 'L',
    ac: 'H',
    pr: 'L',
    ui: 'R',
    s: 'U',
    c: 'L',
    i: 'N',
    a: 'N',
  });
  assert.ok(medScore < 5.0 && medScore > 1.0);
});

test('auditHttpHeaders flags missing security headers', () => {
  const missingHeaders = {
    'content-type': 'text/html',
    'server': 'nginx/1.18.0',
  };

  const findings = auditHttpHeaders(missingHeaders, 'https://api.internal.corp');
  assert.ok(findings.length >= 3);
  
  const cveIds = findings.map(f => f.cveId);
  assert.ok(cveIds.includes('CWE-319')); // HSTS
  assert.ok(cveIds.includes('CWE-79'));  // CSP
  assert.ok(cveIds.includes('CWE-1021')); // X-Frame-Options
  assert.ok(cveIds.includes('CWE-200')); // Server banner
});

test('detectLeakedSecrets finds AWS keys and private certificates', () => {
  const codeWithKey = `
    const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
    const DB_URI = "postgres://admin:s3cr3tPass123@prod-db.internal:5432/main";
  `;

  const findings = detectLeakedSecrets(codeWithKey, 'src/config.ts');
  assert.equal(findings.length, 2);
  assert.equal(findings[0].severity, 'critical');
  assert.equal(findings[0].cveId, 'CWE-798');
});

test('calculateSecurityHealthScore decreases on active threats and open vulns', () => {
  const baselineScore = calculateSecurityHealthScore([], []);
  assert.equal(baselineScore, 100);

  const degradedScore = calculateSecurityHealthScore([
    {
      id: 't-1',
      timestamp: new Date().toISOString(),
      title: 'Active Ransomware Trigger',
      description: 'Host encrypting files',
      severity: 'critical',
      category: 'ransomware',
      mitreTechnique: { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
      sourceIp: '198.51.100.24',
      sourceGeo: { country: 'Unknown', flag: '🏴', city: 'Tor Exit', lat: 0, lng: 0 },
      targetAsset: { id: 'a-1', name: 'FileServer-01', ip: '10.0.1.5', service: 'SMB', port: 445 },
      protocol: 'TCP',
      payloadSnippet: '0x4D5A9000...',
      status: 'active',
      riskScore: 98,
      blocked: false,
      containmentActions: [],
    }
  ], []);

  assert.ok(degradedScore < 90);
});

test('matchDefensiveRule detects malicious signatures', () => {
  const rule = `
    title: Detect SQL Injection in Query Strings
    contains: union, select, ' or 1=1
  `;
  const result = matchDefensiveRule(rule, 'GET /users?id=1 union select password from admin', 'HTTP');
  assert.equal(result.matched, true);
  assert.equal(result.patternFound, 'union');
});
