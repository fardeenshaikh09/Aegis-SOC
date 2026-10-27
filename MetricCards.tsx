import React from 'react';
import { ShieldCheck, AlertOctagon, Ban, Clock, Server, Zap } from 'lucide-react';
import { SecurityMetrics } from '../types/cyber';

interface MetricCardsProps {
  metrics: SecurityMetrics;
  criticalThreatCount: number;
  criticalVulnCount: number;
  onFilterActiveThreats?: () => void;
  onFilterCriticalVulns?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  criticalThreatCount,
  criticalVulnCount,
  onFilterActiveThreats,
  onFilterCriticalVulns,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Security Posture Score */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Health Index</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{metrics.securityScore}</span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.securityScore >= 80 ? 'bg-emerald-500' : metrics.securityScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${metrics.securityScore}%` }}
          />
        </div>
      </div>

      {/* 2. Active Threats */}
      <button
        type="button"
        onClick={onFilterActiveThreats}
        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 text-left flex flex-col justify-between transition-colors group cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-slate-200">Active Threats</span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-rose-400">{metrics.activeThreatsCount}</span>
          {criticalThreatCount > 0 && (
            <span className="text-[11px] font-mono font-semibold text-rose-400">
              {criticalThreatCount} Crit
            </span>
          )}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Click to triage active
        </div>
      </button>

      {/* 3. Blocked Attacks 24h */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Attacks Blocked</span>
          <Ban className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {metrics.blockedTodayCount.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
          <Zap className="w-3 h-3" />
          <span>{metrics.eventsPerSecond} ev/sec stream</span>
        </div>
      </div>

      {/* 4. Open Vulnerabilities */}
      <button
        type="button"
        onClick={onFilterCriticalVulns}
        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 text-left flex flex-col justify-between transition-colors group cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-slate-200">Open CVEs</span>
          <AlertOctagon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-amber-400">
            {criticalVulnCount}
          </span>
          <span className="text-[11px] font-mono text-slate-400">Critical</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Automated scanner active
        </div>
      </button>

      {/* 5. Mean Time to Remediate */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">MTTR (Containment)</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {metrics.meanTimeToRemediateMinutes}m
          </span>
          <span className="text-[11px] font-mono text-slate-400">avg speed</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Playbooks automated
        </div>
      </div>

      {/* 6. Protected Assets */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Protected Assets</span>
          <Server className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{metrics.assetsProtected}</span>
          <span className="text-[11px] font-mono text-emerald-400">100% online</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          VPCs, K8s, Lambdas
        </div>
      </div>
    </div>
  );
};
