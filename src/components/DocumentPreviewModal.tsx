import React, { useState } from 'react';
import { Resource } from '../types';
import { X, Download, ThumbsUp, CheckCircle2, ShieldCheck, FileText, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  resource: Resource | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<Props> = ({ resource, onClose, onUpvote }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!resource) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.samplePreview);
    setCopied(true);
    playHapticSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playHapticSound('click');
    setDownloadSuccess(true);
    // Trigger simulated download blob
    const element = document.createElement('a');
    const file = new Blob([resource.samplePreview], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${resource.courseCode}_${resource.title.slice(0, 30).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F0D1C] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#141224]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#6FFFE0]/10 border border-[#6FFFE0]/30 flex items-center justify-center text-[#6FFFE0] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#6FFFE0] px-1.5 py-0.5 rounded bg-[#6FFFE0]/10 border border-[#6FFFE0]/20">
                  {resource.courseCode}
                </span>
                <span className="text-xs text-[#F0EEFF]/60 font-mono">
                  {resource.category}
                </span>
                {resource.isVerifiedContributor && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#5EEAD4]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold text-[#F0EEFF] truncate mt-0.5" title={resource.title}>
                {resource.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#F0EEFF]/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close document preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-[#17152B] border-b border-[rgba(255,255,255,0.06)] text-xs text-[#F0EEFF]/70 font-mono">
          <div className="flex items-center gap-3">
            <span>By @{resource.uploaderHandle}</span>
            <span>·</span>
            <span>{resource.universityName}</span>
            <span>·</span>
            <span>{resource.fileSizeFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playHapticSound('vote');
                onUpvote(resource.id);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-colors ${
                resource.hasUpvoted
                  ? 'bg-[#6FFFE0]/15 text-[#6FFFE0] border-[#6FFFE0]'
                  : 'bg-white/5 border-[rgba(255,255,255,0.12)] hover:border-white/30 text-[#F0EEFF]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{resource.upvotesCount} Upvotes</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[rgba(255,255,255,0.12)] bg-white/5 hover:bg-white/10 text-xs font-mono text-[#F0EEFF]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#6FFFE0]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF6FD8] text-[#0A0912] font-semibold text-xs transition-transform active:scale-95"
            >
              {downloadSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Resource'}</span>
            </button>
          </div>
        </div>

        {/* Document Body Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0A14] flex flex-col items-center">
          <div className="w-full max-w-2xl bg-[#121020] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 shadow-lg min-h-[380px] flex flex-col justify-between">
            {/* Paper Header Simulation */}
            <div>
              <div className="border-b border-[rgba(255,255,255,0.1)] pb-3 mb-4 flex items-center justify-between text-xs text-[#F0EEFF]/50 font-mono">
                <span>ACADEMIC ARCHIVE REPO // {resource.faculty}</span>
                <span>SHA-256: 9b24...fc10</span>
              </div>

              <div className="text-sm text-[#F0EEFF]/90 font-mono leading-relaxed whitespace-pre-wrap bg-[#17152B]/60 p-4 rounded-lg border border-[rgba(255,255,255,0.06)]">
                {resource.samplePreview}
              </div>

              {resource.description && (
                <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs text-[#F0EEFF]/70">
                  <span className="font-semibold text-[#F0EEFF] block mb-1">Uploader Summary:</span>
                  {resource.description}
                </div>
              )}
            </div>

            {/* Simulated Page Navigation */}
            <div className="mt-6 pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs font-mono text-[#F0EEFF]/60">
              <div className="flex items-center gap-1">
                {resource.tags.map((tag) => (
                  <span key={tag} className="text-[#B794F6] text-[11px] mr-1">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {currentPage} of {resource.pageCount}
                </span>
                <button
                  disabled={currentPage >= resource.pageCount}
                  onClick={() => setCurrentPage((p) => Math.min(resource.pageCount, p + 1))}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-2.5 bg-[#121020] border-t border-[rgba(255,255,255,0.08)] text-[11px] text-[#F0EEFF]/50 flex items-center justify-between font-mono">
          <span>Zero-friction sharing: All academic papers verified for educational fair use.</span>
          <span className="text-[#6FFFE0]">Total Downloads: {resource.downloadsCount}</span>
        </div>
      </div>
    </div>
  );
};
