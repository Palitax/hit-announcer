import React from 'react';
import { HitCard } from '@/lib/types';
import { Sparkles, Crown, Star, Flame } from 'lucide-react';

interface RarityBadgeProps {
  card: HitCard;
  className?: string;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ card, className = '' }) => {
  const getIcon = () => {
    switch (card.hitTier) {
      case 'gold':
        return <Crown className="w-3 h-3 text-amber-900 fill-amber-900" />;
      case 'sar':
      case 'sir':
        return <Sparkles className="w-3 h-3 text-white" />;
      case 'ir':
      case 'ar':
        return <Star className="w-3 h-3 text-teal-950 fill-teal-950" />;
      default:
        return <Flame className="w-3 h-3 text-white" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm bg-gradient-to-r ${card.hitTierBadgeColor} ${className}`}
    >
      {getIcon()}
      <span>{card.hitTierLabel}</span>
    </span>
  );
};
