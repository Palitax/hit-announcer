'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Language, PokemonSetSummary, HitCard, HitCategory, SortOption } from '@/lib/types';
import { fetchSets, fetchSetHits, SetDetailResponse } from '@/lib/tcgdex';
import { HeaderHUD } from '@/components/HeaderHUD';
import { SetCarousel } from '@/components/SetCarousel';
import { HoloCard } from '@/components/HoloCard';
import { RarityBadge } from '@/components/RarityBadge';
import { FullscreenStage } from '@/components/FullscreenStage';
import { CardSearchModal } from '@/components/CardSearchModal';
import { Sparkles, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { getUiText } from '@/lib/setNames';

function MainApp() {
  const searchParams = useSearchParams();
  const initialStage = searchParams.get('stage');
  const initialLang = (searchParams.get('lang') as Language) || 'en';
  const initialSet = searchParams.get('set');

  const [language, setLanguage] = useState<Language>(initialLang);
  const [sets, setSets] = useState<PokemonSetSummary[]>([]);
  const [activeSetId, setActiveSetId] = useState<string>(initialSet || 'sv08');
  const [setInfo, setSetInfo] = useState<SetDetailResponse | null>(null);
  const [hits, setHits] = useState<HitCard[]>([]);

  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [isLoadingHits, setIsLoadingHits] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(36);

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const ui = getUiText(language);

  const handleOpenSearch = (query?: string) => {
    setSearchInitialQuery(query || '');
    setIsSearchOpen(true);
  };

  // Filters & Sorting
  const [activeCategory, setActiveCategory] = useState<HitCategory>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('hits');

  // Fullscreen Stage View
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(
    initialStage !== null ? parseInt(initialStage, 10) || 0 : null
  );

  // Global hotkey for Search (Cmd+K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenSearch('');
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        handleOpenSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Load sets when language changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSets(true);

    fetchSets(language).then((loadedSets) => {
      if (!isMounted) return;
      const validSets = Array.isArray(loadedSets) ? loadedSets : [];
      setSets(validSets);
      setIsLoadingSets(false);

      if (validSets.length > 0) {
        const preferredIds = ['sv08', 'sv8', 'sv7', 'sv07', 'sv6', 'sv06', 'sv5k', 'sv4a', 'sv035', 's12a'];
        const matched = validSets.find((s) =>
          preferredIds.some((p) => p.toLowerCase() === (s?.id || '').toLowerCase())
        );

        const target = matched || validSets[0];
        if (target && target.id) {
          setActiveSetId(target.id);
        }
      }
    }).catch(() => {
      if (!isMounted) return;
      setIsLoadingSets(false);
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  // 2. Load hits when activeSetId or language changes
  useEffect(() => {
    if (!activeSetId) return;

    let isMounted = true;
    setIsLoadingHits(true);
    setLogoBroken(false);
    setVisibleLimit(36);

    fetchSetHits(language, activeSetId).then(({ setInfo: info, hits: loadedHits }) => {
      if (!isMounted) return;
      setSetInfo(info);
      const safeHits = Array.isArray(loadedHits) ? loadedHits : [];
      setHits(safeHits);
      setIsLoadingHits(false);

      if (pendingCardId) {
        const foundIdx = safeHits.findIndex(
          (c) =>
            c?.id?.toLowerCase() === pendingCardId.toLowerCase() ||
            c?.localId?.toLowerCase() === pendingCardId.toLowerCase()
        );
        if (foundIdx !== -1) {
          setFullscreenIndex(foundIdx);
        } else if (safeHits.length > 0) {
          setFullscreenIndex(0);
        }
        setPendingCardId(null);
      }
    }).catch(() => {
      if (!isMounted) return;
      setIsLoadingHits(false);
      setPendingCardId(null);
    });

    return () => {
      isMounted = false;
    };
  }, [language, activeSetId, pendingCardId]);

  // Handle Card Selection from Search Modal
  const handleSelectCardFromSearch = (targetSetId: string, cardId: string) => {
    setActiveCategory('all');
    const currentSetMatches = (activeSetId || '').toLowerCase() === (targetSetId || '').toLowerCase();

    if (currentSetMatches) {
      const foundIdx = displayHits.findIndex(
        (c) =>
          c?.id?.toLowerCase() === cardId.toLowerCase() ||
          c?.localId?.toLowerCase() === cardId.toLowerCase()
      );
      if (foundIdx !== -1) {
        setFullscreenIndex(foundIdx);
      } else if (displayHits.length > 0) {
        setFullscreenIndex(0);
      }
    } else {
      setPendingCardId(cardId);
      setActiveSetId(targetSetId);
    }
  };

  // 3. Filter and sort hits
  const displayHits = useMemo(() => {
    let result = [...(hits || [])];

    // Filter by rarity tier
    if (activeCategory !== 'all') {
      result = result.filter((card) => {
        if (!card) return false;
        if (activeCategory === 'sir-sar') return card.hitTier === 'sar' || card.hitTier === 'sir';
        if (activeCategory === 'ir-ar') return card.hitTier === 'ir' || card.hitTier === 'ar';
        if (activeCategory === 'gold') return card.hitTier === 'gold';
        if (activeCategory === 'ultra') return card.hitTier === 'ultra' || card.hitTier === 'secret';
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (activeSort === 'hits') {
        const scoreDiff = (b?.score || 0) - (a?.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        const numA = parseInt(a?.localId || '0', 10) || 0;
        const numB = parseInt(b?.localId || '0', 10) || 0;
        return numB - numA;
      }
      if (activeSort === 'number-asc') {
        const numA = parseInt(a?.localId || '0', 10) || 0;
        const numB = parseInt(b?.localId || '0', 10) || 0;
        return numA - numB;
      }
      if (activeSort === 'number-desc') {
        const numA = parseInt(a?.localId || '0', 10) || 0;
        const numB = parseInt(b?.localId || '0', 10) || 0;
        return numB - numA;
      }
      if (activeSort === 'name') {
        return (a?.name || '').localeCompare(b?.name || '');
      }
      return 0;
    });

    return result;
  }, [hits, activeCategory, activeSort]);

  const activeSet = sets.find((s) => (s?.id || '').toLowerCase() === (activeSetId || '').toLowerCase()) || sets[0] || null;

  const paginatedHits = displayHits.slice(0, visibleLimit);

  return (
    <main className="min-h-screen flex flex-col bg-[#07090e] relative selection:bg-amber-400 selection:text-slate-950">
      {/* Floating Header HUD */}
      <HeaderHUD
        currentLanguage={language}
        onSelectLanguage={(newLang) => {
          setLanguage(newLang);
          setFullscreenIndex(null);
        }}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        activeSort={activeSort}
        onSelectSort={setActiveSort}
        onLaunchStage={() => {
          if (displayHits.length > 0) setFullscreenIndex(0);
        }}
        onOpenSearch={handleOpenSearch}
        hitsCount={displayHits.length}
      />

      {/* Booster Display Carousel (Quick Swipe / Scroll) */}
      <section className="w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <SetCarousel
          sets={sets}
          activeSetId={activeSetId}
          onSelectSet={(setId) => {
            setActiveSetId(setId);
            setFullscreenIndex(null);
          }}
          isLoading={isLoadingSets}
          language={language}
        />
      </section>

      {/* Active Display Headline & Stats Banner */}
      <section className="max-w-7xl mx-auto w-full px-3 sm:px-8 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {activeSet?.logo && !logoBroken && (
            <div className="relative max-w-[110px] sm:max-w-[140px] h-10 sm:h-12 flex-shrink-0 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${activeSet.logo}.png`}
                alt={activeSet.name || ''}
                onError={() => setLogoBroken(true)}
                className="max-h-10 sm:max-h-12 max-w-full object-contain object-left pointer-events-none"
              />
            </div>
          )}
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{activeSet?.name || setInfo?.name || ui.selectedDisplay}</span>
              <span className="text-[11px] sm:text-xs uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-mono">
                {activeSetId}
              </span>
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                {displayHits.length} {ui.hitsShowing}
              </span>
              <span>•</span>
              <span>{ui.totalDisplay}: {setInfo?.cardCount?.total || activeSet?.cardCount?.total || '—'}</span>
            </div>
          </div>
        </div>

        {/* Quick Hint */}
        <div className="text-[11px] text-slate-500 hidden md:block">
          {ui.tapHint}
        </div>
      </section>

      {/* Cards Grid Section */}
      <section className="max-w-7xl mx-auto w-full px-3 sm:px-8 pb-16 flex-1">
        {isLoadingHits ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2.5/3.5] rounded-2xl bg-slate-900/60 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : displayHits.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center text-slate-500">
            <ImageIcon className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-base font-semibold text-slate-400">{ui.noHitsFound}</p>
            <p className="text-xs text-slate-600 mt-1">{ui.tryAllHits}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 pt-2">
              {paginatedHits.map((card, idx) => (
                <div key={card.id || idx} className="card-grid-item flex flex-col gap-1.5 sm:gap-2">
                  {/* 3D Holographic Card with Idle Animated Sweep */}
                  <HoloCard
                    card={card}
                    onClick={() => setFullscreenIndex(idx)}
                    priority={idx < 4}
                  />

                  {/* Minimalist Card Metadata */}
                  <div className="flex items-center justify-between gap-1 px-1">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-[130px]">
                      {card.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-500">
                      #{card.localId}
                    </span>
                  </div>

                  {/* Rarity Pill */}
                  <div className="px-1">
                    <RarityBadge card={card} className="text-[9px] sm:text-[10px] py-0 px-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Load More for very large sets */}
            {visibleLimit < displayHits.length && (
              <div className="w-full flex justify-center pt-8 pb-4">
                <button
                  onClick={() => setVisibleLimit((prev) => prev + 36)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-lg active:scale-95"
                >
                  <span>{ui.showMoreHits} ({displayHits.length - visibleLimit} {ui.remaining})</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Fullscreen Stage Modal / Hit Announcer */}
      {fullscreenIndex !== null && displayHits.length > 0 && (
        <FullscreenStage
          cards={displayHits}
          currentIndex={fullscreenIndex}
          onClose={() => setFullscreenIndex(null)}
          onNavigate={(newIdx) => setFullscreenIndex(newIdx)}
          setName={activeSet?.name || setInfo?.name}
          language={language}
        />
      )}

      {/* Global Pokémon Search Modal */}
      <CardSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchInitialQuery}
        language={language}
        onSelectLanguage={(newLang) => {
          setLanguage(newLang);
          setFullscreenIndex(null);
        }}
        sets={sets}
        onSelectCard={handleSelectCardFromSearch}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e]" />}>
      <MainApp />
    </Suspense>
  );
}
