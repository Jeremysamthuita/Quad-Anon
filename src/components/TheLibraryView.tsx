import React, { useState } from 'react';
import { Resource, ResourceCategory, University } from '../types';
import { Search, Filter, Plus, FileText, Download, ThumbsUp, ShieldCheck, ExternalLink } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  resources: Resource[];
  currentUniversity: University;
  onSelectResourceForPreview: (resource: Resource) => void;
  onUpvoteResource: (id: string) => void;
  onOpenUpload: () => void;
}

const CATEGORIES: (ResourceCategory | 'All')[] = [
  'All',
  'Past Papers',
  'Notes',
  'Textbooks',
  'Lab Reports',
  'Code & Cheatsheets',
];

export const TheLibraryView: React.FC<Props> = ({
  resources,
  currentUniversity,
  onSelectResourceForPreview,
  onUpvoteResource,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>('All');
  const [scope, setScope] = useState<'campus' | 'all'>('campus');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredResources = resources.filter((res) => {
    if (scope === 'campus' && res.universityId !== currentUniversity.id) {
      return false;
    }
    if (selectedCategory !== 'All' && res.category !== selectedCategory) {
      return false;
    }
    if (activeTag && !res.tags.includes(activeTag)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCourse = res.courseCode.toLowerCase().includes(q);
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchFaculty = res.faculty.toLowerCase().includes(q);
      const matchTags = res.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchCourse && !matchTitle && !matchFaculty && !matchTags) return false;
    }
    return true;
  });

  // Extract unique popular tags
  const allTags = Array.from(new Set(resources.flatMap((r) => r.tags))).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Search and Scope Header */}
      <div className="p-4 rounded-2xl bg-[#121020]/90 border border-[rgba(255,255,255,0.08)] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#F0EEFF]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code (e.g. CS102), topic, or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0912] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-xs font-mono placeholder-[#F0EEFF]/40 outline-none focus:border-[#6FFFE0]"
            />
          </div>

          {/* Scope Toggle: My Campus vs Cross Campus */}
          <div className="flex items-center p-1 rounded-xl bg-[#0A0912] border border-white/5 shrink-0">
            <button
              onClick={() => {
                playHapticSound('click');
                setScope('campus');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                scope === 'campus'
                  ? 'bg-[#6FFFE0] text-[#0A0912] font-semibold'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              {currentUniversity.shortCode} Repository
            </button>
            <button
              onClick={() => {
                playHapticSound('click');
                setScope('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                scope === 'all'
                  ? 'bg-[#6FFFE0] text-[#0A0912] font-semibold'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              All Universities
            </button>
          </div>
        </div>

        {/* Category Pills & Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playHapticSound('click');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                selectedCategory === cat
                  ? 'bg-white/15 text-white font-semibold border border-white/30'
                  : 'text-[#F0EEFF]/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}

          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 ml-auto">
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    playHapticSound('click');
                    setActiveTag(activeTag === t ? null : t);
                  }}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                    activeTag === t
                      ? 'bg-[#B794F6]/20 text-[#B794F6] border border-[#B794F6]'
                      : 'text-[#F0EEFF]/40 hover:text-[#B794F6]'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121020]/60 border border-[rgba(255,255,255,0.08)] space-y-3">
          <div className="text-sm font-mono text-[#F0EEFF]/60">
            No academic resources found matching your query.
          </div>
          <p className="text-xs text-[#F0EEFF]/40 max-w-sm mx-auto">
            Help your fellow students by uploading past papers, revision notes, or lab sheets!
          </p>
          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenUpload();
            }}
            className="px-4 py-2 rounded-xl bg-[#6FFFE0] text-[#0A0912] font-semibold text-xs font-mono"
          >
            Upload Study Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-[#121020]/80 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.18)] transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Top Strip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#6FFFE0] px-2 py-0.5 rounded bg-[#6FFFE0]/10 border border-[#6FFFE0]/25">
                      {res.courseCode}
                    </span>
                    <span className="text-xs font-mono text-[#F0EEFF]/60">
                      {res.category}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[#F0EEFF]/40">
                    {res.fileSizeFormatted} · {res.pageCount} pgs
                  </span>
                </div>

                <h3
                  onClick={() => {
                    playHapticSound('click');
                    onSelectResourceForPreview(res);
                  }}
                  className="text-sm font-semibold text-[#F0EEFF] hover:text-[#6FFFE0] cursor-pointer line-clamp-2 leading-snug"
                >
                  {res.title}
                </h3>

                <p className="text-xs text-[#F0EEFF]/70 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {res.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-[#B794F6] mr-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playHapticSound('vote');
                      onUpvoteResource(res.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                      res.hasUpvoted
                        ? 'bg-[#6FFFE0]/15 text-[#6FFFE0] border-[#6FFFE0]'
                        : 'border-white/10 text-[#F0EEFF]/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{res.upvotesCount}</span>
                  </button>

                  {res.isVerifiedContributor && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#5EEAD4]" title="Verified peer contributor">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playHapticSound('click');
                      onSelectResourceForPreview(res);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#F0EEFF] text-xs font-mono transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Upload CTA */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={() => {
            playHapticSound('pop');
            onOpenUpload();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#6FFFE0] text-[#0A0912] font-semibold text-xs font-mono shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Upload Paper or Notes</span>
        </button>
      </div>
    </div>
  );
};
