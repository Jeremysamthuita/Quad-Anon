import React, { useState } from 'react';
import { Resource, ResourceCategory } from '../types';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploadResource: (res: Omit<Resource, 'id' | 'createdAt' | 'downloadsCount' | 'upvotesCount' | 'hasUpvoted'>) => void;
  currentUniversityId: number;
  currentUniversityName: string;
  uploaderHandle: string;
}

const CATEGORIES: ResourceCategory[] = [
  'Past Papers',
  'Notes',
  'Textbooks',
  'Lab Reports',
  'Code & Cheatsheets',
];

export const UploadResourceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUploadResource,
  currentUniversityId,
  currentUniversityName,
  uploaderHandle,
}) => {
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Past Papers');
  const [faculty, setFaculty] = useState('Computing & Information Tech');
  const [department, setDepartment] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('ExamPrep, Midterm');
  const [samplePreview, setSamplePreview] = useState('');
  const [pageCount, setPageCount] = useState(12);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !title.trim()) return;

    playHapticSound('vote');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const sizeMb = (1.2 + Math.random() * 4).toFixed(1);

    onUploadResource({
      uploaderId: `usr_${Date.now()}`,
      uploaderHandle,
      universityId: currentUniversityId,
      universityName: currentUniversityName,
      faculty,
      department,
      courseCode: courseCode.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || 'Uploaded via QuadAnon Academic Library.',
      category,
      fileSizeBytes: Math.round(parseFloat(sizeMb) * 1024 * 1024),
      fileSizeFormatted: `${sizeMb} MB`,
      pageCount: pageCount || 8,
      isVerifiedContributor: true,
      tags: tags.length ? tags : ['StudyGroup', 'CampusNote'],
      samplePreview:
        samplePreview.trim() ||
        `ARCHIVED SYLLABUS NOTES // ${courseCode.toUpperCase()}\nVerified by student peer review.\nSections: Key definitions, formula sheets, sample examination solutions.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0F0D1E] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#141226]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#6FFFE0]/10 text-[#6FFFE0] border border-[#6FFFE0]/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F0EEFF]">Publish to The Library</h2>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">Zero-friction peer study repository</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono font-semibold text-[#6FFFE0] block mb-1">
                Course Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. CS102"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#6FFFE0] font-mono text-sm focus:border-[#6FFFE0] outline-none uppercase"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-mono font-semibold text-[#F0EEFF] block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-sm focus:border-[#FF6FD8] outline-none font-mono"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#121020]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-[#F0EEFF] block mb-1">
              Document Title *
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Midterm 2024 Solved Papers with Graphs & Theorems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#16142A] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-sm focus:border-[#FF6FD8] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#F0EEFF]/70 block mb-1">Faculty</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#16142A] border border-white/10 text-xs font-mono text-[#F0EEFF] focus:border-white/30 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#F0EEFF]/70 block mb-1">Estimated Pages</label>
              <input
                type="number"
                min={1}
                max={500}
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-[#16142A] border border-white/10 text-xs font-mono text-[#F0EEFF] focus:border-white/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#F0EEFF]/70 block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Cheatsheet, FinalPrep, Formulas"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#16142A] border border-white/10 text-xs font-mono text-[#B794F6] focus:border-[#B794F6] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#F0EEFF]/70 block mb-1">
              Sample Text / Excerpt Preview (renders in preview modal)
            </label>
            <textarea
              rows={3}
              placeholder="Paste the first few sample problems or summary equations here..."
              value={samplePreview}
              onChange={(e) => setSamplePreview(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0B0A16] border border-white/10 text-xs font-mono text-[#F0EEFF]/90 focus:border-[#6FFFE0] outline-none resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#141224] border border-white/5 flex items-center gap-3 text-xs font-mono text-[#6FFFE0]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>EXIF tags & metadata automatically stripped upon upload for total anonymity.</span>
          </div>

          {/* Footer actions */}
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
              className="px-5 py-2 rounded-xl bg-[#6FFFE0] text-[#0A0912] font-semibold text-xs font-mono transition-transform active:scale-95"
            >
              Confirm & Share File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
