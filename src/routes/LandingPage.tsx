import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppIcon } from '../components/icons';
import { useAuth } from '../features/auth/AuthContext';
import { playHapticSound } from '../utils/sound';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const enter = () => {
    playHapticSound('click');
    navigate(profile ? '/whispers' : '/create-profile', { replace: true });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 text-text-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(183,148,246,0.20), transparent 50%),' +
            'radial-gradient(circle at 80% 70%, rgba(255,111,216,0.16), transparent 45%),' +
            'radial-gradient(circle at 50% 100%, rgba(111,255,224,0.12), transparent 50%)',
        }}
      />

      <section className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] water-glass-card">
          <AppIcon size={44} />
        </div>

        <p className="mt-8 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
          QuadAnon
        </p>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-text-primary sm:text-4xl">
          Your campus,{' '}
          <span className="bg-gradient-to-r from-bubblegum via-lavender to-mint bg-clip-text text-transparent">
            unfiltered.
          </span>
        </h1>

        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Anonymous discussions, shared notes, real campus issues, disappearing
          DMs. Zero email. Zero judgement.
        </p>

        <button
          type="button"
          onClick={enter}
          className="mt-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #FF6FD8 0%, #B794F6 100%)',
            boxShadow: '0 8px 32px rgba(255,111,216,0.4)',
          }}
        >
          Enter the Quad →
        </button>

        <p className="mt-6 font-mono text-[10px] text-text-muted">
          Pseudonymous · Not traceable · Not linked to your email
        </p>
      </section>
    </main>
  );
}