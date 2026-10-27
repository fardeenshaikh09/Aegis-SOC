import React, { useState } from 'react';
import { ThreatEvent } from '../../types/cyber';
import { MITRE_TACTICS_DATA } from '../../utils/mockData';
import { ShieldCheck, ShieldAlert, Terminal, Info, ExternalLink } from 'lucide-react';

interface MitreMatrixViewProps {
  threats: ThreatEvent[];
  onSelectThreatByMitre?: (mitreId: string) => void;
}

export const MitreMatrixView: React.FC<MitreMatrixViewProps> = ({ threats }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<{
    id: string;
    name: string;
    tactic: string;
    score: number;
    activeCount: number;
  } | null>(null);

  // Map active threats by MITRE technique ID
  const activeTechniqueMap = new Map<string, number>();
  threats.forEach((t) => {
    if (t.status === 'active' || t.status === 'investigating') {
      const id = t.mitreTechnique.id.split('.')[0];
      activeTechniqueMap.set(id, (activeTechniqueMap.get(id) || 0) + 1);
      activeTechniqueMap.set(t.mitreTechnique.id, (activeTechniqueMap.get(t.mitreTechnique.id) || 0) + 1);
    }
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">MITRE ATT&amp;CK Enterprise Matrix</h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              v14 Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual attack lifecycle telemetry and AegisSOC detection rule posture across all tactical phases
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 font-bold">Active Adversary Probe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Detection Covered (&gt;85%)</span>
          </div>
        </div>
      </div>

      {/* Grid of Tactics and Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MITRE_TACTICS_DATA.map((col) => {
          return (
            <div
              key={col.id}
              className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden flex flex-col"
            >
              {/* Tactic Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{col.id}</span>
                  <h3 className="text-xs font-bold text-white tracking-tight">{col.tactic}</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {Math.round(col.techniques.reduce((acc, c) => acc + c.score, 0) / col.techniques.length)}% Cov
                </span>
              </div>

              {/* Techniques List */}
              <div className="p-2 space-y-1.5 flex-1">
                {col.techniques.map((tech) => {
                  const activeCount = activeTechniqueMap.get(tech.id) || 0;
                  const isUnderAttack = activeCount > 0;
                  const isSelected = selectedTechnique?.id === tech.id;

                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() =>
                        setSelectedTechnique({
                          id: tech.id,
                          name: tech.name,
                          tactic: col.tactic,
                          score: tech.score,
                          activeCount,
                        })
                      }
                      className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start justify-between gap-2 border cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/15'
                          : isUnderAttack
                          ? 'border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 shadow-sm'
                          : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            {tech.id}
                          </span>
                          {isUnderAttack && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
                          {tech.name}
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        {isUnderAttack ? (
                          <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                            {activeCount} Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400">
                            {tech.score}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Technique Drilldown Card */}
      {selectedTechnique && (
        <div className="rounded-xl border border-indigo-500/40 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                {selectedTechnique.id}
              </span>
              <h3 className="text-sm font-bold text-white">{selectedTechnique.name}</h3>
              <span className="text-xs text-slate-400">({selectedTechnique.tactic})</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTechnique(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Details
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Adversaries employ {selectedTechnique.name} to execute unauthorized actions within the enterprise environment.
            AegisSOC monitors this vector through eBPF system call telemetry, reverse proxy WAF pattern matching, and AWS CloudTrail audit stream analysis.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Defense Rule Coverage</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {selectedTechnique.score}% Protected
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Telemetry Sensor</span>
              <span className="font-mono text-slate-200">Envoy / eBPF Kernel Probe</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Automated Playbook</span>
              <span className="font-mono text-indigo-400">PB-01 IP Quarantine</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
