import React, { useState } from 'react';
import { ThreatEvent, VulnerabilityFinding, SecurityMetrics } from '../../types/cyber';
import { X, FileText, Download, Printer, CheckCircle2, AlertOctagon, ShieldCheck } from 'lucide-react';

interface ComplianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SecurityMetrics;
  threats: ThreatEvent[];
  vulnerabilities: VulnerabilityFinding[];
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  threats,
  vulnerabilities,
}) => {
  if (!isOpen) return null;

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const activeThreats = threats.filter((t) => t.status === 'active');
  const openVulns = vulnerabilities.filter((v) => v.status === 'open');

  const complianceStandards = [
    { name: 'SOC 2 Type II (Trust Services Criteria)', score: 94, status: 'Compliant' },
    { name: 'CIS AWS Foundations Benchmark v1.4', score: 89, status: 'Action Required' },
    { name: 'ISO/IEC 27001:2022 ISMS Controls', score: 91, status: 'Compliant' },
    { name: 'NIST Cybersecurity Framework (CSF 2.0)', score: 92, status: 'Compliant' },
    { name: 'PCI-DSS v4.0 Requirement 6 & 10', score: 87, status: 'Action Required' },
  ];

  const handleExportMarkdown = () => {
    const reportMd = `# AegisSOC Executive Security & Posture Audit Report
Generated: ${new Date().toUTCString()}
Report ID: AUD-${Date.now().toString().slice(-6)}

## Executive Summary
- **Overall Posture Health Score**: ${metrics.securityScore}/100
- **Active Threats in Queue**: ${activeThreats.length}
- **Open Vulnerability Findings**: ${openVulns.length}
- **Protected Infrastructure Nodes**: ${metrics.assetsProtected}
- **Mean Time to Remediate (MTTR)**: ${metrics.meanTimeToRemediateMinutes} minutes

## Compliance Framework Adherence
${complianceStandards.map((s) => `- ${s.name}: ${s.score}% (${s.status})`).join('\n')}

## Critical Findings Requiring Immediate Attention
${openVulns.map((v) => `### [${v.cveId}] ${v.title}
- Severity: ${v.severity.toUpperCase()} (CVSS ${v.cvss})
- Affected Asset: ${v.asset}
- Recommended Action: ${v.remediationSteps[0] || 'Apply patch'}
`).join('\n')}

---
Certified by AegisSOC Autonomous Cyber Defense Engine
`;

    const blob = new Blob([reportMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisSOC-Executive-Audit-${Date.now()}.md`;
    a.click();
    setDownloadNotice('Audit report downloaded as Markdown.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleExportJson = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      metrics,
      complianceStandards,
      activeThreats: activeThreats.map((t) => ({ id: t.id, title: t.title, severity: t.severity, sourceIp: t.sourceIp })),
      vulnerabilities: openVulns.map((v) => ({ id: v.id, cveId: v.cveId, title: v.title, cvss: v.cvss, asset: v.asset })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisSOC-Audit-Report-${Date.now()}.json`;
    a.click();
    setDownloadNotice('Audit report exported as JSON bundle.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-base font-bold text-white">
                Executive Security &amp; Compliance Audit Report
              </h2>
              <p className="text-xs text-slate-400">
                Audited against SOC 2 Type II, CIS Benchmarks, and ISO 27001
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice toast */}
        {downloadNotice && (
          <div className="mx-6 mt-4 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-xs">
          {/* Executive KPI Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Overall Posture</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {metrics.securityScore}
                </span>
                <span className="text-slate-500 font-mono">/ 100</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Active Threats</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {activeThreats.length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Open CVEs</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                {openVulns.length}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Compliance Rate</span>
              <span className="text-xl font-bold font-mono text-indigo-400">91.4%</span>
            </div>
          </div>

          {/* Compliance Matrix */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">
              Framework Compliance Status
            </h3>
            <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
              {complianceStandards.map((std, i) => (
                <div key={i} className="p-3 bg-slate-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">{std.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white font-bold">{std.score}%</span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        std.status === 'Compliant'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {std.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Priority Remediation Items */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">
              High Priority Remediation Road Map
            </h3>
            <div className="space-y-2">
              {openVulns.slice(0, 3).map((vuln) => (
                <div
                  key={vuln.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-rose-400">{vuln.cveId}</span>
                      <span className="text-slate-500">·</span>
                      <span className="font-mono text-slate-400">{vuln.asset}</span>
                    </div>
                    <div className="font-semibold text-white">{vuln.title}</div>
                    <div className="text-slate-400 mt-1">{vuln.remediationSteps[0]}</div>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0">
                    CVSS {vuln.cvss}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Export Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Markdown</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print / PDF</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
