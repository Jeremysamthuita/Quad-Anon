import React from 'react';

interface LoadingStateProps {
  label?: string;
  variant?: 'card' | 'list' | 'spinner';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading campus content...',
  variant = 'spinner',
}) => {
  if (variant === 'card') {
    return (
      <div role="status" aria-live="polite" className="space-y-4">
        <span className="sr-only">{label}</span>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-3xl water-glass-card border border-border-glass animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-surface-elevated" />
              <div className="space-y-1.5 flex-1">
                <div className="w-24 h-3 rounded bg-surface-elevated" />
                <div className="w-16 h-2 rounded bg-surface-elevated" />
              </div>
            </div>
            <div className="w-full h-12 rounded bg-surface-elevated" />
            <div className="w-32 h-6 rounded-full bg-surface-elevated" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-12 flex flex-col items-center justify-center text-center space-y-3"
    >
      <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-text-secondary">{label}</span>
    </div>
  );
};
