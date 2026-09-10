'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, PokemonSetSummary } from '@/lib/types';
import { searchCardsByName, SearchResultCard } from '@/lib/tcgdex';
import { LANGUAGES } from '@/lib/constants';
import { Search, X, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage?: (lang: Language) => void;
  sets: PokemonSetSummary[];
  onSelectCard: (setId: string, cardId: string) => void;
  initialQuery?: string;
}

const POPULAR_SEARCHES: Record<Language, string[]> = {
  de: ['Dragoran', 'Glurak', 'Pikachu', 'Gengar', 'Mewtu', 'Rayquaza', 'Nachtara', 'Lugia'],
  en: ['Charizard', 'Pikachu', 'Gengar', 'Mewtwo', 'Umbreon', 'Rayquaza', 'Dragonite', 'Lugia'],
  ja: ['リザードン', 'ピカチュウ', 'ゲンガー', 'ミュウツー', 'ブラッキー', 'レックウザ', 'カイリュー'],
  'zh-tw': ['喷火龙', '皮卡丘', '耿鬼', '超梦', '月亮伊布', '烈空坐', '快龙'],
  ko: ['리자몽', '피카츄', '팬텀', '뮤츠', '블래키', '레쿠쟈', '망나뇽'],
};

export const CardSearchModal: React.FC<CardSearchModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  sets,
  onSelectCard,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Execute Search immediately
  const executeSearch = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsSearching(true);
    searchCardsByName(language, trimmed, sets)
      .then((cards) => {
        setResults(cards || []);
        setIsSearching(false);
      })
      .catch(() => {
        setResults([]);
        setIsSearching(false);
      });
  }, [language, sets]);

  // Focus input & initialize query on open
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, [isOpen, initialQuery, executeSearch]);

  // Debounced typing search
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsSearching(false);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      return;
    }

    setIsSearching(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      executeSearch(val);
    }, 280);
  };

  // Explicit Form Submit (Enter key or Search button)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  // Global keydown (Escape to close)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const popularChips = POPULAR_SEARCHES[language] || POPULAR_SEARCHES.en;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-950 border border-white/15 rounded-3xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Search Bar Header with Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 border-b border-white/10 flex items-center gap-2 sm:gap-3 bg-slate-950/90"
        >
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={`Search Pokémon (e.g. ${popularChips.slice(0, 2).join(', ')})...`}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none min-w-0"
          />

          {isSearching && (
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />
          )}

          {query && !isSearching && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search / Enter Button */}
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-400/20 active:scale-95 transition-all flex-shrink-0"
          >
            <span>Search</span>
            <span className="hidden sm:inline text-[10px] opacity-75 font-mono">↵</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Language Tabs Strip */}
        {onSelectLanguage && (
          <div className="px-4 py-2 border-b border-white/5 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-500 font-medium mr-1 flex-shrink-0">Language:</span>
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="text-[11px] uppercase">{lang.code}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
          {query.trim() && !isSearching && results.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No cards found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-600 mt-1">
                Try searching for the {currentLangObj.name} name or switch language above
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="py-10 px-4 text-center text-slate-500">
              <p className="text-sm text-slate-400">
                Type any Pokémon name to find all its card printings across displays
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md mx-auto">
                {popularChips.map((name) => (
                  <button
                    key={name}
                    onClick={() => setQuery(name)}
                    className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((card) => (
            <button
              key={card.id}
              onClick={() => {
                onSelectCard(card.setId, card.id);
                onClose();
              }}
              className="w-full text-left p-2.5 sm:p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-amber-400/40 transition-all flex items-center justify-between gap-3 group"
            >
              {/* Card Artwork Thumbnail */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden bg-slate-950 border border-white/10 flex-shrink-0 relative">
                  {card.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={card.image}
                      alt={card.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 p-1 text-center font-mono">
                      #{card.localId}
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {card.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="font-mono text-amber-400/90 font-semibold">#{card.localId}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">{card.setName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-mono uppercase">
                      {card.setId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Jump Action Button */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-amber-400 font-semibold px-3 py-1.5 rounded-full bg-white/5 group-hover:bg-amber-400/10 border border-white/5 group-hover:border-amber-400/30 transition-all flex-shrink-0">
                <span className="hidden sm:inline">Jump to Display</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        {results.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-950/90 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{results.length} cards found</span>
            <span>Click any card to jump directly to its display</span>
          </div>
        )}
      </div>
    </div>
  );
};

