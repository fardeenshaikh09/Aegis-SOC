import React, { useState, useEffect } from 'react';
import {
  ThreatEvent,
  VulnerabilityFinding,
  ScanTarget,
  Playbook,
  Incident,
  SecurityMetrics,
} from './types/cyber';
import {
  INITIAL_THREATS,
  INITIAL_VULNERABILITIES,
  INITIAL_TARGETS,
  INITIAL_PLAYBOOKS,
  INITIAL_INCIDENTS,
} from './utils/mockData';
import { calculateSecurityHealthScore } from './utils/securityRules';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { MetricCards } from './components/MetricCards';
import { ThreatMonitoringView } from './components/ThreatMonitoring/ThreatMonitoringView';
import { VulnerabilityScannerView } from './components/VulnerabilityScanner/VulnerabilityScannerView';
import { MitreMatrixView } from './components/MitreMatrix/MitreMatrixView';
import { IncidentResponseView } from './components/IncidentResponse/IncidentResponseView';
import { SandboxView } from './components/Sandbox/SandboxView';
import { SimulateAttackModal } from './components/ThreatMonitoring/SimulateAttackModal';
import { AICopilotDrawer } from './components/Copilot/AICopilotDrawer';
import { ComplianceReportModal } from './components/Reports/ComplianceReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('threats');
  const [threats, setThreats] = useState<ThreatEvent[]>(INITIAL_THREATS);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityFinding[]>(INITIAL_VULNERABILITIES);
  const [targets, setTargets] = useState<ScanTarget[]>(INITIAL_TARGETS);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [blockedTodayCount, setBlockedTodayCount] = useState<number>(14892);

  // Modals & Drawers
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Derived metrics
  const activeThreats = threats.filter((t) => t.status === 'active');
  const criticalThreats = activeThreats.filter((t) => t.severity === 'critical');
  const openVulns = vulnerabilities.filter((v) => v.status === 'open');
  const criticalVulns = openVulns.filter((v) => v.severity === 'critical');
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating');

  const securityScore = calculateSecurityHealthScore(threats, vulnerabilities);

  const metrics: SecurityMetrics = {
    securityScore,
    activeThreatsCount: activeThreats.length,
    blockedTodayCount,
    meanTimeToDetectMinutes: 1.8,
    meanTimeToRemediateMinutes: 4.2,
    assetsProtected: 18,
    complianceScore: 91,
    eventsPerSecond: isStreaming ? 240 : 0,
  };

  // Simulated continuous network telemetry stream
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const sampleSources = [
        { ip: '185.220.101.42', country: 'Germany', flag: '🇩🇪', city: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
        { ip: '194.26.29.99', country: 'Russia', flag: '🇷🇺', city: 'Saint Petersburg', lat: 59.9343, lng: 30.3351 },
        { ip: '94.102.61.50', country: 'Netherlands', flag: '🇳🇱', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
        { ip: '103.251.167.8', country: 'Singapore', flag: '🇸🇬', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
        { ip: '45.154.255.12', country: 'Bulgaria', flag: '🇧🇬', city: 'Sofia', lat: 42.6977, lng: 23.3219 },
      ];

      const sampleVectors = [
        {
          title: 'Suspicious TLS 1.0 Downgrade Attempt',
          category: 'injection' as const,
          severity: 'medium' as const,
          mitre: { id: 'T1562.001', name: 'Disable Security Tools', tactic: 'Defense Evasion' },
          target: { id: 'ast-gw', name: 'api-gateway-edge', ip: '10.0.1.1', service: 'Kong Ingress', port: 443 },
          protocol: 'HTTPS' as const,
          payload: 'ClientHello cipher_suites=[TLS_RSA_WITH_RC4_128_SHA] (Deprecated SSL/TLS)',
          risk: 68,
        },
        {
          title: 'High-Volume DNS Query Tunneling Probe',
          category: 'exfiltration' as const,
          severity: 'high' as const,
          mitre: { id: 'T1048.003', name: 'Exfiltration Over DNS', tactic: 'Exfiltration' },
          target: { id: 'ast-lb', name: 'dns-resolver-edge', ip: '10.0.0.53', service: 'CoreDNS', port: 53 },
          protocol: 'DNS' as const,
          payload: 'TXT 4a656769732d736563726574.exfil-tunnel.attacker-domain.org (820 qps)',
          risk: 86,
        },
        {
          title: 'Port Scan / TCP SYN Fingerprint Burst',
          category: 'bruteforce' as const,
          severity: 'low' as const,
          mitre: { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery' },
          target: { id: 'ast-k8s', name: 'k8s-bastion-prod-01', ip: '10.0.4.12', service: 'Host OS', port: 8080 },
          protocol: 'TCP' as const,
          payload: 'TCP SYN sweep across ports 1-1024; response: RST',
          risk: 42,
        },
      ];

      const randomSrc = sampleSources[Math.floor(Math.random() * sampleSources.length)];
      const randomVec = sampleVectors[Math.floor(Math.random() * sampleVectors.length)];

      const newEvent: ThreatEvent = {
        id: `THR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        title: randomVec.title,
        description: `Automated detection generated by AegisSOC sensor from ${randomSrc.city}, ${randomSrc.country}.`,
        severity: randomVec.severity,
        category: randomVec.category,
        mitreTechnique: randomVec.mitre,
        sourceIp: randomSrc.ip,
        sourceGeo: randomSrc,
        targetAsset: randomVec.target,
        protocol: randomVec.protocol,
        payloadSnippet: randomVec.payload,
        status: 'active',
        riskScore: randomVec.risk,
        blocked: false,
        containmentActions: ['Block Source IP on Cloud Armor', 'Rate Limit IP Range /24'],
      };

      setThreats((prev) => [newEvent, ...prev.slice(0, 24)]);
      setBlockedTodayCount((prev) => prev + 1);
    }, 9000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Contain Threat Action
  const handleContainThreat = (threatId: string, actionName: string) => {
    setThreats((prev) =>
      prev.map((t) =>
        t.id === threatId
          ? {
              ...t,
              status: 'mitigated',
              blocked: true,
              description: `${t.description} [CONTAINED via ${actionName} at ${new Date().toLocaleTimeString()}]`,
            }
          : t
      )
    );

    setBlockedTodayCount((prev) => prev + 1);

    // Also update related incident if exists
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.threatId === threatId
          ? {
              ...inc,
              status: 'contained',
              timeline: [
                {
                  timestamp: 'Just now',
                  message: `Automated containment executed: ${actionName}`,
                  actor: 'AegisSOC Automated Defense',
                },
                ...inc.timeline,
              ],
            }
          : inc
      )
    );
  };

  const handleUpdateThreatStatus = (threatId: string, status: ThreatEvent['status']) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === threatId ? { ...t, status } : t))
    );
  };

  const handleAddFinding = (finding: VulnerabilityFinding) => {
    setVulnerabilities((prev) => [finding, ...prev]);
  };

  const handleUpdateFindingStatus = (id: string, status: VulnerabilityFinding['status']) => {
    setVulnerabilities((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const handleInjectThreat = (newThreat: ThreatEvent) => {
    setThreats((prev) => [newThreat, ...prev]);
    // Create new incident
    const newInc: Incident = {
      id: `INC-${Math.floor(2100 + Math.random() * 800)}`,
      threatId: newThreat.id,
      title: newThreat.title,
      severity: newThreat.severity,
      status: 'open',
      assignedAnalyst: 'Alex Morgan (On-Call)',
      createdAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: 'Just now',
          message: `Simulated attack scenario injected: ${newThreat.title}`,
          actor: 'Security Engineer Simulation Harness',
        },
      ],
      notes: [`Injected payload: ${newThreat.payloadSnippet}`],
    };
    setIncidents((prev) => [newInc, ...prev]);
  };

  const handleUpdateIncidentStatus = (incidentId: string, status: Incident['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status } : inc))
    );
  };

  const handleAddIncidentNote = (incidentId: string, note: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId ? { ...inc, notes: [...inc.notes, note] } : inc
      )
    );
  };

  const handleRunPlaybook = (playbookId: string) => {
    setPlaybooks((prev) =>
      prev.map((pb) =>
        pb.id === playbookId
          ? { ...pb, executionCount: pb.executionCount + 1, lastRun: 'Just now' }
          : pb
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Primary Header */}
      <Header
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenSimulateModal={() => setIsSimulateOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenReportModal={() => setIsReportOpen(true)}
        activeThreatsCount={activeThreats.length}
        securityScore={securityScore}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        activeThreatCount={activeThreats.length}
        openVulnCount={openVulns.length}
        openIncidentCount={openIncidents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Cards Top KPI row */}
        <MetricCards
          metrics={metrics}
          criticalThreatCount={criticalThreats.length}
          criticalVulnCount={criticalVulns.length}
          onFilterActiveThreats={() => setActiveTab('threats')}
          onFilterCriticalVulns={() => setActiveTab('scanner')}
        />

        {/* Tab Views */}
        {activeTab === 'threats' && (
          <ThreatMonitoringView
            threats={threats}
            onContainThreat={handleContainThreat}
            onUpdateStatus={handleUpdateThreatStatus}
          />
        )}

        {activeTab === 'scanner' && (
          <VulnerabilityScannerView
            vulnerabilities={vulnerabilities}
            targets={targets}
            onAddFinding={handleAddFinding}
            onUpdateFindingStatus={handleUpdateFindingStatus}
          />
        )}

        {activeTab === 'mitre' && <MitreMatrixView threats={threats} />}

        {activeTab === 'incidents' && (
          <IncidentResponseView
            incidents={incidents}
            playbooks={playbooks}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onAddIncidentNote={handleAddIncidentNote}
            onRunPlaybook={handleRunPlaybook}
          />
        )}

        {activeTab === 'sandbox' && <SandboxView threats={threats} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AegisSOC Platform</span>
            <span>·</span>
            <span>Zero-Trust Architecture</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">Sensors Operational</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            MITRE ATT&amp;CK v14 · NIST CSF 2.0 · ISO 27001
          </div>
        </div>
      </footer>

      {/* Attack Injection Modal */}
      <SimulateAttackModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onInjectThreat={handleInjectThreat}
      />

      {/* AI Cyber Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        threats={threats}
        vulnerabilities={vulnerabilities}
      />

      {/* Compliance Audit Report Modal */}
      <ComplianceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        metrics={metrics}
        threats={threats}
        vulnerabilities={vulnerabilities}
      />
    </div>
  );
}
