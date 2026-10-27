import React, { useState } from 'react';
import { ThreatEvent, ThreatSeverity, ThreatStatus } from '../../types/cyber';
import { Search, ShieldAlert, CheckCircle2, Eye, ShieldCheck, Filter } from 'lucide-react';

interface ThreatFeedTableProps {
  threats: ThreatEvent[];
  onSelectThreat: (threat: ThreatEvent) => void;
  onContainThreat: (threatId: string, actionName: string) => void;
}

export const ThreatFeedTable: React.FC<ThreatFeedTableProps> = ({
  threats,
  onSelectThreat,
  onContainThreat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<ThreatSeverity | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ThreatStatus | 'all'>('all');

  const filteredThreats = threats.filter((threat) => {
    if (selectedSeverity !== 'all' && threat.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && threat.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = threat.title.toLowerCase().includes(q);
      const matchIp = threat.sourceIp.toLowerCase().includes(q);
      const matchAsset = threat.targetAsset.name.toLowerCase().includes(q);
      const matchMitre = threat.mitreTechnique.id.toLowerCase().includes(q) || threat.mitreTechnique.name.toLowerCase().includes(q);
      return matchTitle || matchIp || matchAsset || matchMitre;
    }
    return true;
  });

  const getSeverityBadge = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="font-mono text-xs px-2 py-0.5 rounded border border-rose-500/40 bg-rose-500/10 text-rose-400 font-bold">CRITICAL</span>;
      case 'high':
        return <span className="font-mono text-xs px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold">HIGH</span>;
      case 'medium':
        return <span className="font-mono text-xs px-2 py-0.5 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-300">MEDIUM</span>;
      default:
        return <span className="font-mono text-xs px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (status: ThreatStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'investigating':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            INVESTIGATING
          </span>
        );
      case 'mitigated':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            MITIGATED
          </span>
        );
      case 'false_positive':
        return <span className="text-[11px] font-mono text-slate-500">FALSE POS</span>;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      return `${diffHrs}h ago`;
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>SIEM Threat Event Stream</span>
            <span className="font-mono text-xs text-slate-400 font-normal">
              ({filteredThreats.length} events logged)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time intrusion detection signatures, heuristics, and anomalous telemetry
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search IP, vector, CVE, asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Severity Segmented Filter */}
          <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800">
            {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded capitalize transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="investigating">Investigating</option>
            <option value="mitigated">Mitigated</option>
          </select>
        </div>
      </div>

      {/* High Density Threat Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
            <tr>
              <th className="py-2.5 px-3">SEVERITY</th>
              <th className="py-2.5 px-3">TIMESTAMP</th>
              <th className="py-2.5 px-3">ATTACK VECTOR &amp; MITRE</th>
              <th className="py-2.5 px-3">SOURCE ORIGIN</th>
              <th className="py-2.5 px-3">TARGET ASSET</th>
              <th className="py-2.5 px-3">RISK</th>
              <th className="py-2.5 px-3">STATUS</th>
              <th className="py-2.5 px-3 text-right">CONTAINMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredThreats.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No threat events matching current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredThreats.map((threat) => (
                <tr
                  key={threat.id}
                  className="hover:bg-slate-900/50 transition-colors group"
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getSeverityBadge(threat.severity)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                    {formatRelativeTime(threat.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => onSelectThreat(threat)}
                      className="text-left font-semibold text-slate-100 hover:text-emerald-400 transition-colors block truncate w-full cursor-pointer"
                    >
                      {threat.title}
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span className="text-slate-400 font-semibold">{threat.mitreTechnique.id}</span>
                      <span>·</span>
                      <span className="truncate">{threat.mitreTechnique.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-mono font-medium text-slate-200 flex items-center gap-1">
                      <span>{threat.sourceGeo.flag}</span>
                      <span>{threat.sourceIp}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {threat.sourceGeo.city}, {threat.sourceGeo.country}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-mono text-slate-200">
                      {threat.targetAsset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {threat.protocol} :{threat.targetAsset.port}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`font-mono font-bold ${
                        threat.riskScore >= 90
                          ? 'text-rose-400'
                          : threat.riskScore >= 75
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {threat.riskScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getStatusBadge(threat.status)}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectThreat(threat)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        title="Inspect packet & forensic details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>

                      {threat.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => onContainThreat(threat.id, threat.containmentActions[0] || 'Block IP')}
                          className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Trigger 1-Click Automated Containment"
                        >
                          <ShieldCheck className="w-3 h-3 text-rose-400" />
                          <span>Contain</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
