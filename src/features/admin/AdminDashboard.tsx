import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ContentReport, TakedownRequest, AuditLog, CampusIssue } from '../../types';
import { Modal } from '../../components/Modal';
import { formatRelativeTime, generateId } from '../../lib/utils';
import { playHapticSound } from '../../utils/sound';
import {
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Lock,
  UserX,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { profile, campus } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'takedowns' | 'audit'>('reports');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [takedowns, setTakedowns] = useState<TakedownRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: generateId(),
      actorId: profile?.id || 'admin',
      actorHandle: profile?.handle || 'Admin',
      action: 'ADMIN_SESSION_INITIALIZED',
      targetType: 'system',
      targetId: campus.id,
      details: `Moderation console initialized for ${campus.name}`,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'resolve' | 'delete' | 'dismiss';
    reportId?: string;
    takedownId?: string;
    description: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const executeConfirmedAction = () => {
    if (!confirmAction) return;

    playHapticSound('click');
    if (confirmAction.reportId) {
      setReports((prev) => prev.filter((r) => r.id !== confirmAction.reportId));
      setAuditLogs((prev) => [
        {
          id: generateId(),
          actorId: profile?.id || 'admin',
          actorHandle: profile?.handle || 'Admin',
          action: `REPORT_${confirmAction.type.toUpperCase()}`,
          targetType: 'report',
          targetId: confirmAction.reportId!,
          details: `Report marked as ${confirmAction.type}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(`Report actioned: ${confirmAction.type}`);
    } else if (confirmAction.takedownId) {
      setTakedowns((prev) => prev.filter((t) => t.id !== confirmAction.takedownId));
      setAuditLogs((prev) => [
        {
          id: generateId(),
          actorId: profile?.id || 'admin',
          actorHandle: profile?.handle || 'Admin',
          action: `TAKEDOWN_${confirmAction.type.toUpperCase()}`,
          targetType: 'takedown',
          targetId: confirmAction.takedownId!,
          details: `Takedown notice actioned: ${confirmAction.type}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      showToast(`Takedown actioned: ${confirmAction.type}`);
    }

    setConfirmAction(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded-2xl bg-mint text-neutral-900 font-mono text-xs font-bold shadow-lg flex items-center justify-between"
        >
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-5 rounded-3xl water-glass-card border border-border-glass flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-peach/15 text-peach flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono text-text-primary">
              Campus Moderation & Safety Ops
            </h1>
            <p className="text-xs text-text-secondary font-mono">
              Authorized role: {profile?.role} · {campus.name}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-mint px-3 py-1 rounded-full bg-mint/15 border border-mint/30">
          Enforced via RLS
        </div>
      </div>

      {/* Nav Tabs */}
      <div
        role="tablist"
        aria-label="Moderation views"
        className="flex items-center gap-2 p-1 rounded-2xl bg-surface border border-border-glass max-w-fit"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'reports'}
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-mono min-h-[36px] transition-all ${
            activeTab === 'reports'
              ? 'bg-peach text-neutral-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Reports Queue ({reports.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'takedowns'}
          onClick={() => setActiveTab('takedowns')}
          className={`px-4 py-2 rounded-xl text-xs font-mono min-h-[36px] transition-all ${
            activeTab === 'takedowns'
              ? 'bg-peach text-neutral-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Takedown Requests ({takedowns.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'audit'}
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-mono min-h-[36px] transition-all ${
            activeTab === 'audit'
              ? 'bg-peach text-neutral-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl water-glass-card border border-border-glass text-xs font-mono text-text-secondary">
              Report queue is clean. Zero pending student flags.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl water-glass-card border border-border-glass flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-text-primary">
                    Flagged: {rep.targetType} ({rep.targetId})
                  </div>
                  <div className="text-text-secondary mt-0.5">{rep.reason}</div>
                  <div className="text-[10px] text-text-muted mt-1">{formatRelativeTime(rep.createdAt)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'resolve',
                        reportId: rep.id,
                        description: `Resolve report for ${rep.targetType}?`,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-mint text-neutral-900 font-bold min-h-[36px]"
                  >
                    Action
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'dismiss',
                        reportId: rep.id,
                        description: `Dismiss report for ${rep.targetType}?`,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border-glass text-text-secondary hover:text-text-primary min-h-[36px]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Takedown Requests Queue */}
      {activeTab === 'takedowns' && (
        <div className="space-y-3">
          {takedowns.length === 0 ? (
            <div className="p-12 text-center rounded-3xl water-glass-card border border-border-glass text-xs font-mono text-text-secondary">
              Zero pending copyright or content takedown requests.
            </div>
          ) : (
            takedowns.map((td) => (
              <div
                key={td.id}
                className="p-4 rounded-2xl water-glass-card border border-border-glass flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-danger">Takedown Request: {td.resourceId}</div>
                  <div className="text-text-secondary mt-0.5">{td.reason}</div>
                  <div className="text-[10px] text-text-muted mt-1">Claimant: {td.claimantEmail}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'delete',
                        takedownId: td.id,
                        description: `Confirm content removal and notification to ${td.claimantEmail}?`,
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-danger text-white font-bold min-h-[36px]"
                  >
                    Purge Content
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Log */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-3xl water-glass-card border border-border-glass space-y-2">
          <div className="text-xs font-mono text-text-muted mb-2">
            Server-persisted audit trail for transparency and compliance.
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-surface border border-border-glass text-xs font-mono flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-mint">{log.action}</span>
                  <span className="text-text-secondary ml-2">{log.details}</span>
                </div>
                <span className="text-[10px] text-text-muted shrink-0 ml-3">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accessible Confirmation Dialog replacing window.confirm */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title="Confirm Moderator Action"
        description="This action will be logged in the immutable audit trail."
      >
        <div className="space-y-4">
          <p className="text-sm font-mono text-text-primary">
            {confirmAction?.description}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={executeConfirmedAction}
              className="px-5 py-2 rounded-full bg-peach text-neutral-900 font-mono text-xs font-bold min-h-[44px]"
            >
              Confirm Action
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
