import React, { useState } from 'react';
import { ThreatEvent, VulnerabilityFinding } from '../../types/cyber';
import { X, Sparkles, Send, Bot, User, Terminal, Copy, Check } from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  threats: ThreatEvent[];
  vulnerabilities: VulnerabilityFinding[];
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  threats,
  vulnerabilities,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Greetings Commander. I am your AegisSOC Autonomous Cyber Intelligence Copilot. I continuously analyze telemetry, correlate attack patterns with the MITRE ATT&CK framework, and generate verified bash/kubectl/WAF containment scripts. How can I assist you?',
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    'Triage current critical threats & suggest containment',
    'Generate bash script to block abusive IPs via iptables',
    'Analyze Log4Shell CVE-2021-44228 attack vector',
    'Draft executive SOC briefing for INC-2094',
  ];

  const handleSend = (userText: string) => {
    const query = userText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate response using cyber heuristic intelligence
    setTimeout(() => {
      let aiResponseText = '';
      let codeSnippet: string | undefined;

      const qLower = query.toLowerCase();

      if (qLower.includes('triage') || qLower.includes('critical')) {
        const activeCritThreats = threats.filter((t) => t.severity === 'critical' && t.status === 'active');
        const activeCritVulns = vulnerabilities.filter((v) => v.severity === 'critical' && v.status === 'open');

        aiResponseText = `### Incident Assessment & Containment Plan\n\n` +
          `Identified **${activeCritThreats.length} active critical intrusions** and **${activeCritVulns.length} open critical CVEs** requiring immediate action:\n\n` +
          `1. **${activeCritThreats[0]?.title || 'SSH Brute Force'}**:\n` +
          `   - Origin IP: \`${activeCritThreats[0]?.sourceIp || '185.220.101.5'}\`\n` +
          `   - Tactic: ${activeCritThreats[0]?.mitreTechnique.tactic || 'Credential Access'} (${activeCritThreats[0]?.mitreTechnique.id || 'T1110'})\n` +
          `   - Recommendation: Apply immediate edge drop filter and rotate bastion service keys.`;

        codeSnippet = `# Emergency WAF & Firewall Containment\n` +
          `sudo iptables -A INPUT -s ${activeCritThreats[0]?.sourceIp || '185.220.101.5'} -j DROP\n` +
          `aws wafv2 update-ip-set --name "Aegis-BlockList" --scope CLOUDFRONT --addresses "${activeCritThreats[0]?.sourceIp || '185.220.101.5'}/32"`;
      } else if (qLower.includes('iptables') || qLower.includes('block') || qLower.includes('bash')) {
        aiResponseText = `Here is an automated multi-layer defense script for edge rate-limiting and SYN flood mitigation:`;
        codeSnippet = `#!/bin/bash\n# AegisSOC Autonomous Edge Mitigation Script\n\n# 1. Drop invalid incoming packets\niptables -t mangle -A PREROUTING -m conntrack --ctstate INVALID -j DROP\n\n# 2. Mitigate SYN Floods with syncookies\nsysctl -w net.ipv4.tcp_syncookies=1\nsysctl -w net.ipv4.tcp_max_syn_backlog=4096\n\n# 3. Rate limit SSH attempts (max 5 new connections per minute)\niptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set\niptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 5 -j DROP\n\necho "[+] Edge defense rules active."`;
      } else if (qLower.includes('log4') || qLower.includes('cve-2021-44228')) {
        aiResponseText = `### Log4Shell Vulnerability (CVE-2021-44228) Forensics:\n\n` +
          `- **CVSS Base Score**: 10.0 (Critical)\n` +
          `- **Exploitation Vector**: Log4j2 JNDI message lookup mechanism allows arbitrary LDAP/RMI protocol references in logged string formatting.\n` +
          `- **Remediation**: Upgrade dependencies to Log4j 2.17.1+ or export the environment variable \`LOG4J_FORMAT_MSG_NO_LOOKUPS=true\`.`;

        codeSnippet = `# Kubernetes Deployment Environment Variable Patch\nkubectl set env deployment/ingress-logger LOG4J_FORMAT_MSG_NO_LOOKUPS="true" -n production`;
      } else {
        aiResponseText = `I analyzed your query: "${query}". AegisSOC telemetry sensors confirm continuous zero-trust monitoring across all 18 infrastructure assets. All inbound ingress traffic is inspected through our Envoy proxy filter chain with real-time heuristic scoring.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        codeSnippet,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Security Analyst Copilot"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Aegis Cyber Copilot</span>
              <span className="font-mono text-[10px] text-indigo-400 font-bold px-1.5 py-0.2 rounded bg-indigo-500/20">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Autonomous incident triage &amp; remediation assistant
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close copilot"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isAI
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  isAI
                    ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    : 'bg-emerald-600 text-white shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.codeSnippet && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-mono text-emerald-400">
                        <Terminal className="w-3 h-3" />
                        Remediation Fix:
                      </span>
                      <button
                        type="button"
                        onClick={() => copySnippet(m.codeSnippet!, m.id)}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                      {m.codeSnippet}
                    </pre>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono text-right">{m.timestamp}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 block">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex gap-2">
        <input
          type="text"
          placeholder="Ask copilot for threat analysis or CLI remediation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => handleSend(input)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-md shadow-indigo-950/50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
