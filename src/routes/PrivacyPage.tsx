import React from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Server, Trash2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl water-glass-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mint/15 text-mint flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
              What We Can and Cannot See
            </h1>
            <p className="text-xs sm:text-sm font-mono text-text-secondary">
              QuadAnon Pseudonymity & Data Architecture Transparency
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          QuadAnon is a <strong>pseudonymous</strong> campus network, not an untraceable network.
          We believe in complete transparency about what data our system handles, what we can inspect, and what is deleted automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* What We Can See */}
          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-glass space-y-3">
            <div className="flex items-center gap-2 text-peach font-mono text-sm font-bold">
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span>What We CAN See</span>
            </div>
            <ul className="text-xs sm:text-sm text-text-secondary space-y-2 list-disc pl-4">
              <li>
                <strong>Your verified university campus:</strong> We know which campus network you belong to based on student email verification.
              </li>
              <li>
                <strong>Your pseudonymous handle:</strong> Posts, whispers, and messages are tied to your pseudonymous profile ID.
              </li>
              <li>
                <strong>Public campus activity:</strong> Content you broadcast publicly to Whispers, The Quad, and The Radar is visible to your campus peers.
              </li>
              <li>
                <strong>Abuse reports:</strong> When content is flagged by peers, moderators review the reported snippet.
              </li>
            </ul>
          </div>

          {/* What We Cannot See */}
          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-glass space-y-3">
            <div className="flex items-center gap-2 text-mint font-mono text-sm font-bold">
              <EyeOff className="w-4 h-4" aria-hidden="true" />
              <span>What We CANNOT See</span>
            </div>
            <ul className="text-xs sm:text-sm text-text-secondary space-y-2 list-disc pl-4">
              <li>
                <strong>Plaintext email addresses on content:</strong> We do not store plaintext emails in content tables. We store only a keyed cryptographic hash to prevent duplicate accounts.
              </li>
              <li>
                <strong>Real student names or phone numbers:</strong> Profiles contain only handles and avatar styles.
              </li>
              <li>
                <strong>Expired messages and media:</strong> Once an ephemeral timer expires, the row and its stored file are deleted from our database and storage.
              </li>
              <li>
                <strong>Third-party tracker profiles:</strong> We do not sell data or inject advertising tracker scripts.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-canvas border border-border-glass space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-primary">
            <Trash2 className="w-4 h-4 text-danger" aria-hidden="true" />
            <span>Server-Side Expiration Guarantee</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Content marked with a lifespan (view once, 1 hour, 24 hours, or 1 week) is deleted by our server-side database cleanup jobs. Expired items are filtered by database Row Level Security policies and cannot be read after their timer lapses.
          </p>
        </div>
      </div>
    </div>
  );
};
