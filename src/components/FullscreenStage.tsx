'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { HitCard, Language } from '@/lib/types';
import { HoloCard } from './HoloCard';
import { RarityBadge } from './RarityBadge';
import { ChevronLeft, ChevronRight, X, Sparkles, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchCardDetail } from '@/lib/tcgdex';
import { getUiText } from '@/lib/setNames';

interface FullscreenStageProps {
  cards: HitCard[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  setName?: string;
  language: Language;
}

export const FullscreenStage: React.FC<FullscreenStageProps> = ({
  cards,
  currentIndex,
  onClose,
  onNavigate,
  setName,
  language,
}) => {
  const currentCard = cards[currentIndex];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDraggingDown = useRef(false);

  const ui = getUiText(language);
  const cardId = currentCard?.id;

  // Fetch card detail for extra metadata (illustrator, hp, types)
  useEffect(() => {
    if (!cardId) return;
    setDetail(null);
    fetchCardDetail(language, cardId).then((d) => {
      if (d) setDetail(d);
    });
  }, [cardId, language]);

  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, cards.length, onNavigate]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(cards.length - 1);
    }
  }, [currentIndex, cards.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  // Touch handlers for vertical swipe-down dismiss and horizontal card flipping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDraggingDown.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - touchStartY.current;
    const diffX = currentX - touchStartX.current;

    // Detect if user is intentionally dragging downwards
    if (diffY > 15 && diffY > Math.abs(diffX) * 1.2) {
      isDraggingDown.current = true;
      setDragOffsetY(Math.min(diffY * 0.75, 200));
    } else if (diffY <= 0 && isDraggingDown.current) {
      setDragOffsetY(0);
      isDraggingDown.current = false;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null && touchStartX.current !== null && e.changedTouches.length > 0) {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = endY - touchStartY.current;
      const diffX = touchStartX.current - endX;

      // Downward swipe / drag dismiss
      if (diffY > 55 && diffY > Math.abs(diffX) * 0.8) {
        onClose();
        touchStartX.current = null;
        touchStartY.current = null;
        isDraggingDown.current = false;
        setDragOffsetY(0);
        return;
      }

      // Horizontal swipe to change cards
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
          goToNext();
        } else if (diffX < -50) {
          goToPrev();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
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

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    } catch {
      // Fullscreen not supported on iOS Safari
    }
  };

  if (!currentCard) return null;

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
      {/* Top Handle & HUD */}
      <div className="w-full flex flex-col items-center px-4 sm:px-8 pt-2 pb-2 z-30">
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
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 transition-colors hidden sm:block shadow-lg active:scale-95"
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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

      {/* Main Stage Canvas with Card & Navigation Arrows */}
      <div className="relative w-full flex-1 flex items-center justify-center px-4 sm:px-20 overflow-hidden">
        {/* Dynamic Ambient Background Glow from card */}
        <div className="absolute w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-tr from-amber-500/15 via-purple-600/15 to-cyan-500/15 blur-[120px] pointer-events-none" />

        {/* Previous Card Arrow */}
        <button
          onClick={goToPrev}
          className="absolute left-3 sm:left-10 z-30 p-3 sm:p-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* The Holographic 3D Card */}
        <div className="relative z-20 flex flex-col items-center">
          <HoloCard
            card={currentCard}
            priority
            isStage
            onClick={triggerConfetti}
          />
        </div>

        {/* Next Card Arrow */}
        <button
          onClick={goToNext}
          className="absolute right-3 sm:right-10 z-30 p-3 sm:p-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Card Information Strip */}
      <div className="w-full flex flex-col items-center pb-6 sm:pb-8 px-4 z-30 text-center">
        <RarityBadge card={currentCard} className="mb-2 text-xs py-0.5 px-3" />
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          {currentCard.name}
        </h2>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400 mt-1">
          <span>{ui.cardNum(currentCard.localId)}</span>
          {hp && (
            <>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{hp} HP</span>
            </>
          )}
          {illustrator && (
            <>
              <span>•</span>
              <span>Ill: {illustrator}</span>
            </>
          )}
        </div>

        {/* Keyboard / Swipe Helper Hint */}
        <p className="text-[11px] text-slate-500 mt-2.5">
          <span className="hidden sm:inline">{ui.keyboardHint} • </span>
          <span>{ui.celebrate} 🎉</span>
        </p>
      </div>
    </div>
  );
};
