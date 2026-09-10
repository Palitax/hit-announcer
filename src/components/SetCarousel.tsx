'use client';

import React, { useRef, useState } from 'react';
import { PokemonSetSummary, Language } from '@/lib/types';
import { ChevronLeft, ChevronRight, Layers, Search, Sparkles, Box } from 'lucide-react';
import { getUiText } from '@/lib/setNames';

interface SetCarouselProps {
  sets: PokemonSetSummary[];
  activeSetId: string;
  onSelectSet: (setId: string) => void;
  isLoading?: boolean;
  language?: Language;
}

export const SetCarousel: React.FC<SetCarouselProps> = ({
  sets = [],
  activeSetId,
  onSelectSet,
  isLoading = false,
  language = 'en',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  const ui = getUiText(language);

  const filteredSets = (sets || []).filter((s) => {
    if (!s) return false;
    const name = (s.name || '').toLowerCase();
    const id = (s.id || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full relative py-2">
      {/* Top Search & Display Count Bar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-8 mb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 font-medium">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>
            {ui.boosterDisplays} ({filteredSets.length})
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={ui.searchSets}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-900/90 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Carousel Track with Left/Right Buttons */}
      <div className="relative group/carousel px-4 sm:px-8">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-white/15 text-white flex items-center justify-center backdrop-blur-md opacity-80 hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 snap-x snap-mandatory"
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-44 sm:w-52 h-24 rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse"
              />
            ))
          ) : filteredSets.length === 0 ? (
            <div className="w-full py-6 text-center text-sm text-slate-500">
              {ui.noCardsFound(searchQuery)}
            </div>
          ) : (
            filteredSets.map((s) => {
              const isActive = (s?.id || '').toLowerCase() === (activeSetId || '').toLowerCase();
              const hasLogo = !!s?.logo && !brokenLogos[s.id];

              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSet(s.id)}
                  className={`flex-shrink-0 snap-start text-left w-44 sm:w-52 p-3 rounded-2xl transition-all duration-300 relative group overflow-hidden border backdrop-blur-md flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.25)] scale-[1.02]'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Active Indicator Glow */}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      <span>{ui.active}</span>
                    </div>
                  )}

                  {/* Logo or Stylized Display Badge */}
                  <div className="h-10 relative flex items-center justify-start mb-2">
                    {hasLogo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`${s.logo}.png`}
                        alt={s.name || ''}
                        onError={() => setBrokenLogos((prev) => ({ ...prev, [s.id]: true }))}
                        className="max-h-9 max-w-full object-contain object-left pointer-events-none"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                        <Box className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="text-[11px] font-bold truncate">
                          {s?.id?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Set Details */}
                  <div className="mt-auto">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {s.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{s.cardCount?.total || s.cardCount?.official || 0} {ui.cards}</span>
                      {s.releaseDate && <span>{s.releaseDate.slice(0, 4)}</span>}
                    </div>
                  </div>

                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                </button>
              );
            })
          )}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-white/15 text-white flex items-center justify-center backdrop-blur-md opacity-80 hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
