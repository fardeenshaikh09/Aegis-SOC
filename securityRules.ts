import { ThreatEvent, VulnerabilityFinding, ThreatSeverity, VulnCategory } from '../types/cyber';

/**
 * Calculates a CVSS 3.1 Base Score based on metrics
 */
export function calculateCvssScore(params: {
  av: 'N' | 'A' | 'L' | 'P'; // Attack Vector: Network, Adjacent, Local, Physical
  ac: 'L' | 'H';             // Attack Complexity: Low, High
  pr: 'N' | 'L' | 'H';       // Privileges Required: None, Low, High
  ui: 'N' | 'R';             // User Interaction: None, Required
  s: 'U' | 'C';              // Scope: Unchanged, Changed
  c: 'H' | 'L' | 'N';        // Confidentiality: High, Low, None
  i: 'H' | 'L' | 'N';        // Integrity: High, Low, None
  a: 'H' | 'L' | 'N';        // Availability: High, Low, None
}): number {
  const avWeight = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 }[params.av];
  const acWeight = { L: 0.77, H: 0.44 }[params.ac];
  const prWeight = params.s === 'U' 
    ? { N: 0.85, L: 0.62, H: 0.27 }[params.pr]
    : { N: 0.85, L: 0.68, H: 0.50 }[params.pr];
  const uiWeight = { N: 0.85, R: 0.62 }[params.ui];

  const exploitability = 8.22 * avWeight * acWeight * prWeight * uiWeight;

  const cWeight = { H: 0.56, L: 0.22, N: 0 }[params.c];
  const iWeight = { H: 0.56, L: 0.22, N: 0 }[params.i];
  const aWeight = { H: 0.56, L: 0.22, N: 0 }[params.a];

  const iss = 1 - (1 - cWeight) * (1 - iWeight) * (1 - aWeight);
  let impact = 0;
  if (params.s === 'U') {
    impact = 6.42 * iss;
  } else {
    impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  }

  if (impact <= 0) return 0;
  const rawScore = params.s === 'U'
    ? Math.min(impact + exploitability, 10)
    : Math.min(1.08 * (impact + exploitability), 10);

  // Round up to 1 decimal place (standard CVSS round-up)
  return Math.ceil(rawScore * 10) / 10;
}

/**
 * Maps CVSS score to threat severity
 */
export function cvssToSeverity(score: number): ThreatSeverity {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  if (score > 0) return 'low';
  return 'info';
}

/**
 * Evaluates HTTP security response headers and identifies missing protections
 */
export function auditHttpHeaders(
  headers: Record<string, string>,
  targetUrl: string
): VulnerabilityFinding[] {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }

  const findings: VulnerabilityFinding[] = [];
  const now = new Date().toISOString();

  // 1. Strict-Transport-Security (HSTS)
  if (!normalized['strict-transport-security']) {
    findings.push({
      id: `vuln-hsts-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cveId: 'CWE-319',
      title: 'Missing HTTP Strict Transport Security (HSTS)',
      severity: 'high',
      cvss: 7.4,
      asset: targetUrl,
      category: 'web_security',
      description: 'The endpoint does not enforce HTTPS connections via HSTS header, allowing man-in-the-middle SSL-stripping attacks.',
      impact: 'Adversaries on the same network can downgrade traffic to plaintext HTTP and eavesdrop or alter session cookies.',
      remediationSteps: [
        'Configure the web server or reverse proxy to include the Strict-Transport-Security header.',
        'Enforce a minimum max-age of 31536000 (1 year) with includeSubDomains.',
      ],
      remediationCode: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
      complianceAffected: ['SOC2 CC6.6', 'PCI-DSS 4.1', 'NIST CSF PR.DS-2'],
      status: 'open',
      detectedAt: now,
    });
  }

  // 2. Content-Security-Policy (CSP)
  if (!normalized['content-security-policy']) {
    findings.push({
      id: `vuln-csp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cveId: 'CWE-79',
      title: 'Missing Content Security Policy (CSP)',
      severity: 'high',
      cvss: 7.5,
      asset: targetUrl,
      category: 'web_security',
      description: 'No Content-Security-Policy header detected. The browser allows execution of arbitrary inline scripts and remote untrusted assets.',
      impact: 'High exposure to Cross-Site Scripting (XSS) and data exfiltration through injected malicious script tags.',
      remediationSteps: [
        'Define a restrictive Content-Security-Policy header disallowing unsafe-inline and unsafe-eval.',
        'Restrict connect-src and default-src to trusted origins.',
      ],
      remediationCode: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';",
      complianceAffected: ['OWASP Top 10 A03:2021', 'SOC2 CC6.1'],
      status: 'open',
      detectedAt: now,
    });
  }

  // 3. X-Frame-Options / Clickjacking
  if (!normalized['x-frame-options'] && !normalized['content-security-policy']?.includes('frame-ancestors')) {
    findings.push({
      id: `vuln-xfo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cveId: 'CWE-1021',
      title: 'Missing Anti-Clickjacking Protection (X-Frame-Options)',
      severity: 'medium',
      cvss: 5.4,
      asset: targetUrl,
      category: 'web_security',
      description: 'The endpoint can be embedded in an <iframe> on third-party sites, making users susceptible to UI redressing (clickjacking).',
      impact: 'Attackers can trick authenticated users into triggering unwanted state-changing transactions.',
      remediationSteps: [
        'Set X-Frame-Options to DENY or SAMEORIGIN on all HTML responses.',
        'Alternatively enforce frame-ancestors in Content-Security-Policy.',
      ],
      remediationCode: 'X-Frame-Options: DENY',
      complianceAffected: ['CIS Web Benchmark 2.1'],
      status: 'open',
      detectedAt: now,
    });
  }

  // 4. X-Content-Type-Options
  if (normalized['x-content-type-options'] !== 'nosniff') {
    findings.push({
      id: `vuln-xcto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cveId: 'CWE-430',
      title: 'MIME-Type Sniffing Protection Disabled',
      severity: 'low',
      cvss: 3.7,
      asset: targetUrl,
      category: 'web_security',
      description: 'The response does not specify X-Content-Type-Options: nosniff, allowing legacy browsers to execute text uploads as HTML/JavaScript.',
      impact: 'Potential drive-by download or cross-site scripting via malformed file uploads.',
      remediationSteps: [
        'Add X-Content-Type-Options: nosniff header to all responses.',
      ],
      remediationCode: 'X-Content-Type-Options: nosniff',
      complianceAffected: ['CIS Web Benchmark 2.3'],
      status: 'open',
      detectedAt: now,
    });
  }

  // 5. Server banner leakage
  if (normalized['server'] && (normalized['server'].includes('/') || /\d/.test(normalized['server']))) {
    findings.push({
      id: `vuln-banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cveId: 'CWE-200',
      title: 'Verbose Web Server Version Disclosure',
      severity: 'low',
      cvss: 3.1,
      asset: targetUrl,
      category: 'web_security',
      description: `Server header exposes exact software version: "${normalized['server']}", expediting attacker vulnerability profiling.`,
      impact: 'Reveals precise patch version for targeted known exploit selection.',
      remediationSteps: [
        'Configure server tokens to off (e.g. server_tokens off in Nginx, ServerTokens Prod in Apache).',
      ],
      remediationCode: '# Nginx configuration\nserver_tokens off;',
      complianceAffected: ['CIS Web Benchmark 1.1'],
      status: 'open',
      detectedAt: now,
    });
  }

  return findings;
}

/**
 * Scans text content for hardcoded secrets, private keys, and API tokens
 */
export function detectLeakedSecrets(content: string, assetName = 'Configuration'): VulnerabilityFinding[] {
  const findings: VulnerabilityFinding[] = [];
  const now = new Date().toISOString();

  const rules: Array<{
    name: string;
    regex: RegExp;
    cve: string;
    severity: ThreatSeverity;
    cvss: number;
    description: string;
  }> = [
    {
      name: 'AWS Access Key ID Detected',
      regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
      cve: 'CWE-798',
      severity: 'critical',
      cvss: 9.8,
      description: 'Hardcoded AWS IAM access key found in configuration or code snippet.',
    },
    {
      name: 'Exposed RSA / EC Private Key',
      regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
      cve: 'CWE-321',
      severity: 'critical',
      cvss: 9.6,
      description: 'Unencrypted cryptographic private key discovered in plaintext artifact.',
    },
    {
      name: 'GitHub Personal Access Token',
      regex: /gh[pousr]_[0-9a-zA-Z]{36}/g,
      cve: 'CWE-798',
      severity: 'high',
      cvss: 8.8,
      description: 'Exposed GitHub developer token with potential repository read/write access.',
    },
    {
      name: 'Slack Webhook / Bot Token',
      regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}/g,
      cve: 'CWE-798',
      severity: 'high',
      cvss: 7.7,
      description: 'Hardcoded Slack bot authentication token.',
    },
    {
      name: 'Unprotected Database Password in Connection String',
      regex: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[a-zA-Z0-9_\-]+:([a-zA-Z0-9_!@#$%^&*()+\-=]+)@[a-zA-Z0-9_\-\.]+/g,
      cve: 'CWE-259',
      severity: 'critical',
      cvss: 9.4,
      description: 'Plaintext database credentials embedded in connection URI.',
    },
  ];

  for (const rule of rules) {
    if (rule.regex.test(content)) {
      findings.push({
        id: `secret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cveId: rule.cve,
        title: rule.name,
        severity: rule.severity,
        cvss: rule.cvss,
        asset: assetName,
        category: 'secrets_leak',
        description: rule.description,
        impact: 'Full compromise of downstream services, infrastructure hijacking, or unauthorized data exfiltration.',
        remediationSteps: [
          'Immediately revoke and rotate the compromised credential in the identity provider.',
          'Migrate secrets to an encrypted secret store (HashiCorp Vault, AWS Secrets Manager, or GCP Secret Manager).',
          'Add secret scanning hooks to pre-commit and CI/CD pipelines.',
        ],
        remediationCode: '# Revoke credential immediately\naws iam update-access-key --access-key-id <KEY_ID> --status Inactive',
        complianceAffected: ['SOC2 CC6.1', 'ISO 27001 A.9.4.3', 'PCI-DSS 8.2'],
        status: 'open',
        detectedAt: now,
      });
    }
  }

  return findings;
}

/**
 * Calculates overall security posture score (0 - 100)
 */
export function calculateSecurityHealthScore(
  threats: ThreatEvent[],
  vulnerabilities: VulnerabilityFinding[]
): number {
  let score = 100;

  // Active unmitigated threats penalties
  for (const t of threats) {
    if (t.status === 'active') {
      if (t.severity === 'critical') score -= 15;
      else if (t.severity === 'high') score -= 8;
      else if (t.severity === 'medium') score -= 3;
    } else if (t.status === 'investigating') {
      if (t.severity === 'critical') score -= 7;
      else if (t.severity === 'high') score -= 4;
    }
  }

  // Open vulnerabilities penalties
  for (const v of vulnerabilities) {
    if (v.status === 'open') {
      if (v.severity === 'critical') score -= 12;
      else if (v.severity === 'high') score -= 6;
      else if (v.severity === 'medium') score -= 2;
    } else if (v.status === 'fixing') {
      if (v.severity === 'critical') score -= 5;
    }
  }

  return Math.max(12, Math.min(100, Math.round(score)));
}

/**
 * Matches a simplified Sigma/Snort defensive rule against payload & protocol
 */
export function matchDefensiveRule(
  ruleText: string,
  payload: string,
  protocol: string
): { matched: boolean; ruleName: string; patternFound?: string } {
  const lines = ruleText.split('\n');
  let ruleName = 'Custom Inspection Rule';
  let matchKeywords: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('title:')) {
      ruleName = trimmed.replace('title:', '').trim();
    }
    if (trimmed.startsWith('contains:')) {
      const keywords = trimmed.replace('contains:', '').split(',').map((k) => k.trim().replace(/^['"]|['"]$/g, ''));
      matchKeywords.push(...keywords);
    }
  }

  if (matchKeywords.length === 0) {
    // Default fallback: look for standard malicious tokens
    matchKeywords = ['select', 'union', '<script', 'jndi:', '/etc/passwd', 'cmd.exe', 'bash -i'];
  }

  const payloadLower = payload.toLowerCase();
  for (const kw of matchKeywords) {
    if (payloadLower.includes(kw.toLowerCase())) {
      return { matched: true, ruleName, patternFound: kw };
    }
  }

  return { matched: false, ruleName };
}
