import React from 'react';
import { Activity, Search, ShieldCheck, LifeBuoy, Terminal } from 'lucide-react';

export type NavTab = 'threats' | 'scanner' | 'mitre' | 'incidents' | 'sandbox';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeThreatCount: number;
  openVulnCount: number;
  openIncidentCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  activeThreatCount,
  openVulnCount,
  openIncidentCount,
}) => {
  const tabs = [
    {
      id: 'threats' as NavTab,
      label: 'Live Threat SIEM',
      icon: Activity,
      badge: activeThreatCount > 0 ? activeThreatCount : undefined,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'scanner' as NavTab,
      label: 'Vulnerability Scanner',
      icon: Search,
      badge: openVulnCount > 0 ? openVulnCount : undefined,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'mitre' as NavTab,
      label: 'MITRE ATT&CK Matrix',
      icon: ShieldCheck,
    },
    {
      id: 'incidents' as NavTab,
      label: 'Incidents & Playbooks',
      icon: LifeBuoy,
      badge: openIncidentCount > 0 ? openIncidentCount : undefined,
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      id: 'sandbox' as NavTab,
      label: 'Packet & Rule Sandbox',
      icon: Terminal,
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar" role="tablist" aria-label="Main Security Views">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 font-mono text-[10px] font-bold rounded border ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
