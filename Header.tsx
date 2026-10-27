import React from 'react';
import { Shield, Radio, Flame, Sparkles, FileText, Pause, Play, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenSimulateModal: () => void;
  onOpenCopilot: () => void;
  onOpenReportModal: () => void;
  activeThreatsCount: number;
  securityScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  isStreaming,
  onToggleStreaming,
  onOpenSimulateModal,
  onOpenCopilot,
  onOpenReportModal,
  activeThreatsCount,
  securityScore,
}) => {
  const defconLevel = activeThreatsCount > 2 ? 'DEFCON 2 · ELEVATED' : activeThreatsCount > 0 ? 'DEFCON 3 · GUARDED' : 'DEFCON 4 · NORMAL';
  const defconColor = activeThreatsCount > 2 ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & SOC Status */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Aegis<span className="text-emerald-400 font-extrabold">SOC</span>
              </span>
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${defconColor}`}>
                {defconLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Cloud SIEM &amp; XDR Posture Engine</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-400">SOC-EAST-01</span>
            </div>
          </div>
        </div>

        {/* Global Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Telemetry Stream Play/Pause */}
          <button
            type="button"
            onClick={onToggleStreaming}
            aria-label={isStreaming ? 'Pause live telemetry feed' : 'Resume live telemetry feed'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors"
          >
            {isStreaming ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>Live Feed</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Feed Paused</span>
              </>
            )}
          </button>

          {/* Simulate Attack Button */}
          <button
            type="button"
            onClick={onOpenSimulateModal}
            aria-label="Simulate cyber attack scenario"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Attack</span>
          </button>

          {/* AI Security Copilot Button */}
          <button
            type="button"
            onClick={onOpenCopilot}
            aria-label="Open AI Security Analyst copilot"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Analyst</span>
          </button>

          {/* Compliance Report Button */}
          <button
            type="button"
            onClick={onOpenReportModal}
            aria-label="Generate executive compliance and security report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Audit Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
