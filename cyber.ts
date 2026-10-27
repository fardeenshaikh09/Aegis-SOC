export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ThreatCategory =
  | 'ddos'
  | 'bruteforce'
  | 'injection'
  | 'ransomware'
  | 'iam'
  | 'exfiltration'
  | 'malware'
  | 'api_abuse';

export type ThreatStatus = 'active' | 'investigating' | 'mitigated' | 'false_positive';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  category: ThreatCategory;
  mitreTechnique: {
    id: string;
    name: string;
    tactic: string;
  };
  sourceIp: string;
  sourceGeo: {
    country: string;
    flag: string;
    city: string;
    lat: number;
    lng: number;
  };
  targetAsset: {
    id: string;
    name: string;
    ip: string;
    service: string;
    port: number;
  };
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'SSH' | 'DNS' | 'ICMP';
  payloadSnippet: string;
  rawPacketHex?: string;
  status: ThreatStatus;
  riskScore: number; // 0-100
  blocked: boolean;
  containmentActions: string[];
}

export type VulnCategory =
  | 'web_security'
  | 'cloud_posture'
  | 'dependency_cve'
  | 'secrets_leak'
  | 'network_port';

export interface VulnerabilityFinding {
  id: string;
  cveId: string;
  title: string;
  severity: ThreatSeverity;
  cvss: number;
  asset: string;
  category: VulnCategory;
  description: string;
  impact: string;
  remediationSteps: string[];
  remediationCode?: string;
  complianceAffected: string[]; // e.g. ['SOC2 CC6.1', 'CIS AWS 1.4', 'ISO 27001 A.12.6.1']
  status: 'open' | 'fixing' | 'resolved' | 'ignored';
  detectedAt: string;
}

export interface ScanTarget {
  id: string;
  name: string;
  type: 'web_endpoint' | 'k8s_cluster' | 'cloud_vpc' | 'code_repo' | 'database';
  urlOrAddress: string;
  lastScanned: string;
  status: 'healthy' | 'warning' | 'critical';
  openPorts?: number[];
  sampleHeaders?: Record<string, string>;
  sampleSnippet?: string;
}

export interface Incident {
  id: string;
  threatId: string;
  title: string;
  severity: ThreatSeverity;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  assignedAnalyst: string;
  createdAt: string;
  timeline: Array<{
    timestamp: string;
    message: string;
    actor: string;
  }>;
  notes: string[];
  playbookRunId?: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  actions: string[];
  lastRun?: string;
  successRate: number;
  isEnabled: boolean;
  executionCount: number;
}

export interface SecurityMetrics {
  securityScore: number; // 0-100
  activeThreatsCount: number;
  blockedTodayCount: number;
  meanTimeToDetectMinutes: number;
  meanTimeToRemediateMinutes: number;
  assetsProtected: number;
  complianceScore: number; // 0-100
  eventsPerSecond: number;
}
