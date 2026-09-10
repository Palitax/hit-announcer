'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { HitCard, Language } from '@/lib/types';
import { HoloCard } from './HoloCard';
import { RarityBadge } from './RarityBadge';
import { ChevronLeft, ChevronRight, X, Sparkles, Maximize2, Minimize2, ChevronDown, ZoomIn, RotateCcw, Languages } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchCardDetail } from '@/lib/tcgdex';
import { getUiText } from '@/lib/setNames';
import { getCardTranslations, formatCardSetNumber } from '@/lib/pokemonNames';

interface FullscreenStageProps {
  cards: HitCard[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  setName?: string;
  setId?: string;
  officialCount?: number;
  language: Language;
}

export const FullscreenStage: React.FC<FullscreenStageProps> = ({
  cards,
  currentIndex,
  onClose,
  onNavigate,
  setName,
  setId,
  officialCount,
  language,
}) => {
  const currentCard = cards[currentIndex];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  // Translation cycle: 0 = Original, 1 = German, 2 = English
  const [nameLangIndex, setNameLangIndex] = useState<number>(0);

  // Zoom & Pan state for 2-finger tablet pinch-to-zoom
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDraggingDown = useRef(false);

  // Multi-touch Pinch Tracking
  const isPinching = useRef(false);
  const initialPinchDist = useRef<number | null>(null);
  const initialPinchScale = useRef(1);
  const lastTapTime = useRef(0);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const panBase = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const ui = getUiText(language);
  const cardId = currentCard?.id;

  // Reset zoom, pan, and translation language when changing cards
  useEffect(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setNameLangIndex(0);
  }, [currentIndex]);

  // Fetch card detail for extra metadata (illustrator, hp, types)
  useEffect(() => {
    if (!cardId) return;
    setDetail(null);
    fetchCardDetail(language, cardId).then((d) => {
      if (d) setDetail(d);
    });
  }, [cardId, language]);

  const goToNext = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    if (currentIndex < cards.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, cards.length, onNavigate]);

  const goToPrev = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(cards.length - 1);
    }
  }, [currentIndex, cards.length, onNavigate]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const nextState = !prev;
      if (!nextState) {
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
      }
      return nextState;
    });

    if (typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        if (zoomScale > 1.1) {
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        setZoomScale((s) => Math.min(s + 0.25, 3.5));
      } else if (e.key === '-' || e.key === '_') {
        setZoomScale((s) => {
          const next = Math.max(s - 0.25, 1);
          if (next <= 1.05) setPanOffset({ x: 0, y: 0 });
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose, isFullscreen, zoomScale, toggleFullscreen]);

  // Touch handlers:
  // 1. 2-finger pinch-to-zoom on tablets
  // 2. 1-finger vertical swipe-down dismiss (only when not zoomed in)
  // 3. Panning when zoomed in
  // NOTE: Horizontal touch swiping between cards is REMOVED as requested (arrows handle navigation)
  const handleTouchStart = (e: React.TouchEvent) => {
    // 2-Finger Pinch start
    if (e.touches.length === 2) {
      isPinching.current = true;
      isDraggingDown.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDist.current = dist;
      initialPinchScale.current = zoomScale;
      return;
    }

    // 1-Finger touch start
    if (e.touches.length === 1) {
      // Double-tap detection for quick zoom
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        if (zoomScale > 1.1) {
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        } else {
          setZoomScale(2);
        }
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panBase.current = { ...panOffset };
      isDraggingDown.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 2-Finger Pinch zooming
    if (e.touches.length === 2 && initialPinchDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialPinchDist.current > 0) {
        const factor = dist / initialPinchDist.current;
        const newScale = Math.min(Math.max(initialPinchScale.current * factor, 1), 3.5);
        setZoomScale(newScale);
      }
      return;
    }

    // 1-Finger handling
    if (e.touches.length === 1 && touchStartY.current !== null && touchStartX.current !== null) {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - touchStartY.current;
      const diffX = currentX - touchStartX.current;

      // When zoomed in, allow panning
      if (zoomScale > 1.05 && panStart.current) {
        const dx = currentX - panStart.current.x;
        const dy = currentY - panStart.current.y;
        setPanOffset({
          x: panBase.current.x + dx,
          y: panBase.current.y + dy,
        });
        return;
      }

      // When at 1x zoom and not in card-only fullscreen, track vertical drag down to dismiss
      if (!isFullscreen && zoomScale <= 1.05) {
        if (diffY > 15 && diffY > Math.abs(diffX) * 1.2) {
          isDraggingDown.current = true;
          setDragOffsetY(Math.min(diffY * 0.75, 200));
        } else if (diffY <= 0 && isDraggingDown.current) {
          setDragOffsetY(0);
          isDraggingDown.current = false;
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching.current) {
      if (e.touches.length < 2) {
        isPinching.current = false;
        initialPinchDist.current = null;
        if (zoomScale < 1.05) {
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        }
      }
      return;
    }

    if (touchStartY.current !== null && touchStartX.current !== null && e.changedTouches.length > 0) {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = endY - touchStartY.current;
      const diffX = touchStartX.current - endX;

      // Downward swipe / drag dismiss (only when not zoomed in and not in pure fullscreen mode)
      if (!isFullscreen && zoomScale <= 1.05 && diffY > 55 && diffY > Math.abs(diffX) * 0.8) {
        onClose();
        touchStartX.current = null;
        touchStartY.current = null;
        isDraggingDown.current = false;
        setDragOffsetY(0);
        return;
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    panStart.current = null;
    isDraggingDown.current = false;
    setDragOffsetY(0);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const resetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  if (!currentCard) return null;

  const isAsianSet = language !== 'de' && language !== 'en';
  const translations = getCardTranslations(currentCard.name, detail?.dexId);

  const cycleNameLanguage = () => {
    if (isAsianSet) {
      setNameLangIndex((prev) => (prev + 1) % 3);
    }
  };

  const displayedCardName = !isAsianSet
    ? currentCard.name
    : nameLangIndex === 0
    ? translations.original
    : nameLangIndex === 1
    ? translations.de
    : translations.en;

  const effectiveSetId = setId || (currentCard.id ? currentCard.id.split('-')[0] : '');
  const effectiveOfficialCount = officialCount || detail?.set?.cardCount?.official;
  const formattedSetLine = formatCardSetNumber(setName, effectiveSetId, currentCard.localId, effectiveOfficialCount);

  const illustrator = detail?.illustrator || currentCard.illustrator;
  const hp = detail?.hp || currentCard.hp;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : undefined,
        opacity: dragOffsetY > 0 ? Math.max(0.3, 1 - dragOffsetY / 300) : 1,
        transition: isDraggingDown.current ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out',
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-3xl text-white select-none animate-in fade-in duration-200 overflow-hidden"
    >
      {/* 1. TOP BAR / HUD (Hidden in Pure Fullscreen Card-Only View) */}
      {!isFullscreen ? (
        <div className="w-full flex flex-col items-center px-4 sm:px-8 pt-2 pb-2 z-30 flex-shrink-0 animate-in fade-in duration-200">
          {/* Swipe Down Pill Bar */}
          <button
            onClick={onClose}
            className="flex flex-col items-center group py-1 px-4 cursor-pointer focus:outline-none"
            title={ui.swipeDownCloseHint}
            aria-label="Close Stage"
          >
            <div className="w-14 h-1.5 rounded-full bg-white/25 group-hover:bg-amber-400 transition-colors shadow-sm" />
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-1 transition-colors flex items-center gap-1">
              <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
              <span>{ui.swipeDownCloseHint}</span>
            </span>
          </button>

          {/* HUD Row */}
          <div className="w-full flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {ui.stageView}
              </span>
              <span className="text-sm font-medium text-slate-300 truncate max-w-[180px] sm:max-w-xs">
                {setName || ui.displayHits}
              </span>
            </div>

            {/* Center Hit Counter */}
            <div className="text-xs font-semibold px-3.5 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-slate-200 shadow-lg">
              {ui.hitOf(currentIndex + 1, cards.length)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={triggerConfetti}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-amber-300 transition-colors shadow-lg active:scale-95"
                title="Celebrate Hit!"
                aria-label="Celebrate Hit"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white transition-colors shadow-lg active:scale-95"
                title="Fullscreen (Card Only)"
                aria-label="Fullscreen Card Only"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/30 hover:text-red-300 border border-white/10 text-slate-300 transition-colors shadow-lg active:scale-95"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Floating Minimalist Controls in Pure Fullscreen Mode */
        <>
          {/* Exit Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="fixed top-4 right-4 z-50 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/80 hover:text-white border border-white/15 backdrop-blur-md shadow-2xl transition-all active:scale-95 hover:scale-105"
            title="Exit Fullscreen (ESC)"
            aria-label="Exit Fullscreen"
          >
            <Minimize2 className="w-5 h-5" />
          </button>

          {/* Floating Zoom Indicator & Reset Badge */}
          {zoomScale > 1.05 && (
            <button
              onClick={resetZoom}
              className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-amber-400 text-xs font-mono backdrop-blur-md shadow-2xl transition-all active:scale-95"
              title="Reset Zoom (Double tap or click)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{Math.round(zoomScale * 100)}%</span>
              <RotateCcw className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>
          )}
        </>
      )}

      {/* 2. MAIN STAGE CANVAS: Card & Navigation Arrows */}
      <div className="relative w-full flex-1 flex items-center justify-center px-2 sm:px-12 md:px-20 overflow-visible min-h-0">
        {/* Dynamic Ambient Background Glow from card */}
        <div className="absolute w-[420px] sm:w-[650px] h-[420px] sm:h-[650px] rounded-full bg-gradient-to-tr from-amber-500/15 via-purple-600/15 to-cyan-500/15 blur-[130px] pointer-events-none" />

        {/* Previous Card Arrow (Hidden in Fullscreen Card-Only View) */}
        {!isFullscreen && (
          <button
            onClick={goToPrev}
            className="absolute left-2 sm:left-6 md:left-10 z-30 p-3 sm:p-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* The Holographic 3D Card (with 2-finger zoom/pan wrapper) */}
        <div
          style={{
            transform: zoomScale > 1.05 ? `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)` : undefined,
            transition: isPinching.current ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="relative z-20 flex flex-col items-center justify-center overflow-visible will-change-transform"
        >
          <HoloCard
            card={currentCard}
            priority
            isStage
            isFullscreen={isFullscreen}
            onClick={triggerConfetti}
          />
        </div>

        {/* Next Card Arrow (Hidden in Fullscreen Card-Only View) */}
        {!isFullscreen && (
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-6 md:right-10 z-30 p-3 sm:p-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
            aria-label="Next card"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* 3. BOTTOM METADATA STRIP (Hidden in Pure Fullscreen Card-Only View) */}
      {!isFullscreen && (
        <div className="w-full flex flex-col items-center pb-5 sm:pb-7 px-4 z-30 text-center flex-shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-center">
            <RarityBadge card={currentCard} className="text-xs py-0.5 px-3" />
            {isAsianSet && (
              <button
                onClick={cycleNameLanguage}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium text-amber-300 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Tippen zum Übersetzen (Original → Deutsch → Englisch)"
              >
                <Languages className="w-3 h-3 text-amber-400" />
                <span>
                  {nameLangIndex === 0
                    ? `Original (${language.toUpperCase()})`
                    : nameLangIndex === 1
                    ? '🇩🇪 Deutsch'
                    : '🇬🇧 English'}
                </span>
                <span className="text-[10px] text-slate-400 ml-0.5">🔄</span>
              </button>
            )}
          </div>

          {/* Card Name (Tap to toggle translation for Asian sets) */}
          <h2
            data-testid="stage-card-name"
            onClick={isAsianSet ? cycleNameLanguage : undefined}
            className={`text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md flex items-center justify-center gap-2 select-text ${
              isAsianSet ? 'cursor-pointer hover:text-amber-300 transition-colors active:scale-98' : ''
            }`}
            title={isAsianSet ? 'Tippen zum Übersetzen (Original → Deutsch → Englisch)' : undefined}
          >
            <span>{displayedCardName}</span>
            {isAsianSet && nameLangIndex !== 0 && (
              <span className="text-xs sm:text-sm font-normal text-slate-400 font-mono">
                ({translations.original})
              </span>
            )}
          </h2>

          {/* Always show Set Name, Set ID, and Card Number e.g. "Name sv2a 167/165" */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300 mt-1.5">
            <span
              data-testid="stage-set-line"
              className="font-semibold text-amber-300/95 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10 font-mono tracking-tight shadow-sm"
            >
              {formattedSetLine}
            </span>
            {hp && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">{hp} HP</span>
              </>
            )}
            {illustrator && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Ill: {illustrator}</span>
              </>
            )}
          </div>

          {/* Keyboard / Gesture Helper Hint */}
          <p className="text-[11px] text-slate-500 mt-2.5">
            <span className="hidden sm:inline">Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">→</kbd> to switch • </span>
            {isAsianSet && <span>Tippe auf den Namen zum Übersetzen • </span>}
            <span>{ui.celebrate} 🎉</span>
          </p>
        </div>
      )}
    </div>
  );
};
