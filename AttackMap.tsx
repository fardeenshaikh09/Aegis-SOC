import React from 'react';
import { ThreatEvent } from '../../types/cyber';
import { Shield, AlertTriangle, Radio } from 'lucide-react';

interface AttackMapProps {
  threats: ThreatEvent[];
  onSelectThreat: (threat: ThreatEvent) => void;
}

export const AttackMap: React.FC<AttackMapProps> = ({ threats, onSelectThreat }) => {
  // Active threats to plot
  const activeThreats = threats.filter((t) => t.status !== 'mitigated').slice(0, 8);

  // SVG dimensions
  const width = 800;
  const height = 300;

  // Convert lat/long to approximate x/y on mercator-ish map projection
  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * (width * 0.7) + width * 0.05;
    const y = ((90 - lat) / 180) * (height * 0.8) + height * 0.1;
    return { x, y };
  };

  // Target datacenter hub position on canvas (e.g. US East AWS datacenter)
  const targetX = width * 0.45;
  const targetY = height * 0.55;

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-4 overflow-hidden mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Global Threat Radar &amp; Vector Trajectories</h3>
            <p className="text-xs text-slate-400">Live incoming attack telemetry mapped to enterprise microservices</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Active Vector</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Shield Protected Hub</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[21/8] bg-slate-900/40 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* World map background grid and outline */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Grid lines */}
          <rect width={width} height={height} fill="url(#grid)" opacity="0.6" />

          {/* Simplified Continental Landmass Shapes */}
          <g fill="#1e293b" opacity="0.35">
            {/* North America */}
            <path d="M 120 70 Q 200 60 260 110 Q 230 190 190 200 Q 150 160 120 70 Z" />
            {/* South America */}
            <path d="M 210 200 Q 250 210 270 270 Q 230 310 210 260 Z" />
            {/* Europe */}
            <path d="M 380 70 Q 450 70 470 120 Q 420 140 380 110 Z" />
            {/* Africa */}
            <path d="M 390 130 Q 460 140 460 220 Q 410 260 390 170 Z" />
            {/* Asia */}
            <path d="M 480 60 Q 640 70 660 160 Q 560 180 490 130 Z" />
            {/* Australia */}
            <path d="M 590 220 Q 660 220 650 270 Q 600 270 590 220 Z" />
          </g>

          {/* Trajectory Attack Beams */}
          {activeThreats.map((threat, idx) => {
            const { x: srcX, y: srcY } = project(threat.sourceGeo.lat, threat.sourceGeo.lng);
            // Quadratic bezier curve mid point for curved missile-like trajectory
            const midX = (srcX + targetX) / 2;
            const midY = Math.min(srcY, targetY) - 30;

            const isCrit = threat.severity === 'critical';
            const strokeColor = isCrit ? '#f43f5e' : '#f59e0b';

            return (
              <g key={threat.id} className="cursor-pointer" onClick={() => onSelectThreat(threat)}>
                {/* Curved trajectory path */}
                <path
                  d={`M ${srcX} ${srcY} Q ${midX} ${midY} ${targetX} ${targetY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isCrit ? 1.75 : 1.25}
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* Animated traveling attack pulse */}
                <circle r={isCrit ? 3.5 : 2.5} fill={strokeColor}>
                  <animateMotion
                    path={`M ${srcX} ${srcY} Q ${midX} ${midY} ${targetX} ${targetY}`}
                    dur={`${2.5 + (idx % 3)}s`}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Source Attacker Point */}
                <circle cx={srcX} cy={srcY} r="4" fill={strokeColor} />
                <circle cx={srcX} cy={srcY} r="9" fill="none" stroke={strokeColor} opacity="0.4">
                  <animate attributeName="r" values="4;14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Attacker Tooltip/Label */}
                <text
                  x={srcX + 8}
                  y={srcY - 6}
                  fill="#cbd5e1"
                  fontSize="10"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {threat.sourceGeo.flag} {threat.sourceIp}
                </text>
              </g>
            );
          })}

          {/* Central Target Data Center / Cloud VPC Hub */}
          <g>
            <circle cx={targetX} cy={targetY} r="16" fill="#10b981" fillOpacity="0.15" />
            <circle cx={targetX} cy={targetY} r="8" fill="#10b981" />
            <circle cx={targetX} cy={targetY} r="24" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="8;28" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <text
              x={targetX - 45}
              y={targetY + 30}
              fill="#10b981"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              AWS US-EAST VPC [CORE]
            </text>
          </g>
        </svg>

        {/* Live Attack Feed Ticker at bottom of radar */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800 backdrop-blur-sm overflow-x-auto">
          <div className="flex items-center gap-3">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              LATEST INTRUSION:
            </span>
            {activeThreats[0] ? (
              <button
                type="button"
                onClick={() => onSelectThreat(activeThreats[0])}
                className="hover:text-emerald-400 text-slate-300 truncate max-w-[400px] text-left underline-offset-2 hover:underline cursor-pointer"
              >
                {activeThreats[0].title} from {activeThreats[0].sourceGeo.city} ({activeThreats[0].sourceIp})
              </button>
            ) : (
              <span className="text-slate-500">No active incoming vectors detected</span>
            )}
          </div>
          <div className="text-slate-500 hidden sm:block">
            Target: K8s / Kong Ingress (Port 443)
          </div>
        </div>
      </div>
    </div>
  );
};
