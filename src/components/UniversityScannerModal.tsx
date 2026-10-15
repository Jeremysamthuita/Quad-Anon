import React, { useState } from 'react';
import { University, UniversityType } from '../types';
import { Search, X, Building2, MapPin, Users, BookOpen, AlertCircle, Check } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  universities: University[];
  currentUniversityId: number;
  onSelectUniversity: (uni: University) => void;
}

export const UniversityScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  universities,
  currentUniversityId,
  onSelectUniversity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<UniversityType | 'all'>('all');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');

  if (!isOpen) return null;

  // Extract unique counties
  const counties = Array.from(new Set(universities.map((u) => u.county))).sort();

  // Filter universities
  const filteredUniversities = universities.filter((uni) => {
    if (selectedType !== 'all' && uni.type !== selectedType) {
      return false;
    }
    if (selectedCounty !== 'all' && uni.county !== selectedCounty) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = uni.name.toLowerCase().includes(q);
      const matchCode = uni.shortCode.toLowerCase().includes(q);
      const matchLocation = uni.location.toLowerCase().includes(q);
      const matchCounty = uni.county.toLowerCase().includes(q);
      const matchFaculty = uni.faculties.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchLocation && !matchCounty && !matchFaculty) {
        return false;
      }
    }
    return true;
  });

  const getTypeLabel = (type: UniversityType) => {
    switch (type) {
      case 'public_chartered':
        return { text: 'Public Chartered', color: 'text-[#6FFFE0] border-[#6FFFE0]/30 bg-[#6FFFE0]/10' };
      case 'private_chartered':
        return { text: 'Private Chartered', color: 'text-[#B794F6] border-[#B794F6]/30 bg-[#B794F6]/10' };
      case 'constituent_college':
        return { text: 'Constituent College', color: 'text-[#FFB27A] border-[#FFB27A]/30 bg-[#FFB27A]/10' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090C14] border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#0E121D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6FFFE0]/10 border border-[#6FFFE0]/30 flex items-center justify-center text-[#6FFFE0]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F0EEFF]">
                  Kenya-Wide University Radar Scanner
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#6FFFE0]/15 text-[#6FFFE0] border border-[#6FFFE0]/25">
                  {universities.length} Accredited Campuses
                </span>
              </div>
              <p className="text-xs text-[#F0EEFF]/60 font-mono">
                Chartered Public, Chartered Private & Constituent Colleges
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHapticSound('click');
              onClose();
            }}
            className="p-1.5 rounded-xl text-[#F0EEFF]/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] bg-[#0C101A] space-y-3">
          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#F0EEFF]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search university name, acronym (e.g. UoN, CUK, JKUAT, MKU), town or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#070A10] border border-[rgba(255,255,255,0.12)] text-[#F0EEFF] text-xs font-mono placeholder-[#F0EEFF]/40 outline-none focus:border-[#6FFFE0] shadow-inner"
            />
          </div>

          {/* Type Classification Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <button
              onClick={() => {
                playHapticSound('click');
                setSelectedType('all');
              }}
              className={`px-3 py-1 rounded-xl border transition-all ${
                selectedType === 'all'
                  ? 'bg-white/15 text-white border-white/40 font-semibold'
                  : 'bg-white/[0.03] border-white/5 text-[#F0EEFF]/60 hover:border-white/20'
              }`}
            >
              All Types ({universities.length})
            </button>
            <button
              onClick={() => {
                playHapticSound('click');
                setSelectedType('public_chartered');
              }}
              className={`px-3 py-1 rounded-xl border transition-all ${
                selectedType === 'public_chartered'
                  ? 'bg-[#6FFFE0]/15 text-[#6FFFE0] border-[#6FFFE0] font-semibold'
                  : 'bg-white/[0.03] border-white/5 text-[#F0EEFF]/60 hover:border-white/20'
              }`}
            >
              Public Chartered
            </button>
            <button
              onClick={() => {
                playHapticSound('click');
                setSelectedType('private_chartered');
              }}
              className={`px-3 py-1 rounded-xl border transition-all ${
                selectedType === 'private_chartered'
                  ? 'bg-[#B794F6]/15 text-[#B794F6] border-[#B794F6] font-semibold'
                  : 'bg-white/[0.03] border-white/5 text-[#F0EEFF]/60 hover:border-white/20'
              }`}
            >
              Private Chartered
            </button>
            <button
              onClick={() => {
                playHapticSound('click');
                setSelectedType('constituent_college');
              }}
              className={`px-3 py-1 rounded-xl border transition-all ${
                selectedType === 'constituent_college'
                  ? 'bg-[#FFB27A]/15 text-[#FFB27A] border-[#FFB27A] font-semibold'
                  : 'bg-white/[0.03] border-white/5 text-[#F0EEFF]/60 hover:border-white/20'
              }`}
            >
              Constituent Colleges
            </button>
          </div>

          {/* County / Region Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-[#F0EEFF]/50 pt-1">
            <span className="shrink-0 text-[#F0EEFF]/40">County:</span>
            <button
              onClick={() => {
                playHapticSound('click');
                setSelectedCounty('all');
              }}
              className={`px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap ${
                selectedCounty === 'all' ? 'bg-[#6FFFE0]/20 text-[#6FFFE0]' : 'hover:text-white'
              }`}
            >
              All Regions
            </button>
            {counties.map((c) => (
              <button
                key={c}
                onClick={() => {
                  playHapticSound('click');
                  setSelectedCounty(c);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap ${
                  selectedCounty === c ? 'bg-[#6FFFE0]/20 text-[#6FFFE0]' : 'hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredUniversities.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-[#F0EEFF]/40 border border-dashed border-white/10 rounded-2xl">
              No accredited campuses match your search. Try typing a county or short code.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUniversities.map((uni) => {
                const isSelected = uni.id === currentUniversityId;
                const typeBadge = getTypeLabel(uni.type);

                return (
                  <button
                    key={uni.id}
                    onClick={() => {
                      playHapticSound('pop');
                      onSelectUniversity(uni);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-[#121A2B] border-[#6FFFE0] shadow-md shadow-[#6FFFE0]/10'
                        : 'bg-[#0E1320] border-[rgba(255,255,255,0.08)] hover:border-white/20 hover:bg-[#131929]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-[#6FFFE0] px-2 py-0.5 rounded bg-[#6FFFE0]/10 border border-[#6FFFE0]/20">
                          {uni.shortCode}
                        </span>
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${typeBadge.color}`}>
                          {typeBadge.text}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-[#F0EEFF] group-hover:text-white leading-snug">
                        {uni.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-[#F0EEFF]/60 font-mono mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FFB27A] shrink-0" />
                        <span className="truncate">{uni.location} ({uni.county})</span>
                      </div>
                    </div>

                    {/* Telemetry Strip */}
                    <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] font-mono text-[#F0EEFF]/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#B794F6]" />
                          <span>{uni.activeAnonsCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#6FFFE0]" />
                          <span>{uni.resourcesCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-[#FF5C7A]" />
                          <span>{uni.activeIssuesCount}</span>
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="text-[#6FFFE0] font-bold flex items-center gap-1 text-[10px]">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-xs text-[#F0EEFF]/40 group-hover:text-[#6FFFE0] transition-colors">
                          Switch →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0C101A] border-t border-[rgba(255,255,255,0.08)] flex justify-between items-center text-xs font-mono text-[#F0EEFF]/50">
          <span>QuadAnon National University Registry v3.1</span>
          <span>Showing {filteredUniversities.length} institutions</span>
        </div>
      </div>
    </div>
  );
};
