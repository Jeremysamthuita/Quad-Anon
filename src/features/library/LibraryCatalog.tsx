import React, { useState } from 'react';
import { Resource, ResourceCategory } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { formatFileSize, generateId } from '../../lib/utils';
import { playHapticSound } from '../../utils/sound';
import {
  BookOpen,
  Search,
  Plus,
  Download,
  ThumbsUp,
  FileText,
  ShieldCheck,
  Check,
  Flag,
} from 'lucide-react';

const CATEGORIES: ResourceCategory[] = [
  'Past Papers',
  'Lecture Notes',
  'Lab Reports',
  'Revision Guides',
];

export const LibraryCatalog: React.FC = () => {
  const { profile, campus } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [takedownResource, setTakedownResource] = useState<Resource | null>(null);
  const [takedownReason, setTakedownReason] = useState('');
  const [takedownEmail, setTakedownEmail] = useState('');
  const [takedownSuccess, setTakedownSuccess] = useState(false);

  // Upload Form
  const [courseCode, setCourseCode] = useState('');
  const [faculty, setFaculty] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Lecture Notes');
  const [fileName, setFileName] = useState('');
  const [copyrightConsent, setCopyrightConsent] = useState(false);

  const filteredResources = resources.filter((res) => {
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.courseCode.toLowerCase().includes(q) ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextVoted = !r.hasVoted;
        return {
          ...r,
          hasVoted: nextVoted,
          votesCount: nextVoted ? r.votesCount + 1 : Math.max(0, r.votesCount - 1),
        };
      })
    );
  };

  const handleDownload = (res: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    playHapticSound('click');
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );
    const blob = new Blob(
      [`Educational Material: ${res.title}\nCourse: ${res.courseCode}\nUploaded for peer study.`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.courseCode}_${res.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !title.trim() || !copyrightConsent) return;

    playHapticSound('send');

    const newResource: Resource = {
      id: generateId(),
      universityId: campus.id,
      universityName: campus.name,
      uploaderId: profile?.id || 'anon',
      uploaderHandle: profile?.handle || 'CampusStudent',
      courseCode: courseCode.trim().toUpperCase(),
      faculty: faculty.trim() || 'General Studies',
      title: title.trim(),
      description: description.trim(),
      category,
      fileUrl: '',
      fileSizeBytes: 1024 * 512,
      mimeType: 'application/pdf',
      pageCount: 12,
      downloadCount: 0,
      votesCount: 1,
      hasVoted: true,
      isApproved: false,
      createdAt: new Date().toISOString(),
    };

    setResources([newResource, ...resources]);
    setCourseCode('');
    setFaculty('');
    setTitle('');
    setDescription('');
    setFileName('');
    setCopyrightConsent(false);
    setIsUploadOpen(false);
  };

  const handleTakedownSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!takedownEmail.trim() || !takedownReason.trim()) return;

    playHapticSound('click');
    setTakedownSuccess(true);
    setTimeout(() => {
      setTakedownSuccess(false);
      setTakedownResource(null);
      setTakedownReason('');
      setTakedownEmail('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Upload Bar */}
      <div className="p-4 rounded-3xl water-glass-card border border-border-glass space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code (e.g. COMP310), topic, or exam..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-canvas border border-border-glass text-text-primary text-xs font-mono outline-none focus:border-mint min-h-[44px]"
            />
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-mint text-neutral-900 font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Upload Material</span>
          </button>
        </div>

        {/* Category Filters */}
        <div
          role="tablist"
          aria-label="Filter resources by category"
          className="flex items-center gap-1.5 overflow-x-auto pt-1"
        >
          <button
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-mono min-h-[36px] transition-all ${
              selectedCategory === 'all'
                ? 'bg-mint text-neutral-900 font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Resources
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-mono min-h-[36px] transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-mint text-neutral-900 font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Catalog Grid: 4 per row on large, 2 on small screens */}
      {filteredResources.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" aria-hidden="true" />}
          title="No academic resources found"
          description="Be the first to share verified past papers, revision notes, or lab guidelines for your fellow campus students."
          actionLabel="Upload Academic Material"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredResources.map((res) => (
            <article
              key={res.id}
              onClick={() => setPreviewResource(res)}
              className="group p-3 sm:p-4 rounded-3xl water-glass-card border border-border-glass flex flex-col justify-between space-y-3 cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              {/* Document Thumbnail Card */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-elevated border border-border-glass p-3 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span className="px-1.5 py-0.5 rounded bg-canvas border border-border-glass font-bold text-mint">
                    {res.category}
                  </span>
                  <span>{formatFileSize(res.fileSizeBytes)}</span>
                </div>

                <div className="text-center my-auto">
                  <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-text-primary">
                    {res.courseCode}
                  </div>
                  <div className="text-[10px] font-mono text-text-secondary truncate mt-0.5">
                    {res.faculty}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>{res.pageCount} pages</span>
                  {res.isApproved && (
                    <span className="text-mint flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                      <span>Approved</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Metadata (Full Course Code & Campus Short Code) */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-mint font-bold">
                  <span>{res.courseCode}</span>
                  <span className="text-text-muted font-normal">· {campus.shortCode}</span>
                </div>
                <h2 className="text-xs sm:text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
                  {res.title}
                </h2>
              </div>

              {/* Action Buttons: Preview + Download + Takedown */}
              <div className="pt-2 border-t border-border-glass flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={(e) => handleVote(res.id, e)}
                  aria-label={`Upvote resource (${res.votesCount} upvotes)`}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-mono border min-h-[36px] transition-colors ${
                    res.hasVoted
                      ? 'bg-mint text-neutral-900 border-mint font-bold'
                      : 'border-border-glass text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" aria-hidden="true" />
                  <span>{res.votesCount}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewResource(res);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-surface border border-border-glass hover:bg-surface-elevated text-text-primary text-[10px] font-mono min-h-[36px]"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownload(res, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-mint text-neutral-900 font-mono font-bold text-[10px] min-h-[36px]"
                  >
                    <Download className="w-3 h-3" aria-hidden="true" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Upload Modal with Explicit Allowed Content & Copyright Guidance */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Academic Resource"
        description="Share student notes, past papers, or revision guides with your campus."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="p-3 rounded-2xl bg-canvas border border-border-glass space-y-1.5 text-xs font-mono text-text-secondary">
            <div className="flex items-center gap-1.5 text-mint font-bold">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Allowed Content Policy</span>
            </div>
            <p>
              Allowed: Lecture summaries, student notes, revision guides, and past exam question
              papers where permitted by your institution.
            </p>
            <p className="text-danger">
              Strictly Prohibited: Real upcoming exam leaks, unauthorized commercial textbooks,
              personal student records, or plagiarized submissions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-mono font-bold text-text-primary mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. COMP310"
                className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-mint"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-text-primary mb-1">
                Faculty / Department
              </label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-mint"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Resource Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Comprehensive Revision Guide (2025)"
              className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-mint"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-mono font-bold text-text-primary mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-mint"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text-primary mb-1">
                Attach File (PDF, DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.pptx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFileName(f.name);
                }}
                className="w-full p-2 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none"
              />
              {fileName && (
                <p className="text-[10px] text-mint font-mono mt-1 truncate">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Copyright affirmation checkbox */}
          <label className="flex items-start gap-2 text-xs font-mono text-text-secondary cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={copyrightConsent}
              onChange={(e) => setCopyrightConsent(e.target.checked)}
              className="mt-0.5 rounded border-border-glass"
              required
            />
            <span>
              I confirm this material complies with campus copyright policies and contains no
              unauthorized commercial textbook content or leaked exams.
            </span>
          </label>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!copyrightConsent}
              className="px-5 py-2 rounded-full bg-mint text-neutral-900 font-mono text-xs font-bold disabled:opacity-40 min-h-[44px]"
            >
              Publish Resource
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
        title={
          previewResource
            ? `${previewResource.courseCode} — ${previewResource.title}`
            : 'Document Preview'
        }
        description={`Shared on ${campus.shortCode} · ${previewResource?.category}`}
        maxWidth="lg"
      >
        {previewResource && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-canvas border border-border-glass text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span>Course: {previewResource.courseCode}</span>
                <span>Faculty: {previewResource.faculty}</span>
              </div>
              <p className="text-text-secondary">
                {previewResource.description || 'No additional summary provided.'}
              </p>
            </div>

            {/* Sandboxed document preview frame */}
            <div className="h-64 rounded-2xl bg-surface-elevated border border-border-glass p-6 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="w-10 h-10 text-mint" aria-hidden="true" />
              <div className="text-xs font-mono font-bold text-text-primary">
                {previewResource.title}
              </div>
              <p className="text-[11px] font-mono text-text-muted">
                Sandboxed document reader · {previewResource.pageCount} pages available for offline
                download.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setTakedownResource(previewResource);
                  setPreviewResource(null);
                }}
                className="text-xs font-mono text-danger hover:underline flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Submit Copyright Takedown Request</span>
              </button>

              <button
                onClick={(e) => handleDownload(previewResource, e)}
                className="px-5 py-2 rounded-full bg-mint text-neutral-900 font-mono text-xs font-bold min-h-[44px] flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Takedown Request Modal */}
      <Modal
        isOpen={!!takedownResource}
        onClose={() => setTakedownResource(null)}
        title="Copyright Takedown Request"
        description="Notify campus moderators to review and remove infringing content."
      >
        {takedownSuccess ? (
          <div className="p-6 text-center space-y-2 text-xs font-mono text-mint">
            <Check className="w-8 h-8 mx-auto" aria-hidden="true" />
            <p className="font-bold">Takedown notice submitted.</p>
            <p className="text-text-secondary">
              Moderators have received your notice and will action it promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTakedownSubmit} className="space-y-4">
            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              If you are the copyright holder or authorized representative and believe this material
              was uploaded without permission, submit your notice below.
            </p>

            <div>
              <label className="block text-xs font-mono font-bold text-text-primary mb-1">
                Your Contact Email
              </label>
              <input
                type="email"
                value={takedownEmail}
                onChange={(e) => setTakedownEmail(e.target.value)}
                placeholder="copyright@yourinstitution.ac.ke"
                className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-danger"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-text-primary mb-1">
                Reason & Proof of Rights
              </label>
              <textarea
                rows={3}
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder="Explain why this content infringes your rights or contains unauthorized assessment material."
                className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-danger"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTakedownResource(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-danger text-white font-mono text-xs font-bold min-h-[44px]"
              >
                Submit Takedown
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
