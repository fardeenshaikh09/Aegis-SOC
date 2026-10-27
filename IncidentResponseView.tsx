import React, { useState } from 'react';
import { Incident, Playbook, ThreatSeverity } from '../../types/cyber';
import {
  LifeBuoy,
  ShieldCheck,
  Clock,
  Play,
  RotateCw,
  CheckCircle2,
  User,
  Plus,
  Send,
  Lock,
  Layers,
} from 'lucide-react';

interface IncidentResponseViewProps {
  incidents: Incident[];
  playbooks: Playbook[];
  onUpdateIncidentStatus: (incidentId: string, status: Incident['status']) => void;
  onAddIncidentNote: (incidentId: string, note: string) => void;
  onRunPlaybook: (playbookId: string) => void;
}

export const IncidentResponseView: React.FC<IncidentResponseViewProps> = ({
  incidents,
  playbooks,
  onUpdateIncidentStatus,
  onAddIncidentNote,
  onRunPlaybook,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [activePlaybookTab, setActivePlaybookTab] = useState<'incidents' | 'playbooks'>('incidents');
  const [noteInput, setNoteInput] = useState('');
  const [executingPlaybookId, setExecutingPlaybookId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Record<string, string[]>>({});

  const selectedIncident = incidents.find((inc) => inc.id === selectedIncidentId);

  const handleAddNote = () => {
    if (!noteInput.trim() || !selectedIncidentId) return;
    onAddIncidentNote(selectedIncidentId, noteInput.trim());
    setNoteInput('');
  };

  const handleExecutePlaybook = (pb: Playbook) => {
    setExecutingPlaybookId(pb.id);
    const logs: string[] = [];
    setExecutionLogs((prev) => ({ ...prev, [pb.id]: logs }));

    pb.actions.forEach((act, idx) => {
      setTimeout(() => {
        logs.push(`[${new Date().toLocaleTimeString()}] STEP ${idx + 1}/${pb.actions.length}: ${act}... SUCCESS`);
        setExecutionLogs((prev) => ({ ...prev, [pb.id]: [...logs] }));

        if (idx === pb.actions.length - 1) {
          setTimeout(() => {
            setExecutingPlaybookId(null);
            onRunPlaybook(pb.id);
          }, 400);
        }
      }, (idx + 1) * 600);
    });
  };

  const getSeverityBadge = (sev: ThreatSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">CRITICAL</span>;
      case 'high':
        return <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">HIGH</span>;
      default:
        return <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">MEDIUM</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnav Toggle */}
      <div className="flex border-b border-slate-800 pb-3 gap-3">
        <button
          type="button"
          onClick={() => setActivePlaybookTab('incidents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activePlaybookTab === 'incidents'
              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Active Incident Response Queue ({incidents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActivePlaybookTab('playbooks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activePlaybookTab === 'playbooks'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>SOAR Automated Containment Playbooks ({playbooks.length})</span>
        </button>
      </div>

      {activePlaybookTab === 'incidents' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident List */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Triaged Incidents
            </h3>

            <div className="space-y-2">
              {incidents.map((inc) => {
                const isSelected = inc.id === selectedIncidentId;
                return (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-400">{inc.id}</span>
                      {getSeverityBadge(inc.severity)}
                    </div>
                    <h4 className="text-xs font-semibold text-white truncate">{inc.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span className="capitalize font-mono text-emerald-400">{inc.status}</span>
                      <span className="truncate max-w-[120px]">{inc.assignedAnalyst.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Detail & Timeline */}
          {selectedIncident ? (
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">{selectedIncident.id}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">{selectedIncident.threatId}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                  {(['open', 'investigating', 'contained', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateIncidentStatus(selectedIncident.id, st)}
                      className={`px-2.5 py-1 text-xs rounded capitalize font-medium transition-colors cursor-pointer ${
                        selectedIncident.status === st
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Analyst */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Assigned Incident Commander:</span>
                  <strong className="text-white">{selectedIncident.assignedAnalyst}</strong>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Created: {new Date(selectedIncident.createdAt).toLocaleTimeString()}
                </div>
              </div>

              {/* Incident Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
                  Forensic Event Timeline
                </h4>
                <div className="space-y-3 relative pl-4 border-l border-slate-800">
                  {selectedIncident.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-slate-950" />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200">{item.message}</span>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Actor: <span className="font-mono text-indigo-400">{item.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                  SOC Analyst Notes
                </h4>
                <div className="space-y-2 mb-3">
                  {selectedIncident.notes.map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300">
                      {note}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add forensic notes or containment update..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 rounded-xl border border-slate-800 p-8 text-center text-slate-500">
              Select an incident to view details and timeline.
            </div>
          )}
        </div>
      ) : (
        /* SOAR Playbooks Section */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map((pb) => {
            const isRunning = executingPlaybookId === pb.id;
            const logs = executionLogs[pb.id] || [];

            return (
              <div
                key={pb.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {pb.id} · SOAR
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Success Rate: <strong className="text-emerald-400">{pb.successRate}%</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{pb.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{pb.description}</p>

                  <div className="text-xs text-slate-400 mb-2 font-mono">
                    Trigger Condition: <span className="text-rose-400">{pb.triggerEvent}</span>
                  </div>

                  {/* Actions list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Automated Execution Pipeline:
                    </span>
                    {pb.actions.map((act, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live execution logs */}
                  {logs.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
                      {logs.map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Executed: <strong className="text-white">{pb.executionCount}</strong> times
                  </span>

                  <button
                    type="button"
                    onClick={() => handleExecutePlaybook(pb)}
                    disabled={isRunning}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
                  >
                    {isRunning ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                        <span>Running Playbook...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Execute Playbook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
