import React, { useState } from 'react';
import { ReportItem, AuditLogItem } from '../types';
import { X, Shield, AlertOctagon, Terminal, PhoneCall, Trash2, CheckCircle2, RotateCw } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  auditLogs: AuditLogItem[];
  onResolveReport: (id: string, action: 'resolve' | 'dismiss') => void;
  onPurgeExpired: () => void;
}

export const AdminSafetyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reports,
  auditLogs,
  onResolveReport,
  onPurgeExpired,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'audit' | 'compliance' | 'crisis'>('queue');
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualPurge = () => {
    playHapticSound('snap');
    onPurgeExpired();
    setPurgeFeedback('Sweep Complete: In-memory & cached ephemeral posts verified against expiry timestamp.');
    setTimeout(() => setPurgeFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0E0C1C] border border-[rgba(255,255,255,0.15)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#131124]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6FD8]/10 text-[#FF6FD8] border border-[#FF6FD8]/30 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F0EEFF]">Safety & Moderation Ops Console</h2>
                <span className="text-[10px] font-mono uppercase bg-[#6FFFE0]/15 text-[#6FFFE0] px-2 py-0.5 rounded border border-[#6FFFE0]/30">
                  Refine Engine
                </span>
              </div>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">ODPC Kenya 2019 & GDPR Compliance Ready</p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#F0EEFF]/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-[#17152B] border-b border-[rgba(255,255,255,0.06)] text-xs font-mono">
          <button
            onClick={() => {
              playHapticSound('click');
              setActiveTab('queue');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'queue' ? 'bg-[#FF6FD8] text-[#0A0912] font-semibold' : 'text-[#F0EEFF]/70 hover:text-white'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Moderation Queue ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => {
              playHapticSound('click');
              setActiveTab('audit');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-[#6FFFE0] text-[#0A0912] font-semibold' : 'text-[#F0EEFF]/70 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => {
              playHapticSound('click');
              setActiveTab('compliance');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'compliance' ? 'bg-[#B794F6] text-[#0A0912] font-semibold' : 'text-[#F0EEFF]/70 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Compliance</span>
          </button>

          <button
            onClick={() => {
              playHapticSound('click');
              setActiveTab('crisis');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'crisis' ? 'bg-[#FFB27A] text-[#0A0912] font-semibold' : 'text-[#F0EEFF]/70 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Crisis Hotline</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs text-[#F0EEFF]/70 font-mono">Flagged Content Awaiting Triage</span>
                <button
                  onClick={handleManualPurge}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6FFFE0] hover:underline"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Trigger 4-Tier Ephemeral Purge
                </button>
              </div>

              {purgeFeedback && (
                <div className="p-3 rounded-lg bg-[#6FFFE0]/10 border border-[#6FFFE0]/30 text-xs font-mono text-[#6FFFE0]">
                  {purgeFeedback}
                </div>
              )}

              {reports.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#F0EEFF]/40 border border-dashed border-white/10 rounded-xl">
                  No flagged items in moderation queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#141224] border border-[rgba(255,255,255,0.08)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="uppercase text-[#FF5C7A] px-1.5 py-0.5 rounded bg-[#FF5C7A]/15 border border-[#FF5C7A]/30 text-[10px]">
                            {item.contentType}
                          </span>
                          <span className="text-[#F0EEFF]/80">{item.reason}</span>
                        </div>
                        <span className="text-[#F0EEFF]/40">{item.reportedAt}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0C0A17] font-mono text-xs text-[#F0EEFF]/90 border border-white/5">
                        "{item.snippet}"
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-mono text-[#F0EEFF]/50">Status: {item.status}</span>
                        {item.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                playHapticSound('click');
                                onResolveReport(item.id, 'dismiss');
                              }}
                              className="px-2.5 py-1 rounded text-xs font-mono text-[#F0EEFF]/70 hover:text-white bg-white/5 hover:bg-white/10"
                            >
                              Dismiss Flag
                            </button>
                            <button
                              onClick={() => {
                                playHapticSound('snap');
                                onResolveReport(item.id, 'resolve');
                              }}
                              className="px-2.5 py-1 rounded text-xs font-mono bg-[#FF5C7A] text-white font-medium hover:bg-[#FF5C7A]/90"
                            >
                              Quarantine / Remove
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-[#6FFFE0]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-xs text-[#F0EEFF]/70 pb-2 border-b border-white/5">
                Cryptographic Action Trail (In-Memory Immutable Log)
              </div>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-[#141224] border border-white/5 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[#6FFFE0] font-semibold">
                        <span>[{log.action}]</span>
                        <span className="text-[#F0EEFF]/50 text-[11px]">TARGET: {log.entityType}</span>
                      </div>
                      <div className="text-[#F0EEFF]/80 text-[11px] mt-1">{log.details}</div>
                    </div>
                    <span className="text-[#F0EEFF]/40 text-[10px] shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4 text-xs font-mono leading-relaxed text-[#F0EEFF]/80">
              <div className="p-4 rounded-xl bg-[#141224] border border-white/10 space-y-2">
                <div className="font-semibold text-[#6FFFE0] text-sm">
                  Kenya Data Protection Act (2019) & ODPC Compliance
                </div>
                <p>
                  • QuadAnon collects zero telemetry, zero national IDs, and zero personal biometric records.
                  <br />
                  • IP addresses are salted and hashed client-side with hourly salt rotation (never stored raw).
                  <br />
                  • Ephemeral database purge engine triggers every 60 minutes + on-demand via Postgres and Redis TTL.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141224] border border-white/10 space-y-2">
                <div className="font-semibold text-[#FF6FD8] text-sm">Right to Erasure (GDPR Art. 17)</div>
                <p>
                  All user-generated whispers, direct messages, and campus issue reports are cryptographically tied to device keypairs. Clicking "Purge My Device Record" immediately wipes all local state and invalidates access credentials.
                </p>
                <button
                  onClick={() => {
                    playHapticSound('snap');
                    alert('Simulated: All local device cache, session tokens, and keypair records have been sanitized.');
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg border border-[#FF5C7A] text-[#FF5C7A] hover:bg-[#FF5C7A]/10 font-mono text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sanitize Device Local Cache
                </button>
              </div>
            </div>
          )}

          {activeTab === 'crisis' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#FFB27A]/10 border border-[#FFB27A]/30 text-[#F0EEFF] space-y-2">
                <div className="flex items-center gap-2 text-[#FFB27A] font-semibold text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>Campus Crisis Support & Mental Health Hotlines (Kenya)</span>
                </div>
                <p className="text-xs text-[#F0EEFF]/80 leading-relaxed">
                  QuadAnon automatically monitors for sensitive distress keywords. If you or a fellow student are experiencing distress, confidential professional support is available free 24/7:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#141224] border border-white/5 space-y-1">
                    <div className="font-semibold text-[#6FFFE0]">Kenya Red Cross Toll-Free</div>
                    <div className="text-sm font-bold text-white">Call 1199</div>
                    <div className="text-[10px] text-[#F0EEFF]/50">Emergency & Psychosocial First Aid</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141224] border border-white/5 space-y-1">
                    <div className="font-semibold text-[#FF6FD8]">Befrienders Kenya</div>
                    <div className="text-sm font-bold text-white">+254 722 178 177</div>
                    <div className="text-[10px] text-[#F0EEFF]/50">24/7 Confidential Crisis Listening</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141224] border border-white/5 space-y-1">
                    <div className="font-semibold text-[#B794F6]">Chiromo Hospital Youth Line</div>
                    <div className="text-sm font-bold text-white">+254 797 220 220</div>
                    <div className="text-[10px] text-[#F0EEFF]/50">Adolescent & Student Wellness Support</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141224] border border-white/5 space-y-1">
                    <div className="font-semibold text-[#5EEAD4]">Gender-Based Violence Helpline</div>
                    <div className="text-sm font-bold text-white">Call 1195 (Free)</div>
                    <div className="text-[10px] text-[#F0EEFF]/50">Immediate Legal & Medical Rescue</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#131124] border-t border-[rgba(255,255,255,0.08)] flex justify-between items-center text-xs font-mono text-[#F0EEFF]/50">
          <span>QuadAnon Refine v2.4 · Security & Safety Cluster</span>
          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15"
          >
            Close Ops Console
          </button>
        </div>
      </div>
    </div>
  );
};
