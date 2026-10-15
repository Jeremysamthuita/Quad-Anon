import React, { useState } from 'react';
import { TimeframePeriod, IssueCategory } from '../types';
import { POLYGRAPH_METRICS, UNIVERSITY_GRIEVANCE_RANKINGS } from '../data/initialData';
import { Activity, Flame, TrendingUp, BarChart3, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { playHapticSound } from '../utils/sound';

const TIMEFRAMES: { id: TimeframePeriod; label: string }[] = [
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Past 7 Days' },
  { id: '30d', label: 'Past 30 Days' },
  { id: 'semester', label: 'Semester-to-Date' },
];

const CATEGORY_COLORS: Record<IssueCategory, { bar: string; text: string; bg: string }> = {
  'Facilities': { bar: 'bg-[#6FFFE0]', text: 'text-[#6FFFE0]', bg: 'bg-[#6FFFE0]/15' },
  'Finance/Portal': { bar: 'bg-[#FF6FD8]', text: 'text-[#FF6FD8]', bg: 'bg-[#FF6FD8]/15' },
  'Academics': { bar: 'bg-[#FFB27A]', text: 'text-[#FFB27A]', bg: 'bg-[#FFB27A]/15' },
  'Security': { bar: 'bg-[#FFE66D]', text: 'text-[#FFE66D]', bg: 'bg-[#FFE66D]/15' },
  'Administration': { bar: 'bg-[#B794F6]', text: 'text-[#B794F6]', bg: 'bg-[#B794F6]/15' },
};

export const RadarPolygraphChart: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframePeriod>('24h');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);

  const metrics = POLYGRAPH_METRICS[activeTimeframe];
  const rankings = UNIVERSITY_GRIEVANCE_RANKINGS[activeTimeframe];
  const totalIncidents = metrics.reduce((acc, m) => acc + m.incidentCount, 0);

  return (
    <div className="p-6 rounded-3xl bg-[#0D121E]/90 border border-[rgba(255,255,255,0.1)] space-y-6 shadow-2xl">
      {/* Polygraph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5EEAD4]/10 border border-[#5EEAD4]/30 flex items-center justify-center text-[#5EEAD4]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F0EEFF]">
                Campus Grievance Polygraph & Anomaly Engine
              </h3>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FF6FD8]/15 text-[#FF6FD8] border border-[#FF6FD8]/30">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-[#F0EEFF]/60 font-mono">
              Aggregated from Quad whispers, library tickets & verified student reports
            </p>
          </div>
        </div>

        {/* Timeframe Selector Pill Group */}
        <div className="flex items-center p-1 rounded-2xl bg-[#070A10] border border-white/10 shrink-0">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                playHapticSound('click');
                setActiveTimeframe(tf.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeTimeframe === tf.id
                  ? 'bg-[#5EEAD4] text-[#070A10] font-bold shadow-md'
                  : 'text-[#F0EEFF]/60 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Polygraph Multi-Axis Breakdown + University Grievance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Polygraph Frequency Spectrum */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#F0EEFF] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#5EEAD4]" />
              <span>Grievance Distribution Spectrum ({totalIncidents.toLocaleString()} logs)</span>
            </span>
            <span className="text-[11px] font-mono text-[#F0EEFF]/40">
              Velocity: Incident rate / hr
            </span>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-[#090D17] border border-white/5">
            {metrics.map((m) => {
              const colorInfo = CATEGORY_COLORS[m.category] || {
                bar: 'bg-white',
                text: 'text-white',
                bg: 'bg-white/10',
              };

              return (
                <div
                  key={m.category}
                  onClick={() => {
                    playHapticSound('click');
                    setSelectedCategory(selectedCategory === m.category ? null : m.category);
                  }}
                  className="p-3 rounded-xl bg-[#0E1422] border border-white/5 hover:border-white/15 cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorInfo.bar}`} />
                      <span className="font-semibold text-[#F0EEFF]">{m.category}</span>
                      <span className="text-[10px] text-[#F0EEFF]/40 font-mono">
                        [Trending: <span className="text-white">{m.trendingKeyword}</span>]
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#6FFFE0] flex items-center gap-0.5">
                        <Zap className="w-3 h-3" />
                        <span>+{m.velocityScore}x</span>
                      </span>
                      <span className="tabular-nums font-bold text-white text-xs">
                        {m.incidentCount} ({m.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Polygraph Horizontal Fill Bar */}
                  <div className="w-full h-2 rounded-full bg-[#070A10] overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${colorInfo.bar} transition-all duration-500`}
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Anomaly Callout Box */}
          <div className="p-3.5 rounded-2xl bg-[#FF6FD8]/10 border border-[#FF6FD8]/25 flex items-center gap-3 text-xs font-mono text-[#F0EEFF]">
            <AlertTriangle className="w-5 h-5 text-[#FF6FD8] shrink-0" />
            <div>
              <span className="font-bold text-[#FF6FD8]">Critical Anomaly Detected:</span> Multiple campuses experiencing portal 504 timeouts and fee clearance blockades preceding supplementary exams.
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): University Grievance Momentum Leaderboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#F0EEFF] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FFB27A]" />
              <span>Grievance Momentum Index</span>
            </span>
            <span className="text-[11px] font-mono text-[#F0EEFF]/40">
              Ranked by Unresolved Pressure
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#090D17] border border-white/5 divide-y divide-white/5 space-y-2">
            {rankings.map((r) => (
              <div key={r.universityId} className="pt-2 first:pt-0 pb-1 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                      r.rank === 1
                        ? 'bg-[#FF5C7A] text-white shadow-sm'
                        : r.rank === 2
                        ? 'bg-[#FFB27A] text-[#070A10]'
                        : r.rank === 3
                        ? 'bg-[#FFE66D] text-[#070A10]'
                        : 'bg-white/10 text-[#F0EEFF]/60'
                    }`}
                  >
                    #{r.rank}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#F0EEFF] truncate">{r.shortCode}</span>
                      <span className="text-[10px] text-[#F0EEFF]/40 truncate">({r.topCategory})</span>
                    </div>
                    <div className="text-[10px] text-[#F0EEFF]/50 truncate">
                      {r.grievancesCount} reports · {r.resolvedRatePercent}% resolved
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-[#FFB27A] tabular-nums">
                    {r.momentumIndex}
                  </div>
                  <div className="text-[9px] text-[#F0EEFF]/40 uppercase">Momentum</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-mono text-[#F0EEFF]/50 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6FFFE0]" />
            <span>Precomputed every 15 minutes from decentralized anonymous student submissions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
