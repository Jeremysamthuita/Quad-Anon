import React, { useState } from 'react';
import { CampusIssue, IssueCategory, IssueStatus, University } from '../types';
import { Radio, Flame, Shield, Plus, ThumbsUp, MessageSquare, CheckCircle, Info, ArrowUpRight } from 'lucide-react';
import { playHapticSound } from '../utils/sound';
import { RadarPolygraphChart } from './RadarPolygraphChart';

interface Props {
  issues: CampusIssue[];
  currentUniversity: University;
  onUpvoteIssue: (id: string) => void;
  onOpenReportIssue: () => void;
}

const CATEGORIES: (IssueCategory | 'All')[] = ['All', 'Facilities', 'Academics', 'Security', 'Administration'];
const STATUSES: { id: IssueStatus | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All Issues', color: 'text-white' },
  { id: 'trending', label: 'Trending', color: 'text-[#FFB27A]' },
  { id: 'open', label: 'Open', color: 'text-[#5EEAD4]' },
  { id: 'under_review', label: 'Under Review', color: 'text-[#B794F6]' },
  { id: 'resolved', label: 'Resolved', color: 'text-[#8A9A86]' },
];

export const TheRadarView: React.FC<Props> = ({
  issues,
  currentUniversity,
  onUpvoteIssue,
  onOpenReportIssue,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'momentum' | 'upvotes' | 'recent'>('momentum');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Filter issues
  const filtered = issues.filter((iss) => {
    if (iss.universityId !== currentUniversity.id) return false;
    if (selectedCategory !== 'All' && iss.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && iss.status !== selectedStatus) return false;
    return true;
  });

  // Sort issues
  const sortedIssues = [...filtered].sort((a, b) => {
    if (sortBy === 'momentum') return b.momentumScore - a.momentumScore;
    if (sortBy === 'upvotes') return b.upvotesCount - a.upvotesCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/30">
            ● Open
          </span>
        );
      case 'trending':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#FFB27A]/15 text-[#FFB27A] border border-[#FFB27A]/40 font-bold">
            <Flame className="w-3 h-3" /> Trending
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#B794F6]/15 text-[#B794F6] border border-[#B794F6]/30">
            ● Under Review
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#8A9A86]/20 text-[#8A9A86] border border-[#8A9A86]/40">
            <CheckCircle className="w-3 h-3" /> Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dedicated Issue Polygraph & Grievance Ranking Chart */}
      <RadarPolygraphChart />

      {/* 2. Campus Analytics Filter Bar */}
      <div className="p-5 rounded-3xl bg-[#0D121E]/90 border border-[rgba(255,255,255,0.08)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFB27A]/10 text-[#FFB27A] border border-[#FFB27A]/30 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F0EEFF]">
                {currentUniversity.name} · Local Campus Grievances
              </h2>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">
                Crowdsourced issue tracking & administrative accountability
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              setShowFormulaInfo(!showFormulaInfo);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-[#F0EEFF]/70 hover:text-white bg-[#0A0912]"
          >
            <Info className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>Momentum Formula</span>
          </button>
        </div>

        {/* Formula breakdown drawer */}
        {showFormulaInfo && (
          <div className="p-3.5 rounded-xl bg-[#090814] border border-[#5EEAD4]/20 text-xs font-mono text-[#F0EEFF]/80 space-y-1.5">
            <div className="text-[#5EEAD4] font-semibold">
              MOMENTUM RANKING ENGINE:
            </div>
            <code className="text-[11px] text-[#FFB27A] block bg-black/40 p-2 rounded border border-white/5">
              Score = (Upvotes + (Comments × 1.5)) / Math.max(Hours Elapsed, 0.1)^1.2
            </code>
            <p className="text-[11px] text-[#F0EEFF]/60 leading-relaxed">
              Issues gain rapid velocity when verified early by multiple students. When an issue crosses threshold score 15.0, it is automatically elevated to "Trending" and surfaced to campus administration.
            </p>
          </div>
        )}

        {/* Filters and Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto">
            {STATUSES.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  playHapticSound('click');
                  setSelectedStatus(st.id);
                }}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  selectedStatus === st.id
                    ? 'bg-white/15 text-white border-white/30 font-semibold'
                    : 'border-white/5 text-[#F0EEFF]/50 hover:border-white/20'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#F0EEFF]/40">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'momentum' | 'upvotes' | 'recent')}
              className="px-2.5 py-1 rounded-lg bg-[#0A0912] border border-white/10 text-xs text-[#FFB27A] outline-none font-mono"
            >
              <option value="momentum">Momentum Score</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="recent">Recently Reported</option>
            </select>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playHapticSound('click');
                setSelectedCategory(cat);
              }}
              className={`text-xs font-mono px-2.5 py-0.5 rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#FFB27A]/20 text-[#FFB27A] font-medium'
                  : 'text-[#F0EEFF]/50 hover:text-white'
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Stream */}
      {sortedIssues.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121020]/60 border border-[rgba(255,255,255,0.08)] space-y-3">
          <div className="text-sm font-mono text-[#F0EEFF]/60">
            No issues found under this filter for {currentUniversity.shortCode}.
          </div>
          <p className="text-xs text-[#F0EEFF]/40 max-w-sm mx-auto">
            Notice a broken lab AC, unsafe pathway, or portal malfunction? File an issue publicly or in Deep Anonymous mode.
          </p>
          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenReportIssue();
            }}
            className="px-4 py-2 rounded-xl bg-[#FFB27A] text-[#0A0912] font-semibold text-xs font-mono"
          >
            Report Campus Grievance
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-5 rounded-2xl bg-[#121020]/80 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.18)] transition-all space-y-3.5"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(issue.status)}
                  <span className="font-mono text-xs text-[#F0EEFF]/50">#{issue.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Momentum Pill */}
                  <span className="font-mono text-xs text-[#FFB27A] bg-[#FFB27A]/10 px-2 py-0.5 rounded border border-[#FFB27A]/25 tabular-nums">
                    Score: {issue.momentumScore}
                  </span>

                  {/* Dual Reporting Badge */}
                  {issue.isDeepAnon ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#B794F6]/15 text-[#B794F6] border border-[#B794F6]/30">
                      <Shield className="w-3 h-3" />
                      {issue.deepAnonPseudonym || 'Deep Anonymous'}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[#F0EEFF]/60">
                      @{issue.authorHandle}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-semibold text-[#F0EEFF] mb-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-[#F0EEFF]/80 leading-relaxed">
                  {issue.description}
                </p>
              </div>

              {/* Official Campus Response Box */}
              {issue.officialResponse && (
                <div className="p-3 rounded-xl bg-[#17152D] border border-white/10 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-[#6FFFE0]">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Official Response · {issue.officialResponse.by}
                    </span>
                    <span className="text-[10px] text-[#F0EEFF]/40">{issue.officialResponse.updatedAt}</span>
                  </div>
                  <p className="text-[#F0EEFF]/90 font-sans text-xs">
                    {issue.officialResponse.text}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)] text-xs font-mono">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playHapticSound('vote');
                      onUpvoteIssue(issue.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                      issue.hasUpvoted
                        ? 'bg-[#FFB27A]/20 text-[#FFB27A] border-[#FFB27A]'
                        : 'border-white/10 text-[#F0EEFF]/70 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{issue.upvotesCount} Upvotes</span>
                  </button>

                  <span className="inline-flex items-center gap-1 text-[#F0EEFF]/50">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{issue.commentsCount} comments</span>
                  </span>
                </div>

                <span className="text-[#F0EEFF]/40 text-[11px]">
                  Logged {issue.hoursElapsed}h ago
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Report CTA */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={() => {
            playHapticSound('pop');
            onOpenReportIssue();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFB27A] text-[#0A0912] font-semibold text-xs font-mono shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Report Campus Issue</span>
        </button>
      </div>
    </div>
  );
};
