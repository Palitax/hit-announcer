'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { HitCard } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface HoloCardProps {
  card: HitCard;
  onClick?: () => void;
  priority?: boolean;
  isStage?: boolean;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  card,
  onClick,
  priority = false,
  isStage = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const isHovered = useRef(false);

  // Pointer Interaction (Static flat outer container handles events, avoiding cursor flicker)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' && !isStage) return;
    if (!containerRef.current || !cardElementRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const px = (x - width / 2) / (width / 2);
    const py = (y - height / 2) / (height / 2);

    const maxRotation = isStage ? 16 : 10;
    const rX = -py * maxRotation;
    const rY = px * maxRotation;

    const glareX = (x / width) * 100;
    const glareY = (y / height) * 100;

    const el = cardElementRef.current;
    el.style.setProperty('--rx', `${rX.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${rY.toFixed(2)}deg`);
    el.style.setProperty('--scale', isStage ? '1.03' : '1.025');
    el.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
    el.style.setProperty('--glare-opacity', '1');
    isHovered.current = true;
  }, [isStage]);

  const handlePointerLeave = useCallback(() => {
    isHovered.current = false;
    if (!cardElementRef.current) return;
    const el = cardElementRef.current;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--scale', '1');
    el.style.setProperty('--glare-opacity', '0');
  }, []);

  // Gyroscope / Device orientation support on mobile (Stage Mode only)
  useEffect(() => {
    if (!isStage) return;

    let rafId: number;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null || !cardElementRef.current || isHovered.current) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const gamma = Math.min(Math.max(e.gamma || 0, -30), 30);
        const beta = Math.min(Math.max((e.beta || 0) - 45, -30), 30);

        const rY = (gamma / 30) * 14;
        const rX = -(beta / 30) * 14;

        const glareX = 50 + (gamma / 30) * 40;
        const glareY = 50 + (beta / 30) * 40;

        const el = cardElementRef.current;
        if (!el) return;
        el.style.setProperty('--rx', `${rX.toFixed(2)}deg`);
        el.style.setProperty('--ry', `${rY.toFixed(2)}deg`);
        el.style.setProperty('--scale', '1.02');
        el.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
        el.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
        el.style.setProperty('--glare-opacity', '0.8');
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isStage]);

  const cardImg = imgError || !card?.image ? null : card.image;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onPointerDown={(e) => {
        if (isStage) {
          isHovered.current = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => {
        if (isStage) {
          try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          } catch {}
          handlePointerLeave();
        }
      }}
      onPointerCancel={(e) => {
        if (isStage) {
          try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          } catch {}
          handlePointerLeave();
        }
      }}
      onPointerLeave={handlePointerLeave}
      className={`card-perspective-container select-none ${
        isStage ? 'w-[300px] sm:w-[380px] md:w-[440px] touch-none' : 'w-full'
      }`}
    >
      <div
        ref={cardElementRef}
        className="holo-card w-full h-full"
      >
        {/* Skeleton placeholder */}
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-0 pointer-events-none">
          <Sparkles className="w-7 h-7 text-amber-400/30 animate-spin-slow" />
        </div>

        {/* Card Artwork */}
        {cardImg ? (
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImg}
              alt={card.name || 'Pokemon Card'}
              loading={priority || isStage ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => {
                // Try fallback from high to low if available
                if (cardImg.includes('/high.webp')) {
                  card.image = cardImg.replace('/high.webp', '/low.webp');
                  setImgError(false);
                } else {
                  setImgError(true);
                }
              }}
              className="w-full h-full object-cover select-none pointer-events-none relative z-10"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-br from-slate-800 to-slate-950 text-center relative z-10 pointer-events-none">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">{card.hitTierLabel}</span>
            <div className="my-auto">
              <p className="text-base sm:text-lg font-bold text-white leading-snug">{card.name}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">#{card.localId}</p>
            </div>
            <span className="text-[11px] text-slate-500">Hit Card</span>
          </div>
        )}

        {/* 1. Continuous Idle Diagonal Sheen (Beam of Light) */}
        <div className="card-idle-sheen z-20 pointer-events-none" />

        {/* 2. Prismatic Holographic Diffraction Rainbow Shimmer */}
        <div className="card-idle-holo z-20 pointer-events-none" />

        {/* 3. Interactive Cursor / Touch Glare */}
        <div className="card-glare z-20 pointer-events-none" />

        {/* Card Border Highlight */}
        <div className="absolute inset-0 rounded-[16px] pointer-events-none border border-white/10 group-hover:border-white/25 transition-colors duration-300 z-30" />
      </div>
    </div>
  );
};

