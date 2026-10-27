# AegisSOC — Enterprise Cyber Defense & SIEM Platform

![AegisSOC Banner](https://raw.githubusercontent.com/placeholder/aegissoc-preview.png)

AegisSOC is a modern Security Operations Center (SOC), Cloud Security Posture Management (CSPM), and Security Information & Event Management (SIEM) platform. It provides real-time intrusion monitoring, automated vulnerability scanning, MITRE ATT&CK tactical mapping, and automated incident containment playbooks.

---

## Key Features

- **Real-Time Threat Monitoring**: Live incoming attack event feed with automated scoring, protocol inspection, and geo-origin metadata.
- **Global Attack Vector Radar**: Interactive SVG map projecting attack trajectories from international origins directly onto protected VPC microservices.
- **Automated Vulnerability Scanner**: Automated endpoint auditing for HTTP security headers (HSTS, CSP, X-Frame-Options), TLS configurations, exposed ports, and known CVEs (Log4Shell, Spring4Shell).
- **Static Code & Secret Auditor**: Heuristic scanner to detect hardcoded AWS IAM keys, private RSA keys, GitHub PATs, and plaintext database URIs.
- **MITRE ATT&CK Matrix Navigator**: Enterprise heatmap tracking coverage and active adversary probes across 9 core tactics.
- **Incident Response & SOAR Playbooks**: Automated multi-step containment runbooks (IP blacklisting, pod network quarantine, IAM revocation) with execution audit logs.
- **Packet & Rule Sandbox**: Custom Sigma and WAF rule tester with real-time match evaluation and Shannon entropy calculation.
- **AI Cyber Analyst Copilot**: Autonomous assistant for incident triage, root-cause analysis, and copyable bash/kubectl/iptables remediation generation.
- **Compliance & Audit Reporting**: Automated compliance assessments mapped to SOC 2 Type II, CIS AWS Foundations, ISO 27001, and NIST CSF.

---

## Running on macOS

### Prerequisites

Ensure you have **Node.js 20+** installed on your Mac.

To verify:
```bash
node -v
npm -v
```

If you don't have Node.js installed, the easiest way on macOS is via Homebrew:
```bash
brew install node
```

---

### Local Installation Steps

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aegis-soc.git
   cd aegis-soc
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Open [http://localhost:3000](http://localhost:3000) in Safari or Chrome.

---

### Running Unit Tests

The test suite runs using Node's built-in test runner (`node:test`):

```bash
npx --yes tsx --test src/utils/securityRules.test.ts
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ThreatMonitoring/      # Global attack radar, live telemetry stream, attack simulator
│   │   ├── VulnerabilityScanner/  # Target endpoint scanner, static code & secret auditor
│   │   ├── MitreMatrix/           # MITRE ATT&CK enterprise heatmap and technique cards
│   │   ├── IncidentResponse/      # Incident queues, timeline, SOAR playbooks
│   │   ├── Sandbox/               # Packet decoder, Shannon entropy, Sigma rule tester
│   │   ├── Copilot/               # AI Security Analyst assistant drawer
│   │   ├── Reports/               # Executive compliance audit modal (PDF / Markdown)
│   │   ├── Header.tsx             # DEFCON status badge, live feed toggle, quick triggers
│   │   ├── Navigation.tsx         # Accessible view tabs
│   │   └── MetricCards.tsx        # High-level SOC KPI metrics
│   ├── types/
│   │   └── cyber.ts               # Core threat, vuln, incident, and playbook domain models
│   ├── utils/
│   │   ├── securityRules.ts       # CVSS 3.1 calculator, header auditor, secret detection
│   │   ├── securityRules.test.ts  # Node:test unit test suite
│   │   └── mockData.ts            # Pre-seeded telemetry, CVEs, playbooks, scenarios
│   ├── App.tsx                    # Main SOC dashboard orchestrator
│   ├── main.tsx                   # React 19 entry point
│   └── index.css                  # Tailored SOC dark theme and styling
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

Apache-2.0
