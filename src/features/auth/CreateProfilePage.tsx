import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LAUNCH_CAMPUS } from './AuthContext';
import { AVATAR_STICKER_LIBRARY } from '../../data/avatarLibrary';
import { AvatarMask } from '../../components/AvatarMask';

const reservedWords = ['admin', 'moderator', 'support', 'staff'];
const profanity = ['badword', 'spam'];
const suggestions = ['ghostlight', 'quietlane', 'skyline', 'midnight_loop', 'violet_glow'];

const generateHandle = () => {
  const prefix = suggestions[Math.floor(Math.random() * suggestions.length)];
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${prefix}${suffix}`;
};

export const CreateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { setProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [institution, setInstitution] = useState(LAUNCH_CAMPUS);
  const [customInstitution, setCustomInstitution] = useState('');
  const [handle, setHandle] = useState('');
  const [avatarId, setAvatarId] = useState('phantom_ghostling');
  const [handleMessage, setHandleMessage] = useState('');

  const institutions = useMemo(() => [LAUNCH_CAMPUS], []);

  const filtered = institutions.filter((entry) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.county.toLowerCase().includes(query) ||
      entry.shortCode.toLowerCase().includes(query)
    );
  });

  const evaluateHandle = (value: string) => {
    const clean = value.trim();
    const normalized = clean.replace(/^@/, '');
    if (!normalized) return 'Choose a handle to continue.';
    if (normalized.length < 3 || normalized.length > 20) {
      return 'Handles must be 3 to 20 characters long.';
    }
    if (!/^[A-Za-z0-9_]+$/.test(normalized)) {
      return 'Use letters, numbers and underscores only.';
    }
    if (reservedWords.some((word) => normalized.toLowerCase().includes(word))) {
      return 'That handle is reserved for staff or moderation roles.';
    }
    if (profanity.includes(normalized.toLowerCase())) {
      return 'That handle is not allowed.';
    }
    return `@${normalized} is available at ${institution.name}`;
  };

  const handleInputChange = (value: string) => {
    setHandle(value);
    setHandleMessage(evaluateHandle(value));
  };

  const handleAddInstitution = () => {
    const value = customInstitution.trim();
    if (!value) return;
    setInstitution({
      id: `pending-${value.toLowerCase().replace(/\s+/g, '-')}`,
      name: value,
      shortCode: value.slice(0, 4).toUpperCase(),
      county: 'Pending review',
      allowedEmailDomains: [],
      isActive: true,
    });
    setSearch('');
    setCustomInstitution('');
    setStep(1);
  };

  const submitProfile = () => {
    const normalizedHandle = handle.trim().replace(/^@/, '');
    const message = evaluateHandle(normalizedHandle);
    if (message.startsWith('Choose') || message.includes('must be') || message.includes('Use letters') || message.includes('reserved') || message.includes('not allowed')) {
      setHandleMessage(message);
      return;
    }

    setProfile({
      id: crypto.randomUUID(),
      universityId: institution.id,
      handle: normalizedHandle,
      avatarStyle: avatarId,
      role: 'student',
      createdAt: new Date().toISOString(),
      bannedAt: null,
    });
    navigate('/whispers', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-8">
        {step === 1 ? (
          <>
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Step 1 of 2
              </p>
              <h1 className="mt-3 text-3xl font-extrabold text-[var(--text)]">Choose your institution</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Only your institution is shown. Never your name or email.</p>
            </div>

            <label className="mb-4 block">
              <span className="sr-only">Search institutions</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your institution"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
              />
            </label>

            <div className="space-y-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              {filtered.length === 0 && (
                <div className="px-4 py-3 text-sm text-[var(--muted)]">No matches yet.</div>
              )}
              {filtered.map((entry) => {
                const selected = institution.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setInstitution(entry)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${selected ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--surface-2)]'}`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{entry.name}</div>
                      <div className={`text-[11px] ${selected ? 'text-violet-100' : 'text-[var(--muted)]'}`}>
                        {entry.county}
                      </div>
                    </div>
                    {selected && <span className="text-xs font-semibold">Selected</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <label className="text-sm font-medium text-[var(--text)]">Can't find yours?</label>
              <div className="mt-3 flex gap-2">
                <input
                  value={customInstitution}
                  onChange={(event) => setCustomInstitution(event.target.value)}
                  placeholder="Type your institution's name"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={handleAddInstitution}
                  className="rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-sm font-semibold text-[var(--text)]"
                >
                  Add institution
                </button>
              </div>
              <p className="mt-3 text-[11px] text-[var(--muted)]">
                New institutions are checked before other students can see them.
              </p>
            </div>

            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Step 2 of 2
              </p>
              <h1 className="mt-3 text-3xl font-extrabold text-[var(--text)]">Pick a handle and avatar</h1>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="handle" className="text-sm font-medium text-[var(--text)]">
                  Handle
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = generateHandle();
                    setHandle(next);
                    setHandleMessage(evaluateHandle(next));
                  }}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-semibold text-[var(--accent)]"
                >
                  Suggest
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
                <span className="text-[var(--muted)]">@</span>
                <input
                  id="handle"
                  value={handle}
                  onChange={(event) => handleInputChange(event.target.value)}
                  className="w-full bg-transparent text-sm text-[var(--text)] outline-none"
                  placeholder="your_handle"
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {handleMessage || 'Your handle is unique within your institution.'}
              </p>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text)]">Avatar</h2>
                <span className="text-[11px] text-[var(--muted)]">8 presets</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_STICKER_LIBRARY.map((sticker) => {
                  const selected = avatarId === sticker.id;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => setAvatarId(sticker.id)}
                      className={`rounded-2xl border p-2 text-center transition ${selected ? 'border-[var(--accent)] bg-[var(--surface-2)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}
                    >
                      <AvatarMask
                        avatarStyle={sticker.id}
                        size={44}
                        className={`mx-auto ${selected ? 'ring-[3px] ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface)]' : ''}`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[11px] text-[var(--muted)]">
                Upload your own (PNG, under 100 KB)
              </div>
              <p className="mt-3 text-[11px] text-[var(--muted)]">
                Use an illustration, not a photo of yourself. Photos can reveal who you are.
              </p>
            </div>

            <div className="mt-auto pt-6">
              <p className="mb-4 text-center text-[11px] text-[var(--muted)]">
                No email or real name is saved on your profile.
              </p>
              <button
                type="button"
                onClick={submitProfile}
                className="w-full rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white"
              >
                Create profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
