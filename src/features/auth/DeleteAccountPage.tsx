import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();
  const [confirm, setConfirm] = useState('');

  if (!profile) {
    navigate('/create-profile', { replace: true });
    return null;
  }

  const disabled = confirm !== 'DELETE';

  const handleDownload = () => {
    const data = { profile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'quadanon-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (disabled) return;
    setProfile(null);
    navigate('/create-profile', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-md px-4 pb-10 pt-8">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Delete account</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          This can't be undone. To use QuadAnon again you'll create a new profile from scratch, and your old handle may be taken by someone else.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
          <div className="font-semibold">This will be removed:</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>Profile, handle and avatar</li>
            <li>Posts, comments and reactions</li>
            <li>Shadow DM conversations</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="mt-6 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
        >
          Download my data first
        </button>

        <label className="mt-6 block text-sm font-medium text-[var(--text)]">
          Type DELETE to confirm
        </label>
        <input
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          placeholder="DELETE"
        />

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled}
            className="w-full rounded-full bg-[var(--danger)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete my account
          </button>
          <button
            type="button"
            onClick={() => navigate('/whispers', { replace: true })}
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
          >
            Keep my account
          </button>
        </div>
      </div>
    </div>
  );
};
