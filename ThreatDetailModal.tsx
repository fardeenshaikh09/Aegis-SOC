import React, { useState } from 'react';
import { ThreatEvent } from '../../types/cyber';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Lock,
  Download,
  Terminal,
  Server,
  Globe,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface ThreatDetailModalProps {
  threat: ThreatEvent | null;
  onClose: () => void;
  onContain: (threatId: string, actionName: string) => void;
  onUpdateStatus: (threatId: string, status: ThreatEvent['status']) => void;
  onAddNote?: (threatId: string, note: string) => void;
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({
  threat,
  onClose,
  onContain,
  onUpdateStatus,
  onAddNote,
}) => {
  if (!threat) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'payload' | 'containment'>('details');
  const [newNote, setNewNote] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerAction = (actionName: string) => {
    onContain(threat.id, actionName);
    setSuccessToast(`Executed: ${actionName}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="threat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">{threat.id}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                  {threat.severity}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Risk Score: <strong className="text-rose-400">{threat.riskScore}/100</strong>
                </span>
              </div>
              <h2 id="threat-modal-title" className="text-base font-bold text-white mt-0.5">
                {threat.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close threat inspection modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Threat Intelligence &amp; Vectors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'payload'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Packet &amp; Payload Hex
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('containment')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'containment'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Containment &amp; Playbooks
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-6 mt-4 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Description */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-xs font-medium text-slate-400 block mb-1">Incident Assessment</span>
                <p className="text-xs text-slate-200 leading-relaxed">{threat.description}</p>
              </div>

              {/* Source & Target Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Intelligence */}
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Attacker Origin Intelligence</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                    <span>{threat.sourceGeo.flag}</span>
                    <span>{threat.sourceIp}</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Location: {threat.sourceGeo.city}, {threat.sourceGeo.country}</div>
                    <div>Coordinates: {threat.sourceGeo.lat.toFixed(4)}, {threat.sourceGeo.lng.toFixed(4)}</div>
                    <div>AbuseIPDB Confidence: <span className="text-rose-400 font-bold font-mono">98%</span></div>
                  </div>
                </div>

                {/* Target Asset */}
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Target Infrastructure Node</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {threat.targetAsset.name}
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Internal IP: <span className="font-mono text-slate-200">{threat.targetAsset.ip}</span></div>
                    <div>Listening Service: <span className="font-mono text-slate-200">{threat.targetAsset.service}</span></div>
                    <div>Target Port: <span className="font-mono text-slate-200">{threat.protocol} / {threat.targetAsset.port}</span></div>
                  </div>
                </div>
              </div>

              {/* MITRE ATT&CK Matrix Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    MITRE ATT&amp;CK Mapping
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                    {threat.mitreTechnique.id}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {threat.mitreTechnique.name}
                </div>
                <div className="text-xs text-slate-400">
                  Tactic Classification: <span className="text-indigo-400 font-medium">{threat.mitreTechnique.tactic}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Decoded Payload Stream Snippet
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
                  {threat.payloadSnippet}
                </pre>
              </div>

              {threat.rawPacketHex && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1">
                    Raw Packet Hex Dump
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 overflow-x-auto">
                    {threat.rawPacketHex}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([`${threat.payloadSnippet}\n\nHex:\n${threat.rawPacketHex}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pcap-forensics-${threat.id}.txt`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download Forensics Artifact</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'containment' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                Execute automated containment actions to neutralize the threat vector immediately across firewall, cloud IAM, and container network policies.
              </div>

              <div className="space-y-2">
                {threat.containmentActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-medium text-white">{action}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerAction(action)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>Execute</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Status manual override */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">Change Incident State:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(threat.id, 'investigating')}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium cursor-pointer"
                  >
                    Set Investigating
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(threat.id, 'mitigated')}
                    className="px-2.5 py-1 text-xs rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-medium cursor-pointer"
                  >
                    Mark Mitigated
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(threat.id, 'false_positive')}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium cursor-pointer"
                  >
                    Mark False Positive
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Status: <span className="font-bold text-white uppercase">{threat.status}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
