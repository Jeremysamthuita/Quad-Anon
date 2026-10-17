import React from 'react';
import { ShieldCheck, Eye, EyeOff, Trash2 } from 'lucide-react';

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
          This page explains what profile data is currently stored and which features are still
          demos.
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
                <strong>Your selected institution:</strong> Your profile is associated with the
                institution you selected during setup.
              </li>
              <li>
                <strong>Your profile:</strong> Your handle, selected institution, and avatar are
                saved to your anonymous account.
              </li>
              <li>
                <strong>Campus activity:</strong> The feed and reporting screens are demo
                interactions and are not yet connected to shared database content.
              </li>
              <li>
                <strong>Abuse reports:</strong> The report review flow is not yet connected to a
                server-side moderation queue.
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
                <strong>Email addresses on your profile:</strong> Anonymous sign-in does not ask
                for an email address, and your pseudonymous profile does not display one.
              </li>
              <li>
                <strong>Real student names or phone numbers:</strong> Profiles contain only handles
                and avatar styles, plus the selected institution and account metadata.
              </li>
              <li>
                <strong>Server-side message deletion:</strong> The current messaging UI keeps demo
                messages in memory only and does not claim to delete server-stored messages.
              </li>
              <li>
                <strong>Third-party tracker profiles:</strong> We do not sell data or inject
                advertising tracker scripts.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-canvas border border-border-glass space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-text-primary">
            <Trash2 className="w-4 h-4 text-danger" aria-hidden="true" />
            <span>Expiration Support</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            The database schema includes expiration fields and cleanup jobs for connected content.
            The current feed and messaging interactions are demos, so do not treat their timers as
            a guarantee that server data has been deleted.
          </p>
        </div>
      </div>
    </div>
  );
};
