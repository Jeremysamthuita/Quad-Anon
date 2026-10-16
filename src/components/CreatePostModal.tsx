import React, { useState, useRef } from 'react';
import { EphemeralDuration, Post } from '../types';
import { X, Clock, Code2, BarChart2, MessageSquare, Send, Upload, FileText, Film, Image as ImageIcon, Trash2 } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (post: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'>) => void;
  currentUniversityId: number;
  currentUniversityName: string;
  authorHandle: string;
  authorAvatar: string;
}

const LIFESPANS: { id: EphemeralDuration; label: string; desc: string; ms: number }[] = [
  { id: 'snap', label: 'Snap', desc: 'Self-destructs after single read', ms: 1000 * 60 },
  { id: '1h', label: '1 Hour', desc: 'Fast drop, burns in 60 min', ms: 1000 * 3600 },
  { id: '24h', label: '24 Hours', desc: 'Daily campus rhythm', ms: 1000 * 3600 * 24 },
  { id: '3d', label: '3 Days', desc: 'Mid-term discussion window', ms: 1000 * 3600 * 72 },
  { id: '1w', label: '1 Week', desc: 'Default maximum retention', ms: 1000 * 3600 * 168 },
];

export const CreatePostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmitPost,
  currentUniversityId,
  currentUniversityName,
  authorHandle,
  authorAvatar,
}) => {
  const [content, setContent] = useState('');
  const [lifespan, setLifespan] = useState<EphemeralDuration>('1w');
  const [postType, setPostType] = useState<'text' | 'poll' | 'code' | 'upload'>('text');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Dedicated upload utility state
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeFormatted: string;
    type: 'document' | 'image' | 'video';
    previewUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playHapticSound('click');
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

    let fileType: 'document' | 'image' | 'video' = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';

    const previewUrl = URL.createObjectURL(file);

    setAttachedFile({
      name: file.name,
      sizeFormatted,
      type: fileType,
      previewUrl,
    });
  };

  const handleSimulatedPresetDoc = (name: string, type: 'document' | 'image' | 'video') => {
    playHapticSound('click');
    setAttachedFile({
      name,
      sizeFormatted: '2.4 MB',
      type,
      previewUrl: type === 'image' ? 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80' : undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !attachedFile) return;

    playHapticSound('send');

    const selectedLifespan = LIFESPANS.find((l) => l.id === lifespan) || LIFESPANS[4];
    const expiresAt = new Date(Date.now() + selectedLifespan.ms).toISOString();

    const postPayload: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'userReactions' | 'commentsCount' | 'comments'> = {
      authorId: `usr_${Date.now()}`,
      authorHandle,
      authorAvatar,
      universityId: currentUniversityId,
      universityName: currentUniversityName,
      contentText: content.trim() || `[Uploaded ${attachedFile?.type || 'attachment'}: ${attachedFile?.name}]`,
      ephemeralMode: lifespan,
      expiresAt,
    };

    if (postType === 'code' && codeSnippet.trim()) {
      postPayload.mediaType = 'code';
      postPayload.mediaUrl = codeSnippet.trim();
    } else if (postType === 'poll' && pollOptions.filter((o) => o.trim()).length >= 2) {
      postPayload.mediaType = 'poll';
      postPayload.pollOptions = pollOptions.filter((o) => o.trim()).map((o) => ({ label: o.trim(), votes: 0 }));
    } else if (attachedFile) {
      postPayload.mediaType = attachedFile.type;
      postPayload.mediaUrl = attachedFile.previewUrl || '';
      postPayload.fileName = attachedFile.name;
      postPayload.fileSizeFormatted = attachedFile.sizeFormatted;
    }

    onSubmitPost(postPayload);
    setContent('');
    setCodeSnippet('');
    setPollOptions(['', '']);
    setAttachedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0E1320] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#131929]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6FD8]" />
            <h2 className="text-base font-bold text-[#F0EEFF]">Broadcast to The Quad</h2>
            <span className="text-xs font-mono text-[#F0EEFF]/50">(@{authorHandle})</span>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1.5 rounded-xl text-[#F0EEFF]/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Post Type Selector */}
          <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('text');
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                postType === 'text'
                  ? 'bg-white/15 text-white border-white/40'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Text Whisper
            </button>

            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('upload');
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                postType === 'upload'
                  ? 'bg-[#6FFFE0]/15 text-[#6FFFE0] border-[#6FFFE0]'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File/Media
            </button>

            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('poll');
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                postType === 'poll'
                  ? 'bg-[#FF6FD8]/15 text-[#FF6FD8] border-[#FF6FD8]'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Poll
            </button>

            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setPostType('code');
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                postType === 'code'
                  ? 'bg-[#B794F6]/15 text-[#B794F6] border-[#B794F6]'
                  : 'bg-transparent text-[#F0EEFF]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code
            </button>
          </div>

          {/* Main Text Content */}
          <div>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening on campus? Spilling tea, sharing past papers, or discussing lectures..."
              className="w-full p-3.5 rounded-2xl bg-[#090D17] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] placeholder-[#F0EEFF]/35 text-xs font-mono outline-none focus:border-[#FF6FD8] resize-none"
            />
          </div>

          {/* Dedicated File & Media Upload Utility Component */}
          {postType === 'upload' && (
            <div className="space-y-3 p-4 rounded-2xl bg-[#090D17] border border-[#6FFFE0]/30">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6FFFE0] font-semibold flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Secure File & Media Upload Utility</span>
                </span>
                <span className="text-[10px] text-[#F0EEFF]/50">PDF, DOCX, PNG, MP4</span>
              </div>

              {attachedFile ? (
                <div className="p-3 rounded-xl bg-[#131929] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {attachedFile.type === 'document' ? (
                      <FileText className="w-5 h-5 text-[#6FFFE0] shrink-0" />
                    ) : attachedFile.type === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-[#FFB27A] shrink-0" />
                    ) : (
                      <Film className="w-5 h-5 text-[#FF6FD8] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-semibold text-[#F0EEFF] truncate">
                        {attachedFile.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#F0EEFF]/50">
                        {attachedFile.sizeFormatted} · Zero EXIF metadata
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 rounded-lg text-[#FF5C7A] hover:bg-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-xl border border-dashed border-white/20 hover:border-[#6FFFE0] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer text-center space-y-2 transition-all"
                >
                  <Upload className="w-8 h-8 text-[#6FFFE0] mx-auto animate-bounce" />
                  <div className="text-xs font-mono text-[#F0EEFF]">
                    Click to browse or drop document / media file
                  </div>
                  <div className="text-[10px] font-mono text-[#F0EEFF]/40">
                    Automatic zero-knowledge anonymization before broadcast
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.mp4"
                  />
                </div>
              )}

              {/* Quick Preset Attachments */}
              <div className="text-[11px] font-mono text-[#F0EEFF]/50 flex items-center gap-2 pt-1">
                <span>Quick attach:</span>
                <button
                  type="button"
                  onClick={() => handleSimulatedPresetDoc('CS201_Exam_Syllabus.pdf', 'document')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#6FFFE0] border border-white/5"
                >
                  + Exam PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatedPresetDoc('Campus_Courtyard_Snap.jpg', 'image')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[#FFB27A] border border-white/5"
                >
                  + Photo Snap
                </button>
              </div>
            </div>
          )}

          {/* Conditional: Poll Editor */}
          {postType === 'poll' && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#090D17] border border-white/10">
              <span className="text-xs font-mono font-semibold text-[#FF6FD8] block">Poll Choices</span>
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = e.target.value;
                    setPollOptions(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#05080E] border border-white/10 text-xs font-mono text-[#F0EEFF] focus:border-[#FF6FD8] outline-none"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-[11px] font-mono text-[#6FFFE0] hover:underline"
                >
                  + Add another choice
                </button>
              )}
            </div>
          )}

          {/* Conditional: Code Snippet Editor */}
          {postType === 'code' && (
            <div>
              <label className="text-xs font-mono text-[#B794F6] block mb-1">Code Snippet (Mono)</label>
              <textarea
                rows={3}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste code or formula here&#10;def dijkstra(graph, start):..."
                className="w-full p-2.5 rounded-2xl bg-[#05080E] border border-white/10 text-xs font-mono text-[#B794F6] outline-none focus:border-[#B794F6]"
              />
            </div>
          )}

          {/* Ghost Post Lifespan Selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-mono text-[#F0EEFF]">
              <Clock className="w-3.5 h-3.5 text-[#5EEAD4]" />
              <span className="font-semibold uppercase tracking-wider">Self-Destruct Lifespan</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {LIFESPANS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setLifespan(item.id);
                  }}
                  className={`py-2 px-1 rounded-xl border text-center transition-all font-mono text-xs ${
                    lifespan === item.id
                      ? 'bg-[#FF6FD8] text-[#0A0912] font-bold border-[#FF6FD8]'
                      : 'bg-[#090D17] border-white/10 text-[#F0EEFF]/70 hover:border-white/20'
                  }`}
                  title={item.desc}
                >
                  <div className="text-[11px]">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#F0EEFF]/50 truncate max-w-[200px]">
              {currentUniversityName}
            </span>

            <div className="flex items-center gap-2">
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
                className="px-5 py-2.5 rounded-full bg-[#FF6FD8] text-[#0A0912] font-bold text-xs font-mono flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-[#FF6FD8]/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Quad</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
