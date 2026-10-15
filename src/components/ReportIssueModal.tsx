import React, { useState } from 'react';
import { CampusIssue, IssueCategory } from '../types';
import { X, ShieldAlert, Shield, Radio, Check } from 'lucide-react';
import { playHapticSound } from '../utils/sound';
import { computeMomentumScore } from '../data/initialData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIssue: (issue: Omit<CampusIssue, 'id' | 'createdAt' | 'hoursElapsed' | 'momentumScore' | 'upvotesCount' | 'commentsCount' | 'hasUpvoted'>) => void;
  currentUniversityId: number;
  currentUniversityName: string;
  authorHandle: string;
}

const CATEGORIES: IssueCategory[] = ['Facilities', 'Academics', 'Security', 'Administration'];

export const ReportIssueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmitIssue,
  currentUniversityId,
  currentUniversityName,
  authorHandle,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Facilities');
  const [isDeepAnon, setIsDeepAnon] = useState(false);

  if (!isOpen) return null;

  // Generate deterministic-looking HMAC pseudonym
  const deepAnonId = `DeepAnon-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    playHapticSound('snap');

    onSubmitIssue({
      authorId: `usr_${Date.now()}`,
      authorHandle: isDeepAnon ? deepAnonId : authorHandle,
      isDeepAnon,
      deepAnonPseudonym: isDeepAnon ? deepAnonId : undefined,
      universityId: currentUniversityId,
      universityName: currentUniversityName,
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'open',
    });

    setTitle('');
    setDescription('');
    setIsDeepAnon(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0F0D1E] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#141226]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFB27A]/10 text-[#FFB27A] border border-[#FFB27A]/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F0EEFF]">Broadcast to The Radar</h2>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">Public Campus Issue Analytics Engine</p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1 rounded text-[#F0EEFF]/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Dual Reporting Mode Selector */}
          <div className="p-3.5 rounded-xl bg-[#141224] border border-white/10 space-y-2">
            <div className="text-xs font-mono font-semibold text-[#F0EEFF] uppercase tracking-wider">
              Anonymity Protocol
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playHapticSound('click');
                  setIsDeepAnon(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !isDeepAnon
                    ? 'bg-white/10 border-white/30 text-white shadow-sm'
                    : 'bg-transparent border-white/5 text-[#F0EEFF]/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                  <span>Standard Anonymous</span>
                </div>
                <div className="text-[11px] font-mono text-[#F0EEFF]/60 mt-1">
                  Posted as @{authorHandle}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playHapticSound('snap');
                  setIsDeepAnon(true);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isDeepAnon
                    ? 'bg-[#B794F6]/15 border-[#B794F6] text-[#B794F6] shadow-sm'
                    : 'bg-transparent border-white/5 text-[#F0EEFF]/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Deep Anonymous Mode</span>
                </div>
                <div className="text-[11px] font-mono text-[#F0EEFF]/60 mt-1">
                  HMAC per-issue mask ({deepAnonId})
                </div>
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-mono font-semibold text-[#F0EEFF] block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setCategory(cat);
                  }}
                  className={`py-2 px-2 rounded-lg border text-xs font-mono transition-all text-center ${
                    category === cat
                      ? 'bg-[#FFB27A] text-[#0A0912] font-semibold border-[#FFB27A]'
                      : 'bg-[#16142A] border-white/10 text-[#F0EEFF]/70 hover:border-white/20'
                  }`}
                >
                  #{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Title */}
          <div>
            <label className="text-xs font-mono font-semibold text-[#F0EEFF] block mb-1">
              Issue Headline *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Science Complex Wi-Fi Down for 48h During Exam Week"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-sm focus:border-[#FFB27A] outline-none"
            />
          </div>

          {/* Issue Description */}
          <div>
            <label className="text-xs font-mono font-semibold text-[#F0EEFF] block mb-1">
              Detailed Complaint & Evidence *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact building, room numbers, duration, and attempts to report to campus administration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] placeholder-[#F0EEFF]/35 text-sm focus:border-[#FFB27A] outline-none resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#121020] border border-white/5 text-[11px] font-mono text-[#F0EEFF]/60 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FFB27A] shrink-0" />
            <span>
              Once reported, the automated momentum formula will track upvotes and comments to escalate to campus administration.
            </span>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono text-[#F0EEFF]/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FFB27A] text-[#0A0912] font-semibold text-xs font-mono transition-transform active:scale-95"
            >
              Submit Public Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
