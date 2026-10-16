import React, { useState } from 'react';
import { Resource, ResourceCategory, University } from '../types';
import { Search, Plus, FileText, Download, ThumbsUp, ShieldCheck, ExternalLink, BookOpen, Check } from 'lucide-react';
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
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

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

  const handleDownload = (res: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    playHapticSound('click');
    setDownloadedIds((prev) => ({ ...prev, [res.id]: true }));

    // Trigger simulated download blob
    const element = document.createElement('a');
    const file = new Blob([res.samplePreview], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${res.courseCode}_${res.title.slice(0, 25).replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadedIds((prev) => ({ ...prev, [res.id]: false }));
    }, 2500);
  };

  // Thumbnail generator fallback if not explicitly set
  const getThumbnailGradient = (category: ResourceCategory) => {
    switch (category) {
      case 'Past Papers':
        return 'from-blue-900/60 to-cyan-900/60 border-cyan-500/30 text-cyan-400';
      case 'Notes':
        return 'from-emerald-900/60 to-teal-900/60 border-emerald-500/30 text-emerald-400';
      case 'Textbooks':
        return 'from-purple-900/60 to-indigo-900/60 border-purple-500/30 text-purple-400';
      case 'Lab Reports':
        return 'from-amber-900/60 to-orange-900/60 border-orange-500/30 text-orange-400';
      case 'Code & Cheatsheets':
        return 'from-pink-900/60 to-rose-900/60 border-pink-500/30 text-pink-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Scope Header */}
      <div className="p-4 rounded-3xl water-glass-card space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 dark:text-[#F0EEFF]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code (e.g. CS102), topic, or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/5 dark:bg-[#070A10] border border-neutral-300 dark:border-[rgba(255,255,255,0.12)] text-neutral-900 dark:text-[#F0EEFF] text-xs font-mono placeholder-neutral-400 dark:placeholder-[#F0EEFF]/40 outline-none focus:border-[#6FFFE0]"
            />
          </div>

          {/* Scope Toggle: My Campus vs Cross Campus */}
          <div className="flex items-center p-1 rounded-2xl bg-black/10 dark:bg-black/30 border border-white/5 shrink-0">
            <button
              onClick={() => {
                playHapticSound('click');
                setScope('campus');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                scope === 'campus'
                  ? 'bg-[#6FFFE0] text-[#0A0912] font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-[#F0EEFF]/60 hover:text-black dark:hover:text-white'
              }`}
            >
              {currentUniversity.shortCode} Repository
            </button>
            <button
              onClick={() => {
                playHapticSound('click');
                setScope('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                scope === 'all'
                  ? 'bg-[#6FFFE0] text-[#0A0912] font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-[#F0EEFF]/60 hover:text-black dark:hover:text-white'
              }`}
            >
              All Campuses
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playHapticSound('click');
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#6FFFE0]/20 text-[#6FFFE0] font-bold border border-[#6FFFE0]/50'
                  : 'text-neutral-600 dark:text-[#F0EEFF]/60 hover:text-black dark:hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid (Strict Requirement: 4 per row on large, 2 per row on small/mobile) */}
      {filteredResources.length === 0 ? (
        <div className="p-14 text-center rounded-3xl water-glass-card space-y-3">
          <div className="text-sm font-mono text-neutral-600 dark:text-[#F0EEFF]/60">
            No academic resources found matching your query.
          </div>
          <p className="text-xs text-neutral-500 dark:text-[#F0EEFF]/40 max-w-sm mx-auto">
            Help your fellow students by uploading past papers, revision notes, or lab sheets!
          </p>
          <button
            onClick={() => {
              playHapticSound('pop');
              onOpenUpload();
            }}
            className="px-5 py-2.5 rounded-full bg-[#6FFFE0] text-[#0A0912] font-bold text-xs font-mono shadow-md"
          >
            Upload Study Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredResources.map((res) => {
            const isDownloaded = downloadedIds[res.id];
            const thumbStyle = getThumbnailGradient(res.category);

            return (
              <div
                key={res.id}
                onClick={() => {
                  playHapticSound('click');
                  onSelectResourceForPreview(res);
                }}
                className="group p-3 sm:p-4 rounded-3xl water-glass-card water-glass-card-hover flex flex-col justify-between space-y-3 cursor-pointer"
              >
                {/* 1. Front-Page Document Image Thumbnail */}
                <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br ${thumbStyle} border flex flex-col justify-between p-3 shadow-inner`}>
                  {/* Document Thumbnail Header Simulation */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm text-white">
                      {res.category.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {res.fileSizeFormatted}
                    </span>
                  </div>

                  {/* Thumbnail Center Course Code Badge */}
                  <div className="text-center my-auto">
                    <div className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
                      {res.courseCode}
                    </div>
                    <div className="text-[10px] font-mono text-white/70 line-clamp-1">
                      {res.faculty}
                    </div>
                  </div>

                  {/* Thumbnail Bottom Info */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/80">
                    <span>{res.pageCount} Pages</span>
                    {res.isVerifiedContributor && (
                      <span className="flex items-center gap-0.5 text-[#6FFFE0]">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Metadata & Title */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#6FFFE0]">
                      {res.courseCode}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-[#F0EEFF]/40 truncate">
                      · {res.universityName.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-[#F0EEFF] group-hover:text-[#6FFFE0] line-clamp-2 leading-snug">
                    {res.title}
                  </h3>
                </div>

                {/* 3. Action Buttons (Preview + Integrated Download Button) */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1.5">
                  {/* Upvote Pill */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playHapticSound('vote');
                      onUpvoteResource(res.id);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-mono border transition-colors ${
                      res.hasUpvoted
                        ? 'bg-[#6FFFE0]/20 text-[#6FFFE0] border-[#6FFFE0]'
                        : 'border-neutral-300 dark:border-white/10 text-neutral-600 dark:text-[#F0EEFF]/60 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{res.upvotesCount}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playHapticSound('click');
                        onSelectResourceForPreview(res);
                      }}
                      className="px-2 py-1 rounded-xl bg-neutral-200/80 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/20 text-neutral-900 dark:text-[#F0EEFF] text-[10px] font-mono transition-colors"
                      title="Open Document Reader"
                    >
                      Preview
                    </button>

                    {/* Integrated Download Button */}
                    <button
                      onClick={(e) => handleDownload(res, e)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#6FFFE0] hover:bg-[#6FFFE0]/90 text-[#0A0912] font-bold text-[10px] font-mono transition-transform active:scale-95 shadow-sm"
                      title="Download for offline access"
                    >
                      {isDownloaded ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      <span className="hidden sm:inline">{isDownloaded ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Upload CTA */}
      <div className="sticky bottom-24 flex justify-end">
        <button
          onClick={() => {
            playHapticSound('pop');
            onOpenUpload();
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#6FFFE0] text-[#0A0912] font-bold text-xs font-mono shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Upload Academic Paper</span>
        </button>
      </div>
    </div>
  );
};
