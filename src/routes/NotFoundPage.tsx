import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-surface border border-border-glass flex items-center justify-center text-peach shadow-lg">
        <Compass className="w-8 h-8" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold font-mono text-text-primary">404 — Page Not Found</h1>
      <p className="text-sm text-text-secondary max-w-sm">
        This campus path does not exist, or the link has expired and was removed.
      </p>
      <Link
        to="/whispers"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-peach text-neutral-900 font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        <span>Return to Whispers</span>
      </Link>
    </div>
  );
};
