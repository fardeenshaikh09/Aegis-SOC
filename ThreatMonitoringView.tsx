import React, { useState } from 'react';
import { ThreatEvent } from '../../types/cyber';
import { AttackMap } from './AttackMap';
import { ThreatFeedTable } from './ThreatFeedTable';
import { ThreatDetailModal } from './ThreatDetailModal';

interface ThreatMonitoringViewProps {
  threats: ThreatEvent[];
  onContainThreat: (threatId: string, actionName: string) => void;
  onUpdateStatus: (threatId: string, status: ThreatEvent['status']) => void;
}

export const ThreatMonitoringView: React.FC<ThreatMonitoringViewProps> = ({
  threats,
  onContainThreat,
  onUpdateStatus,
}) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);

  return (
    <div className="space-y-6">
      {/* Global Threat Radar & Attack Map */}
      <AttackMap threats={threats} onSelectThreat={(t) => setSelectedThreat(t)} />

      {/* Real-time Telemetry Stream Table */}
      <ThreatFeedTable
        threats={threats}
        onSelectThreat={(t) => setSelectedThreat(t)}
        onContainThreat={onContainThreat}
      />

      {/* Forensic Inspection Modal */}
      <ThreatDetailModal
        threat={selectedThreat}
        onClose={() => setSelectedThreat(null)}
        onContain={onContainThreat}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
};
