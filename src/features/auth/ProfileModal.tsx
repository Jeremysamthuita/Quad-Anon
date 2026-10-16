import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Modal } from '../../components/Modal';
import { AVATAR_STICKER_LIBRARY } from '../../data/avatarLibrary';
import { playHapticSound } from '../../utils/sound';
import { User, Sparkles, Download, Trash2, Building2 } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { profile, campus, activeModal, closeModal, setProfile, signOut } = useAuth();
  const [handleInput, setHandleInput] = useState(profile?.handle || 'CampusStudent');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatarStyle || 'phantom_ghostling');

  if (activeModal !== 'profile' || !profile) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playHapticSound('click');
    setProfile({
      ...profile,
      handle: handleInput.trim().replace(/^@/, '') || 'CampusStudent',
      avatarStyle: selectedAvatar,
    });
    closeModal();
  };

  const handleDownloadData = () => {
    playHapticSound('click');
    const data = {
      profile,
      campus,
      exportedAt: new Date().toISOString(),
      notice: 'Pseudonymous QuadAnon student data export.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quadanon_export_${profile.handle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Delete pseudonymous account and all associated content? This is irreversible.')) {
      signOut();
      closeModal();
    }
  };

  return (
    <Modal
      isOpen={activeModal === 'profile'}
      onClose={closeModal}
      title="Pseudonymous Student Profile"
      description={`Verified with ${campus.shortCode} email domain.`}
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Campus Badge */}
        <div className="p-3 rounded-2xl bg-canvas border border-border-glass flex items-center gap-3 text-xs font-mono">
          <Building2 className="w-5 h-5 text-mint" aria-hidden="true" />
          <div>
            <div className="font-bold text-text-primary">{campus.name}</div>
            <div className="text-[10px] text-text-secondary">{campus.county} Campus Network</div>
          </div>
        </div>

        {/* Handle */}
        <div>
          <label className="block text-xs font-mono font-bold text-text-primary mb-1">
            Pseudonymous Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted">
              @
            </span>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-mint"
              required
            />
          </div>
        </div>

        {/* Avatar Stickers */}
        <div>
          <label className="block text-xs font-mono font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-peach" aria-hidden="true" />
            <span>Select Chibi Sticker Avatar</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_STICKER_LIBRARY.map((sticker) => {
              const isSelected = selectedAvatar === sticker.id;
              return (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setSelectedAvatar(sticker.id);
                  }}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    isSelected
                      ? 'bg-white/15 border-mint shadow-md scale-105'
                      : 'bg-canvas border-border-glass hover:border-text-muted'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-label={sticker.name}>
                    {sticker.emoji}
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary truncate w-full">
                    {sticker.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Rights: Download Data & Account Deletion */}
        <div className="pt-2 border-t border-border-glass flex items-center justify-between">
          <button
            type="button"
            onClick={handleDownloadData}
            className="text-xs font-mono text-text-secondary hover:text-text-primary flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download My Data</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="text-xs font-mono text-danger hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Delete Account</span>
          </button>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-mint text-neutral-900 font-mono text-xs font-bold min-h-[44px]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
