'use client';

import React from 'react';
import { Language, HitCategory, SortOption } from '@/lib/types';
import { LANGUAGES } from '@/lib/constants';
import { Sparkles, ArrowUpDown, Filter, Play } from 'lucide-react';

interface HeaderHUDProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  activeCategory: HitCategory;
  onSelectCategory: (cat: HitCategory) => void;
  activeSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onLaunchStage: () => void;
  hitsCount: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentLanguage,
  onSelectLanguage,
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
  onLaunchStage,
  hitsCount,
}) => {
  const categories: { id: HitCategory; label: string }[] = [
    { id: 'all', label: 'All Hits' },
    { id: 'sir-sar', label: 'SAR / SIR' },
    { id: 'ir-ar', label: 'AR / IR' },
    { id: 'gold', label: 'Gold UR' },
    { id: 'ultra', label: 'Ultra Rare' },
  ];

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col gap-3">
        {/* Top Row: Brand & Language Switcher & Fullscreen Action */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-amber-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>HIT ANNOUNCER</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 font-mono">
                  3000
                </span>
              </h1>
            </div>
          </div>

          {/* Language Switcher Pills */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-900/90 border border-white/10 overflow-x-auto no-scrollbar">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={lang.name}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="hidden sm:inline uppercase text-[11px] tracking-wider">{lang.code}</span>
                </button>
              );
            })}
          </div>

          {/* Fullscreen Showcase / Announcer Button */}
          {hitsCount > 0 && (
            <button
              onClick={onLaunchStage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span className="hidden sm:inline">Stage View</span>
            </button>
          )}
        </div>

        {/* Bottom Row: Filter Chips & Sort Dropdown */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5 overflow-x-auto no-scrollbar">
          {/* Rarity Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:block mr-1" />
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={activeSort}
              onChange={(e) => onSelectSort(e.target.value as SortOption)}
              className="bg-slate-900 border border-white/10 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="hits">Biggest Hits First</option>
              <option value="number-asc">Card # (Low to High)</option>
              <option value="number-desc">Card # (High to Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
