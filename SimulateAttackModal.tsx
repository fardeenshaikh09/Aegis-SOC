import React, { useState } from 'react';
import { ThreatEvent, ThreatCategory, ThreatSeverity } from '../../types/cyber';
import { ATTACK_SCENARIOS } from '../../utils/mockData';
import { X, Flame, Zap, ShieldAlert, Play, Check } from 'lucide-react';

interface SimulateAttackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectThreat: (threat: ThreatEvent) => void;
}

export const SimulateAttackModal: React.FC<SimulateAttackModalProps> = ({
  isOpen,
  onClose,
  onInjectThreat,
}) => {
  if (!isOpen) return null;

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(ATTACK_SCENARIOS[0].id);
  const [customTitle, setCustomTitle] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [customSeverity, setCustomSeverity] = useState<ThreatSeverity>('critical');
  const [isCustom, setIsCustom] = useState(false);
  const [injected, setInjected] = useState(false);

  const handleLaunch = () => {
    let newThreat: ThreatEvent;

    if (isCustom) {
      newThreat = {
        id: `THR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        title: customTitle.trim() || 'Custom Simulated Intrusion Probe',
        description: 'Simulated custom adversary attack vector injected through security test harness.',
        severity: customSeverity,
        category: 'injection',
        mitreTechnique: {
          id: 'T1190',
          name: 'Exploit Public-Facing Application',
          tactic: 'Initial Access',
        },
        sourceIp: '198.51.100.88',
        sourceGeo: { country: 'Sweden', flag: '🇸🇪', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
        targetAsset: { id: 'ast-gw', name: 'api-gateway-edge', ip: '10.0.1.1', service: 'Kong Ingress Gateway', port: 443 },
        protocol: 'HTTPS',
        payloadSnippet: customPayload.trim() || 'POST /api/v1/debug?token=malicious_override',
        status: 'active',
        riskScore: 92,
        blocked: false,
        containmentActions: ['Block Source IP on Cloud Armor', 'Rotate Ingress Certificates'],
      };
    } else {
      const scenario = ATTACK_SCENARIOS.find((s) => s.id === selectedScenarioId)!;
      newThreat = {
        id: `THR-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        title: scenario.name,
        description: scenario.description,
        severity: scenario.severity,
        category: scenario.category,
        mitreTechnique: scenario.mitre,
        sourceIp: scenario.sourceIp,
        sourceGeo: scenario.geo,
        targetAsset: scenario.target,
        protocol: 'HTTPS',
        payloadSnippet: scenario.payload,
        status: 'active',
        riskScore: scenario.severity === 'critical' ? 96 : 84,
        blocked: false,
        containmentActions: [
          'Trigger WAF Dynamic Rule Block',
          'Quarantine Affected Host Pod',
          'Invalidate Session Tokens',
        ],
      };
    }

    onInjectThreat(newThreat);
    setInjected(true);
    setTimeout(() => {
      setInjected(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-rose-500/40 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 id="simulate-modal-title" className="text-base font-bold text-white">
                Simulate Cyber Attack Incident
              </h2>
              <p className="text-xs text-rose-300">
                Inject realistic threat vectors into live SIEM telemetry to verify alert triage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close attack simulation modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !isCustom
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Pre-built Attack Scenarios
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isCustom
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Vector Builder
            </button>
          </div>

          {!isCustom ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Select Attack Vector:
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {ATTACK_SCENARIOS.map((scen) => (
                  <label
                    key={scen.id}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                      selectedScenarioId === scen.id
                        ? 'border-rose-500/60 bg-rose-500/10'
                        : 'border-slate-800 bg-slate-950/50 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="attackScenario"
                        value={scen.id}
                        checked={selectedScenarioId === scen.id}
                        onChange={() => setSelectedScenarioId(scen.id)}
                        className="mt-1 accent-rose-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{scen.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase font-bold">
                            {scen.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{scen.description}</p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-2">
                          <span>Origin: {scen.geo.flag} {scen.sourceIp}</span>
                          <span>·</span>
                          <span>MITRE: {scen.mitre.id}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Attack Vector Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Slowloris Exhaustion Attack"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Payload Pattern / Injection String
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. GET /api/v1/search?q=' OR 1=1-- HTTP/1.1"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Severity Tier
                </label>
                <select
                  value={customSeverity}
                  onChange={(e) => setCustomSeverity(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={injected}
            className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
          >
            {injected ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Vector Injected!</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-white" />
                <span>Launch Simulated Intrusion</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
