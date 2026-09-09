'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { HitCard } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface HoloCardProps {
  card: HitCard;
  onClick?: () => void;
  priority?: boolean;
  isStage?: boolean; // When in fullscreen spotlight stage
}

export const HoloCard: React.FC<HoloCardProps> = ({
  card,
  onClick,
  priority = false,
  isStage = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Pointer Interaction (Mouse or Touch)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const px = (x - width / 2) / (width / 2);
    const py = (y - height / 2) / (height / 2);

    const maxRotation = isStage ? 18 : 12;
    const rX = -py * maxRotation;
    const rY = px * maxRotation;

    const glareX = (x / width) * 100;
    const glareY = (y / height) * 100;

    setIsInteracting(true);
    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) scale3d(${isStage ? 1.04 : 1.02}, ${isStage ? 1.04 : 1.02}, ${isStage ? 1.04 : 1.02})`,
      transition: 'transform 0.08s ease-out',
    });

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 70%)`,
      opacity: 1,
    });
  }, [isStage]);

  const handlePointerLeave = useCallback(() => {
    setIsInteracting(false);
    setTransformStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.5s ease-out',
    });
  }, []);

  // Gyroscope / Device orientation support for mobile devices
  useEffect(() => {
    if (!isStage) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const gamma = Math.min(Math.max(e.gamma, -30), 30);
      const beta = Math.min(Math.max(e.beta - 45, -30), 30);

      const rY = (gamma / 30) * 16;
      const rX = -(beta / 30) * 16;

      const glareX = 50 + (gamma / 30) * 40;
      const glareY = 50 + (beta / 30) * 40;

      setIsInteracting(true);
      setTransformStyle({
        transform: `perspective(1000px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`,
      });
      setGlareStyle({
        background: `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 70%)`,
        opacity: 0.85,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isStage]);

  const cardImg = imageError || !card.image ? null : card.image;

  return (
    <div className="card-perspective-container group select-none">
      <div
        ref={cardRef}
        onClick={onClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={transformStyle}
        className={`holo-card cursor-pointer ${!isInteracting ? 'is-idle' : 'is-active'} ${
          isStage ? 'w-[310px] sm:w-[380px] md:w-[440px]' : 'w-full'
        }`}
      >
        {/* Skeleton / Placeholder while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-0">
            <Sparkles className="w-8 h-8 text-amber-400/40 animate-spin-slow" />
          </div>
        )}

        {/* Card Artwork */}
        {cardImg ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                if (el && el.complete && el.naturalWidth > 0 && !imageLoaded) {
                  setImageLoaded(true);
                }
              }}
              src={cardImg}
              alt={card.name}
              loading={priority || isStage ? 'eager' : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 relative z-10 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-br from-slate-800 to-slate-950 text-center relative z-10">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">{card.hitTierLabel}</span>
            <div className="my-auto">
              <p className="text-lg font-bold text-white leading-snug">{card.name}</p>
              <p className="text-sm text-slate-400 mt-1">#{card.localId}</p>
            </div>
            <span className="text-[11px] text-slate-500">Hit Card</span>
          </div>
        )}

        {/* 1. Continuous Idle Diagonal Sheen (Beam of Light) */}
        <div className="card-idle-sheen z-20" />

        {/* 2. Prismatic Holographic Diffraction Rainbow Shimmer */}
        <div className="card-idle-holo z-20" />

        {/* 3. Interactive Cursor / Touch Glare */}
        <div className="card-glare z-20" style={glareStyle} />

        {/* Card Border Sheen Highlight */}
        <div className="absolute inset-0 rounded-[16px] pointer-events-none border border-white/10 group-hover:border-white/25 transition-colors duration-300 z-30" />
      </div>
    </div>
  );
};
