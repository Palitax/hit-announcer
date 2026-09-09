export type Language = 'en' | 'de' | 'ja' | 'zh-tw' | 'ko';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface SetCardCount {
  official: number;
  total: number;
  holo?: number;
  normal?: number;
  reverse?: number;
  firstEd?: number;
}

export interface PokemonSetSummary {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount: SetCardCount;
  releaseDate?: string;
  serie?: {
    id: string;
    name: string;
  };
}

export interface PokemonCardRaw {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  category?: string;
  illustrator?: string;
  types?: string[];
  hp?: number;
}

export type HitCategory = 'all' | 'sir-sar' | 'ir-ar' | 'gold' | 'ultra';

export interface HitCard extends PokemonCardRaw {
  hitTier: 'gold' | 'sar' | 'sir' | 'ar' | 'ir' | 'ultra' | 'secret' | 'holo';
  hitTierLabel: string;
  hitTierBadgeColor: string;
  isSecret: boolean;
  score: number;
}

export type SortOption = 'hits' | 'number-asc' | 'number-desc' | 'name';
