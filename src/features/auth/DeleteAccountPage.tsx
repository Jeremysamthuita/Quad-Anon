import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    navigate('/create-profile', { replace: true });
    return null;
  }

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

  const handleDelete = async () => {
    setError(null);
    try {
      await signOut();
      navigate('/create-profile', { replace: true });
    } catch (deleteError) {
      console.error('Unable to end the current session.', deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not end the current session. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-md px-4 pb-10 pt-8">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Delete account</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Permanent account deletion is not available in this build. Signing out ends this session but does not remove your saved profile, handle, or avatar. Feed and message interactions are not stored on the server in this build.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
          <div className="font-semibold">A permanent deletion would need to remove:</div>
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

        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-full bg-[var(--danger)] px-4 py-3 text-sm font-semibold text-white"
          >
            Sign out
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
