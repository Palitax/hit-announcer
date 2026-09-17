'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Language, PokemonSetSummary } from '@/lib/types';
import { searchCardsByName, SearchResultCard } from '@/lib/tcgdex';
import { LANGUAGES } from '@/lib/constants';
import { Search, X, Sparkles, ArrowRight, Loader2, Box } from 'lucide-react';
import { getUiText, matchSetByQuery } from '@/lib/setNames';

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage?: (lang: Language) => void;
  sets: PokemonSetSummary[];
  onSelectCard: (setId: string, cardId: string) => void;
  onSelectSet?: (setId: string) => void;
  initialQuery?: string;
}

const POPULAR_SEARCHES: Record<Language, string[]> = {
  de: ['30th', 'Glurak', 'Pikachu', '151', 'Gengar', 'Mewtu', 'Rayquaza', 'Nachtara', 'Lugia'],
  en: ['30th', 'Charizard', 'Pikachu', '151', 'Gengar', 'Mewtwo', 'Umbreon', 'Rayquaza', 'Lugia'],
  ja: ['30th', 'リザードン', 'ピカチュウ', '151', 'ゲンガー', 'ミュウツー', 'ブラッキー', 'レックウザ'],
  'zh-tw': ['30th', '喷火龙', '皮卡丘', '151', '耿鬼', '超梦', '月亮伊布', '烈空坐'],
  ko: ['30th', '리자몽', '피卡츄', '151', '팬텀', '뮤츠', '블래키', '레쿠쟈'],
};

export const CardSearchModal: React.FC<CardSearchModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  sets,
  onSelectCard,
  onSelectSet,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const ui = getUiText(language);

  // Find matching Booster Displays based on query (e.g. 30, 30th, 151, M6a, Celebration, etc.)
  const matchedSets = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return (sets || []).filter((s) => {
      if (!s) return false;
      return matchSetByQuery(s.id, s.name, trimmed);
    });
  }, [sets, query]);

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

  const hasAnyResults = matchedSets.length > 0 || results.length > 0;

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
            placeholder={`${ui.searchPokemon} (z.B. ${popularChips.slice(0, 3).join(', ')})...`}
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
            <span>{ui.search}</span>
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
            <span className="text-[11px] text-slate-500 font-medium mr-1 flex-shrink-0">{ui.languageLabel}</span>
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar">
          {/* 1. Matching Displays Section */}
          {matchedSets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-400 font-bold px-1">
                <Box className="w-3.5 h-3.5" />
                <span>{ui.matchingDisplays} ({matchedSets.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedSets.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (onSelectSet) {
                        onSelectSet(s.id);
                      } else {
                        onSelectCard(s.id, '');
                      }
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 hover:from-amber-500/20 border border-amber-400/30 hover:border-amber-400/60 transition-all flex items-center justify-between gap-3 group text-left shadow-lg"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                        <Box className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 truncate">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="font-mono text-amber-400 font-semibold uppercase">{s.id}</span>
                          <span>•</span>
                          <span>{s.cardCount?.total || s.cardCount?.official || 0} {ui.cards}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors flex-shrink-0">
                      <span className="hidden xs:inline">{ui.openDisplay}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Matching Cards Section */}
          {results.length > 0 && (
            <div className="space-y-2">
              {matchedSets.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-bold px-1 pt-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ui.matchingCards} ({results.length})</span>
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
                    <span className="hidden sm:inline">{ui.jumpToDisplay}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty / Not Found State */}
          {query.trim() && !isSearching && !hasAnyResults && (
            <div className="py-16 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">{ui.noCardsFound(query)}</p>
              <p className="text-xs text-slate-600 mt-1">
                {ui.searchHintLanguage(currentLangObj.name)}
              </p>
            </div>
          )}

          {/* Initial Search Helper View */}
          {!query.trim() && (
            <div className="py-10 px-4 text-center text-slate-500">
              <p className="text-sm text-slate-400">
                {ui.searchHelperText}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md mx-auto">
                {popularChips.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setQuery(name);
                      executeSearch(name);
                    }}
                    className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        {hasAnyResults && (
          <div className="px-5 py-2.5 bg-slate-950/90 border-t border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {matchedSets.length > 0 && `${matchedSets.length} Displays `}
              {results.length > 0 && `• ${ui.cardsFound(results.length)}`}
            </span>
            <span>{ui.clickToJump}</span>
          </div>
        )}
      </div>
    </div>
  );
};

