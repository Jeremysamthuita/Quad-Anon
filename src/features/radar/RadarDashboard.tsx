import React, { useState } from 'react';
import { CampusIssue, IssueCategory, IssueStatus } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { formatRelativeTime, generateId } from '../../lib/utils';
import { playHapticSound } from '../../utils/sound';
import {
  Radio,
  Plus,
  ThumbsUp,
  Clock,
  CheckCircle,
  HelpCircle,
  Building2,
  AlertCircle,
  Info,
} from 'lucide-react';

const CATEGORIES: IssueCategory[] = [
  'Facilities',
  'Academics',
  'Finance',
  'Security',
  'Administration',
];

export const RadarDashboard: React.FC = () => {
  const { profile, campus } = useAuth();
  const [issues, setIssues] = useState<CampusIssue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Facilities');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const filteredIssues = issues.filter((iss) => {
    if (selectedCategory !== 'all' && iss.category !== selectedCategory) return false;
    return true;
  });

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'resolved').length;
  const underReviewIssues = issues.filter((i) => i.status === 'under_review').length;
  const openIssues = issues.filter((i) => i.status === 'open').length;
  const resolutionPercentage = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  const handleToggleUpvote = (issueId: string) => {
    playHapticSound('vote');
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const nextUpvoted = !iss.hasUpvoted;
        return {
          ...iss,
          hasUpvoted: nextUpvoted,
          upvotesCount: nextUpvoted ? iss.upvotesCount + 1 : Math.max(0, iss.upvotesCount - 1),
        };
      })
    );
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    playHapticSound('send');

    const newIssue: CampusIssue = {
      id: generateId(),
      universityId: campus.id,
      universityName: campus.name,
      authorId: profile?.id || 'anon',
      authorHandle: profile?.handle || 'CampusStudent',
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'open',
      upvotesCount: 1,
      commentsCount: 0,
      hasUpvoted: true,
      createdAt: new Date().toISOString(),
    };

    setIssues([newIssue, ...issues]);
    setTitle('');
    setDescription('');
    setIsReportOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-3xl water-glass-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan/15 text-cyan flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-mono text-text-primary">
              Campus Radar · Issue Tracker
            </h1>
            <p className="text-xs text-text-secondary font-mono">
              Aggregated student grievances & verification for {campus.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-cyan text-neutral-900 font-mono text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Report Campus Issue</span>
        </button>
      </div>

      {/* Aggregate Statistics Computed from Real Rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl water-glass-card space-y-1">
          <div className="text-[11px] font-mono text-text-muted">Total Reported</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
            {totalIssues}
          </div>
        </div>

        <div className="p-4 rounded-2xl water-glass-card space-y-1">
          <div className="text-[11px] font-mono text-text-muted">Open Grievances</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-peach">
            {openIssues}
          </div>
        </div>

        <div className="p-4 rounded-2xl water-glass-card space-y-1">
          <div className="text-[11px] font-mono text-text-muted">Under Review</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-lemon">
            {underReviewIssues}
          </div>
        </div>

        <div className="p-4 rounded-2xl water-glass-card space-y-1">
          <div className="text-[11px] font-mono text-text-muted">Resolved</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-mint">
            {resolutionPercentage}%
          </div>
        </div>
      </div>

      {/* Formula Explainer Banner */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border-glass flex items-center justify-between gap-2 text-xs font-mono text-text-secondary">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan shrink-0" aria-hidden="true" />
          <span>
            Rankings Formula: <code className="text-cyan font-bold">(Upvotes × 2 + Comments × 1.5) ÷ (Hours Elapsed + 2)</code>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter issues by category"
        className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-surface border border-border-glass"
      >
        <button
          role="tab"
          aria-selected={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all min-h-[36px] ${
            selectedCategory === 'all'
              ? 'bg-cyan text-neutral-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all min-h-[36px] whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan text-neutral-900 font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Issues list or empty state */}
      {filteredIssues.length === 0 ? (
        <EmptyState
          icon={<Radio className="w-6 h-6" aria-hidden="true" />}
          title="No open issues found"
          description="There are currently no reported grievances in this category. Students can submit facilities, academic, or security concerns for campus attention."
          actionLabel="Report an Issue"
          onAction={() => setIsReportOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <article
              key={issue.id}
              className="p-5 rounded-3xl water-glass-card border border-border-glass space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan/15 text-cyan font-mono text-[10px] font-bold">
                      {issue.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold capitalize ${
                      issue.status === 'resolved'
                        ? 'bg-mint/15 text-mint'
                        : issue.status === 'under_review'
                        ? 'bg-lemon/15 text-lemon'
                        : 'bg-peach/15 text-peach'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-base font-bold font-mono text-text-primary">
                    {issue.title}
                  </h2>
                </div>

                {/* Single Upvote Button */}
                <button
                  type="button"
                  onClick={() => handleToggleUpvote(issue.id)}
                  aria-label={`Upvote issue (${issue.upvotesCount} upvotes)`}
                  aria-pressed={issue.hasUpvoted}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono min-h-[44px] transition-all ${
                    issue.hasUpvoted
                      ? 'bg-cyan text-neutral-900 font-bold shadow-sm'
                      : 'bg-surface border border-border-glass text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                  <span>{issue.upvotesCount}</span>
                </button>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">
                {issue.description}
              </p>

              <div className="pt-2 border-t border-border-glass flex items-center justify-between text-xs font-mono text-text-muted">
                <span>Reported by @{issue.authorHandle}</span>
                <span>{formatRelativeTime(issue.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Report Issue Modal */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Submit Campus Grievance"
        description="Your report is pseudonymous and visible to your campus student body and moderators."
      >
        <form onSubmit={handleSubmitIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WiFi outage in Science Lab Block C"
              className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-text-primary mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full p-2.5 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-cyan"
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
              Description & Location Details
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details of the issue so peers and campus administration can review and verify."
              className="w-full p-3 rounded-xl bg-canvas border border-border-glass text-xs font-mono text-text-primary outline-none focus:border-cyan"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-cyan text-neutral-900 font-mono text-xs font-bold min-h-[44px]"
            >
              Submit Grievance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
