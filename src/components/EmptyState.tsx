import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl water-glass-card flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border-glass flex items-center justify-center text-text-secondary shadow-sm">
        {icon}
      </div>
      <h3 className="text-base font-bold font-mono text-text-primary">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-full bg-peach text-neutral-900 font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
